# GEMINI.md — RoofRay Architecture, Operations & Context Ruleset

> **RoofRay** is a production-grade, AI-powered 3D solar rooftop planning and recommendation platform built with React 19, TypeScript (strict), Vite, Tailwind CSS, Three.js / React Three Fiber, Zustand, and Node.js. It features deterministic astronomical simulation, GPU/CPU raycast shading, automated and manual panel placement, multi-currency economics (USD/BDT), bilingual localization (English/Bangla), and a grounded RAG AI Solar Advisor powered by Google Gemini.

---

## 1. System Architecture & Directory Map

```text
RoofRay-main/
├── dist/                          # Production client bundle (index.html, JS/CSS, worker)
├── docs/                          # PRD, Architecture, KPIs, Data Sources, Pitch materials
├── public/                        # Static assets (favicons, SVG logos)
├── scripts/
│   ├── resolveChrome.ts           # Cross-platform Chrome/Chromium executable locator
│   ├── browserTest.js             # Headless Chrome CDP E2E automated test suite
│   ├── validateAll.js             # Comprehensive production server & integration validation
│   └── testGeminiConnection.ts    # Live Gemini API connectivity and model verification
├── server/
│   └── server.ts                  # Production HTTP server (Node.js, static files, security, API)
├── src/
│   ├── calculations/              # PURE TS: Financials, Energy profile, Emissions, Recommendations
│   │   ├── emissions.ts           # CO2 abatement (DoE Bangladesh 0.62 kg/kWh, EPA) & tree equivalents
│   │   ├── energy.ts              # System kW capacity, annual kWh generation, demand offset %, capacity factor
│   │   ├── financial.ts           # Turnkey cost, retail offset, net metering export credit, payback, 20-yr ROI
│   │   └── recommendation.ts      # Deterministic engineering narrative and placement advice
│   ├── components/                # React 19 UI Components
│   │   ├── layout/                # Header (bilingual switcher, help trigger) & ViewportControls
│   │   ├── panels/                # Control panels (Location, Config, Advisor, Manual Layout, Inspector)
│   │   └── ui/                    # Spotlight tutorial, camera guidance toast, modals, KPI metric cards
│   ├── config/
│   │   ├── assumptions.ts         # Central engineering constants, City presets, tariffs, emission factors
│   │   └── tutorialContent.ts     # Bilingual step-by-step onboarding and spotlight tutorial definitions
│   ├── data/
│   │   ├── buildings.ts           # Immutable archetypes (Apex Lofts, Commercial, Industrial, Residential)
│   │   └── panelTypes.ts          # Standard commercial PV module specs (Mono PERC, Bifacial, High-Efficiency)
│   ├── i18n/
│   │   ├── translations.ts        # 100% complete bilingual dictionary (English & বাংলা)
│   │   └── useLanguage.ts         # Zustand hook for instantaneous reactive language toggling
│   ├── optimization/              # PURE TS: Automated & manual panel layout optimization
│   │   ├── manualPlacement.ts     # Grid snap, boundary collision, obstacle clearance, ghost preview
│   │   ├── optimizationEngine.ts  # Optimization modes: Balanced, Max Generation, Lowest Cost
│   │   └── panelPlacement.ts      # AABB obstacle buffer intersection, portrait/landscape candidate packing
│   ├── rag/                       # PURE TS: Retrieval-Augmented Generation engine
│   │   ├── knowledge/corpus.ts    # SREDA 2025 guidelines, BPDB tariffs, NREL, IEC standards, DoE emission factors
│   │   ├── retrievalEngine.ts     # BM25 lexical search algorithm with tokenization and keyword boosting
│   │   └── types.ts               # Knowledge chunks, metadata, and citation types
│   ├── router/
│   │   └── Router.tsx             # Hash/Path client-side router (`/` Landing Page, `/app` Planner Studio)
│   ├── server/
│   │   └── advisorService.ts      # Gemini API caller, rate limiter, payload & schema validators, prompt builder
│   ├── services/
│   │   └── solarResourceService.ts# Deterministic NASA POWER solar climatology integration & parser
│   ├── simulation/                # PURE TS: Astronomical math, raycasting, insolation
│   │   ├── analysis.worker.ts     # Dedicated Web Worker for off-thread 12-month annual irradiance raycasting
│   │   ├── annualAnalysis.ts      # 12-day seasonal sampling, clear-sky weighting, per-cell exposure & kWh/m²
│   │   ├── clearSky.ts            # Bird clear sky solar irradiance model & solar geometry
│   │   ├── roofGrid.ts            # Roof decomposition into sub-meter discrete analysis cells
│   │   ├── shadowRaycaster.ts     # Live sun-ray intersection with neighborhood occluders & rooftop obstacles
│   │   ├── suitability.ts         # Solar suitability classification (Excellent, Good, Poor, Obstacle)
│   │   ├── sunPosition.ts         # NOAA Solar Position Algorithm (Jean Meeus astronomical equations)
│   │   └── timezone.ts            # IANA timezone translation, DST handling, day length calculations
│   ├── store/
│   │   ├── useGuidanceStore.ts    # Onboarding tutorial state, camera guidance, help modal registry
│   │   └── useSolarStore.ts       # Central application state (buildings, sun, heatmap, placement, simulation)
│   ├── tests/
│   │   └── calculations.test.ts   # Central deterministic test runner chaining all 12 sub-suites
│   └── three/                     # React Three Fiber / Three.js 3D Viewport
│       ├── CameraController.tsx   # OrbitControls, camera orientation, smooth focus transitions
│       ├── Compass.tsx            # True-North orientation 3D compass
│       ├── RoofHeatmap.tsx        # High-performance instanced mesh heatmap coloring for roof cells
│       ├── Scene.tsx              # Lighting, shadows, background sky, directional sun light
│       ├── SolarAnimator.tsx      # Day & year continuous time animation loop
│       └── SunPath.tsx            # 3D diurnal arc visualizer and celestial sun sphere
├── tests/                         # Comprehensive unit test suites (12 deterministic suites)
├── MISTAKES.md                    # Registry of discovered mistakes, root causes, and prevention rules
└── GEMINI.md                      # This core context and architectural guide
```

