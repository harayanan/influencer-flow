# CLAUDE.md

## Project Overview

**InfluencerFlow** — AI-powered video generation platform that transforms a static AI character image into 60–90 second short-form videos with lip-syncing, voice synthesis, B-roll, and dynamic subtitles. Indian-first: 12 voice profiles across 8 Indian languages.

## Stack

- **Framework:** Next.js 16.1.6 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Icons:** Lucide React
- **AI:** Google-only stack — Gemini 2.0 Flash (text), Gemini 2.5 Flash TTS (voice), Veo 2 (image-to-video)
- **B-roll:** Pexels API (route ready)
- **Deployment:** Vercel
- **GitHub:** https://github.com/harayanan/influencer-flow
- **Vercel:** https://influencer-flow-iota.vercel.app

## Build & Development

```bash
npm install
npm run dev       # Dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (metadata, Toaster)
│   ├── page.tsx                       # Landing page with Wizard
│   └── api/
│       ├── analyze-script/route.ts    # POST — script keyword/sentiment analysis
│       ├── generate-script/route.ts   # POST — AI script generation (Gemini + fallback)
│       ├── generate-audio/route.ts    # POST — TTS via Gemini 2.5 Flash
│       ├── broll/route.ts             # GET — B-roll search (Pexels + mock)
│       ├── voices/route.ts            # GET — voice profiles
│       ├── generate-video/route.ts    # POST — video generation via Veo 2
│       └── generate-video/[jobId]/route.ts  # GET — Veo job status polling
├── components/
│   ├── wizard.tsx                     # Main orchestrator (state, steps, language filter)
│   ├── steps/
│   │   ├── upload-step.tsx            # Step 1: Drag-and-drop image upload
│   │   ├── briefing-step.tsx          # Step 2: AI script gen + editor + language + voice
│   │   ├── preview-step.tsx           # Step 3: Storyboard timeline
│   │   ├── generate-step.tsx          # Step 4: Generation progress + video preview
│   │   └── refine-step.tsx            # Step 5: Subtitle styling + logo + export
│   └── ui/                            # 14 shadcn/ui components
└── lib/
    ├── types.ts                       # TypeScript interfaces (IndianLanguage, VoiceProfile, etc.)
    ├── voices.ts                      # 12 Indian voice profiles + Gemini voice mappings
    ├── gemini.ts                      # Shared Gemini client (TTS, Veo, text model)
    ├── job-store.ts                   # In-memory Veo job tracking
    ├── music.ts                       # 6 music tracks + mood matching
    └── utils.ts                       # shadcn cn() utility
```

## Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **App Router:** All pages in `src/app/`, API routes in `src/app/api/`
- **5-step wizard flow:** Upload → Briefing → Preview → Generate → Refine
- **9:16 vertical aspect ratio** for all video output (mobile-first)
- **Indian-first:** 12 voices, 8 languages (Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati)
- **Mock-first APIs:** All routes work with placeholder data; real integration activates via env vars

## Environment Variables

```
GEMINI_API_KEY=         # Single key for all AI: Gemini Flash (text), Gemini TTS (voice), Veo 2 (video)
PEXELS_API_KEY=         # Pexels for B-roll stock footage (route ready)
```
