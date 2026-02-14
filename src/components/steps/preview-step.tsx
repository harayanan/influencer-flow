"use client";

import { useMemo } from "react";
import { Video, Image, Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { StoryboardSegment } from "@/lib/types";

interface PreviewStepProps {
  storyboard: StoryboardSegment[];
  script: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SegmentCard({ segment, index }: { segment: StoryboardSegment; index: number }) {
  const isTalkingHead = segment.type === "talking-head";
  const duration = segment.endTime - segment.startTime;

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-md",
        isTalkingHead
          ? "border-violet-200 bg-violet-50/50 hover:border-violet-300"
          : "border-blue-200 bg-blue-50/50 hover:border-blue-300"
      )}
    >
      {/* Segment number */}
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
          isTalkingHead
            ? "bg-gradient-to-br from-violet-500 to-indigo-600"
            : "bg-gradient-to-br from-blue-500 to-cyan-600"
        )}
      >
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isTalkingHead ? (
              <Video className="size-3.5 text-violet-600" />
            ) : (
              <Image className="size-3.5 text-blue-600" />
            )}
            <span
              className={cn(
                "text-xs font-semibold capitalize",
                isTalkingHead ? "text-violet-700" : "text-blue-700"
              )}
            >
              {isTalkingHead ? "Talking Head" : "B-Roll"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
          </span>
        </div>

        {/* Text snippet */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {segment.text}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              isTalkingHead
                ? "border-violet-200 text-violet-600"
                : "border-blue-200 text-blue-600"
            )}
          >
            {duration.toFixed(1)}s
          </Badge>

          {!isTalkingHead && segment.keyword && (
            <Badge
              variant="outline"
              className="text-[10px] border-blue-200 text-blue-600"
            >
              {segment.keyword}
            </Badge>
          )}
        </div>

        {/* B-roll thumbnail placeholder */}
        {!isTalkingHead && (
          <div className="relative mt-1 h-16 w-full overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-br from-blue-100 to-cyan-50">
            <div className="flex h-full items-center justify-center gap-1.5">
              <Image className="size-4 text-blue-400" />
              <span className="text-[10px] font-medium text-blue-400">
                {segment.brollClip
                  ? segment.brollClip.keyword
                  : segment.keyword || "B-Roll footage"}
              </span>
            </div>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/10">
              <div className="flex items-center justify-center rounded-full bg-white/90 p-1.5 shadow-sm">
                <Play className="size-3 text-blue-600 fill-blue-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviewStep({ storyboard, script }: PreviewStepProps) {
  const totalDuration = useMemo(() => {
    if (storyboard.length === 0) return 0;
    return Math.max(...storyboard.map((s) => s.endTime));
  }, [storyboard]);

  const talkingHeadCount = storyboard.filter(
    (s) => s.type === "talking-head"
  ).length;
  const brollCount = storyboard.filter((s) => s.type === "broll").length;

  const talkingHeadDuration = storyboard
    .filter((s) => s.type === "talking-head")
    .reduce((acc, s) => acc + (s.endTime - s.startTime), 0);

  const brollDuration = storyboard
    .filter((s) => s.type === "broll")
    .reduce((acc, s) => acc + (s.endTime - s.startTime), 0);

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Storyboard Preview
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Review the visual timeline of your video before generation. Each
          segment shows what appears on screen.
        </p>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {formatTime(totalDuration)}
          </span>
          <span className="text-xs text-muted-foreground">total</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
          <span className="text-xs text-muted-foreground">
            {talkingHeadCount} talking ({talkingHeadDuration.toFixed(0)}s)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600" />
          <span className="text-xs text-muted-foreground">
            {brollCount} B-roll ({brollDuration.toFixed(0)}s)
          </span>
        </div>
      </div>

      {/* Visual timeline bar */}
      {totalDuration > 0 && (
        <div className="space-y-1.5">
          <div className="flex h-3 w-full overflow-hidden rounded-full border bg-muted/50">
            {storyboard.map((segment) => {
              const widthPct =
                ((segment.endTime - segment.startTime) / totalDuration) * 100;
              return (
                <div
                  key={segment.id}
                  className={cn(
                    "h-full transition-all first:rounded-l-full last:rounded-r-full",
                    segment.type === "talking-head"
                      ? "bg-gradient-to-r from-violet-400 to-violet-500"
                      : "bg-gradient-to-r from-blue-400 to-cyan-400"
                  )}
                  style={{ width: `${widthPct}%` }}
                  title={`${segment.type}: ${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/60 tabular-nums">
            <span>0:00</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Storyboard segments */}
      {storyboard.length > 0 ? (
        <div className="relative space-y-3">
          {/* Connecting line */}
          <div className="absolute left-[22px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-200 via-blue-200 to-violet-200" />

          {storyboard.map((segment, index) => (
            <SegmentCard key={segment.id} segment={segment} index={index} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-muted-foreground/20 py-16">
          <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-4">
            <Video className="size-8 text-violet-500" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold">No storyboard yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              The storyboard will be generated from your script in the previous
              step.
            </p>
          </div>
        </div>
      )}

      {/* Script reference (collapsed) */}
      {script && (
        <details className="group rounded-xl border bg-muted/30 transition-all">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Play className="size-3 transition-transform group-open:rotate-90" />
            View full script
          </summary>
          <div className="px-4 pb-4">
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {script}
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
