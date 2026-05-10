"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, VolumeX, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import Logo from "./components/Logo";
import TutorMascot from "./components/TutorMascot";
import SpeechBubble from "./components/SpeechBubble";
import Thermometer from "./components/Thermometer";
import { FloatingRaiseHand } from "./components/RaiseHand";

// ── Voice cache ───────────────────────────────────────────────────────────────
let _voice = null;
function pickVoice() {
  if (_voice) return _voice;
  if (typeof window === "undefined") return null;
  const vs = window.speechSynthesis.getVoices();
  const prefer = ["Samantha","Karen","Moira","Google US English","Microsoft Aria Online"];
  _voice = vs.find(v => prefer.some(p => v.name.includes(p)))
    ?? vs.find(v => v.lang.startsWith("en") && v.localService)
    ?? vs.find(v => v.lang.startsWith("en")) ?? null;
  return _voice;
}

// Client-side audio cache — persists between renders, cleared on page refresh.
// Same text = instant playback after first fetch.
const AUDIO_CACHE = new Map(); // text → ArrayBuffer

// ── Scenes — Grade 2, 6 chapters ─────────────────────────────────────────────
// screenText → shown in bubble (short). spokenText → Nova's voice (warm, full).
// ── Scenes — (defined below with full dialogues) ─────────────────────────────
const SCENES = [
  {
    id:"intro",   pill:"01 · THERMOMETER", eyebrow:"CHAPTER 1 · MEET THE THERMOMETER",
    title:"What does a thermometer do? 🌡️",
    screenText:"Drag it UP ☀️ then DOWN ❄️ to explore!",
    spokenText:"Hi! I'm Nova! Today we're going to discover something amazing — thermometers! A thermometer uses numbers to show us how hot or cold something is. See that red bar? Drag it UP and the number gets BIGGER — that means HOT! Drag it DOWN and the number gets SMALLER — that means COLD! Try going up... and then all the way down!",
    debrief:"You explored the thermometer! 🌡️",
    debriefSpoken:"Brilliant! You figured out the big rule: UP means HOT — bigger numbers! DOWN means COLD — smaller numbers! Thermometers talk to us using numbers. Now Pip the penguin needs your help with something very exciting...",
  },
  {
    id:"freeze",  pill:"02 · FREEZING",    eyebrow:"CHAPTER 2 · THE MAGIC NUMBER",
    title:"There's a magic number that makes ice! ❄️",
    screenText:"Find the magic number — drag to ZERO!",
    spokenText:"Pip the penguin wants to build a snowman! But he can only do that if it's cold enough to make ice. There's a very special number called the FREEZING POINT. When the thermometer reaches this number, water turns into ice! That magic number is... ZERO! Can you drag the thermometer all the way down to zero?",
    debrief:"ZERO! The freezing point! 🧊",
    debriefSpoken:"Zero degrees — the FREEZING POINT! Right at zero, water becomes ice! That's why your freezer is kept at zero or colder. But here's a secret — numbers don't stop at zero. They keep going lower, into a mysterious place called... negative numbers! Want to see?",
  },
  {
    id:"below",   pill:"03 · BELOW ZERO",  eyebrow:"CHAPTER 3 · THE MINUS WORLD",
    title:"Numbers go below zero — with a minus sign! 🥶",
    screenText:"Go past zero — keep dragging to MINUS 3!",
    spokenText:"Zero is not the end of numbers! When it gets even colder, numbers keep going DOWN — but now they get a tiny minus sign in front! Minus one. Minus two. MINUS THREE! We call these NEGATIVE numbers. They live below zero. Pip needs his warmest scarf in minus three weather! Can you drag all the way there?",
    debrief:"MINUS 3°! Negative numbers are real! 🌨️",
    debriefSpoken:"Minus three degrees! You went BELOW zero! Did you see that minus sign in front of the three? That's how we write temperatures colder than freezing. Scientists, weather forecasters, doctors — everyone uses negative numbers! You just discovered one of the most important ideas in all of mathematics!",
  },
  {
    id:"numline", pill:"04 · NUMBER LINE", eyebrow:"CHAPTER 4 · THE NUMBER LINE",
    title:"Numbers go both ways — left AND right! 🔵🔴",
    screenText:"Three quick questions — click the right number!",
    spokenText:"Look at this special line! It shows ALL temperatures in order. Zero sits right in the MIDDLE. Numbers to the LEFT of zero have minus signs — those are COLD — NEGATIVE numbers! Numbers to the RIGHT of zero are WARM — POSITIVE numbers! I have three quick questions for you. Ready? Let's go!",
    debrief:"You know the number line! 🌟",
    debriefSpoken:"You've got it! Negative numbers — with minus signs — are to the LEFT of zero. Positive numbers are to the RIGHT. Zero is the freezing point right in the middle. This number line is like a map for every temperature in the universe! Scientists use it every single day!",
  },
  {
    id:"walk",    pill:"05 · PENGUIN WALK",eyebrow:"CHAPTER 5 · PIP'S WALK HOME",
    title:"Help Pip walk from cold to warm! 🐧",
    screenText:"Press WARMER 3 times — one step at a time!",
    spokenText:"Poor Pip is stuck at minus two — very cold! His friends are waiting at positive one, just THREE steps to the right. On the number line, going RIGHT means getting WARMER — that's the same as ADDING! Each press of Warmer is one step right, one more degree warm. Help Pip take three steps to the warm side!",
    debrief:"Pip made it! −2 + 3 = 1! 🐧",
    debriefSpoken:"Pip found his friends! You moved from minus two to positive one by taking three steps to the right. Minus two PLUS three equals positive ONE! Moving right on the number line is the same as ADDING! You started below zero and jumped above zero — you can add with negative numbers now!",
  },
  {
    id:"boss",    pill:"06 · BIG QUESTION",eyebrow:"PIP'S FINAL QUESTION 🌟",
    title:"Can you solve the Temperature Trap? 🐧",
    screenText:"It's −1°. It warms up 2°. What temperature now?",
    spokenText:"Last challenge — and Pip is counting on you! It is minus one degree outside. Then the sun comes out and warms things up by two degrees! Remember — warming up means moving RIGHT on the number line. Start at minus one... one step right brings you to zero... one more step brings you to... what? Type your answer in the box!",
    debrief:"1°! You solved the Temperature Trap! 🎊",
    debriefSpoken:"ONE DEGREE! Minus one plus two equals positive one! You started BELOW zero and jumped all the way ABOVE zero! You've completely mastered negative numbers. You know what they are, where they live, and how to add them. Pip says thank you — and I am SO proud of you! You were absolutely AMAZING!",
  },
];

