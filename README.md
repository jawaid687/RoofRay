<div align="center">

```
██████╗  ██████╗  ██████╗ ███████╗██████╗  █████╗ ██╗   ██╗   ██╗   ██╗██████╗ 
██╔══██╗██╔═══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝   ██║   ██║╚════██╗
██████╔╝██║   ██║██║   ██║█████╗  ██████╔╝███████║ ╚████╔╝    ██║   ██║ █████╔╝
██╔══██╗██║   ██║██║   ██║██╔══╝  ██╔══██╗██╔══██║  ╚██╔╝     ╚██╗ ██╔╝██╔═══╝ 
██║  ██║╚██████╔╝╚██████╔╝██║     ██║  ██║██║  ██║   ██║       ╚████╔╝ ███████╗
╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝        ╚═══╝  ╚══════╝
```

### **AI-Powered 3D Rooftop Solar Planning, Simulation & Recommendation Platform**
*International AI Builders Congress 2026 • Track: Idea to Unicorn • Domain: ClimateSphere AI*

---

[![Tests: 235 Passed](https://img.shields.io/badge/Unit_Tests-235%2F235_Passing-10b981.svg?style=for-the-badge&logo=jest)](npm-run-test:calc)
[![Integration: 41 Passed](https://img.shields.io/badge/Integration_Tests-41%2F41_Passing-10b981.svg?style=for-the-badge)](npm-run-server)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-000000.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini API](https://img.shields.io/badge/AI_Advisor-Google_Gemini-4285f4.svg?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![RAG Grounding](https://img.shields.io/badge/Knowledge_RAG-SREDA%20%7C%20BPDB%20%7C%20NREL-8b5cf6.svg?style=for-the-badge)](#-knowledge-retrieval-rag-architecture)
[![NASA POWER](https://img.shields.io/badge/Solar_Data-NASA_POWER_API-f59e0b.svg?style=for-the-badge)](#-real-world-solar-data-nasa-power)
[![Localization](https://img.shields.io/badge/Localization-English%20%7C%20%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-059669.svg?style=for-the-badge)](#-bangladesh-localization--bdt-currency)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

[**Live Solar App (`/app`)**](#-route-structure) • [**Public Landing Page (`/`)**](#-professional-landing-page) • [**AI Solar Advisor**](#-ai-solar-advisor) • [**Bangladesh Localization**](#-bangladesh-localization--bdt-currency) • [**Documentation**](docs/) • [**Getting Started**](#-getting-started)

</div>

---

## ⚡ Executive Overview: RoofRay V3

**RoofRay V3** upgrades the platform into an enterprise-grade, competition-ready **ClimateSphere AI** product. RoofRay solves the multi-billion dollar urban solar planning bottleneck by combining **deterministic 3D physics simulation** with a **physics-grounded AI Solar Advisor**.

Rather than using synthetic sun trajectories or treating generative AI as a calculator, RoofRay establishes a rigorous boundary:
1. **Physical Engine as Single Source of Truth:** NOAA astronomical ephemeris and 0.8m line-of-sight raycasting compute exact solar hours, shadows, kW capacity, per-panel yields, and BDT/USD savings.
2. **Lexical RAG Grounding:** An authentic BM25 retrieval engine indexes verified regulatory and technical documentation from **SREDA**, **BPDB**, **NREL**, and the **Department of Environment (DoE)**.
3. **Server-Side AI Advisory:** Google Gemini synthesizes explainable engineering recommendations, risk alerts, and next steps without hallucinating numbers.

---

## 🌐 Route Structure & Architecture

RoofRay operates with a clean single-page application (SPA) routing structure with route-aware layout management:

- **`/` (Public Marketing Landing Page):** Premium climate-tech SaaS presentation featuring hero interactive visuals, problem/solution comparisons, feature showcases, four-step workflow, AI technology explainers, national impact highlights, and full English / বাংলা localization. Full native vertical scrolling (`min-height: 100vh; overflow-y: auto`) with zero viewport locking.
- **`/app` (Interactive Solar Studio):** The complete 3D digital twin planning workspace featuring Three.js orbit controls, live diurnal shadow raycasting, 12-month Web Worker analysis, manual layout studio, economics dashboard, AI Advisor panel, and exportable feasibility reports. Uses isolated `fixed inset-0` layout and `app-mode` body locking so canvas mouse/wheel interaction remains completely jitter-free while sidebar controls scroll smoothly.

Direct navigation, page refreshes, and deep query parameters (e.g. `/app?city=dhaka&tour=true`) function seamlessly across both routes without 404 fallthrough.

---

## 🇧🇩 Bangladesh Localization & BDT Currency

Bangladesh is a first-class supported region in RoofRay V3:
- **Divisional Presets:** Verified geographical coordinates and `Asia/Dhaka` timezone for all 8 administrative divisions: **Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh**.
- **Currency Engine (BDT / ৳):** Multi-currency support with native Taka formatting (`formatCurrency`) and configurable economics:
  - Retail Electricity Tariff (BPDB 2024 Gazette residential reference: ৳10.50/kWh; configurable).
  - Turnkey EPC Installation Cost (SREDA accredited benchmark: ৳85,000/kW; configurable).
  - Base Permitting & Net-Metering Fee: ৳25,000.
  - **Missing Input Protection:** Zero or absent tariff inputs explicitly return `paybackYears: null` to avoid deceptive payback projections.
- **Carbon Accounting:** National grid emission factor of **0.637 kg CO₂/kWh** (Department of Environment / SREDA 2023 National Study) alongside the global IEA baseline (0.420 kg CO₂/kWh).
- **Bilingual Interface:** Real-time language switch between **English** and **বাংলা** with centralized translation dictionaries.

> *Engineering Notice: 3D buildings represent simulated archetype geometries for raycasting; selecting a city updates astronomical ephemeris and solar irradiance calculations.*

---

## 🤖 AI Solar Advisor & Lexical RAG Architecture

Located in `src/server/advisorService.ts`, `src/rag/retrievalEngine.ts`, and `src/components/panels/AiAdvisorPanel.tsx`:

- **Grounded AI Pipeline:**
  ```
  User Query + Simulation State (kW, kWh, Capex, Shading %)
            ↓
  Lexical BM25 Retrieval Engine (SREDA, BPDB, NREL Corpus)
            ↓
  Context Injection with Strict "Single Source of Truth" Rules
            ↓
  Google Gemini API (JSON Output Mode via x-goog-api-key header)
            ↓
  Structured Response (Summary, Recommendations, Risks, Citations)
  ```
- **Enterprise-Grade Security Hardening:**
  - **Header-Based Authentication:** Secret `GEMINI_API_KEY` is transmitted strictly via `x-goog-api-key` HTTP header; never exposed in query parameters, terminal logs, or client-side bundles.
  - **Separation of Instructions:** System role definition is passed via Gemini's native `system_instruction` configuration, keeping system constraints distinct from untrusted user queries.
  - **Payload Validation & Bounds Checking:** Pre-validates latitude ($-90^\circ$ to $+90^\circ$), longitude ($-180^\circ$ to $+180^\circ$), building dimensions ($0.1\text{m}$ to $500\text{m}$), panel wattage ($50\text{W}$ to $2000\text{W}$), tilt ($0^\circ$ to $90^\circ$), and user query length ($\le 1000$ characters).
  - **Directory Traversal & CORS Defense:** Server strictly validates canonical file paths against `dist/`, enforces whitelisted CORS origins, limits request body sizes ($\le 100\text{KB}$), and returns HTTP 404 JSON for unmatched `/api/*` routes.
- **Verified Knowledge Corpus:**
  - *SREDA Net-Metering Guidelines (2018/2021):* 70% sanctioned load cap, 3-phase connection rule, bi-directional meter testing.
  - *BPDB Retail Tariff Schedule (2024):* LT-A progressive residential slabs and LT-E commercial rates.
  - *NREL PV Fundamentals:* Optimal fixed tilt (~latitude facing South), bypass diode behavior under partial shading, and thermal derating.
  - *NASA POWER Database:* South Asian horizontal irradiance benchmarks (4.5 to 5.2 kWh/m²/day) and monsoon cloud cover attenuation.
  - *DoE Grid Factor:* Bangladesh national grid baseline (0.637 kg CO₂/kWh).
- **Honest Unconfigured State:** If `GEMINI_API_KEY` is not configured on the server, the UI displays clear setup instructions along with authentic Lexical RAG citations rather than a deceptive mock response.

---

## 🛰️ Real-World Solar Data (NASA POWER)

Located in `src/services/solarResourceService.ts`:
- Automated integration with the **NASA Langley Research Center POWER Climatology API v2.0**.
- Fetches satellite-derived multi-year monthly insolation (GHI) and historical cloudiness attenuation index.
- 7-day client-side caching in `localStorage`.
- Explicit UI labels distinguishing **Clear-Sky Simulation** (geometric raycasting), **Weather-Informed Climatology** (satellite historical cloudiness), and **Metered Production** (requires physical sensors).

---

## 📊 Feasibility Report Generator

Located in `src/components/ui/SolarReportModal.tsx`:
- Exportable formal solar feasibility assessment report.
- Summarizes building dimensions, 3D raycast metrics, system capacity, annual kWh generation, BDT/USD cash-flow, payback timeline, and CO₂ offset.
- One-click **Print / Save to PDF** and **Copy Structured JSON** for commercial solar proposals.

---

## 🧪 Comprehensive Test Suite (276 Passing Assertions)

RoofRay maintains an extensive automated test suite executed with TypeScript:

```bash
# Run calculation and logic unit test suites (235 tests)
npm run test:calc

# Run production server, security, and localization integration tests (41 tests)
npm run test:integration

# Run all suites together (276 tests)
npm run test:all
```

### Verified Test Suites:
1. **NOAA Astronomical Sun Engine (30 tests):** Solar noon, solstices, equinoxes, Sydney southern azimuth, Tromsø polar day/night within $\pm 0.1^\circ$.
2. **Fixed Buildings & Live Shading (14 tests):** Immutability, ray-box intersection, diurnal shadow lit-ratios.
3. **Annual Solar Analysis (12 tests):** 12-month integration, Web Worker cancellation, and cache hit latency.
4. **Manual Placement & Setbacks (32 tests):** 0.8m perimeter setback, 0.5m obstacle buffer, SAT collision checks, undo/redo stack.
5. **Milestone M6 & Performance (13 tests):** Solstice arc geometry, compass vectors ($N=-Z, E=+X, S=+Z, W=-X$), and frame budgets.
6. **Bangladesh Localization (50 tests):** Verified coordinates for all 8 divisions, Dhaka equinox/solstice ephemeris, BDT formatting.
7. **Financial Configuration (21 tests):** BDT/USD capex, slab savings, missing-tariff guard (`paybackYears: null`), configurable export credit ratio, DoE grid emission factor.
8. **Lexical RAG Retrieval (13 tests):** BM25 term weighting, SREDA/BPDB/NREL chunk retrieval, metadata attribution.
9. **AI Advisor Schema & Safety (22 tests):** Coordinate bounds, dimension checks, wattage limits, prompt bounds, header auth, traversal defense, unconfigured key handling, secret leakage prevention.
10. **Deterministic Calculations (28 tests):** Yield sum invariant, optimization modes, recommendation narrative.

**Result: 235 Calculation Suite Assertions Passed, 0 Failed, 0 Regressions.**  
Plus **41 End-to-End Production & Integration Assertions** in `scripts/validateAll.js`.  
**Grand Total: 276 Passing Automated Assertions.**

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (v20+ recommended)
- **Package Manager:** npm or pnpm

### 2. Installation
```bash
git clone https://github.com/jawaid687/RoofRay.git
cd RoofRay
npm install
```

### 3. Environment Configuration
Copy the environment template:
```bash
cp .env.example .env
```
Edit `.env` to configure your Gemini API key (optional for local physical simulation; required for live AI recommendations):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Marketing Landing Page: [http://localhost:3000/](http://localhost:3000/)
- Interactive Solar Studio: [http://localhost:3000/app](http://localhost:3000/app)

*In development mode, Vite middleware automatically handles `/api/ai/*` requests without needing a separate server process.*

### 5. Running Standalone Production Server
```bash
# 1. Compile client assets to dist/
npm run build

# 2. Start genuine Node.js production server
npm start
# (or: npm run server)
```
The server will start on port `3000` (or `process.env.PORT`) serving both static production assets from `dist/` with SPA routing and live `/api/ai/*` endpoints.

### 6. Deployment on Render / Cloud PaaS
RoofRay V3 is pre-configured for zero-friction cloud deployment on **Render**:
1. Create a new **Web Service** on Render and connect this repository.
2. Configure build and start settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
   - `GEMINI_MODEL`: `gemini-2.5-flash` (default).
   - `NODE_ENV`: `production`.
   *(Render automatically assigns `PORT`)*.
4. Deploy: The service serves the landing page at `/`, app at `/app`, and `/api/ai/*` with 100% server-side API key protection.

---

## 📚 Competition Documentation (`docs/`)

Comprehensive competition documentation authored for the **Idea to Unicorn** track:

- [`docs/problem-definition.md`](docs/problem-definition.md) — Problem statement, target personas & value proposition.
- [`docs/product-overview.md`](docs/product-overview.md) — Complete product feature matrix.
- [`docs/system-architecture.md`](docs/system-architecture.md) — High-level architecture, subsystems & WebGL engine.
- [`docs/ai-architecture.md`](docs/ai-architecture.md) — Physics grounding, BM25 RAG engine & prompt engineering.
- [`docs/data-flow.md`](docs/data-flow.md) — End-to-end data pipeline, transformations & state lifecycles.
- [`docs/data-sources.md`](docs/data-sources.md) — Source registry (NOAA, SREDA, BPDB, NASA POWER, DoE).
- [`docs/responsible-ai.md`](docs/responsible-ai.md) — Ethical AI principles, explainability & guardrails.
- [`docs/privacy-and-security.md`](docs/privacy-and-security.md) — Server secret isolation & threat modeling.
- [`docs/business-model.md`](docs/business-model.md) — SaaS monetization streams, unit economics & GTM.
- [`docs/scalability-roadmap.md`](docs/scalability-roadmap.md) — Real-world GIS, LiDAR & Wasm scaling horizons.
- [`docs/kpi-and-validation.md`](docs/kpi-and-validation.md) — Quality assurance metrics & test coverage report.
- [`docs/team-roles.md`](docs/team-roles.md) — Team role assignment matrix.
- [`docs/three-minute-pitch.md`](docs/three-minute-pitch.md) — Exact 3:00 minute competition pitch script.
- [`docs/submission-checklist.md`](docs/submission-checklist.md) — Official competition readiness verification.

---

## ⚖️ Legal & Engineering Disclaimer

RoofRay provides preliminary engineering feasibility estimates based on 3D geometric raycasting and astronomical ephemeris. Official rooftop structural audits, electrical distribution inspections, and utility net-metering interconnection applications must be conducted by licensed professionals prior to equipment procurement.

RoofRay is open-source software licensed under the [MIT License](LICENSE).
