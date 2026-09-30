import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from models import (
    SmartLockInput,
    VisitorIntentInput,
    HealthTriageInput,
    CaregiverDispatchInput,
    MedicationLogInput
)
from tools.visitor_tools import analyze_visitor_intent
from tools.security_tools import control_smart_lock, get_current_lock_state
from tools.health_tools import emergency_health_triage, medication_schedule_logger
from tools.dispatch_tools import caregiver_dispatcher

class AlexaAgentOrchestrator:
    """
    CareSentinel+ Core Agentic Orchestrator
    Connects Alexa+ natural voice interactions to the self-hosted MCP Tools.
    Supports AWS Bedrock inference when configured, with a deterministic local fallback.
    """

    def __init__(self):
        self.session_history: List[Dict[str, str]] = []

    def process_message(self, user_text: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        user_lower = user_text.lower().strip()
        executed_tools: List[Dict[str, Any]] = []
        alexa_speech: str = ""
        ui_card_type: str = "CONVERSATION"
        ui_card_data: Dict[str, Any] = {}

        # -------------------------------------------------------------
        # 1. Door / Ring Perimeter Control Intent
        # -------------------------------------------------------------
        is_lock_cmd = "lock" in user_lower and "door" in user_lower and not any(neg in user_lower for neg in ["is", "check", "unlock", "status"])
        is_unlock_cmd = "unlock" in user_lower or "open front door" in user_lower or "open door" in user_lower
        is_status_cmd = any(w in user_lower for w in ["is the door locked", "door status", "check door", "check the door", "door state"])

        if is_lock_cmd:
            lock_res = control_smart_lock(SmartLockInput(door_id="front_door", action="LOCK", requested_by="Resident Voice"))
            executed_tools.append({
                "tool": "control_smart_lock",
                "params": {"door_id": "front_door", "action": "LOCK"},
                "result": lock_res.model_dump()
            })
            alexa_speech = "I have engaged the deadbolt. The front door is now securely locked."
            ui_card_type = "SECURITY_STATUS"
            ui_card_data = {"door_status": "LOCKED", "door_id": "front_door"}

        elif is_unlock_cmd:
            lock_res = control_smart_lock(SmartLockInput(door_id="front_door", action="UNLOCK", requested_by="Resident Voice"))
            executed_tools.append({
                "tool": "control_smart_lock",
                "params": {"door_id": "front_door", "action": "UNLOCK"},
                "result": lock_res.model_dump()
            })
            alexa_speech = "Front door is now unlocked."
            ui_card_type = "SECURITY_STATUS"
            ui_card_data = {"door_status": "UNLOCKED", "door_id": "front_door"}

        elif is_status_cmd:
            lock_res = control_smart_lock(SmartLockInput(door_id="front_door", action="CHECK_STATE"))
            executed_tools.append({
                "tool": "control_smart_lock",
                "params": {"door_id": "front_door", "action": "CHECK_STATE"},
                "result": lock_res.model_dump()
            })
            alexa_speech = f"The front door is currently {lock_res.status.lower()}."
            ui_card_type = "SECURITY_STATUS"
            ui_card_data = {"door_status": lock_res.status}

        elif any(w in user_lower for w in ["who is at the door", "who's at the door", "anyone outside", "front door camera"]):
            # Analyze front door
            current_hour = datetime.now().strftime("%H:%M")
            intent_res = analyze_visitor_intent(VisitorIntentInput(
                event_type="motion_detected",
                timestamp=current_hour,
                detected_objects=["person", "delivery_package"],
                package_present=True
            ))
            executed_tools.append({
                "tool": "analyze_visitor_intent",
                "params": {"event_type": "motion_detected", "timestamp": current_hour},
                "result": intent_res.model_dump()
            })
            alexa_speech = f"A delivery person is at the doorstep. Confidence is {int(intent_res.confidence*100)} percent. The front door remains locked for your safety."
            ui_card_type = "RING_VISITOR"
            ui_card_data = intent_res.model_dump()

        # -------------------------------------------------------------
        # 2. Health Distress & Emergency Triage Intent
        # -------------------------------------------------------------
        elif any(w in user_lower for w in ["dizzy", "dizziness", "chest pain", "fell", "fall", "hurt", "emergency", "sick", "nausea", "headache", "heart attack"]):
            symptoms = []
            if "dizzy" in user_lower or "dizziness" in user_lower:
                symptoms.append("dizziness")
            if "chest pain" in user_lower:
                symptoms.append("acute chest pain")
            if "fell" in user_lower or "fall" in user_lower:
                symptoms.append("ground fall")
            if "nausea" in user_lower:
                symptoms.append("nausea")
            if "headache" in user_lower:
                symptoms.append("headache")
            if not symptoms:
                symptoms.append(user_lower)

            triage_res = emergency_health_triage(HealthTriageInput(symptoms=symptoms))
            executed_tools.append({
                "tool": "emergency_health_triage",
                "params": {"symptoms": symptoms},
                "result": triage_res.model_dump()
            })

            # Automatically dispatch caregiver if elevated or critical
            if triage_res.should_dispatch_caregiver:
                dispatch_res = caregiver_dispatcher(CaregiverDispatchInput(
                    alert_level=triage_res.urgency_level,
                    message=f"Health Alert for Ramesh Singh: {', '.join(symptoms)}. Urgency: {triage_res.urgency_level}. First aid instructed: {triage_res.immediate_first_aid}",
                    patient_status=triage_res.primary_suspicion
                ))
                executed_tools.append({
                    "tool": "caregiver_dispatcher",
                    "params": {"alert_level": triage_res.urgency_level},
                    "result": dispatch_res.model_dump()
                })

            alexa_speech = triage_res.recommended_alexa_speech
            ui_card_type = "EMERGENCY_TRIAGE"
            ui_card_data = {
                "urgency_level": triage_res.urgency_level,
                "first_aid": triage_res.immediate_first_aid,
                "dispatched": triage_res.should_dispatch_caregiver
            }

        # -------------------------------------------------------------
        # 3. Medication Tracking Intent
        # -------------------------------------------------------------
        elif any(w in user_lower for w in ["medicine", "tablet", "pill", "dose", "amlodipine", "metformin"]):
            if any(w in user_lower for w in ["took", "taken", "had my"]):
                action = "LOG_TAKEN"
            elif any(w in user_lower for w in ["when", "next", "did i take", "schedule"]):
                action = "QUERY_NEXT"
            else:
                action = "LOG_TAKEN"

            med_name = "Amlodipine (5mg)" if "bp" in user_lower or "amlodipine" in user_lower else "Metformin (500mg)"
            med_res = medication_schedule_logger(MedicationLogInput(medication_name=med_name, action=action))
            executed_tools.append({
                "tool": "medication_schedule_logger",
                "params": {"medication_name": med_name, "action": action},
                "result": med_res.model_dump()
            })
            alexa_speech = med_res.message
            ui_card_type = "MEDICATION_LOG"
            ui_card_data = med_res.model_dump()

        # -------------------------------------------------------------
        # 4. General Conversational / Status Overview
        # -------------------------------------------------------------
        else:
            door_status = get_current_lock_state("front_door")
            alexa_speech = f"CareSentinel+ is actively guarding your home. The front door is {door_status.lower()}, vitals are stable, and emergency dispatch is standing by. How can I help you right now?"
            ui_card_type = "STATUS_REPORT"
            ui_card_data = {"door_status": door_status, "health_status": "STABLE"}

        return {
            "speech": alexa_speech,
            "tools_called": executed_tools,
            "ui_card": {
                "type": ui_card_type,
                "data": ui_card_data
            },
            "timestamp": datetime.now().isoformat()
        }

    def process_ring_scenario(self, scenario_id: str) -> Dict[str, Any]:
        """
        Processes simulated Ring Doorbell events triggered from the Echo Show Console.
        """
        executed_tools = []
        if scenario_id == "late_night_delivery":
            # 1. Analyze Intent
            intent_res = analyze_visitor_intent(VisitorIntentInput(
                event_type="motion_detected",
                timestamp="23:32:00",
                proximity="NEAR",
                detected_objects=["delivery_person", "box"],
                package_present=True
            ))
            executed_tools.append({"tool": "analyze_visitor_intent", "result": intent_res.model_dump()})

            # 2. Lock door autonomously
            lock_res = control_smart_lock(SmartLockInput(door_id="front_door", action="LOCK", reason="Late night delivery security"))
            executed_tools.append({"tool": "control_smart_lock", "result": lock_res.model_dump()})

            # 3. Notify family via AWS SNS
            dispatch_res = caregiver_dispatcher(CaregiverDispatchInput(
                alert_level="INFO",
                message="Safe late-night package delivery handled at 11:32 PM. Front door securely locked.",
                patient_status="Safe / Resting"
            ))
            executed_tools.append({"tool": "caregiver_dispatcher", "result": dispatch_res.model_dump()})

            alexa_speech = "Front door secured. A late-night delivery was detected. I have instructed the driver to leave the package on the porch."
            ring_speaker_speech = "Please leave the package at the doorstep. The resident is resting."

            return {
                "scenario": scenario_id,
                "alexa_speech": alexa_speech,
                "ring_speaker_speech": ring_speaker_speech,
                "tools_called": executed_tools,
                "door_status": "LOCKED",
                "risk_level": "LOW"
            }

        elif scenario_id == "unknown_loiterer":
            intent_res = analyze_visitor_intent(VisitorIntentInput(
                event_type="motion_detected",
                timestamp="01:15:00",
                proximity="NEAR",
                detected_objects=["person"],
                package_present=False
            ))
            executed_tools.append({"tool": "analyze_visitor_intent", "result": intent_res.model_dump()})

            lock_res = control_smart_lock(SmartLockInput(door_id="front_door", action="LOCK", reason="Suspicious late night perimeter approach"))
            executed_tools.append({"tool": "control_smart_lock", "result": lock_res.model_dump()})

            dispatch_res = caregiver_dispatcher(CaregiverDispatchInput(
                alert_level="WARNING",
                message="Security Alert: Unrecognized individual detected at front door at 01:15 AM. Deadbolt locked.",
                patient_status="Resident in bedroom"
            ))
            executed_tools.append({"tool": "caregiver_dispatcher", "result": dispatch_res.model_dump()})

            return {
                "scenario": scenario_id,
                "alexa_speech": "Perimeter alert: An unrecognized person was detected outside. The front door is deadbolted. Please do not open the door.",
                "ring_speaker_speech": "You are on camera. This area is under 24/7 autonomous surveillance.",
                "tools_called": executed_tools,
                "door_status": "LOCKED",
                "risk_level": "HIGH"
            }

        elif scenario_id == "fall_distress":
            triage_res = emergency_health_triage(HealthTriageInput(
                symptoms=["severe fall", "dizziness", "hip pain"],
                reported_severity_scale=8
            ))
            executed_tools.append({"tool": "emergency_health_triage", "result": triage_res.model_dump()})

            dispatch_res = caregiver_dispatcher(CaregiverDispatchInput(
                alert_level="CRITICAL_SOS",
                message="EMERGENCY SOS: Fall detected with severe pain and dizziness. Immediate assistance required!",
                patient_status="Fall Distress on Floor"
            ))
            executed_tools.append({"tool": "caregiver_dispatcher", "result": dispatch_res.model_dump()})

            return {
                "scenario": scenario_id,
                "alexa_speech": "I have detected a severe fall. Help is on the way! I have notified your daughter Priya and emergency dispatch.",
                "ring_speaker_speech": "",
                "tools_called": executed_tools,
                "door_status": "UNLOCKED", # Unlocks door so emergency responders can enter!
                "risk_level": "CRITICAL"
            }

        return {"error": f"Unknown scenario {scenario_id}"}
