# RoofRay — Product Overview & Feature Matrix

**Platform:** RoofRay (Version 3.0)  
**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Live Application URL:** `/app`  
**Marketing Landing Page:** `/`  

---

## 1. Product Concept

RoofRay is an AI-powered 3D solar planning, simulation, and recommendation platform. Designed as a browser-native SaaS platform, RoofRay empowers building owners, solar EPC engineers, and sustainability managers to evaluate rooftop photovoltaic viability with scientific precision and complete transparency.

```
┌──────────────────────────────────────────────────────────────────┐
│                           ROOFRAY                                │
│                                                                  │
│   [Public Landing Page /]           [Interactive Solar Studio /app]   │
│   • Climate-tech SaaS design        • 3D R3F/Three.js Digital Twin    │
│   • Bilingual English / বাংলা        • Real-Time Shadow Raycasting    │
│   • Feature showcases & CTAs        • 12-Month Astronomical Analysis  │
│                                     • Multi-Objective Layout Engine   │
│                                     • NASA POWER Weather Climatology  │
│                                     • BDT (৳) / USD ($) Economics     │
│                                     • Gemini Grounded AI Advisor      │
│                                     • Exportable Feasibility Report   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Feature Breakdown

### A. Professional Landing Page (`/`)
- **Aesthetic:** Dark navy/charcoal background (`#030712`), emerald green accents (`#10b981`), subtle solar amber highlights (`#f59e0b`).
- **Responsive Layout:** Clean desktop header, mobile drawer menu, smooth anchor scrolling to Features, Workflow, AI Tech, and Impact.
- **Hero Visualization:** Dynamic interactive graphic featuring simulated diurnal sun movement and live technical metric tickers.
- **Localization:** Real-time language switcher between English and বাংলা with persistent memory.
- **Clear CTAs:** Direct navigation to `/app` (Rooftop Planner) and guided automated demo walkthrough (`/app?tour=true`).

### B. Interactive 3D Solar Visualization (`/app`)
- **Three.js & React Three Fiber Canvas:** High-performance WebGL scene rendering building archetypes, surrounding urban towers, and customizable rooftop utility obstacles (HVAC units, water tanks, skylights).
- **NOAA Solar Ephemeris Engine:** Deterministic astronomical calculation of solar elevation, azimuth, hour angle, declination, and sunrise/sunset times across any geographic coordinate.
- **Diurnal Sun Motion:** Real-time slider and automated playback (1x, 2x, 4x speed) simulating sun trajectory from 00:00 to 24:00 with realistic lighting shifts.

### C. Live & Annual Shading Raycaster
- **0.8m x 0.8m Roof Discretization:** The target roof surface is partitioned into 396 computational cells.
- **Live Shading:** Raycasts from cell centers along the sun vector to detect immediate line-of-sight occlusion by obstacles or neighboring towers (<0.2 ms execution).
- **Annual Solar Suitability Heatmap:** Evaluates 291 representative astronomical sun positions across all 12 calendar months to classify every cell into **Excellent (≥80%)**, **Good (60-79%)**, **Poor/Shaded (<60%)**, or **Obstacle**.

### D. Intelligent Layout Optimization & Manual Studio
- **Firefighter & Obstacle Constraints:** Strictly enforces 0.8m perimeter setback and 0.5m clearance around rooftop obstacles.
- **Four Optimization Modes:**
  1. *Meet Demand:* Places minimum modules required to offset monthly kWh target.
  2. *Maximum Generation:* Fills all unshaded available roof cells with ranked solar yield.
  3. *Lowest Initial Cost:* Minimizes capital outlay while ensuring high-yield cells only.
  4. *Balanced / Best Value:* Balances investment capital, payback time, and rooftop density.
- **Manual Studio:** Drag-and-drop placement, rotation (portrait/landscape), cell snapping, undo/redo history, and best-remaining spot suggestions.

### E. Multi-Currency Financial & Emission Modeling
- **Currency Support:** Instant toggle between USD (\$) and Bangladesh Taka (BDT / ৳).
- **Configurable Tariffs & Capex:**
  - Configurable retail electricity tariff per kWh (BPDB residential slab reference: ৳10.50/kWh; US EIA: \$0.165/kWh).
  - Configurable turnkey installation cost per kW (SREDA benchmark: ৳85,000/kW; NREL: \$1,850/kW).
  - Configurable base permitting and interconnection fee.
  - Guard against misleading numbers: Missing or non-positive tariffs automatically result in `paybackYears: null`.
- **Decarbonization Equivalence:** Computes CO₂ reduction using configurable grid factors (DoE/SREDA 2023 Bangladesh grid factor of 0.637 kg CO₂/kWh or IEA global baseline of 0.420 kg CO₂/kWh).

### F. Weather-Informed Climatology (NASA POWER API)
- Satellite-observed multi-year monthly insolation (GHI) and historical cloudiness attenuation index.
- Transparent distinction between geometric clear-sky simulation and weather-adjusted climatology.

### G. Server-Side AI Solar Advisor & Lexical RAG
- Grounded in physical raycast calculations and verified regulatory documents from SREDA, BPDB, and NREL.
- Structured schema output providing executive summary, engineering recommendations, advantages, risks, assumptions, next steps, and cited references.
- Unconfigured API key guard: Clearly shows setup instructions rather than deceptive mock responses.

### H. Exportable Feasibility Report Modal
- Generate, inspect, print/PDF, or copy structured JSON feasibility summaries for project proposals.
