# RoofRay V3 — Responsible AI, Safety & Explainability

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Standard:** Ethical AI, Truthfulness, Explainability & Safeguards  

---

## 1. Principles of Responsible AI Deployment

RoofRay addresses a high-stakes engineering and financial domain: renewable energy capital planning. Inaccurate or misleading solar production projections can lead to failed investments, grid interconnection disputes, and equipment damage. 

RoofRay strictly adheres to the following responsible AI principles:

```
┌─────────────────────────────────────────────────────────────────┐
│                 RESPONSIBLE AI CORE TENETS                      │
│                                                                 │
│  1. Separation of Physics & Language: Physics is deterministic  │
│  2. Absolute Grounding: No hallucinated math or statistics      │
│  3. Verifiable Citations: Official regulatory sources linked    │
│  4. Clear-Sky vs. Weather vs. Metered: Transparent labels       │
│  5. Missing-Input Protection: No misleading payback estimates   │
│  6. Honest AI States: No fake mock AI when unconfigured         │
│  7. Server-Side Security: Zero API secret exposure to clients    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Separation of Physical Simulation and Language Generation

- **The LLM is NOT a Solar Calculator:** Many AI applications make the fatal mistake of asking an LLM "How many kWh will 20 panels produce in Dhaka?". LLMs produce inconsistent and hallucinated numbers.
- **RoofRay's Separation:**
  - All numerical calculations (solar angles, 0.8m shadow raycasts, annual clear-sky exposure, installed kW, per-panel annual kWh, equipment cost, bill savings, payback years, and CO₂ offset) are computed deterministically by verified TypeScript algorithms.
  - The LLM acts purely as an **Engineering Interpreter and Strategic Advisor**, receiving pre-calculated numbers and explaining the implications to the user.

---

## 3. Explicit Scientific & Engineering Distinctions

RoofRay enforces clear visual and textual distinction between three levels of solar production truth:

1. **Deterministic Clear-Sky Simulation:** Raytraced geometric line-of-sight calculations assuming clear atmospheric transmission. Reflects exact building heights, surrounding high-rises, and rooftop utility obstacles.
2. **Weather-Informed Climatological Estimates:** Multi-year satellite observations (NASA POWER) adjusting clear-sky potential for historical cloud cover, seasonal monsoon rain, and ambient temperatures.
3. **Actual Metered Energy Production:** Real-world electrical generation measured by physical on-site utility bi-directional meters and inverter sensors. *RoofRay explicitly reminds users that simulations are not metered production.*

---

## 4. Guardrails Against Misleading Financial Projections

- **Missing Input Guard (Rule 4.B):** When electricity tariff or capex inputs are absent or non-positive ($0), RoofRay explicitly refuses to calculate a misleading payback period. The UI displays `paybackYears: null` and advises the user to input a verified retail rate.
- **Configurable Assumptions:** Every economic and environmental factor (tariff, turnkey cost/kW, base permitting fee, grid emission factor) is made visible and configurable by the user in an expandable settings panel.
- **Illustrative 3D Geometry Disclaimer (Rule 4.A & 10):** The UI clearly displays an info badge stating that 3D buildings represent simulated archetypes for raycasting analysis; selecting a city updates astronomical ephemeris and solar irradiance, not automated real-world GIS ingestion.

---

## 5. Transparency in AI Configuration State (Rule 11)

If the server-side `GEMINI_API_KEY` is not configured:
- RoofRay never displays a canned or fake response pretending to be live AI.
- Instead, the interface honestly reports that the AI Advisor requires configuration and provides a transparent setup guide.
- The interface displays the retrieved technical citations and reminds the user that the entire 3D simulation and calculation engine remains 100% operational.

---

## 6. Human-in-the-Loop & Professional Notice

Every generated report and AI output includes this mandatory engineering notice:
> *"RoofRay provides preliminary engineering feasibility estimates. A certified structural engineer must verify rooftop load-bearing capacity and a licensed electrical contractor must inspect distribution panels and obtain utility net-metering interconnection approval prior to equipment procurement."*
