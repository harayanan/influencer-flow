"use client";

import { useCallback, useRef, useState } from "react";
import {
  Type,
  Palette,
  Music,
  Image as ImageIcon,
  Upload,
  Check,
  Sparkles,
  ChevronRight,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SubtitleStyle, SubtitleSegment } from "@/lib/types";

interface RefineStepProps {
  subtitleStyle: SubtitleStyle;
  onStyleChange: (s: SubtitleStyle) => void;
  subtitles: SubtitleSegment[];
  onSubtitleEdit: (id: string, text: string) => void;
  logoPreview: string | null;
  onLogoUpload: (file: File, preview: string) => void;
  musicTrack: string | null;
}

interface StyleOption {
  id: SubtitleStyle;
  name: string;
  description: string;
  preview: {
    text: string;
    highlight: string;
    fontClass: string;
    bgClass: string;
    textClass: string;
    highlightClass: string;
  };
}

const SUBTITLE_STYLES: StyleOption[] = [
  {
    id: "hormozi",
    name: "Hormozi",
    description: "Bold, high-contrast, attention-grabbing",
    preview: {
      text: "This is how you",
      highlight: "DOMINATE",
      fontClass: "font-black uppercase tracking-wider",
      bgClass: "bg-black",
      textClass: "text-white",
      highlightClass: "text-yellow-400",
    },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, elegant, modern feel",
    preview: {
      text: "Simple words have",
      highlight: "power",
      fontClass: "font-light tracking-wide",
      bgClass: "bg-white border border-gray-200",
      textClass: "text-gray-800",
      highlightClass: "text-gray-800 underline underline-offset-4",
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "Large, impactful with color pop",
    preview: {
      text: "Make it",
      highlight: "STAND OUT",
      fontClass: "font-extrabold",
      bgClass: "bg-gradient-to-r from-violet-600 to-indigo-600",
      textClass: "text-white",
      highlightClass: "text-yellow-300",
    },
  },
  {
    id: "karaoke",
    name: "Karaoke",
    description: "Word-by-word highlight, TikTok style",
    preview: {
      text: "Every single",
      highlight: "word",
      fontClass: "font-bold",
      bgClass: "bg-black/80",
      textClass: "text-white/60",
      highlightClass: "text-white bg-violet-500 px-1 rounded",
    },
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RefineStep({
  subtitleStyle,
  onStyleChange,
  subtitles,
  onSubtitleEdit,
  logoPreview,
  onLogoUpload,
  musicTrack,
}: RefineStepProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onLogoUpload]
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Refine & Export
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Fine-tune subtitle styling, add your brand logo, review background
          music, and export the final video.
        </p>
      </div>

      {/* Subtitle Style Picker */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Subtitle Style</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SUBTITLE_STYLES.map((style) => {
            const isSelected = subtitleStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onStyleChange(style.id)}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-violet-500 bg-violet-50/80 shadow-md shadow-violet-100/50"
                    : "border-muted hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-sm"
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-1 shadow-sm">
                    <Check className="size-3 text-white" />
                  </div>
                )}

                {/* Style preview */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg px-3 py-3",
                    style.preview.bgClass
                  )}
                >
                  <p className={cn("text-xs leading-tight text-center", style.preview.fontClass)}>
                    <span className={style.preview.textClass}>
                      {style.preview.text}{" "}
                    </span>
                    <span className={style.preview.highlightClass}>
                      {style.preview.highlight}
                    </span>
                  </p>
                </div>

                {/* Name and description */}
                <div>
                  <p className="text-sm font-semibold">{style.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {style.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Editable Subtitles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="size-4 text-violet-600" />
            <Label className="text-sm font-semibold">Subtitles</Label>
            <Badge variant="outline" className="text-[10px]">
              {subtitles.length} segments
            </Badge>
          </div>
        </div>

        {subtitles.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {subtitles.map((subtitle) => {
              const isEditing = editingId === subtitle.id;
              return (
                <div
                  key={subtitle.id}
                  className={cn(
                    "group flex items-start gap-3 rounded-lg border p-3 transition-all",
                    isEditing
                      ? "border-violet-300 bg-violet-50/50"
                      : "border-muted hover:border-violet-200 hover:bg-muted/30"
                  )}
                >
                  {/* Time badge */}
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[10px] font-mono text-muted-foreground tabular-nums">
                    {formatTime(subtitle.startTime)}
                  </span>

                  {/* Text (editable) */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={subtitle.text}
                        onChange={(e) =>
                          onSubtitleEdit(subtitle.id, e.target.value)
                        }
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingId(null);
                        }}
                        autoFocus
                        className="w-full rounded-md border border-violet-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-violet-400/30"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingId(subtitle.id)}
                        className="w-full text-left text-xs leading-relaxed text-foreground/80 hover:text-foreground transition-colors cursor-text"
                      >
                        {subtitle.text}
                        {subtitle.highlight && (
                          <span className="ml-1 text-[10px] text-violet-500 font-medium">
                            [{subtitle.highlight}]
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Duration */}
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {(subtitle.endTime - subtitle.startTime).toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 py-8">
            <Type className="size-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Subtitles will appear after video generation
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Logo Upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Brand Watermark</Label>
          <Badge variant="outline" className="text-[10px]">
            Optional
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative group">
              <div className="flex items-center justify-center rounded-xl border-2 border-violet-200 bg-white p-3 shadow-sm size-20">
                <img
                  src={logoPreview}
                  alt="Brand logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-muted border shadow-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-violet-400 hover:bg-violet-50/30 transition-all size-20 cursor-pointer"
            >
              <Upload className="size-5 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground">Logo</span>
            </button>
          )}

          <div className="flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">
              Upload your brand logo to add a subtle watermark overlay.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              PNG with transparency recommended. Max 2MB.
            </p>
          </div>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg"
          onChange={handleLogoChange}
          className="hidden"
        />
      </div>

      <Separator />

      {/* Music Track */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Background Music</Label>
        </div>

        {musicTrack ? (
          <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
            <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5">
              <Music className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{musicTrack}</p>
              <p className="text-[10px] text-muted-foreground">
                Auto-selected based on script mood
              </p>
            </div>
            {/* Visual waveform placeholder */}
            <div className="flex items-end gap-0.5 h-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-violet-400/60"
                  style={{
                    height: `${6 + Math.sin(i * 0.8) * 10 + Math.random() * 8}px`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4">
            <Music className="size-5 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">
              Background music will be auto-selected based on your script's mood.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Export Button */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          size="lg"
          className="w-full max-w-sm h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-300/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Wand2 className="size-5" />
          Export Final Video
          <ChevronRight className="size-4" />
        </Button>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="size-3" />
          <span>
            AI-enhanced export with optimized encoding for social platforms
          </span>
        </div>
      </div>
    </div>
  );
}
