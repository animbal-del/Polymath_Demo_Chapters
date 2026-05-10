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

RAISE HAND QUESTIONS:
- First decide if the question is about this lesson, a needed beginner idea, a slightly advanced next-step idea, or off-topic.
- If relevant: answer directly with one tiny example.
- If beginner: say "Great starter question!" then explain simply.
- If advanced: say "That's a next-level idea." Give one small preview, then return to the chapter.
- If off-topic: kindly say it is not covered in this class yet, and ask them to finish the current chapter.

Keep ALL responses under 45 words total. Short feels warm for young kids.`;

const GALAXY_NOVA = `You are Nova, a friendly star explorer robot helping 7 to 9 year old kids learn to read star map addresses.

THE STORY: Kids are decoding a galaxy map. They learn how points, slopes, and line equations guide a spaceship.

YOUR CHARACTER:
- Warm, patient, and very excited — like a friendly robot best friend
- Use only words a 7 year old understands
- Short sentences only — max 10 words per sentence
- Reference things kids know: house addresses, treasure maps, board game grids
- When they find the star: cheer for exactly what they did!
- When they miss: "Ooh, let's count the steps together!"

GALAXY MATH IN SIMPLE WORDS:
- The first number = how many steps to go RIGHT
- The second number = how many steps to go UP
- Always right first, then up — like reading a map!
- The sideways line = the X line
- The up-down line = the Y line
- Slope = steepness. It is rise divided by run.
- Rise = how far up. Run = how far right.
- Y-intercept = where the line touches the Y line.
- y = mx + b is a path rule.
- m is slope. b is the y-intercept.
- Parallel lines have the same slope.
- Two points can make one straight lane.
- To check a point, put x into the rule and see y.

RAISE HAND QUESTIONS:
- First decide if the question is on-topic, beginner/prerequisite, advanced, or off-topic.
- If on-topic: answer clearly using the current chapter and one tiny example.
- If beginner: say "Great starter question!" then explain the missing idea.
- If advanced: say "That's a next-level idea." Give a small preview, then guide them back.
- If off-topic: kindly say it is not covered in this class yet, and ask them to finish the current mission.
- Never pretend unrelated topics are part of the lesson.

Keep ALL responses under 55 words total.`;

const LESSON_SCOPES = {
  arctic: {
    title: "Pip's Winter Adventure",
    topics: "thermometers, hot and cold, zero as freezing point, negative numbers, minus sign, number line, moving right to add or get warmer",
    scenes: {
      intro: "exploring that higher numbers are hotter and lower numbers are colder",
      freeze: "finding zero, the freezing point",
      below: "going below zero into negative numbers",
      numline: "finding cold, zero, and warm numbers on a number line",
      walk: "moving right on the number line to get warmer",
      boss: "solving -1 plus 2 by moving right",
    },
  },
  galaxy: {
    title: "The Galaxy Code",
    topics: "coordinate pairs, x-axis, y-axis, x then y, slope, rise, run, y-intercept, y = mx + b, m as slope, b as y-intercept, parallel lines, equations from two points, checking if a point is on a line",
    scenes: {
      coord: "coordinate grid, x-axis, y-axis, and ordered pairs",
      slope: "slope as rise divided by run",
      yint: "y-intercept as where a line meets the Y-axis",
      formula: "y = mx + b, with m as slope and b as y-intercept",
      parallel: "parallel lines having the same slope",
      twopts: "using two points to find slope and b",
      boss: "checking y = 2x + 2 at x = 3 to reach (3,8)",
    },
  },
};

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
      max_tokens: type === "question" ? 140 : 80,
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
  if (type === "question") {
    const scope = LESSON_SCOPES[lesson] ?? LESSON_SCOPES.arctic;
    const sceneFocus = scope.scenes[scene] ?? "the current chapter";
    return `Lesson: ${scope.title}.
Current scene: ${scene}.
Current scene focus: ${sceneFocus}.
Lesson topics: ${scope.topics}.
A child asked: "${studentQuestion}".

Classify the question silently:
1. On-topic for this lesson or current scene.
2. Beginner/prerequisite question needed for this lesson.
3. Advanced but connected to this lesson.
4. Off-topic or not covered in this class.

Then answer:
- For 1 or 2, answer simply and helpfully.
- For 3, give a tiny preview and say we will learn more later.
- For 4, say this topic is not covered in this class yet. Ask them to finish the current chapter/mission.
Use simple words. Max ${lesson === "galaxy" ? 55 : 45} words.`;
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
    if (q.includes("add") || q.includes("plus") || q.includes("warmer")) return "Adding means moving right here. Warmer also means moving right. Can you try one step?";
    if (q.includes("subtract") || q.includes("colder")) return "Colder means moving left on our number line. We will practice that after warming up!";
    if (q.includes("multiply") || q.includes("multiplication") || q.includes("divide") || q.includes("division") || q.includes("fraction") || q.includes("algebra")) return "That's a next-level idea. Today we are learning zero, minus signs, and temperature numbers.";
    if (isClearlyOffTopic(q)) return "That topic is not covered in this class yet. Let's finish this temperature chapter first, okay?";
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
    if (isClearlyOffTopic(q)) return "That topic is not covered in this class yet. Let's finish this galaxy mission first.";
    if (q.includes("x-axis") || q.includes("x axis")) return "The X-axis is the sideways line. X tells how many steps right.";
    if (q.includes("y-axis") || q.includes("y axis")) return "The Y-axis goes up and down. Y tells how many steps up.";
    if (q.includes("coordinate") || q.includes("address") || q.includes("point")) return "A point has two numbers. Go right first, then up. Like a map address.";
    if (q.includes("slope") || q.includes("steep")) return "Slope means steepness. Count rise up, then run right. Slope is rise divided by run.";
    if (q.includes("rise")) return "Rise means how far the lane goes up. It is the up part of slope.";
    if (q.includes("run")) return "Run means how far the lane goes right. It is the sideways part of slope.";
    if (q.includes("intercept") || q.includes("b value")) return "The y-intercept is where the line touches the Y-axis. In y = mx + b, it is b.";
    if (q.includes("mx") || q.includes("equation") || q.includes("formula")) return "y = mx + b is a path rule. m is slope. b is the starting height.";
    if (q.includes("parallel")) return "Parallel lines never meet. They have the same slope, like two matching space lanes.";
    if (q.includes("two point") || q.includes("2 point")) return "Two points can make one straight lane. First find slope, then find b.";
    if (q.includes("quadratic") || q.includes("parabola") || q.includes("calculus")) return "That's a next-level idea. Today we are learning straight-line paths first.";
    return "Great question! If it is about our map, use x for right, y for up, slope for steepness.";
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

function isClearlyOffTopic(q) {
  return [
    "football", "basketball", "movie", "song", "game", "roblox", "minecraft",
    "food", "pizza", "weather today", "president", "capital", "history",
    "dinosaur", "animal", "joke", "story",
  ].some(word => q.includes(word));
}
