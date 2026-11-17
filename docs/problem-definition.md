# RoofRay V3 — Problem Definition & Value Proposition

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Domain:** ClimateSphere AI / CleanTech SaaS  
**Project:** RoofRay  

---

## 1. Executive Summary

Rapid global urbanization and intensifying climate vulnerability necessitate aggressive deployment of distributed rooftop solar photovoltaics (PV). Urban centers worldwide—and particularly dense deltaic metropolises like Dhaka and regional hubs across South Asia—possess millions of square meters of unexploited rooftop real estate. 

However, rooftop solar planning remains fundamentally broken: it is slow, capital-intensive, reliant on manual engineering guesswork, and severely undermined by urban shading. Commercial and residential property owners frequently invest in sub-optimal systems that underperform by 20% to 45% due to unmodeled shadow penalties from adjacent high-rises, utility stairwells, HVAC units, and water tanks.

RoofRay bridges this critical engineering gap by combining:
1. **Deterministic 3D Physics:** Discretized 0.8m rooftop raycasting and NOAA astronomical solar ephemeris.
2. **Multi-Objective Spatial Optimization:** Automated placement respecting fire-safety setbacks and obstacle buffers.
3. **Grounded AI Advisory (RAG):** Natural-language strategic recommendations directly linked to verified SREDA, BPDB, and NREL policy knowledge bases.

---

## 2. Core Industry Problem Vectors

### A. The Urban Shading Penalty
Solar photovoltaic modules consist of series-connected crystalline silicon cells. Because current throughput in a string is constrained by the most shaded cell, partial shading from neighboring structures causes non-linear power drops. Shading even 10% of an array can trigger internal bypass diodes and reduce energy yields by 30% to 50%. Traditional aerial 2D estimation tools (satellite satellite image overlays) lack 3D spatial depth, failing to predict diurnal and seasonal shadow trajectories.

### B. High Pre-Engineering & Site Survey Friction
Conducting physical site audits requires certified solar engineers with specialized CAD software (HelioScope, PVsyst), drones, and sun-path locators. A preliminary design audit costs between \$500 and \$2,000 and requires 1 to 2 weeks turnaround time. This friction deters over 80% of potential commercial and residential adopters before a project even begins.

### C. Opaque Financial and Policy Complexity
Property owners struggle to assess economic viability. Net-metering regulations, progressive slab electricity tariffs (e.g. Bangladesh BPDB LT-A/LT-E schedules), equipment degradation, and capital payback periods are obscured by conflicting vendor claims. Without transparent, verifiable financial models, financial institutions and building owners hesitate to greenlight solar investments.

### D. Fragmented International vs. Localized Knowledge
Global tools typically operate on US/European utility assumptions, ignoring regional grid realities such as South Asian monsoon cloud attenuation, local grid emission factors (e.g. Bangladesh Department of Environment baseline of 0.637 kg CO₂/kWh), and specific utility load limits (e.g. SREDA 70% sanctioned load cap).

---

## 3. Target User Personas

| Persona | Role | Key Pain Point | RoofRay Value Proposition |
| :--- | :--- | :--- | :--- |
| **Urban Property Owner** | Residential building owner or commercial tenant | High monthly electricity bills; lack of clarity on payback and system size | Instant 3D visualization, clear payback period in BDT/USD, and verified demand offset |
| **Commercial Solar EPC** | Engineering, Procurement & Construction contractor | High customer acquisition costs and slow preliminary CAD drafting | Instant preliminary 3D raycast audit, automated layout generation, and exportable client report |
| **Corporate Sustainability Officer** | Factory owner (RMG, textiles, logistics) | Compliance with global ESG standards and carbon reduction targets | Verifiable carbon abatement calculations using official DoE/IEA emission factors |
| **Urban Planning Authority** | Municipal energy planner / SREDA consultant | Assessing neighborhood rooftop potential and grid export load | Batch building archetype analysis and solar suitability heatmaps |

---

## 4. RoofRay's Value Proposition

```
Traditional Planning              RoofRay AI Platform
-------------------               -------------------
2D flat aerial imagery     ───►   Interactive 3D Digital Twin with NOAA Sun Motion
Rule-of-thumb placement    ───►   0.8m Hardware-Discretized Raycast Shading Heatmap
1-2 weeks manual turnaround───►   Sub-Second Automated Multi-Objective Optimization
Opaque vendor estimates    ───►   Transparent BDT/USD Financials with Missing Input Guards
Generic chatbot advice     ───►   Grounded AI Advisor with Official SREDA/NREL Citations
```

---

## 5. Scope & Reality Boundaries

To maintain rigorous scientific and engineering integrity, RoofRay enforces strict product boundaries:
- **Simulated Archetypes vs. Real-World GIS:** Current 3D buildings represent discretized archetype geometries for physical raycasting; selecting a city updates astronomical ephemeris and solar irradiance calculations, not automated real-world GIS ingestion.
- **Clear-Sky vs. Weather-Informed:** Clear-sky simulation models geometric shading; satellite climatology (NASA POWER) adjusts for historical cloudiness; on-site production requires actual sensor metering.
- **No Hallucinated Math:** The AI Advisor never calculates or alters numerical generation or financials—the deterministic physics engine remains the single source of truth.
