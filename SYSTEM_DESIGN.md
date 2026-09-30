# CareSentinel+ — System Design & Architecture Specification

> **Event:** Build, Ship, Shape: Amazon Developer Hackathon 2026  
> **Tracks:** Alexa+ (Self-hosted MCP Server, Streamable HTTP 2025-11-25+), Ring API Simulator, AWS Builder  
> **Target Devices:** Amazon Echo Show 15 (Simulated), Ring Video Doorbell & Smart Lock (Simulated)

---

## 1. High-Level System Architecture

CareSentinel+ bridges the front door (Ring), the living room (Alexa+ Smart Display), and the cloud (AWS) through an event-driven, agentic architecture powered by the open **Model Context Protocol (MCP)**.

```mermaid
flowchart TD
    subgraph Client["1. Edge & Display Layer (Simulated Echo Show 15)"]
        UI["Interactive Smart Display UI (Next.js 15 + Tailwind CSS)"]
        STT["Web Speech Recognition (Voice Input)"]
        TTS["Speech Synthesis / Audio Waveform (Alexa Voice)"]
        RingCamUI["Ring Camera View & Door Status Display"]
        InspectorUI["Real-time MCP Tool Call Inspector"]
    end

    subgraph RingSim["2. Ring Ambient Vision & IoT Simulator"]
        RingFeed["Simulated Video Feeds (Day/Night/Alert)"]
        RingSensors["PIR Motion & Doorbell Ding Triggers"]
        DoorLock["Smart Lock Actuator (Locked/Unlocked)"]
    end

    subgraph AgentCore["3. Alexa+ Agent Orchestrator & Memory Core"]
        AgentEngine["Agentic Conversation Manager (Streamable HTTP Client)"]
        ContextStore["Multi-turn Context & Elder Health History"]
        Guardrails["Safety & Zero-Hallucination Guardrails"]
    end

    subgraph MCPServer["4. Self-Hosted MCP Server (Python / Streamable HTTP)"]
        MCPRouter["MCP Protocol Gateway (Spec: 2025-11-25+)"]
        Tool1["tool: analyze_visitor_intent"]
        Tool2["tool: control_smart_lock"]
        Tool3["tool: emergency_health_triage"]
        Tool4["tool: caregiver_dispatcher"]
        Tool5["tool: medication_schedule_logger"]
    end

    subgraph CloudLayer["5. Cloud & AWS Infrastructure (AWS Builder)"]
        Bedrock["AWS Bedrock (Claude 3.5 Sonnet / Llama 3)"]
        SNS["AWS SNS (Emergency SMS / Push Dispatch)"]
        Dynamo["Persistent Health & Event Logs (Local / DynamoDB)"]
    end

    %% Interactions
    STT --> UI
    UI --> TTS
    RingSensors -->|Webhook / Event Ping| AgentEngine
    RingFeed --> RingCamUI
    DoorLock <--> RingCamUI

    UI <-->|SSE / Streamable HTTP| AgentEngine
    AgentEngine --> Bedrock
    AgentEngine <-->|JSON-RPC 2.0 via MCP| MCPRouter

    MCPRouter --> Tool1
    MCPRouter --> Tool2
    MCPRouter --> Tool3
    MCPRouter --> Tool4
    MCPRouter --> Tool5

    Tool1 --> RingSensors
    Tool2 --> DoorLock
    Tool3 --> Guardrails
    Tool4 --> SNS
    Tool5 --> Dynamo

    MCPRouter -.->|Telemetry & Execution Logs| InspectorUI
```

---

## 2. Sequence Diagrams (Core Workflows)

### Scenario A: Proactive Front-Door Guardian (Late Night Delivery Event)
Jab raat ko darwaze par motion detect hota hai, system reactive nahi balki **proactively** act karta hai:

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as External Visitor
    participant Ring as Ring Doorbell Sim
    participant Display as Echo Show Display
    participant Agent as Alexa+ Agent Core
    participant MCP as CareSentinel+ MCP Server
    participant AWS as AWS Cloud (SNS/Bedrock)
    actor Elder as Elder / Caregiver

    Visitor->>Ring: Arrives at door at 11:32 PM
    Ring->>Agent: Event: 'motion_detected' {time: "23:32", zone: "front_door"}
    Agent->>AWS: Invoke Bedrock (Context: Night, Elder sleeping, Front door status)
    AWS-->>Agent: Action: Verify intent & Secure perimeter
    Agent->>MCP: Call 'analyze_visitor_intent' {motion_meta}
    MCP-->>Agent: Result: {intent: "package_delivery", confidence: 0.96}
    Agent->>MCP: Call 'control_smart_lock' {action: "LOCK_INSTANT"}
    MCP->>Ring: Actuator: Force Lock Door [LOCKED]
    Agent->>Display: Ring Speaker Output: "Please leave package on the doorstep."
    Agent->>Display: Alexa Ambient Voice: "Door secured. A delivery has arrived."
    Agent->>MCP: Call 'caregiver_dispatcher' {level: "INFO", message: "Delivery handled safely"}
    MCP->>AWS: AWS SNS: Push notification sent to family
