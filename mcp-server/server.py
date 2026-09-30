import asyncio
import json
import uuid
from typing import Any, Dict, List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from config import settings
from models import (
    AgentChatRequest,
    MCPRequest,
    MCPResponse,
    MCPToolDefinition,
    VisitorIntentInput,
    SmartLockInput,
    HealthTriageInput,
    CaregiverDispatchInput,
    MedicationLogInput
)
from tools.visitor_tools import analyze_visitor_intent
from tools.security_tools import control_smart_lock, get_current_lock_state
from tools.health_tools import emergency_health_triage, medication_schedule_logger
from tools.dispatch_tools import caregiver_dispatcher, get_dispatch_history
from agent.orchestrator import AlexaAgentOrchestrator

app = FastAPI(
    title="CareSentinel+ MCP Server",
    version="1.0.0",
    description="Official Model Context Protocol (Streamable HTTP 2025-11-25+) Server for Alexa+, Ring & AWS"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AlexaAgentOrchestrator()

# In-memory execution log for the real-time UI Inspector
_execution_events: List[Dict[str, Any]] = []

def record_event(tool_name: str, params: Any, result: Any, trigger_source: str = "Alexa+ Agent"):
    event = {
        "event_id": f"evt_{uuid.uuid4().hex[:8]}",
        "timestamp": asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0,
        "tool": tool_name,
        "params": params if isinstance(params, dict) else (params.model_dump() if hasattr(params, "model_dump") else str(params)),
        "result": result if isinstance(result, dict) else (result.model_dump() if hasattr(result, "model_dump") else str(result)),
        "source": trigger_source
    }
    _execution_events.insert(0, event)
    # Keep latest 50 events
    if len(_execution_events) > 50:
        _execution_events.pop()
    return event

# -------------------------------------------------------------
# 1. Official MCP Tools Registry (Spec: 2025-11-25+)
# -------------------------------------------------------------
MCP_TOOLS: List[MCPToolDefinition] = [
    MCPToolDefinition(
        name="analyze_visitor_intent",
        description="Analyzes Ring camera motion, proximity, and object detections to classify visitor intent and threat level.",
        inputSchema=VisitorIntentInput.model_json_schema()
    ),
    MCPToolDefinition(
        name="control_smart_lock",
        description="Controls or inspects the front door smart deadbolt (LOCK, UNLOCK, CHECK_STATE).",
        inputSchema=SmartLockInput.model_json_schema()
    ),
    MCPToolDefinition(
        name="emergency_health_triage",
        description="Evaluates spoken or observed resident symptoms against clinical emergency indicators to determine urgent triage actions.",
        inputSchema=HealthTriageInput.model_json_schema()
    ),
    MCPToolDefinition(
        name="caregiver_dispatcher",
        description="Dispatches emergency SMS, push notifications, or calls to family and first responders via AWS SNS.",
        inputSchema=CaregiverDispatchInput.model_json_schema()
    ),
    MCPToolDefinition(
        name="medication_schedule_logger",
        description="Logs medication adherence, prevents accidental duplicate doses, and provides schedule guidance.",
        inputSchema=MedicationLogInput.model_json_schema()
    )
]

# -------------------------------------------------------------
# 2. MCP Streamable HTTP / SSE Protocol Endpoints
# -------------------------------------------------------------
@app.get("/mcp/sse")
async def mcp_sse_stream(request: Request):
    """
    Streamable HTTP SSE transport conforming to MCP 2025-11-25+ specification.
    Streams server-sent tool execution events and heartbeats to clients.
    """
    async def event_generator():
        yield f"event: endpoint\ndata: /mcp/messages\n\n"
        while True:
            if await request.is_disconnected():
                break
            # Send periodic heartbeat
            yield f": ping\n\n"
            await asyncio.sleep(15)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/mcp/messages")
async def mcp_messages_handler(req: MCPRequest):
    """
    JSON-RPC 2.0 message handler for standard MCP clients (Alexa+, Claude, etc.)
    """
    method = req.method
    params = req.params or {}

    if method == "tools/list":
        return MCPResponse(
            id=req.id,
            result={"tools": [t.model_dump() for t in MCP_TOOLS]}
        )

    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})

        if tool_name == "analyze_visitor_intent":
            res = analyze_visitor_intent(VisitorIntentInput(**arguments))
            record_event(tool_name, arguments, res)
            return MCPResponse(id=req.id, result={"content": [{"type": "text", "text": json.dumps(res.model_dump())}]})

        elif tool_name == "control_smart_lock":
            res = control_smart_lock(SmartLockInput(**arguments))
            record_event(tool_name, arguments, res)
            return MCPResponse(id=req.id, result={"content": [{"type": "text", "text": json.dumps(res.model_dump())}]})

        elif tool_name == "emergency_health_triage":
            res = emergency_health_triage(HealthTriageInput(**arguments))
            record_event(tool_name, arguments, res)
            return MCPResponse(id=req.id, result={"content": [{"type": "text", "text": json.dumps(res.model_dump())}]})

        elif tool_name == "caregiver_dispatcher":
            res = caregiver_dispatcher(CaregiverDispatchInput(**arguments))
            record_event(tool_name, arguments, res)
            return MCPResponse(id=req.id, result={"content": [{"type": "text", "text": json.dumps(res.model_dump())}]})

        elif tool_name == "medication_schedule_logger":
            res = medication_schedule_logger(MedicationLogInput(**arguments))
            record_event(tool_name, arguments, res)
            return MCPResponse(id=req.id, result={"content": [{"type": "text", "text": json.dumps(res.model_dump())}]})

        return MCPResponse(
            id=req.id,
            error={"code": -32601, "message": f"Method or tool '{tool_name}' not found"}
        )

    return MCPResponse(
        id=req.id,
        error={"code": -32601, "message": f"Unsupported MCP method: {method}"}
    )

