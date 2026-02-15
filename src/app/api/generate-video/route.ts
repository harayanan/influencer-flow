import { NextResponse } from "next/server";
import { generateVideoFromImage } from "@/lib/gemini";
import { createJob } from "@/lib/job-store";

export const maxDuration = 60;

interface GenerateVideoRequest {
  imageBase64: string;
  prompt: string;
  durationSeconds?: number;
}

function generateJobId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `job-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateVideoRequest;

    if (!body.imageBase64 || typeof body.imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'imageBase64' field." },
        { status: 400 }
      );
    }

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'prompt' field." },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    const duration = body.durationSeconds || 8;

    if (!process.env.GEMINI_API_KEY) {
      // Mock fallback: create a job that will resolve via mock polling
      createJob(jobId, "mock-operation");
      return NextResponse.json({
        jobId,
        status: "queued" as const,
        estimatedTime: 120,
        message: `Video generation job ${jobId} queued (mock mode).`,
      });
    }

    try {
      const { operationName } = await generateVideoFromImage(
        body.prompt,
        body.imageBase64,
        duration
      );

      createJob(jobId, operationName);

      return NextResponse.json({
        jobId,
        status: "queued" as const,
        estimatedTime: 120,
        message: `Video generation job ${jobId} started via Veo.`,
      });
    } catch (veoError) {
      console.error("Veo API error, creating mock job:", veoError);
      createJob(jobId, "mock-operation");
      return NextResponse.json({
        jobId,
        status: "queued" as const,
        estimatedTime: 120,
        message: `Video generation job ${jobId} queued (Veo unavailable, mock mode).`,
      });
    }
  } catch (error) {
    console.error("Error initiating video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation. Please try again." },
      { status: 500 }
    );
  }
}
