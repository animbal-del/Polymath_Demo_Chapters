# Polymath Mini: The Temperature Trap

A 4-minute AI-assisted interactive learning prototype inspired by the Polymath lesson format.

The lesson teaches **negative numbers** through a simple visual metaphor: temperature. Students drag a thermometer, cross below zero, walk across a number line, and solve a final boss problem.

## What this prototype demonstrates

- A Polymath-style lesson library card
- A scene-based interactive lesson flow
- SVG-based learning interactions
- XP and gated scene progression
- A warm AI tutor bubble
- Claude-powered adaptive hints through a backend API route
- Browser Text-to-Speech narration fallback
- A clean deployable Next.js prototype

## Lesson Concept

**Title:** The Temperature Trap  
**Subject:** Numbers · Foundations  
**Duration:** 4 minutes  
**Scenes:** 4  
**Boss Problem:** The temperature is -3°. It rises by 8°. Where does it end?

### Scene Flow

1. **The Freezing Line**  
   Student drags a thermometer from 10° to 0°.  
   Concept: Zero is a reference point, not the end of numbers.

2. **Below Zero**  
   Student drags the thermometer below zero.  
   Concept: Negative numbers represent values below zero.

3. **Number Walk**  
   Student moves a character on a number line.  
   Prompt: Start at -4. Move 6 steps warmer.  
   Correct answer: 2.

4. **Boss Problem**  
   Prompt: The temperature is -3°. It rises by 8°. Where does it end?  
   Correct answer: 5°.

## AI Layer

The AI tutor is intentionally lightweight for rapid prototyping.

The frontend sends lesson context to `/api/tutor`, including:

- current scene
- student answer/action
- correct answer
- misconception or concept being tested

The backend uses Claude when `ANTHROPIC_API_KEY` is available. If no key is set, the app falls back to local rule-based hints so the prototype still works during review.

Example payload:

```json
{
  "scene": "number_walk",
  "studentAnswer": -1,
  "correctAnswer": 2,
  "concept": "Warmer means moving right on the number line."
}
```

Example tutor response:

```txt
Warmer means move right. Start at -4 and count six steps to the right.
```

## Tech Stack

- **Frontend:** Next.js + React
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI Tutor:** Claude via Anthropic SDK
- **Voice:** Browser speechSynthesis for narration demo
- **Interactive Layer:** SVG and React state
- **Future Database:** Supabase / PostgreSQL
- **Future Agent Automation:** OpenClaw for teacher/admin lesson-generation workflows

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_key_here
```

This step is optional. Without a key, the app uses local fallback tutor hints.

### 3. Run locally

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm run start
```

## Deployment

The easiest deployment path is Vercel.

1. Push this folder to GitHub.
2. Import the repo in Vercel.
3. Add `ANTHROPIC_API_KEY` in Vercel Environment Variables.
4. Deploy.

If you do not add the API key, the deployed prototype will still run with fallback hints.

## Suggested Reviewer Flow

1. Open the library page.
2. Click **Start lesson** on **The Temperature Trap**.
3. Complete Scene 1 by dragging the thermometer to zero.
4. Complete Scene 2 by dragging below zero.
5. In Scene 3, move the character on the number line.
6. Ask the AI tutor for help if the position is wrong.
7. Complete the boss problem with answer `5`.

## Notes

This is intentionally a small prototype, not a full learning platform. The goal is to demonstrate the end-to-end process of going from concept to deployed interactive AI-assisted lesson quickly.
