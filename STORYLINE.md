# Polymath Mini — Storyline & Conversational Design
### Grade 2–3 Edition (Ages 7–9)

> **Status: PROPOSAL — review and edit before implementation.**  
> This document defines the full conversational design including what appears on screen vs what Nova speaks aloud. Edit freely. Once approved, the dev team will update all scene text and TTS settings.

---

## The Core Principle: Screen ≠ Speech

The most important rule in this redesign.

Young kids get overwhelmed when everything is text on screen. The screen should feel almost empty — calm, simple, one thing to look at. Nova's voice carries the story, the warmth, the explanation.

Think of it like a picture book:
- **The picture (screen):** Simple, visual, one clear thing to notice or do
- **Reading aloud (Nova's voice):** Warm, detailed, conversational — the real content

```
WRONG (current approach):
  Screen shows: "Brrr! Welcome, explorer! I'm Nova, your Arctic guide. Something's
  wrong — the temperature is DROPPING fast. Drag the thermometer all the way down
  to 0°. That's the freezing point, where water turns to ice!"

RIGHT (new approach):
  Screen shows: "Can you find zero on the thermometer? ❄️"
  Nova speaks:  "Hey! I'm Nova. Let me tell you a secret — when the thermometer
                 reaches zero, something magical happens. Water turns into ice!
                 Just like the ice cubes in your freezer at home!
                 Can you drag the red line all the way down to zero? Try it!"
```

The screen is the cue card. Nova's voice is the teacher.

---

## Nova's Voice — Grade 2–3 Edition

Nova should feel like the coolest, friendliest older kid who happens to know everything.

### Vocabulary Rules
| Don't say | Say instead |
|---|---|
| "temperature" (first use) | "how cold or hot something is" |
| "negative" (first use) | "numbers that live below zero" |
| "y-intercept" | "where the line starts" |
| "slope" | "how steep the path is" |
| "coordinate" | "the address of a star" |
| "axis" | "the number line going sideways / up-down" |

Always say the hard word AFTER the simple explanation:
> "When numbers go below zero — below the freezing point — we call them negative numbers."

### Sentence Structure
- Max 12 words per sentence
- One idea at a time
- Questions at the end of every explanation (invite response)
- Lots of "You know how..." and "Just like..." to connect to real life

### Pacing (TTS settings to change in code)
```
Current:  speed 0.95, pitch 1.06
Proposed: speed 0.80, pitch 1.14
```
Slower speed = more processing time. Higher pitch = warmer, friendlier.

### Celebration Rules
- Never just say "Correct!"
- Always name what they did: "You found the freezing point! That's EXACTLY where water turns to ice!"
- Use physical excitement words: "Wow!", "Oh yes!", "You GOT it!"
- Short pause (implied in punctuation) before the celebration

### Wrong Answer Rules
- Never make it feel bad
- Always give a fresh approach, not repeat the same words
- Use "Hmm, let me show you a trick..." not "Try again"
- Max 2 redirects before Nova gives a strong hint with animation

---

## The Screen vs Speech Framework

Every moment in the lesson has four elements. Only the first two appear on screen.

```
[SCREEN TEXT]   — What the bubble / UI shows (SHORT. One line. Sometimes an emoji.)
[NOVA SPEAKS]   — What Nova says out loud (WARM. Conversational. Relatable.)
[VISUAL]        — What the student sees on the page (interaction, animation)
[STUDENT DOES]  — The action (drag, click, type)
```

**Screen text principles:**
- 1 sentence max. Often just a question or a single prompt.
- Font is big enough a 7-year-old can read it comfortably
- Can use emojis (one, not many)
- Never repeat what Nova just said — they're different messages

**Nova speaks principles:**
- Full, warm sentences
- Reference real life (ice cubes, playground, TV remote)
- Say the concept in 2-3 different ways in the same speech
- End almost every speech with a question or invitation to act

---

## Lesson 1: The Temperature Trap (Grade 2–3 Redesign)

### New Story Frame

**Old:** Arctic Research Station, scientist explorer  
**New:** You're going to play outside in winter. First, you need to check if it's cold enough to see your breath — or even make ice!

Nova is the friendly thermometer expert who lives inside the weather app.

**Opening line Nova speaks (not shown on screen):**
> "Hi! I'm Nova. Today we're going to learn something really cool — and I mean REALLY cool — about cold! You know when it's winter and you can see your breath? Or when puddles turn into ice? We're going to find out exactly how cold it needs to be for that to happen. Ready? Let's go!"

**Screen shows at the start:** `"Ready to explore? 🌨️"`

---

### Chapter 1 · How Cold Is Cold?

**Learning goal:** Zero is a special number — the freezing point  
**Screen heading:** `"The Freezing Line ❄️"`

---

#### Opening

```
[SCREEN TEXT]
"Can you find zero on the thermometer?"

[NOVA SPEAKS]
"Look at the thermometer on your screen. 
 See all those numbers?
 There's a very special one hiding in there — ZERO!
 Zero is where something magical happens.
 When the temperature hits zero...
 water turns into ice!
 Just like the ice cubes in your freezer.
 Can you drag the red part down to find zero?
 Give it a try!"

[VISUAL]  Thermometer showing +10°, draggable
[STUDENT DOES]  Drags mercury down toward 0°
```

---

#### While Dragging (milestone feedback at 5°)

```
[SCREEN TEXT]
"Almost there! Keep going... ❄️"

[NOVA SPEAKS]
"Oh, you're getting colder!
 5 degrees... 4 degrees...
 You're SO close to the magic number!
 Keep dragging down!"
```

---

#### On Reaching 0°

```
[SCREEN TEXT]
"You found it! That's the freezing point! 🧊"

[NOVA SPEAKS]
"YES! You found zero!
 This is called the FREEZING point.
 That means if it were this cold outside right now...
 puddles would turn to ice!
 You could go ice skating on them!
 But wait — can it get even colder than zero?
 Let's find out!"

[VISUAL]  Small animation: droplets → ice crystals
```

---

### Chapter 2 · Colder Than Cold!

**Learning goal:** Numbers go below zero — negative numbers  
**Screen heading:** `"Below Zero 🥶"`

---

#### Opening

```
[SCREEN TEXT]
"Can numbers go below zero?"

[NOVA SPEAKS]
"So we found zero — the freezing point.
 But what if it gets even colder?
 What number comes after zero when we go down?
 Here's the surprising thing...
 numbers don't stop at zero!
 They keep going — but now we put a little minus sign in front.
 So ONE below zero is called... MINUS one! Or negative one.
 Pretty cool, right?
 Let's drag the thermometer even further down.
 Can you get it all the way to MINUS five?"

[SCREEN TEXT when transitioning]
"Drag past zero — numbers keep going! ➡"

[VISUAL]  Thermometer, mercury just at 0°, target marker at −5°
[STUDENT DOES]  Drags below 0°
```

---

#### Crossing Zero (first moment below 0)

```
[SCREEN TEXT]
"Whoa! We went below zero! 😮"

[NOVA SPEAKS]
"Look at that! We crossed the zero line!
 Now we're in the land of NEGATIVE numbers.
 Negative means less than zero.
 Colder than the freezing point.
 So cold that even ice would feel warm next to this!
 Keep going — let's reach minus five!"
```

---

#### On Reaching −5°

```
[SCREEN TEXT]
"−5°! That's really really cold! 🌨️"

[NOVA SPEAKS]
"You did it! Minus five degrees!
 That's five whole steps below zero.
 If it was this cold outside right now,
 you'd need your biggest, fluffiest winter coat!
 And that little minus sign in front of the five?
 That's how we write numbers below zero.
 Scientists, weather people — they use these numbers every single day!
 Negative numbers are real, and now you know them!"

[VISUAL]  Confetti, temperature badge shows −5°
```

---

### Chapter 3 · The Number Walk

**Learning goal:** Number line — right = warmer, left = colder  
**Screen heading:** `"The Warm-Up Walk 🚶‍♂️"`

---

#### Opening

```
[SCREEN TEXT]
"Help the penguin get warmer! 🐧"

[NOVA SPEAKS]
"Meet our friend — a little penguin stuck in the cold!
 He's at minus four right now.
 That's four steps below zero — very chilly!
 He needs to take six steps toward the WARM side.
 Look at the line below him.
 See the numbers going to the right?
 Moving right means getting warmer.
 Moving left means getting colder.
 Can you help him walk six steps to the right?
 Press the Warmer button six times!"

[VISUAL]  Number line −6 to +6, penguin at −4
[STUDENT DOES]  Clicks Warmer → button
```

---

#### Step-by-step feedback (each button press)

```
[SCREEN TEXT changes each step]
Step 1: "−3 now! 5 more steps! 🐧"
Step 2: "−2! Getting warmer! 4 to go..."
Step 3: "−1! Almost at zero! 3 to go..."
Step 4: "ZERO! You crossed the line! 2 more!"
Step 5: "+1! Almost warm! 1 more step!"
Step 6: "+2! 🎉"

[NOVA SPEAKS on hitting zero]
"Wait — you just crossed zero!
 You went from the cold side to the warm side!
 That's amazing!
 Just like coming inside from the snow —
 you crossed the zero line!
 Keep going — two more steps!"

[NOVA SPEAKS on reaching +2]
"The penguin made it!
 You started at minus four.
 You took six steps to the right.
 And you landed on PLUS two!
 Minus four... plus six steps... equals two!
 You just did math with negative numbers!
 I'm SO proud of you!"
```

---

### Chapter 4 (Boss) · The Big Temperature Question

**Learning goal:** Add a positive number to a negative number  
**Screen heading:** `"The Big Question! 🌟"`

---

#### Opening

```
[SCREEN TEXT]
"It's −3° outside. Then it warms up 8°. How warm is it now? 🌡"

[NOVA SPEAKS]
"Okay, here's a big question — but you can do this!
 It starts at minus three degrees outside.
 Then the sun comes out and warms things up by eight degrees!
 So... where does the temperature end up?
 Imagine our penguin at minus three.
 He takes eight steps to the right.
 Minus three... then one... two... three... four... five... six... seven... eight steps!
 Where does he land?
 Try typing your answer in the box!"

[VISUAL]  Number line −3 to +5 shown, input box
[STUDENT DOES]  Types the answer
```

---

#### On wrong answer

```
[SCREEN TEXT]
"Hmm, let's count together! 🤔"

[NOVA SPEAKS]
"Let me help!
 Let's count together.
 Start at minus three.
 Now take one step: minus TWO.
 Two steps: minus ONE.
 Three steps: ZERO!
 Four steps: ONE.
 Five steps: TWO.
 Six steps: THREE.
 Seven steps: FOUR.
 Eight steps: FIVE!
 So what's the answer?"
```

---

#### On correct answer (5°)

```
[SCREEN TEXT]
"5°! You solved the Temperature Trap! 🎊"

[NOVA SPEAKS]
"FIVE! That's exactly right!
 Minus three plus eight equals FIVE!
 You started below zero and ended up ABOVE zero!
 You crossed the whole freezing line!
 You know what that means?
 You understand negative numbers now.
 Real scientists use this every single day.
 And today, YOU are a scientist!
 Give yourself a big hand — you were AMAZING!"
```

---

## Lesson 2: The Galaxy Code (Grade 2–3 Redesign)

### IMPORTANT NOTE FOR REVIEW

**Linear equations (y = mx + b) are NOT Grade 2–3 content.**

For this age group, the Galaxy Code lesson should cover one of these instead:
- **Option A:** Coordinate reading only (Missions 1 only, expanded to 5 scenes)
- **Option B:** Skip counting and number patterns (2s, 5s, 10s) in a space setting
- **Option C:** Simple addition and grouping (foundations of multiplication)

**This proposal uses Option A** — coordinates only, expanded and deepened for Grade 2–3.

**New lesson name:** "The Star Map"  
**Topic:** Reading and plotting coordinates on a grid  
**Why this works for Grade 2–3:** Finding addresses and locations on a map is intuitive for 7–9 year olds. It directly connects to maps, treasure hunts, and games they know.

---

### New Story Frame

You're a Star Explorer! The Star Captain left behind a treasure map of the galaxy. Each star has a secret address — two numbers that tell you exactly where it is. Learn to read the addresses, and you'll find the hidden stars!

**Nova is:** The ship's friendly navigator robot

**Opening Nova speaks:**
> "Hello, Explorer! Welcome to the Star Ship! I'm Nova — the navigator on this ship. Today we're going on a real treasure hunt! The galaxy is full of hidden stars, and each one has a secret address. Two numbers. That's it! Once you learn to read those two numbers, you can find any star in the whole universe! Ready to become a Star Explorer? Let's launch!"

**Screen shows:** `"Welcome to the Star Ship! 🚀"`

---

### Scene 1 · The Address Line (X-axis)

**Learning goal:** The horizontal number line — X tells you how far RIGHT to go

---

#### Step 1 — Introduce the sideways line

```
[SCREEN TEXT]
"This line goes sideways. It has numbers. 👀"

[NOVA SPEAKS]
"Look at the star map.
 See that line going across the middle?
 Left... and right...
 That's called the X line.
 The numbers on it are like steps.
 If I say go to THREE on the X line,
 I mean take three steps to the right.
 Let's try it! Can you tap on the number THREE on the sideways line?"

[VISUAL]  Grid with only x-axis visible and labeled. Other axis very faint.
[STUDENT DOES]  Taps on number 3 on x-axis
```

---

#### On correct tap

```
[SCREEN TEXT]
"That's 3 on the X line! ➡️"

[NOVA SPEAKS]
"Yes! You found three!
 Three steps to the right.
 That's how the X number works — it always tells you how far RIGHT to go!
 Easy, right?
 Now let's meet the OTHER number..."
```

---

### Scene 2 · The Up-Down Line (Y-axis)

**Learning goal:** The vertical number line — Y tells you how far UP to go

---

#### Step 1

```
[SCREEN TEXT]
"This line goes up and down. What do you notice? 🔍"

[NOVA SPEAKS]
"Now look at this line — it goes up and down!
 This one is called the Y line.
 The numbers on it tell you how many steps to go UP.
 If I say Y is FOUR,
 that means go up four steps!
 Can you tap on the number FOUR on the up-down line?"

[VISUAL]  Grid with y-axis highlighted, x-axis faint
[STUDENT DOES]  Taps on 4 on y-axis
```

---

### Scene 3 · Finding a Star (Putting it together)

**Learning goal:** (x, y) as two numbers that make one address

---

#### Opening

```
[SCREEN TEXT]
"A star's address has TWO numbers. Like (3, 4). 🌟"

[NOVA SPEAKS]
"Okay, here's the big secret of the star map!
 Every star has an address with TWO numbers.
 The FIRST number says how far to go RIGHT.
 The SECOND number says how far to go UP.
 So the address three, four means:
 Go three steps RIGHT... then four steps UP!
 Let me show you.
 Watch the ship move to star (3, 4)!"

[VISUAL]  Animated ship moves 3 right, then 4 up, lands on glowing star
```

---

#### Now student tries

```
[SCREEN TEXT]
"Find the star at (2, 5)! 🌟"

[NOVA SPEAKS]
"Now you try!
 There's a star hiding at address two, five.
 Remember — first number is steps to the RIGHT.
 Second number is steps UP.
 Two steps right... then five steps up!
 Tap where you think the star is!"

[VISUAL]  Clean grid, no markings. Student taps.
[STUDENT DOES]  Taps on grid
```

---

#### On wrong tap

```
[SCREEN TEXT]
"Hmm, let's try counting again! 🤔"

[NOVA SPEAKS]
"Almost! Let's count together.
 Start at the corner — that's where the two lines meet!
 First, go RIGHT — one, two! Stop there.
 Now go UP — one, two, three, four, five!
 That's where the star is hiding.
 Try tapping there!"
```

---

#### On correct

```
[SCREEN TEXT]
"You found it! Address (2, 5)! ⭐"

[NOVA SPEAKS]
"You found the star!
 Two steps right, five steps up — you nailed it!
 That star was hiding at address two, five,
 and YOU found it!
 You're a real Star Explorer now!
 Let's find a few more..."
```

---

### Scenes 4 & 5 · The Star Hunt

Three hidden stars. Student must find each from the address alone. No markers, no hints on screen. Just the coordinate text and the grid.

```
Stars:  (4, 2)  →  (6, 5)  →  (3, 7)

[SCREEN TEXT each round]
Round 1: "Find the star at (4, 2) 🔭"
Round 2: "Find the star at (6, 5) 🔭"  
Round 3: "Find the star at (3, 7) 🔭"

[NOVA SPEAKS each round]
Round 1: "One more star to find! Address four, two. That's four to the right, two up! Where is it?"
Round 2: "Oh, this one is trickier! Six to the right, five up. Take your time — I'm not going anywhere!"
Round 3: "Last star! Three to the right, seven up. You've gotten SO good at this. I know you can find it!"
```

---

### Boss · The Secret Star

```
[SCREEN TEXT]
"Where is the secret star? Address: (5, 6) 🌟"

[NOVA SPEAKS]
"This is it — the last hidden star in the whole galaxy!
 Its address is five, six.
 Five steps to the right.
 Six steps up.
 If you find this one...
 you've completed the whole Star Map!
 I believe in you, Explorer.
 Where is the secret star?"

[ON CORRECT]
SCREEN: "You completed the Star Map! 🎉"
NOVA: "YOU FOUND IT! The secret star at five, six!
      You know what that means?
      You learned to read star addresses today.
      Any star in the whole galaxy has an address like this —
      two numbers, right and up.
      Explorers who know this are incredibly rare.
      And today, you are one of them.
      I'm so proud of you. You were AMAZING!"
```

---

## Universal Patterns

### Hint sequence (all lessons, all scenes)

```
First wrong try:
  [SCREEN]: "Let's look again together 🤔"
  [NOVA]: Give a different angle on the problem. New analogy. Slower.

Second wrong try:
  [SCREEN]: "Here's a clue! 💡"
  [NOVA]: Give a much more direct clue. Step-by-step counting. Animated helper if possible.

Third wrong try:
  [SCREEN]: "Let's count it together! 🤝"
  [NOVA]: Walk through it completely, step by step. Make it feel collaborative not remedial.
```

### Celebration sequence (all correct answers)

```
[SCREEN]: Short, punchy, specific — name the thing they did
[NOVA]: 
  1. Celebrate what happened ("You crossed zero!")
  2. Name what they learned ("That's a negative number!")
  3. Connect it to real life ("Scientists use this every day!")
  4. Build excitement for what's next ("And there's MORE...")
```

### Between scenes

```
[SCREEN]: "[Next scene name] →"
[NOVA]: Brief bridge that connects what they just learned to what's coming.
  "You found the freezing point. But something even more interesting happens
   when we go BELOW zero. Want to see?"
```

---

## Implementation Notes

### Text changes needed
1. Every `tutorText` in scene definitions → reduce to 1 short line for screen display
2. Every `intro` / `learnTexts` → split into `screenText` (1 line) and `spokenText` (full paragraph)
3. Nova's fallback messages in `/app/api/tutor/route.js` → rewrite for Grade 2–3 vocabulary
4. System prompt for OpenAI → rewrite Nova's character as Grade 2–3 tutor

### TTS settings
```js
// Change in both page.jsx and galaxy/page.jsx speak() function
utt.rate  = 0.80;  // was 0.88 — notably slower for young listeners
utt.pitch = 1.14;  // was 1.06 — warmer, slightly higher
```

### Screen bubble change
The speech bubble should show `screenText` (short).  
Nova speaks `spokenText` (full).  
These are two different strings going forward.

### What NOT to do
- ❌ Don't put all of Nova's speech into the bubble text
- ❌ Don't use vocabulary above Grade 3 reading level in screen text
- ❌ Don't give more than one instruction at a time on screen
- ❌ Don't move to the next beat before the current one resolves

---

*Review this document. Edit any scenes, dialogue, or vocabulary. When approved, reply "implement" and the code will be updated.*