---

## 2. Invariants & Mathematical Conventions

1. **Scene Coordinate System (Three.js Convention):**
   * **North:** `-Z`
   * **East:** `+X`
   * **Up (Zenith):** `+Y`
   * **South:** `+Z`
   * **West:** `-X`
   * **Azimuth:** Measured in degrees clockwise from True North ($0^\circ = \text{North}, 90^\circ = \text{East}, 180^\circ = \text{South}, 270^\circ = \text{West}$).
   * **Elevation:** Angle in degrees above the local horizontal plane (negative elevation indicates night).

2. **Sun Vector Single Source of Truth:**
   * One 3D normalized vector `vectorToSun` is computed from the NOAA solar position equations.
   * This exact vector drives Three.js directional light positioning, real-time shadow projection, live raycast shading checks, and hourly insolation calculation. No component may calculate an independent sun direction.

3. **Pure TypeScript Simulation Boundary:**
   * Modules under `src/simulation/`, `src/optimization/`, and `src/calculations/` are **pure TypeScript**.
   * They must have **zero imports from React, `@react-three/*`, or `three`**.
   * All functions in these directories must be 100% deterministic, side-effect free, and fully testable in Node.js.

4. **Building & Obstacle Immutability:**
   * `INITIAL_BUILDINGS` and their rooftop obstacles are deeply frozen with `Object.freeze()`.
   * Building geometry, dimensions, positions, and obstacles must never be mutated at runtime.

5. **Off-Thread Computation:**
   * Annual solar exposure and 12-month raycasting runs exclusively in a Web Worker (`src/simulation/analysis.worker.ts`).
   * The UI main thread must never block on intensive raycasting operations.

6. **Centralized Constants:**
   * Magic numbers and arbitrary coefficients are prohibited. All physical, financial, and simulation parameters are declared in `src/config/assumptions.ts`.

7. **Zero Paid External API Dependencies:**
   * System functions entirely standalone with deterministic models (NOAA equations, Bird clear-sky model, embedded BM25 knowledge corpus).
   * Google Gemini API calls are proxied through `server/server.ts` with graceful offline fallback if `GEMINI_API_KEY` is absent.

---

## 3. Core Modules & Engine Details

### A. NOAA Solar Engine (`src/simulation/sunPosition.ts`)
* Implements Jean Meeus astronomical algorithms adopted by NOAA ESRL.
* Computes Julian Day, Julian Century, Sun Geometric Mean Longitude, Mean Anomaly, Eccentricity, Equation of Center, True Longitude, Apparent Longitude, Mean Obliquity of Ecliptic, Obliquity Correction, Right Ascension, Solar Declination, Equation of Time, Solar Hour Angle, Zenith, Solar Azimuth, and Atmospheric Refraction.
* Handles extreme astronomical conditions: Polar Day (Midnight Sun) and Polar Night in high latitudes (e.g., Tromsø, Norway), accurately distinguishing zero day length from 24-hour day length.

### B. Shading & Raycasting Engine (`src/simulation/shadowRaycaster.ts`)
* Uses Axis-Aligned Bounding Box (AABB) ray intersection tests.
* Pre-computes neighborhood occluder boxes and rooftop obstacle boxes.
* Determines whether each roof grid cell has an unoccluded line-of-sight to the celestial sun vector.
* High-performance typed array operations with zero inner-loop heap allocations.

### C. Optimization & Panel Placement (`src/optimization/`)
* **Collision Detection:** AABB overlap checks enforcing safety margins (`roofEdgeMargin` = 0.5m, `obstacleBufferMargin` = 0.6m, maintenance walkways = 0.4m).
* **Placement Modes:**
  * **Balanced:** Places panels on the highest exposure spots to offset ~100% of annual electricity consumption.
  * **Max Generation:** Densest allowable grid packing across all valid unshaded roof space.
  * **Lowest Cost:** Installs the minimal panel set needed to achieve substantial electricity bill reduction with shortest payback.
* **Manual Studio:** Live ghost preview, grid snapping, individual module placement/removal, real-time potential scoring.

