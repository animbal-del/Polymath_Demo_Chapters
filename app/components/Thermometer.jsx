"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";

const SVG_H = 300;
const TUBE_TOP = 30;
const TUBE_BOT = 225;
const TUBE_LEN = TUBE_BOT - TUBE_TOP;
const T_MIN = -10, T_MAX = 10, T_RANGE = T_MAX - T_MIN;

function tempToY(t) {
  return TUBE_BOT - ((t - T_MIN) / T_RANGE) * TUBE_LEN;
}

function yToTemp(svgY) {
  const y = Math.max(TUBE_TOP, Math.min(TUBE_BOT, svgY));
  return Math.round(T_MAX - ((y - TUBE_TOP) / TUBE_LEN) * T_RANGE);
}

export default function Thermometer({ value = 10, onChange, target = 0, label = null }) {
  const svgRef = useRef(null);
  // target=null means exploration mode — no built-in completion indicator
  const isComplete = target == null ? false : (target === 0 ? value <= 0 : value <= target);
  const mercuryY = tempToY(value);
  const zeroY = tempToY(0);

  const readPointer = useCallback((clientY) => {
    const r = svgRef.current.getBoundingClientRect();
    const svgY = ((clientY - r.top) / r.height) * SVG_H;
    onChange(yToTemp(svgY));
  }, [onChange]);

  // Badge tracks mercury: SVG is 300px tall, offset 15px inside 330px container
  const badgeTop = 15 + mercuryY - 22;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative flex h-[330px] w-[150px] items-center justify-center rounded-[40px] bg-white/50 shadow-card"
        style={{ cursor: "ns-resize" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 120 ${SVG_H}`}
          className="h-[300px] w-[120px] select-none"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            readPointer(e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            readPointer(e.clientY);
          }}
        >
          {/* Track */}
          <line x1="58" x2="58" y1={TUBE_TOP} y2={TUBE_BOT}
            stroke="#E8DDCD" strokeWidth="22" strokeLinecap="round" />

          {/* Mercury */}
          <line x1="58" x2="58" y1={mercuryY} y2={TUBE_BOT}
            stroke="#ff4f3a" strokeWidth="16" strokeLinecap="round" />

          {/* Zero dashed marker */}
          <line x1="40" x2="76" y1={zeroY} y2={zeroY}
            stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="5 3" />

          {/* Ticks */}
          {[-10, -5, 0, 5, 10].map((tick) => {
            const y = tempToY(tick);
            const zero = tick === 0;
            return (
              <g key={tick}>
                <line
                  x1="70" x2={zero ? 93 : 88}
                  y1={y} y2={y}
                  stroke={zero ? "#3b82f6" : "#a8998a"}
                  strokeWidth={zero ? 3 : 2}
                />
                <text x="97" y={y + 5} fontSize="12"
                  fill={zero ? "#2563eb" : "#7c6f62"}
                  fontWeight={zero ? "800" : "600"}>
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bulb */}
          <circle cx="58" cy="242" r="34" fill="#ff4f3a" stroke="#c0392b" strokeWidth="4" />
          <circle cx="58" cy="242" r="18" fill="#ff7a62" />

          {/* Drag knob */}
          <circle cx="58" cy={mercuryY} r="13" fill="white" stroke="#ff4f3a" strokeWidth="3.5" />
          <line x1="52" x2="64" y1={mercuryY - 3} y2={mercuryY - 3} stroke="#ff4f3a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="52" x2="64" y1={mercuryY}     y2={mercuryY}     stroke="#ff4f3a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="52" x2="64" y1={mercuryY + 3} y2={mercuryY + 3} stroke="#ff4f3a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Floating temperature badge that tracks mercury */}
        <motion.div
          className="absolute pointer-events-none rounded-2xl border border-line bg-white px-4 py-2 text-2xl font-black shadow-card"
          animate={{ top: badgeTop }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{ right: "-4.5rem" }}
        >
          {value}°
        </motion.div>
      </div>

      <p className="text-sm font-black text-warm">
        {label ?? (isComplete ? "✓ +5 XP · Target reached" : target == null ? "↕ Drag up and down to explore!" : `Drag the mercury to ${target}°`)}
      </p>
    </div>
  );
}
