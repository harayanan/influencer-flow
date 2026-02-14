# Changelog

All notable changes to InfluencerFlow will be documented in this file.

## [0.3.0] - 2026-02-14

### Fixed
- Video preview now shows uploaded image as video mockup with play button, subtitle preview, duration badge, and controls bar (was showing broken `<video>` tag)

### Added
- **Indian voices**: 12 voice profiles — Arjun, Meera, Karthik, Ananya, Debashish, Priya, Naveen, Lakshmi, Riya, Vikram, Divya, Suresh
- **8 Indian languages**: Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati
- Language filter pills in Briefing step — selecting a language filters voice suggestions
- `IndianLanguage` type and `language` field on `VoiceProfile`
- **AI Script Generator**: New UI section in Briefing step with topic, tone, and duration inputs
- API route: `POST /api/generate-script` — Gemini 2.0 Flash powered (template fallback without API key)
- Installed `@google/generative-ai` SDK
- Script is editable after AI generation

### Changed
- Voice profiles expanded from 6 Western to 12 Indian
- Briefing step layout: AI Script Generator → Script Editor → Language Picker → Voice Picker
- Generate step accepts `imagePreview` prop for video mockup display

## [0.2.0] - 2026-02-14

### Added
- 5-step wizard UI: Upload → Briefing → Preview → Generate → Refine
- Wizard orchestrator with full state management and step transitions
- Upload step: drag-and-drop image upload with 9:16 preview
- Briefing step: script editor with word count + voice profile selector
- Preview step: storyboard timeline with talking-head/B-roll segments
- Generate step: simulated generation with progress animation
- Refine step: subtitle style picker, editable subtitles, logo upload, export
- API route: POST /api/analyze-script (keyword extraction, sentiment, breakpoints)
- API route: GET /api/broll (mock B-roll + Pexels integration ready)
- API route: GET /api/voices (voice profiles with filtering)
- API route: POST /api/generate-video (job queue stub)
- API route: GET /api/generate-video/[jobId] (job status polling)
- Core types (ProjectState, VoiceProfile, BRollClip, StoryboardSegment, etc.)
- Music tracks data (6 tracks with mood matching)
- Landing page with header, hero section, and violet/indigo gradient theme

## [0.1.0] - 2026-02-14

### Added
- Initial project scaffolding (Next.js 16.1.6, React 19, Tailwind 4)
- shadcn/ui component library (14 components)
- GitHub repo and Vercel deployment
- Project docs: PRD.md, CLAUDE.md, HANDOVER.md, CHANGELOG.md
