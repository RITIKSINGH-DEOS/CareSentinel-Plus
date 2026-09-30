"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, ChevronDown, ChevronUp, Copy, Trash2, Cpu } from "lucide-react";

export interface MCPEvent {
  event_id: string;
  tool: string;
  params: any;
  result: any;
  source: string;
}

interface MCPInspectorProps {
  events: MCPEvent[];
  onClear: () => void;
}

export const MCPInspector: React.FC<MCPInspectorProps> = ({ events, onClear }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Model Context Protocol (MCP) Inspector
          </h2>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
            {events.length} Tool Calls Logged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isOpen ? "Collapse" : "Expand"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="w-full max-h-56 overflow-y-auto space-y-2 pr-1">
          {events.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Cpu className="w-5 h-5 opacity-40" />
              <span>No tools executed yet. Speak to Alexa or click a scenario to view real-time MCP tool executions.</span>
            </div>
          ) : (
            events.map((evt, index) => {
              const isExpanded = expandedId === evt.event_id || index === 0;
              return (
                <div
                  key={evt.event_id || index}
                  className="bg-black/30 border border-white/[0.04] rounded-2xl overflow-hidden text-xs font-mono transition-all"
                >
                  <div
                    onClick={() => toggleExpand(evt.event_id)}
                    className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cyan-400">tool: {evt.tool}</span>
                      <span className="text-[11px] text-slate-400 font-sans">via {evt.source}</span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      200 OK
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 bg-black/50 border-t border-white/[0.04] text-[11px] space-y-2">
                      {evt.params && Object.keys(evt.params).length > 0 && (
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-sans">
                            Input Parameters:
                          </div>
                          <pre className="p-2.5 rounded-xl bg-black/60 text-cyan-300 overflow-x-auto border border-white/[0.04]">
                            {JSON.stringify(evt.params, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-sans">
                          Deterministic Output:
                        </div>
                        <pre className="p-2.5 rounded-xl bg-black/60 text-emerald-300 overflow-x-auto border border-white/[0.04]">
                          {JSON.stringify(evt.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
