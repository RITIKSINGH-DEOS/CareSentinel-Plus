"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle } from "lucide-react";

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
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "alexa"; text: string }>>([
    {
      role: "alexa",
      text: "CareSentinel+ is online. The front door is monitored, and emergency dispatch is standing by. You can speak to me naturally."
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

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Text-to-Speech: Speaks Alexa's response aloud
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Pick natural female voice if available
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

  // Trigger speech whenever alexaSpeech updates
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

  // Handle Speech Recognition finish
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
    const reply = await onSendMessage(userText);
  };

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Alexa+ Ambient Voice Core</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            MCP Active
          </span>
        </div>
      </div>

      {/* Visual Animated Alexa Pulsing Sphere & Soundbars */}
      <div className="relative w-full py-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/60 to-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Glowing Aura */}
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative ${
            isListening
              ? "bg-gradient-to-tr from-cyan-400 to-blue-600 scale-110 glow-cyan animate-pulse"
              : isProcessing
              ? "bg-gradient-to-tr from-amber-400 to-orange-600 scale-105 animate-spin"
              : "bg-gradient-to-tr from-cyan-600/70 to-blue-900/60"
          }`}
        >
          {/* Inner Core */}
          <div className="w-20 h-20 rounded-full bg-[#070B14] flex items-center justify-center border border-cyan-500/40">
            <Mic
              className={`w-9 h-9 transition-colors ${
                isListening ? "text-cyan-400 animate-bounce" : "text-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Waveform Sound Bars */}
        <div className="flex items-center gap-1.5 mt-5 h-8">
          {[40, 70, 100, 60, 90, 45, 80, 50, 95, 60].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                isListening || isProcessing
                  ? "bg-cyan-400 animate-wave"
                  : "bg-slate-700 h-2"
              }`}
              style={{
                height: isListening ? `${h}%` : "6px",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Dynamic Voice Status Text */}
        <p className="text-xs font-semibold text-slate-300 mt-3 text-center px-4">
          {isListening
            ? transcript || "Listening to your voice... Speak now"
            : isProcessing
            ? "Alexa+ reasoning via MCP Tools..."
            : "Tap mic or speak: 'Alexa, lock door' or 'Alexa, I feel dizzy'"}
        </p>
      </div>

      {/* Conversation Dialogue Log (Scrollable) */}
      <div className="w-full h-36 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-900 text-xs font-sans">
        {chatLog.map((chat, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              chat.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                chat.role === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60"
              }`}
            >
              <div className="text-[10px] font-bold opacity-70 mb-0.5">
                {chat.role === "user" ? "Resident (Voice/Text)" : "Alexa+ Ambient Companion"}
              </div>
              <div>{chat.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Voice Mic Button & Quick Typing Box */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 ${
            isListening
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
              : "bg-cyan-600 hover:bg-cyan-500 text-white glow-cyan"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>STOP LISTENING</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>TALK TO ALEXA+</span>
            </>
          )}
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
            placeholder="Or type a test command (e.g. 'lock the door')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
