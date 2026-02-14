# CLAUDE.md

## Project Overview

**InfluencerFlow** — AI-powered video generation platform that transforms a static AI character image into 60–90 second short-form videos with lip-syncing, voice synthesis, B-roll, and dynamic subtitles.

## Stack

- **Framework:** Next.js 16.1.6 + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Icons:** Lucide React
- **AI/Video APIs:** HeyGen/D-ID (lip-sync), ElevenLabs (voice), Pexels (B-roll), Gemini (script analysis)
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
├── app/              # Pages and API routes (App Router)
│   ├── api/          # Backend API routes
│   └── page.tsx      # Home page (wizard flow)
├── components/       # React components
│   ├── ui/           # shadcn/ui primitives
│   └── steps/        # Wizard step components
├── lib/              # Utilities, API clients, types
└── data/             # Static data (voice profiles, music, etc.)
```

## Key Patterns

- **Path alias:** `@/*` maps to `./src/*`
- **App Router:** All pages in `src/app/`, API routes in `src/app/api/`
- **5-step wizard flow:** Upload → Briefing → Preview → Generate → Refine
- **9:16 vertical aspect ratio** for all video output (mobile-first)

## Environment Variables

```
HEYGEN_API_KEY=         # HeyGen API for avatar animation
ELEVENLABS_API_KEY=     # ElevenLabs for voice synthesis
PEXELS_API_KEY=         # Pexels for B-roll stock footage
GEMINI_API_KEY=         # Google Gemini for script analysis
```
