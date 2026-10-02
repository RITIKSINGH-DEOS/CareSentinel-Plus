"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Unlock, Play } from "lucide-react";

interface HeaderBarProps {
  doorStatus: string;
  onToggleLock: () => void;
  onPlayReel?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ doorStatus, onToggleLock, onPlayReel }) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDateStr(now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocked = doorStatus === "LOCKED";

  return (
    <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              CareSentinel<span className="text-cyan-400 font-extrabold">+</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
              Echo Show 15
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Ambient Care & Home Safety</p>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Ramesh Singh (74)</span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400 font-medium">Perimeter Secure</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-400">AWS Bedrock Active</span>
      </div>

      {/* Right Controls: Lock Status & Time */}
      <div className="flex items-center gap-4">
        {onPlayReel && (
          <button
            onClick={onPlayReel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
            title="Play Automated Product Reel"
          >
            <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
            <span>Launch Reel</span>
          </button>
        )}

        <button
          onClick={onToggleLock}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
            isLocked
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isLocked ? "Door Locked" : "Door Unlocked"}</span>
        </button>

        <div className="text-right">
          <div className="text-sm font-semibold text-white tracking-tight">{timeStr || "10:00"}</div>
          <div className="text-[11px] text-slate-400">{dateStr || "Today"}</div>
        </div>
      </div>
    </header>
  );
};
