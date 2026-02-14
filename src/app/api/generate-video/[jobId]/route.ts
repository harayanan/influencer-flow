import { NextResponse } from "next/server";

interface JobStatusResponse {
  jobId: string;
  status: "queued" | "processing" | "complete" | "error";
  progress: number;
  videoUrl?: string;
  message?: string;
}

// TODO: Replace mock status with real job tracking
// In production, store job state in a database (e.g. Supabase) or use
// the HeyGen/D-ID webhook callback to update job status.
// For now, we simulate a processing state with deterministic progress
// based on the job ID to make polling feel realistic.

/**
 * Derive a deterministic mock progress value from the job ID.
 * This ensures repeated polls for the same job return consistent results
 * within a short time window, while different jobs show different progress.
 */
function getMockProgress(jobId: string): JobStatusResponse {
  // Use a simple hash of the job ID + current minute to create progress
  // that slowly advances on subsequent polls
  const hash = jobId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const minutesSinceEpoch = Math.floor(Date.now() / 60000);
  const progressSeed = (hash + minutesSinceEpoch) % 100;

  // Simulate different stages based on progress
  if (progressSeed < 15) {
    return {
      jobId,
      status: "queued",
      progress: 0,
      message: "Job is queued and waiting to start.",
    };
  }

  if (progressSeed >= 85) {
    return {
      jobId,
      status: "complete",
      progress: 100,
      videoUrl: `https://storage.example.com/videos/${jobId}/final-output.mp4`,
      message: "Video generation complete. Ready for download.",
    };
  }

  // Processing: map the seed to a 5-95% progress range
  const progress = Math.round(((progressSeed - 15) / 70) * 95) + 5;
  const stages = [
    { threshold: 25, message: "Synthesizing voice audio..." },
    { threshold: 45, message: "Generating talking-head animation..." },
    { threshold: 65, message: "Compositing B-roll footage..." },
    { threshold: 80, message: "Applying subtitles and effects..." },
    { threshold: 100, message: "Finalizing video render..." },
  ];

  const stage = stages.find((s) => progress <= s.threshold) || stages[stages.length - 1];

  return {
    jobId,
    status: "processing",
    progress,
    message: stage.message,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId || jobId.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing job ID parameter." },
        { status: 400 }
      );
    }

    // Validate job ID format (should start with "job-")
    if (!jobId.startsWith("job-")) {
      return NextResponse.json(
        { error: "Invalid job ID format." },
        { status: 400 }
      );
    }

    // TODO: Look up actual job status from database
    // const job = await supabase.from("generation_jobs").select("*").eq("id", jobId).single();
    // if (!job.data) return NextResponse.json({ error: "Job not found." }, { status: 404 });

    const statusResponse = getMockProgress(jobId);

    return NextResponse.json(statusResponse);
  } catch (error) {
    console.error("Error checking job status:", error);
    return NextResponse.json(
      { error: "Failed to check job status. Please try again." },
      { status: 500 }
    );
  }
}
