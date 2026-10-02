"use client";

import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, CheckCircle2 } from "lucide-react";

export interface ReelStep {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  actionType: "scenario" | "medication" | "scroll" | "none";
  actionPayload?: string | number;
  focusSection: "ring" | "voice" | "vitals" | "mcp" | null;
  durationMs: number;
}

const REEL_STEPS: ReelStep[] = [
  {
    id: "intro",
    badge: "Keynote Intro",
    title: "AUTONOMOUS AMBIENT GUARDIAN",
    tagline: "CareSentinel+ transforms passive smart homes into proactive life-safety networks.",
    actionType: "none",
    focusSection: null,
    durationMs: 5000,
  },
  {
    id: "perimeter",
    badge: "Step 1 of 4: Vision & IoT",
    title: "PERIMETER DEFENSE (11:32 PM)",
    tagline: "Ring detects late-night delivery • Deadbolt auto-locks • Ring speaker instructs driver.",
    actionType: "scenario",
    actionPayload: "late_night_delivery",
    focusSection: "ring",
    durationMs: 7000,
  },
  {
    id: "fall_sos",
    badge: "Step 2 of 4: Emergency Triage",
    title: "GROUND FALL SOS: AUTO-UNLOCK FOR EMS",
    tagline: "Elder falls • Alexa assesses acute trauma • Deadbolt UNLOCKS for paramedics • AWS SNS alerts sent.",
    actionType: "scenario",
    actionPayload: "fall_distress",
    focusSection: "voice",
    durationMs: 7500,
  },
  {
    id: "medication",
    badge: "Step 3 of 4: Clinical Safety",
    title: "DOUBLE-DOSE PREVENTION GATEKEEPER",
    tagline: "Adherence logged to Metformin • Duplicate intakes actively intercepted to prevent overdose.",
    actionType: "medication",
    actionPayload: 1, // Metformin index
    focusSection: "vitals",
    durationMs: 7000,
  },
  {
    id: "mcp_telemetry",
    badge: "Step 4 of 4: Enterprise MCP",
    title: "LIVE STREAMABLE HTTP MCP TELEMETRY",
    tagline: "Deterministic JSON-RPC 2.0 tool execution adhering strictly to Amazon's 2025-11-25+ specification.",
    actionType: "scroll",
    actionPayload: "mcp",
    focusSection: "mcp",
    durationMs: 6500,
  },
  {
    id: "outro",
    badge: "Reel Completed",
    title: "CARESENTINEL+ IS READY",
    tagline: "Bringing dignity, independence, and autonomous ambient protection to seniors worldwide.",
    actionType: "none",
    focusSection: null,
    durationMs: 6000,
  },
];

interface LaunchReelProps {
  isActive: boolean;
  onClose: () => void;
  onTriggerScenario: (scenarioId: string) => void;
  onToggleMedication: (index: number) => void;
  onFocusSection: (section: "ring" | "voice" | "vitals" | "mcp" | null) => void;
}

export const LaunchReel: React.FC<LaunchReelProps> = ({
  isActive,
  onClose,
  onTriggerScenario,
  onToggleMedication,
  onFocusSection,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const step = REEL_STEPS[currentStepIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Execute step action on step change
  useEffect(() => {
    if (!isActive) return;

    const current = REEL_STEPS[currentStepIndex];
    onFocusSection(current.focusSection);

    if (current.actionType === "scenario" && typeof current.actionPayload === "string") {
      onTriggerScenario(current.actionPayload);
    } else if (current.actionType === "medication" && typeof current.actionPayload === "number") {
      onToggleMedication(current.actionPayload);
    } else if (current.actionType === "scroll") {
      const el = document.getElementById("mcp-inspector-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (current.focusSection === null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStepIndex, isActive]);

  // Handle timer and progress
  useEffect(() => {
    if (!isActive || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const intervalTime = 50;
    const totalTicks = step.durationMs / intervalTime;
    let ticks = 0;

    progressIntervalRef.current = setInterval(() => {
      ticks += 1;
      setProgress(Math.min(100, (ticks / totalTicks) * 100));
    }, intervalTime);

    timerRef.current = setTimeout(() => {
      if (currentStepIndex < REEL_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsPaused(true);
      }
    }, step.durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentStepIndex, isActive, isPaused, step.durationMs]);

  if (!isActive) return null;

  const handleNext = () => {
    if (currentStepIndex < REEL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const isCompleted = currentStepIndex === REEL_STEPS.length - 1;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1120]/90 border border-cyan-500/40 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        {/* Top Glowing Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Left: Step Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
                {step.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentStepIndex + 1} of {REEL_STEPS.length}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white tracking-wide truncate">
              {step.title}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
              {step.tagline}
            </p>
          </div>

          {/* Right: Media Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm shadow-cyan-500/20"
              title={isPaused ? "Resume Tour" : "Pause Tour"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-cyan-300" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isCompleted}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-5 bg-white/10 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all"
              title="Exit Product Reel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-white/[0.06]">
          {REEL_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? "w-6 bg-cyan-400 shadow-sm shadow-cyan-400/50"
                  : idx < currentStepIndex
                  ? "w-2 bg-emerald-400/80"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
