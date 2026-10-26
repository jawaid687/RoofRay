# RoofRay v2: Product Requirements Document and Antigravity Build Prompt

Prepared for the RoofRay team. Repo: github.com/jawaid687/RoofRay (React 19, TypeScript, Vite, Three.js / R3F, Zustand, Tailwind).

## 1. Overview

RoofRay v1 is a 3D rooftop solar planner with a simplified, fake sun arc (fixed 64° peak, no date, latitude or longitude), 5 fixed sample hours for shading, editable buildings, and auto-only panel placement.

RoofRay v2 turns it into a physically grounded planner:

1. A real astronomical sun position from latitude, longitude, date, time and timezone.
2. Live shadows for the chosen date and time, driven by that sun.
3. An annual shading and yield analysis, per roof cell.
4. Fixed buildings (size and position never change).
5. Manual panel placement, guided by how much sun each spot gets.

## 2. Goals and non-goals

**Goals**

- Sun azimuth and elevation match the NOAA solar calculator within 0.1°.
- The 3D light, the shadow map, the raycast heatmap and the energy model all use one shared sun vector (single source of truth).
- The user can see the exact date, time, location, azimuth and elevation that produced what is on screen.
- Annual analysis runs off the main thread and never freezes the UI.
- The user can place, move, rotate and delete panels by hand and see each panel's annual exposure and kWh.
- Everything stays 100% client-side with no paid APIs.

**Non-goals (v2)**

- Real-world address lookup, 3D map tiles or drone import.
- Pitched roofs, battery storage, time-of-use tariffs, CAD or PDF export.
- Weather-exact yield forecasts. Irradiance is a clear-sky model and must be labelled that way.

## 3. Users

- **Home owner:** wants to know where on the roof panels will actually get sun.
- **Installer or facility manager:** wants to place panels by hand and compare layouts.
- **Hackathon judge or reviewer:** wants a clear, verifiable, explainable demo.

## 4. Functional requirements

### 4.1 Fixed buildings (FR-1)

- FR-1.1 Building width, depth, height and position are constants in `data/buildings.ts`, declared `as const`, deep-frozen, with `readonly` types.
- FR-1.2 Remove all dimension sliders and any code path that mutates a building. `BuildingInspector` becomes a read-only info card plus a building selector.
- FR-1.3 Rooftop obstacles (HVAC, tanks, penthouses) are also fixed. (Open question: confirm with the team.)
- FR-1.4 The true-north offset of the scene is a constant in `config/assumptions.ts`.

### 4.2 Location, date and time (FR-2)

- FR-2.1 Inputs: latitude (−90 to 90), longitude (−180 to 180), date (day, month, year), local time, and an IANA timezone (handles DST).
- FR-2.2 City presets plus manual entry, with validation and clear error messages.
- FR-2.3 A persistent readout: selected date and time, timezone and UTC time, solar azimuth, elevation, sunrise, solar noon, sunset and day length.
- FR-2.4 A time slider with sunrise and sunset markers, a date picker, season presets (solstices and equinoxes), and Play Day / Play Year animation.
- FR-2.5 Polar day and polar night are handled without errors (no sunrise or sunset shown, a clear label instead).

### 4.3 Astronomical sun engine (FR-3)

- FR-3.1 Implement the NOAA solar position algorithm in `simulation/sunPosition.ts`: Julian Day and Century, mean longitude and anomaly, equation of center, apparent longitude, obliquity, declination, equation of time, true solar time, hour angle, zenith, elevation, azimuth, and optional atmospheric refraction.
- FR-3.2 Azimuth is measured clockwise from true north, 0° to 360°. Elevation is in degrees above the horizon.
- FR-3.3 Pure, deterministic functions with no Three.js imports, so they are testable in Node.
- FR-3.4 Output also includes sunrise, sunset, solar noon and day length for a given date and place.

### 4.4 Scene lighting and live shadows (FR-4)

- FR-4.1 Scene convention: north = −Z, east = +X, up = +Y. Sun direction = (sin az · cos el, sin el, −cos az · cos el), then rotated by the north offset.
- FR-4.2 `SunVisualizer` places the sun orb and the DirectionalLight along that vector only. No hand-tuned arcs.
- FR-4.3 Below 0° elevation the sun is off, ambient light is dim, and the sky color follows elevation through twilight.
- FR-4.4 Light color and intensity scale with elevation (warm and weaker near the horizon, bright at midday).
- FR-4.5 The shadow camera frustum is fitted to the neighborhood bounds so shadows stay sharp at low sun angles.
- FR-4.6 A 3D sun path arc for the selected day, plus the summer and winter solstice arcs, and a north compass.

### 4.5 Live shading analysis (FR-5)