// ── Chapter summaries — shown after each scene completes ─────────────────────
const SUMMARIES = {
  intro:   { emoji:"🌡️", title:"Thermometers measure temperature", points:["Numbers go UP when hotter, DOWN when colder","The red bar shows the current temperature","We use numbers to describe exactly how hot or cold something is"] },
  freeze:  { emoji:"❄️", title:"Zero is the freezing point", points:["0° is the exact temperature where water turns to ice","Below zero = colder than the freezing point","Zero is not the end of numbers — they keep going lower!"] },
  below:   { emoji:"🥶", title:"Negative numbers live below zero", points:["A minus sign (−) in front means below zero","−3° means 3 whole degrees colder than freezing","These are called NEGATIVE numbers — they are real and useful!"] },
  numline: { emoji:"📏", title:"The number line has two sides", points:["Zero is in the MIDDLE of the number line","Cold (negative) numbers are to the LEFT of zero","Warm (positive) numbers are to the RIGHT of zero"] },
  walk:    { emoji:"🐧", title:"Moving right means getting warmer", points:["RIGHT on the number line = warmer = adding","LEFT = colder = subtracting","From −2, take 3 steps right → −1, 0, +1"] },
  boss:    { emoji:"🌟", title:"You can add negative numbers!", points:["−1 + 2 = 1  (start below zero, end above!)","Adding always means moving RIGHT on the number line","Negative numbers + positive numbers cross the zero line"] },
};

