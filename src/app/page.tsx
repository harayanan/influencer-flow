import { Wizard } from "@/components/wizard";
import { Video, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Influencer<span className="text-violet-600">Flow</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-violet-500" />
            AI-Powered Video Generation
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Create AI Influencer Videos{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            in Minutes
          </span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base">
          Upload a character image, paste your script, and let AI handle
          lip-syncing, B-roll, subtitles, and music — all in one flow.
        </p>
      </section>

      {/* Wizard */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Wizard />
      </section>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        <p>InfluencerFlow — AI-powered short-form video generation</p>
      </footer>
    </main>
  );
}
