export type IndianLanguage =
  | "Hindi"
  | "Tamil"
  | "Telugu"
  | "Bengali"
  | "Marathi"
  | "Kannada"
  | "Malayalam"
  | "Gujarati";

export interface VoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female" | "neutral";
  age: "young" | "adult" | "mature";
  style: "excited" | "educational" | "calm" | "professional" | "friendly";
  language: IndianLanguage;
  pitch: number; // 0-100
  stability: number; // 0-100
  preview_url?: string;
}

export interface BRollClip {
  id: string;
  keyword: string;
  url: string;
  thumbnail: string;
  duration: number;
  source: "pexels" | "storyblocks";
  photographer?: string;
}

export interface StoryboardSegment {
  id: string;
  type: "talking-head" | "broll";
  startTime: number;
  endTime: number;
  text: string;
  brollClip?: BRollClip;
  keyword?: string;
}

export interface SubtitleSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  highlight?: string; // word to highlight
}

export type SubtitleStyle = "hormozi" | "minimalist" | "bold" | "karaoke";

export interface ProjectState {
  step: 1 | 2 | 3 | 4 | 5;
  // Step 1: Upload
  image: File | null;
  imagePreview: string | null;
  // Step 2: Briefing
  script: string;
  selectedVoice: VoiceProfile | null;
  suggestedVoices: VoiceProfile[];
  // Step 3: Preview
  storyboard: StoryboardSegment[];
  // Step 4: Generate
  generationProgress: number;
  generationStatus: "idle" | "analyzing" | "rendering" | "subtitling" | "finalizing" | "complete" | "error";
  videoUrl: string | null;
  // Step 5: Refine
  subtitleStyle: SubtitleStyle;
  subtitles: SubtitleSegment[];
  logoFile: File | null;
  logoPreview: string | null;
  musicTrack: string | null;
}

export interface ScriptAnalysis {
  keywords: string[];
  sentiment: string;
  breakpoints: { time: number; keyword: string; text: string }[];
  estimatedDuration: number;
}