- FR-5.1 For the selected moment, cast one ray per roof cell toward the sun against all other buildings and obstacles. Cells are marked lit or shaded.
- FR-5.2 Re-run on any change to time, date or location, throttled with `requestAnimationFrame`.
- FR-5.3 Heatmap mode "Live" shows lit (green), shaded (red) and obstacle (grey) cells.

### 4.6 Annual analysis (FR-6)

- FR-6.1 Sample 12 representative days (one per month, for example the 15th) at 30-minute steps over daylight hours, about 150 to 250 sun positions.
- FR-6.2 For each cell and sample, test occlusion and weight by clear-sky irradiance on the panel plane times cos(incidence angle). Shaded samples keep only the diffuse share.
- FR-6.3 Output per cell: annual exposure % (shaded-weighted over unshaded-weighted) and annual kWh/m². Also keep per-month values for a monthly view.
- FR-6.4 Runs in a Web Worker with a progress bar and cancellation. Results are cached by (building, latitude, longitude, tilt, azimuth, year) and invalidated on change.
- FR-6.5 Heatmap modes: Live, Annual, and Monthly. The UI labels irradiance as "clear-sky estimate".
- FR-6.6 Panel plane defaults: faces the equator (south in the northern hemisphere, north in the southern), tilt = latitude, both adjustable.

### 4.7 Manual panel placement (FR-7)

- FR-7.1 A "Manual Layout" tab with panel hardware selection, tools and a panel list.
- FR-7.2 A ghost panel follows the cursor, snapped to a grid, colored by annual exposure there (green at 80% or more, yellow at 60 to 80%, red under 60%).
- FR-7.3 A tooltip shows annual exposure %, annual kWh and whether the spot is lit now.
- FR-7.4 Click to place. Drag to move. `Q` / `E` rotate, `T` toggles portrait or landscape, `Delete` removes, `Ctrl+Z` / `Ctrl+Y` undo and redo.
- FR-7.5 Draw-a-rectangle "fill area" that skips invalid spots. Clear all. Convert the auto layout into editable panels.
- FR-7.6 Validation blocks placement when a panel is outside the roof or inside the 0.8 m setback, within 0.5 m of an obstacle, or overlapping another panel. A low-exposure spot (under a configurable threshold, default 60%) only warns.
- FR-7.7 "Show best spots" ranks free positions by annual yield, and "Suggest next panel" places one at the best remaining spot.
- FR-7.8 Per-panel annual kWh and exposure %, with a note when low-exposure panels sit in the same group (string mismatch risk).

### 4.8 Energy, finance and explanation (FR-8)

- FR-8.1 System kW and annual kWh come from the sum of per-panel annual yields, not a single average exposure factor.
- FR-8.2 The existing cost, savings, payback, 20-year ROI and CO₂ calculations keep working from those new totals.
- FR-8.3 The "Why This Plan" text is generated from computed numbers only, including placement hints (for example, how many panels sit in zones under 60% annual exposure and the kWh they lose).

## 5. Technical design

### 5.1 Coordinate and unit rules

- Internal units: meters, degrees for angles at the API boundary and radians inside math, kW, kWh, kg CO₂.
- Time is handled as UTC internally. Local time and timezone convert at the edge (use `Intl.DateTimeFormat` with the IANA zone, no heavy dependency).

### 5.2 Clear-sky model

- Air mass from elevation (Kasten and Young). Direct normal irradiance from a Meinel-type formula, and diffuse as a configurable fraction. All coefficients live in `config/assumptions.ts` with a location or clearness factor.
- Plane-of-array beam = DNI × max(0, cos incidence). Diffuse uses an isotropic sky factor (1 + cos tilt) / 2.

### 5.3 Performance budget

- Roughly 2,000 cells × 200 samples × about 30 boxes is 12M ray-box tests. Use slab tests on axis-aligned boxes, no object allocation in the inner loop, typed arrays, and transferable buffers to and from the worker.
- Target: annual analysis under 3 seconds for the default roof on a mid-range laptop. Live update under 8 ms per frame.

### 5.4 State (Zustand, `useSolarStore`)

Add: `location`, `dateTime`, `sun` (derived), `liveShading`, `annualAnalysis` (with status and progress), `heatmapMode`, `panels[]`, `selectedPanelIds`, `history` (undo and redo stacks), `placementMode`. Keep derived values in selectors, not duplicated state.

### 5.5 File plan

**New**

- `simulation/annualAnalysis.ts`, `simulation/analysis.worker.ts`, `simulation/clearSky.ts`, `simulation/timezone.ts`
- `optimization/manualPlacement.ts` (snap, collision, validation, best-spot ranking)
- `three/PanelGhost.tsx`, `three/SunPath.tsx`, `three/Compass.tsx`
- `components/panels/LocationTimeCard.tsx`, `components/panels/ManualLayoutPanel.tsx`
- `tests/sunPosition.test.ts`, `tests/annualAnalysis.test.ts`, `tests/placement.test.ts`

