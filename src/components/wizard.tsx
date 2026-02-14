"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  LayoutGrid,
  Video,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { UploadStep } from "@/components/steps/upload-step";
import { BriefingStep } from "@/components/steps/briefing-step";
import { PreviewStep } from "@/components/steps/preview-step";
import { GenerateStep } from "@/components/steps/generate-step";
import { RefineStep } from "@/components/steps/refine-step";
import type {
  ProjectState,
  VoiceProfile,
  StoryboardSegment,
  SubtitleStyle,
  SubtitleSegment,
  ScriptAnalysis,
} from "@/lib/types";
import { suggestVoices } from "@/lib/voices";

const steps = [
  { label: "Upload", icon: Upload },
  { label: "Briefing", icon: FileText },
  { label: "Preview", icon: LayoutGrid },
  { label: "Generate", icon: Video },
  { label: "Refine", icon: Sparkles },
];

const initialState: ProjectState = {
  step: 1,
  image: null,
  imagePreview: null,
  script: "",
  selectedVoice: null,
  suggestedVoices: [],
  storyboard: [],
  generationProgress: 0,
  generationStatus: "idle",
  videoUrl: null,
  subtitleStyle: "hormozi",
  subtitles: [],
  logoFile: null,
  logoPreview: null,
  musicTrack: null,
};

