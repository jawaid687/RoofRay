# RoofRay Workspace Rules & Context

You are working on RoofRay, a production-grade React 19 + TypeScript + Vite + Three.js (R3F) application.
Always read `GEMINI.md`, `MISTAKES.md`, and `docs/PRD.md` before planning. Follow them strictly.

## Core Invariants
- **Pure TypeScript Boundary:** Simulation code in `src/simulation`, `src/optimization`, `src/calculations` must be pure TypeScript with NO React or Three.js imports, and fully unit tested.
- **Scene Coordinates:** North = -Z, East = +X, Up = +Y. Azimuth is measured clockwise from true north (0° = North, 90° = East, 180° = South, 270° = West).
- **Sun Vector:** One sun vector is the single source of truth for lighting, shadow map, raycasts, and energy calculations.
- **Immutability:** Buildings and rooftop obstacles are immutable constants deeply frozen with `Object.freeze()`. Never add code that modifies them at runtime.
- **Worker Execution:** Heavy computation (annual analysis) runs in a Web Worker (`src/simulation/analysis.worker.ts`). Never block the main UI thread.
- **Strict TypeScript:** TypeScript strict mode; no `any` in simulation code. No external paid APIs, no network calls.
- **Centralized Constants:** Do not invent numbers or magic constants. All coefficients live in `src/config/assumptions.ts`.
- **Localization Parity:** Maintain 100% complete feature and text parity between English and Bangla (বাংলা) in `src/i18n/translations.ts`.

## Test Integrity & Production Standards
- **Never Delete Tests:** Never delete, remove, or weaken any tests ("done remove any tests"). Every existing test must remain intact and passing.
- **Cross-Platform Safety:** Never hardcode operating-system-specific paths (e.g. Windows Chrome paths `C:\...`). Always use dynamic detection (`scripts/resolveChrome.ts`, `os.platform()`) and handle child process error events.
- **Mistake Registry:** If any mistake or bug is found, immediately record it in `MISTAKES.md` with symptoms, root cause, resolution, and prevention rules so it is never made again.
- **Verification Requirement:** Every milestone must be validated by running:
  1. `npm run build`
  2. `npm test`
  3. `npm run test:integration`
  4. `npm run test:browser`
  5. `npm run test:all`