**Rewritten or changed**

- `sunPosition.ts`, `shadowRaycaster.ts`, `suitability.ts`, `SunVisualizer.tsx`, `RoofHeatmap.tsx`, `ViewportControls.tsx`, `BuildingInspector.tsx`, `energy.ts`, `recommendation.ts`, `useSolarStore.ts`, `types/index.ts`, `data/buildings.ts`, `config/assumptions.ts`

## 6. Non-functional requirements

- 60 FPS interaction with the heatmap on and the shadow map on.
- No main-thread block longer than 50 ms during analysis.
- TypeScript `strict` with no `any` in the simulation code.
- The simulation layer is pure and unit tested. UI never contains physics.
- Works offline after load. No network calls.

## 7. Acceptance criteria and tests

**Sun engine** (tolerance 0.1° for angles, 1 minute for times, checked against NOAA reference values):

- Equinox solar noon at the equator: elevation about 90°.
- Northern Tropic at June solstice noon: elevation about 90°.
- Mid-latitude northern summer vs winter noon elevation matches reference.
- A southern-hemisphere site: the sun at noon is in the north (azimuth near 0° or 360°).
- Polar day and polar night return no sunrise or sunset without throwing.
- A DST boundary date converts local time to the correct UTC.

**Shading and annual analysis**

- An unobstructed roof gives about 100% annual exposure.
- A roof next to the tall tower has lower exposure, and winter is lower than summer for a roof north of a tower in the northern hemisphere.
- The live heatmap and a single-sample annual run agree for the same sun position.
- Annual analysis runs off the main thread and reports progress.

**Placement**

- Panels outside the setback, near obstacles or overlapping are rejected.
- Undo and redo restore exact state.
- Sum of per-panel yield equals the system total shown in the finance card.

**Fixed buildings**

- No code path changes a building's dimensions or position (a test freezes and asserts this).

**Manual check:** change latitude, date and time and confirm the sun, shadows, readout and heatmap all agree.

## 8. Milestones

1. **M1 Sun engine:** NOAA algorithm, timezone handling, tests.
2. **M2 Fixed buildings and live sun:** store inputs, scene mapping, lighting, live shadow heatmap, readout panel.
3. **M3 Annual analysis:** clear-sky model, worker, annual and monthly heatmaps.
4. **M4 Manual placement:** ghost panel, validation, undo and redo, fill area, best spots.
5. **M5 Yield and finance:** per-panel yield, updated explanation text.
6. **M6 Polish:** sun path, compass, Play Day and Play Year, performance pass, README update.

## 9. Risks

- **Annual analysis speed:** mitigated by the worker, typed arrays and caching.
- **Sun convention mistakes (mirrored east and west):** mitigated by tests and a visible compass.
- **Clear-sky vs real weather:** mitigated by clear labels and an adjustable clearness factor.
- **Timezone and DST bugs:** mitigated by IANA zone handling and explicit tests.
- **Scope creep:** keep non-goals out of v2.

## 10. Open questions

- Are rooftop obstacles also fixed? (Assumed yes.)
- Default location and city presets to ship with?
- Which tilt and azimuth defaults should the manual panels use, and is per-panel tilt needed?
- Should placed panels shade other panels and neighbors in the annual analysis?

## 11. How to use this in Antigravity

A workflow that works well with an agent-first IDE:

