"use client";

import React, { useState } from "react";
import { Heart, Pill, Check, Clock } from "lucide-react";

interface VitalsWidgetProps {
  onMedicationClick: (medName: string) => void;
}

export const VitalsWidget: React.FC<VitalsWidgetProps> = ({ onMedicationClick }) => {
  const [meds, setMeds] = useState([
    { name: "Amlodipine (5mg)", purpose: "Blood Pressure", due: "08:00 AM", taken: true },
    { name: "Metformin (500mg)", purpose: "Diabetes", due: "01:00 PM", taken: false },
    { name: "Atorvastatin (10mg)", purpose: "Cholesterol", due: "09:00 PM", taken: false },
  ]);

  const toggleMed = (index: number) => {
    const updated = [...meds];
    updated[index].taken = !updated[index].taken;
    setMeds(updated);
    if (updated[index].taken) {
      onMedicationClick(updated[index].name);
    }
  };

  return (
    <div className="bg-[#0D1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Health Telemetry & Meds</h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
          All Stable
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">BP</span>
          <span className="text-base font-bold text-white mt-0.5">128/82</span>
          <span className="text-[10px] text-emerald-400">Normal</span>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pulse</span>
          <span className="text-base font-bold text-white mt-0.5">72</span>
          <span className="text-[10px] text-slate-400">BPM</span>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">SpO2</span>
          <span className="text-base font-bold text-white mt-0.5">98%</span>
          <span className="text-[10px] text-cyan-400">Optimum</span>
        </div>
      </div>

      {/* Daily Medication Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-cyan-400" />
            Today&apos;s Medications
          </span>
          <span className="text-[10px] text-slate-400">Click to confirm</span>
        </div>

        <div className="space-y-2">
          {meds.map((med, idx) => (
            <div
              key={idx}
              onClick={() => toggleMed(idx)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                med.taken
                  ? "bg-emerald-500/5 border-emerald-500/20 text-slate-400"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                    med.taken ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-600 bg-white/5"
                  }`}
                >
                  {med.taken && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <div className={`text-xs font-medium ${med.taken ? "line-through text-slate-400" : "text-white"}`}>
                    {med.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{med.purpose}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{med.due}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
