from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

# --- MCP JSON-RPC 2.0 Protocol Models (Spec: 2025-11-25+) ---
class MCPRequest(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: Optional[str | int] = None
    method: str
    params: Optional[Dict[str, Any]] = None

class MCPResponse(BaseModel):
    jsonrpc: Literal["2.0"] = "2.0"
    id: Optional[str | int] = None
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None

class MCPToolDefinition(BaseModel):
    name: str
    description: str
    inputSchema: Dict[str, Any]

# --- Tool Input & Output Models ---

# 1. Visitor Intent Analysis
class VisitorIntentInput(BaseModel):
    event_type: str = Field(..., description="Type of Ring event, e.g. motion_detected or ding_pressed")
    timestamp: str = Field(..., description="ISO or human time string, e.g. '23:32:00'")
    proximity: Literal["NEAR", "MEDIUM", "FAR"] = "NEAR"
    detected_objects: List[str] = Field(default_factory=lambda: ["person"], description="Labels detected by vision model")
    package_present: bool = False

class VisitorIntentOutput(BaseModel):
    intent: Literal["PACKAGE_DELIVERY", "KNOWN_FAMILY", "UNRECOGNIZED_STRANGER", "POTENTIAL_RISK", "SERVICE_MAINTENANCE"]
    confidence: float
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    recommended_action: str
    reasoning: str

# 2. Smart Lock Control
class SmartLockInput(BaseModel):
    door_id: str = "front_door"
    action: Literal["LOCK", "UNLOCK", "CHECK_STATE"]
    requested_by: str = "Alexa+ CareSentinel Agent"
    reason: Optional[str] = None

class SmartLockOutput(BaseModel):
    door_id: str
    status: Literal["LOCKED", "UNLOCKED"]
    previous_status: str
    success: bool
    timestamp: str
    message: str

# 3. Emergency Health Triage
class HealthTriageInput(BaseModel):
    patient_id: str = "elder_primary"
    symptoms: List[str] = Field(..., description="Spoken or observed symptoms, e.g. ['dizziness', 'chest pain']")
    current_activity: Optional[str] = "sitting in living room"
    reported_severity_scale: Optional[int] = Field(None, ge=1, le=10, description="Scale 1 to 10 if reported")

class HealthTriageOutput(BaseModel):
    urgency_level: Literal["ROUTINE", "ELEVATED", "CRITICAL_SOS"]
    primary_suspicion: str
    immediate_first_aid: str
    recommended_alexa_speech: str
    should_dispatch_caregiver: bool
    should_alert_ems: bool

# 4. Caregiver Dispatcher
class CaregiverDispatchInput(BaseModel):
    alert_level: Literal["INFO", "WARNING", "ELEVATED", "CRITICAL_SOS"]
    message: str
    patient_status: str
    channel_override: Optional[List[str]] = None

class CaregiverDispatchOutput(BaseModel):
    dispatch_id: str
    alert_level: str
    recipients_notified: List[str]
    channels_used: List[str]
    delivered_at: str
    aws_sns_message_id: Optional[str] = None
    status: Literal["DELIVERED", "QUEUED", "SIMULATED_SUCCESS"]

# 5. Medication Schedule & Adherence
class MedicationLogInput(BaseModel):
    patient_id: str = "elder_primary"
    medication_name: str
    action: Literal["LOG_TAKEN", "SKIP_DOSE", "QUERY_NEXT", "SET_REMINDER"]
    reminder_time: Optional[str] = "08:00 AM"
    timestamp: Optional[str] = None

class MedicationLogOutput(BaseModel):
    medication_name: str
    status: Literal["CONFIRMED_TAKEN", "ALREADY_TAKEN_WARNING", "SKIPPED_LOGGED", "SCHEDULE_INFO", "REMINDER_SET"]
    next_due_time: str
    interaction_warning: Optional[str] = None
    message: str

# --- Natural Conversation Chat Request ---
class AgentChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    voice_enabled: bool = True