export function Wizard() {
  const [state, setState] = useState<ProjectState>(initialState);

  const updateState = useCallback(
    (updates: Partial<ProjectState>) =>
      setState((prev) => ({ ...prev, ...updates })),
    []
  );

  const handleImageSelect = useCallback(
    (file: File, preview: string) => {
      updateState({
        image: file,
        imagePreview: preview,
        suggestedVoices: suggestVoices(),
      });
    },
    [updateState]
  );

  const handleVoiceSelect = useCallback(
    (voice: VoiceProfile) => {
      updateState({ selectedVoice: voice });
    },
    [updateState]
  );

  const analyzeScript = useCallback(async () => {
    if (!state.script.trim()) return;

    try {
      const res = await fetch("/api/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: state.script }),
      });
      const analysis: ScriptAnalysis = await res.json();

      const segments: StoryboardSegment[] = [];
      analysis.breakpoints.forEach((bp, i) => {
        const nextBp = analysis.breakpoints[i + 1];
        const endTime = nextBp ? nextBp.time : analysis.estimatedDuration;

        segments.push({
          id: `seg-${i}-talk`,
          type: "talking-head",
          startTime: bp.time,
          endTime: bp.time + (endTime - bp.time) * 0.6,
          text: bp.text,
        });

        if (bp.keyword) {
          segments.push({
            id: `seg-${i}-broll`,
            type: "broll",
            startTime: bp.time + (endTime - bp.time) * 0.6,
            endTime,
            text: bp.text,
            keyword: bp.keyword,
            brollClip: {
              id: `broll-${i}`,
              keyword: bp.keyword,
              url: `https://images.pexels.com/videos/${1000 + i}/free-video.mp4`,
              thumbnail: `https://images.pexels.com/photos/${3000 + i * 100}/pexels-photo.jpeg?auto=compress&w=300`,
              duration: (endTime - bp.time) * 0.4,
              source: "pexels",
              photographer: "Stock Creator",
            },
          });
        }
      });

      const subtitles: SubtitleSegment[] = state.script
        .split(/[.!?]+/)
        .filter((s) => s.trim())
        .map((text, i, arr) => {
          const segDuration = analysis.estimatedDuration / arr.length;
          return {
            id: `sub-${i}`,
            text: text.trim(),
            startTime: i * segDuration,
            endTime: (i + 1) * segDuration,
          };
        });

      updateState({
        storyboard: segments,
        subtitles,
        musicTrack: "Upbeat Energy",
      });
    } catch {
      // Fallback: create simple storyboard from script
      const words = state.script.split(/\s+/).length;
      const duration = words / 2.5;
      updateState({
        storyboard: [
          {
            id: "seg-0",
            type: "talking-head",
            startTime: 0,
            endTime: duration,
            text: state.script.slice(0, 80) + "...",
          },
        ],
        subtitles: [
          {
            id: "sub-0",
            text: state.script,
            startTime: 0,
            endTime: duration,
          },
        ],
        musicTrack: "Upbeat Energy",
      });
    }
  }, [state.script, updateState]);

  const simulateGeneration = useCallback(async () => {
    const statuses: ProjectState["generationStatus"][] = [
      "analyzing",
      "rendering",
      "subtitling",
      "finalizing",
      "complete",
    ];

    for (let i = 0; i < statuses.length; i++) {
      updateState({
        generationStatus: statuses[i],
        generationProgress: ((i + 1) / statuses.length) * 100,
      });
      if (statuses[i] !== "complete") {
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      }
    }

    updateState({ videoUrl: "/api/generate-video/demo-preview" });
  }, [updateState]);

  const goNext = useCallback(async () => {
    if (state.step === 2) {
      await analyzeScript();
    }
    if (state.step === 3) {
      setState((prev) => ({
        ...prev,
        step: 4 as ProjectState["step"],
        generationStatus: "idle",
        generationProgress: 0,
      }));
      setTimeout(() => simulateGeneration(), 500);
      return;
    }
    setState((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 5) as ProjectState["step"],
    }));
  }, [state.step, analyzeScript, simulateGeneration]);

  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: Math.max(prev.step - 1, 1) as ProjectState["step"],
    }));
  }, []);

  const canProceed = () => {
    switch (state.step) {
      case 1:
        return !!state.imagePreview;
      case 2:
        return state.script.trim().length > 20 && !!state.selectedVoice;
      case 3:
        return state.storyboard.length > 0;
      case 4:
        return state.generationStatus === "complete";
      default:
        return true;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step indicator */}
      <nav className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => {
          const stepNum = (i + 1) as ProjectState["step"];
          const isActive = state.step === stepNum;
          const isComplete = state.step > stepNum;
          const Icon = s.icon;

          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete ? "bg-violet-600 text-white" : ""}
                    ${isActive ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 scale-110" : ""}
                    ${!isActive && !isComplete ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${isActive ? "text-violet-600" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-2 mt-[-1rem] transition-colors duration-300 ${
                    state.step > stepNum ? "bg-violet-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Step content */}
      <div className="min-h-[500px]">
        {state.step === 1 && (
          <UploadStep
            imagePreview={state.imagePreview}
            onImageSelect={handleImageSelect}
          />
        )}
        {state.step === 2 && (
          <BriefingStep
            script={state.script}
            onScriptChange={(s) => updateState({ script: s })}
            selectedVoice={state.selectedVoice}
            suggestedVoices={state.suggestedVoices}
            onVoiceSelect={handleVoiceSelect}
          />
        )}
        {state.step === 3 && (
          <PreviewStep storyboard={state.storyboard} script={state.script} />
        )}
        {state.step === 4 && (
          <GenerateStep
            progress={state.generationProgress}
            status={state.generationStatus}
            videoUrl={state.videoUrl}
          />
        )}
        {state.step === 5 && (
          <RefineStep
            subtitleStyle={state.subtitleStyle}
            onStyleChange={(s) => updateState({ subtitleStyle: s })}
            subtitles={state.subtitles}
            onSubtitleEdit={(id, text) =>
              updateState({
                subtitles: state.subtitles.map((sub) =>
                  sub.id === id ? { ...sub, text } : sub
                ),
              })
            }
            logoPreview={state.logoPreview}
            onLogoUpload={(_file, preview) =>
              updateState({ logoPreview: preview })
            }
            musicTrack={state.musicTrack}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={state.step === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <Badge variant="secondary" className="text-sm">
          Step {state.step} of 5
        </Badge>

        {state.step < 5 ? (
          <Button
            onClick={goNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
          >
            {state.step === 3 ? "Generate" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-4 h-4" />
            Export Video
          </Button>
        )}
      </div>
    </div>
  );
}
