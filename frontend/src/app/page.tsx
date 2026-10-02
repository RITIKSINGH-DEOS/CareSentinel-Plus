"use client";

import React, { useState } from "react";
import { HeaderBar } from "@/components/HeaderBar";
import { RingCameraView } from "@/components/RingCameraView";
import { AlexaVoiceSphere } from "@/components/AlexaVoiceSphere";
import { MCPInspector, MCPEvent } from "@/components/MCPInspector";
import { VitalsWidget, MedicationItem } from "@/components/VitalsWidget";
import { LaunchReel } from "@/components/LaunchReel";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const [doorStatus, setDoorStatus] = useState<string>("LOCKED");
  const [alexaSpeech, setAlexaSpeech] = useState<string>(
    "CareSentinel+ is online. The front door is secured, and emergency dispatch is standing by."
  );
  const [ringSpeakerText, setRingSpeakerText] = useState<string>("");
  const [activeScenario, setActiveScenario] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mcpEvents, setMcpEvents] = useState<MCPEvent[]>([]);
  const [isReelActive, setIsReelActive] = useState<boolean>(false);
  const [focusedSection, setFocusedSection] = useState<"ring" | "voice" | "vitals" | "mcp" | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([
    { name: "Amlodipine (5mg)", purpose: "Blood Pressure", due: "08:00 AM", taken: true },
    { name: "Metformin (500mg)", purpose: "Type-2 Diabetes", due: "01:00 PM", taken: false },
    { name: "Atorvastatin (10mg)", purpose: "Cholesterol Control", due: "09:00 PM", taken: false },
  ]);

  const updateMedicationStatus = (medNameSearch: string, isTaken: boolean) => {
    setMedications((prev) =>
      prev.map((m) => {
        const searchLower = medNameSearch.toLowerCase();
        const mLower = m.name.toLowerCase();
        const primaryWord = mLower.split(/[\s(]/)[0];
        if (
          mLower.includes(searchLower) ||
          searchLower.includes(mLower) ||
          (primaryWord.length > 2 && searchLower.includes(primaryWord))
        ) {
          return { ...m, taken: isTaken };
        }
        return m;
      })
    );
  };

  const addMedicationReminder = (name: string, dueTime: string) => {
    setMedications((prev) => {
      const exists = prev.some((m) => m.name.toLowerCase().includes(name.toLowerCase()));
      if (exists) {
        return prev.map((m) => m.name.toLowerCase().includes(name.toLowerCase()) ? { ...m, due: dueTime } : m);
      }
      return [...prev, { name: name.trim(), purpose: "Daily Regimen", due: dueTime, taken: false }];
    });
  };

  const handleToggleMedicationItem = (index: number) => {
    setMedications((prev) => {
      const updated = [...prev];
      const target = updated[index];
      const nextTaken = !target.taken;
      updated[index] = { ...target, taken: nextTaken };

      const action = nextTaken ? "LOG_TAKEN" : "SKIP_DOSE";
      addEvent("medication_schedule_logger", { medication_name: target.name, action }, { status: nextTaken ? "CONFIRMED_TAKEN" : "SKIPPED_LOGGED" });
      setAlexaSpeech(nextTaken ? `Confirmed: You have taken your ${target.name}. Good job!` : `Noted: Marked ${target.name} as pending.`);
      return updated;
    });
  };

  const addEvent = (tool: string, params: any, result: any, source: string = "Alexa+ Agent") => {
    const newEvt: MCPEvent = {
      event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      tool,
      params,
      result,
      source
    };
    setMcpEvents((prev) => [newEvt, ...prev]);
  };

  const handleToggleLock = () => {
    const newStatus = doorStatus === "LOCKED" ? "UNLOCKED" : "LOCKED";
    setDoorStatus(newStatus);
    const action = newStatus === "LOCKED" ? "LOCK" : "UNLOCK";
    addEvent(
      "control_smart_lock",
      { door_id: "front_door", action },
      { status: newStatus, success: true, timestamp: new Date().toLocaleTimeString() },
      "Resident Command"
    );
    setAlexaSpeech(`The front door is now ${newStatus.toLowerCase()}.`);
  };

  const handleSendMessage = async (userMessage: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setAlexaSpeech(data.speech);
        if (data.ui_card?.data?.door_status) {
          setDoorStatus(data.ui_card.data.door_status);
        }
        for (const t of data.tools_called || []) {
          addEvent(t.tool, t.params, t.result, "Alexa+ Voice Core");
          if (t.tool === "medication_schedule_logger") {
            const medName = t.result?.medication_name || t.params?.medication_name || "";
            if (t.result?.status === "CONFIRMED_TAKEN" || t.result?.status === "ALREADY_TAKEN_WARNING") {
              updateMedicationStatus(medName, true);
            } else if (t.result?.status === "REMINDER_SET") {
              addMedicationReminder(medName, t.result?.next_due_time || "08:00 AM");
            }
          }
        }
        setIsProcessing(false);
        return data.speech;
      }
    } catch (e) {
      console.warn("Backend API not reachable, running client fallback:", e);
    }

    const lower = userMessage.toLowerCase();
    let reply = "";

    if (lower.includes("lock") && lower.includes("door") && !lower.includes("unlock")) {
      setDoorStatus("LOCKED");
      reply = "I have engaged the deadbolt. The front door is securely locked.";
      addEvent("control_smart_lock", { door_id: "front_door", action: "LOCK" }, { status: "LOCKED", success: true });
    } else if (lower.includes("unlock")) {
      setDoorStatus("UNLOCKED");
      reply = "Front door is now unlocked.";
      addEvent("control_smart_lock", { door_id: "front_door", action: "UNLOCK" }, { status: "UNLOCKED", success: true });
    } else if (lower.includes("dizzy") || lower.includes("fall") || lower.includes("chest pain") || lower.includes("hurt")) {
      reply = "Please sit down immediately. I have registered acute distress and dispatched an emergency alert to your daughter Priya.";
      addEvent("emergency_health_triage", { symptoms: ["dizziness / acute distress"] }, { urgency_level: "ELEVATED", first_aid: "Sit down safely" });
      addEvent("caregiver_dispatcher", { alert_level: "ELEVATED" }, { recipients_notified: ["Priya (Daughter)"], status: "AWS_SNS_DELIVERED" });
    } else if (lower.includes("remind") || lower.includes("vitamin") || lower.includes("alarm") || (lower.includes("schedule") && !lower.includes("what"))) {
      const timeMatch = userMessage.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))/i);
      const timeStr = timeMatch ? timeMatch[0].toUpperCase() : "06:00 AM";
      const medName = lower.includes("vitamin") ? "Vitamins" : (lower.includes("bp") ? "Amlodipine (5mg)" : "Prescription Medication");
      reply = `I have set a daily reminder for your ${medName} every morning at ${timeStr}. I will alert you and track your adherence!`;
      addEvent("medication_schedule_logger", { medication_name: medName, action: "SET_REMINDER", reminder_time: timeStr }, { status: "REMINDER_SET", next_due: timeStr }, "Alexa+ Agent");
    } else if (lower.includes("vitals") || lower.includes("bp") || lower.includes("blood pressure") || lower.includes("heart rate") || lower.includes("pulse")) {
      reply = "Your health vitals are normal: Blood Pressure is 128 over 82 mmHg, resting heart rate is 72 BPM, and SpO2 oxygen is 98 percent. All indicators are stable.";
    } else if (lower.includes("metformin") || lower.includes("amlodipine") || lower.includes("atorvastatin") || lower.includes("medicine") || lower.includes("pill") || lower.includes("dose") || lower.includes("taken") || lower.includes("took")) {
      const medName = lower.includes("metformin")
        ? "Metformin (500mg)"
        : lower.includes("atorvastatin")
        ? "Atorvastatin (10mg)"
        : lower.includes("amlodipine")
        ? "Amlodipine (5mg)"
        : "Metformin (500mg)";
      updateMedicationStatus(medName, true);
      reply = `Logged: You have safely taken ${medName}. Good job staying on track!`;
      addEvent("medication_schedule_logger", { medication_name: medName, action: "LOG_TAKEN" }, { status: "CONFIRMED_TAKEN", next_due: "Tomorrow" }, "Alexa+ Agent");
    } else {
      reply = `CareSentinel+ is actively guarding your home. The front door is ${doorStatus.toLowerCase()}, and vitals are normal.`;
    }

    setAlexaSpeech(reply);
    setIsProcessing(false);
    return reply;
  };

  const handleTriggerScenario = async (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setRingSpeakerText("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/ring/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: scenarioId })
      });

      if (res.ok) {
        const data = await res.json();
        setAlexaSpeech(data.alexa_speech);
        if (data.ring_speaker_speech) {
          setRingSpeakerText(data.ring_speaker_speech);
        }
        if (data.door_status) {
          setDoorStatus(data.door_status);
        }
        for (const t of data.tools_called || []) {
          addEvent(t.tool, t.params || {}, t.result, "Ring Sensor Simulator");
        }
        return;
      }
    } catch (e) {
      console.warn("Backend trigger not reached, executing client-side simulation:", e);
    }

    if (scenarioId === "late_night_delivery") {
      setDoorStatus("LOCKED");
      setRingSpeakerText("Please leave the package at the doorstep. The resident is resting.");
      setAlexaSpeech("Front door secured. A late-night delivery was detected. I have instructed the driver to leave the package on the porch.");
      addEvent("analyze_visitor_intent", { event_type: "motion_detected", timestamp: "23:32:00", package_present: true }, { intent: "PACKAGE_DELIVERY", confidence: 0.96, risk_level: "LOW" }, "Ring Camera Sensor");
      addEvent("control_smart_lock", { door_id: "front_door", action: "LOCK" }, { status: "LOCKED", success: true }, "Ring Autonomous Actuator");
      addEvent("caregiver_dispatcher", { alert_level: "INFO", message: "Late-night package delivery safely handled at 11:32 PM" }, { status: "AWS_SNS_DELIVERED" }, "AWS Cloud Dispatch");
    } else if (scenarioId === "unknown_loiterer") {
      setDoorStatus("LOCKED");
      setRingSpeakerText("You are on camera. This area is under 24/7 autonomous surveillance.");
      setAlexaSpeech("Perimeter alert: An unrecognized person was detected outside. The front door is deadbolted. Please do not open the door.");
      addEvent("analyze_visitor_intent", { event_type: "motion_detected", timestamp: "01:15:00" }, { intent: "POTENTIAL_RISK", confidence: 0.91, risk_level: "HIGH" }, "Ring Camera Sensor");
      addEvent("control_smart_lock", { door_id: "front_door", action: "LOCK" }, { status: "LOCKED", success: true });
      addEvent("caregiver_dispatcher", { alert_level: "WARNING", message: "Security Warning: Loiterer at 01:15 AM" }, { status: "AWS_SNS_DELIVERED" });
    } else if (scenarioId === "fall_distress") {
      setDoorStatus("UNLOCKED");
      setAlexaSpeech("I have detected a severe fall. Help is on the way! I have unlocked the door for responders and notified your daughter Priya.");
      addEvent("emergency_health_triage", { symptoms: ["severe ground fall", "hip pain"] }, { urgency_level: "CRITICAL_SOS", should_alert_ems: true });
      addEvent("control_smart_lock", { door_id: "front_door", action: "UNLOCK" }, { status: "UNLOCKED", message: "Unlocked for emergency first responders" });
      addEvent("caregiver_dispatcher", { alert_level: "CRITICAL_SOS", message: "CRITICAL SOS: Fall detected" }, { status: "AWS_SNS_DISPATCHED" });
    } else if (scenarioId === "medication_check") {
      setAlexaSpeech("Checking prescription schedule: You have safely taken Amlodipine 5mg. Your next medication Metformin is due at 01:00 PM.");
      addEvent("medication_schedule_logger", { medication_name: "Amlodipine", action: "QUERY_NEXT" }, { status: "SCHEDULE_INFO", next_due: "01:00 PM" });
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Minimal Header Bar */}
      <HeaderBar
        doorStatus={doorStatus}
        onToggleLock={handleToggleLock}
        onPlayReel={() => setIsReelActive(true)}
      />

      {/* Interactive Launch Reel Tour Controller */}
      <LaunchReel
        isActive={isReelActive}
        onClose={() => {
          setIsReelActive(false);
          setFocusedSection(null);
        }}
        onTriggerScenario={handleTriggerScenario}
        onToggleMedication={handleToggleMedicationItem}
        onFocusSection={setFocusedSection}
      />

      {/* Main Dual-Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ring Vision & Door Control */}
        <section
          className={`lg:col-span-7 flex flex-col gap-6 rounded-3xl transition-all duration-700 ${
            focusedSection === "ring"
              ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20 scale-[1.01]"
              : ""
          }`}
        >
          <RingCameraView
            doorStatus={doorStatus}
            onToggleLock={handleToggleLock}
            onTriggerScenario={handleTriggerScenario}
            activeScenario={activeScenario}
            ringSpeakerText={ringSpeakerText}
          />
        </section>

        {/* Right Column: Alexa+ Voice & Vitals */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div
            className={`rounded-3xl transition-all duration-700 ${
              focusedSection === "voice"
                ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20 scale-[1.01]"
                : ""
            }`}
          >
            <AlexaVoiceSphere
              onSendMessage={handleSendMessage}
              alexaSpeech={alexaSpeech}
              isProcessing={isProcessing}
            />
          </div>

          <div
            className={`rounded-3xl transition-all duration-700 ${
              focusedSection === "vitals"
                ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20 scale-[1.01]"
                : ""
            }`}
          >
            <VitalsWidget
              medications={medications}
              onToggleMedication={handleToggleMedicationItem}
            />
          </div>
        </section>

        {/* Bottom Full-Width: Collapsible MCP Inspector */}
        <section
          id="mcp-inspector-section"
          className={`lg:col-span-12 rounded-3xl transition-all duration-700 ${
            focusedSection === "mcp"
              ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20 scale-[1.005]"
              : ""
          }`}
        >
          <MCPInspector
            events={mcpEvents}
            onClear={() => setMcpEvents([])}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.04]">
        <span>CareSentinel+ • Amazon Developer Hackathon 2026</span>
        <div className="flex items-center gap-3">
          <span>Alexa+ (Streamable HTTP)</span>
          <span>•</span>
          <span>Ring IoT</span>
          <span>•</span>
          <span>AWS Bedrock</span>
        </div>
      </footer>
    </div>
  );
}
