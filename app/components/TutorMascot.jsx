import { motion } from "framer-motion";

export default function TutorMascot({ className = "relative h-40 w-36" }) {
  return (
    <motion.div
      initial={{ y: 4 }}
      animate={{ y: [4, -5, 4] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      aria-label="AI tutor mascot"
    >
      <svg viewBox="0 0 150 170" className="h-full w-full drop-shadow-sm">
        <ellipse cx="74" cy="153" rx="44" ry="8" fill="rgba(0,0,0,0.10)" />
        <path d="M47 37 L31 8 L61 25" fill="#d7d8dc" stroke="#575b62" strokeWidth="3" />
        <path d="M103 37 L119 8 L89 25" fill="#d7d8dc" stroke="#575b62" strokeWidth="3" />
        <path d="M40 90 C40 46 108 42 113 88 C118 132 98 150 74 150 C49 150 34 129 40 90Z" fill="#9ca0a8" stroke="#4e525a" strokeWidth="4" />
        <path d="M54 91 C57 71 94 70 99 91 C104 118 93 139 75 140 C56 139 48 118 54 91Z" fill="#f7f7f5" />
        <circle cx="62" cy="73" r="10" fill="white" />
        <circle cx="90" cy="73" r="10" fill="white" />
        <circle cx="64" cy="75" r="3.2" fill="#222" />
        <circle cx="88" cy="75" r="3.2" fill="#222" />
        <path d="M72 87 Q77 93 83 87" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
        <circle cx="51" cy="90" r="5" fill="#ffc8d5" opacity="0.8" />
        <circle cx="101" cy="90" r="5" fill="#ffc8d5" opacity="0.8" />
        <path d="M112 102 C129 96 139 98 145 104 C130 107 120 114 112 121Z" fill="#363946" />
        <path d="M33 103 C21 105 15 111 14 122 C24 117 32 115 39 117" fill="#363946" />
        <path d="M39 33 Q75 20 110 34" fill="none" stroke="#6a6d75" strokeWidth="3" />
        <path d="M36 17 L47 30 L32 31" fill="#ffb1c2" opacity="0.85" />
        <path d="M114 17 L103 30 L118 31" fill="#ffb1c2" opacity="0.85" />
      </svg>
    </motion.div>
  );
}
