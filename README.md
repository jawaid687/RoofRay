# RoofRay — Interactive 3D Rooftop Solar Planning & Shade Analysis Engine

[![Node.js](https://img.shields.io/badge/Node.js-24.x-emerald.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)

> **Turn complex rooftop geometry, diurnal shading, and energy consumption constraints into an intuitive, explainable 3D solar plan.**

RoofRay is a polished hackathon prototype of a next-generation interactive 3D solar rooftop planning application. It models a self-contained fictional mini-neighborhood featuring varied building footprints, realistic rooftop obstacles, diurnal sun-path simulations, deterministic raycast shadow analysis, automated photovoltaic (PV) array placement, and transparent financial payback metrics.

---

## 📑 Table of Contents

- [Problem Statement](#problem-statement)
- [The RoofRay Solution](#the-roofray-solution)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [How Roof Analysis Works](#how-roof-analysis-works)
- [How Panel Placement Works](#how-panel-placement-works)
- [Engineering & Financial Assumptions](#engineering--financial-assumptions)
- [Hackathon Demo Flow](#hackathon-demo-flow)
- [Limitations of This Prototype](#limitations-of-this-prototype)
- [Future Roadmap](#future-roadmap)
- [Getting Started & Local Execution](#getting-started--local-execution)
- [Automated Testing](#automated-testing)

---

## 🎯 Problem Statement

Traditional solar assessment platforms suffer from a critical divide:
1. **Simplified online calculators** request a ZIP code and monthly electricity bill, outputting broad financial averages without considering actual physical roof obstacles (HVAC units, parapets, stairwell penthouses) or dynamic shading cast by neighboring buildings.
2. **Professional CAD & GIS engineering software** (Aurora Solar, Helioscope, PVsyst) are complex, expensive, desktop-bound, and completely opaque to property owners and decision-makers.

Property owners lack an interactive, transparent, and visually engaging tool to explore their solar potential in true 3D, understand why specific roof sections are unsuitable, and see how system capacity directly offsets their electricity demand.

---

## 💡 The RoofRay Solution

RoofRay bridges this divide by delivering a browser-native 3D simulation experience built on **100% deterministic physics, geometry, and economics**.

- **No Hallucinated "AI"**: Rooftop exposure scores, obstacle exclusions, panel layouts, energy yields, and payback figures are computed through deterministic algorithms.
- **Explainable by Design**: Rather than outputting arbitrary scores, RoofRay provides natural-language reasoning derived from exact raycasting data (e.g., *"18% of the southern roof section was excluded because it experiences repeated afternoon shading from Meridian Commercial Tower"*).
- **Zero Heavy External APIs Required**: Completely self-contained; runs client-side with no Google Maps API, Google Solar API, or CADMapper subscriptions required for this demonstration.

---

## ✨ Key Features

1. **Interactive 3D Mini-Neighborhood**
   - 8 diverse architectural structures: commercial towers, residential apartment blocks, civic libraries, and townhomes.
   - Asphalt roadways with lane markings, sidewalk curbs, street foliage, and environmental atmospheric fog.
   - Prominent tall structure (*Meridian Commercial Tower*, 26m) casting realistic dynamic shadows onto neighboring low-rises (*Apex Lofts*, 10m).

2. **Full 3D Camera & Interaction Controls**
   - Orbit, pan, zoom, and pitch controls with ground plane clipping safeguards.
   - Building hover highlights and click selection with smooth exponential camera interpolation.
   - Quick-switch camera overview reset (`R` key or header button).

3. **User-Controlled Roof & Geometry Customization**
   - Real-time parametric sliders for building Width, Length, and Height (meters).
   - Rooftop area updates simultaneously in metric ($m^2$) and imperial ($sq\ ft$).
   - Interactive rooftop obstacle management: add/remove HVAC chillers, emergency water tanks, and utility stairwell rooms.

4. **Diurnal Sunlight & Shadow Simulation**
   - Directional light representing the sun with soft PCF shadow maps.
   - Slider simulating the sun from **06:00 to 18:00** using a mathematical celestial trajectory.
   - Real-time solar elevation and azimuth angle indicators.

5. **Raycast-Based Solar Exposure Heatmap**
   - Discretizes rooftops into a $0.8m \times 0.8m$ planar grid.
   - Casts Three.js rays toward the sun across 5 representative daylight hours (`08:00`, `10:00`, `12:00`, `14:00`, `16:00`).
   - Color-coded overlay directly rendered atop the rooftop:
     - 🟩 **Excellent Exposure** ($\ge 80\%$)
     - 🟨 **Good Exposure** ($60\% - 79\%$)
     - 🟥 **Poor / Shaded** ($< 60\%$)
     - ⬛ **Obstacle Footprint** (Mechanical hardware + safety clearance)
   - Outlines the largest contiguous unshaded rectangular installation zone.

6. **Automated Photovoltaic Array Placement**
   - Pre-configured module hardware:
     - **Helios 400W** (Residential monocrystalline PERC)
     - **SolMax 450W** (Commercial high-density bifacial)
     - **AeroVolt 550W** (High-efficiency utility module)
   - Dual-orientation optimization: automatically tests portrait vs. landscape packing.
   - Respects 0.8m firefighting setbacks, 0.5m obstacle buffers, and inter-panel maintenance spacing.
   - 3D-rendered panels featuring dark monocrystalline silicon surfaces, anti-reflective glass sheen, aluminum edge frames, and mounting legs with 10° southern tilt.

7. **4 Optimization Modes**
   - **Meet My Electricity Need**: Sizes the system to cover ~100% of annual electricity consumption without unnecessary oversizing.
   - **Maximum Solar Generation**: Fills all viable rooftop positions for maximum energy output.
   - **Lowest Initial Cost**: Minimum capex entry layout covering baseline daytime loads.
   - **Best Value / Balanced**: Optimal 85–95% demand coverage balancing ROI, roof quality, and payback.

8. **Deterministic Economics & Carbon Metrics**
   - System turnkey capex ($), annual bill savings ($/yr), simple payback period (years), and 20-year net cash return ($).
   - Metric tonnes of $CO_2$ abated per year, equivalent trees planted, and miles driven offset.

9. **One-Click Guided Hackathon Demo ("Run Demo")**
   - Guides the viewer through a 6-step automated demonstration: selects target building, sweeps diurnal sun path, runs raycast analysis, switches panel specs, optimizes array layout, and displays financial rationale.

---

## 🏛️ System Architecture

```
RoofRay/
├── index.html                     # Application shell with SEO tags & fonts
├── vite.config.ts                 # Fast Vite bundler configuration
├── tailwind.config.js             # Engineering palette & custom glassmorphism styles
├── src/
│   ├── main.tsx                   # React 19 entrypoint
│   ├── App.tsx                    # Main app container & keyboard shortcuts
│   ├── index.css                  # Custom styling, scrollbars & glassmorphism classes
│   │
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions (Building, Cell, Panel, etc.)
│   │
│   ├── config/
│   │   └── assumptions.ts         # Central assumptions (grid resolution, tariffs, emissions)
│   │
│   ├── data/
│   │   ├── buildings.ts           # 8 initial neighborhood buildings & obstacle definitions
│   │   └── panelTypes.ts          # 3 PV module hardware specifications
│   │
│   ├── simulation/
│   │   ├── sunPosition.ts         # Celestial sun elevation & azimuth math
│   │   ├── roofGrid.ts            # Discretization of planar roof geometry
│   │   ├── shadowRaycaster.ts     # Ray-box intersection tests against neighborhood occluders
│   │   └── suitability.ts         # Maximal rectangle zone identification & area consistency
│   │
│   ├── optimization/
│   │   ├── panelPlacement.ts      # Obstacle-avoiding, setback-respecting 2D grid placer
│   │   └── optimizationEngine.ts  # 4 optimization modes & sizing heuristics
│   │
│   ├── calculations/
│   │   ├── energy.ts              # kW capacity, annual kWh generation & coverage
│   │   ├── financial.ts           # Capex, self-consumption savings & payback years
│   │   ├── emissions.ts           # Grid displacement CO2 offset & equivalents
│   │   └── recommendation.ts      # Natural language explainability narrative generator
│   │
│   ├── store/
│   │   └── useSolarStore.ts       # Zustand store coordinating scene state, math & demo flow
│   │
│   ├── three/
│   │   ├── Scene.tsx              # Three.js Canvas, fog, soft shadows & OrbitControls
│   │   ├── CameraController.tsx   # Smooth procedural camera transitions
│   │   ├── Neighborhood.tsx       # Roads, sidewalks, trees & building meshes
│   │   ├── BuildingMesh.tsx       # Interactive building geometry & rooftop obstacles
│   │   ├── RoofHeatmap.tsx        # High-performance instanced exposure tile overlay
│   │   ├── SolarPanelMesh.tsx     # Photovoltaic panel array rendering
│   │   └── SunVisualizer.tsx      # Directional sun light source & visible celestial sphere
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Brand header, building selector, Reset & Run Demo CTA
│   │   │   └── ViewportControls.tsx# Time-of-day slider, azimuth/elevation & layer toggles
│   │   ├── panels/
│   │   │   ├── ControlPanel.tsx   # Tabbed right panel container
│   │   │   ├── BuildingInspector.tsx # Parametric geometry sliders & obstacle list
│   │   │   ├── SolarAnalysisCard.tsx # Raycasting trigger & area breakdown metrics
│   │   │   ├── PanelConfigCard.tsx   # PV module hardware selector & array status
│   │   │   ├── EnergyDemandCard.tsx  # Monthly kWh input & quick presets
│   │   │   ├── OptimizationCard.tsx  # 4 optimization strategy selectors
│   │   │   ├── FinancialSummary.tsx  # Capex, savings, payback & emissions dashboard
│   │   │   └── RecommendationCard.tsx# Explainable text narrative & exclusions list
│   │   └── ui/
│   │       ├── MetricCard.tsx     # Reusable styled metric cards
│   │       ├── HeatmapLegend.tsx  # Floating exposure classification legend
│   │       └── DemoTourOverlay.tsx# Animated tour banner during automated demo
│   │
│   └── tests/
│       └── calculations.test.ts   # 25-test deterministic validation suite
```

---

## 🔬 How Roof Analysis Works

1. **Discretization**: The rooftop is divided into cells using `roofGridResolution` ($0.8m \times 0.8m$).
2. **Obstacle Exclusion**: Cells falling within any obstacle bounding box + $0.5m$ safety buffer are immediately tagged as `obstacle` and assigned $0\%$ exposure.
3. **Ray-Box Occlusion Testing**:
   For each remaining cell at origin $(x_{cell}, y_{roof} + 0.08, z_{cell})$, RoofRay casts rays along the solar direction vector at 5 sample hours (`08:00`, `10:00`, `12:00`, `14:00`, `16:00`).
   The ray is tested against all neighborhood building bounding boxes and neighbor rooftop obstacles using Three.js `Ray.intersectBox`.
4. **Scoring**:
   $$\text{Exposure Score} = \frac{\text{Unblocked Sample Count}}{\text{Total Samples (5)}}$$
   - $\ge 80\% \rightarrow \text{Excellent Exposure}$
   - $60\% - 79\% \rightarrow \text{Good Exposure}$
   - $< 60\% \rightarrow \text{Poor / Shaded}$
5. **Largest Rectangle Identification**:
   RoofRay runs the classic maximal-rectangle-in-histogram algorithm ($O(R \times C)$) over the binary matrix of suitable cells ($\text{score} \ge 0.60$) to locate the largest contiguous rectangular installation zone for realistic array grouping.

---

## 📐 How Panel Placement Works

1. **Safety Setbacks**: An exterior border margin of $0.8m$ is enforced around the perimeter of the roof for firefighter access corridors.
2. **Obstacle Clearance**: A $0.5m$ buffer is enforced around all rooftop equipment.
3. **Orientation Evaluation**: RoofRay evaluates both **Portrait** and **Landscape** orientations, computing potential module packing counts and average underlying solar exposure.
4. **Greedy Exposure Ranking**: Candidate panel slots are ranked by the average exposure score of the cells they cover. Modules are placed in top-scoring positions first.
5. **Tilt Geometry**: Panels are modeled with a $10^\circ$ maintenance tilt facing South ($+Z$).

---

## 📊 Engineering & Financial Assumptions

All assumptions are defined centrally in `src/config/assumptions.ts`:

| Parameter | Default Value | Notes |
|:---|:---|:---|
| `roofGridResolution` | $0.8\text{ m}$ | Cell discretization resolution |
| `roofEdgeMargin` | $0.8\text{ m}$ | Perimeter firefighter access setback |
| `obstacleBufferMargin` | $0.5\text{ m}$ | Clearance buffer around AC units & penthouses |
| `panelSpacingX` / `panelSpacingZ`| $0.15\text{ m}$ / $0.25\text{ m}$ | Inter-panel and inter-row maintenance spacing |
| `peakSunHoursPerDay` | $4.6\text{ hrs/day}$ | Representative annual insolation |
| `performanceRatio` | $0.82\ (82\%)$ | Inverter, cabling, soiling, and temperature derate |
| `electricityPricePerKWh` | $\$0.165/\text{kWh}$ | Retail grid electricity tariff |
| `costPerKW` | $\$1,850/\text{kW}$ | Turnkey equipment and installation cost |
| `baseInstallationCost` | $\$2,400$ | Fixed engineering, permitting, and grid interconnection base fee |
| `gridEmissionFactorKgPerKWh` | $0.42\text{ kg CO}_2/\text{kWh}$ | Regional grid carbon displacement intensity |

### Core Mathematical Formulas:
- **System Capacity (kW)**:
  $$\text{Capacity}_{\text{kW}} = \frac{N_{\text{panels}} \times \text{Wattage}_{\text{panel}}}{1000}$$
- **Annual Generation (kWh)**:
  $$\text{Gen}_{\text{annual}} = \text{Capacity}_{\text{kW}} \times \text{PeakSunHours} \times 365 \times \text{PerformanceRatio} \times \text{ExposureFactor}$$
- **Turnkey System Capex ($)**:
  $$\text{Cost} = \text{BaseFee} + (\text{Capacity}_{\text{kW}} \times \text{CostPerKW})$$
- **Annual Bill Savings ($)**:
  $$\text{Savings} = \min(\text{Gen}, \text{Demand}) \times \text{Tariff} + \text{Surplus} \times (\text{Tariff} \times 0.5)$$
- **Simple Payback Period (years)**:
  $$\text{Payback} = \frac{\text{System Cost}}{\text{Annual Savings}}$$

---

## 🎬 Hackathon Demo Flow

To execute the demo during a presentation:
1. Open the application.
2. The camera focuses on **Apex Lofts & Residences** ($15m \times 18m$).
3. Click **"Run Demo"** in the top navigation bar, or follow manually:
   - **Step 1**: Rotate and explore the 3D neighborhood using mouse orbit controls.
   - **Step 2**: Adjust the **Time of Day** slider from 08:00 to 16:00 to observe how the 26m Meridian Tower casts dynamic shadows across the southern section of Apex Lofts.
   - **Step 3**: Click **"Analyze Solar Potential"** to reveal the raycast exposure heatmap, showing emerald green unshaded zones and crimson red shaded zones.
   - **Step 4**: Review the **Building Dimensions** and note how obstacles automatically exclude underlying cells.
   - **Step 5**: Select **"Meet My Electricity Need"** under Optimization Strategy and click **"Generate Solar Layout"**.
   - **Step 6**: Watch panels automatically populate the high-exposure northern quadrant of the roof while avoiding shaded areas and mechanical equipment.
   - **Step 7**: Switch to the **"Economics"** tab to review turnkey capex, estimated bill savings, payback years, and $CO_2$ reduction.
   - **Step 8**: Switch to **"Why This Plan"** to inspect the explainable natural language rationale explaining why shaded cells were excluded.

---

## ⚠️ Limitations of This Prototype

- **Fictional Neighborhood**: Uses procedurally modeled buildings rather than real GIS/satellite tile streaming.
- **Flat Roofs First**: Pitch/gable angles are not yet parameterized; flat commercial and residential roofs are modeled.
- **Simplified Solar Position**: Solar path is calculated via a mid-latitude trigonometric model rather than high-precision NOAA solar ephemeris tables.
- **Axis-Aligned Obstacles**: Obstacles are modeled as axis-aligned bounding boxes (AABBs).

---

## 🚀 Future Roadmap

- [ ] **Real-World Geographic Maps**: Mapbox / Cesium 3D Tiles / Google Photorealistic 3D Tiles integration.
- [ ] **Google Solar API Integration**: Real-world rooftop DSM (Digital Surface Model) elevation ingestion.
- [ ] **Satellite & Drone Imagery Ingestion**: User-uploaded photogrammetry for automatic 3D roof mesh reconstruction.
- [ ] **Pitched & Hip Roof Geometry**: Automated roof facet segmentation, pitch angle detection, and azimuth orientation calculations.
- [ ] **Vegetation & Tree Canopy Modeling**: Dynamic seasonal tree foliage growth and tree shadow casting.
- [ ] **Dynamic Utility Tariff Engine**: Ingestion of OpenEI / Genability live utility rate structures and time-of-use (TOU) net-metering schedules.
- [ ] **Commercial Product Catalog**: Live integration with real manufacturer datasheets (Enphase, SolarEdge, Canadian Solar, Qcells).
- [ ] **Installer Workflow & Export**: Export CAD DXF layouts, single-line electrical diagrams (SLD), and PDF client proposal packages.

---

## 💻 Getting Started & Local Execution

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+ / v24+
- `npm` v9+

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/jawaid687/RoofRay.git
cd RoofRay

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000/` in your browser.

### Production Build

```bash
# Verify TypeScript types and compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Automated Testing

RoofRay includes an automated test runner validating all deterministic calculation invariants:

```bash
npm run test:calc
```

### Test Coverage Highlights:
- ✅ Unit conversions ($m^2 \leftrightarrow sq\ ft$)
- ✅ Rooftop grid generation & cell count integrity
- ✅ Shadow raycast intersection against neighborhood occluders
- ✅ Strict area invariant balance ($\text{Obstacle} + \text{Available} \approx \text{Total}$)
- ✅ Panel boundary containment checks (zero roof overhang)
- ✅ Energy generation, capacity factors, and solar demand coverage
- ✅ Financial models (turnkey capex, bill savings, payback period)
- ✅ Environmental carbon displacement and tree equivalency
- ✅ 4 optimization modes (Need vs. Max Gen vs. Lowest Cost vs. Balanced)
- ✅ Explainable recommendation narrative generation

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
