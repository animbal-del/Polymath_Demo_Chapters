"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import TutorMascot from "../components/TutorMascot";
import { FloatingRaiseHand } from "../components/RaiseHand";

// ── Grid ──────────────────────────────────────────────────────────────────────
const GW=380, GH=380, PAD=44, UNITS=8, UNIT=(GW-PAD*2)/UNITS;
const sx=x=>PAD+x*UNIT;
const sy=y=>GH-PAD-y*UNIT;
const toGx=svgX=>Math.round((svgX-PAD)/UNIT);
const toGy=svgY=>Math.round((GH-PAD-svgY)/UNIT);

// ── Palette ───────────────────────────────────────────────────────────────────
const P={paper:"#F6F1E7",cream:"#FFFDF9",ink:"#2E2E2E",body:"#66615B",muted:"#9C968D",
  warm:"#F4A340",warmBg:"rgba(244,163,64,0.10)",warmBorder:"rgba(244,163,64,0.35)",
  blue:"#173D9B",gold:"#F6B637",glow:"#42C46A",glowBg:"rgba(66,196,106,0.08)",
  line:"#E8DDD0",grid:"rgba(180,155,130,0.18)",axis:"rgba(100,85,70,0.45)",label:"#9C968D",
  shadow:"0 8px 30px rgba(0,0,0,0.06)"};

// ── Client audio cache ────────────────────────────────────────────────────────
const AUDIO_CACHE = new Map();

// ── Voice ─────────────────────────────────────────────────────────────────────
let _voice=null;
function pickVoice(){
  if(_voice)return _voice;
  if(typeof window==="undefined")return null;
  const vs=window.speechSynthesis.getVoices();
  const prefer=["Samantha","Karen","Moira","Google US English","Microsoft Aria Online"];
  _voice=vs.find(v=>prefer.some(p=>v.name.includes(p)))??vs.find(v=>v.lang.startsWith("en")&&v.localService)??vs.find(v=>v.lang.startsWith("en"))??null;
  return _voice;
}

// ── Confetti ──────────────────────────────────────────────────────────────────
const burstSmall=()=>confetti({particleCount:55,spread:55,origin:{y:0.6},colors:["#42C46A","#F4A340","#173D9B"]});
const burstBig=()=>confetti({particleCount:130,spread:75,origin:{y:0.5},colors:["#F4A340","#42C46A","#173D9B","#F6B637","#F5B6D0"]});
const burstSides=()=>{
  confetti({particleCount:80,angle:60,spread:55,origin:{x:0,y:0.65},colors:["#F4A340","#42C46A"]});
  confetti({particleCount:80,angle:120,spread:55,origin:{x:1,y:0.65},colors:["#173D9B","#F6B637"]});
};
const burstStars=()=>confetti({particleCount:70,spread:90,origin:{y:0.45},shapes:['star'],colors:['#F4A340','#fbbf24','#fff','#42C46A'],scalar:1.5});

// ── Missions ──────────────────────────────────────────────────────────────────
const SCENES=[
  {id:"coord",    pill:"01 · COORDS",    eyebrow:"MISSION 1 · COORDINATE SYSTEM",       title:"Every star has a unique address.",
   screenText:"Let's find the two axes — the grid's number lines.",
   spokenText:"Navigator, welcome to the Galactic Navigation Corps! This coordinate grid is how we navigate the entire galaxy. It's built on two number lines called AXES. Every star's address uses both of them. Before we plot anything, you need to know these axes. Let's find them — starting with the horizontal one!",
   debrief:"Coordinates mastered! (x, y) is your new language.",
   debriefSpoken:"Outstanding work! You now know that every point has an (x, y) address. X tells you how far right, Y tells you how far up. X always comes first. You've just learned the foundational language of all coordinate mathematics!"},
  {id:"slope",    pill:"02 · SLOPE",     eyebrow:"MISSION 2 · SLOPE",                    title:"How steep is the hyperspace lane?",
   screenText:"Measure the lane's steepness — rise then run.",
   spokenText:"The star map shows hyperspace lanes connecting anchor stars. To navigate them safely, you need to measure their STEEPNESS — we call this the SLOPE. Slope is rise divided by run: how far UP the lane goes, divided by how far RIGHT. Look at the lane connecting the two stars and let's measure it step by step!",
   debrief:"Slope = rise ÷ run. Your first gradient calculated!",
   debriefSpoken:"You've calculated your first slope! Rise divided by run — it's that simple. A slope of 2 means for every step right, the lane climbs 2 steps up. The steeper the lane, the bigger the slope number. This is the rate of change — a fundamental concept you'll use throughout mathematics!"},
  {id:"yint",     pill:"03 · Y-INT",     eyebrow:"MISSION 3 · Y-INTERCEPT",              title:"Where does the lane enter the grid?",
   screenText:"Find the y-intercept — where the lane meets the Y-axis.",
   spokenText:"Now look at this hyperspace lane crossing our reference grid. Every line crosses the vertical Y-axis at one specific point. That crossing point has a very important name: the Y-INTERCEPT. It tells us where the line STARTS on the Y-axis — the b value in y equals mx plus b. Let's find it on this lane!",
   debrief:"Y-intercept = where the line crosses the Y-axis.",
   debriefSpoken:"The y-intercept is locked in! It's always the b value — the starting height. Change b and the whole line shifts up or down without changing its angle. Parallel lanes share slope but differ here. You've now mastered TWO of the three components of linear equations!"},
  {id:"formula",  pill:"04 · FORMULA",   eyebrow:"MISSION 4 · THE NAVIGATION FORMULA",  title:"y = mx + b: two numbers, any line.",
   screenText:"Unlock y = mx + b — the formula that describes every straight line.",
   spokenText:"Here's the breakthrough, Navigator! Slope and y-intercept aren't separate tools — they combine into ONE formula that describes ANY straight line in the universe: y equals m-x plus b. The m and b each control something different. First, let's nail down what each one does!",
   debrief:"y = mx + b — the universal equation for any straight line.",
   debriefSpoken:"You've mastered the Navigation Formula! Slope m controls the angle, y-intercept b controls the starting height. Two numbers — any straight path. You can now describe any lane in the galaxy with a single equation. This is one of the most powerful tools in all of mathematics!"},
  {id:"parallel", pill:"05 · PARALLEL",  eyebrow:"MISSION 5 · PARALLEL LANES",           title:"Same slope — but different paths?",
   screenText:"Discover what makes lines parallel.",
   spokenText:"Some hyperspace lanes never cross — they run alongside each other forever! These are called PARALLEL lines. They share something very specific — one number is always identical. Think about what we've been measuring, and answer the question below!",
   debrief:"Parallel lines share slope — different y-intercepts, never cross.",
   debriefSpoken:"Parallel lines always have identical slopes! That's what keeps them from ever intersecting. Their y-intercepts differ, giving them different starting heights. But with the same steepness, they run alongside each other forever. An elegant mathematical property — and now you can identify it instantly!"},
  {id:"twopts",   pill:"06 · TWO POINTS",eyebrow:"MISSION 6 · EQUATION FROM TWO STARS", title:"Write the equation from just two stars.",
   screenText:"From two coordinates → slope → y-intercept → full equation.",
   spokenText:"The ultimate challenge: two stars are charted, and you must write the equation of the lane through both of them. Step one — calculate slope using the formula. Step two — substitute to find the y-intercept. Step three — write y equals mx plus b. I'll walk you through an example first, then you solve one yourself!",
   debrief:"From two points → slope → b → full equation. The complete toolkit.",
   debriefSpoken:"Brilliant work! You've completed the full pipeline: two points, slope formula, substitution, complete equation. This is the most powerful skill in linear algebra — deriving equations from coordinate data. The galaxy's ancient star map is nearly fully decoded!"},
  {id:"boss",     pill:"07 · WARP GATE", eyebrow:"FINAL MISSION · THE WARP GATE",        title:"Calculate the warp trajectory!",
   screenText:"Does y = 2x + 2 pass through the Warp Gate at (3, 8)?",
   spokenText:"NAVIGATOR — this is it! The legendary Warp Gate is at coordinates three, eight. Our ship follows the equation y equals 2x plus 2. Write the equation, substitute x equals 3, and tell me: does our trajectory reach the gate? Every skill you have — coordinates, slope, y-intercept, the formula — converges RIGHT HERE!",
   debrief:"y = 2x + 2 → (3,8): 2(3)+2 = 8 ✓ Gate reached!",
   debriefSpoken:"CONFIRMED! y equals 2 times 3 plus 2 equals 8. The trajectory hits exactly (3,8). The Warp Gate is OPEN! You've mastered all seven missions: coordinates, slope, y-intercept, y = mx + b, parallel lines, equations from two points, and verification. The galaxy belongs to you, Navigator!"},
];

