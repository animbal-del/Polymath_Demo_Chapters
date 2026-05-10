# Polymath Mini — Current Storyline & Conversational Design

> **Status: Current implementation reference.**  
> This document reflects the lessons, Nova behavior, voice layer, and Raise Hand tutoring flow currently implemented in the app.

---

## Product Frame

Polymath Mini is an interactive lesson prototype with two playable lessons:

1. **Pip's Winter Adventure**  
   Grade 2 numbers lesson about thermometers, zero, negative numbers, and moving on a number line.

2. **The Galaxy Code**  
   Grade 7 algebra lesson about coordinate grids, slope, y-intercepts, `y = mx + b`, parallel lines, equations from two points, and point verification.

The experience is built around:

- short on-screen directions
- richer spoken narration
- direct manipulation activities
- XP and gated progression
- Nova as the tutor/guide
- Raise Hand questions through `/api/tutor`
- OpenAI voice through `/api/speak`, with browser speech synthesis fallback

---

## Screen Text vs Spoken Text

The code intentionally separates what appears on screen from what Nova says aloud.

**Screen text**
- Short cue.
- One clear task.
- Used in Nova's speech bubble.

**Spoken text**
- Warmer and fuller.
- Carries the teaching.
- Played through OpenAI TTS when available.
- Falls back to browser speech synthesis when OpenAI voice fails.

This is implemented with `screenText`, `spokenText`, `debrief`, and `debriefSpoken` fields in the lesson scene definitions.

---

## Nova

Nova is the friendly tutor for both lessons.

### General Personality

- Warm, patient, and encouraging.
- Gives short explanations.
- Avoids shaming language.
- Names the concept the student just used.
- Keeps the student focused on the current lesson.

### Raise Hand Behavior

Raise Hand captures a spoken question using browser speech recognition. If speech recognition is unavailable, the app asks the student to type the question.

The question is sent to `/api/tutor` with:

- `lesson`
- `type: "question"`
- current `scene`
- `studentQuestion`

Nova classifies questions silently as:

1. **On-topic** for the current lesson or scene.
2. **Beginner/prerequisite** and useful for the lesson.
3. **Advanced but connected** to the lesson.
4. **Off-topic / not covered** in the class.

Nova then responds:

- On-topic or beginner: answers simply and helpfully.
- Advanced: gives a small preview and guides the learner back.
- Off-topic: says the topic is not covered yet and asks the learner to finish the current chapter or mission.

If OpenAI is unavailable, local fallback logic handles common Temperature and Galaxy questions.

---

## Lesson 1: Pip's Winter Adventure

**Audience:** Grade 2  
**Subject:** Numbers  
**Core concept:** Negative numbers through temperature  
**Chapters:** 6  

### Story Frame

Pip the penguin is exploring cold weather. Nova helps the student use a thermometer and number line to understand hot, cold, zero, and numbers below zero.

### Chapter 1 — Thermometer

**ID:** `intro`  
**Pill:** `01 · THERMOMETER`  
**Title:** `What does a thermometer do? 🌡️`  
**Screen text:** `Drag it UP ☀️ then DOWN ❄️ to explore!`

**Learning goal**
- Higher numbers mean hotter.
- Lower numbers mean colder.
- A thermometer uses numbers to show temperature.

**Student action**
- Drag the thermometer up near hot values.
- Drag the thermometer down near cold values.

**Completion**
- Student must explore both hot and cold sides.

**Debrief**
- Thermometers measure temperature.

---

### Chapter 2 — Freezing

**ID:** `freeze`  
**Pill:** `02 · FREEZING`  
**Title:** `There's a magic number that makes ice! ❄️`  
**Screen text:** `Find the magic number — drag to ZERO!`

**Learning goal**
- Zero is the freezing point.
- Water turns to ice at zero degrees.

**Student action**
- Drag the thermometer from `10°` down to `0°`.

**Completion**
- Temperature reaches `0°` or below.

**Debrief**
- Zero is the freezing point.

---

### Chapter 3 — Below Zero

**ID:** `below`  
**Pill:** `03 · BELOW ZERO`  
**Title:** `Numbers go below zero — with a minus sign! 🥶`  
**Screen text:** `Go past zero — keep dragging to MINUS 3!`

**Learning goal**
- Numbers continue below zero.
- Numbers below zero are negative.
- Negative numbers use a minus sign.

**Student action**
- Drag the thermometer below zero to `-3°`.

**Completion**
- Temperature reaches `-3°` or below.

