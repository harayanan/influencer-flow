"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  Sparkles,
  Check,
  Loader2,
  Volume2,
  Music,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectState } from "@/lib/types";

interface GenerateStepProps {
  progress: number;
  status: ProjectState["generationStatus"];
  videoUrl: string | null;
  imagePreview: string | null;
  audioUrl: string | null;
  audioDuration: number | null;
  videoClipUrl: string | null;
}

const STATUS_CONFIG: Record<
  Exclude<ProjectState["generationStatus"], "idle" | "error">,
  { label: string; detail: string }
> = {
  "generating-audio": {
    label: "Generating narration...",
    detail: "Synthesizing voice audio with Gemini TTS",
  },
  "generating-video": {
    label: "Starting video generation...",
    detail: "Sending image to Veo for animation",
  },
  "polling-video": {
    label: "Animating image...",
    detail: "Generating 8-second animated preview clip",
  },
  complete: {
    label: "Complete!",
    detail: "Your audio narration and video preview are ready",
  },
};

const DEMO_SUBTITLES = [
  "Welcome to your AI-generated video",
  "Created with InfluencerFlow",
  "Lip-synced avatar animation",
  "Dynamic B-roll transitions",
  "Professional subtitles included",
  "Ready for TikTok, Reels & Shorts",
];

export function GenerateStep({
  progress,
  status,
  imagePreview,
  audioUrl,
  audioDuration,
  videoClipUrl,
}: GenerateStepProps) {
  const isGenerating =
    status !== "idle" && status !== "complete" && status !== "error";
  const isComplete = status === "complete";

  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentConfig = useMemo(() => {
    if (status === "idle" || status === "error") return null;
    return STATUS_CONFIG[status];
  }, [status]);

  // Simulate video playback progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Cycle subtitles during playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSubtitleIndex(
        (prev) => (prev + 1) % DEMO_SUBTITLES.length
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!isComplete || !imagePreview) return;

    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);
    if (playProgress >= 100) setPlayProgress(0);

    // Sync audio playback
    if (audioRef.current) {
      if (newPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    // Sync video playback
    if (videoRef.current) {
      if (newPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isComplete, imagePreview, isPlaying, playProgress]);

  const totalDuration = audioDuration || 90;

  const formatPlayTime = (pct: number) => {
    const current = Math.floor((pct / 100) * totalDuration);
    const m = Math.floor(current / 60);
    const s = current % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Progress steps for the stepper
  const generationSteps = [
    { key: "generating-audio", label: "Audio" },
    { key: "generating-video", label: "Video" },
    { key: "polling-video", label: "Animate" },
    { key: "complete", label: "Done" },
  ] as const;

  const currentStepIndex = generationSteps.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {isComplete ? "Generation Complete" : "Generating Your Video"}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {isComplete
            ? "Your AI narration is ready. Click the preview to play."
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
            {generationSteps.map((step, i) => {
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
          {!isComplete && (
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
          )}
        </div>
      )}

      {/* Video player area */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 transition-all duration-500 bg-black cursor-pointer",
          isComplete
            ? "border-violet-300 shadow-xl shadow-violet-100/50 w-72"
            : isGenerating
              ? "border-violet-200/50 w-64"
              : "border-muted w-64"
        )}
        style={{ aspectRatio: "9/16" }}
        onClick={togglePlay}
      >
        {isComplete && imagePreview ? (
          /* Completed: interactive video preview */
          <div className="relative h-full w-full overflow-hidden">
            {/* Video clip or image with Ken Burns effect */}
            {videoClipUrl ? (
              <video
                ref={videoRef}
                src={videoClipUrl}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={imagePreview}
                alt="Generated video preview"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[10000ms] ease-linear",
                  isPlaying ? "scale-110 translate-y-[-3%]" : "scale-100"
                )}
              />
            )}

            {/* Hidden audio element */}
            {audioUrl && (
              <audio ref={audioRef} src={audioUrl} preload="auto" />
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

            {/* Play/Pause button overlay */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              )}
            >
              <div className="flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm p-4 border border-white/30 shadow-xl transition-transform hover:scale-110">
                {isPlaying ? (
                  <Pause className="size-8 text-white fill-white" />
                ) : (
                  <Play className="size-8 text-white fill-white ml-1" />
                )}
              </div>
            </div>

            {/* Animated subtitle */}
            <div
              className={cn(
                "absolute bottom-14 inset-x-3 text-center transition-all duration-500",
                isPlaying
                  ? "opacity-100 translate-y-0"
                  : "opacity-70 translate-y-0"
              )}
            >
              <span
                key={currentSubtitleIndex}
                className="inline-block bg-black/80 px-3 py-2 rounded-lg text-white text-xs font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {isPlaying
                  ? DEMO_SUBTITLES[currentSubtitleIndex]
                  : "Click to play preview"}
              </span>
            </div>

            {/* Top bar: badge + sound */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    isPlaying ? "bg-red-500 animate-pulse" : "bg-white/40"
                  )}
                />
                <span className="text-white text-[10px] font-mono">
                  {isPlaying ? "LIVE PREVIEW" : "READY"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <Volume2 className="size-3 text-white/70" />
                <span className="text-white text-[10px] font-mono">HD</span>
              </div>
            </div>

            {/* Audio waveform animation */}
            {isPlaying && (
              <div className="absolute top-12 right-3 flex items-end gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-violet-400 rounded-full"
                    style={{
                      animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                      height: `${6 + Math.sin(i * 1.5) * 6}px`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Video controls bar at bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-3 space-y-1.5">
              <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${playProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/70 font-mono tabular-nums">
                  {formatPlayTime(playProgress)}
                </span>
                <span className="text-[9px] text-white/70 font-mono tabular-nums">
                  {formatDuration(totalDuration)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Generating or idle: show placeholder */
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            {isGenerating ? (
              <>
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
                <div className="absolute bottom-4 flex items-end gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-violet-400/60"
                      style={{
                        height: `${12 + Math.sin(i * 1.2) * 10}px`,
                        animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
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

      {/* Result summary when complete */}
      {isComplete && (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-center rounded-full bg-emerald-500 p-1">
              <Check className="size-3 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-700">
              Generation complete — click preview to play
            </span>
          </div>

          {/* Media summary cards */}
          <div className="flex gap-3 w-full max-w-sm">
            {/* Audio card */}
            <div className="flex-1 rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Music className="size-3.5 text-violet-600" />
                <span className="text-xs font-semibold">Full AI Narration</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {audioUrl
                  ? `~${audioDuration}s audio`
                  : "Audio unavailable"}
              </p>
            </div>

            {/* Video card */}
            <div className="flex-1 rounded-lg border bg-card p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Volume2 className="size-3.5 text-indigo-600" />
                <span className="text-xs font-semibold">Animated Preview</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {videoClipUrl
                  ? "8-second Veo clip"
                  : "Ken Burns fallback"}
              </p>
            </div>
          </div>

          {!isPlaying && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
            >
              <Play className="size-3.5 fill-violet-600" />
              Play Preview
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
