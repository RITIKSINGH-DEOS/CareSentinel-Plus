"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, Radio } from "lucide-react";

interface AlexaVoiceSphereProps {
  onSendMessage: (message: string) => Promise<string>;
  alexaSpeech: string;
  isProcessing: boolean;
}

export const AlexaVoiceSphere: React.FC<AlexaVoiceSphereProps> = ({
  onSendMessage,
  alexaSpeech,
  isProcessing,
}) => {
  const [isHandsFree, setIsHandsFree] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [detectedCommand, setDetectedCommand] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "alexa"; text: string }>>([
    {
      role: "alexa",
      text: "CareSentinel+ is online. Hands-free ambient voice is active. Just say 'Alexa...' anytime!"
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(true);

  // Sync refs to avoid stale closures in recognition event listeners
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  // Setup Continuous Web Speech API with Wake Word Detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          // Do not process incoming mic audio if Alexa herself is currently speaking aloud
          if (isSpeakingRef.current) return;

          let fullTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }

          const currentText = fullTranscript.trim();
          setTranscript(currentText);

          // Wake Word Detection: check for "alexa"
          const lower = currentText.toLowerCase();
          if (lower.includes("alexa")) {
            const isFinal = event.results[event.results.length - 1].isFinal;
            // Extract the intent
            setDetectedCommand(currentText);

            if (isFinal || currentText.split(" ").length >= 4) {
              handleSend(currentText);
              setTranscript("");
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === "not-allowed") {
            setIsHandsFree(false);
          }
        };

        recognition.onend = () => {
          // Automatically restart recognition in hands-free mode
          if (isHandsFreeRef.current && !isSpeakingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore if already started
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;

        // Auto-start listening on mount
        try {
          recognition.start();
        } catch (e) {
          console.log("Mic auto-start waiting for user interaction:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Text-to-Speech: Speaks Alexa's response aloud
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Zira") ||
          v.name.includes("Google US English") ||
          v.name.includes("Natural")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Resume listening automatically after speaking
        if (isHandsFreeRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (alexaSpeech) {
      speakText(alexaSpeech);
      setChatLog((prev) => {
        if (prev[prev.length - 1]?.text !== alexaSpeech) {
          return [...prev, { role: "alexa", text: alexaSpeech }];
        }
        return prev;
      });
    }
  }, [alexaSpeech]);

  const toggleHandsFree = () => {
    const nextState = !isHandsFree;
    setIsHandsFree(nextState);
    if (nextState) {
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    } else {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return;
    const userText = msg.trim();
    setTextInput("");

    setChatLog((prev) => [...prev, { role: "user", text: userText }]);
    await onSendMessage(userText);
  };

  return (
    <div className="bg-[#0D1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Header with Hands-Free Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Alexa+ Ambient Voice</h2>
        </div>

        {/* Hands-Free Mode Toggle Pill */}
        <button
          onClick={toggleHandsFree}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isHandsFree
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isHandsFree ? "animate-pulse text-cyan-400" : ""}`} />
          <span>{isHandsFree ? "Hands-Free: ON" : "Hands-Free: OFF"}</span>
        </button>
      </div>

      {/* Modern Glowing Orb & Visualizer */}
      <div className="relative w-full py-6 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/[0.04]">
        {/* Ambient Radial Glow Sphere */}
        <div
          onClick={toggleHandsFree}
          className={`cursor-pointer w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative ${
            isSpeaking
              ? "bg-gradient-to-tr from-cyan-400 to-indigo-500 scale-110 shadow-[0_0_55px_rgba(56,189,248,0.6)] animate-pulse"
              : isProcessing
              ? "bg-gradient-to-tr from-amber-400 to-indigo-600 scale-105 shadow-[0_0_40px_rgba(245,158,11,0.5)] animate-spin"
              : isListening
              ? "bg-gradient-to-tr from-cyan-500/30 to-indigo-600/40 border border-cyan-400/40 shadow-[0_0_35px_rgba(56,189,248,0.25)] animate-pulse"
              : "bg-white/[0.03] border border-white/10 opacity-70"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#070B14] flex items-center justify-center border border-white/10">
            {isListening ? (
              <Mic className="w-7 h-7 text-cyan-400 animate-pulse" />
            ) : (
              <MicOff className="w-7 h-7 text-slate-500" />
            )}
          </div>
        </div>

        {/* Dynamic Voice Status Text */}
        <div className="mt-4 text-center px-4">
          <p className="text-xs font-semibold text-white">
            {isSpeaking
              ? "Alexa is speaking..."
              : isProcessing
              ? "Processing intent via MCP Tools..."
              : isListening
              ? transcript
                ? `"${transcript}"`
                : "Continuous Listening: Just say 'Alexa, lock door' or 'Alexa, I feel dizzy'"
              : "Hands-free paused. Click orb to resume listening"}
          </p>
          {isHandsFree && (
            <p className="text-[11px] text-cyan-400/80 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Zero clicks needed • Wake word: &ldquo;Alexa&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Conversation Dialogue (Clean minimal card) */}
      <div className="w-full h-32 overflow-y-auto space-y-2 p-3 rounded-2xl bg-black/20 border border-white/[0.04] text-xs">
        {chatLog.slice(-3).map((chat, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${chat.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-3.5 py-2 rounded-2xl max-w-[90%] leading-relaxed ${
                chat.role === "user"
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-100"
                  : "bg-white/[0.04] border border-white/[0.06] text-slate-200"
              }`}
            >
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                {chat.role === "user" ? "Resident" : "Alexa+"}
              </div>
              <div>{chat.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Optional Quick Type Input Bar (Fallback) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(textInput);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or type here: 'Alexa, lock the door'..."
          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          disabled={!textInput.trim()}
          className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-cyan-400 disabled:opacity-30 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