**Debrief**
- Negative numbers are real and useful.

---

### Chapter 4 — Number Line

**ID:** `numline`  
**Pill:** `04 · NUMBER LINE`  
**Title:** `Numbers go both ways — left AND right! 🔵🔴`  
**Screen text:** `Three quick questions — click the right number!`

**Learning goal**
- Negative numbers are left of zero.
- Positive numbers are right of zero.
- Zero sits in the middle.

**Student action**
- Click a cold number.
- Click zero.
- Click a warm number.

**UI note**
- The number choices are displayed in one fixed row so the final number does not wrap onto a new line.

**Completion**
- Student answers all three prompts.

**Debrief**
- The number line has two sides.

---

### Chapter 5 — Penguin Walk

**ID:** `walk`  
**Pill:** `05 · PENGUIN WALK`  
**Title:** `Help Pip walk from cold to warm! 🐧`  
**Screen text:** `Press WARMER 3 times — one step at a time!`

**Learning goal**
- Moving right means getting warmer.
- Moving right is like adding.
- Negative plus positive can cross zero.

**Student action**
- Start at `-2`.
- Move three warmer steps to `1`.

**Completion**
- Pip reaches `1`.

**Debrief**
- `-2 + 3 = 1`.

---

### Chapter 6 — Big Question

**ID:** `boss`  
**Pill:** `06 · BIG QUESTION`  
**Title:** `Can you solve the Temperature Trap? 🐧`  
**Screen text:** `It's −1°. It warms up 2°. What temperature now?`

**Learning goal**
- Solve a temperature-change problem using number line movement.

**Student action**
- Type the final temperature.

**Correct answer**
- `1°`

**Debrief**
- `-1 + 2 = 1`.

---

## Lesson 2: The Galaxy Code

**Audience:** Grade 7  
**Subject:** Algebra  
**Core concept:** Coordinate geometry and linear equations  
**Missions:** 7

### Story Frame

The student is a Navigator decoding a galaxy map. Nova acts like a friendly teacher or teacher's assistant. Each mission unlocks one part of straight-line navigation.

---

### Mission 1 — Coordinate System

**ID:** `coord`  
**Pill:** `01 · COORDS`  
**Title:** `Every star has a unique address.`  
**Screen text:** `Let's find the two axes — the grid's number lines.`

**Learning goal**
- The X-axis goes sideways.
- The Y-axis goes up and down.
- A coordinate pair is read as `(x, y)`.
- X comes first.

**Learn steps**
- Find the X-axis.
- Find the Y-axis.
- Identify what the first number means in `(5, 4)`.

**Practice**
- Dock at three coordinate targets:
  - `(2, 6)`
  - `(5, 3)`
  - `(4, 7)`

**Debrief**
- Every point has a unique address.

---

### Mission 2 — Slope

**ID:** `slope`  
**Pill:** `02 · SLOPE`  
**Title:** `How steep is the hyperspace lane?`  
**Screen text:** `Measure the lane's steepness — rise then run.`

**Learning goal**
- Slope means steepness.
- Slope is `rise ÷ run`.
- Rise is vertical change.
- Run is horizontal change.

**Learn steps**
- Find the rise from `(1,2)` to `(4,8)`.
- Find the run.
- Calculate slope `6 ÷ 3 = 2`.

**Practice**
- Calculate slope from `(1,2)` to `(3,8)`.
- Correct answer: `3`.

**Debrief**
- Steeper lines have bigger slope numbers.

---

### Mission 3 — Y-Intercept

**ID:** `yint`  
**Pill:** `03 · Y-INT`  
**Title:** `Where does the lane enter the grid?`  
**Screen text:** `Find the y-intercept — where the lane meets the Y-axis.`

**Learning goal**
- The y-intercept is where a line crosses the Y-axis.
- In `y = mx + b`, `b` is the y-intercept.

**Learn steps**
- Click where a line meets the Y-axis at height `3`.
- Read the y-intercept in `y = 2x + 5`.

**Practice**
- Choose which lane reaches station `y = 4`.
- Lanes are visibly labeled `A`, `B`, and `C`.
- Correct lane: `B`.

**Debrief**
- Y-intercept is the starting height.

---

### Mission 4 — Navigation Formula

**ID:** `formula`  
**Pill:** `04 · FORMULA`  
**Title:** `y = mx + b: two numbers, any line.`  
**Screen text:** `Unlock y = mx + b — the formula that describes every straight line.`

**Learning goal**
- `y = mx + b` describes a straight line.
- `m` controls slope.
- `b` controls y-intercept.

