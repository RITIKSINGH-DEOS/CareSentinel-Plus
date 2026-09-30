"use client";

import React, { useState } from "react";
import { HeartPulse, Activity, Pill, Check, Clock, AlertCircle } from "lucide-react";

interface VitalsWidgetProps {
  onMedicationClick: (medName: string) => void;
}

export const VitalsWidget: React.FC<VitalsWidgetProps> = ({ onMedicationClick }) => {
  const [meds, setMeds] = useState([
    { name: "Amlodipine (5mg)", purpose: "High Blood Pressure", due: "08:00 AM", taken: true },
    { name: "Metformin (500mg)", purpose: "Type-2 Diabetes", due: "01:00 PM", taken: false },
    { name: "Atorvastatin (10mg)", purpose: "Cholesterol Control", due: "09:00 PM", taken: false },
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
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <h2 className="text-base font-bold text-white">Resident Vitals & Regimen</h2>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          Telemetry Active
        </span>
      </div>

      {/* Vitals Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Blood Pressure</span>
          <span className="text-base font-bold text-emerald-400 mt-1">128/82</span>
          <span className="text-[9px] text-slate-500">mmHg (Normal)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate</span>
          <span className="text-base font-bold text-cyan-400 mt-1">72</span>
          <span className="text-[9px] text-slate-500">BPM (Resting)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Oxygen (SpO2)</span>
          <span className="text-base font-bold text-blue-400 mt-1">98%</span>
          <span className="text-[9px] text-slate-500">Optimum</span>
        </div>
      </div>

      {/* Daily Medication Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-cyan-400" />
            Today&apos;s Prescription Schedule
          </span>
          <span className="text-[11px] text-slate-500">Click to confirm dose</span>
        </div>

        <div className="space-y-2">
          {meds.map((med, idx) => (
            <div
              key={idx}
              onClick={() => toggleMed(idx)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                med.taken
                  ? "bg-emerald-950/20 border-emerald-800/40 text-slate-300"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    med.taken
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "border-slate-600 bg-slate-800"
                  }`}
                >
                  {med.taken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className={`text-xs font-bold ${med.taken ? "line-through text-slate-400" : "text-white"}`}>
                    {med.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{med.purpose}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{med.due}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
