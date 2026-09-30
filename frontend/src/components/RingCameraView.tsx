"use client";

import React, { useState } from "react";
import { Video, ShieldCheck, ShieldAlert, Sparkles, Moon, AlertTriangle, Pill, Volume2, Lock, Unlock } from "lucide-react";

interface RingCameraViewProps {
  doorStatus: string;
  onToggleLock: () => void;
  onTriggerScenario: (scenarioId: string) => void;
  activeScenario: string;
  ringSpeakerText: string;
}

export const RingCameraView: React.FC<RingCameraViewProps> = ({
  doorStatus,
  onToggleLock,
  onTriggerScenario,
  activeScenario,
  ringSpeakerText,
}) => {
  const [motionActive, setMotionActive] = useState<boolean>(false);

  const scenarios = [
    {
      id: "late_night_delivery",
      title: "Late Night Delivery (11:32 PM)",
      desc: "Simulates Amazon delivery driver arriving at night with box",
      icon: <Moon className="w-4 h-4 text-cyan-400" />,
      tag: "Proactive Defense",
      color: "border-cyan-500/50 hover:bg-cyan-950/40 text-cyan-300"
    },
    {
      id: "unknown_loiterer",
      title: "Unknown Loiterer (01:15 AM)",
      desc: "Unrecognized person loitering near door in dark",
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      tag: "Security Alert",
      color: "border-rose-500/50 hover:bg-rose-950/40 text-rose-300"
    },
    {
      id: "fall_distress",
      title: "Elder Ground Fall & Distress",
      desc: "Elder falls, high pain, emergency SOS triggered",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      tag: "Emergency SOS",
      color: "border-amber-500/50 hover:bg-amber-950/40 text-amber-300"
    },
    {
      id: "medication_check",
      title: "Medication Adherence Check",
      desc: "Verifies morning BP medicine & prevents double-dose",
      icon: <Pill className="w-4 h-4 text-emerald-400" />,
      tag: "Zero Hallucination",
      color: "border-emerald-500/50 hover:bg-emerald-950/40 text-emerald-300"
    }
  ];

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Viewport Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" />
            Ring Video Doorbell Pro Feed
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            1080p HDR • FRONT PORCH
          </span>
        </div>

        {/* Lock / Unlock Deadbolt Actuator Control */}
        <button
          onClick={onToggleLock}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
            doorStatus === "LOCKED"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-amber-600 hover:bg-amber-500 text-white"
          }`}
        >
          {doorStatus === "LOCKED" ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>DEADBOLT ENGAGED (CLICK TO UNLOCK)</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>DEADBOLT DISENGAGED (CLICK TO LOCK)</span>
            </>
          )}
        </button>
      </div>

      {/* Simulated Camera Screen Display */}
      <div className="relative w-full aspect-video bg-gradient-to-b from-slate-900 to-[#060A12] rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
        {/* Ambient Grid overlay simulating CCTV */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Dynamic Scene Visualizer */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 w-full">
          {activeScenario === "late_night_delivery" ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="relative border-2 border-cyan-400/80 bg-cyan-950/30 px-6 py-4 rounded-xl backdrop-blur-sm shadow-lg glow-cyan">
                <span className="absolute -top-3 left-4 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  AI VISION: DELIVERY AGENT (96%)
                </span>
                <div className="text-4xl my-2">📦 🚶‍♂️</div>
                <div className="text-xs font-semibold text-cyan-200">Package Carrier Detected at Front Porch</div>
                <div className="text-[11px] text-slate-400 mt-1">Autonomous rule: Keep door locked & announce doorstep drop</div>
              </div>
            </div>
          ) : activeScenario === "unknown_loiterer" ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="relative border-2 border-rose-500/80 bg-rose-950/40 px-6 py-4 rounded-xl backdrop-blur-sm shadow-lg glow-alert">
                <span className="absolute -top-3 left-4 bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  AI VISION: UNRECOGNIZED LOITERER (01:15 AM)
                </span>
                <div className="text-4xl my-2">👤 ⚠️</div>
                <div className="text-xs font-bold text-rose-200">Late-Night Perimeter Threat Detected</div>
                <div className="text-[11px] text-rose-300 mt-1">Deadbolt enforced. Warning audio beacon emitted.</div>
              </div>
            </div>
          ) : activeScenario === "fall_distress" ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="relative border-2 border-amber-500/80 bg-amber-950/40 px-6 py-4 rounded-xl backdrop-blur-sm shadow-lg">
                <span className="absolute -top-3 left-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  HEALTH SENSOR: ACUTE FALL DETECTED
                </span>
                <div className="text-4xl my-2">🚨 🆘</div>
                <div className="text-xs font-bold text-amber-200">Elder Ground Fall in Living Room</div>
                <div className="text-[11px] text-amber-300 mt-1">Door unlocked for EMS responders. AWS SNS sent.</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300 mb-2">
                <Video className="w-8 h-8 opacity-70" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Front Porch Perimeter: All Clear</p>
              <p className="text-xs text-slate-500 mt-1">PIR Motion Active • Ambient Guard Active</p>
            </div>
          )}
        </div>

        {/* Video Camera Telemetry Watermarks */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center gap-2 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>RING LIVE • 30 FPS</span>
        </div>

        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 border border-slate-800">
          RSSI: -48 dBm (Strong)
        </div>

        {/* Ring External Two-Way Speaker Banner */}
        {ringSpeakerText && (
          <div className="absolute bottom-3 inset-x-3 bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 px-3 py-2 rounded-lg flex items-center gap-2.5 backdrop-blur-md shadow-lg animate-pulse">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-xs font-medium truncate">
              <strong>Ring External Speaker:</strong> &ldquo;{ringSpeakerText}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Interactive Scenario Sandbox Buttons (For Demo Video) */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interactive Test Scenarios (Demo Triggers)
          </span>
          <span className="text-[11px] text-cyan-400 font-medium">
            Click to fire simulated Ring & Sensor events
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onTriggerScenario(sc.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 shadow-sm ${
                activeScenario === sc.id
                  ? "bg-slate-800 border-cyan-400 glow-cyan"
                  : `bg-slate-900/70 border-slate-800 ${sc.color}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  {sc.icon}
                  <span>{sc.title}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {sc.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {sc.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
