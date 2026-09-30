# 🛡️ CareSentinel+
> **Autonomous Voice & Vision Ambient Care & Home Safety for Solo Living & Elderly Care**

[![Amazon Developer Hackathon 2026](https://img.shields.io/badge/Amazon%20Developer%20Hackathon-2026-orange.svg)](https://amazonappdev2026.devpost.com/)
[![Track: Alexa+ (MCP)](https://img.shields.io/badge/Primary%20Track-Alexa%2B%20(MCP%20Streamable%20HTTP)-blue.svg)](https://modelcontextprotocol.io/)
[![Integration: Ring API](https://img.shields.io/badge/Integration-Ring%20IoT%20%26%20Vision-brightgreen.svg)](https://developer.amazon.com/docs/ring/)
[![AWS Builder Challenge](https://img.shields.io/badge/AWS%20Builder-Bedrock%20%2B%20SNS-232F3E.svg)](https://aws.amazon.com/bedrock/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary

**CareSentinel+** is a proactive ambient care and security system that unites **Alexa+**, **Ring**, and **AWS Cloud** into a single intelligent ecosystem. 

Rather than acting as a passive voice assistant that waits for instructions, CareSentinel+ operates as an **autonomous, proactive guardian**:
- 🚪 **Front-Door Vigilance (Ring Integration):** Analyzes doorbell camera events, locks doors automatically during late-night deliveries, and interacts with visitors without exposing vulnerable elders.
- 🎙️ **Ambient Health Companion (Alexa+ & MCP):** Understands natural spoken distress (*"Alexa, I feel dizzy"*), triggers emergency triage protocols, verifies drug safety, and dispatches urgent alerts to family members via AWS SNS.
- ⚡ **Zero-Hallucination Safety:** Uses strict, deterministic **Model Context Protocol (MCP)** tools rather than ungrounded LLM guesses.

---

## 🏛️ System Architecture

CareSentinel+ follows an event-driven, edge-cloud hybrid architecture using **Streamable HTTP MCP** (Spec 2025-11-25+).

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

## 🔄 Core Workflows & Scenarios

### 1. Late Night Delivery (Proactive Perimeter Defense)
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as External Visitor
    participant Ring as Ring Doorbell Sim
    participant Agent as Alexa+ Agent Core
    participant MCP as CareSentinel+ MCP Server
    participant Display as Echo Show Display
    participant AWS as AWS SNS (Cloud)

    Visitor->>Ring: Arrives at door at 11:32 PM
    Ring->>Agent: Event: 'motion_detected' (Late Night)
    Agent->>MCP: Call 'analyze_visitor_intent'
    MCP-->>Agent: Result: Package Delivery (0.96 confidence)
    Agent->>MCP: Call 'control_smart_lock' (Action: LOCK)
    MCP->>Ring: Deadbolt Engaged [LOCKED]
    Agent->>Display: Ring Speaker: "Please leave package on doorstep."
    Agent->>Display: Alexa Soft Voice: "Door secured. A delivery has arrived."
    Agent->>MCP: Call 'caregiver_dispatcher'
    MCP->>AWS: AWS SNS: Push notification to caregiver
```

### 2. Ambient Medical Distress & SOS Triage
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
    Mic->>Agent: Speech-to-Text transcription
    Agent->>MCP: Call 'emergency_health_triage'
    Note over MCP: Checks Medication DB & BP logs
    MCP-->>Agent: Urgency: HIGH (BP drop suspected), Action: Sit Down
    Agent->>Display: Alexa Voice: "Please sit down immediately. Alerting your daughter."
    Agent->>MCP: Call 'caregiver_dispatcher' (CRITICAL_SOS)
    MCP->>AWS: Immediate SMS & Automated Emergency Dispatch
```

---

## 🛠️ Tech Stack & Key Choices

| Layer | Technology | Rationale | Cost |
| :--- | :--- | :--- | :--- |
| **Frontend Console** | Next.js 15, TypeScript, Tailwind CSS | Simulates Echo Show 15 smart display, fast, deployable to Vercel in 1 click | **$0 Free** |
| **Voice Engine** | Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) | Browser-native speech recognition and speech output, zero external API keys needed | **$0 Free** |
| **Agent / MCP Server** | Python (FastMCP / FastAPI) | Implements official Model Context Protocol (Streamable HTTP spec 2025-11-25+) | **$0 Free** |
| **Smart Camera / IoT** | Ring Simulator Engine | Simulates Ring Doorbell events, PIR sensor, and deadbolt actuator | **$0 Free** |
| **Cloud Intelligence** | AWS Bedrock (`boto3`) + Local Fallback | High-fidelity reasoning with zero-cost local heuristic fallback | **$0 Free (Credits)** |
| **Notification Engine** | AWS SNS (Simple Notification Service) | Real-time SMS & webhook dispatch for emergency caregivers | **$0 Free** |

---

## 📋 MCP Tools Reference

CareSentinel+ exposes 5 strictly typed Model Context Protocol tools:

1. `analyze_visitor_intent`: Classifies motion events, distinguishes delivery vs familiar vs suspicious visitors.
2. `control_smart_lock`: Interacts with simulated deadbolt to lock/unlock and verify physical security.
3. `emergency_health_triage`: Evaluates reported symptoms against vitals history and guidelines without ungrounded hallucinations.
4. `caregiver_dispatcher`: Dispatches categorized alerts (INFO, WARNING, CRITICAL_SOS) via AWS SNS.
5. `medication_schedule_logger`: Logs medication compliance, prevents accidental duplicate doses, checks interactions.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### 1. Run MCP Server (Backend)
```bash
cd mcp-server
pip install -r requirements.txt
python server.py
# Server runs on http://localhost:8000 (Streamable HTTP / SSE)
```

### 2. Run Echo Show Simulator (Frontend)
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

---

## 📜 Hackathon Compliance Guarantee
- [x] **Primary Track:** Alexa+ (Self-hosted Streamable HTTP MCP Server spec 2025-11-25+ with real code imports).
- [x] **Cross Integration:** Ring API / Simulator compliance.
- [x] **AWS Builder Mini Challenge:** AWS Bedrock and AWS SNS integration documented.
- [x] **Open Source Challenge:** MIT License included.
- [x] **Zero Hardware Dependency:** Runs end-to-end on standard browser & PC.
- [x] **Strict Git Governance:** Zero remote Git pushes without explicit maintainer confirmation.
