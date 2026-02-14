# Changelog

All notable changes to InfluencerFlow will be documented in this file.

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
- Voice profiles data (6 voices with style/age/gender metadata)
- Music tracks data (6 tracks with mood matching)
- Landing page with header, hero section, and violet/indigo gradient theme

## [0.1.0] - 2026-02-14

### Added
- Initial project scaffolding (Next.js 16.1.6, React 19, Tailwind 4)
- shadcn/ui component library (14 components)
- GitHub repo and Vercel deployment
- Project docs: PRD.md, CLAUDE.md, HANDOVER.md, CHANGELOG.md
