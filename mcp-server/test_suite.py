import json
from models import (
    VisitorIntentInput,
    SmartLockInput,
    HealthTriageInput,
    CaregiverDispatchInput,
    MedicationLogInput
)
from tools.visitor_tools import analyze_visitor_intent
from tools.security_tools import control_smart_lock
from tools.health_tools import emergency_health_triage, medication_schedule_logger
from tools.dispatch_tools import caregiver_dispatcher
from agent.orchestrator import AlexaAgentOrchestrator

def test_visitor_intent_tool():
    print("\n--- Testing 1: analyze_visitor_intent ---")
    # Night delivery test
    res = analyze_visitor_intent(VisitorIntentInput(
        event_type="motion_detected",
        timestamp="23:30:00",
        proximity="NEAR",
        detected_objects=["person", "box"],
        package_present=True
    ))
    assert res.intent == "PACKAGE_DELIVERY"
    assert res.risk_level in ["LOW", "MEDIUM"]
    print(f" [PASS] Package delivery detected with confidence {res.confidence}: {res.recommended_action}")

    # Suspicious loiterer test
    res2 = analyze_visitor_intent(VisitorIntentInput(
        event_type="motion_detected",
        timestamp="02:15:00",
        proximity="NEAR",
        detected_objects=["person"],
        package_present=False
    ))
    assert res2.intent == "POTENTIAL_RISK"
    assert res2.risk_level == "HIGH"
    print(f" [PASS] High-risk loiterer detected at 02:15: {res2.recommended_action}")


def test_smart_lock_tool():
    print("\n--- Testing 2: control_smart_lock ---")
    # Lock test
    res_lock = control_smart_lock(SmartLockInput(door_id="front_door", action="LOCK"))
    assert res_lock.status == "LOCKED"
    assert res_lock.success is True
    print(f" [PASS] Lock engaged: {res_lock.message}")

    # Check status test
    res_status = control_smart_lock(SmartLockInput(door_id="front_door", action="CHECK_STATE"))
    assert res_status.status == "LOCKED"
    print(f" [PASS] Status verified: {res_status.message}")


def test_health_triage_tool():
    print("\n--- Testing 3: emergency_health_triage ---")
    # Dizziness elevated test
    res_dizzy = emergency_health_triage(HealthTriageInput(symptoms=["dizziness", "feeling faint"]))
    assert res_dizzy.urgency_level == "ELEVATED"
    assert res_dizzy.should_dispatch_caregiver is True
    print(f" [PASS] Elevated triage for dizziness: {res_dizzy.recommended_alexa_speech}")

    # Chest pain critical SOS test
    res_critical = emergency_health_triage(HealthTriageInput(symptoms=["severe chest pain", "sweating"]))
    assert res_critical.urgency_level == "CRITICAL_SOS"
    assert res_critical.should_alert_ems is True
    print(f" [PASS] Critical SOS triage: {res_critical.recommended_alexa_speech}")


def test_medication_tool():
    print("\n--- Testing 4: medication_schedule_logger ---")
    # Query next test
    res_query = medication_schedule_logger(MedicationLogInput(medication_name="Amlodipine", action="QUERY_NEXT"))
    print(f" [PASS] Query next medication: {res_query.message}")

    # Prevent accidental double dose test
    res_double = medication_schedule_logger(MedicationLogInput(medication_name="Amlodipine", action="LOG_TAKEN"))
    assert res_double.status == "ALREADY_TAKEN_WARNING"
    print(f" [PASS] Double-dose prevention triggered: {res_double.interaction_warning}")


def test_caregiver_dispatch_tool():
    print("\n--- Testing 5: caregiver_dispatcher ---")
    res_dispatch = caregiver_dispatcher(CaregiverDispatchInput(
        alert_level="CRITICAL_SOS",
        message="Test Emergency Alert",
        patient_status="Testing triage"
    ))
    assert res_dispatch.dispatch_id.startswith("disp_")
    assert len(res_dispatch.recipients_notified) >= 2
    print(f" [PASS] Caregiver dispatch generated id {res_dispatch.dispatch_id} via {res_dispatch.channels_used}")


def test_orchestrator():
    print("\n--- Testing 6: AlexaAgentOrchestrator End-to-End ---")
    orch = AlexaAgentOrchestrator()

    # Voice test 1: Door lock
    resp1 = orch.process_message("Alexa, please lock the front door")
    assert "locked" in resp1["speech"].lower()
    assert any(t["tool"] == "control_smart_lock" for t in resp1["tools_called"])
    print(f" [PASS] Voice lock: Alexa replied: '{resp1['speech']}'")

    # Voice test 2: Medical distress
    resp2 = orch.process_message("Alexa, I am feeling very dizzy")
    assert any(t["tool"] == "emergency_health_triage" for t in resp2["tools_called"])
    assert any(t["tool"] == "caregiver_dispatcher" for t in resp2["tools_called"])
    print(f" [PASS] Voice medical: Alexa replied: '{resp2['speech']}'")

    # Ring scenario test
    scenario_res = orch.process_ring_scenario("late_night_delivery")
    assert scenario_res["door_status"] == "LOCKED"
    assert len(scenario_res["tools_called"]) == 3
    print(f" [PASS] Ring scenario 'late_night_delivery' executed 3 tools: {scenario_res['alexa_speech']}")

if __name__ == "__main__":
    print("==================================================")
    print(" Running CareSentinel+ MCP Server Automated Tests")
    print("==================================================")
    test_visitor_intent_tool()
    test_smart_lock_tool()
    test_health_triage_tool()
    test_medication_tool()
    test_caregiver_dispatch_tool()
    test_orchestrator()
    print("\n==================================================")
    print(" ALL 6 MCP AND ORCHESTRATION TESTS PASSED! (100%)")
    print("==================================================")