1. Open the existing RoofRay repo as the workspace. Commit a clean baseline first so every change is easy to review or revert.
2. Save this PRD as `docs/PRD.md` in the repo so the agent can re-read it in every session.
3. Put the "Standing rules" below into the workspace rules (or your agent's rules file) so they apply to every task.
4. Use planning mode. Paste the master prompt, review the plan the agent proposes, then approve it milestone by milestone rather than all at once.
5. After each milestone, run `npm run test:calc`, `npm run build` and the dev server, and only then move to the next prompt.

### Standing rules (paste into workspace rules)

```
You are working on RoofRay, a React 19 + TypeScript + Vite + Three.js (R3F) app.
Always read docs/PRD.md before planning. Follow it exactly.
- Simulation code in src/simulation, src/optimization, src/calculations must be pure TypeScript with no React or Three.js imports, and fully unit tested.
- Scene convention: north = -Z, east = +X, up = +Y. Azimuth is clockwise from true north.
- One sun vector is the single source of truth for lighting, shadow map, raycasts and energy.
- Buildings and rooftop obstacles are immutable constants. Never add code that changes them.
- Heavy computation (annual analysis) runs in a Web Worker. Never block the main thread.
- TypeScript strict, no any in simulation code. No external paid APIs, no network calls.
- Do not invent numbers. All coefficients live in src/config/assumptions.ts.
- Work one milestone at a time. After each, run tests and build, summarize changes, and stop for review.
- Do not delete existing features unless the PRD says so.
```

## 12. Master prompt (paste into Antigravity)

```
Task: Upgrade the existing RoofRay project to v2 as specified in docs/PRD.md.

Context:
RoofRay is a client-side 3D rooftop solar planner (React 19, TypeScript, Vite, Three.js via React Three Fiber and Drei, Zustand, Tailwind). Today it uses a fake sun arc, 5 fixed sample hours for shading, editable building dimensions, and auto-only panel placement.

Goals for v2:
1. Replace the sun model with the NOAA solar position algorithm driven by latitude, longitude, date, local time and IANA timezone. Output azimuth, elevation, sunrise, sunset, solar noon and day length. Verify against NOAA reference values within 0.1 degree.
2. Make buildings fixed: width, depth, height and position are readonly constants. Remove all editing UI for them.
3. Light the scene only from the real sun vector (north = -Z, east = +X, up = +Y). Add night and twilight handling, elevation-based light color and intensity, a fitted shadow frustum, a 3D sun path arc with solstice arcs, and a north compass.
4. Add a live shading pass for the selected date and time, shown on the roof heatmap.
5. Add an annual analysis in a Web Worker: 12 representative days at 30-minute steps, clear-sky irradiance weighted by incidence angle, per-cell annual exposure percent and kWh per square meter, with progress, cancellation and caching. Add Live, Annual and Monthly heatmap modes.
6. Add manual panel placement: ghost panel colored by annual exposure, snap to grid, validation (setback, obstacle clearance, overlap), rotate and portrait or landscape toggle, drag, delete, undo and redo, fill-area, best-spot suggestions, and per-panel annual kWh.
7. Drive energy, finance, emissions and the Why This Plan text from the sum of per-panel yields.
8. Add a Location and Time panel with city presets, date picker, time slider with sunrise and sunset markers, a readout of azimuth and elevation, season presets, and Play Day and Play Year.

Process (important):
- First, read the repository and docs/PRD.md, then produce an implementation plan and a task list per milestone M1 to M6 as defined in the PRD. Do not write code yet.
- Then implement ONE milestone at a time. After each milestone: run npm run test:calc and npm run build, fix failures, give a short summary of files changed, and wait for my approval before starting the next.
- For M1, write the sun engine and tests first (tests/sunPosition.test.ts) with the reference cases listed in the PRD, and show the test output.
- Open the dev server in the browser at the end of M2, M3 and M4 and check visually: change latitude, date and time and confirm the sun, shadows, heatmap and readout agree. Include screenshots in your report.

Constraints:
- Follow the standing rules in the workspace rules.
- Keep existing features working unless the PRD removes them.
- Keep the existing visual style (dark energy-tech glassmorphism).
- If anything in the PRD is ambiguous, list your assumption in the plan instead of guessing silently.

Definition of done: all acceptance criteria in section 7 of docs/PRD.md pass, build is clean with TypeScript strict, and the README is updated with the new features, formulas and usage.
```

### Follow-up prompts, one per milestone

**M1:** `Implement milestone M1 only: the NOAA sun engine in src/simulation/sunPosition.ts, timezone handling in src/simulation/timezone.ts, and tests/sunPosition.test.ts covering every case in PRD section 7. Do not touch UI. Show test output.`

**M2:** `Implement M2: make buildings immutable and remove their editing UI, add the location, date and time store state and LocationTimeCard, drive SunVisualizer from the real sun vector, add night and twilight handling, and the live shadow heatmap. Verify in the browser and attach screenshots for three dates and two latitudes.`

**M3:** `Implement M3: clearSky.ts, annualAnalysis.ts, analysis.worker.ts with progress, cancellation and caching, and the Live, Annual and Monthly heatmap modes. Add tests from PRD section 7. Report the measured analysis time.`

**M4:** `Implement M4: manual placement with ghost panel, validation, undo and redo, drag, rotate, fill-area and best-spot suggestions, plus tests/placement.test.ts. Verify in the browser.`

**M5:** `Implement M5: per-panel yield, and rewire energy, financial, emissions and recommendation so everything derives from the per-panel totals. Update the unit tests accordingly.`

**M6:** `Implement M6: SunPath and Compass in the 3D scene, Play Day and Play Year, a performance pass against the PRD budget, and a README update. Run the full test suite and build.`

### Tips for better results

- If the agent drifts, reply with the exact PRD section number it violated.
- Ask it to show the NOAA reference numbers it tested against, so you can spot-check them with the NOAA calculator yourself.
- Keep each milestone in its own commit so a bad change is a one-line revert.
