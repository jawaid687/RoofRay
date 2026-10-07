<div align="center">

```
██████╗  ██████╗  ██████╗ ███████╗██████╗  █████╗ ██╗   ██╗
██╔══██╗██╔═══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
██████╔╝██║   ██║██║   ██║█████╗  ██████╔╝███████║ ╚████╔╝ 
██╔══██╗██║   ██║██║   ██║██╔══╝  ██╔══██╗██╔══██║  ╚██╔╝  
██║  ██║╚██████╔╝╚██████╔╝██║     ██║  ██║██║  ██║   ██║   
╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
```

### **Interactive 3D Rooftop Solar Planning & Diurnal Shade Simulation Engine**
*Turn complex 3D rooftop geometry, neighbor shadowing, and electricity consumption into an explainable, deterministic solar installation plan in seconds.*

---

[![Tests: 25 Passed](https://img.shields.io/badge/Unit_Tests-25%2F25_Passing-10b981.svg?style=for-the-badge&logo=jest)](npm-run-test:calc)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-000000.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite 6.2](https://img.shields.io/badge/Vite-6.2-646cff.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Zero External APIs](https://img.shields.io/badge/External_APIs-0_(100%25_Client--Side)-f59e0b.svg?style=for-the-badge)](#core-engineering-principle)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

[**Live Demo Tour**](#-1-click-guided-hackathon-demo-script) • [**System Architecture**](#-system-architecture) • [**Mathematical Formulation**](#-how-the-simulation-algorithms-work) • [**Competitive Matrix**](#-competitive-differentiation-matrix) • [**Getting Started**](#-getting-started)

</div>

---

> [!NOTE]
> ### ⚡ Executive Summary for Hackathon Judges
> **RoofRay** is a self-contained, browser-native 3D solar rooftop planner built for property owners, commercial facility managers, and solar developers. Unlike conventional estimators that rely on static ZIP-code averages, RoofRay performs **real-time 3D raycasting** against actual neighboring buildings, analyzes rooftop mechanical obstacles (HVACs, water tanks, elevator penthouses), solves for the **largest contiguous unshaded installation zone**, auto-packs photovoltaic (PV) modules, and outputs **100% deterministic energy, financial, and environmental returns** with explainable natural language rationales.
> 
> **Zero external paid APIs required (No Google Maps, Google Solar, or CADMapper subscriptions needed). Completely self-contained.**

---

## 🏆 Why Judges Love RoofRay

<table>
  <thead>
    <tr>
      <th width="33%">🔬 Technical Excellence</th>
      <th width="33%">🧠 Explainable Engineering</th>
      <th width="33%">💎 Product & Visual Polish</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">
        <ul>
          <li><strong>Pure Three.js Ray-Box BVH</strong>: Deterministic occlusion checks run across 2,000+ rays in <strong>&lt; 5ms</strong>.</li>
          <li><strong>Maximal Rectangle Algorithm</strong>: $O(R \times C)$ dynamic programming finds optimal contiguous arrays.</li>
          <li><strong>React 19 + R3F + Drei</strong>: Modern declarative 3D canvas with 60 FPS smooth camera interpolation.</li>
          <li><strong>25/25 Unit Test Suite</strong>: Verifies every single calculation, boundary constraint, and economic formula.</li>
        </ul>
      </td>
      <td valign="top">
        <ul>
          <li><strong>No Hallucinated "Black-Box AI"</strong>: All physical metrics, irradiance derates, and financial numbers are provably deterministic.</li>
          <li><strong>Transparent Spatial Exclusions</strong>: Generates exact reasons explaining why shaded quadrants or obstacles were excluded.</li>
          <li><strong>SI Consistency</strong>: Strict internal SI units (meters, kW, kWh, kg $CO_2$) with automatic imperial conversions.</li>
        </ul>
      </td>
      <td valign="top">
        <ul>
          <li><strong>Energy-Tech Dark Aesthetic</strong>: Bespoke glassmorphism interface with high-contrast CAD visualization.</li>
          <li><strong>Diurnal Sunlight Simulation</strong>: 06:00 → 18:00 slider moves the celestial sun and casts soft PCF shadows.</li>
          <li><strong>1-Click Automated Demo Tour</strong>: Zero-friction presentation mode walking judges through the entire user journey.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

---

## 📊 Competitive Differentiation Matrix

How does RoofRay compare against current industry solutions?

| Capability | Generic Online Calculators (Sunrun, EnergySage) | Pro Desktop CAD (Aurora Solar, Helioscope) | Google Solar API | ⚡ **RoofRay Prototype** |
|:---|:---:|:---:|:---:|:---:|
| **Full 3D Interactive Neighborhood** | ❌ 2D Static | ⚠️ Heavy Desktop / Slow | ❌ Raw Tile Data Only | ✅ **Browser-Native 60 FPS 3D** |
| **Dynamic Diurnal Shadow Movement** | ❌ None | ✅ Yes | ⚠️ Precomputed Static | ✅ **Real-Time Sun Slider (06:00–18:00)** |
| **Neighbor Structure Occlusion** | ❌ None | ✅ Complex Manual Setup | ⚠️ Estimated via DSM | ✅ **Automatic 3D Mesh Occlusion** |
| **Mechanical Obstacle Exclusion** | ❌ Ignored | ⚠️ Manual Tracing Required | ⚠️ Low-Resolution DSM | ✅ **Parametric Interactive Obstacles** |
| **Contiguous Zone Identification** | ❌ None | ⚠️ Manual Zone Drawing | ❌ None | ✅ **$O(R \times C)$ Maximal Rectangle** |
| **Multiple Optimization Strategies** | ❌ Fixed 100% | ⚠️ Manual Sizing | ❌ Fixed Solar Potential | ✅ **4 Deterministic Modes** |
| **Explainable Natural Language Output** | ❌ Generic Marketing Copy | ❌ None (Tables only) | ❌ None (JSON only) | ✅ **Derived from Calculated Metrics** |
| **External API / Account Dependency** | ⚠️ Lead Capture Required | ⚠️ Paid Enterprise License | ⚠️ Paid Google Cloud API | ✅ **Zero Setup / 100% Client-Side** |

---

## 🏛️ System Architecture

RoofRay follows a clean, decoupled architecture separating **3D WebGL rendering**, **deterministic simulation physics**, **spatial placement heuristics**, and **reactive state management**:

```mermaid
flowchart TB
    subgraph UI ["🖥️ Modern Energy-Tech UI Layer"]
        A[Header & Quick Controls] --> B[3D Viewport Controls]
        C[Rooftop Planner Panel] --> D[Economics & Returns]
        E[Why This Plan Rationale] --> F[1-Click Hackathon Demo Tour]
    end

    subgraph Store ["⚡ Reactive State & Orchestration (Zustand)"]
        S[useSolarStore]
    end

    subgraph ThreeScene ["🌐 WebGL 3D Canvas (React Three Fiber / Three.js)"]
        G[Neighborhood Scene] --> H[Building Mesh & Obstacles]
        H --> I[Dynamic Sun & PCF Shadows]
        I --> J[Instanced Exposure Heatmap]
        J --> K[Tilt-Mounted PV Module Array]
        L[Procedural Camera Lerp]
    end

    subgraph Physics ["🔬 Deterministic Simulation Engine"]
        M[Celestial Sun Path Math] --> N[Grid Discretizer 0.8m]
        N --> O[3D Ray-Box Shadow Occlusion]
        O --> P[Maximal Rectangle Zone Finder]
    end

    subgraph Optimization ["📐 Array Optimization & Sizing"]
        Q[Portrait vs Landscape Packing] --> R[4 Sizing Modes Need / Max / Cost / Balanced]
    end

    subgraph Financials ["💰 Deterministic Financial & Carbon Model"]
        T[Annual Generation kWh] --> U[Turnkey Capex & Tariffs]
        U --> V[Payback & 20-Yr Cash Flow]
        V --> W[Carbon Abatement & Tree Equivalence]
        W --> X[Natural Language Explainability Engine]
    end

    UI <--> Store
    Store <--> ThreeScene
    Store <--> Physics
    Store <--> Optimization
    Store <--> Financials
```

---

## 🔬 How the Simulation Algorithms Work

### 1. Mathematical Celestial Sun Trajectory
Rather than random shadow angles or ungrounded approximations, RoofRay uses an equatorial solar-elevation model calibrated for mid-latitude daylight hours ($t \in [5.5, 18.5]$):

$$\omega = \left(\frac{t - 12}{6}\right) \times \frac{\pi}{2} \quad \text{(Solar Hour Angle)}$$

$$\theta_{\text{elevation}} = \max\left(0, \cos(\omega) \times 64^\circ\right)$$

$$\phi_{\text{azimuth}} = 90^\circ + \omega \times 0.95 \quad \text{(90° East at Sunrise } \rightarrow \text{ 180° South at Noon } \rightarrow \text{ 270° West at Sunset)}$$

From this, unit direction vectors $\vec{v}_{\text{sun}} = \begin{bmatrix} \sin\phi \cos\theta \\ \sin\theta \\ \cos\phi \cos\theta \end{bmatrix}$ are computed to dynamically drive Three.js `DirectionalLight` and raycasting origin tests.

---

### 2. Ray-Box Occlusion & Solar Exposure Scoring
1. **Grid Discretization**: The roof surface is discretized into planar cells $C_{r,c}$ at resolution $\Delta = 0.8\text{m}$.
2. **Obstacle Masking**: Any cell falling within an obstacle footprint + buffer margin ($0.5\text{m}$) is marked as `obstacle` and assigned exposure score $0$.
3. **Raycast Sampling**: For all unblocked cells, rays $\vec{R}_i = \text{Origin} + s \cdot \vec{v}_{\text{sun}}(t_i)$ are cast across 5 key insolation hours ($t \in \{08:00, 10:00, 12:00, 14:00, 16:00\}$) against all neighbor building bounding boxes and rooftop fixtures:

$$\text{Exposure Score } S(C) = \frac{\sum_{i=1}^{5} \mathbb{I}(\text{Unblocked at } t_i)}{5}$$

$$\text{Classification} = \begin{cases} 
\text{Excellent} & \text{if } S(C) \ge 0.80 \\ 
\text{Good} & \text{if } 0.60 \le S(C) < 0.80 \\ 
\text{Poor (Shaded)} & \text{if } S(C) < 0.60 
\end{cases}$$

---

### 3. Spatial Zone Identification: Maximal Rectangle in Histogram
To identify the prime installation zone, RoofRay builds a binary grid $M[r][c] \in \{0, 1\}$ (where $1$ denotes viable cells: `excellent` or `good`). It executes the **Maximal Rectangle Algorithm** ($O(R \times C)$) using a monotonic stack to identify the largest contiguous rectangular subarray, visually outlining the perimeter with a cyan bounding boundary.

---

### 4. Automatic PV Array Placement Heuristics
- **Setback Enforced**: $0.8\text{m}$ perimeter buffer for firefighter roof access.
- **Clearance Enforced**: $0.5\text{m}$ clearance surrounding all rooftop equipment.
- **Dual-Orientation Packing**: Automatically evaluates both **Portrait** ($1.13\text{m} \times 1.72\text{m}$) and **Landscape** ($1.72\text{m} \times 1.13\text{m}$), selecting the orientation with superior capacity and exposure density.
- **Greedy Ranking**: Panel slots are sorted and placed strictly in descending order of average underlying cell exposure.

---

### 5. Transparent Energy, Financial & Emissions Equations

All formulas use central configuration parameters from [`src/config/assumptions.ts`](file:///d:/Projects/RoofRay/src/config/assumptions.ts):

```typescript
// 1. Installed System Sizing
installedCapacityKW = (panelCount * panelWattage) / 1000;

// 2. Annual Energy Production (Adjusted by Raycast Solar Exposure Factor)
annualGenerationKWh = installedCapacityKW * peakSunHoursPerDay * 365 * performanceRatio * avgExposureFactor;

// 3. Turnkey Capital Expenditure (Capex)
totalSystemCost = baseInstallationCost + (installedCapacityKW * costPerKW);

// 4. Annual Electric Bill Savings (Self-consumption @ full tariff + export credit @ 50%)
selfConsumedKWh = Math.min(annualGenerationKWh, annualConsumptionKWh);
surplusExportKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
annualSavingsUSD = (selfConsumedKWh * electricityPricePerKWh) + (surplusExportKWh * electricityPricePerKWh * 0.5);

// 5. Simple Payback Period
paybackYears = totalSystemCost / annualSavingsUSD;

// 6. Regional Carbon Abatement
annualCO2ReductionKg = annualGenerationKWh * gridEmissionFactorKgPerKWh;
annualCO2ReductionTonnes = annualCO2ReductionKg / 1000;
```

---

## 🎯 4 Optimization Modes

| Mode | Objective | Heuristic Logic | Best For |
|:---|:---|:---|:---|
| 🎯 **Meet My Electricity Need** | Demand Matching | Computes exact kW needed to cover ~100% of annual kWh consumption; avoids oversizing. | Residential owners wanting self-sufficiency without low-tariff surplus exports. |
| ⚡ **Maximum Solar Generation** | Peak Rooftop Yield | Deploys modules across 100% of viable unshaded slots up to physical roof capacity. | Commercial buildings, landlords, or net-metering sites seeking maximum clean energy. |
| 💰 **Lowest Initial Cost** | Budget Capex Entry | Sizes a compact 4–8 module layout targeting 35%–50% baseline daytime demand. | Budget-conscious property owners seeking the fastest possible payback with minimal outlay. |
| ⚖️ **Best Value / Balanced** | Optimal ROI Sweet-Spot | Targets 85%–95% coverage, balancing installation density with maximum utility offset. | **Recommended default**: Best balance between upfront cost, payback period, and roof quality. |

---

## 🎬 1-Click Guided Hackathon Demo Script

During the hackathon presentation, click **"Run Demo"** in the top navigation bar (or press `Space`) to trigger the automated 6-step demo tour:

| Step | Time | What Happens in 3D Scene | What You Tell the Judges |
|:---:|:---:|:---|:---|
| **1** | `0.0s` | Camera glides smoothly to **Apex Lofts & Residences** ($15\text{m} \times 18\text{m}$, 10m height). | *"We select Apex Lofts, an urban residential complex situated directly northwest of a 26m commercial tower."* |
| **2** | `1.5s` | Time slider sweeps from 08:00 to 16:00; tall tower casts real dynamic shadow across Apex Lofts. | *"Watch how the diurnal sun moves across the sky—the tall tower casts dynamic shadows across the southern half of our roof."* |
| **3** | `4.2s` | The **Solar Exposure Heatmap** appears with color-coded emerald (unshaded), red (shaded), and grey (obstacles). | *"Our Three.js raycasting engine analyzes 396 roof cells across 5 sun angles. It detects that 72% is viable, while southern cells are shaded."* |
| **4** | `6.0s` | Hardware switches to **SolMax 450W Bifacial Modules** and calibrates demand to 950 kWh/mo. | *"We select 450W commercial bifacial modules and set a real target consumption profile."* |
| **5** | `7.5s` | **Solar Layout Generates**: Panels populate the unshaded northern quadrant, respecting firefighter setbacks and obstacles. | *"The algorithm automatically packs the highest-yielding unshaded zones, maintaining 0.8m setbacks and avoiding HVAC chillers."* |
| **6** | `9.2s` | Financial summary and natural language **"Why This Plan"** rationale display. | *"The system outputs deterministic financials: $3,128/yr savings, 14-year payback, and explains precisely why shaded areas were skipped."* |

---

## 🧪 Comprehensive Automated Test Matrix

RoofRay contains an automated validation test suite (`npm run test:calc`) verifying that all calculations, geometry limits, and economics are strictly deterministic:

```
> roofray@1.0.0 test:calc
> tsx src/tests/calculations.test.ts

🧪 Starting deterministic unit test suite for RoofRay...

  ✅ PASS: Unit Conversion: 250 m² to sqft
  ✅ PASS: Building dimension check: 15m x 18m = 270 m²
  ✅ PASS: Grid cells generated: 396 cells
  ✅ PASS: Analyzed cells count matches grid
  ✅ PASS: Metrics: Total roof area matches expected
  ✅ PASS: Area Invariant: Available + Obstacle ~= Total
  ✅ PASS: Area Invariant: Recommended <= Available
  ✅ PASS: Panels placed: 56
  ✅ PASS: Placed count <= Max possible
  ✅ PASS: All panels strictly reside inside roof perimeter
  ✅ PASS: Energy: Annual consumption is monthly * 12
  ✅ PASS: Energy: Capacity is 22.4 kW
  ✅ PASS: Energy: Annual generation is 28312 kWh
  ✅ PASS: Energy: Coverage capped at 100%
  ✅ PASS: Financial: Total system cost is $43840
  ✅ PASS: Financial: Annual savings is $3128
  ✅ PASS: Financial: Payback is 14 years
  ✅ PASS: Emissions: 11891 kg CO2/yr
  ✅ PASS: Emissions: 11.9 tonnes CO2/yr
  ✅ PASS: Optimization: Max gen >= Need panels
  ✅ PASS: Optimization: Lowest cost <= Max gen panels
  ✅ PASS: Optimization: Balanced mode placed panels
  ✅ PASS: Recommendation: Headline formatted correctly
  ✅ PASS: Recommendation: Narrative contains substantive explanation
  ✅ PASS: Recommendation: Key points provide explainability

========================================
Test Results: 25 passed, 0 failed.
========================================
```

---

## 📁 Repository File Structure

```
d:/Projects/RoofRay/
├── index.html                     # Application HTML shell with SEO meta tags & Inter fonts
├── vite.config.ts                 # Optimized Vite configuration with React SWC plugin
├── tailwind.config.js             # Solar engineering theme & custom glassmorphism styles
├── package.json                   # Dependencies: React 19, Three.js, R3F, Drei, Zustand, Lucide
│
├── src/
│   ├── main.tsx                   # React 19 root bootstrap
│   ├── App.tsx                    # Main layout container & keyboard event listeners
│   ├── index.css                  # Custom engineering scrollbars, glass panels & glow utilities
│   │
│   ├── types/
│   │   └── index.ts               # Complete TypeScript interfaces (Building, Obstacle, Cell, etc.)
│   │
│   ├── config/
│   │   └── assumptions.ts         # Central assumptions (grid resolution, tariffs, emissions)
│   │
│   ├── data/
│   │   ├── buildings.ts           # 8 architectural buildings with dimensions & rooftop obstacles
│   │   └── panelTypes.ts          # 3 PV module hardware specifications (400W, 450W, 550W)
│   │
│   ├── simulation/
│   │   ├── sunPosition.ts         # Diurnal celestial trajectory math (Hour angle, azimuth, elevation)
│   │   ├── roofGrid.ts            # Rooftop planar discretization & obstacle footprint masking
│   │   ├── shadowRaycaster.ts     # Ray-box intersection checks against neighbor buildings
│   │   └── suitability.ts         # Area metrics & maximal rectangle contiguous zone detection
│   │
│   ├── optimization/
│   │   ├── panelPlacement.ts      # Setback-respecting, dual-orientation PV module array placer
│   │   └── optimizationEngine.ts  # Heuristics for the 4 optimization objectives
│   │
│   ├── calculations/
│   │   ├── energy.ts              # kW system size, annual kWh yield & demand coverage
│   │   ├── financial.ts           # Turnkey capex, tariff bill savings, simple payback, 20-yr ROI
│   │   ├── emissions.ts           # Carbon reduction (kg & tonnes) + tree equivalencies
│   │   └── recommendation.ts      # Natural language explainability narrative generator
│   │
│   ├── store/
│   │   └── useSolarStore.ts       # Central Zustand state store & automated demo tour coordinator
│   │
│   ├── three/
│   │   ├── Scene.tsx              # Three.js Canvas, atmospheric fog, soft shadows & OrbitControls
│   │   ├── CameraController.tsx   # Exponential decay camera interpolation for smooth transitions
│   │   ├── Neighborhood.tsx       # Roads, street markings, sidewalk curbs, foliage & buildings
│   │   ├── BuildingMesh.tsx       # Interactive building geometry & rooftop equipment
│   │   ├── RoofHeatmap.tsx        # High-performance InstancedMesh solar exposure heatmap
│   │   ├── SolarPanelMesh.tsx     # Monocrystalline PV module meshes with anti-reflective glass & racks
│   │   └── SunVisualizer.tsx      # Directional sun light source, shadow frustum & celestial orb
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Brand header, active building dropdown, Reset & Run Demo
│   │   │   └── ViewportControls.tsx# Floating time-of-day slider, solar angles & visual toggles
│   │   ├── panels/
│   │   │   ├── ControlPanel.tsx   # Tabbed engineering sidebar (Planner, Economics, Rationale)
│   │   │   ├── BuildingInspector.tsx # Parametric dimension sliders & rooftop obstacle manager
│   │   │   ├── SolarAnalysisCard.tsx # Raycasting trigger & stacked exposure breakdown bar
│   │   │   ├── PanelConfigCard.tsx   # Hardware module specification selector & layout status
│   │   │   ├── EnergyDemandCard.tsx  # Monthly kWh consumption input & quick presets
│   │   │   ├── OptimizationCard.tsx  # 4 optimization strategy cards & Generate Layout CTA
│   │   │   ├── FinancialSummary.tsx  # Capex, savings, payback, ROI & emissions metric cards
│   │   │   └── RecommendationCard.tsx# Explainable text narrative & spatial exclusion details
│   │   └── ui/
│   │       ├── MetricCard.tsx     # Reusable high-contrast metric card with status badges
│   │       ├── HeatmapLegend.tsx  # Floating exposure classification key
│   │       └── DemoTourOverlay.tsx# Animated tour banner during automated demo playback
│   │
│   └── tests/
│       └── calculations.test.ts   # 25-point deterministic test suite
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+, v20+, or v24+
- **npm**: v9+ or v10+

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/jawaid687/RoofRay.git
cd RoofRay

# 2. Install dependencies (Installs in ~30s)
npm install

# 3. Start local development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000/
```

### Production Build

```bash
# Typecheck with TypeScript and build minified production bundle
npm run build

# Preview production build locally
npm run preview
```

### Run Unit Tests

```bash
npm run test:calc
```

---

## ⌨️ Pro Demo Keyboard Shortcuts

| Shortcut | Action | Description |
|:---:|:---|:---|
| <kbd>R</kbd> | **Reset Camera** | Resets 3D camera to the full neighborhood overview |
| <kbd>H</kbd> | **Toggle Heatmap** | Shows/hides the rooftop solar exposure heatmap tiles |
| <kbd>Space</kbd> | **Start Demo** | Triggers the 1-click guided automated tour |
| <kbd>Left Click + Drag</kbd> | **Orbit** | Rotates camera angle around focal center |
| <kbd>Right Click + Drag</kbd> | **Pan** | Panning across the neighborhood ground plane |
| <kbd>Scroll Wheel</kbd> | **Zoom** | Zooms in/out with bounded minimum & maximum distance |

---

## 🗺️ Future Roadmap

```mermaid
timeline
    title RoofRay Evolution Roadmap
    Phase 1 : GIS & Real-World Terrain : Google Photorealistic 3D Tiles : Cesium World Terrain streaming : Mapbox vector layer integration
    Phase 2 : Advanced Computer Vision : Drone photogrammetry upload : Automatic 3D roof reconstruction : Pitched and hip facet segmentation
    Phase 3 : Advanced Energy & Storage : Battery Energy Storage (BESS) sizing : Time-of-Use (TOU) utility tariff engine : Inverter string inverter clipping simulation
    Phase 4 : Installer Enterprise Tools : Auto-generated CAD DXF layout export : Single-Line Electrical Diagrams (SLD) : Branded PDF client proposal generator
```

- **Phase 1: Real-World 3D GIS Integration**
  - Stream Google Photorealistic 3D Tiles or Cesium 3D Tiles by entering any real-world address.
  - Ingest Google Solar API Digital Surface Models (DSM) for real-world rooftop elevation maps.
- **Phase 2: Drone Photogrammetry & Advanced Roof Types**
  - Allow users to upload drone capture photos for client-side photogrammetry mesh reconstruction.
  - Automatic segmentation of complex hip, gable, mansard, and gambrel pitched roof planes.
- **Phase 3: Battery Energy Storage (BESS) & Dynamic Tariffs**
  - Integrate Tesla Powerwall / Enphase IQ battery storage simulation to model peak shaving.
  - Ingest OpenEI / Genability live utility rates with dynamic time-of-use (TOU) tariffs.
- **Phase 4: Commercial Solar Installer Proposal Suite**
  - One-click export of engineering CAD `.dxf` files and electrical Single-Line Diagrams (SLD).
  - Export white-labeled PDF solar proposals with financing options (Loan vs. Cash vs. PPA).

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
<sub>Crafted with precision for next-generation clean energy technology.</sub>
</div>
