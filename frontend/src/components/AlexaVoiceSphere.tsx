"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";

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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "alexa"; text: string }>>([
    {
      role: "alexa",
      text: "CareSentinel+ is online. You can speak to me naturally, or ask to secure the door."
    }
  ]);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setTranscript(currentTranscript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleSend(transcript);
      }
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Could not start recognition:", e);
      }
    }
  };

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return;
    const userText = msg.trim();
    setTextInput("");
    setTranscript("");

    setChatLog((prev) => [...prev, { role: "user", text: userText }]);
    await onSendMessage(userText);
  };

  return (
    <div className="bg-[#0D1322] border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Alexa+ Ambient Voice</h2>
        </div>
        <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
          MCP Tools Connected
        </span>
      </div>

      {/* Modern Glowing Orb & Visualizer */}
      <div className="relative w-full py-6 flex flex-col items-center justify-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/[0.04]">
        {/* Ambient Radial Glow */}
        <div
          onClick={toggleListening}
          className={`cursor-pointer w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative ${
            isListening
              ? "bg-gradient-to-tr from-cyan-400 to-indigo-500 scale-110 shadow-[0_0_50px_rgba(56,189,248,0.5)] animate-pulse"
              : isProcessing
              ? "bg-gradient-to-tr from-amber-400 to-indigo-600 scale-105 shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-spin"
              : "bg-gradient-to-tr from-cyan-500/20 to-indigo-600/30 hover:scale-105 border border-cyan-500/30 shadow-[0_0_30px_rgba(56,189,248,0.15)]"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#070B14] flex items-center justify-center border border-white/10">
            <Mic className={`w-7 h-7 transition-colors ${isListening ? "text-cyan-400" : "text-slate-300"}`} />
          </div>
        </div>

        {/* Dynamic Voice Status */}
        <p className="text-xs font-medium text-slate-300 mt-4 text-center px-4">
          {isListening
            ? transcript || "Listening to your voice..."
            : isProcessing
            ? "Executing MCP Tools..."
            : "Tap to speak with Alexa+"}
        </p>
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

      {/* Voice Trigger Button & Input Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs flex items-center gap-2 transition-all shadow-md shrink-0 ${
            isListening
              ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? "Stop" : "Speak"}</span>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(textInput);
          }}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type 'lock the door' or 'I feel dizzy'..."
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
    </div>
  );
};
