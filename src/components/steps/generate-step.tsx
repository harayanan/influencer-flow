"use client";

import { useMemo } from "react";
import { Play, Sparkles, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ProjectState } from "@/lib/types";

interface GenerateStepProps {
  progress: number;
  status: ProjectState["generationStatus"];
  videoUrl: string | null;
  imagePreview: string | null;
}

const STATUS_CONFIG: Record<
  Exclude<ProjectState["generationStatus"], "idle" | "error">,
  { label: string; detail: string }
> = {
  analyzing: {
    label: "Analyzing script...",
    detail: "Parsing your script and identifying B-roll opportunities",
  },
  rendering: {
    label: "Rendering avatar...",
    detail: "Generating lip-synced talking head animation",
  },
  subtitling: {
    label: "Adding subtitles...",
    detail: "Applying dynamic captions and text effects",
  },
  finalizing: {
    label: "Finalizing...",
    detail: "Compositing video layers and encoding output",
  },
  complete: {
    label: "Complete!",
    detail: "Your video is ready to preview and refine",
  },
};

export function GenerateStep({
  progress,
  status,
  videoUrl,
  imagePreview,
}: GenerateStepProps) {
  const isGenerating =
    status !== "idle" && status !== "complete" && status !== "error";
  const isComplete = status === "complete";

  const currentConfig = useMemo(() => {
    if (status === "idle" || status === "error") return null;
    return STATUS_CONFIG[status];
  }, [status]);

  // Progress steps for the stepper
  const steps = [
    { key: "analyzing", label: "Analyze" },
    { key: "rendering", label: "Render" },
    { key: "subtitling", label: "Subtitles" },
    { key: "finalizing", label: "Finalize" },
    { key: "complete", label: "Done" },
  ] as const;

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {isComplete ? "Video Generated" : "Generating Your Video"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {isComplete
            ? "Your AI-generated video is ready for review."
            : status === "idle"
              ? "Click generate to begin creating your video."
              : "Sit tight while we bring your vision to life."}
        </p>
      </div>

      {/* Status indicator */}
      {status !== "idle" && status !== "error" && (
        <div className="w-full space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between px-2">
            {steps.map((step, i) => {
              const isStepComplete = i < currentStepIndex;
              const isStepActive = i === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 transition-all duration-500",
                      isStepComplete
                        ? "border-violet-500 bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                        : isStepActive
                          ? "border-violet-500 bg-violet-50 text-violet-600"
                          : "border-muted bg-muted/50 text-muted-foreground/50"
                    )}
                  >
                    {isStepComplete ? (
                      <Check className="size-3.5" />
                    ) : isStepActive && isGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isStepActive && isComplete ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isStepComplete || isStepActive
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress
              value={progress}
              className="h-2.5 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-violet-500 [&_[data-slot=progress-indicator]]:to-indigo-500 [&_[data-slot=progress-indicator]]:transition-all [&_[data-slot=progress-indicator]]:duration-700"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {currentConfig?.label}
              </span>
              <span className="text-xs font-mono text-muted-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {currentConfig?.detail}
            </p>
          </div>
        </div>
      )}

      {/* Video player area */}
      <div
        className={cn(
          "relative w-64 overflow-hidden rounded-2xl border-2 transition-all duration-500 bg-black",
          isComplete
            ? "border-violet-300 shadow-lg shadow-violet-100/50"
            : isGenerating
              ? "border-violet-200/50"
              : "border-muted"
        )}
        style={{ aspectRatio: "9/16" }}
      >
        {isComplete && imagePreview ? (
          /* Completed: show video preview mockup using uploaded image */
          <div className="relative h-full w-full">
            <img
              src={imagePreview}
              alt="Generated video preview"
              className="h-full w-full object-cover"
            />
            {/* Video overlay effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm p-4 border border-white/30 shadow-xl">
                <Play className="size-8 text-white fill-white" />
              </div>
            </div>
            {/* Subtitle preview at bottom */}
            <div className="absolute bottom-12 inset-x-4 text-center">
              <span className="inline-block bg-black/70 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide">
                Your AI video is ready
              </span>
            </div>
            {/* Duration badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-white text-[10px] font-mono">
              0:00 / 1:30
            </div>
            {/* Video controls bar */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/80 to-transparent flex items-end px-3 pb-1.5 gap-2">
              <div className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full w-0 bg-violet-500 rounded-full" />
              </div>
              <span className="text-[9px] text-white/60 font-mono">HD</span>
            </div>
          </div>
        ) : (
          /* Generating or idle: show placeholder */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            {isGenerating ? (
              <>
                {/* Pulsing animation */}
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                  <div className="absolute -inset-3 animate-pulse rounded-full bg-violet-400/10" />
                  <div className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-4 shadow-lg shadow-violet-500/30">
                    <Sparkles className="size-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1 text-center px-6">
                  <p className="text-sm font-semibold text-white/90">
                    Creating magic...
                  </p>
                  <p className="text-[10px] text-white/50">
                    {currentConfig?.label}
                  </p>
                </div>

                {/* Animated bars at bottom */}
                <div className="absolute bottom-4 flex items-end gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-violet-400/60"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              </>
            ) : isComplete ? (
              <>
                {/* Complete but no URL */}
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-5 shadow-lg shadow-violet-500/30">
                  <Play className="size-10 text-white fill-white" />
                </div>
                <p className="text-sm font-semibold text-white/90">
                  Ready to play
                </p>
              </>
            ) : status === "error" ? (
              <>
                <div className="flex items-center justify-center rounded-full bg-red-500/20 p-4">
                  <Sparkles className="size-8 text-red-400" />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-semibold text-white/90">
                    Generation failed
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">
                    Please try again
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Idle state */}
                <div className="flex items-center justify-center rounded-full bg-white/10 p-5">
                  <Play className="size-10 text-white/30" />
                </div>
                <p className="text-xs text-white/30 px-6 text-center">
                  Your video will appear here
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Completion message */}
      {isComplete && (
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-center rounded-full bg-emerald-500 p-1">
            <Check className="size-3 text-white" />
          </div>
          <span className="text-sm font-medium text-emerald-700">
            Video generated successfully
          </span>
        </div>
      )}
    </div>
  );
}
