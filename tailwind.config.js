/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Polymath exact palette
        paper:  "#F6F1E7",   // warm cream — main background
        cream:  "#FFFDF9",   // off-white — cards & panels
        ink:    "#2E2E2E",   // dark charcoal — headings
        body:   "#66615B",   // warm gray — body text
        muted:  "#9C968D",   // lighter warm gray — labels
        warm:   "#F4A340",   // orange accent — XP, highlights, active
        active: "#1F1F1F",   // black — active pills & buttons
        blue:   "#173D9B",   // interaction blue — quiz buttons
        gold:   "#F6B637",   // gold — button borders
        line:   "#E8DDD0",   // warm border
        glow:   "#42C46A",   // green — success states
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        card: "0 10px 26px rgba(60,45,25,0.07)",
        warm: "0 0 20px rgba(244,163,64,0.25)",
      },
    },
  },
  plugins: [],
};
