import { NextResponse } from "next/server";
import { generateSpeech, pcmToWav } from "@/lib/gemini";

export const maxDuration = 60;

interface GenerateAudioRequest {
  script: string;
  geminiVoice: string;
  stylePrefix?: string;
  language?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateAudioRequest;

    if (!body.script || body.script.trim().length < 5) {
      return NextResponse.json(
        { error: "Script must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!body.geminiVoice) {
      return NextResponse.json(
        { error: "Missing geminiVoice parameter" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      // Mock response when no API key
      return NextResponse.json({
        audioDataUrl: null,
        durationSec: Math.round(body.script.split(/\s+/).length / 2.5),
        source: "mock",
      });
    }

    // Prepend language instruction for Indian languages
    let spokenText = body.script;
    const indianLanguages = [
      "Hindi", "Tamil", "Telugu", "Bengali",
      "Marathi", "Kannada", "Malayalam", "Gujarati",
    ];
    if (body.language && indianLanguages.includes(body.language)) {
      spokenText = `Speak in ${body.language}. ${spokenText}`;
    }

    const pcmBase64 = await generateSpeech(
      spokenText,
      body.geminiVoice,
      body.stylePrefix
    );

    const wavBase64 = pcmToWav(pcmBase64);
    const audioDataUrl = `data:audio/wav;base64,${wavBase64}`;

    // Estimate duration from PCM size: 24000 Hz * 2 bytes * 1 channel = 48000 bytes/sec
    const pcmBytes = Buffer.from(pcmBase64, "base64").length;
    const durationSec = Math.round(pcmBytes / 48000);

    return NextResponse.json({
      audioDataUrl,
      durationSec,
      source: "gemini",
    });
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate audio",
      },
      { status: 500 }
    );
  }
}
