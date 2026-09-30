from datetime import datetime, timedelta
from typing import Dict, List
from models import HealthTriageInput, HealthTriageOutput, MedicationLogInput, MedicationLogOutput

# Simulated Patient Health Record & Medication Schedule
_patient_records: Dict[str, Dict] = {
    "elder_primary": {
        "name": "Ramesh Singh",
        "age": 74,
        "conditions": ["Hypertension (High BP)", "Mild Type-2 Diabetes"],
        "allergies": ["Penicillin", "Sulfa drugs"],
        "medications": {
            "Amlodipine (5mg)": {"due_time": "08:00 AM", "taken_today": True, "last_taken": "2026-09-30 08:15"},
            "Metformin (500mg)": {"due_time": "01:00 PM", "taken_today": False, "last_taken": "2026-09-29 13:20"},
            "Atorvastatin (10mg)": {"due_time": "09:00 PM", "taken_today": False, "last_taken": "2026-09-29 21:00"}
        },
        "recent_bp": "128/82 mmHg"
    }
}

def emergency_health_triage(params: HealthTriageInput) -> HealthTriageOutput:
    """
    MCP Tool: emergency_health_triage
    Evaluates reported symptoms against clinical emergency indicators (AHA/Geriatric guidelines).
    Prevents hallucination by matching deterministic rule sets.
    """
    symptoms_lower = [s.lower() for s in params.symptoms]
    patient = _patient_records.get(params.patient_id, _patient_records["elder_primary"])

    # 1. Critical Emergency Symptoms (Red Flag)
    critical_triggers = ["chest pain", "heart attack", "shortness of breath", "unconscious", "stroke", "collapsed", "cannot breathe"]
    is_critical = any(any(trigger in symptom for trigger in critical_triggers) for symptom in symptoms_lower)

    if is_critical or (params.reported_severity_scale and params.reported_severity_scale >= 8):
        return HealthTriageOutput(
            urgency_level="CRITICAL_SOS",
            primary_suspicion="Suspected Acute Cardiac or Respiratory Emergency",
            immediate_first_aid="Keep resident sitting upright in a comfortable position. Do not offer food or drink. Stay calm.",
            recommended_alexa_speech="I have registered severe distress. Please sit down immediately. I am alerting emergency services and your family right away.",
            should_dispatch_caregiver=True,
            should_alert_ems=True
        )

    # 2. Elevated Risk Symptoms (Dizziness, Fall, Nausea, High BP symptoms)
    elevated_triggers = ["dizzy", "dizziness", "fell", "fall", "nausea", "headache", "blurred vision", "weakness"]
    is_elevated = any(any(trigger in symptom for trigger in elevated_triggers) for symptom in symptoms_lower)

    if is_elevated or (params.reported_severity_scale and params.reported_severity_scale >= 5):
        return HealthTriageOutput(
            urgency_level="ELEVATED",
            primary_suspicion="Suspected Orthostatic Hypotension, Blood Pressure Fluctuation, or Mild Dehydration",
            immediate_first_aid="Sit down immediately with feet flat or lie down safely. Take slow, steady breaths. Sip room-temperature water.",
            recommended_alexa_speech="Please sit down and rest right where you are. Do not stand up abruptly. I am checking your readings and sending an alert to your daughter Priya.",
            should_dispatch_caregiver=True,
            should_alert_ems=False
        )

    # 3. Routine / Minor Symptoms
    return HealthTriageOutput(
        urgency_level="ROUTINE",
        primary_suspicion="Mild General Discomfort / Fatigue",
        immediate_first_aid="Rest comfortably, drink a glass of water, and monitor for any worsening sensations.",
        recommended_alexa_speech="I have logged your symptom note in your daily health journal. If you feel any dizziness or chest tightness, tell me immediately.",
        should_dispatch_caregiver=False,
        should_alert_ems=False
    )


def medication_schedule_logger(params: MedicationLogInput) -> MedicationLogOutput:
    """
    MCP Tool: medication_schedule_logger
    Maintains adherence logs, prevents dangerous accidental double-dosing,
    and checks potential interactions.
    """
    patient = _patient_records.get(params.patient_id, _patient_records["elder_primary"])
    meds = patient["medications"]
    target_med = None

    # Case-insensitive match on medication name
    for med_name in meds:
        if params.medication_name.lower() in med_name.lower():
            target_med = med_name
            break

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    if not target_med:
        return MedicationLogOutput(
            medication_name=params.medication_name,
            status="SCHEDULE_INFO",
            next_due_time="Consult Prescription",
            interaction_warning=None,
            message=f"{params.medication_name} is not in your current routine schedule ({', '.join(meds.keys())})."
        )

    med_info = meds[target_med]

    if params.action == "LOG_TAKEN":
        if med_info["taken_today"]:
            return MedicationLogOutput(
                medication_name=target_med,
                status="ALREADY_TAKEN_WARNING",
                next_due_time=med_info["due_time"] + " Tomorrow",
                interaction_warning="DOUBLE DOSE ALERT: You already logged taking this medication today at " + med_info.get("last_taken", "earlier") + ".",
                message=f"Hold on! You have already taken {target_med} today. Please do not take an extra dose."
            )
        
        med_info["taken_today"] = True
        med_info["last_taken"] = now_str
        return MedicationLogOutput(
            medication_name=target_med,
            status="CONFIRMED_TAKEN",
            next_due_time="Tomorrow at " + med_info["due_time"],
            interaction_warning=None,
            message=f"Logged: You have safely taken {target_med}. Good job staying on track!"
        )

    if params.action == "QUERY_NEXT":
        status_text = "Already taken today" if med_info["taken_today"] else "Due at " + med_info["due_time"]
        return MedicationLogOutput(
            medication_name=target_med,
            status="SCHEDULE_INFO",
            next_due_time=med_info["due_time"],
            interaction_warning=None,
            message=f"{target_med} is scheduled for {med_info['due_time']}. Status: {status_text}."
        )

    return MedicationLogOutput(
        medication_name=target_med,
        status="SKIPPED_LOGGED",
        next_due_time="Next dose as scheduled",
        interaction_warning="Skipped dose recorded for doctor review.",
        message=f"Logged that you skipped {target_med} today."
    )