**Learn steps**
- Identify what `m` controls.
- Identify what `b` controls.

**Practice**
- Adjust sliders to match the target path.
- Correct formula: `y = 2x + 1`.

**Debrief**
- Two numbers can describe a straight path.

---

### Mission 5 — Parallel Lanes

**ID:** `parallel`  
**Pill:** `05 · PARALLEL`  
**Title:** `Same slope — but different paths?`  
**Screen text:** `Discover what makes lines parallel.`

**Learning goal**
- Parallel lines never cross.
- Parallel lines have the same slope.
- They can have different y-intercepts.

**Learn step**
- Answer what parallel lines must share.

**Practice**
- Original lane: `y = 3x + 2`.
- Choose the parallel equation.
- Correct answer: `y = 3x + 5`.

**Debrief**
- Same slope, different y-intercept.

---

### Mission 6 — Equation From Two Points

**ID:** `twopts`  
**Pill:** `06 · TWO POINTS`  
**Title:** `Write the equation from just two stars.`  
**Screen text:** `From two coordinates → slope → y-intercept → full equation.`

**Learning goal**
- Two points can define a line.
- First find slope.
- Then find `b`.
- Then write `y = mx + b`.

**Learn steps**
- Use `(0,1)` and `(3,4)` to find slope `1`.
- Use point `(0,1)` to find `b = 1`.

**Practice**
- Use `(1,3)` and `(3,7)`.
- Correct slope: `2`.
- Correct y-intercept: `1`.
- Final equation: `y = 2x + 1`.

**Debrief**
- Two points can produce a full equation.

---

### Mission 7 — Warp Gate

**ID:** `boss`  
**Pill:** `07 · WARP GATE`  
**Title:** `Calculate the warp trajectory!`  
**Screen text:** `Does y = 2x + 2 pass through the Warp Gate at (3, 8)?`

**Learning goal**
- Build a line equation from slope and y-intercept.
- Substitute an x-value.
- Check whether a point lies on a line.

**Student action**
- Enter `m = 2`.
- Enter `b = 2`.
- Confirm whether `(3,8)` is on the line.

**Correct reasoning**
- `y = 2x + 2`
- `y = 2(3) + 2`
- `y = 8`
- The path reaches `(3,8)`.

**Debrief**
- The student has used the full toolkit: coordinates, slope, y-intercept, formula, parallel lines, two-point equations, and verification.

---

## Voice Layer

### `/api/speak`

Voice narration uses the OpenAI SDK with:

- model: `gpt-4o-mini-tts`
- voice: `alloy`
- format: `mp3`
- runtime: Node.js

The API validates:

- `OPENAI_API_KEY`
- JSON request body
- non-empty text

If the API fails, it returns safe JSON errors instead of crashing.

### Browser Fallback

Both lesson pages try `/api/speak` first. If the API request, audio decoding, or playback fails, the app falls back to:

```js
window.speechSynthesis
```

This keeps narration working even without OpenAI voice.

---

## Tutor API

### `/api/tutor`

The tutor API uses OpenAI chat completions with `gpt-4o-mini` when `OPENAI_API_KEY` is available.

It supports:

- hints
- completion messages
- transition messages
- adaptive nudges
- Raise Hand questions

If OpenAI fails or is unavailable, local fallback responses are used.

### Raise Hand Scope

Temperature Raise Hand covers:

- thermometers
- hot and cold
- zero
- freezing point
- negative numbers
- minus sign
- number line movement
- adding by moving right

Galaxy Raise Hand covers:

- coordinates
- X-axis and Y-axis
- slope
- rise and run
- y-intercept
- `y = mx + b`
- parallel lines
- equations from two points
- checking whether a point is on a line

Advanced but connected questions get a short preview. Off-topic questions are redirected back to the lesson.

---

## Layout Notes

Both lessons use a two-column lesson layout on larger screens:

- Nova/cat guide on the left.
- Main interactive activity on the right.

Short-height screens use compact height-based styling so the interaction remains usable.

Known UI considerations:

- Temperature Number Line choices stay in one row.
- Galaxy y-intercept lane choices are labeled `A`, `B`, and `C`.
- Bottom controls remain fixed.
- Raise Hand floats at the bottom right.

---

## Deployment Notes

Netlify uses a clean build command:

```bash
npm run netlify-build
```

That command removes `.next` before building:

```bash
rm -rf .next && next build
```

This prevents stale Next.js server chunks from being reused by a cached deploy.

