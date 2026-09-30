# CareSentinel+
> Autonomous Voice & Vision Ambient Care & Home Safety for Solo Living & Elderly Care

Built for the **Amazon Developer Hackathon: Build, Ship, Shape (2026)**
- **Primary Track:** Alexa+ (Self-hosted MCP Server, Streamable HTTP spec 2025-11-25+ & Simulated Web Experience)
- **Cross-Integration:** Ring (Smart Home, Access Control & Doorbell Vision APIs / Simulator)
- **Mini-Challenges:** 
  - AWS Builder ($5,000 Cash + $5,000 AWS Credits) via Bedrock & SNS
  - Open Source ($5,000 Cash + $5,000 AWS Credits) via MIT License
- **Friction Log Bonus:** +10% Evaluation Boost

---

## Architecture Overview
1. **Frontend (`/frontend`):** Next.js (TypeScript, Tailwind CSS, Lucide React, Framer Motion)
   - Echo Show 15 Smart Display simulation
   - Web Speech API (Microphone Speech-to-Text & Natural Voice Synthesis)
   - Real-time Audio Waveform Visualizer
   - Interactive Ring Doorbell & Camera simulator with realistic scenarios
   - Live MCP Tool Execution stream (judge transparency)
2. **Backend & MCP Server (`/mcp-server`):** Python (FastAPI / FastMCP Streamable HTTP)
   - `ring_camera_analyzer`: Evaluates visitor intent & motion risk
   - `smart_lock_controller`: Proactive autonomous door locking
   - `emergency_health_triage`: Voice-activated symptom & emergency assessment
   - `caregiver_dispatcher`: AWS SNS / structured alert dispatch to family
3. **Cloud & AI Layer (`/cloud`):**
   - AWS Bedrock (Claude 3.5 Sonnet / Llama 3) with zero-cost mock/hybrid fallback
   - AWS SNS for caregiver emergency dispatch

---

## Hackathon Strict Guidelines Checklist
- [x] Self-hosted MCP Server calling real tools in code (no fake READMEs)
- [x] Zero hardware dependency (runs via browser simulator on Windows)
- [x] Zero Git remote push until explicitly commanded by the user
- [x] Open-source MIT License included
- [x] Friction log prepared for 10% bonus
