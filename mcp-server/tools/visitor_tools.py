from datetime import datetime
from models import VisitorIntentInput, VisitorIntentOutput

def analyze_visitor_intent(params: VisitorIntentInput) -> VisitorIntentOutput:
    """
    MCP Tool: analyze_visitor_intent
    Evaluates Ring camera motion events, proximity, time of day, and object detections
    to infer intent without exposing vulnerable residents.
    """
    event_type = params.event_type.lower()
    detected = [obj.lower() for obj in params.detected_objects]
    has_package = params.package_present or ("package" in detected) or ("box" in detected)
    
    # Parse timestamp or fallback to current hour
    try:
        # Check if timestamp contains hour e.g. "23:32"
        hour_str = params.timestamp.split(":")[0][-2:]
        hour = int(hour_str)
    except Exception:
        hour = datetime.now().hour

    is_night_time = hour >= 22 or hour < 6

    # 1. Package delivery intent
    if has_package or "delivery" in detected:
        return VisitorIntentOutput(
            intent="PACKAGE_DELIVERY",
            confidence=0.96,
            risk_level="LOW" if not is_night_time else "MEDIUM",
            recommended_action="Keep front door locked. Instruct visitor to leave package at doorstep via Ring speaker.",
            reasoning=f"Detected package carrier/box at door during {'night' if is_night_time else 'day'} hours."
        )

    # 2. Family / Known Face check
    if "family" in detected or "priya" in detected:
        return VisitorIntentOutput(
            intent="KNOWN_FAMILY",
            confidence=0.98,
            risk_level="LOW",
            recommended_action="Greet family member warmly via Alexa+ speaker and confirm door unlock permission.",
            reasoning="Recognized known family member profile."
        )

    # 3. Night-time unknown visitor
    if is_night_time:
        return VisitorIntentOutput(
            intent="POTENTIAL_RISK",
            confidence=0.91,
            risk_level="HIGH",
            recommended_action="Immediately verify deadbolt is locked. Play soft security chime. Do not open door.",
            reasoning=f"Unrecognized individual loitering at the front door during late-night hours ({hour}:00)."
        )

    # 4. Daytime stranger / Doorbell press
    if "ding" in event_type or params.proximity == "NEAR":
        return VisitorIntentOutput(
            intent="UNRECOGNIZED_STRANGER",
            confidence=0.88,
            risk_level="MEDIUM",
            recommended_action="Display Ring live feed on Echo Show screen and ask resident via voice if they expect visitors.",
            reasoning="Visitor approached door and triggered motion/ding sensor during normal hours."
        )

    # Default low risk ambient motion
    return VisitorIntentOutput(
        intent="SERVICE_MAINTENANCE",
        confidence=0.80,
        risk_level="LOW",
        recommended_action="Monitor ambient perimeter. No immediate action required.",
        reasoning="Routine motion detected near the perimeter."
    )
