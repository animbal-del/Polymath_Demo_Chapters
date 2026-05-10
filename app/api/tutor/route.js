import OpenAI from "openai";

// ── System prompts — Grade 2–3 edition ───────────────────────────────────────

const ARCTIC_NOVA = `You are Nova, a super friendly tutor helping 7 to 9 year old kids learn about cold temperatures and negative numbers.

YOUR CHARACTER:
- Sound like the nicest older kid who loves explaining things simply
- Use only words a 7 year old knows — everyday words only
- Keep sentences very short — max 10 words per sentence
- Reference things kids know: ice cubes, snow, the freezer, cold winter days
- When correct: name what they did! "You found the freezing point!"
- When wrong: "Hmm, let me show you a trick!" — never say "wrong" or "incorrect"
- End every response with one short friendly question

MATH IN SIMPLE WORDS:
- Zero = the freezing point, where water turns to ice
- Numbers below zero = negative numbers, written with a minus sign
- Going right on the number line = getting warmer
- Going left = getting colder
- Adding = taking steps to the warmer side

HINT PACING by attempt number:
- Attempt 1: one simple clue, max 15 words
- Attempt 2: count out the steps together slowly
- Attempt 3+: walk through it one tiny step at a time

Keep ALL responses under 30 words total. Short feels warm for young kids.`;

const GALAXY_NOVA = `You are Nova, a friendly star explorer robot helping 7 to 9 year old kids learn to read star map addresses.

THE STORY: Every star in the galaxy has a secret address made of two numbers. Kids are learning to find stars using these addresses!

YOUR CHARACTER:
- Warm, patient, and very excited — like a friendly robot best friend
- Use only words a 7 year old understands
- Short sentences only — max 10 words per sentence
- Reference things kids know: house addresses, treasure maps, board game grids
- When they find the star: cheer for exactly what they did!
- When they miss: "Ooh, let's count the steps together!"

COORDINATES IN SIMPLE WORDS:
- The first number = how many steps to go RIGHT
- The second number = how many steps to go UP
- Always right first, then up — like reading a map!
- The sideways line = the X line
- The up-down line = the Y line

Keep ALL responses under 30 words total.`;

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request) {
  let params = {};
  try {
    const body = await request.json();
    params = {
      lesson:          body.lesson          ?? "arctic",
      type:            body.type            ?? "hint",
      scene:           body.scene,
      attempt:         body.attempt         ?? 1,
      studentAnswer:   body.studentAnswer,
      correctAnswer:   body.correctAnswer,
      concept:         body.concept,
      studentQuestion: body.studentQuestion,
      previousScene:   body.previousScene,
    };
  } catch {
    return Response.json({ message: "Hmm, something went wrong. Try again!", source: "error" });
  }

  const { lesson, type, scene, attempt, studentAnswer, correctAnswer, concept, studentQuestion, previousScene } = params;

  const fallback = buildFallback({ lesson, type, scene, attempt, studentAnswer, correctAnswer, studentQuestion });

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ message: fallback, source: "local-fallback" });
  }

  try {
    const openai      = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system      = lesson === "galaxy" ? GALAXY_NOVA : ARCTIC_NOVA;
    const userMessage = buildUserMessage({ lesson, type, scene, attempt, studentAnswer, correctAnswer, concept, studentQuestion, previousScene });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 80,
      messages: [
        { role: "system", content: system },
        { role: "user",   content: userMessage },
      ],
    });

    return Response.json({ message: completion.choices[0].message.content.trim(), source: "openai" });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    return Response.json({ message: fallback, source: "fallback" });
  }
}

// ── User message builder ──────────────────────────────────────────────────────

function buildUserMessage({ lesson, type, scene, attempt, studentAnswer, correctAnswer, concept, studentQuestion, previousScene }) {
  const isGalaxy = lesson === "galaxy";

  if (type === "question") {
    return `Scene: ${scene}. A child asked: "${studentQuestion}". Answer in simple words a 7 year old understands. Max 30 words.`;
  }
  if (type === "complete") {
    const effort = attempt <= 1 ? "First try — celebrate their brilliance!" : `Took ${attempt} tries — celebrate their persistence warmly!`;
    return `Scene "${scene}" done! ${effort} Name what they learned. Max 30 words.`;
  }
  if (type === "transition") {
    return `Child finished "${previousScene}" and entering "${scene}". Give a warm 1-sentence bridge. Max 20 words.`;
  }
  if (type === "adaptive") {
    return `Scene: ${scene}. Progress: ${concept}. Give a gentle 15-word nudge. Stay warm and simple.`;
  }

  // hint — attempt-aware
  const verbosity = attempt >= 3
    ? "Walk through it one tiny step at a time (25-30 words)."
    : attempt === 2
    ? "Give a clearer clue, count steps together (20-25 words)."
    : "Give one simple friendly clue (15 words max).";

  return `Scene: ${scene}. Attempt ${attempt}. Child tried: "${studentAnswer}". Correct: "${correctAnswer}". Concept: ${concept}. ${verbosity}`;
}