// ── Confetti ──────────────────────────────────────────────────────────────────
const burstSmall = () => confetti({ particleCount:60,  spread:55, origin:{y:0.6}, colors:["#34d399","#f97316","#60a5fa"] });
const burstBig   = () => confetti({ particleCount:140, spread:80, origin:{y:0.5}, colors:["#fbbf24","#34d399","#f97316","#60a5fa","#a78bfa"] });

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [mode, setMode] = useState("library");
  const [scene, setScene] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [narrating, setNarrating] = useState(true);
  const [audioStatus, setAudioStatus] = useState("idle"); // "idle" | "loading" | "playing"
  const [tutorText, setTutorText] = useState(SCENES[0].screenText);
  const [thinking, setThinking] = useState(false);
  const [completeScenes, setCompleteScenes] = useState({});
  const [lastAction, setLastAction] = useState("");
  const [xpPops, setXpPops] = useState([]);
  const [flash, setFlash] = useState(false);

  // Scene 0 — intro thermometer. Start at 5° (mid) so user can drag both UP and DOWN.
  const [temp, setTemp] = useState(5);
  const [explored, setExplored] = useState(false); // dragged enough to count

  // Scene 1 — freezing point
  const [freezeTemp, setFreezeTemp] = useState(10);

  // Scene 2 — below zero
  const [coldTemp, setColdTemp] = useState(0);

  // Scene 3 — number line quiz
  const [nlStep, setNlStep] = useState(0);   // 0,1,2 (three questions)

  // Scene 4 — penguin walk
  const [walkPos, setWalkPos] = useState(-2); // start at -2, target +1

  // Scene 5 — boss
  const [bossAnswer, setBossAnswer] = useState("");

  const [achievement, setAchievement] = useState(null);
  const celebrated  = useRef(new Set());
  const audioRef    = useRef(null);
  const speakId     = useRef(0);
  const onAudioEnd  = useRef(null);
  const sawHotRef      = useRef(false); // scene 0: explored hot side
  const sawColdRef     = useRef(false); // scene 0: explored cold side
  const sawProximityRef= useRef(false); // scene 1: "almost at zero" dedup
  const sawBelowZeroRef= useRef(false); // scene 2: first crossing below 0 dedup
  const sawStep1Ref    = useRef(false); // scene 4: first step feedback

  const CHAPTER_ACHIEVEMENTS = {
    intro:"🌡️",freeze:"❄️",below:"🥶",numline:"📏",walk:"🐧",boss:"🌟"
  };
  function showAchievement(id){
    const emoji=CHAPTER_ACHIEVEMENTS[id]||"⭐";
    const text=SCENES.find(s=>s.id===id)?.debrief||"Chapter Complete!";
    setAchievement({emoji,text:text.replace(/[🧊🌨️🐧🎊🌡️🌟]/g,"").trim()});
    setTimeout(()=>setAchievement(null),2800);
  }
  const burstStars=()=>confetti({particleCount:70,spread:90,origin:{y:0.45},shapes:['star'],colors:['#f97316','#fbbf24','#fff','#34d399'],scalar:1.5});

  const isSceneComplete = useMemo(() => {
    if (scene === 0) return explored;
    if (scene === 1) return freezeTemp <= 0;
    if (scene === 2) return coldTemp <= -3;
    if (scene === 3) return nlStep >= 3;
    if (scene === 4) return walkPos === 1;
    if (scene === 5) return Number(bossAnswer) === 1;
    return false;
  }, [scene, explored, freezeTemp, coldTemp, nlStep, walkPos, bossAnswer]);

  const maxUnlocked = Math.max(scene, ...Object.keys(completeScenes).map(Number), 0);

  // ── Gamification ────────────────────────────────────────────────────────────
  function popXP(amount) {
    const id = Date.now() + Math.random();
    setXpPops(p => [...p, { id, amount }]);
    setTimeout(() => setXpPops(p => p.filter(x => x.id !== id)), 1700);
  }
  const triggerFlash = () => { setFlash(true); setTimeout(() => setFlash(false), 700); };

  // ── Voice with client-side cache + status tracking ───────────────────────────
  async function speak(text) {
    const myId = ++speakId.current;
    if (!narrating || !text || typeof window === "undefined") return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();

    setAudioStatus("loading");

    try {
      let buffer;
      if (AUDIO_CACHE.has(text)) {
        buffer = AUDIO_CACHE.get(text);
      } else {
        const res = await fetch("/api/speak", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (myId !== speakId.current) { setAudioStatus("idle"); return; }
        if (!res.ok) throw new Error();
        buffer = await res.arrayBuffer();
        if (myId !== speakId.current) { setAudioStatus("idle"); return; }
        AUDIO_CACHE.set(text, buffer);
      }
      if (myId !== speakId.current) { setAudioStatus("idle"); return; }
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url  = URL.createObjectURL(blob);
      const aud  = new Audio(url);
      audioRef.current = aud;
      aud.addEventListener("play",  () => setAudioStatus("playing"));
      aud.addEventListener("ended", () => {
        setAudioStatus("idle"); URL.revokeObjectURL(url);
        const cb=onAudioEnd.current; onAudioEnd.current=null; cb?.();
      });
      aud.addEventListener("error", () => {
        setAudioStatus("idle");
        const cb=onAudioEnd.current; onAudioEnd.current=null; cb?.();
      });
      aud.play();
      return;
    } catch { /* fall through to browser TTS */ }

    if (myId !== speakId.current) { setAudioStatus("idle"); return; }
    if (!window.speechSynthesis) { setAudioStatus("idle"); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.80; utt.pitch = 1.14; utt.volume = 1;
    utt.onstart = () => setAudioStatus("playing");
    utt.onend   = () => { setAudioStatus("idle"); const cb=onAudioEnd.current; onAudioEnd.current=null; cb?.(); };
    utt.onerror = () => { setAudioStatus("idle"); const cb=onAudioEnd.current; onAudioEnd.current=null; cb?.(); };
    const go = () => { utt.voice = pickVoice(); window.speechSynthesis.speak(utt); };
    window.speechSynthesis.getVoices().length > 0 ? go()
      : window.speechSynthesis.addEventListener("voiceschanged", go, { once: true });
  }

  // Screen shows short text. Nova speaks the full warm version.
  function setTutor(screenText, spokenText) {
    setTutorText(screenText);
    speak(spokenText ?? screenText);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function startLesson() {
    setMode("lesson");
    setScene(0);
    setTutor(SCENES[0].screenText, SCENES[0].spokenText);
  }

  function nextScene() {
    if (!isSceneComplete) return;
    const firstTime = !completeScenes[scene];
    if (firstTime) { setXp(v => v + 5); setStreak(v => v + 1); popXP(5); burstBig(); }
    setCompleteScenes(old => ({ ...old, [scene]: true }));
    if (scene < SCENES.length - 1) {
      const next = scene + 1;
      setScene(next);
      setLastAction("");
      // Reset per-scene dedup refs for the new scene
      sawProximityRef.current = false;
      sawBelowZeroRef.current = false;
      sawStep1Ref.current = false;
      setTutor(SCENES[next].screenText, SCENES[next].spokenText);
    } else {
      burstStars();
      setAchievement({emoji:"🎓",text:"All Chapters Complete!"});
      setTimeout(()=>setAchievement(null),2800);
      setTutor("You finished every chapter! Pip is so happy! 🐧🎉",
               "You finished every chapter! You learned all about negative numbers today. Zero is the freezing point. Numbers below zero are negative — they have a minus sign! And you can even add them! Pip the penguin says thank you. You are AMAZING!");
    }
  }

  function reset() {
    setScene(0); setXp(0); setStreak(0);
    setTemp(5); setExplored(false); setFreezeTemp(10);
    setColdTemp(0); setNlStep(0); setWalkPos(-2); setBossAnswer("");
    setCompleteScenes({}); setLastAction(""); celebrated.current = new Set();
    sawHotRef.current = false; sawColdRef.current = false;
    sawProximityRef.current = false; sawBelowZeroRef.current = false; sawStep1Ref.current = false;
    setTutor(SCENES[0].screenText, SCENES[0].spokenText);
  }

  async function askTutor(payload) {
    setThinking(true);
    try {
      const res  = await fetch("/api/tutor", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data = await res.json();
      setTutor(data.message, data.message);
    } catch {
      const msg = "Hmm, let me think of a better way to explain!";
      setTutor(msg, msg);
    } finally { setThinking(false); }
  }

  function celebrate(key, sceneId) {
    if (celebrated.current.has(key)) return;
    celebrated.current.add(key);
    burstSmall(); triggerFlash();
    showAchievement(sceneId);
    const s = SCENES.find(x => x.id === sceneId);
    if (s) setTutor(s.debrief, s.debriefSpoken);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (mode === "library") return <LibraryScreen onStart={startLesson} />;

  return (
    <main className="min-h-screen bg-paper text-ink">

      {/* Achievement banner */}
      <AnimatePresence>
        {achievement&&(
          <motion.div
            initial={{y:-90,opacity:0,scale:0.9}} animate={{y:0,opacity:1,scale:1}} exit={{y:-90,opacity:0,scale:0.9}}
            transition={{type:"spring",stiffness:320,damping:26}}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border px-6 py-3"
            style={{background:"#FFFDF9",borderColor:"#F4A340",boxShadow:"0 8px 40px rgba(244,163,64,0.45)",whiteSpace:"nowrap"}}>
            <span className="text-2xl">{achievement.emoji}</span>
            <span className="text-sm font-black" style={{color:"#2E2E2E"}}>{achievement.text}</span>
            <span className="text-2xl">{achievement.emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP pops */}
      {xpPops.map(({ id, amount }) => (
        <motion.div key={id} className="fixed left-1/2 top-[42%] z-50 -translate-x-1/2 pointer-events-none select-none text-center"
          initial={{ opacity:1, y:0, scale:0.5 }} animate={{ opacity:0, y:-110, scale:1.6 }}
          transition={{ duration:1.5, ease:[0,0.9,1,1] }}>
          <span className="block text-5xl font-black text-yellow-500 drop-shadow-lg">+{amount} XP</span>
          <span className="text-3xl">⭐</span>
        </motion.div>
      ))}

      {/* Green flash */}
      <AnimatePresence>
        {flash && (
          <motion.div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}
            style={{ background:"rgba(52,211,153,0.08)" }}>
            <motion.span className="text-9xl font-black text-emerald-500 select-none drop-shadow-lg"
              initial={{ scale:0.3, opacity:1 }} animate={{ scale:1.1, opacity:0 }} transition={{ duration:0.6 }}>✓</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative border-b border-line bg-cream/80 backdrop-blur">
        <div className="flex h-[74px] items-center justify-between px-7">
          <button onClick={() => {
            // Stop any playing or loading audio before leaving
            speakId.current++;
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            window.speechSynthesis?.cancel();
            setAudioStatus("idle");
            onAudioEnd.current = null;
            setMode("library");
          }} className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-ink transition">
            <ArrowLeft size={16}/> Library
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-muted">LESSON</span>
            <span className="ml-3 font-display text-lg text-ink">Pip's Winter Adventure 🐧</span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {streak >= 2 && (
                <motion.span key={`s${streak}`} initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black text-white"
                  style={{ background:"#E07A20", boxShadow:"0 0 10px rgba(224,122,32,0.4)" }}>
                  🔥 {streak} streak
                </motion.span>
              )}
            </AnimatePresence>
            <motion.span key={xp} initial={{ scale:1.35 }} animate={{ scale:1 }}
              transition={{ type:"spring", stiffness:400, damping:18 }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black"
              style={{ background:"rgba(244,163,64,0.10)", border:"1px solid rgba(244,163,64,0.35)", color:"#C47D0A" }}>
              <Zap size={16}/> {xp} XP
            </motion.span>
            {/* Audio status indicator */}
            <AnimatePresence>
              {narrating && audioStatus !== "idle" && (
                <motion.div
                  initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.85 }}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background:   audioStatus === "loading" ? "rgba(251,191,36,0.10)" : "rgba(66,196,106,0.10)",
                    borderColor:  audioStatus === "loading" ? "rgba(251,191,36,0.40)" : "rgba(66,196,106,0.40)",
                    color:        audioStatus === "loading" ? "#B45309" : "#16A34A",
                  }}>
                  {audioStatus === "loading" ? (
                    <>
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-yellow-500"
                        animate={{ opacity:[1,0.3,1] }} transition={{ repeat:Infinity, duration:0.8 }}/>
                      Generating…
                    </>
                  ) : (
                    <>
                      <span className="flex items-end gap-0.5" style={{ height:14 }}>
                        {[0, 0.18, 0.09].map((d,i) => (
                          <motion.span key={i} className="w-1 rounded-full bg-emerald-500"
                            animate={{ height:["3px","11px","3px"] }}
                            transition={{ repeat:Infinity, duration:0.75, delay:d }}/>
                        ))}
                      </span>
                      Playing
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={reset} className="rounded-full bg-cream p-3 shadow-soft border border-line">
              <RotateCcw size={16} className="text-body"/>
            </button>
            <button
              onClick={() => {
                setNarrating(v => !v);
                // cancel audio when muting
                if (narrating) {
                  if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
                  window.speechSynthesis?.cancel();
                  setAudioStatus("idle");
                }
              }}
              className={`rounded-full p-3 shadow-soft border transition ${narrating ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-600" : "border-line bg-cream text-muted"}`}>
              {narrating ? <Volume2 size={16}/> : <VolumeX size={16}/>}
            </button>
          </div>
        </div>
        {/* XP bar */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-line">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400"
            animate={{ width:`${Math.min((xp/30)*100,100)}%` }} transition={{ duration:0.6 }}/>
        </div>
      </div>

      {/* Scene pills */}
      <div className="border-b border-line py-3.5 bg-cream/50">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 px-6">
          {SCENES.map((s, i) => {
            const unlocked = i <= maxUnlocked, done = !!completeScenes[i];
            return (
              <button key={s.id} onClick={() => unlocked && setScene(i)} disabled={!unlocked}
                className="rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] transition"
                style={{ background:scene===i?"#1F1F1F":done?"rgba(66,196,106,0.10)":"#FFFDF9",
                  color:scene===i?"#fff":done?"#42C46A":unlocked?"#66615B":"#9C968D",
                  borderColor:scene===i?"#1F1F1F":done?"#42C46A":unlocked?"#E8DDD0":"transparent",
                  opacity:!unlocked?0.4:1, cursor:!unlocked?"not-allowed":"pointer" }}>
                {done ? "✓ " : ""}{s.pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <section className="min-h-[calc(100vh-178px)] px-6 pb-28 pt-10">
        <AnimatePresence mode="wait">
          <motion.div key={scene}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-12 }} transition={{ duration:0.32 }}
            className="mx-auto max-w-6xl">

            {/* Single-column layout for Grade 2: Nova is compact guide, widget dominates */}
            <div className="flex flex-col items-center gap-6 mx-auto max-w-2xl w-full">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.5em] text-warm">{SCENES[scene].eyebrow}</p>
                <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.02em] text-ink md:text-4xl">{SCENES[scene].title}</h1>
              </div>

              {/* Nova — compact horizontal strip, not competing with the widget */}
              <div className="flex items-center gap-3 w-full rounded-2xl border px-4 py-3"
                style={{ background:"#FFFDF9", borderColor:"#E8DDD0", boxShadow:"0 4px 16px rgba(0,0,0,0.04)", minHeight:"68px" }}>
                <div className="shrink-0 overflow-hidden" style={{ width:56, height:56, transform:"scale(0.6)", transformOrigin:"center" }}>
                  <TutorMascot/>
                </div>
                <div className="flex-1">
                  {thinking ? (
                    <span className="flex items-center gap-2 italic" style={{ color:"#9C968D", fontSize:13 }}>
                      <span className="inline-flex gap-1">
                        {[0,0.15,0.3].map(d => (
                          <motion.span key={d} className="inline-block h-1.5 w-1.5 rounded-full" style={{ background:"#9C968D" }}
                            animate={{ y:[-3,0,-3] }} transition={{ repeat:Infinity, duration:0.8, delay:d }}/>
                        ))}
                      </span>
                      Nova is thinking…
                    </span>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.p key={tutorText} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0 }} transition={{ duration:0.22 }}
                        className="text-sm font-semibold leading-6" style={{ color:"#66615B" }}>
                        {tutorText}
                      </motion.p>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Widget — full-width, the star of the show */}
              <div className="flex flex-col items-center gap-5 w-full">
                {scene === 0 && (
                  // target=null = exploration mode, no built-in completion indicator
                  <Thermometer value={temp} target={null}
                    label={
                      sawHotRef.current && sawColdRef.current
                        ? "✓ You found both! Hot and cold!"
                        : sawHotRef.current
                        ? "Hot found! ☀️ Now drag all the way DOWN ❄️"
                        : sawColdRef.current
                        ? "Cold found! ❄️ Now drag all the way UP ☀️"
                        : "Drag UP ☀️ for hot — then DOWN ❄️ for cold!"
                    }
                    onChange={v => {
                      setTemp(v);
                      // Hot milestone — drag UP past 8° (thermometer max is 10°)
                      if (v >= 8 && !sawHotRef.current) {
                        sawHotRef.current = true;
                        setTutor("HOT! ☀️ Big numbers mean HOT!", "Wow, that's hot! See how the number went UP? Big numbers mean HOT — like a summer day outside! Now try dragging it all the way DOWN to find the cold side!");
                      }
                      // Cold milestone — drag DOWN to 2° or below (clear cold, no negatives yet)
                      if (v <= 2 && !sawColdRef.current) {
                        sawColdRef.current = true;
                        setTutor("COLD! ❄️ Small numbers mean COLD!", "Brrr, so cold! The number went DOWN — small numbers mean COLD, like a winter morning! You've discovered both sides — you're already a thermometer expert!");
                      }
                      // Complete only when BOTH hot AND cold have been explored
                      // Complete when BOTH sides explored
                      if (!explored && sawHotRef.current && sawColdRef.current) {
                        setExplored(true);
                        celebrate("intro","intro");
                      }
                    }}/>
                )}
                {scene === 1 && (
                  <Thermometer value={freezeTemp} target={0} onChange={v => {
                    setFreezeTemp(v);
                    // Proximity hint — only fires once, not on every drag event
                    if (v <= 4 && v > 0 && !celebrated.current.has("freeze") && !sawProximityRef.current) {
                      sawProximityRef.current = true;
                      setTutor("Almost at zero! Just a tiny bit more! ❄️", "You're almost there! Just a tiny bit more — you're right on the edge of the magic freezing point!");
                    }
                    if (v <= 0) celebrate("freeze","freeze");
                  }}/>
                )}
                {scene === 2 && (
                  <Thermometer value={coldTemp} target={-3} onChange={v => {
                    setColdTemp(v);
                    // First crossing below zero — fires at ANY first negative value
                    if (v < 0 && !sawBelowZeroRef.current && !celebrated.current.has("below")) {
                      sawBelowZeroRef.current = true;
                      setTutor("You crossed zero! You're in MINUS territory! 🥶", "You crossed the zero line into the minus world! These are called NEGATIVE numbers — they have a minus sign in front! Keep going down to minus three!");
                    }
                    if (v <= -3) celebrate("below","below");
                  }}/>
                )}
                {scene === 3 && (
                  <NumberLineQuiz key={nlStep} nlStep={nlStep} onCorrect={n => {
                    const nextStep = nlStep + 1;
                    setLastAction(`Clicked ${n} ✓`);
                    if (nextStep >= 3) {
                      setNlStep(3);
                      celebrate("numline","numline");
                    } else {
                      const msgs = [
                        ["Cold number found! ✓ Now find the freezing point!", "Yes! That's a cold number — it's below zero! Now can you click on the FREEZING point? That's the magic zero!"],
                        ["Freezing point found! ✓ Now click a warm number!", "Zero — the freezing point! Right there in the middle! Now click on a WARM number — one of the numbers on the right side!"],
                      ];
                      setNlStep(nextStep);
                      setTutor(msgs[nlStep][0], msgs[nlStep][1]);
                    }
                  }} onWrong={hint => {
                    setTutor(hint, hint); // setTutor already calls speak
                  }}/>
                )}
                {scene === 4 && (
                  <PenguinWalk pos={walkPos} setPos={v => {
                    setWalkPos(v);
                    setLastAction(`Penguin at ${v}`);
                    // Bug fix: use >= 1 so ticking directly to 2+ still completes
                    if (v >= 1 && !celebrated.current.has("walk")) {
                      celebrate("walk","walk");
                    } else if (v === 0) {
                      setTutor("Step 2! You crossed zero! One more! 🐧", "You crossed the freezing point — halfway there! One more step to the right and Pip reaches his warm friends!");
                    } else if (v === -1 && !sawStep1Ref.current) {
                      sawStep1Ref.current = true;
                      setTutor("Step 1! Getting warmer! Keep going! 🐧", "First step done! Pip moved from minus two to minus one! Two more steps to go — keep pressing Warmer!");
                    }
                  }} askTutor={askTutor}/>
                )}
                {scene === 5 && (
                  <BossQuestion answer={bossAnswer} setAnswer={v => {
                    setBossAnswer(v);
                    if (Number(v) === 1) celebrate("boss","boss");
                  }} askTutor={askTutor}/>
                )}

                {/* Chapter summary — slides in once scene is complete */}
                <AnimatePresence>
                  {isSceneComplete && (
                    <ChapterSummary sceneId={SCENES[scene].id} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <AnimatePresence mode="wait">
            {lastAction ? (
              <motion.div key={lastAction} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="rounded-full border px-4 py-2 text-xs font-semibold"
                style={{ background:lastAction.includes("✓")?"rgba(66,196,106,0.08)":"#FFFDF9",
                  borderColor:lastAction.includes("✓")?"rgba(66,196,106,0.35)":"#E8DDD0",
                  color:lastAction.includes("✓")?"#42C46A":"#66615B" }}>
                🐧 {lastAction}
              </motion.div>
            ) : (
              <div className="rounded-full border border-line bg-cream px-4 py-2 text-xs font-semibold text-muted">
                🐧 Waiting for you…
              </div>
            )}
          </AnimatePresence>
          <p className="hidden text-xs font-bold uppercase tracking-[0.35em] text-muted md:block">
            {isSceneComplete ? "CHAPTER DONE ✓" : "IN PROGRESS"}
          </p>
          <motion.button disabled={!isSceneComplete} onClick={nextScene}
            whileHover={isSceneComplete ? { scale:1.03 } : {}} whileTap={isSceneComplete ? { scale:0.97 } : {}}
            className="rounded-full px-7 py-4 text-sm font-bold text-white transition"
            style={{ background:isSceneComplete?"#1F1F1F":"rgba(180,165,150,0.3)", cursor:!isSceneComplete?"not-allowed":"pointer",
              boxShadow:isSceneComplete?"0 4px 16px rgba(30,30,30,0.2)":"none" }}>
            {scene === 5 && isSceneComplete ? "All done! 🎉" : "Next chapter →"}
          </motion.button>
        </div>
      </div>

      <FloatingRaiseHand
        onQuestion={q => askTutor({ lesson:"arctic", type:"question", scene:SCENES[scene].id, studentQuestion:q })}
        disabled={thinking}
      />
    </main>
  );
}

// ── Chapter summary card ──────────────────────────────────────────────────────
function ChapterSummary({ sceneId }) {
  const s = SUMMARIES[sceneId];
  if (!s) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="w-full max-w-xl rounded-[24px] border p-6"
      style={{ background:"#FFFDF9", borderColor:"#E8DDD0", boxShadow:"0 8px 30px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{s.emoji}</span>
        <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color:"#9C968D" }}>
          WHAT YOU LEARNED
        </p>
      </div>
      <p className="text-base font-black mb-4" style={{ color:"#2E2E2E" }}>{s.title}</p>
      <ul className="space-y-2.5">
        {s.points.map((pt, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-sm font-black" style={{ color:"#F4A340" }}>✦</span>
            <span className="text-sm font-semibold leading-5" style={{ color:"#66615B" }}>{pt}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ── Scene widgets ─────────────────────────────────────────────────────────────

// Scene 3 — Number line quiz (3 questions)
const NL_PROMPTS = [
  { text:"Click on a COLD number! ❄️",       check:n=>n<0,  hint:"Cold numbers have a little minus sign in front!" },
  { text:"Click the FREEZING point! 🧊",      check:n=>n===0,hint:"The freezing point is zero — right in the middle!" },
  { text:"Click on a WARM number! ☀️",        check:n=>n>0,  hint:"Warm numbers are to the right of zero!" },
];

function NumberLineQuiz({ nlStep, onCorrect, onWrong }) {
  const [last, setLast] = useState(null);
  const nums = [-5,-4,-3,-2,-1,0,1,2,3,4,5];
  const prompt = NL_PROMPTS[Math.min(nlStep, 2)];

  function handleClick(n) {
    setLast(n);
    if (prompt.check(n)) onCorrect(n);
    else onWrong(prompt.hint);
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      <div className="rounded-[28px] bg-white/80 p-8 shadow-card text-center">
        <p className="text-2xl font-black text-ink">{prompt.text}</p>
        <p className="mt-2 text-sm text-muted">Question {Math.min(nlStep,2)+1} of 3</p>

        {/* Number line */}
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          {nums.map(n => {
            const isNeg  = n < 0;
            const isZero = n === 0;
            const wasLast = last === n;
            return (
              <motion.button key={n} whileTap={{ scale:0.88 }} onClick={() => handleClick(n)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black transition"
                style={{
                  background: wasLast
                    ? (prompt.check(n) ? "#42C46A" : "#EF4444")
                    : isNeg ? "#DBEAFE" : isZero ? "#EDE9FE" : "#FEF3C7",
                  color: wasLast
                    ? "#fff"
                    : isNeg ? "#1D4ED8" : isZero ? "#7C3AED" : "#B45309",
                  border: isZero ? "2px solid #7C3AED" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: wasLast && prompt.check(n) ? "0 0 12px rgba(66,196,106,0.5)" : "none",
                }}>
                {n}
              </motion.button>
            );
          })}
        </div>

        {/* Labels */}
        <div className="mt-5 flex justify-between text-xs font-bold text-muted px-2">
          <span>← COLD numbers (minus sign)</span>
          <span>WARM numbers →</span>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex justify-center gap-2">
          {[0,1,2].map(i => (
            <span key={i} className="inline-block h-2.5 w-2.5 rounded-full transition"
              style={{ background: i < nlStep ? "#42C46A" : i === nlStep ? "#F4A340" : "#E8DDD0" }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// Scene 4 — Penguin walk (−2 to +1, 3 steps)
function PenguinWalk({ pos, setPos, askTutor }) {
  const ticks = [-5,-4,-3,-2,-1,0,1,2,3,4,5];
  const pct   = ((pos + 5) / 10) * 100;
  const steps = pos - (-2); // steps taken from start

  return (
    <div className="w-full max-w-xl rounded-[32px] bg-white/80 p-8 shadow-card">
      <p className="text-center text-xl font-black">🐧 Pip needs 3 warm steps!</p>

      {/* Step circles */}
      <div className="mt-4 flex justify-center gap-2">
        {[1,2,3].map(i => (
          <span key={i} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-black transition"
            style={{ background: steps >= i ? "#42C46A" : "#E8DDD0", color: steps >= i ? "#fff" : "#9C968D" }}>
            {steps >= i ? "✓" : i}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-muted">
        {steps <= 0 ? "Press Warmer to start! →" :
         steps >= 3 ? "All 3 steps done! 🎉" :
         `Step ${steps} of 3 — keep going! 🐧`}
      </p>

      {/* Number line */}
      <div className="relative mt-10 h-20">
        <div className="absolute left-0 right-0 top-9 h-1.5 rounded-full bg-neutral-200"/>
        {/* Warm trail */}
        {pos > -2 && (
          <div className="absolute top-9 h-1.5 rounded-full bg-orange-300 transition-all"
            style={{ left:"30%", width:`${((Math.min(pos,5)+5)/10)*100 - 30}%` }}/>
        )}
        {ticks.map(t => {
          const isStart  = t === -2;
          const isTarget = t === 1;
          const isCurrent = t === pos;
          return (
            <button key={t} onClick={() => setPos(t)}
              className="absolute top-3.5 -translate-x-1/2 flex flex-col items-center gap-3"
              style={{ left:`${((t+5)/10)*100}%` }}>
              <span className="h-5 w-5 rounded-full transition" style={{
                background: isCurrent ? "#F4A340" : isTarget ? "#42C46A" : isStart ? "#60A5FA" : "#E5E7EB",
                boxShadow: isTarget ? "0 0 8px rgba(66,196,106,0.4)" : "none",
              }}/>
              <span className="text-xs font-bold" style={{
                color: t < 0 ? "#1D4ED8" : t === 0 ? "#7C3AED" : "#B45309",
              }}>{t}</span>
            </button>
          );
        })}
        <motion.div animate={{ left:`${pct}%` }} transition={{ type:"spring", stiffness:220, damping:22 }}
          className="absolute top-0 -translate-x-1/2 text-3xl">🐧</motion.div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button onClick={() => setPos(Math.max(-5, pos-1))}
          className="rounded-full border border-line bg-white px-6 py-3 font-bold text-blue-600 hover:bg-blue-50 transition">
          ← Colder
        </button>
        <button onClick={() => setPos(Math.min(5, pos+1))}
          className="rounded-full bg-warm px-6 py-3 font-bold text-white hover:opacity-90 transition">
          Warmer →
        </button>
      </div>
    </div>
  );
}

// Scene 5 — Boss question
function BossQuestion({ answer, setAnswer, askTutor }) {
  const correct  = Number(answer) === 1;
  const hasInput = answer.trim() !== "" && !isNaN(Number(answer));
  const wrong    = hasInput && !correct;

  const inputCls = correct
    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
    : wrong ? "border-red-400 bg-red-50 text-red-700 ring-1 ring-red-200"
    : "border-line bg-white text-ink focus:border-orange-400";

  return (
    <div className="w-full max-w-xl rounded-[32px] bg-white/80 p-9 text-center shadow-card">
      <div className="text-5xl mb-4">🐧</div>
      <p className="text-xl font-black leading-9">
        It is −1° outside. 🥶<br/>Then it warms up 2°. ☀️<br/>What temperature is it now?
      </p>

      {/* Mini number line */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {[-3,-2,-1,0,1,2,3].map(n => (
          <span key={n} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
            style={{
              background: n===-1?"#DBEAFE":n===1?"#D1FAE5":n===0?"#EDE9FE":"#F3F4F6",
              color: n===-1?"#1D4ED8":n===1?"#065F46":n===0?"#7C3AED":"#9CA3AF",
              border: (n===-1||n===1)?"2px solid currentColor":"1px solid #E5E7EB",
            }}>{n}</span>
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold text-muted">Start at −1 → go 2 steps right → land at…?</p>

      {/* Input */}
      <div className="mt-6 flex justify-center gap-3">
        <motion.div animate={wrong ? { x:[-5,5,-5,5,0] } : {}} transition={{ duration:0.35 }}>
          <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="?"
            className={`w-28 rounded-2xl border px-5 py-4 text-center text-3xl font-black outline-none transition ${inputCls}`}/>
        </motion.div>
        <span className="self-center text-2xl font-black">°</span>
      </div>

      <AnimatePresence mode="wait">
        {correct && <motion.p key="ok" initial={{ scale:0.8,opacity:0 }} animate={{ scale:1,opacity:1 }}
          className="mt-3 text-base font-black text-emerald-600">✓ −1 + 2 = 1°! Pip found his friends!</motion.p>}
        {wrong && <motion.p key="bad" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="mt-3 text-sm font-bold text-red-500">Not quite — count two steps right from −1!</motion.p>}
      </AnimatePresence>

      <button onClick={() => askTutor({ lesson:"arctic", type:"hint", scene:"boss", studentAnswer:answer||"blank", correctAnswer:1, concept:"Start at -1, take 2 steps right on the number line" })}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition">
        Ask Nova for a hint 💡
      </button>
    </div>
  );
}

// ── Library screen ────────────────────────────────────────────────────────────
function LibraryScreen({ onStart }) {
  return (
    <main className="min-h-screen bg-paper px-7 py-9 text-ink">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo/>
        <div className="flex items-center gap-8 text-sm text-neutral-500">
          <button className="font-semibold text-ink">Library</button>
        </div>
      </nav>
      <section className="mx-auto mt-28 max-w-5xl">
        <p className="mb-6 text-sm font-bold uppercase tracking-[0.5em] text-muted">HI, ATHARVA!</p>
        <h1 className="max-w-4xl font-display text-6xl leading-[1.05] tracking-[-0.04em] md:text-7xl">
          Lessons that <span className="italic text-orange-600">do</span> something back.
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-8 text-neutral-600">
          Every lesson is a tiny interactive world. You explore, discover, and unlock each chapter only when you truly get it.
        </p>
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          <LessonCard onStart={onStart}/>
          <GalaxyCard/>
        </div>
      </section>
    </main>
  );
}

function LessonCard({ onStart }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-9 shadow-card">
      <div className="flex justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">NUMBERS · GRADE 2</p>
        <span className="rounded-full border border-emerald-200 px-4 py-1 text-xs font-bold text-emerald-600">6 chapters</span>
      </div>
      <h2 className="mt-8 font-display text-4xl leading-tight">Pip's Winter Adventure</h2>
      <p className="mt-5 text-lg leading-8 text-neutral-600">Help Pip the penguin explore temperatures, discover zero, meet negative numbers, and walk the number line!</p>
      <div className="mt-10 border-t border-line pt-7 grid grid-cols-2 gap-8">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">CHAPTERS</p><p className="mt-2 text-xl font-semibold">6</p></div>
        <div><p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">GRADE</p><p className="mt-2 text-xl font-semibold">Grade 2</p></div>
      </div>
      <div className="mt-8 rounded-2xl bg-[#f1ece2] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted">FINAL QUESTION</p>
        <p className="mt-2 text-sm font-semibold italic text-neutral-700">"It's −1°. It warms up 2°. What temperature now?"</p>
      </div>
      <button onClick={onStart} className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm font-bold text-white shadow-card transition hover:scale-[1.02]">
        Start lesson <ArrowRight size={16}/>
      </button>
    </div>
  );
}

function GalaxyCard() {
  return (
    <div className="rounded-[28px] border border-line bg-white p-9 shadow-card">
      <div className="flex justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">ALGEBRA · GRADE 7</p>
        <span className="rounded-full border border-emerald-200 px-4 py-1 text-xs font-bold text-emerald-600">7 missions</span>
      </div>
      <h2 className="mt-8 font-display text-4xl leading-tight">The Galaxy Code</h2>
      <p className="mt-5 text-lg leading-8 text-neutral-600">Plot coordinates, calculate slopes, write equations — decode an ancient star map using y = mx + b!</p>
      <div className="mt-10 border-t border-line pt-7 grid grid-cols-2 gap-8">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">MISSIONS</p><p className="mt-2 text-xl font-semibold">7</p></div>
        <div><p className="text-[11px] font-bold uppercase tracking-[0.35em] text-muted">GRADE</p><p className="mt-2 text-xl font-semibold">Grade 7</p></div>
      </div>
      <div className="mt-8 rounded-2xl bg-[#f1ece2] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted">FINAL MISSION</p>
        <p className="mt-2 text-sm font-semibold italic text-neutral-700">"Does y = 2x + 2 pass through the Warp Gate at (3, 8)?"</p>
      </div>
      <Link href="/galaxy">
        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm font-bold text-white shadow-card transition hover:scale-[1.02]">
          Start lesson <ArrowRight size={16}/>
        </button>
      </Link>
    </div>
  );
}
