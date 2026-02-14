"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Mic,
  Volume2,
  Check,
  FileText,
  User,
  UserCircle,
  Globe,
  Wand2,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { VoiceProfile, IndianLanguage } from "@/lib/types";
import { indianLanguages } from "@/lib/voices";

interface BriefingStepProps {
  script: string;
  onScriptChange: (s: string) => void;
  selectedVoice: VoiceProfile | null;
  suggestedVoices: VoiceProfile[];
  onVoiceSelect: (v: VoiceProfile) => void;
  selectedLanguage: IndianLanguage | null;
  onLanguageChange: (lang: IndianLanguage) => void;
}

const STYLE_COLORS: Record<VoiceProfile["style"], string> = {
  excited:
    "bg-orange-100 text-orange-700 border-orange-200",
  educational:
    "bg-blue-100 text-blue-700 border-blue-200",
  calm: "bg-emerald-100 text-emerald-700 border-emerald-200",
  professional:
    "bg-slate-100 text-slate-700 border-slate-200",
  friendly:
    "bg-pink-100 text-pink-700 border-pink-200",
};

const TONE_OPTIONS: { value: string; label: string }[] = [
  { value: "excited", label: "Excited" },
  { value: "educational", label: "Educational" },
  { value: "calm", label: "Calm" },
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
];

const DURATION_OPTIONS = [
  { value: 60, label: "60s (~150 words)" },
  { value: 90, label: "90s (~225 words)" },
];