// ── Learn data — teach → test → reaffirm ─────────────────────────────────────
// RULE: learn TEACHES the concept. practice applies it to a DIFFERENT problem.
// exp = short screen text after correct. expSpoken = warm spoken reaffirmation.
const LEARN={
  coord:[
    {q:"Find the X-axis! Click the line that goes LEFT and RIGHT across the grid →",
     type:"axis",target:"x",
     exp:"✓ The X-axis! X tells you how far RIGHT to move.",
     expSpoken:"You found it! That's the X-axis — the horizontal line running across the entire grid. Every star's X coordinate tells you how many steps to move to the right from the origin. X direction is always sideways. Excellent navigation instincts, Navigator!",
     hint:"Look for the flat line going all the way across — like the horizon.",
     wrongHint:"That's the vertical axis! The X-axis goes flat, left to right across the grid."},
    {q:"Now find the Y-axis! Click the line that goes UP and DOWN ↑",
     type:"axis",target:"y",
     exp:"✓ The Y-axis! Y tells you how far UP to move.",
     expSpoken:"The Y-axis — straight up and down on the left side! The Y coordinate tells you how many steps to climb upward. So together: X goes right, Y goes up. Those two numbers give every star in the galaxy a unique address. Both axes mastered!",
     hint:"Look for the line going straight up on the left side.",
     wrongHint:"That's the X-axis! Find the vertical line going straight up on the left side."},
    {q:"A star sits at (5, 4) — no label. What does the 5 tell you?",
     type:"mcq",
     options:["5 steps to the RIGHT →","5 steps going UP ↑","5 total steps","Star number 5"],
     correct:"5 steps to the RIGHT →",
     exp:"✓ 5 steps right! The FIRST number is always the X (horizontal) distance.",
     expSpoken:"Exactly right! In any coordinate pair, the first number is always X — how far right to go. The second is always Y — how far up. So (5, 4) means 5 steps right, then 4 steps up. X first — always! You've grasped the foundation of all coordinate navigation!"},
  ],
  slope:[
    {q:"The lane goes from (1,2) to (4,8). How far UP does it travel? This is the RISE.",
     type:"mcq",showSlope:true,
     options:["Rise = 6","Rise = 3","Rise = 4","Rise = 8"],correct:"Rise = 6",
     exp:"✓ Rise = 6! From y=2 to y=8 — 6 units climbing upward.",
     expSpoken:"Rise equals 6 — well done! The rise is the vertical change between the two anchor stars. From y=2 up to y=8 is 8 minus 2, which is 6 units upward. Rise is always the change in Y — how much the lane climbs. Excellent work, Navigator!"},
    {q:"Same lane — how far RIGHT does it travel? This is the RUN.",
     type:"mcq",showSlope:true,
     options:["Run = 1","Run = 2","Run = 3","Run = 6"],correct:"Run = 3",
     exp:"✓ Run = 3! So slope = Rise ÷ Run = 6 ÷ 3 = 2.",
     expSpoken:"Run equals 3 — perfect! From x=1 to x=4 is 4 minus 1, which is 3 units to the right. And here's the payoff: slope equals rise divided by run — 6 divided by 3 equals 2! For every step right, this lane climbs 2 steps up. You've calculated your first slope!"},
  ],
  yint:[
    {q:"A hyperspace lane is drawn. Click exactly where it meets the Y-axis — the vertical line.",
     type:"intercept",targetGY:3,
     exp:"✓ The Y-intercept! This lane enters the Y-axis at height 3.",
     expSpoken:"You found it! That exact crossing point is the Y-INTERCEPT — where the line enters the reference grid. This lane crosses at height 3, so its y-intercept is 3. In y equals mx plus b, this is always the b value — the starting height. Precise navigation, Navigator!",
     hint:"The Y-axis is the vertical line on the left. Tap exactly where the lane crosses it."},
    {q:"A line has equation y = 2x + 5. What is its y-intercept?",
     type:"mcq",
     options:["y-intercept = 5","y-intercept = 2","y-intercept = 7","y-intercept = 0"],
     correct:"y-intercept = 5",
     exp:"✓ y-intercept = 5! In y = mx + b, the constant b is always the y-intercept.",
     expSpoken:"The y-intercept is 5 — spot on! In any y equals mx plus b equation, the b constant at the end is always the y-intercept. You don't even need to draw it — just read b directly. In y = 2x + 5, b is 5. A navigator's shortcut you've just mastered!"},
  ],
  formula:[
    {q:"In y = mx + b, what does the m control?",type:"mcq",
     options:["Steepness (slope)","Starting height (y-intercept)","The x-value","The y-value"],
     correct:"Steepness (slope)",
     exp:"✓ m = slope! Change m and the line tilts steeper or flatter.",
     expSpoken:"Exactly! The m is the slope — the steepness. A bigger m means a steeper line. If m is zero the line is flat. Negative m means it slopes downward. M controls the angle of your entire flight path. You've unlocked the first piece of the Navigation Formula!"},
    {q:"What does the b control in y = mx + b?",type:"mcq",
     options:["Starting height (y-intercept)","Steepness (slope)","Rate of change","X-intercept"],
     correct:"Starting height (y-intercept)",
     exp:"✓ b = y-intercept! Change b and the whole line shifts up or down.",
     expSpoken:"b is the y-intercept — perfect! Change b and the line shifts up or down without tilting at all. It sets the starting height on the Y-axis. So: m sets the angle, b sets the position. Together they completely describe any straight line in the universe!"},
  ],
  parallel:[
    {q:"Parallel lines never cross. They must always have the same ___.",type:"mcq",
     options:["Slope","Y-intercept","Length","X-intercept"],correct:"Slope",
     exp:"✓ Slope! Same steepness = same direction = they run alongside forever.",
     expSpoken:"Slope is the key! Parallel lines have identical slopes — the exact same steepness and angle. Their y-intercepts are different, so they start at different heights. But with the same rise-over-run, they run alongside each other indefinitely, never crossing. A beautiful mathematical property — and you named it!"},
  ],
  twopts:[
    // Worked example: different stars from practice — slope=1, b=1
    {q:"Stars at (0,1) and (3,4). Apply the formula: slope = (4−1) ÷ (3−0) = ?",
     type:"mcq",stars:[[0,1],[3,4]],
     options:["Slope = 1","Slope = 2","Slope = 3","Slope = 0.5"],correct:"Slope = 1",
     exp:"✓ Slope = 3 ÷ 3 = 1! Rise = 3, Run = 3.",
     expSpoken:"Slope equals 1 — excellent! Rise is 4 minus 1, which is 3. Run is 3 minus 0, which is 3. Three divided by three equals 1. A slope of 1 means equal rise and run — a perfect 45-degree lane! You've correctly applied the two-point slope formula!"},
    {q:"Slope = 1. Point (0,1) gives: 1 = 1×0 + b. So b = ?",
     type:"mcq",stars:[[0,1],[3,4]],
     options:["b = 1","b = 0","b = 2","b = 3"],correct:"b = 1",
     exp:"✓ b = 1! Full equation: y = x + 1. A lane through both stars!",
     expSpoken:"b equals 1 — brilliant! When x is 0, y equals b directly. The point (0,1) tells us b is 1. The complete equation is y equals x plus 1 — a perfect 45-degree lane through both stars. You've derived a full equation from just two points. That's advanced navigation!"},
  ],
};

// ── Mission summaries — shown after each mission completes ───────────────────
const SUMMARIES={
  coord:    {emoji:"🗺️",title:"Coordinate System",       points:["Every point has a unique address: (x, y)","x = steps to the RIGHT from the origin","y = steps UP — and X always comes first!"]},
  slope:    {emoji:"📐",title:"Slope",                   points:["Slope = Rise ÷ Run (vertical ÷ horizontal)","Steeper line = bigger slope number","Slope measures how fast y changes as x increases"]},
  yint:     {emoji:"📍",title:"Y-Intercept",             points:["Y-intercept = where the line crosses the Y-axis","It is always the b value in y = mx + b","Change b and the line shifts up or down"]},
  formula:  {emoji:"⚡",title:"Navigation Formula y=mx+b",points:["m controls steepness (slope)","b controls starting height (y-intercept)","Two numbers completely describe any straight line"]},
  parallel: {emoji:"🛤️",title:"Parallel Lines",          points:["Parallel lines share the SAME slope","Different y-intercepts = different heights","Same steepness means they NEVER cross, ever"]},
  twopts:   {emoji:"⭐",title:"Equation from Two Points", points:["Step 1: Slope = (y₂−y₁) ÷ (x₂−x₁)","Step 2: Substitute a point to find b","Step 3: Write y = mx + b — done!"]},
  boss:     {emoji:"🌌",title:"Full Navigation Toolkit",  points:["Write the equation from slope + y-intercept","Substitute any x-value to find the matching y","If the point satisfies the equation, it's on the line"]},
};

// ── Dock targets per scene ────────────────────────────────────────────────────
const DOCK_TARGETS=[[2,6],[5,3],[4,7]];

