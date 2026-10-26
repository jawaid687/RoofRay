# RoofRay Workspace Rules

You are working on RoofRay, a React 19 + TypeScript + Vite + Three.js (R3F) app.
Always read docs/PRD.md before planning. Follow it exactly.

- Simulation code in `src/simulation`, `src/optimization`, `src/calculations` must be pure TypeScript with no React or Three.js imports, and fully unit tested.
- Scene convention: north = -Z, east = +X, up = +Y. Azimuth is clockwise from true north.
- One sun vector is the single source of truth for lighting, shadow map, raycasts and energy.
- Buildings and rooftop obstacles are immutable constants. Never add code that changes them.
- Heavy computation (annual analysis) runs in a Web Worker. Never block the main thread.
- TypeScript strict, no `any` in simulation code. No external paid APIs, no network calls.
- Do not invent numbers. All coefficients live in `src/config/assumptions.ts`.
- Work one milestone at a time. After each, run tests and build, summarize changes, and stop for review.
- Do not delete existing features unless the PRD says so.
