# 🎬 CareSentinel+ — 3-Minute Demo Video Script & Walkthrough

> **Devpost Requirement:** Under 3 minutes, English, public video. Lead with the best material!

---

### Timeline Breakdown (0:00 - 3:00)

#### ⏱️ Part 1: The Problem & Vision (0:00 - 0:40)
* **What to show on screen:** Full-screen browser on `http://localhost:3000` (Echo Show 15 Console).
* **What to say (Voiceover):**
  > *"Millions of seniors and individuals with chronic conditions live alone. When emergencies strike—like a late-night intruder or a sudden fall—they cannot type prompts into a chatbot. Today, voice assistants and doorbells operate in silos. 
  > Introducing **CareSentinel+**, an autonomous ambient care and home security guardian built for the Amazon Developer Hackathon. CareSentinel+ fuses Alexa+'s voice intelligence, Ring's front-door vision, and AWS Cloud into a single proactive ecosystem powered by the new Model Context Protocol (MCP) Streamable HTTP specification."*

---

#### ⏱️ Part 2: Proactive Front-Door Defense with Ring & MCP (0:40 - 1:25)
* **What to do:**
  1. Click the button: **`[Late Night Delivery (11:32 PM)]`**.
  2. Watch the screen update: Door locks autonomously, Ring speaker announces drop-off, Alexa confirms in soft voice.
  3. Scroll down slightly to highlight the **`Live MCP Tool Call Inspector`** with `analyze_visitor_intent` and `control_smart_lock`.
* **What to say (Voiceover):**
  > *"Notice what happens when an Amazon delivery driver arrives at 11:32 PM. Instead of just sending a phone notification, our agent immediately triggers our self-hosted MCP tool: `analyze_visitor_intent`. 
  > Recognizing a package carrier at night, CareSentinel+ autonomously engages the front deadbolt via `control_smart_lock`, uses the Ring two-way speaker to instruct the driver to leave the package on the doorstep, and updates the family via AWS SNS. All of this happens with zero friction to the resident."*

---

#### ⏱️ Part 3: Ambient Health Distress & SOS Triage (1:25 - 2:10)
* **What to do:**
  1. Click **`[TALK TO ALEXA+]`** or speak into laptop mic:  
     *"Alexa, I'm feeling very dizzy and nauseous."*
  2. Alexa speaks back: *"Please sit down and rest right where you are... alerting your daughter Priya."*
  3. Point out the **MCP Inspector** showing `emergency_health_triage` and `caregiver_dispatcher` (AWS SNS delivered).
* **What to say (Voiceover):**
  > *"Now watch our health guardian in action. A resident doesn't need to ask for a specific skill. They simply speak naturally to Alexa+: 'Alexa, I'm feeling very dizzy.' 
  > Our agent invokes the `emergency_health_triage` tool. Adhering to clinical guidelines, it detects potential blood pressure drop, gives immediate first-aid instructions, and dispatches a critical priority alert to their daughter Priya and emergency contacts via AWS SNS. Notice the live MCP Inspector displaying real-time JSON-RPC 2.0 payloads with 100% deterministic safety."*

---

#### ⏱️ Part 4: Medication Adherence & Double-Dose Prevention (2:10 - 2:40)
* **What to do:**
  1. Speak or type: *"Alexa, I just took my blood pressure medicine."*
  2. Point out Alexa's warning if already taken, or confirmation if due.
* **What to say (Voiceover):**
  > *"Medication errors are a leading cause of hospitalizations in elders. If a resident mistakenly attempts to take their morning Amlodipine twice, the `medication_schedule_logger` tool flags an accidental double-dose alert and gently guides them, eliminating hallucinations."*

---

#### ⏱️ Part 5: Architecture & Closing (2:40 - 3:00)
* **What to show:** Quick switch to the GitHub README / System Design Mermaid architecture diagram.
* **What to say (Voiceover):**
  > *"CareSentinel+ is 100% open source under the MIT license, running on a Next.js Echo Show 15 simulator and a Python Streamable HTTP MCP server adhering to the latest 2025-11-25 specification. 
  > By bridging the front door and the living room, we make solo living safer, dignified, and truly autonomous. Thank you!"*