### D. Multi-Currency Financials & Emissions (`src/calculations/`)
* Multi-currency support: US Dollar (`USD`, Western numeral formatting) and Bangladeshi Taka (`BDT`, South Asian comma system: `৳8,75,000`).
* Net metering settlement: Separates self-consumed generation (offsetting retail tariffs directly) from exported surplus (credited at configurable export factor, default 50%).
* SREDA Bangladesh Compliance: 100% sanctioned load cap enforcement, single-phase and 3-phase matching rules, 80% distribution transformer substation cap.
* Emissions: Uses official Bangladesh Department of Environment (DoE) & SREDA grid emission factor (0.620 kg CO2/kWh) and US EPA eGRID factors.

### E. AI Solar Advisor & RAG System (`src/server/advisorService.ts`, `src/rag/`)
* **Retrieval Engine:** Custom BM25 lexical search over indexed knowledge chunks (`sreda-net-metering-guidelines-2025`, `bpdb-tariffs`, `sreda-technical-standards`, `doe-grid-emission-factors`, `nrel-pvwatts`).
* **Location Reconciliation:** Intelligently detects user questions referring to distinct geographic locations (e.g. asking about Rajshahi while active 3D model is SF) and provides localized data without conflicting.
* **Multi-Turn Chat History:** Preserves conversation context across up to 20 user/assistant turns.
* **Schema Validation:** Strict JSON schema validation (`validateAdvisorResponseSchema`); rejects malformed or non-string array items.
* **Prompt Injection Defense & Redaction:** API keys are never leaked to client or logged.

### F. Security & Production Server (`server/server.ts`)
* Built with Node.js standard `http` module (zero external server framework dependencies).
* Canonical path containment (`path.resolve` + `path.relative`) preventing directory traversal (`..`, `%2e%2e`, `/..%2f`).
* Strict CORS whitelist enforcement (disallowing wildcard origins for stateful operations).
* Payload size limit guard (strictly rejects payloads > 100KB with HTTP 413).
* In-memory sliding window rate limiter (30 req/min per IP) and daily instance quota (500 req/day).

---

## 4. Ruleset for Every New Conversation Context

When interacting with or extending this codebase, every AI agent and developer **MUST adhere to the following rules**:

### Rule 1: Zero Test Regression & Test Integrity ("Never Delete Tests")
* **DO NOT delete, weaken, or comment out any tests.**
* Any new feature, algorithm, or bugfix must be accompanied by new deterministic test cases.
* All four verification suites must pass before any milestone is marked done:
  1. `npm run build` (TypeScript compilation & Vite bundle)
  2. `npm test` (Unit test suite including all 11 test modules)
  3. `npm run test:integration` (Production server & API security suite)
  4. `npm run test:browser` (Headless Chrome E2E browser tests)
  5. `npm run test:all` (Complete verification pipeline)

### Rule 2: Cross-Platform Compatibility
* Never hardcode operating system paths (e.g., `C:\Program Files\...`, `/home/...`).
* Always resolve binaries dynamically using `scripts/resolveChrome.ts` or `os.platform()`.
* Include `--no-sandbox`, `--disable-setuid-sandbox`, and `--disable-dev-shm-usage` for Chrome headless processes on Linux.
* Always handle child process `error` events to prevent unhandled exceptions.

### Rule 3: Pure TypeScript Boundary for Simulation Logic
* Keep `src/simulation/`, `src/optimization/`, and `src/calculations/` free from UI frameworks.
* No React hooks, JSX, or Three.js objects (`Vector3`, `Mesh`, etc.) inside simulation files.
* Use pure numbers, arrays, and standard math (`Math.sin`, `Math.cos`, etc.).

### Rule 4: Preserving Bilingual Parity
* Any newly added user-facing label, toast message, tooltip, or guide modal MUST be added to both English and Bangla dictionaries in `src/i18n/translations.ts`.
* Ensure Bangla text is authentic, culturally accurate solar engineering terminology.

### Rule 5: Production Security & Input Validation
* All HTTP endpoints must strictly validate payload structure, data types, and value bounds.
* Never allow unvalidated user strings into shell commands or filesystem reads.
* Always sanitize paths against null bytes (`\0`) and traversal sequences (`..`).

### Rule 6: Recording Discovered Mistakes in MISTAKES.md
* If a bug, environment mismatch, or implementation mistake is encountered, immediately record it in [MISTAKES.md](file:///home/introvertguy/Downloads/RoofRay-main/MISTAKES.md) with:
  1. Symptoms and failure mode
  2. Root cause analysis
  3. Resolution and fix
  4. Strict prevention rule to ensure it is never repeated.

---

## 5. Verification Commands Reference

```bash
# 1. Type-check & Production Build
npm run build

# 2. Deterministic Calculation & Astronomy Tests
npm test

# 3. Server Security & API Integration Tests
npm run test:integration

# 4. Headless Chrome Browser E2E Tests
npm run test:browser

# 5. Full End-to-End Test Suite (Build + Calc + Integration + Browser)
npm run test:all

# 6. Start Production Server
npm start
```
