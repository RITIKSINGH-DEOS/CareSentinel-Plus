"use client";

import React from "react";
import { Video, ShieldCheck, ShieldAlert, Sparkles, Moon, AlertTriangle, Pill, Volume2 } from "lucide-react";

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
  const isLocked = doorStatus === "LOCKED";

  const scenarios = [
    {
      id: "late_night_delivery",
      title: "Late Night Delivery",
      subtitle: "11:32 PM Package Drop",
      icon: <Moon className="w-4 h-4 text-cyan-400" />,
      badge: "Auto-Lock"
    },
    {
      id: "unknown_loiterer",
      title: "Unknown Loiterer",
      subtitle: "01:15 AM Perimeter Alert",
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      badge: "Warning"
    },
    {
      id: "fall_distress",
      title: "Ground Fall SOS",
      subtitle: "Elder Fall Detected",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      badge: "Emergency"
    },
    {
      id: "medication_check",
      title: "Medication Adherence",
      subtitle: "Blood Pressure Dose",
      icon: <Pill className="w-4 h-4 text-emerald-400" />,
      badge: "Adherence"
    }
  ];

  return (
    <div className="bg-[#0D1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Top Camera Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Video className="w-4 h-4 text-slate-400" />
            Front Porch Camera
          </h2>
          <span className="text-[11px] text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
            1080p HDR • Live
          </span>
        </div>

        {/* Lock Pill */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
          isLocked
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : "bg-amber-500/10 border-amber-500/20 text-amber-300"
        }`}>
          {isLocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{isLocked ? "Deadbolt Engaged" : "Deadbolt Disengaged"}</span>
        </div>
      </div>

      {/* Main Camera Viewport */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#090D18] to-[#040710] rounded-2xl overflow-hidden border border-white/[0.06] flex items-center justify-center shadow-inner">
        {/* Subtle camera lens vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Dynamic AI Detection & Scene Display */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 w-full max-w-sm">
          {activeScenario === "late_night_delivery" ? (
            <div className="flex flex-col items-center animate-fade-in bg-cyan-950/40 border border-cyan-500/40 px-6 py-5 rounded-2xl backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-900/60 px-2.5 py-0.5 rounded-full border border-cyan-700/50 mb-2">
                Ring Vision: Delivery Carrier
              </span>
              <div className="text-4xl my-1">📦 🚶‍♂️</div>
              <div className="text-xs font-semibold text-slate-100">Package Carrier at Front Door</div>
              <div className="text-[11px] text-slate-400 mt-1">Autonomous protocol: Door kept locked. Doorstep delivery requested.</div>
            </div>
          ) : activeScenario === "unknown_loiterer" ? (
            <div className="flex flex-col items-center animate-fade-in bg-rose-950/40 border border-rose-500/40 px-6 py-5 rounded-2xl backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-rose-400 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-700/50 mb-2">
                Security Alert: 01:15 AM
              </span>
              <div className="text-4xl my-1">👤 ⚠️</div>
              <div className="text-xs font-semibold text-slate-100">Unrecognized Individual Detected</div>
              <div className="text-[11px] text-slate-400 mt-1">Deadbolt confirmed locked. Security beacon activated.</div>
            </div>
          ) : activeScenario === "fall_distress" ? (
            <div className="flex flex-col items-center animate-fade-in bg-amber-950/40 border border-amber-500/40 px-6 py-5 rounded-2xl backdrop-blur-md shadow-2xl">
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-700/50 mb-2">
                Emergency Fall Triggered
              </span>
              <div className="text-4xl my-1">🚨 🆘</div>
              <div className="text-xs font-semibold text-slate-100">Ground Fall in Living Room</div>
              <div className="text-[11px] text-slate-400 mt-1">Door unlocked for responders. Family SMS sent via AWS SNS.</div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 mb-3">
                <Video className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-xs font-medium text-slate-300">Front Porch: Clear</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Continuous Ambient Sensing Active</p>
            </div>
          )}
        </div>

        {/* Ring External Two-Way Speaker Banner */}
        {ringSpeakerText && (
          <div className="absolute bottom-4 inset-x-4 bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 px-4 py-2.5 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg animate-fade-in">
            <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-xs font-medium truncate">
              <strong className="text-cyan-300">Ring Outdoor Speaker:</strong> &ldquo;{ringSpeakerText}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Scenarios / Test Cases Grid */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Simulation Scenarios</span>
          <span className="text-[11px] text-slate-400">Click to trigger simulated event</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onTriggerScenario(sc.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                activeScenario === sc.id
                  ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  {sc.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {sc.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{sc.subtitle}</div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                {sc.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