# -------------------------------------------------------------
# 3. Echo Show 15 & Voice Interaction Endpoints
# -------------------------------------------------------------
@app.post("/api/chat")
async def chat_endpoint(req: AgentChatRequest):
    """
    Main conversational endpoint:
    Processes resident voice inputs, invokes MCP tools autonomously,
    and returns Alexa's natural speech and UI card data.
    """
    result = orchestrator.process_message(req.message, req.context)
    # Record any tools that were executed
    for tool_call in result.get("tools_called", []):
        record_event(tool_call["tool"], tool_call.get("params", {}), tool_call["result"])
    return result


@app.post("/api/ring/trigger")
async def ring_scenario_trigger(payload: Dict[str, str]):
    """
    Triggers simulated Ring IoT events (Night delivery, Unknown loiterer, Fall distress).
    """
    scenario_id = payload.get("scenario_id", "late_night_delivery")
    result = orchestrator.process_ring_scenario(scenario_id)
    for tool_call in result.get("tools_called", []):
        record_event(tool_call["tool"], {}, tool_call["result"], trigger_source="Ring Doorbell Sensor")
    return result


@app.get("/api/events")
async def get_recent_events():
    """
    Provides real-time event telemetry to the Echo Show Inspector UI.
    """
    return {"events": _execution_events}


@app.get("/api/tools")
async def get_available_tools():
    """
    Returns registered MCP tools with JSON schemas.
    """
    return {"tools": [t.model_dump() for t in MCP_TOOLS]}


@app.get("/api/status")
async def get_system_status():
    """
    System health, lock state, caregiver contacts, and AWS config.
    """
    return {
        "status": "ONLINE",
        "mcp_spec": "2025-11-25 (Streamable HTTP)",
        "front_door_lock": get_current_lock_state("front_door"),
        "caregiver": {
            "name": settings.CAREGIVER_NAME,
            "phone": settings.CAREGIVER_PHONE,
            "email": settings.CAREGIVER_EMAIL
        },
        "aws_builder_status": {
            "configured": settings.has_aws_credentials,
            "region": settings.AWS_REGION,
            "bedrock_model": settings.AWS_BEDROCK_MODEL_ID,
            "mode": "AWS_CLOUD_LIVE" if settings.has_aws_credentials else "ZERO_COST_HIGH_FIDELITY_FALLBACK"
        },
        "dispatches_sent": len(get_dispatch_history())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