// ── GridBase SVG elements ─────────────────────────────────────────────────────
function GridBase({hX=false,hY=false}){
  return(<>
    <rect width={GW} height={GH} fill={P.cream} rx="14"/>
    {Array.from({length:UNITS+1},(_,i)=>(<g key={i}>
      <line x1={sx(i)} y1={PAD/2} x2={sx(i)} y2={GH-PAD/2} stroke={P.grid} strokeWidth="1"/>
      <line x1={PAD/2} y1={sy(i)} x2={GW-PAD/2} y2={sy(i)} stroke={P.grid} strokeWidth="1"/>
    </g>))}
    <line x1={sx(0)} y1={PAD/2} x2={sx(0)} y2={GH-PAD/2} stroke={hY?P.warm:P.axis} strokeWidth={hY?3.5:1.5}/>
    <line x1={PAD/2} y1={sy(0)} x2={GW-PAD/2} y2={sy(0)} stroke={hX?P.warm:P.axis} strokeWidth={hX?3.5:1.5}/>
    {[1,2,3,4,5,6,7,8].map(i=>(<g key={i}>
      <text x={sx(i)} y={GH-PAD/2+13} textAnchor="middle" fill={P.label} fontSize="10" fontWeight="700">{i}</text>
      <text x={PAD/2-12} y={sy(i)+4} textAnchor="middle" fill={P.label} fontSize="10" fontWeight="700">{i}</text>
    </g>))}
    <text x={GW/2} y={GH-3} textAnchor="middle" fill={P.muted} fontSize="9">x →</text>
    <text x={9} y={GH/2} textAnchor="middle" fill={P.muted} fontSize="9" transform={`rotate(-90,9,${GH/2})`}>↑ y</text>
  </>);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Galaxy(){
  const [scene,      setScene]      = useState(0);
  const [phase,      setPhase]      = useState("learn");
  const [learnStep,  setLearnStep]  = useState(0);
  const [xp,         setXp]         = useState(0);
  const [streak,     setStreak]     = useState(0);
  const [narrating,  setNarrating]  = useState(true);
  const [audioStatus,setAudioStatus]= useState("idle");
  const [tutorText,  setTutorText]  = useState(SCENES[0].screenText);
  const [thinking,   setThinking]   = useState(false);
  const [completeScenes,setCompleteScenes]= useState({});
  const [lastAction, setLastAction] = useState("");
  const [xpPops,     setXpPops]     = useState([]);
  const [flash,      setFlash]      = useState(false);
  const [achievement,setAchievement]= useState(null);
  const [attempts,   setAttempts]   = useState({});
  const [missionDone,setMissionDone]= useState(false);
  const [dockRipple, setDockRipple] = useState(null);

  // Scene-specific state
  const [dockIdx, setDockIdx]   = useState(0);
  const [shipPos, setShipPos]   = useState(null);
  const [clickOk, setClickOk]   = useState(null);
  const [parallelAns,setParallelAns]= useState(null);
  const [builderM,setBuilderM]  = useState(1);
  const [builderB,setBuilderB]  = useState(0);
  const [tp2Slope,setTp2Slope]  = useState(null);
  const [tp2B,    setTp2B]      = useState(null);
  const [bossM,   setBossM]     = useState("");
  const [bossB,   setBossB]     = useState("");
  const [bossGate,setBossGate]  = useState(null);

  const celebrated = useRef(new Set());
  const audioRef   = useRef(null);
  const svgRef     = useRef(null);
  const speakId    = useRef(0);
  const adaptTimer = useRef(null);
  const autoTimer  = useRef(null);
  const onAudioEnd = useRef(null);

  const learnData = LEARN[SCENES[scene].id] || [];

  const isSceneComplete = useMemo(()=>{
    if(phase!=="practice")return false;
    if(scene===0)return dockIdx>=DOCK_TARGETS.length;
    if(scene===1||scene===2)return false; // driven by missionDone
    if(scene===3)return builderM===2&&builderB===1;
    if(scene===4)return parallelAns==="y = 3x + 5";
    if(scene===5)return tp2Slope==="Slope = 2"&&tp2B==="b = 1";
    if(scene===6)return bossM==="2"&&bossB==="2"&&bossGate==="yes";
    return false;
  },[phase,scene,dockIdx,builderM,builderB,parallelAns,tp2Slope,tp2B,bossM,bossB,bossGate]);

  const maxUnlocked = Math.max(scene,...Object.keys(completeScenes).map(Number),0);

  // ── Gamification ────────────────────────────────────────────────────────────
  function popXP(n){const id=Date.now()+Math.random();setXpPops(p=>[...p,{id,n}]);setTimeout(()=>setXpPops(p=>p.filter(x=>x.id!==id)),1700);}
  const flash_=()=>{setFlash(true);setTimeout(()=>setFlash(false),700);};

  const ACHIEVEMENTS={
    coord:{emoji:"🗺️",text:"Coordinates Mastered!"},slope:{emoji:"📐",text:"Slope Unlocked!"},
    yint:{emoji:"📍",text:"Y-Intercept Cracked!"},formula:{emoji:"⚡",text:"Navigation Formula!"},
    parallel:{emoji:"🛤️",text:"Parallel Lines Decoded!"},twopts:{emoji:"⭐",text:"Two Points → Equation!"},
    boss:{emoji:"🌌",text:"Warp Gate Opened!"},
  };
  function showAchievement(id){
    const a=typeof id==="string"?ACHIEVEMENTS[id]:id;
    if(!a)return;
    setAchievement(a);
    setTimeout(()=>setAchievement(null),2800);
  }

  // ── Voice ────────────────────────────────────────────────────────────────────
  async function speak(text){
    const myId=++speakId.current;
    if(!narrating||!text||typeof window==="undefined")return;
    if(audioRef.current){audioRef.current.pause();audioRef.current=null;}
    window.speechSynthesis?.cancel();
    setAudioStatus("loading");
    const finish=()=>{
      setAudioStatus("idle");
      const cb=onAudioEnd.current;onAudioEnd.current=null;cb?.();
    };
    const speakInBrowser=()=>{
      if(myId!==speakId.current){setAudioStatus("idle");return;}
      if(!window.speechSynthesis){finish();return;}
      const utt=new SpeechSynthesisUtterance(text);utt.rate=0.88;utt.pitch=1.06;
      utt.onstart=()=>setAudioStatus("playing");
      utt.onend=finish;
      utt.onerror=finish;
      const go=()=>{if(myId!==speakId.current)return;utt.voice=pickVoice();window.speechSynthesis.speak(utt);};
      window.speechSynthesis.getVoices().length>0?go():window.speechSynthesis.addEventListener("voiceschanged",go,{once:true});
    };
    try{
      let buffer;
      if(AUDIO_CACHE.has(text)){buffer=AUDIO_CACHE.get(text);}
      else{
        const res=await fetch("/api/speak",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});
        if(myId!==speakId.current){setAudioStatus("idle");return;}
        if(!res.ok)throw new Error(`Speech API failed: ${res.status}`);
        buffer=await res.arrayBuffer();
        if(myId!==speakId.current){setAudioStatus("idle");return;}
        AUDIO_CACHE.set(text,buffer);
      }
      if(myId!==speakId.current){setAudioStatus("idle");return;}
      const blob=new Blob([buffer],{type:"audio/mpeg"});
      const url=URL.createObjectURL(blob);
      const aud=new Audio(url);audioRef.current=aud;
      aud.addEventListener("play",()=>setAudioStatus("playing"));
      aud.addEventListener("ended",()=>{URL.revokeObjectURL(url);finish();});
      aud.addEventListener("error",()=>{URL.revokeObjectURL(url);speakInBrowser();});
      await aud.play();return;
    }catch{speakInBrowser();}
  }

  function setTutor(screenText,spokenText){setTutorText(screenText);speak(spokenText??screenText);}

  // ── Auto-advance: waits for audio to finish before moving on ─────────────────
  const BRIDGES={
    coord:"Now find stars yourself — no labels, just your coordinates knowledge!",
    slope:"Apply it to a new lane. Calculate slope from rise and run!",
    yint:"Now identify the correct lane using your y-intercept knowledge!",
    formula:"Match the target line by adjusting slope m and y-intercept b!",
    parallel:"Apply the rule — find the equation with the same slope as the original.",
    twopts:"Now solve it yourself with two new stars. Slope formula, then find b!",
    boss:"Final mission, Navigator. Every skill you have — converges right now!",
  };

  function estimateNarrationMs(text){
    const words=(text||"").trim().split(/\s+/).filter(Boolean).length;
    return Math.min(Math.max((words/2.2)*1000+3500,9000),60000);
  }

  function handleLearnCorrect(exp,expSpoken){
    setTutor(exp,expSpoken);
    flash_();burstSmall();
    clearTimeout(autoTimer.current);

    const doAdvance=()=>{
      clearTimeout(autoTimer.current);
      onAudioEnd.current=null;
      const nextStep=learnStep+1;
      if(nextStep<learnData.length){
        setLearnStep(nextStep);
        const next=learnData[nextStep];
        setTutor(next.q,next.q);
      }else{
        setPhase("practice");
        setTutor(SCENES[scene].screenText,BRIDGES[SCENES[scene].id]||"Now try it yourself!");
      }
    };
    onAudioEnd.current=doAdvance;
    autoTimer.current=setTimeout(doAdvance,narrating?estimateNarrationMs(expSpoken||exp):1800);
  }
  function handleLearnWrong(hint){onAudioEnd.current=null;setTutor(hint,hint);}

  // ── AI Nova ──────────────────────────────────────────────────────────────────
  async function askNova(payload){
    setThinking(true);
    const sceneId=SCENES[scene].id;
    let attempt=attempts[sceneId]||0;
    if(payload.type==="hint"){attempt++;setAttempts(a=>({...a,[sceneId]:attempt}));}
    try{
      const res=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lesson:"galaxy",attempt,...payload})});
      const txt=await res.text();let msg=null;
      try{msg=JSON.parse(txt)?.message;}catch{}
      if(msg)setTutor(msg,msg);
    }catch{}
    finally{setThinking(false);}
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  function celebrate(key){
    if(celebrated.current.has(key))return;
    celebrated.current.add(key);
    clearTimeout(adaptTimer.current);
    burstSmall();flash_();
    setMissionDone(true);
    showAchievement(SCENES[scene].id);
    const s=SCENES[scene];
    setTutor(s.debrief,s.debriefSpoken);
  }

  function nextScene(){
    if(!isSceneComplete&&!missionDone)return;
    const firstTime=!completeScenes[scene];
    if(firstTime){setXp(v=>v+5);setStreak(v=>v+1);popXP(5);burstBig();}
    setCompleteScenes(old=>({...old,[scene]:true}));
    if(scene<SCENES.length-1){
      const next=scene+1;setScene(next);setLastAction("");
      setDockIdx(0);setShipPos(null);setClickOk(null);setDockRipple(null);
      setParallelAns(null);setTp2Slope(null);setTp2B(null);
      setBuilderM(1);setBuilderB(0);setBossM("");setBossB("");setBossGate(null);
      setMissionDone(false);celebrated.current=new Set();onAudioEnd.current=null;
      const hasLearn=(LEARN[SCENES[next].id]||[]).length>0;
      const firstLearnStep=hasLearn?LEARN[SCENES[next].id]?.[0]:null;
      setPhase(hasLearn?"learn":"practice");setLearnStep(0);
      setTutor(SCENES[next].screenText,SCENES[next].spokenText);
      if(firstLearnStep){
        onAudioEnd.current=()=>setTutor(firstLearnStep.q,firstLearnStep.q);
      }
    }else{
      burstSides();burstStars();
      showAchievement("boss");
      setTutor("ALL MISSIONS COMPLETE! The galaxy is yours! 🌌",
               "All seven missions complete! You have mastered coordinate geometry from first principles — coordinates, slope, y-intercept, the Navigation Formula, parallel lines, equations from two points, and verification. The Navigation Corps is proud to have you. The galaxy belongs to you, Navigator!");
    }
  }

  function resetLesson(){
    setScene(0);setXp(0);setStreak(0);setLastAction("");
    setDockIdx(0);setShipPos(null);setClickOk(null);setDockRipple(null);
    setParallelAns(null);setTp2Slope(null);setTp2B(null);
    setBuilderM(1);setBuilderB(0);setBossM("");setBossB("");setBossGate(null);
    setMissionDone(false);setCompleteScenes({});setAttempts({});celebrated.current=new Set();
    onAudioEnd.current=null;
    setPhase("learn");setLearnStep(0);
    setTutor(SCENES[0].screenText,SCENES[0].spokenText);
    const firstStep=LEARN[SCENES[0].id]?.[0];
    if(firstStep)onAudioEnd.current=()=>setTutor(firstStep.q,firstStep.q);
  }

  // Mount: play intro then speak first learn step
  useEffect(()=>{
    speak(SCENES[0].spokenText);
    const firstStep=LEARN[SCENES[0].id]?.[0];
    if(firstStep)onAudioEnd.current=()=>setTutor(firstStep.q,firstStep.q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Streak milestone achievement
  useEffect(()=>{
    if(streak>0&&streak%3===0)showAchievement({emoji:"🔥",text:`${streak} in a Row!`});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[streak]);

  // Dock click
  function handleDockClick(e){
    if(dockIdx>=DOCK_TARGETS.length)return;
    const rect=svgRef.current.getBoundingClientRect();
    const gxv=toGx(((e.clientX-rect.left)/rect.width)*GW);
    const gyv=toGy(((e.clientY-rect.top)/rect.height)*GH);
    if(gxv<0||gxv>UNITS||gyv<0||gyv>UNITS)return;
    const[tx,ty]=DOCK_TARGETS[dockIdx];
    setShipPos([gxv,gyv]);
    if(gxv===tx&&gyv===ty){
      setClickOk(true);setLastAction(`(${gxv},${gyv}) ✓`);
      setDockRipple({x:gxv,y:gyv});
      setTimeout(()=>setDockRipple(null),700);
      const nc=dockIdx+1;setDockIdx(nc);
      if(nc>=DOCK_TARGETS.length){celebrate("coord");}
      else{const[nx,ny]=DOCK_TARGETS[nc];setTutor(`✓ Docked! Now find (${nx}, ${ny})!`,`Perfect! You found (${gxv},${gyv})! Now dock at (${nx},${ny}) — ${nx} steps right and ${ny} steps up.`);}
    }else{
      setClickOk(false);setLastAction(`(${gxv},${gyv}) ✗`);
      askNova({type:"hint",scene:"coord",studentAnswer:`(${gxv},${gyv})`,correctAnswer:`(${tx},${ty})`,concept:"X = steps right, Y = steps up"});
    }
  }

  // Equation builder adaptive hint
  function scheduleEquationHint(newM,newB){
    clearTimeout(adaptTimer.current);
    if(celebrated.current.has("formula"))return;
    adaptTimer.current=setTimeout(()=>{
      if(celebrated.current.has("formula"))return;
      const mR=newM===2,bR=newB===1;
      const c=mR&&!bR?`slope m=2 correct, b=${newB} needs to be 1`
              :!mR&&bR?`b=1 correct, slope m=${newM} needs to be 2`
              :`target m=2, b=1; currently m=${newM}, b=${newB}`;
      askNova({type:"adaptive",scene:"formula",concept:c});
    },2200);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return(
    <main className="min-h-screen bg-paper text-ink">

      {/* Achievement banner */}
      <AnimatePresence>
        {achievement&&(
          <motion.div
            initial={{y:-90,opacity:0,scale:0.9}} animate={{y:0,opacity:1,scale:1}} exit={{y:-90,opacity:0,scale:0.9}}
            transition={{type:"spring",stiffness:320,damping:26}}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border px-6 py-3"
            style={{background:P.cream,borderColor:P.warm,boxShadow:"0 8px 40px rgba(244,163,64,0.45)",whiteSpace:"nowrap"}}>
            <span className="text-2xl">{achievement.emoji}</span>
            <span className="text-sm font-black" style={{color:P.ink}}>{achievement.text}</span>
            <span className="text-2xl">{achievement.emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP pops */}
      {xpPops.map(({id,n})=>(
        <motion.div key={id} className="fixed left-1/2 top-[42%] z-50 -translate-x-1/2 pointer-events-none select-none text-center"
          initial={{opacity:1,y:0,scale:0.5}} animate={{opacity:0,y:-110,scale:1.6}} transition={{duration:1.5,ease:[0,0.9,1,1]}}>
          <span className="block text-5xl font-black" style={{color:P.warm,textShadow:`0 0 20px ${P.warm}`}}>+{n} XP</span>
          <span className="text-3xl">⭐</span>
        </motion.div>
      ))}

      {/* Green flash */}
      <AnimatePresence>
        {flash&&(
          <motion.div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.22}}
            style={{background:"rgba(66,196,106,0.09)"}}>
            <motion.span className="text-9xl font-black select-none" style={{color:P.glow,textShadow:`0 0 40px ${P.glow}`}}
              initial={{scale:0.3,opacity:1}} animate={{scale:1.1,opacity:0}} transition={{duration:0.6}}>✓</motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative border-b border-line bg-cream/80 backdrop-blur">
        <div className="flex h-[74px] items-center justify-between px-7">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-ink transition">
            <ArrowLeft size={16}/> Library
          </Link>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-muted">GRADE 7 · ALGEBRA</span>
            <span className="ml-3 font-display text-lg text-ink">The Galaxy Code</span>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {streak>=2&&(
                <motion.span key={`s${streak}`} initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-black text-white"
                  style={{background:"#E07A20",boxShadow:"0 0 10px rgba(224,122,32,0.4)"}}>
                  🔥 {streak}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Audio status */}
            <AnimatePresence>
              {narrating&&audioStatus!=="idle"&&(
                <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.85}}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background:audioStatus==="loading"?"rgba(251,191,36,0.10)":"rgba(66,196,106,0.10)",
                    borderColor:audioStatus==="loading"?"rgba(251,191,36,0.40)":"rgba(66,196,106,0.40)",
                    color:audioStatus==="loading"?"#B45309":"#16A34A",
                  }}>
                  {audioStatus==="loading"?(
                    <><motion.span className="h-1.5 w-1.5 rounded-full bg-yellow-500"
                      animate={{opacity:[1,0.3,1]}} transition={{repeat:Infinity,duration:0.8}}/>Generating…</>
                  ):(
                    <><span className="flex items-end gap-0.5" style={{height:14}}>
                      {[0,0.18,0.09].map((d,i)=>(<motion.span key={i} className="w-1 rounded-full bg-emerald-500"
                        animate={{height:["3px","11px","3px"]}} transition={{repeat:Infinity,duration:0.75,delay:d}}/>))}
                    </span>Playing</>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.span key={xp} initial={{scale:1.35}} animate={{scale:1}} transition={{type:"spring",stiffness:400,damping:18}}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black"
              style={{background:P.warmBg,border:`1px solid ${P.warmBorder}`,color:"#C47D0A"}}>
              <Zap size={16}/> {xp} XP
            </motion.span>
            <button onClick={resetLesson} className="rounded-full bg-cream p-3 shadow-soft border border-line"><RotateCcw size={16} className="text-body"/></button>
            <button onClick={()=>{
              setNarrating(v=>!v);
              if(narrating){if(audioRef.current){audioRef.current.pause();audioRef.current=null;}window.speechSynthesis?.cancel();setAudioStatus("idle");}
            }} className={`rounded-full p-3 shadow-soft border transition ${narrating?"border-glow/40 bg-glow/10 text-glow":"border-line bg-cream text-muted"}`}>
              {narrating?<Volume2 size={16}/>:<VolumeX size={16}/>}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-line">
          <motion.div className="h-full rounded-full" style={{background:`linear-gradient(90deg,${P.warm},${P.gold})`}}
            animate={{width:`${Math.min((xp/35)*100,100)}%`}} transition={{duration:0.6}}/>
        </div>
      </div>

      {/* Mission pills */}
      <div className="border-b border-line py-3.5 bg-cream/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4">
          {SCENES.map((s,i)=>{
            const unlocked=i<=maxUnlocked,done=!!completeScenes[i];
            return(<button key={s.id} onClick={()=>unlocked&&setScene(i)} disabled={!unlocked}
              className="rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] transition"
              style={{background:scene===i?"#1F1F1F":done?P.glowBg:P.cream,
                color:scene===i?"#fff":done?P.glow:unlocked?P.body:P.muted,
                borderColor:scene===i?"#1F1F1F":done?P.glow:unlocked?P.line:"transparent",
                opacity:!unlocked?0.35:1,cursor:!unlocked?"not-allowed":"pointer"}}>
              {done?"✓ ":""}{s.pill}
            </button>);
          })}
        </div>
      </div>

      {/* Main content */}
      <section className="min-h-[calc(100vh-178px)] px-6 pb-28 pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={`${scene}-${phase}`}
            initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.28}}
            className="mx-auto max-w-6xl">

            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-[0.5em] text-warm">{SCENES[scene].eyebrow}</p>
              <h1 className="mt-2 font-display text-4xl leading-tight tracking-[-0.03em] text-ink md:text-5xl">{SCENES[scene].title}</h1>
              {phase==="learn"&&learnData.length>0&&(
                <div className="mt-3 flex justify-center gap-1.5">
                  {learnData.map((_,i)=>(<span key={i} className="inline-block h-1.5 w-7 rounded-full transition-all"
                    style={{background:i<learnStep?P.glow:i===learnStep?P.warm:P.line}}/>))}
                </div>
              )}
            </div>

            {/* Two-column: compact Nova left, wide widget right */}
            <div className="grid items-start gap-6 md:grid-cols-[220px_1fr]">

              {/* Nova — compact column */}
              <div className="flex flex-col items-center gap-3">
                <TutorMascot/>
                <div className="relative w-full">
                  <div className="absolute -left-2 top-6 h-0 w-0 border-y-6 border-r-[10px] border-y-transparent" style={{borderRightColor:P.cream}}/>
                  <div className="rounded-2xl border px-4 py-3 text-sm font-semibold leading-[1.65]"
                    style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow,color:P.body}}>
                    {thinking?(<span className="flex items-center gap-2 italic" style={{color:P.muted}}>
                      <span className="inline-flex gap-1">{[0,0.15,0.3].map(d=>(<motion.span key={d} className="inline-block h-1.5 w-1.5 rounded-full" style={{background:P.muted}}
                        animate={{y:[-3,0,-3]}} transition={{repeat:Infinity,duration:0.8,delay:d}}/>))}</span>Thinking…</span>
                    ):(<AnimatePresence mode="wait"><motion.span key={tutorText} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                      exit={{opacity:0}} transition={{duration:0.22}}>{tutorText}</motion.span></AnimatePresence>)}
                  </div>
                </div>
              </div>

              {/* Widget — wide column */}
              <div className="flex flex-col items-center gap-4">
                {phase==="learn"&&learnData.length>0?(
                  <LearnWidget key={learnStep} data={learnData[learnStep]} onCorrect={handleLearnCorrect} onWrong={handleLearnWrong}/>
                ):(
                  <>
                    {scene===0&&<DockPractice svgRef={svgRef} onGridClick={handleDockClick} dockIdx={dockIdx} shipPos={shipPos} clickOk={clickOk} ripple={dockRipple} currentTarget={DOCK_TARGETS[Math.min(dockIdx,DOCK_TARGETS.length-1)]}/>}
                    {scene===1&&<SlopePractice onCorrect={()=>celebrate("slope")} onWrong={h=>{setTutor(h,h);}} askNova={askNova}/>}
                    {scene===2&&<YIntPractice onCorrect={()=>celebrate("yint")} onWrong={h=>{setTutor(h,h);}} askNova={askNova}/>}
                    {scene===3&&<EquationBuilder m={builderM} b={builderB}
                      onM={v=>{setBuilderM(v);setLastAction(`m=${v}`);if(v===2&&builderB===1)celebrate("formula");else scheduleEquationHint(v,builderB);}}
                      onB={v=>{setBuilderB(v);setLastAction(`b=${v}`);if(builderM===2&&v===1)celebrate("formula");else scheduleEquationHint(builderM,v);}}/>}
                    {scene===4&&<ParallelPractice value={parallelAns} onChange={v=>{setParallelAns(v);setLastAction(v);
                      if(v==="y = 3x + 5")celebrate("parallel");
                      else setTutor("Not parallel — check the slopes match!","Parallel lines must share the same slope. The original y = 3x + 2 has slope 3. Which option also has slope 3?");}}/>}
                    {scene===5&&<TwoPointsPractice slope={tp2Slope} b={tp2B}
                      onSlope={v=>{setTp2Slope(v);if(v==="Slope = 2"){setTutor("Slope = 2! ✓ Now find b using point (1,3).","Slope equals 2! Now substitute into y = 2x + b using point (1,3): 3 = 2(1) + b. What is b?");}
                        else setTutor("Recalculate: (7−3) ÷ (3−1) = ?","The slope formula: y2 minus y1, divided by x2 minus x1. Try 7 minus 3 over 3 minus 1.");}}
                      onB={v=>{setTp2B(v);if(v==="b = 1")celebrate("twopts");
                        else setTutor("Try again: 3 = 2(1) + b → b = ?","Substitute x=1, y=3 into y = 2x + b. That gives 3 = 2 + b. Subtract 2 from both sides.");}}/>}
                    {scene===6&&<BossMission bossM={bossM} bossB={bossB} bossGate={bossGate} onM={setBossM} onB={setBossB}
                      onGate={v=>{setBossGate(v);setLastAction(`Gate: ${v}`);
                        if(bossM==="2"&&bossB==="2"&&v==="yes"){celebrate("boss");burstSides();}
                        else askNova({type:"hint",scene:"boss",studentAnswer:`m=${bossM},b=${bossB},gate=${v}`,correctAnswer:"m=2,b=2,gate=yes",concept:"y=2x+2, at x=3: y=8, so (3,8) is on the path"});
                      }} askNova={askNova}/>}

                    {/* Debrief + summary */}
                    <AnimatePresence>
                      {(isSceneComplete||missionDone)&&(
                        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="w-full max-w-md space-y-4">
                          <div className="rounded-2xl border px-6 py-4" style={{background:P.glowBg,borderColor:"rgba(66,196,106,0.3)"}}>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em]" style={{color:P.glow}}>MISSION COMPLETE 🌟</p>
                            <p className="mt-2 text-sm font-semibold leading-6" style={{color:"#2E5E30"}}>{SCENES[scene].debrief}</p>
                            <p className="mt-2 text-xs font-bold" style={{color:P.glow}}>+5 XP earned!</p>
                          </div>
                          <MissionSummary sceneId={SCENES[scene].id}/>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <AnimatePresence mode="wait">
            {lastAction?(<motion.div key={lastAction} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className="rounded-full border px-4 py-2 text-xs font-semibold"
              style={{background:lastAction.includes("✓")?P.glowBg:lastAction.includes("✗")?"rgba(220,50,50,0.06)":P.cream,
                borderColor:lastAction.includes("✓")?"rgba(66,196,106,0.35)":lastAction.includes("✗")?"rgba(220,50,50,0.3)":P.line,
                color:lastAction.includes("✓")?P.glow:lastAction.includes("✗")?"#C04040":P.body}}>
              💬 {lastAction}
            </motion.div>):(
              <div className="rounded-full border border-line bg-cream px-4 py-2 text-xs font-semibold text-muted">
                💬 {phase==="learn"?"Answer to advance automatically…":"Awaiting your move…"}
              </div>
            )}
          </AnimatePresence>
          <p className="hidden text-xs font-bold uppercase tracking-[0.35em] text-muted md:block">
            {phase==="learn"?"LEARNING — advances on correct answer":"PRACTICE"}
          </p>
          {(isSceneComplete||missionDone)&&(
            <motion.button onClick={nextScene} whileHover={{scale:1.03}} whileTap={{scale:0.97}}
              className="rounded-full px-7 py-4 text-sm font-bold text-white"
              style={{background:"#1F1F1F",boxShadow:"0 4px 16px rgba(30,30,30,0.2)"}}>
              {scene===6?"Complete! 🎉":"Next mission →"}
            </motion.button>
          )}
        </div>
      </div>

      <FloatingRaiseHand onQuestion={q=>askNova({type:"question",scene:SCENES[scene].id,studentQuestion:q})} disabled={thinking}/>
    </main>
  );
}

// ── Mission summary card ──────────────────────────────────────────────────────
function MissionSummary({sceneId}){
  const s=SUMMARIES[sceneId];
  if(!s)return null;
  return(
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.4}}
      className="rounded-2xl border px-6 py-5" style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow}}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{s.emoji}</span>
        <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{color:P.muted}}>WHAT YOU LEARNED</p>
      </div>
      <p className="text-sm font-black mb-3" style={{color:P.ink}}>{s.title}</p>
      <ul className="space-y-2">
        {s.points.map((pt,i)=>(<li key={i} className="flex items-start gap-2.5">
          <span className="mt-0.5 text-xs font-black" style={{color:P.warm}}>✦</span>
          <span className="text-xs font-semibold leading-5" style={{color:P.body}}>{pt}</span>
        </li>))}
      </ul>
    </motion.div>
  );
}

// ── Learn widget dispatcher ────────────────────────────────────────────────────
function LearnWidget({data,onCorrect,onWrong}){
  if(!data)return null;
  if(data.type==="axis")      return<AxisWidget      data={data} onCorrect={onCorrect} onWrong={onWrong}/>;
  if(data.type==="intercept") return<InterceptWidget data={data} onCorrect={onCorrect} onWrong={onWrong}/>;
  if(data.type==="lane")      return<LaneLearnWidget data={data} onCorrect={onCorrect} onWrong={onWrong}/>;
  if(data.type==="mcq")       return<McqWidget       data={data} onCorrect={onCorrect} onWrong={onWrong}/>;
  return null;
}

function AxisWidget({data,onCorrect,onWrong}){
  const ref=useRef(null);const[answered,setAnswered]=useState(false);
  function handleClick(e){
    if(answered)return;
    const rect=ref.current.getBoundingClientRect();
    const svgX=((e.clientX-rect.left)/rect.width)*GW;
    const svgY=((e.clientY-rect.top)/rect.height)*GH;
    const nearX=Math.abs(svgY-sy(0))<24&&svgX>PAD&&svgX<GW-PAD;
    const nearY=Math.abs(svgX-sx(0))<24&&svgY>PAD/2&&svgY<GH-PAD/2;
    if(!nearX&&!nearY)return;
    const hit=nearX?"x":"y";
    if(hit===data.target){setAnswered(true);onCorrect(data.exp,data.expSpoken);}
    else onWrong(data.wrongHint||data.hint);
  }
  return(<svg ref={ref} viewBox={`0 0 ${GW} ${GH}`} className="w-full max-w-md cursor-pointer rounded-2xl"
    style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}} onClick={handleClick}>
    <GridBase hX={answered&&data.target==="x"} hY={answered&&data.target==="y"}/>
    {!answered&&<text x={GW/2} y={GH/2} textAnchor="middle" fill={P.muted} fontSize="13" fontWeight="600">Click on an axis line 👆</text>}
    {answered&&data.target==="x"&&<text x={GW-PAD} y={sy(0)-12} textAnchor="end" fill={P.warm} fontSize="13" fontWeight="800">→ That's the X-axis!</text>}
    {answered&&data.target==="y"&&<text x={sx(0)+12} y={PAD+6} fill={P.warm} fontSize="13" fontWeight="800">↑ That's the Y-axis!</text>}
  </svg>);
}

function McqWidget({data,onCorrect,onWrong}){
  const[sel,setSel]=useState(null);const[answered,setAnswered]=useState(false);
  function pick(opt){
    if(answered)return;setSel(opt);
    if(opt===data.correct){setAnswered(true);onCorrect(data.exp,data.expSpoken);}
    else onWrong(data.hint||"Think carefully and try again!");
  }
  const p1=[1,2],p2=[4,8];
  return(<div className="w-full max-w-md space-y-4">
    {data.showSlope&&(<svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <line x1={sx(p1[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p2[1])} stroke={P.blue} strokeWidth="2.5"/>
      <line x1={sx(p1[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p1[1])} stroke={P.gold} strokeWidth="2" strokeDasharray="5 3"/>
      <line x1={sx(p2[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p2[1])} stroke="#8B5CF6" strokeWidth="2" strokeDasharray="5 3"/>
      <text x={sx((p1[0]+p2[0])/2)} y={sy(p1[1])+17} textAnchor="middle" fill="#C47D0A" fontSize="11" fontWeight="700">← run →</text>
      <text x={sx(p2[0])+26} y={sy((p1[1]+p2[1])/2)+4} fill="#7C3AED" fontSize="11" fontWeight="700">↑ rise</text>
      <circle cx={sx(p1[0])} cy={sy(p1[1])} r="6" fill={P.blue}/>
      <text x={sx(p1[0])-14} y={sy(p1[1])+4} fill={P.blue} fontSize="9" fontWeight="700">(1,2)</text>
      <circle cx={sx(p2[0])} cy={sy(p2[1])} r="6" fill={P.blue}/>
      <text x={sx(p2[0])+10} y={sy(p2[1])-8} fill={P.blue} fontSize="9" fontWeight="700">(4,8)</text>
    </svg>)}
    {data.stars&&(<svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      {data.stars.map(([px,py],i)=>(<g key={i}>
        <circle cx={sx(px)} cy={sy(py)} r="8" fill={i===0?P.blue:P.warm}/>
        <text x={sx(px)+14} y={sy(py)-10} fill={i===0?P.blue:P.warm} fontSize="10" fontWeight="800">({px},{py})</text>
      </g>))}
      {answered&&(()=>{const pts=data.stars;const m=(pts[1][1]-pts[0][1])/(pts[1][0]-pts[0][0]);const b2=pts[0][1]-m*pts[0][0];const p=[];for(let x=0;x<=8;x+=.25){const y=m*x+b2;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return<polyline points={p.join(" ")} fill="none" stroke={P.glow} strokeWidth="2" strokeDasharray="6 3"/>;})()}
    </svg>)}
    <div className="grid grid-cols-2 gap-4">
      {data.options.map(opt=>{const ch=sel===opt,ok=opt===data.correct;return(
        <motion.button key={opt} whileTap={{scale:0.93}} onClick={()=>pick(opt)}
          className="rounded-2xl border-2 px-4 text-base font-black text-center transition"
          style={{paddingTop:"20px",paddingBottom:"20px",minHeight:"76px",
            background:ch&&ok?P.glowBg:ch?"rgba(220,50,50,0.07)":P.blue,
            borderColor:ch&&ok?P.glow:ch?"#DC3232":P.gold,color:ch&&ok?P.glow:ch?"#DC3232":"#fff"}}>
          {opt}{ch&&<span className="block text-sm mt-1">{ok?"✓ Correct!":"✗ Try again"}</span>}
        </motion.button>
      );})}
    </div>
    {answered&&<p className="text-center text-sm font-black" style={{color:P.glow}}>{data.exp}</p>}
  </div>);
}

function InterceptWidget({data,onCorrect,onWrong}){
  const ref=useRef(null);const[answered,setAnswered]=useState(false);
  function pts(){const p=[];for(let x=0;x<=8;x+=.25){const y=x+3;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  function handleClick(e){
    if(answered)return;
    const rect=ref.current.getBoundingClientRect();
    const svgX=((e.clientX-rect.left)/rect.width)*GW;
    const svgY=((e.clientY-rect.top)/rect.height)*GH;
    if(Math.abs(svgX-sx(0))<26&&Math.abs(svgY-sy(3))<26){setAnswered(true);onCorrect(data.exp,data.expSpoken);}
    else if(Math.abs(svgX-sx(0))<26)onWrong("Close! You found the Y-axis — now find exactly where the line crosses it.");
    else onWrong(data.hint);
  }
  return(<svg ref={ref} viewBox={`0 0 ${GW} ${GH}`} className="w-full max-w-md cursor-crosshair rounded-2xl"
    style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}} onClick={handleClick}>
    <GridBase hY={answered}/>
    <polyline points={pts()} fill="none" stroke={P.blue} strokeWidth="2.5"/>
    {answered&&<g>
      <circle cx={sx(0)} cy={sy(3)} r="10" fill={P.warmBg} stroke={P.warm} strokeWidth="2.5"/>
      <text x={sx(0)+14} y={sy(3)-10} fill={P.warm} fontSize="11" fontWeight="700">y-intercept = 3</text>
    </g>}
    {!answered&&<text x={GW/2} y={GH/2+40} textAnchor="middle" fill={P.muted} fontSize="11">Click where the line meets the Y-axis</text>}
  </svg>);
}

function LaneLearnWidget({data,onCorrect,onWrong}){
  const[sel,setSel]=useState(null);
  const COLORS=["#F59E0B",P.blue,"#8B5CF6"];
  function pts(b){const p=[];for(let x=0;x<=8;x+=.25){const y=x+b;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  return(<div className="w-full max-w-md space-y-3">
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full cursor-pointer rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <circle cx={sx(0)} cy={sy(3)} r="11" fill={P.glowBg} stroke={P.glow} strokeWidth="2"/>
      <text x={sx(0)} y={sy(3)+5} textAnchor="middle" fontSize="13">🛸</text>
      <text x={sx(0)+18} y={sy(3)-12} fill={P.glow} fontSize="10" fontWeight="800">station y=3</text>
      {[{b:0},{b:3},{b:6}].map((lane,i)=>(<g key={i} onClick={()=>{
        setSel(i);if(i===data.correct){onCorrect(data.exp,data.expSpoken);}
        else onWrong(`Lane ${["A","B","C"][i]} has y-intercept ${lane.b} — not 3. Look for the lane that crosses the Y-axis at height 3.`);
      }} style={{cursor:"pointer"}}>
        <polyline points={pts(lane.b)} fill="none" stroke={sel===i?COLORS[i]:`${COLORS[i]}55`} strokeWidth={sel===i?3.5:2}/>
        <circle cx={sx(0)} cy={sy(lane.b)} r={sel===i?8:5} fill={sel===i?COLORS[i]:`${COLORS[i]}88`}/>
        <text x={sx(6.5)} y={sy(6.5+lane.b)-8} fill={COLORS[i]} fontSize="10" fontWeight="800">Lane {["A","B","C"][i]}</text>
      </g>))}
    </svg>
  </div>);
}

// ── Practice widgets ───────────────────────────────────────────────────────────
function DockPractice({svgRef,onGridClick,dockIdx,shipPos,clickOk,currentTarget,ripple}){
  const[tx,ty]=currentTarget;
  return(<div className="flex w-full max-w-md flex-col items-center gap-4">
    <div className="w-full rounded-2xl border px-5 py-3 text-center" style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow}}>
      {dockIdx<DOCK_TARGETS.length?(<>
        <p className="text-sm font-bold text-body">{["First stop:","Next target:","Final target:"][dockIdx]}</p>
        <p className="mt-1 text-3xl font-black text-ink">({tx},&thinsp;{ty})</p>
        <p className="mt-1 text-xs text-muted">{tx} steps right · {ty} steps up — click the grid!</p>
      </>):<p className="text-base font-black" style={{color:P.glow}}>All three confirmed ✓</p>}
      <div className="mt-2 flex justify-center gap-2">{DOCK_TARGETS.map((_,i)=>(<span key={i} className="inline-block h-1.5 w-8 rounded-full transition" style={{background:i<dockIdx?P.glow:P.line}}/>))}</div>
    </div>
    <svg ref={svgRef} viewBox={`0 0 ${GW} ${GH}`} className="w-full cursor-crosshair rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}} onClick={onGridClick}>
      <GridBase/>
      {Array.from({length:UNITS+1},(_,i)=>Array.from({length:UNITS+1},(_,j)=>(<circle key={`${i}-${j}`} cx={sx(i)} cy={sy(j)} r="2.5" fill="rgba(180,155,130,0.22)"/>)))}
      {DOCK_TARGETS.slice(0,dockIdx).map(([dx,dy],i)=>(<g key={i}><circle cx={sx(dx)} cy={sy(dy)} r="13" fill={P.glowBg} stroke={P.glow} strokeWidth="1.5"/><text x={sx(dx)} y={sy(dy)+5} textAnchor="middle" fontSize="14">✅</text></g>))}
      {shipPos&&clickOk===false&&(<g><circle cx={sx(shipPos[0])} cy={sy(shipPos[1])} r="11" fill="rgba(220,50,50,0.08)" stroke="#DC3232" strokeWidth="1.5"/><text x={sx(shipPos[0])} y={sy(shipPos[1])+6} textAnchor="middle" fontSize="14">✗</text></g>)}
      {ripple&&(<motion.circle cx={sx(ripple.x)} cy={sy(ripple.y)} initial={{r:6,opacity:1,strokeWidth:3}} animate={{r:32,opacity:0,strokeWidth:0}} transition={{duration:0.65,ease:"easeOut"}} fill="none" stroke={P.glow}/>)}
    </svg>
  </div>);
}

function SlopePractice({onCorrect,onWrong,askNova}){
  const[sel,setSel]=useState(null);
  const p1=[1,2],p2=[3,8]; // slope = (8-2)/(3-1) = 6/2 = 3
  const rise=8-2,run=3-1;
  const opts=["1","2","3","6"];
  return(<div className="w-full max-w-md space-y-4">
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <line x1={sx(p1[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p2[1])} stroke={P.blue} strokeWidth="2.5"/>
      <line x1={sx(p1[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p1[1])} stroke={P.gold} strokeWidth="2" strokeDasharray="5 3"/>
      <line x1={sx(p2[0])} y1={sy(p1[1])} x2={sx(p2[0])} y2={sy(p2[1])} stroke="#8B5CF6" strokeWidth="2" strokeDasharray="5 3"/>
      <text x={sx((p1[0]+p2[0])/2)} y={sy(p1[1])+17} textAnchor="middle" fill="#C47D0A" fontSize="11" fontWeight="700">run = {run}</text>
      <text x={sx(p2[0])+26} y={sy((p1[1]+p2[1])/2)+4} fill="#7C3AED" fontSize="11" fontWeight="700">rise = {rise}</text>
      <circle cx={sx(p1[0])} cy={sy(p1[1])} r="6" fill={P.blue}/>
      <text x={sx(p1[0])-16} y={sy(p1[1])+4} fill={P.blue} fontSize="9" fontWeight="700">({p1[0]},{p1[1]})</text>
      <circle cx={sx(p2[0])} cy={sy(p2[1])} r="6" fill={P.blue}/>
      <text x={sx(p2[0])+10} y={sy(p2[1])-8} fill={P.blue} fontSize="9" fontWeight="700">({p2[0]},{p2[1]})</text>
    </svg>
    <div className="rounded-2xl border p-5" style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow}}>
      <p className="mb-4 text-center text-sm font-bold text-body">slope = rise ÷ run = {rise} ÷ {run} = ?</p>
      <div className="grid grid-cols-4 gap-3">
        {opts.map(o=>{const ch=sel===o,ok=o==="3";return(
          <motion.button key={o} whileTap={{scale:0.92}} onClick={()=>{setSel(o);if(ok)onCorrect();else onWrong("Slope = rise ÷ run. Count the rise and run on the diagram then divide!");}}
            className="flex flex-col items-center rounded-2xl border-2 py-4 font-black transition"
            style={{background:ch&&ok?P.glowBg:ch?"rgba(220,50,50,0.07)":P.blue,borderColor:ch&&ok?P.glow:ch?"#DC3232":P.gold,color:ch&&ok?P.glow:ch?"#DC3232":"#fff"}}>
            <span className="text-2xl">{o}</span>{ch&&<span className="mt-1 text-xs">{ok?"✓ Correct!":"✗"}</span>}
          </motion.button>
        );})}
      </div>
      {sel==="3"&&<p className="mt-4 text-center text-sm font-black" style={{color:P.glow}}>Slope = 3! For every step right, this lane climbs 3 steps up! 🚀</p>}
    </div>
  </div>);
}

function YIntPractice({onCorrect,onWrong}){
  const[sel,setSel]=useState(null);
  const STATION_Y=4;
  const LANES=[{b:1,label:"A"},{b:4,label:"B"},{b:7,label:"C"}];
  const COLORS=["#F59E0B",P.blue,"#8B5CF6"];
  function pts(b){const p=[];for(let x=0;x<=8;x+=.25){const y=x+b;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  return(<div className="w-full max-w-md space-y-4">
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full cursor-pointer rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <circle cx={sx(0)} cy={sy(STATION_Y)} r="12" fill={P.glowBg} stroke={P.glow} strokeWidth="2"/>
      <text x={sx(0)} y={sy(STATION_Y)+5} textAnchor="middle" fontSize="14">🛸</text>
      <text x={sx(0)+20} y={sy(STATION_Y)-12} fill={P.glow} fontSize="10" fontWeight="800">station y={STATION_Y}</text>
      {LANES.map((lane,i)=>(<g key={i} onClick={()=>{setSel(i);if(i===1)onCorrect();else onWrong(`Lane ${lane.label} has y-intercept ${lane.b} — not ${STATION_Y}. Which lane crosses the Y-axis at height ${STATION_Y}?`);}} style={{cursor:"pointer"}}>
        <polyline points={pts(lane.b)} fill="none" stroke={sel===i?COLORS[i]:`${COLORS[i]}55`} strokeWidth={sel===i?3.5:2}/>
        <circle cx={sx(0)} cy={sy(lane.b)} r={sel===i?8:5} fill={sel===i?COLORS[i]:`${COLORS[i]}88`}/>
        <text x={sx(6.5)} y={sy(6.5+lane.b)-8} fill={COLORS[i]} fontSize="10" fontWeight="800">Lane {lane.label}</text>
      </g>))}
    </svg>
    {sel!==null&&<p className="text-center text-sm font-bold" style={{color:sel===1?P.glow:"#DC3232"}}>{sel===1?`✓ Lane B enters at y=${STATION_Y} — station reached!`:`✗ Lane ${LANES[sel].label} enters at y=${LANES[sel].b}, not y=${STATION_Y}.`}</p>}
  </div>);
}

function EquationBuilder({m,b,onM,onB}){
  const TM=2,TB=1,correct=m===TM&&b===TB;
  function pts(m,b){const p=[];for(let x=0;x<=8;x+=.25){const y=m*x+b;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  return(<div className="w-full max-w-md space-y-4">
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <polyline points={pts(TM,TB)} fill="none" stroke={P.warm} strokeWidth="2" strokeDasharray="7 4" opacity="0.7"/>
      <text x={sx(2.5)} y={sy(TM*2.5+TB)-12} fill={P.warm} fontSize="10" fontWeight="700">▶ TARGET PATH</text>
      <polyline points={pts(m,b)} fill="none" stroke={correct?P.glow:P.blue} strokeWidth="3" style={{filter:correct?`drop-shadow(0 0 6px ${P.glow})`:undefined}}/>
      <circle cx={sx(0)} cy={sy(b)} r="6" fill={correct?P.glow:P.blue}/>
    </svg>
    <div className="rounded-2xl border p-5 space-y-4" style={{background:P.cream,borderColor:correct?P.glow:P.line,boxShadow:P.shadow,transition:"border-color 0.3s"}}>
      <p className="text-center text-lg font-black text-ink">y = <span style={{color:m===TM?P.glow:P.blue}}>{m}</span>x + <span style={{color:b===TB?P.glow:"#8B5CF6"}}>{b}</span></p>
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-bold"><span style={{color:P.blue}}>Slope (m) = {m}</span>{m===TM&&<span style={{color:P.glow}}>✓</span>}</div>
        <input type="range" min="0" max="4" step="0.5" value={m} onChange={e=>onM(Number(e.target.value))} className="w-full accent-blue-700"/>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-bold"><span style={{color:"#8B5CF6"}}>Y-intercept (b) = {b}</span>{b===TB&&<span style={{color:P.glow}}>✓</span>}</div>
        <input type="range" min="0" max="5" step="1" value={b} onChange={e=>onB(Number(e.target.value))} className="w-full accent-purple-600"/>
      </div>
      <AnimatePresence>{correct&&<motion.p initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center text-sm font-black" style={{color:P.glow}}>✓ y = 2x + 1 matched perfectly! 🎯</motion.p>}</AnimatePresence>
    </div>
  </div>);
}

function ParallelPractice({value,onChange}){
  const CORRECT="y = 3x + 5";
  const opts=["y = 3x + 5","y = 2x + 5","y = 4x + 2","y = x + 3"];
  return(<div className="w-full max-w-md space-y-4">
    <div className="rounded-2xl border p-5" style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow}}>
      <p className="text-center text-sm font-bold text-body mb-1">Original lane: <strong>y = 3x + 2</strong> (slope = 3)</p>
      <p className="text-center text-xs text-muted mb-5">Which equation gives a PARALLEL lane?</p>
      <div className="grid grid-cols-2 gap-4">
        {opts.map(o=>{const ch=value===o,ok=o===CORRECT;return(
          <motion.button key={o} whileTap={{scale:0.93}} onClick={()=>onChange(o)}
            className="rounded-2xl border-2 px-3 text-base font-black text-center transition"
            style={{paddingTop:"18px",paddingBottom:"18px",minHeight:"72px",
              background:ch&&ok?P.glowBg:ch?"rgba(220,50,50,0.07)":P.blue,
              borderColor:ch&&ok?P.glow:ch?"#DC3232":P.gold,color:ch&&ok?P.glow:ch?"#DC3232":"#fff"}}>
            {o}{ch&&<span className="block text-xs mt-1">{ok?"✓ Correct!":"✗ Wrong slope"}</span>}
          </motion.button>
        );})}
      </div>
      {value===CORRECT&&<p className="mt-5 text-center text-sm font-black" style={{color:P.glow}}>✓ Same slope (3), different y-intercept. Parallel!</p>}
    </div>
  </div>);
}

function TwoPointsPractice({slope,b,onSlope,onB}){
  const slopeOpts=["Slope = 2","Slope = 4","Slope = 0.5","Slope = 3"];
  const bOpts=["b = 1","b = 2","b = 3","b = 5"];
  function pts2(m,b2){const p=[];for(let x=0;x<=8;x+=.25){const y=m*x+b2;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  return(<div className="w-full max-w-md space-y-4">
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <circle cx={sx(1)} cy={sy(3)} r="8" fill={P.blue}/><text x={sx(1)+14} y={sy(3)-10} fill={P.blue} fontSize="10" fontWeight="800">Star A (1,3)</text>
      <circle cx={sx(3)} cy={sy(7)} r="8" fill={P.warm}/><text x={sx(3)+14} y={sy(7)-10} fill={P.warm} fontSize="10" fontWeight="800">Star B (3,7)</text>
      {slope==="Slope = 2"&&b==="b = 1"&&<polyline points={pts2(2,1)} fill="none" stroke={P.glow} strokeWidth="2.5" style={{filter:`drop-shadow(0 0 5px ${P.glow})`}}/>}
    </svg>
    <div className="rounded-2xl border p-5 space-y-4" style={{background:P.cream,borderColor:P.line,boxShadow:P.shadow}}>
      <p className="text-center text-xs font-bold text-muted uppercase tracking-wider">Step 1: Calculate slope = (7−3) ÷ (3−1)</p>
      <div className="grid grid-cols-2 gap-3">
        {slopeOpts.map(o=>{const ch=slope===o,ok=o==="Slope = 2";return(
          <motion.button key={o} whileTap={{scale:0.93}} disabled={!!slope} onClick={()=>onSlope(o)}
            className="rounded-2xl border-2 py-3 text-sm font-black text-center transition disabled:opacity-60"
            style={{background:ch&&ok?P.glowBg:ch?"rgba(220,50,50,0.07)":P.blue,borderColor:ch&&ok?P.glow:ch?"#DC3232":P.gold,color:ch&&ok?P.glow:ch?"#DC3232":"#fff"}}>
            {o}{ch&&(ok?" ✓":" ✗")}</motion.button>
        );})}
      </div>
      <AnimatePresence>{slope==="Slope = 2"&&(<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
        <p className="text-center text-xs font-bold text-muted uppercase tracking-wider mt-2">Step 2: Find b — use point (1, 3)</p>
        <p className="text-center text-xs text-muted mt-1 mb-3">3 = 2(1) + b → b = ?</p>
        <div className="grid grid-cols-2 gap-3">
          {bOpts.map(o=>{const ch=b===o,ok=o==="b = 1";return(
            <motion.button key={o} whileTap={{scale:0.93}} disabled={!!b} onClick={()=>onB(o)}
              className="rounded-2xl border-2 py-3 text-sm font-black text-center transition disabled:opacity-60"
              style={{background:ch&&ok?P.glowBg:ch?"rgba(220,50,50,0.07)":P.blue,borderColor:ch&&ok?P.glow:ch?"#DC3232":P.gold,color:ch&&ok?P.glow:ch?"#DC3232":"#fff"}}>
              {o}{ch&&(ok?" ✓":" ✗")}</motion.button>
          );})}
        </div>
      </motion.div>)}</AnimatePresence>
      {slope==="Slope = 2"&&b==="b = 1"&&<p className="text-center font-black mt-2" style={{color:P.glow}}>Equation: y = 2x + 1 ✓ A lane through both stars!</p>}
    </div>
  </div>);
}

function BossMission({bossM,bossB,bossGate,onM,onB,onGate,askNova}){
  const mOk=bossM==="2",bOk=bossB==="2",mBad=bossM!==""&&!mOk,bBad=bossB!==""&&!bOk,eqOk=mOk&&bOk;
  function pts(m,b){const p=[];for(let x=0;x<=8;x+=.25){const y=m*x+b;if(y>=0&&y<=8)p.push(`${sx(x)},${sy(y)}`)}return p.join(" ");}
  const pathPts=(bossM&&bossB)?pts(Number(bossM),Number(bossB)):"";
  function fld(ok,bad){if(ok)return{borderColor:P.glow,background:"rgba(66,196,106,0.08)",color:"#1A5E30"};if(bad)return{borderColor:"#DC3232",background:"rgba(220,50,50,0.06)",color:"#8B0000"};return{borderColor:P.line,background:P.cream,color:P.ink};}
  return(<div className="w-full max-w-md space-y-4">
    <div className="rounded-2xl border px-5 py-4" style={{background:P.warmBg,borderColor:P.warmBorder}}>
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-warm">FINAL MISSION</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-ink">Entry at <strong style={{color:P.blue}}>(0, 2)</strong> · slope <strong style={{color:P.blue}}>2</strong> · Warp Gate at <strong style={{color:P.warm}}>(3, 8)</strong>.<br/>Write y = mx + b then verify the gate.</p>
    </div>
    <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full rounded-2xl" style={{border:`1px solid ${P.line}`,boxShadow:P.shadow}}>
      <GridBase/>
      <circle cx={sx(0)} cy={sy(2)} r="7" fill={P.blue} style={{filter:`drop-shadow(0 0 5px ${P.blue})`}}/>
      <text x={sx(0)+14} y={sy(2)-10} fill={P.blue} fontSize="10" fontWeight="800">entry (0,2)</text>
      <circle cx={sx(3)} cy={sy(8)} r="16" fill={P.warmBg} stroke={P.warm} strokeWidth="2" strokeDasharray="4 2" style={{filter:`drop-shadow(0 0 8px rgba(244,163,64,0.4))`}}/>
      <text x={sx(3)} y={sy(8)+5} textAnchor="middle" fontSize="15">🌀</text>
      <text x={sx(3)+20} y={sy(8)-14} fill={P.warm} fontSize="10" fontWeight="800">GATE (3,8)</text>
      {pathPts&&<polyline points={pathPts} fill="none" stroke={eqOk?P.glow:P.blue} strokeWidth="2.5" style={{filter:eqOk?`drop-shadow(0 0 5px ${P.glow})`:undefined}}/>}
    </svg>
    <div className="rounded-2xl border p-5 space-y-4" style={{background:P.cream,borderColor:eqOk?P.glow:P.line,boxShadow:P.shadow}}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-body text-sm">y =</span>
        <motion.div animate={mBad?{x:[-5,5,-5,5,0]}:{}} transition={{duration:0.3}}>
          <input value={bossM} onChange={e=>onM(e.target.value)} placeholder="m"
            className="w-16 rounded-xl border px-3 py-2.5 text-center text-xl font-black outline-none transition" style={fld(mOk,mBad)}/>
        </motion.div>
        <span className="text-body text-sm">x +</span>
        <motion.div animate={bBad?{x:[-5,5,-5,5,0]}:{}} transition={{duration:0.3}}>
          <input value={bossB} onChange={e=>onB(e.target.value)} placeholder="b"
            className="w-16 rounded-xl border px-3 py-2.5 text-center text-xl font-black outline-none transition" style={fld(bOk,bBad)}/>
        </motion.div>
      </div>
      <AnimatePresence>
        {eqOk&&!bossGate&&(<motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="space-y-3">
          <p className="text-center text-sm font-black" style={{color:P.glow}}>✓ y = 2x + 2 confirmed! Substitute x=3:</p>
          <p className="text-center text-xs text-muted">y = 2(3) + 2 = ? — does it equal 8?</p>
          <div className="flex gap-3 justify-center">
            {["yes","no"].map(v=>(<motion.button key={v} whileTap={{scale:0.94}} onClick={()=>onGate(v)}
              className="rounded-xl border-2 px-6 py-3 text-sm font-black transition"
              style={{background:v==="yes"?P.glowBg:"rgba(220,50,50,0.06)",borderColor:v==="yes"?P.glow:"#DC3232",color:v==="yes"?P.glow:"#DC3232"}}>
              {v==="yes"?"✓ YES — hits (3,8)!":"✗ NO — misses"}</motion.button>))}
          </div>
        </motion.div>)}
        {bossGate&&(<motion.p initial={{scale:0.8}} animate={{scale:1}} className="text-center text-sm font-black"
          style={{color:bossGate==="yes"?P.glow:"#DC3232"}}>
          {bossGate==="yes"?"🌀 WARP GATE REACHED! 2(3)+2=8 ✓":"Check: 2×3+2=8. That IS (3,8) — the gate is reachable!"}
        </motion.p>)}
      </AnimatePresence>
      {!eqOk&&(bossM||bossB)&&<button onClick={()=>askNova({type:"hint",scene:"boss",studentAnswer:`m=${bossM},b=${bossB}`,correctAnswer:"m=2,b=2",concept:"entry y=2 slope=2 → y=2x+2"})}
        className="mx-auto flex rounded-full px-5 py-2 text-sm font-bold" style={{background:P.warmBg,color:P.warm,border:`1px solid ${P.warmBorder}`}}>Ask Nova for a hint</button>}
    </div>
  </div>);
}
