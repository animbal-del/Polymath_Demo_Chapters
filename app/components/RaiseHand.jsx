"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Shared recognition logic
function useVoiceRecognition(onResult) {
  const [phase, setPhase] = useState("idle"); // idle | listening | done
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  function toggle(onDone) {
    if (phase === "listening") {
      recRef.current?.stop();
      setPhase("idle");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      const q = window.prompt("Type your question for Nova:");
      if (q?.trim()) {
        setTranscript(q.trim());
        setPhase("done");
        onResult(q.trim());
        setTimeout(() => { setPhase("idle"); setTranscript(""); }, 7000);
      }
      return;
    }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setPhase("listening");
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setPhase("done");
      onResult(text);
      setTimeout(() => { setPhase("idle"); setTranscript(""); }, 7000);
    };
    rec.onerror  = () => setPhase("idle");
    rec.onend    = () => setPhase(p => p === "listening" ? "idle" : p);
    rec.start();
  }

  return { phase, transcript, toggle };
}

// ── Floating variant — fixed bottom-right, always accessible ─────────────────
export function FloatingRaiseHand({ onQuestion, disabled }) {
  const { phase, transcript, toggle } = useVoiceRecognition(onQuestion);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      {/* Transcript toast */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="max-w-[200px] rounded-2xl border px-4 py-3 text-xs shadow-card"
            style={{ background: "#FFFDF9", borderColor: "#E8DDD0", color: "#66615B" }}
          >
            <p className="mb-1 text-[9px] font-black uppercase tracking-wider" style={{ color: "#9C968D" }}>
              You asked:
            </p>
            <p className="font-semibold leading-5">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The button */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {/* Pulse ring when listening */}
          {phase === "listening" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "#DC3232" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          )}
          <motion.button
            onClick={() => !disabled && toggle(onQuestion)}
            whileHover={{ scale: disabled ? 1 : 1.07 }}
            whileTap={{ scale: 0.93 }}
            disabled={disabled && phase === "idle"}
            className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{
              background: phase === "listening" ? "#DC3232" : "#F4A340",
              boxShadow: phase === "listening"
                ? "0 0 0 3px rgba(220,50,50,0.2), 0 8px 24px rgba(220,50,50,0.3)"
                : "0 8px 24px rgba(244,163,64,0.45), 0 2px 8px rgba(0,0,0,0.08)",
              opacity: disabled && phase === "idle" ? 0.5 : 1,
            }}
            title={phase === "listening" ? "Tap to stop" : "Ask Nova anything"}
          >
            {phase === "listening" ? "🎤" : "✋"}
          </motion.button>
        </div>
        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#9C968D" }}>
          {phase === "listening" ? "listening…" : "Ask Nova"}
        </p>
      </div>
    </div>
  );
}

// ── Inline variant (kept for backward-compat, not currently used) ─────────────
export default function RaiseHand({ onQuestion, disabled }) {
  const { phase, transcript, toggle } = useVoiceRecognition(onQuestion);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={() => !disabled && toggle(onQuestion)}
        disabled={disabled && phase === "idle"}
        whileHover={{ scale: phase === "idle" ? 1.04 : 1 }}
        whileTap={{ scale: 0.96 }}
        className={`relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black shadow-card transition disabled:opacity-40 ${
          phase === "listening" ? "bg-red-500 text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
        }`}
      >
        {phase === "listening" && (
          <motion.span
            className="absolute inset-0 rounded-full bg-red-400"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
        )}
        <span className="relative z-10">
          {phase === "listening" ? "🎤 Listening… tap to stop" : "✋ Ask Nova"}
        </span>
      </motion.button>

      <AnimatePresence>
        {transcript && (
          <motion.p
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-xs text-center text-xs font-semibold text-neutral-400"
          >
            You asked: <span className="font-bold text-ink">"{transcript}"</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
