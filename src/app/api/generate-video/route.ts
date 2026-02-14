import { NextResponse } from "next/server";
import type { StoryboardSegment, SubtitleStyle } from "@/lib/types";

// TODO: Integrate HeyGen or D-ID API for avatar lip-sync video generation
// import HeyGen from "heygen-sdk";
// const heygen = new HeyGen({ apiKey: process.env.HEYGEN_API_KEY! });

// TODO: Integrate ElevenLabs API for voice synthesis
// import { ElevenLabsClient } from "elevenlabs";
// const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

interface GenerateVideoRequest {
  imageUrl: string;
  script: string;
  voiceId: string;
  storyboard: StoryboardSegment[];
  subtitleStyle: SubtitleStyle;
}

/**
 * Generate a unique job ID for tracking video generation progress.
 */
function generateJobId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `job-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateVideoRequest;

    // Validate required fields
    if (!body.imageUrl || typeof body.imageUrl !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'imageUrl' field." },
        { status: 400 }
      );
    }

    if (!body.script || typeof body.script !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'script' field." },
        { status: 400 }
      );
    }

    if (!body.voiceId || typeof body.voiceId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'voiceId' field." },
        { status: 400 }
      );
    }

    if (!body.storyboard || !Array.isArray(body.storyboard)) {
      return NextResponse.json(
        { error: "Missing or invalid 'storyboard' field. Expected an array." },
        { status: 400 }
      );
    }

    if (!body.subtitleStyle || typeof body.subtitleStyle !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'subtitleStyle' field." },
        { status: 400 }
      );
    }

    const validStyles: SubtitleStyle[] = ["hormozi", "minimalist", "bold", "karaoke"];
    if (!validStyles.includes(body.subtitleStyle)) {
      return NextResponse.json(
        { error: `Invalid 'subtitleStyle'. Must be one of: ${validStyles.join(", ")}.` },
        { status: 400 }
      );
    }

    // TODO: Full generation pipeline:
    // 1. Send script + voiceId to ElevenLabs to synthesize audio
    //    const audioStream = await elevenlabs.textToSpeech.convert(body.voiceId, {
    //      text: body.script,
    //      model_id: "eleven_multilingual_v2",
    //    });
    //
    // 2. Send image + audio to HeyGen/D-ID for talking-head generation
    //    const talkingHead = await heygen.createVideo({
    //      avatar: { type: "image", url: body.imageUrl },
    //      audio: audioStream,
    //    });
    //
    // 3. Fetch B-roll clips for storyboard segments of type "broll"
    //
    // 4. Composite: merge talking-head, B-roll, subtitles, and music
    //
    // 5. Apply subtitle style overlay
    //
    // 6. Return final video URL

    const jobId = generateJobId();

    // Estimate generation time based on script length (roughly 1 min per 30 words of script)
    const wordCount = body.script.split(/\s+/).length;
    const estimatedTime = Math.max(60, Math.min(300, Math.round(wordCount * 2)));

    return NextResponse.json({
      jobId,
      status: "queued" as const,
      estimatedTime,
      message: `Video generation job ${jobId} has been queued. Check status at /api/generate-video/${jobId}.`,
    });
  } catch (error) {
    console.error("Error initiating video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation. Please try again." },
      { status: 500 }
    );
  }
}
