import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/job-store";
import { checkVideoStatus } from "@/lib/gemini";

interface JobStatusResponse {
  jobId: string;
  status: "queued" | "processing" | "complete" | "error";
  progress: number;
  videoDataUrl?: string;
  message?: string;
}

function getMockProgress(jobId: string): JobStatusResponse {
  const hash = jobId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const minutesSinceEpoch = Math.floor(Date.now() / 60000);
  const progressSeed = (hash + minutesSinceEpoch) % 100;

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
      message: "Video generation complete (mock). Ready for preview.",
    };
  }

  const progress = Math.round(((progressSeed - 15) / 70) * 95) + 5;
  return {
    jobId,
    status: "processing",
    progress,
    message: "Generating animated video clip...",
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId || !jobId.startsWith("job-")) {
      return NextResponse.json(
        { error: "Invalid job ID format." },
        { status: 400 }
      );
    }

    const job = getJob(jobId);

    // No job in store — fall back to mock progress
    if (!job) {
      return NextResponse.json(getMockProgress(jobId));
    }

    // Mock operation — use deterministic mock
    if (job.operationName === "mock-operation") {
      const mock = getMockProgress(jobId);
      if (mock.status === "complete") {
        updateJob(jobId, { status: "complete", progress: 100 });
      }
      return NextResponse.json(mock);
    }

    // Already complete
    if (job.status === "complete") {
      return NextResponse.json({
        jobId,
        status: "complete",
        progress: 100,
        videoDataUrl: job.videoDataUrl,
        message: "Video generation complete.",
      });
    }

    // Already errored
    if (job.status === "error") {
      return NextResponse.json({
        jobId,
        status: "error",
        progress: job.progress,
        message: job.error || "Video generation failed.",
      });
    }

    // Poll Veo for real status
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getMockProgress(jobId));
    }

    try {
      const veoStatus = await checkVideoStatus(job.operationName);

      if (veoStatus.error) {
        updateJob(jobId, {
          status: "error",
          error: veoStatus.error,
        });
        return NextResponse.json({
          jobId,
          status: "error",
          progress: job.progress,
          message: veoStatus.error,
        });
      }

      if (veoStatus.done && veoStatus.videoBase64) {
        const videoDataUrl = `data:video/mp4;base64,${veoStatus.videoBase64}`;
        updateJob(jobId, {
          status: "complete",
          progress: 100,
          videoDataUrl,
        });
        return NextResponse.json({
          jobId,
          status: "complete",
          progress: 100,
          videoDataUrl,
          message: "Video generation complete.",
        });
      }

      // Still processing
      const newProgress = Math.min(
        (job.progress || 10) + Math.floor(Math.random() * 10),
        90
      );
      updateJob(jobId, { status: "processing", progress: newProgress });

      return NextResponse.json({
        jobId,
        status: "processing",
        progress: newProgress,
        message: "Generating animated video clip...",
      });
    } catch (pollError) {
      console.error("Veo poll error:", pollError);
      // Don't fail the job on transient poll errors
      return NextResponse.json({
        jobId,
        status: "processing",
        progress: job.progress || 10,
        message: "Generating animated video clip...",
      });
    }
  } catch (error) {
    console.error("Error checking job status:", error);
    return NextResponse.json(
      { error: "Failed to check job status. Please try again." },
      { status: 500 }
    );
  }
}