// ── Fallbacks ─────────────────────────────────────────────────────────────────

function buildFallback({ lesson, type, scene, attempt, studentAnswer, correctAnswer, studentQuestion }) {
  if (lesson === "galaxy") return buildGalaxyFallback({ type, scene, attempt, studentQuestion });
  return buildArcticFallback({ type, scene, attempt, studentAnswer, correctAnswer, studentQuestion });
}

function buildArcticFallback({ type, scene, attempt, studentAnswer, correctAnswer, studentQuestion }) {
  if (type === "question") {
    const q = (studentQuestion || "").toLowerCase();
    if (q.includes("zero"))     return "Zero is the freezing point! That's where water turns to ice. ❄️";
    if (q.includes("negative")) return "Negative numbers are colder than zero! We put a minus sign in front.";
    if (q.includes("minus"))    return "A minus sign means we went below zero — colder than the freezing point!";
    return "Great question! Negative numbers are numbers below zero. They have a little minus sign in front!";
  }
  if (type === "complete") {
    const msgs = {
      freeze:      "You found the freezing point! That's where water turns to ice. Amazing! ❄️",
      below:       "You went below zero! Those are called negative numbers. You're so smart! 🌟",
      number_walk: "The penguin is warm! You walked the number line like a pro! 🐧",
      boss:        "FIVE! That's exactly right! You are a real mathematician today! 🎊",
    };
    return msgs[scene] ?? "Amazing job! You did it! 🌟";
  }

  const hints = {
    freeze:      ["Drag the red part all the way down to the zero mark!", "Zero is right in the middle of the numbers! Keep dragging down!", "Pull it down past 5... past 3... past 1... to 0!"],
    below:       ["Zero isn't the end — drag below it! Numbers keep going!", "Go past zero and keep pulling down to minus five!", "Minus five is five steps below zero. Keep dragging down!"],
    number_walk: ["Warmer means going RIGHT! Press the Warmer button!", "Count with me: press Warmer once, twice, three times...", "Start at minus four. Press Warmer six times. Count each one!"],
    boss:        ["Start at minus three. Then go right eight steps!", "Minus 3... then count: minus 2, minus 1, zero, 1, 2, 3, 4, 5!", "The answer is five! Minus three plus eight equals five!"],
  };
  const list = hints[scene] || ["Try again! You can do it!", "Think carefully — which way is warmer?", "Let's count together!"];
  return list[Math.min((attempt || 1) - 1, list.length - 1)];
}

function buildGalaxyFallback({ type, scene, attempt, studentQuestion }) {
  if (type === "question") {
    const q = (studentQuestion || "").toLowerCase();
    if (q.includes("x"))     return "The X line goes sideways! X numbers tell you steps to the RIGHT.";
    if (q.includes("y"))     return "The Y line goes up and down! Y numbers tell you steps going UP.";
    if (q.includes("address") || q.includes("coordinate")) return "A star's address has two numbers. First go right, then go up!";
    return "Great question! First number means steps right. Second number means steps up. Like a treasure map!";
  }
  if (type === "complete") {
    const msgs = {
      xaxis:  "You found the X line! It goes sideways and tells you steps to the right! ⭐",
      yaxis:  "You found the Y line! It goes up and down and tells you steps going up! ⭐",
      first:  "You read your first star address! Right first, then up! 🌟",
      hunt:   "You found all the hidden stars! You are a real Star Explorer! 🚀",
      secret: "THE SECRET STAR! You completed the whole Star Map! You are AMAZING! 🎉",
    };
    return msgs[scene] ?? "Amazing! You found it! 🌟";
  }

  const hints = {
    xaxis:  ["Click on the flat line going left and right!", "The X line goes across the whole map, left to right!", "Find the line going sideways — like a horizon!"],
    yaxis:  ["Click on the line going straight up!", "The Y line is on the left side, going up and down!", "Find the line going up and down — like a tree!"],
    first:  ["First number = steps right. Second number = steps up!", "Count: go right that many steps, then go up!", "Right first, then up! Always in that order!"],
    hunt:   ["Count the first number going right. Then count the second number going up!", "Start from the corner where the two lines meet. Then go right first!", "Right first, then up! Count carefully!"],
    secret: ["Almost there! Count the first number going right, then the second going up!", "Right first, then up! You've done this before — you've got it!", "Count slowly! Right first, then all the way up!"],
  };
  const list = hints[scene] || ["Count your steps carefully!", "Right first, then up!", "You can do this!"];
  return list[Math.min((attempt || 1) - 1, list.length - 1)];
}