function ScriptGenerator({
  onScriptGenerated,
  selectedLanguage,
}: {
  onScriptGenerated: (script: string) => void;
  selectedLanguage: IndianLanguage | null;
}) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [duration, setDuration] = useState<60 | 90>(60);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          duration,
          language: selectedLanguage || "English",
        }),
      });
      const data = await res.json();
      if (data.script) {
        onScriptGenerated(data.script);
      }
    } catch {
      // Silent fail — user can write manually
    } finally {
      setIsGenerating(false);
    }
  }, [topic, tone, duration, selectedLanguage, onScriptGenerated]);

  return (
    <div className="space-y-4 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-5">
      <div className="flex items-center gap-2">
        <Wand2 className="size-4 text-violet-600" />
        <Label className="text-sm font-semibold">AI Script Generator</Label>
        <Badge className="text-[10px] bg-violet-100 text-violet-700 border-violet-200">
          Gemini
        </Badge>
      </div>

      <div className="space-y-3">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's your video about? e.g. '5 morning habits for productivity'"
          className="text-sm bg-white focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
        />

        <div className="flex gap-3">
          {/* Tone picker */}
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">
              Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all",
                    tone === t.value
                      ? "border-violet-500 bg-violet-100 text-violet-700"
                      : "border-muted bg-white text-muted-foreground hover:border-violet-300"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">
              Duration
            </label>
            <div className="flex gap-1.5">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value as 60 | 90)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-all",
                    duration === d.value
                      ? "border-violet-500 bg-violet-100 text-violet-700"
                      : "border-muted bg-white text-muted-foreground hover:border-violet-300"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          size="sm"
          className="w-full gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Generating script...
            </>
          ) : (
            <>
              <Wand2 className="size-3.5" />
              Generate Script
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function GenderIcon({ gender }: { gender: VoiceProfile["gender"] }) {
  if (gender === "male") return <User className="size-3.5" />;
  if (gender === "female") return <UserCircle className="size-3.5" />;
  return <Mic className="size-3.5" />;
}

export function BriefingStep({
  script,
  onScriptChange,
  selectedVoice,
  suggestedVoices,
  onVoiceSelect,
  selectedLanguage,
  onLanguageChange,
}: BriefingStepProps) {
  const wordCount = useMemo(() => {
    const trimmed = script.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [script]);

  const charCount = script.length;

  const wordStatus = useMemo(() => {
    if (wordCount === 0) return "empty";
    if (wordCount < 150) return "short";
    if (wordCount <= 225) return "ideal";
    return "long";
  }, [wordCount]);

  const estimatedSeconds = useMemo(() => {
    // Average speaking rate: ~2.5 words per second
    return Math.round(wordCount / 2.5);
  }, [wordCount]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Script & Voice Briefing
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Write your video script and choose a voice that matches your
          character's personality.
        </p>
      </div>

      {/* AI Script Generator */}
      <ScriptGenerator
        onScriptGenerated={onScriptChange}
        selectedLanguage={selectedLanguage}
      />

      <Separator />

      {/* Script Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Video Script</Label>
          <Badge variant="outline" className="text-[10px]">
            Edit below or generate above
          </Badge>
        </div>

        <Textarea
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          placeholder="Write your video script here... Aim for 150-225 words for a 60-90 second video."
          className="min-h-[180px] resize-y text-sm leading-relaxed focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
        />

        {/* Word count and duration bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              {charCount} characters
            </span>
            <Separator orientation="vertical" className="h-3" />
            <span
              className={cn(
                "font-medium transition-colors",
                wordStatus === "empty" && "text-muted-foreground",
                wordStatus === "short" && "text-amber-600",
                wordStatus === "ideal" && "text-emerald-600",
                wordStatus === "long" && "text-red-500"
              )}
            >
              {wordCount} words
            </span>
          </div>

          <div className="flex items-center gap-2">
            {wordCount > 0 && (
              <span className="text-muted-foreground">
                ~{estimatedSeconds}s
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all",
                wordStatus === "empty" &&
                  "bg-muted text-muted-foreground",
                wordStatus === "short" &&
                  "bg-amber-100 text-amber-700",
                wordStatus === "ideal" &&
                  "bg-emerald-100 text-emerald-700",
                wordStatus === "long" && "bg-red-100 text-red-600"
              )}
            >
              {wordStatus === "empty" && "150-225 words recommended"}
              {wordStatus === "short" && "Too short for 60s"}
              {wordStatus === "ideal" && "Perfect length"}
              {wordStatus === "long" && "May exceed 90s"}
            </span>
          </div>
        </div>

        {/* Visual progress toward target range */}
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              wordStatus === "empty" && "bg-muted-foreground/30",
              wordStatus === "short" &&
                "bg-gradient-to-r from-amber-400 to-amber-500",
              wordStatus === "ideal" &&
                "bg-gradient-to-r from-emerald-400 to-emerald-500",
              wordStatus === "long" &&
                "bg-gradient-to-r from-red-400 to-red-500"
            )}
            style={{
              width: `${Math.min((wordCount / 225) * 100, 100)}%`,
            }}
          />
          {/* Target zone markers */}
          <div
            className="absolute top-0 h-full w-px bg-emerald-600/40"
            style={{ left: `${(150 / 225) * 100}%` }}
          />
          <div className="absolute top-0 right-0 h-full w-px bg-emerald-600/40" />
        </div>
      </div>

      <Separator />

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Language</Label>
        </div>

        <div className="flex flex-wrap gap-2">
          {indianLanguages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-200",
                  isSelected
                    ? "border-violet-500 bg-violet-100 text-violet-700 shadow-sm"
                    : "border-muted hover:border-violet-300 hover:bg-violet-50/50 text-muted-foreground"
                )}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Voice Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="size-4 text-violet-600" />
          <Label className="text-sm font-semibold">Choose a Voice</Label>
          {selectedLanguage && (
            <Badge variant="outline" className="text-[10px]">
              {selectedLanguage}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {suggestedVoices.map((voice) => {
            const isSelected = selectedVoice?.id === voice.id;
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => onVoiceSelect(voice)}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-violet-500 bg-violet-50/80 shadow-md shadow-violet-100/50"
                    : "border-muted hover:border-violet-300 hover:bg-violet-50/30 hover:shadow-sm"
                )}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 p-1 shadow-sm">
                    <Check className="size-3 text-white" />
                  </div>
                )}

                {/* Name and gender */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-lg p-1.5 transition-colors",
                      isSelected
                        ? "bg-violet-200/80 text-violet-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <GenderIcon gender={voice.gender} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{voice.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {voice.language} · {voice.age} {voice.gender}
                    </p>
                  </div>
                </div>

                {/* Style badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit text-[10px] capitalize border",
                    STYLE_COLORS[voice.style]
                  )}
                >
                  {voice.style}
                </Badge>

                {/* Preview button placeholder */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Mic className="size-3" />
                  <span>Preview voice</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Customization (visual only for MVP) */}
      {selectedVoice && (
        <>
          <Separator />
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-violet-600" />
              <Label className="text-sm font-semibold">
                Voice Customization
              </Label>
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground"
              >
                Preview
              </Badge>
            </div>

            {/* Pitch slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Pitch
                </label>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  {selectedVoice.pitch}%
                </span>
              </div>
              <Slider
                defaultValue={[selectedVoice.pitch]}
                min={0}
                max={100}
                step={1}
                className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-violet-400 [&_[data-slot=slider-range]]:to-indigo-500 [&_[data-slot=slider-thumb]]:border-violet-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>

            {/* Stability slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Stability
                </label>
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  {selectedVoice.stability}%
                </span>
              </div>
              <Slider
                defaultValue={[selectedVoice.stability]}
                min={0}
                max={100}
                step={1}
                className="[&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-violet-400 [&_[data-slot=slider-range]]:to-indigo-500 [&_[data-slot=slider-thumb]]:border-violet-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>More expressive</span>
                <span>More consistent</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
