# 📝 CareSentinel+ — Developer Friction Log & Product Feedback

> **Devpost Submission Bonus:** Earns up to **+10% judging bonus score** by providing actionable feedback to Amazon Developer Relations and product teams building Alexa+, Ring, and AWS tools.

---

### Entry 1: MCP Streamable HTTP Transport Specification (Spec 2025-11-25+)

* **Task Attempted:**  
  Implementing a self-hosted Model Context Protocol (MCP) server exposing tools over Streamable HTTP (SSE + POST) rather than STDIO, conforming to the latest 2025-11-25+ draft for Alexa+ agent integration.
* **Steps Taken:**  
  Configured FastAPI with SSE `/mcp/sse` and JSON-RPC 2.0 message handler `/mcp/messages`. Implemented standard tool schemas for `tools/list` and `tools/call`.
* **Expected vs. What Actually Happened:**  
  *Expected:* Clear official guidelines on whether Streamable HTTP transport requires bi-directional WebSocket or single long-lived SSE streaming with chunked POST fallback for voice latency.  
  *What Happened:* The MCP transport documentation primarily focused on local STDIO clients; documentation for self-hosted Streamable HTTP across cloud and web clients required custom heartbeat implementations (`: ping\n\n`) to prevent connection timeouts through proxy layers.
* **Severity Rating:** **Medium (Important)**
* **Workaround Used:**  
  Implemented a 15-second background heartbeat task on the `/mcp/sse` route and provided direct dual endpoints (`/mcp/messages` and REST `/api/chat`) for ultra-low-latency voice client responsiveness.
* **Actionable Suggestion for Amazon/MCP Team:**  
  Provide an official Amazon Devices starter SDK template for Streamable HTTP in Python/TypeScript with pre-configured keep-alive headers, CORS, and an integrated Web Inspector.

---

### Entry 2: Ring API Simulator Event Trigger Schema Consistency

* **Task Attempted:**  
  Simulating PIR motion sensors, doorbell chimes, and smart lock actuators across edge web clients without physical Ring hardware.
* **Steps Taken:**  
  Integrated mock Ring REST event payloads matching `motion_detected` and `ding_pressed` schemas as documented in the Amazon Ring Vision API reference.
* **Expected vs. What Actually Happened:**  
  *Expected:* A standard local CLI or web playground simulator provided by Amazon to fire Ring webhook events to local webhooks.  
  *What Happened:* Developers building in local sandbox environments had to write their own event dispatchers to simulate camera frames and deadbolt state changes.
* **Severity Rating:** **Low (Nice-to-Have)**
* **Workaround Used:**  
  Built a built-in interactive scenario trigger engine right into the Echo Show 15 console (`RingCameraView.tsx`) with pre-configured payloads for late-night delivery, suspicious loitering, and medical falls.
* **Actionable Suggestion for Amazon/Ring Team:**  
  Publish an official npm package or Docker image for `@amazon/ring-simulator` that exposes local webhooks and mock video streams for fast developer onboarding.

---

### Entry 3: Multi-Modal Voice + Visual UI Synchronization in Alexa+

* **Task Attempted:**  
  Rendering visual Echo Show cards (e.g. Door Status badge, Emergency Triage card) simultaneously while Alexa speaks natural speech audio.
* **Steps Taken:**  
  Linked the MCP tool return payload to dual outputs: `speech` (for SpeechSynthesis / Alexa voice) and `ui_card` (for the responsive Next.js display).
* **Expected vs. What Actually Happened:**  
  *Expected:* Built-in Alexa+ Agent Skills often emphasize voice-only output.  
  *What Happened:* Designing for smart displays (like Echo Show 15 or Fire TV) requires separate visual cards and voice summaries so the user is not overwhelmed with long spoken texts when a visual card is clearer.
* **Severity Rating:** **Medium (Important)**
* **Workaround Used:**  
  Structured the agent response into separated channels: `alexa_speech` (short, comforting, conversational) and `ui_card_data` (structured, readable stats).
* **Actionable Suggestion for Amazon Alexa Team:**  
  Incorporate standard multi-modal schema definitions in MCP tool return types (`visual_card` + `voice_ssml`) directly in the Agent Skills SDK.
