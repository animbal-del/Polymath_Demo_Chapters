import OpenAI from "openai";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return jsonError("OPENAI_API_KEY is not configured.", 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError("Request body must be valid JSON.", 400);
    }

    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return jsonError("Text is required.", 400);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await speech.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Speech API error:", error);
    return jsonError("Voice generation failed.", 500);
  }
}
