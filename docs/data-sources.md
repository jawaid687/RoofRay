# RoofRay — Data Sources & Scientific References

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Standard:** Verifiable Source Attribution & Methodology Documentation  

---

## 1. Verified Data Sources Registry

RoofRay explicitly rejects fabricated statistics, artificial weather datasets, or invented tariffs. Every scientific model, parameter, and citation utilized across the platform is registered below with official agency attribution, methodology, and licensing.

| Data Domain | Official Source | Issuing Agency / Authority | Parameter & Unit | Access & Licensing |
| :--- | :--- | :--- | :--- | :--- |
| **Astronomical Sun Position** | NOAA Solar Position Algorithm (SPA) | National Oceanic and Atmospheric Administration (NOAA), USA | Elevation (°), Azimuth (°), Solar Noon, Sunrise/Sunset | Public Domain / Open Access |
| **Clear-Sky Irradiance Model** | Meinel & Meinel Clear-Sky Irradiance | Applied Solar Energy / NREL Standard | Extraterrestrial Constant: $1367\text{ W/m}^2$, Clearness: 0.72 | Scientific Academic Literature |
| **Satellite Climatology** | NASA POWER Project v2.0 (LaRC) | NASA Langley Research Center | All-Sky & Clear-Sky GHI ($\text{kWh/m}^2\text{/day}$), 2m Temp (°C) | NASA Open Data Policy (Public Domain) |
| **Bangladesh Solar Policy** | Net Metering Guidelines (2018/2021) | SREDA, Power Division, Ministry of Power, Energy & Mineral Resources, GoB | Capacity Limit: 70% Sanctioned Load, Cap: 3 MW AC | Official GoB Gazette Publication |
| **Bangladesh Retail Tariffs** | Retail Tariff Schedule 2024 | Bangladesh Power Development Board (BPDB) / BERC | Residential LT-A: ৳5.26 - ৳14.61/kWh; Commercial LT-E: ৳14.50/kWh | Official BERC Tariff Gazette Order |
| **Bangladesh Turnkey Capex** | SREDA Rooftop Solar EPC Survey | SREDA / UNDP Renewable Energy Advisory | Monocrystalline PERC/TopCon: ৳75,000 - ৳95,000 / kWp installed | SREDA Market Assessment Reports |
| **Bangladesh Grid Carbon Intensity** | National Grid Emission Factor (2023) | Department of Environment (DoE), Ministry of Environment, Forest & Climate Change | Baseline Factor: $0.637\text{ kg CO}_2\text{/kWh}$ displaced | Official GoB UNFCCC National Report |
| **Global Grid Carbon Intensity** | IEA World Energy Outlook (2022) | International Energy Agency (IEA) | Global Average Grid Intensity: $0.420\text{ kg CO}_2\text{/kWh}$ displaced | IEA Open Access Benchmark |
| **PV Degradation & Temperature** | PVWatts System Loss Model | National Renewable Energy Laboratory (NREL), USA | System Performance Ratio: 82%, Temp Derate: -0.38%/°C | NREL Open Access Technical Reports |

---

## 2. Methodology & Mathematical Formulations

### A. NOAA Astronomical Calculations
- Implemented in `src/simulation/sunPosition.ts`.
- Uses verified NOAA solar ephemeris formulas with Julian centuries derived from local IANA timezones (including `Asia/Dhaka`).
- Preserves daylight saving transitions, polar midnight sun, and polar night edge cases without throwing exceptions.

### B. Bangladesh Grid Emission Factor Baseline
In Bangladesh, power generation is dominated by natural gas (~55%), imported coal (~18%), and heavy fuel oil (~15%). According to the official 2023 Department of Environment study, the combined margin grid emission factor is:
$$\text{GEF}_{\text{Bangladesh}} = 0.637\text{ kg CO}_2\text{ / kWh}$$
This means a 10 kW rooftop solar array producing 14,000 kWh annually displaces:
$$14000 \times 0.637 = 8,918\text{ kg CO}_2\text{/year} \approx 8.9\text{ Tonnes CO}_2\text{/year}$$
RoofRay documents this factor explicitly and makes it fully configurable in the Economics panel.

### C. NASA POWER Climatology Integration
- Implemented in `src/services/solarResourceService.ts`.
- Fetches long-term multi-year monthly averages from NASA LaRC MERRA-2 assimilation model.
- Automatically computes historical cloudiness attenuation index:
  $$\text{Cloud Penalty \%} = \frac{\text{Clear Sky GHI} - \text{All Sky GHI}}{\text{Clear Sky GHI}} \times 100$$
  accounting for dense monsoon cloud cover during June–August across Bangladesh divisions.
