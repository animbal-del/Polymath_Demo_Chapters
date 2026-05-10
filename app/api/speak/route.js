import OpenAI from "openai";

// Server-side audio cache — survives between requests, resets on server restart.
// Avoids re-calling OpenAI for identical text (same scene intros, common phrases).
const serverCache = new Map(); // text → Buffer

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text?.trim() || !process.env.OPENAI_API_KEY) {
      return new Response(null, { status: 404 });
    }

    // Return cached audio immediately
    if (serverCache.has(text)) {
      return new Response(serverCache.get(text), {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "max-age=86400" },
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
      speed: 0.92,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    serverCache.set(text, buffer); // cache for all future requests

    return new Response(buffer, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "max-age=86400" },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
