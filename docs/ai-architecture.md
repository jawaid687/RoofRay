# RoofRay V3 — AI Architecture & Knowledge Retrieval (RAG)

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Topic:** Physics-Grounded Retrieval-Augmented Generation Architecture  

---

## 1. Core AI Philosophy: Physics as Single Source of Truth

Large Language Models (LLMs) are exceptional at contextual synthesis, narrative structuring, and domain-specific interpretation, but notoriously unreliable at spatial geometry, trigonometry, and arithmetic calculations. In solar photovoltaic planning, an invented calculation or hallucinated payback period can cause catastrophic financial losses.

**RoofRay's First Principle of AI Design:**  
*The LLM never calculates physical solar metrics.*

```
User Context & Question
         ↓
Deterministic Physical Engine (NOAA Ephemeris & 0.8m Raycast)
         ↓
Structured Numerical Truth (kW, kWh/yr, Shading %, Capex, Savings, CO₂)
         ↓
Lexical Knowledge Retrieval (BM25 over SREDA, BPDB, NREL Corpus)
         ↓
Prompt Injection with Citations & Single-Source-of-Truth Rules
         ↓
Official Google Gemini Model (JSON Output Mode)
         ↓
Schema Validation & Error Guard
         ↓
Explainable, Grounded Solar Feasibility Advice
```

---

## 2. Structured Information Ingestion

When the user requests an AI evaluation or asks a specific question, the client packages the current deterministic simulation state into a strictly typed payload:

```json
{
  "userQuestion": "Will monsoon shading reduce my solar yield in Dhaka?",
  "selectedBuilding": {
    "name": "Apex Lofts",
    "width": 15,
    "length": 18,
    "height": 12,
    "obstaclesCount": 2
  },
  "location": {
    "city": "Dhaka",
    "country": "Bangladesh",
    "latitude": 23.8103,
    "longitude": 90.4125,
    "timezone": "Asia/Dhaka"
  },
  "solarAnalysis": {
    "annualExposurePercent": 94,
    "unshadedAreaM2": 218.4
  },
  "energyProfile": {
    "installedCapacityKW": 8.8,
    "panelCount": 22,
    "annualGenerationKWh": 11210,
    "annualConsumptionKWh": 9600,
    "solarCoveragePercent": 100,
    "surplusKWh": 1610
  },
  "financialResult": {
    "totalSystemCost": 773000,
    "annualSavingsUSD": 117705,
    "paybackYears": 6.6,
    "currency": "BDT",
    "tariffPerKWh": 10.5
  },
  "environmentalResult": {
    "annualCO2ReductionTonnes": 7.1,
    "gridEmissionFactorKgPerKWh": 0.637,
    "gridEmissionFactorSource": "DoE & SREDA Bangladesh"
  }
}
```

---

## 3. Knowledge Retrieval Layer (Lexical BM25 Engine)

Rather than using opaque black-box embeddings that can hallucinate citations, RoofRay implements a transparent, authentic **Lexical BM25 Retrieval Engine** (`src/rag/retrievalEngine.ts`) over a curated corpus of verified government and scientific documentation:

### Ingested Knowledge Corpus (`src/rag/knowledge/corpus.ts`)
1. **SREDA Net Metering Guidelines (2018/2021):** 70% sanctioned load cap, 3-phase connection rule, bi-directional energy meter specifications, and rollover settlement rules.
2. **BPDB Electricity Retail Tariff Schedules (2024 Gazette):** Low Tension LT-A residential progressive slabs (৳5.26 to ৳14.61/kWh) and commercial LT-E rates.
3. **SREDA EPC Cost Benchmarks:** Turnkey capex guidance for Bangladesh rooftop PV (৳75,000 to ৳95,000/kWp).
4. **NREL PV Fundamentals (PVWatts):** Optimal fixed tilt (~latitude angle facing South), bypass diode behavior under partial shading, and temperature derating (-0.38%/°C).
5. **NASA POWER Climatology:** Annual GHI benchmarks across Bangladesh (4.5 to 5.2 kWh/m²/day) and monsoon cloud attenuation factors.
6. **DoE Grid Emission Factor (2023):** National grid emission baseline of 0.637 kg CO₂/kWh.

### BM25 Algorithm & Scoring Formula
Given a query $Q$ with terms $q_1, q_2, \dots, q_m$ and a document $D$:

$$\text{Score}(D, Q) = \sum_{i=1}^{m} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

- $k_1 = 1.5$ (term frequency saturation)
- $b = 0.75$ (document length normalization)
- Keyword and title boost for exact policy matches.

The top-ranked chunks are retrieved and injected directly into the LLM system prompt as verified grounding evidence.

---

## 4. Prompt Engineering & Response Validation

The prompt instructs the model to adhere to the role of a certified solar engineer, enforcing strict constraint validation:
- Disallow independent recalculation of solar yield, capacity, or financial numbers.
- Explicitly cite retrieved reference sources with published titles and organizations.
- Enforce strict JSON schema compliance.

### Structured Response Schema
```json
{
  "summary": "Executive feasibility synthesis",
  "recommendations": ["Array of engineering recommendations"],
  "advantages": ["Array of layout advantages"],
  "risks": ["Array of shading, grid, or structural risks"],
  "assumptions": ["Array of engineering and financial assumptions"],
  "next_steps": ["Concrete project development steps"],
  "sources": [
    {
      "title": "Document Title",
      "authorOrg": "Publishing Agency",
      "url": "Official URL",
      "relevance": "Why relevant to this scenario"
    }
  ]
}
```

---

## 5. Unconfigured API Key State Handling

In accordance with Rule 11 ("Do not claim an AI feature works when it is only a placeholder or mock"):
- If `GEMINI_API_KEY` is absent on the server, the system returns `{ configured: false, error: "MISSING_API_KEY", setupGuide: "..." }`.
- The frontend renders an honest, attractive Setup Guide informing the reviewer how to provide a key, while displaying the verified RAG knowledge citations and proving that all physical calculations remain 100% active.
