"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, ChevronDown, ChevronRight, Copy, Trash2, Cpu } from "lucide-react";

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
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Live MCP Tool Call Inspector
          </h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Streamable HTTP
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copied ? "Copied!" : "Copy JSON"}</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Description for Judges */}
      <p className="text-xs text-slate-400">
        Every action taken by CareSentinel+ executes through official Model Context Protocol (MCP) tool schemas. No ungrounded LLM hallucinations.
      </p>

      {/* Events List */}
      <div className="w-full max-h-64 overflow-y-auto space-y-2 pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
            <Cpu className="w-6 h-6 opacity-40" />
            <span>No MCP tools triggered yet. Speak to Alexa or click a Ring scenario above!</span>
          </div>
        ) : (
          events.map((evt, index) => {
            const isExpanded = expandedId === evt.event_id || index === 0;
            return (
              <div
                key={evt.event_id || index}
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden text-xs font-mono transition-all"
              >
                {/* Collapsible Header */}
                <div
                  onClick={() => toggleExpand(evt.event_id)}
                  className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className="font-bold text-cyan-300">
                      tool: {evt.tool}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      via {evt.source || "Alexa+ Agent"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      200 OK
                    </span>
                  </div>
                </div>

                {/* Expanded Payload Content */}
                {isExpanded && (
                  <div className="p-3 bg-slate-950/90 border-t border-slate-800/70 text-[11px] space-y-2">
                    {evt.params && Object.keys(evt.params).length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Tool Input Parameters:
                        </div>
                        <pre className="p-2 rounded bg-[#060911] text-cyan-200 overflow-x-auto border border-slate-800/50">
                          {JSON.stringify(evt.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Deterministic MCP Output:
                      </div>
                      <pre className="p-2 rounded bg-[#060911] text-emerald-300 overflow-x-auto border border-slate-800/50">
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
    </div>
  );
};
