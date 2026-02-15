"use client";

import { useState, useCallback, useRef } from "react";
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
  IndianLanguage,
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
  audioUrl: null,
  audioDuration: null,
  videoClipUrl: null,
  jobId: null,
  subtitleStyle: "hormozi",
  subtitles: [],
  logoFile: null,
  logoPreview: null,
  musicTrack: null,
};

export function Wizard() {
  const [state, setState] = useState<ProjectState>(initialState);
  const [selectedLanguage, setSelectedLanguage] =
    useState<IndianLanguage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const handleLanguageChange = useCallback(
    (lang: IndianLanguage) => {
      setSelectedLanguage(lang);
      updateState({
        suggestedVoices: suggestVoices(undefined, undefined, lang),
        selectedVoice: null,
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

  const realGeneration = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Step 1: Generate audio (10% → 40%)
      updateState({
        generationStatus: "generating-audio",
        generationProgress: 10,
      });

      const voice = state.selectedVoice;
      if (!voice) return;

      const audioRes = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: state.script,
          geminiVoice: voice.geminiVoice,
          stylePrefix: voice.stylePrefix,
          language: selectedLanguage || undefined,
        }),
        signal: controller.signal,
      });

      const audioData = await audioRes.json();
      if (controller.signal.aborted) return;

      updateState({
        generationProgress: 40,
        audioUrl: audioData.audioDataUrl || null,
        audioDuration: audioData.durationSec || null,
      });

      // Step 2: Start video generation (50%)
      updateState({
        generationStatus: "generating-video",
        generationProgress: 50,
      });

      // Convert image to base64 for Veo
      let imageBase64 = "";
      if (state.imagePreview) {
        // imagePreview is a data URL — extract the base64 part
        const commaIndex = state.imagePreview.indexOf(",");
        imageBase64 =
          commaIndex >= 0
            ? state.imagePreview.slice(commaIndex + 1)
            : state.imagePreview;
      }

      const videoRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          prompt:
            "Animate this person with subtle natural movements: slight head turns, blinking, and gentle facial expressions. Keep the background stable. Cinematic lighting.",
          durationSeconds: 8,
        }),
        signal: controller.signal,
      });

      const videoData = await videoRes.json();
      if (controller.signal.aborted) return;

      const jobId = videoData.jobId;
      updateState({
        jobId,
        generationStatus: "polling-video",
        generationProgress: 60,
      });

      // Step 3: Poll for video completion (60% → 95%)
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes at 5s intervals

      while (attempts < maxAttempts) {
        if (controller.signal.aborted) return;

        await new Promise((r) => setTimeout(r, 5000));
        if (controller.signal.aborted) return;

        attempts++;

        try {
          const pollRes = await fetch(`/api/generate-video/${jobId}`, {
            signal: controller.signal,
          });
          const pollData = await pollRes.json();

          if (pollData.status === "complete") {
            updateState({
              videoClipUrl: pollData.videoDataUrl || null,
              generationProgress: 100,
              generationStatus: "complete",
              videoUrl: "generated",
            });
            return;
          }

          if (pollData.status === "error") {
            // Video failed but audio succeeded — still complete
            updateState({
              generationProgress: 100,
              generationStatus: "complete",
              videoUrl: "generated",
            });
            return;
          }

          // Update progress (map poll progress 0-100 to our 60-95 range)
          const mappedProgress = 60 + (pollData.progress / 100) * 35;
          updateState({ generationProgress: Math.round(mappedProgress) });
        } catch {
          // Transient poll error — keep trying
        }
      }

      // Timed out — still complete with audio
      updateState({
        generationProgress: 100,
        generationStatus: "complete",
        videoUrl: "generated",
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Generation error:", err);
      updateState({
        generationStatus: "error",
        generationProgress: 0,
      });
    }
  }, [state.selectedVoice, state.script, state.imagePreview, selectedLanguage, updateState]);

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
        audioUrl: null,
        audioDuration: null,
        videoClipUrl: null,
        jobId: null,
      }));
      setTimeout(() => realGeneration(), 500);
      return;
    }
    setState((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, 5) as ProjectState["step"],
    }));
  }, [state.step, analyzeScript, realGeneration]);

  const goBack = useCallback(() => {
    // Abort any in-progress generation when going back
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
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
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
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
            imagePreview={state.imagePreview}
            audioUrl={state.audioUrl}
            audioDuration={state.audioDuration}
            videoClipUrl={state.videoClipUrl}
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
