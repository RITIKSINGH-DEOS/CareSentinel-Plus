"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Wifi, Cloud, User, Heart, Bell } from "lucide-react";

interface HeaderBarProps {
  doorStatus: string;
  isArmed: boolean;
  alertLevel?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ doorStatus, isArmed, alertLevel }) => {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#0D1527]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-lg">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-md glow-cyan">
          <ShieldCheck className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              CareSentinel<span className="text-cyan-400 font-extrabold">+</span>
            </h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Echo Show 15 Hub
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Autonomous Voice & Vision Ambient Care
          </p>
        </div>
      </div>

      {/* Resident & Caregiver Telemetry */}
      <div className="hidden md:flex items-center gap-5 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <User className="w-4 h-4 text-cyan-400" />
          <span>
            Resident: <strong className="text-white">Ramesh Singh (74)</strong>
          </span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-2 text-slate-300">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>
            Vitals: <strong className="text-emerald-400">Normal</strong>
          </span>
        </div>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-2 text-slate-300">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>
            Guardian: <strong className="text-white">Priya (Daughter)</strong>
          </span>
        </div>
      </div>

      {/* Real-time Status Badges & Clock */}
      <div className="flex items-center gap-4">
        {/* Door Lock Status Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          doorStatus === "LOCKED"
            ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-300 glow-safe"
            : "bg-amber-950/70 border-amber-700/60 text-amber-300"
        }`}>
          {doorStatus === "LOCKED" ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DEADBOLT LOCKED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>DEADBOLT UNLOCKED</span>
            </>
          )}
        </div>

        {/* AWS Cloud Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Cloud className="w-3.5 h-3.5 text-orange-400" />
          <span>AWS Builder: Bedrock</span>
        </div>

        {/* Live Clock */}
        <div className="text-right">
          <div className="text-base font-bold text-white tracking-wider tabular-nums font-mono">
            {timeStr || "10:00:00"}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {dateStr || "Today"}
          </div>
        </div>
      </div>
    </header>
  );
};
