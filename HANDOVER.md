# HANDOVER.md — InfluencerFlow

## Current Status: Google-Only AI Integration Complete — Needs Deploy + Testing

## What Was Done

### Session 1 (2026-02-14)
- Project scaffolded: Next.js 16.1.6, React 19, Tailwind 4, shadcn/ui
- GitHub repo: https://github.com/harayanan/influencer-flow
- Vercel: https://influencer-flow-iota.vercel.app
- 5-step wizard UI + 5 API routes + project docs

### Session 2 (2026-02-14)
- Fixed video preview: Generate step shows uploaded image as video mockup
- 12 Indian voices, 8 Indian languages with language filter
- AI Script Generator in Briefing step (Gemini 2.0 Flash + template fallback)
- Installed `@google/generative-ai` SDK

### Session 3 (2026-02-15)
- **Google-only AI integration** — replaced planned 3-provider stack (Gemini + ElevenLabs + HeyGen) with single Google API key:
  - **Gemini 2.0 Flash** — text/script generation (existing, refactored to shared client)
  - **Gemini 2.5 Flash TTS** — voice synthesis via REST API (new)
  - **Veo 2** — image-to-video animation via REST API (new, 8-second clips)
- **New files created:**
  - `src/lib/gemini.ts` — Shared Gemini client (lazy singleton, TTS, Veo, retry helper, PCM→WAV conversion)
  - `src/lib/job-store.ts` — In-memory job tracking for Veo operations (30min TTL)
  - `src/app/api/generate-audio/route.ts` — POST endpoint for TTS (Gemini voice + style prefix + language instruction)
- **Files updated:**
  - `src/lib/types.ts` — Added `geminiVoice`, `stylePrefix` to VoiceProfile; `audioUrl`, `audioDuration`, `videoClipUrl`, `jobId` to ProjectState; updated `generationStatus` union
  - `src/lib/voices.ts` — Added Gemini voice mappings (Puck/Charon/Orus/Fenrir for male, Kore/Aoede/Leda for female) + style prefixes to all 12 voices
  - `src/app/api/generate-video/route.ts` — Rewired to Veo 2 (accepts imageBase64 + prompt, creates job in store)
  - `src/app/api/generate-video/[jobId]/route.ts` — Polls Veo operations via job-store, mock fallback preserved
  - `src/app/api/generate-script/route.ts` — Refactored to use shared `getGeminiFlash()` from gemini.ts
  - `src/components/wizard.tsx` — Replaced `simulateGeneration()` with `realGeneration()` (audio → video → poll loop with AbortController)
  - `src/components/steps/generate-step.tsx` — New status steps (Audio → Video → Animate → Done), real `<audio>` player, real `<video>` element for Veo clips, Ken Burns fallback
  - `src/components/steps/briefing-step.tsx` — "Preview voice" button on voice cards (calls TTS API with sample sentence, plays inline)
  - `CLAUDE.md` — Updated stack, structure, env vars
- **Build passes clean** — no TypeScript errors

## API Integration Status

| Service | Purpose | Status |
|---------|---------|--------|
| **Gemini 2.0 Flash** | Script generation | Working (shared client) |
| **Gemini 2.5 Flash TTS** | Voice synthesis | Integrated (needs Vercel env) |
| **Veo 2** | Image-to-video (8s clips) | Integrated (needs Vercel env) |
| **Pexels** | B-roll stock footage | Route ready, mock fallback |

## Blockers
- `GEMINI_API_KEY` needs to be set in Vercel env vars for production
- Veo 2 generates max 8-second clips (app targets 60-90s); full-length video composition is a future enhancement

## Next Steps (Priority Order)
1. **Add `GEMINI_API_KEY` to Vercel** — Enables TTS, Veo, and script generation in production
2. **Test full flow locally** — Upload → Briefing (voice preview) → Preview → Generate (audio + video) → Refine
3. **Add `PEXELS_API_KEY` to Vercel** — Enables real B-roll search
4. **Deploy and test on Vercel** — Verify TTS + Veo work in serverless (check function timeouts)
5. **Polish** — Error toasts, loading states for edge cases, responsive refinements
6. **Video composition** — Stitch audio narration + Veo clip + B-roll + subtitles into final MP4
7. **Export** — Actual downloadable video output

## Architecture Decisions
- **Google-only AI stack** — Single `GEMINI_API_KEY` for all AI (text, voice, video). Simplifies from 3 providers to 1.
- **Veo limitation** — Max 8s clips. App generates full audio (60-90s) + short hero clip. Ken Burns image as fallback.
- **In-memory job store** — Sufficient for MVP. Swap to Supabase for multi-instance/persistent tracking.
- **Graceful fallbacks** — All routes work with mock data when API key missing. Veo errors don't block audio completion.
- **AbortController** — Generation cancellable via Back button.
- Single-page wizard flow (no multi-page routing)
- 9:16 vertical video as default output
- Violet/indigo gradient theme throughout
- Indian-first voice/language support (8 languages, 12 voices)

---

*Last reviewed: 2026-02-15*
