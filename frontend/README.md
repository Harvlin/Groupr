# Truth Layer — Frontend

React + TypeScript + Vite + Tailwind CSS implementation of the Truth Layer MVP.

## Tech stack

- **React 18** with TypeScript
- **Vite** for dev/build
- **React Router v6** for routing
- **Tailwind CSS** with custom Meadow-glass ledger design tokens
- **Framer Motion** for scroll reveals and micro-interactions
- **Lucide React** for icons
- **Recharts** for the landing-page demo chart

## Design system

All styling is driven by the tokens in `tailwind.config.js` and documented in `DESIGN_SYSTEM.md` (to be created at repo root). Key principles:

- Light-mode dominant; single lime hero (#9FE870)
- Deep forest (#163300) reserved for authority/trust panels
- No blurred drop shadows — only 1px hairline borders
- All buttons are pills (9999px radius)
- Condensed 900-weight display type only for headlines and large numerals

## Local development

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Pages

| Route | Purpose |
|---|---|
| `/` | Marketing landing page (Phase 0) |
| `/dashboard` | Student contribution dashboard (Phase 3) |
| `/teacher-report` | Teacher report with scores, rationale, overrides (Phase 3) |
| `/sources` | Connect Google Docs / GitHub sources (Phase 1 UI) |
| `/disputes` | File and view disputes (Phase 3) |
| `/privacy` | Data & privacy page (Phase 4) |
| `/ai-disclosure` | Draft AI disclosure recap (Phase 4) |

## Mock data

Until the Spring Boot backend is wired up, `src/services/api.ts` returns mock data from `src/data/mock.ts`. The API surface is shaped like the real backend so the swap is straightforward.

## Build

```bash
npm run build
```

Output goes to `dist/`.