```

---

### Scenario B: Ambient Health Distress & Emergency Triage Flow
Jab elder natural voice me distress express karte hain:

```mermaid
sequenceDiagram
    autonumber
    actor Elder as Elder
    participant Mic as Echo Show Mic (STT)
    participant Agent as Alexa+ Agent Core
    participant MCP as CareSentinel+ MCP Server
    participant AWS as AWS SNS (Emergency)
    participant Display as Display Console (TTS)

    Elder->>Mic: "Alexa, I'm feeling very dizzy and nauseous."
    Mic->>Agent: Transcribed Text: "feeling very dizzy and nauseous"
    Agent->>MCP: Call 'emergency_health_triage' {symptoms: ["dizziness", "nausea"], patient_id: "elder_01"}
    Note over MCP: Checks Medication DB (Vitals & Interactions)
    MCP-->>Agent: Triage Result: {severity: "HIGH", suspected: "Orthostatic Hypotension / BP Drop", protocol: "SIT_DOWN_IMMEDIATELY"}
    Agent->>Display: Alexa Voice: "Please sit down immediately. I am alerting your daughter and checking your readings."
    Agent->>MCP: Call 'caregiver_dispatcher' {level: "CRITICAL_SOS", contacts: ["daughter", "emergency"]}
    MCP->>AWS: Trigger Emergency SMS/Call via AWS SNS
    Agent->>Display: Screen displays Emergency Protocol Card & Caregiver confirmation
```

---

## 3. Component Details & Technical Specifications

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Echo Show 15 Console** | Next.js 15, TypeScript, Tailwind CSS | High-contrast elder-friendly UI, real-time tool logs, Ring feed player, visual speech waveform. |
| **Voice Processing** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) | Browser-native, zero-latency voice recognition and natural speech response without costly third-party speech APIs. |
| **Alexa+ Agent Engine** | Python / Next.js API Routes | Context memory, reasoning loop, Streamable HTTP SSE client for real-time conversation. |
| **MCP Server Gateway** | Python FastMCP (Spec: 2025-11-25+) | Exposes standard MCP tools over Streamable HTTP (SSE + POST) compliant with Amazon's latest Alexa+ guidelines. |
| **Ring IoT Simulator** | TypeScript Event Dispatcher | Simulates Ring REST APIs, webhook payloads, PIR sensors, and smart deadbolt actuator states. |
| **Cloud Intelligence** | AWS Bedrock (`anthropic.claude-3-5-sonnet` / `meta.llama3`) | Multi-modal reasoning, complex symptom analysis, and natural tone generation. |
| **Emergency Dispatch** | AWS SNS / Mock Telephony | Dispatches structured SMS, emails, and Webhook alerts to family members and doctors. |

---

## 4. MCP Tools Schema (Model Context Protocol Specification)

CareSentinel+ exposes 5 deterministic, strictly typed tools via Streamable HTTP:

### 1. `analyze_visitor_intent`
- **Input:** `event_type: string`, `timestamp: string`, `metadata: object`
- **Output:** `intent: "delivery" | "family" | "unknown" | "suspicious"`, `risk_level: "LOW" | "MEDIUM" | "HIGH"`

### 2. `control_smart_lock`
- **Input:** `door_id: string`, `action: "LOCK" | "UNLOCK" | "VERIFY_STATE"`
- **Output:** `status: "LOCKED" | "UNLOCKED"`, `timestamp: string`, `success: boolean`

### 3. `emergency_health_triage`
- **Input:** `symptoms: string[]`, `patient_id: string`, `vitals_snapshot?: object`
- **Output:** `urgency_level: "ROUTINE" | "ELEVATED" | "CRITICAL_SOS"`, `first_aid_action: string`, `escalate_call: boolean`

### 4. `caregiver_dispatcher`
- **Input:** `alert_level: "INFO" | "WARNING" | "CRITICAL_SOS"`, `message: string`, `patient_status: string`
- **Output:** `dispatch_id: string`, `recipients_notified: string[]`, `delivered_via: string[]`

### 5. `medication_schedule_logger`
- **Input:** `patient_id: string`, `medication_name: string`, `action: "TAKEN" | "SKIPPED" | "QUERY_NEXT"`
- **Output:** `next_dose_due: string`, `interaction_warning: string | null`, `status: "CONFIRMED"`

---

## 5. Security, Safety & Zero-Hallucination Architecture

1. **Deterministic Safety Guardrails:**
   - LLMs can hallucinate medical dosages or open doors accidentally. In CareSentinel+, the LLM **never** directly unlocks doors or prescribes meds. It is only allowed to call **strongly typed MCP Tools** with hardcoded boundary checks.
2. **Local Edge Fallback:**
   - If cloud connectivity drops or AWS Bedrock fails, the MCP Server features local heuristic fallback rules (e.g., if motion detected after 11 PM and door is unlocked -> immediately auto-lock).
3. **Privacy by Design:**
   - Raw video from the Ring camera simulator is never uploaded to the LLM. Only structured, anonymized semantic metadata (e.g., `{object: "person", time: "23:32"}`) is shared with the agent.
