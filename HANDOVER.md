# HANDOVER.md — InfluencerFlow

## Current Status: MVP UI Complete — Deployed — Needs API Keys + Real Integrations

## What Was Done

### Session 1 (2026-02-14)
- Project scaffolded: Next.js 16.1.6, React 19, Tailwind 4, shadcn/ui
- GitHub repo: https://github.com/harayanan/influencer-flow
- Vercel: https://influencer-flow-iota.vercel.app
- 5-step wizard UI + 5 API routes + project docs

### Session 2 (2026-02-14)
- **Fixed video preview**: Generate step now shows uploaded image as a video mockup (play button, subtitle preview, duration badge, controls bar) instead of broken `<video>` tag
- **Indian voices**: Replaced 6 Western voices with 12 Indian voice profiles (Arjun, Meera, Karthik, Ananya, Debashish, Priya, Naveen, Lakshmi, Riya, Vikram, Divya, Suresh)
- **8 Indian languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati — with language filter pills in Briefing step that update voice suggestions
- **AI Script Generator**: New section in Briefing step — enter topic, pick tone + duration → generates script via Gemini 2.0 Flash (template fallback when no API key). Script is editable after generation.
- **New API route**: `POST /api/generate-script` — Gemini-powered with template fallback
- **Installed `@google/generative-ai`** SDK
- Build passes clean, deployed to Vercel

## What's Built (File Inventory)

```
src/
├── app/
│   ├── layout.tsx                     ✅ Metadata, Toaster
│   ├── page.tsx                       ✅ Landing page with Wizard
│   └── api/
│       ├── analyze-script/route.ts    ✅ Script analysis (mock + Gemini TODO)
│       ├── generate-script/route.ts   ✅ AI script generation (Gemini + template fallback)
│       ├── broll/route.ts             ✅ B-roll search (mock + Pexels ready)
│       ├── voices/route.ts            ✅ Voice profiles
│       ├── generate-video/route.ts    ✅ Video gen queue
│       └── generate-video/[jobId]/route.ts  ✅ Job status polling
├── components/
│   ├── wizard.tsx                     ✅ Orchestrator (state, transitions, language filter)
│   ├── steps/
│   │   ├── upload-step.tsx            ✅ Drag-and-drop image upload
│   │   ├── briefing-step.tsx          ✅ AI script gen + script editor + language picker + voice picker
│   │   ├── preview-step.tsx           ✅ Storyboard timeline
│   │   ├── generate-step.tsx          ✅ Generation progress + image-based video preview
│   │   └── refine-step.tsx            ✅ Subtitle styling + logo + music + export
│   └── ui/                            ✅ 14 shadcn components
└── lib/
    ├── types.ts                       ✅ Types (IndianLanguage, VoiceProfile with language field)
    ├── voices.ts                      ✅ 12 Indian voice profiles + language list + suggest logic
    ├── music.ts                       ✅ 6 music tracks + suggest logic
    └── utils.ts                       ✅ shadcn cn() utility
```

## API Integration Plan

| Service | Purpose | Status | Env Var |
|---------|---------|--------|---------|
| **Gemini 2.0 Flash** | Script generation + analysis | SDK installed, route ready | `GEMINI_API_KEY` |
| **Pexels** | B-roll stock footage | Route ready, mock fallback | `PEXELS_API_KEY` |
| **ElevenLabs** | Voice synthesis (Indian languages) | Not yet integrated | `ELEVENLABS_API_KEY` |
| **HeyGen / D-ID** | Avatar lip-sync animation | Not yet integrated | `HEYGEN_API_KEY` |

## Blockers
- None blocking build/deploy
- API keys not yet set in Vercel env vars

## Next Steps (Priority Order)
1. **Add `GEMINI_API_KEY` to Vercel** — Enables AI script generation + smart script analysis
2. **Add `PEXELS_API_KEY` to Vercel** — Enables real B-roll stock footage search
3. **Visual QA** — Walk through all 5 steps on production, fix UI polish issues
4. **Integrate ElevenLabs** — Real voice synthesis with Indian language support
5. **Integrate HeyGen/D-ID** — Real avatar animation from uploaded image
6. **Real video rendering pipeline** — Composite talking head + B-roll + subtitles + music
7. **Video export** — Actual downloadable MP4 output
8. **Polish** — Responsive design, loading states, error edge cases

## Architecture Decisions
- Single-page wizard flow (no multi-page routing)
- API routes handle all external service integration
- Client-side state management (React useState in wizard.tsx)
- 9:16 vertical video as default output
- Mock-first approach: all APIs work with placeholder data, real integration via env vars
- Violet/indigo gradient theme throughout
- Indian-first voice/language support (8 languages, 12 voices)

---

*Last reviewed: 2026-02-14*
