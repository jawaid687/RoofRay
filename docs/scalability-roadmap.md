# RoofRay — Scalability Roadmap & Engineering Horizon

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Topic:** Technical Roadmap from Prototype to Unicorn-Scale Infrastructure  

---

## 1. Architectural Scaling Dimensions

RoofRay's transition from a competition-ready prototype into a global enterprise climate-tech platform encompasses five strategic engineering vectors:

```
┌─────────────────────────────────────────────────────────────┐
│                 SCALABILITY HORIZONS                        │
│                                                             │
│  Phase 1 (Current): Discretized Archetypes & Raycasting     │
│  Phase 2 (Near-Term): Real-World GIS & OpenStreetMap LIDAR │
│  Phase 3 (Medium-Term): Global Grid Tariffs & Micro-Inverter│
│  Phase 4 (Long-Term): Multi-Agent Energy Trading Engine     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Roadmap Phases & Milestones

### Phase 1: Prototype Foundation (Current V3 Implementation)
- **Status:** **COMPLETED**
- **Capabilities:**
  - 396-cell 0.8m discretized line-of-sight raycasting.
  - NOAA astronomical sun position engine covering global latitudes.
  - Multi-objective placement optimization (4 modes) with fire setbacks.
  - NASA POWER climatology integration for satellite weather derating.
  - BDT / USD multi-currency economics with configurable slab tariffs.
  - Server-side Gemini AI Solar Advisor with Lexical BM25 RAG over SREDA, BPDB, NREL.
  - Complete English / বাংলা bilingual localization.

### Phase 2: Real-World Geospatial & LiDAR Ingestion (Q1–Q2 2027)
- **Objective:** Move from illustrative archetypes to automated ingestion of real-world rooftop geometries.
- **Engineering Deliverables:**
  - **OpenStreetMap & Microsoft Building Footprints API:** Ingest polygon rooftop footprints by typing an exact postal address or cadastral plot number.
  - **LiDAR Point Cloud Mesh Reconstruction:** Utilize airborne LiDAR and satellite stereo-photogrammetry to reconstruct real-world rooftop pitch, multi-plane hipped roofs, and parapet heights.
  - **Auto Obstacle Detection via Computer Vision:** Train a lightweight segmentation model (YOLOv10 / SegFormer) on aerial orthomosaics to automatically delineate rooftop water tanks, AC compressors, and laundry poles.

### Phase 3: Global Utility Integration & Weather Climatology (Q3–Q4 2027)
- **Objective:** Expand localization from Bangladesh across 50+ emerging and developed markets.
- **Engineering Deliverables:**
  - **Global Tariff Database Integration:** Automated API connectors to utility rate databases (OpenEI / Genability) across North America, Europe, Australia, and South Asia.
  - **PVsyst Compatibility Export:** One-click export of 3D scene files as standardized `.PAN`, `.OND`, and `.DAE` CAD files for formal institutional financing audits.
  - **Micro-Inverter & String Sizing Algorithms:** Automated electrical string matching checking Maximum Power Point Tracking (MPPT) voltage windows against local ambient temperature extremes.

### Phase 4: Autonomous Energy Market & Virtual Power Plants (2028+)
- **Objective:** Unicorn-scale platform enabling distributed rooftop peer-to-peer energy trading and virtual power plant (VPP) orchestration.
- **Engineering Deliverables:**
  - Smart contract settlement on zero-knowledge rollups for automated net-metering micro-payments.
  - Real-time battery energy storage system (BESS) co-optimization balancing time-of-use tariffs and peak-shaving demands.

---

## 3. Computational Performance Scaling

| Metric | Current V3 Benchmark | Target at Enterprise Scale | Engineering Strategy |
| :--- | :--- | :--- | :--- |
| **Annual Raycast Execution** | ~110 ms (Web Worker) | < 25 ms | WebAssembly (Wasm) + WebGPU compute shader raytracing |
| **Concurrent Users / Node** | 1,200 concurrent | 50,000 concurrent | Stateless edge workers (Cloudflare Workers / Fastly Compute) |
| **API Response Latency** | < 2.5s (Gemini Flash) | < 800 ms | Semantic caching of common RAG inquiries + prompt distillation |
| **Dataset Storage** | Ephemeral / Client | Distributed Geo-Lake | PostGIS / GeoParquet partitioned by administrative divisions |
