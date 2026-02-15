export interface JobState {
  id: string;
  operationName: string;
  status: "queued" | "processing" | "polling-video" | "complete" | "error";
  progress: number;
  videoDataUrl?: string;
  audioDataUrl?: string;
  audioDuration?: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes

const jobs = new Map<string, JobState>();

export function createJob(
  id: string,
  operationName: string
): JobState {
  cleanupStaleJobs();
  const now = Date.now();
  const job: JobState = {
    id,
    operationName,
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): JobState | undefined {
  return jobs.get(id);
}

export function updateJob(
  id: string,
  updates: Partial<Omit<JobState, "id" | "createdAt">>
): JobState | undefined {
  const job = jobs.get(id);
  if (!job) return undefined;
  const updated = { ...job, ...updates, updatedAt: Date.now() };
  jobs.set(id, updated);
  return updated;
}

export function cleanupStaleJobs(): void {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > TTL_MS) {
      jobs.delete(id);
    }
  }
}
