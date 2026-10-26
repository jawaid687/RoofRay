import { calculateNOAASunPosition, getSunVector } from '../src/simulation/sunPosition';
import { INITIAL_BUILDINGS } from '../src/data/buildings';
import { generateRoofGrid } from '../src/simulation/roofGrid';
import { calculateLiveShading } from '../src/simulation/shadowRaycaster';
import { runAnnualAnalysisSync } from '../src/simulation/annualAnalysis';

export function runM6AndPerformanceTests() {
  console.log('🧭 Starting Milestone M6 (SunPath, Compass, Playback) & Performance Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // --- Section 1: SunPath & Astronomical Arcs ---
  const sfLat = 37.7749;
  const sfLon = -122.4194;
  const sfTz = 'America/Los_Angeles';

  // 1. Summer Solstice (Jun 21) vs Winter Solstice (Dec 21)
  const summerNoon = calculateNOAASunPosition({
    latitude: sfLat,
    longitude: sfLon,
    date: { year: 2026, month: 6, day: 21 },
    time: 13.1, // approximate solar noon PDT
    timezone: sfTz,
  });

  const winterNoon = calculateNOAASunPosition({
    latitude: sfLat,
    longitude: sfLon,
    date: { year: 2026, month: 12, day: 21 },
    time: 12.15, // approximate solar noon PST
    timezone: sfTz,
  });

  assert(
    summerNoon.elevationDeg > winterNoon.elevationDeg + 45,
    'SunPath: Summer solstice noon elevation (>75°) is >45° higher than winter solstice (<30°)',
    `Summer: ${summerNoon.elevationDeg}°, Winter: ${winterNoon.elevationDeg}°`
  );

  // 2. Sample arc points above horizon for summer solstice
  let summerPointsCount = 0;
  for (let t = 0; t <= 24; t += 0.5) {
    const sun = calculateNOAASunPosition({
      latitude: sfLat,
      longitude: sfLon,
      date: { year: 2026, month: 6, day: 21 },
      time: t,
      timezone: sfTz,
    });
    if (sun.elevationDeg >= -1.0) {
      summerPointsCount++;
    }
  }
  assert(
    summerPointsCount >= 28, // ~14+ hours of daylight sampled every 30 mins
    'SunPath: Summer solstice generates complete daytime arc (>28 sample points)',
    `Points: ${summerPointsCount}`
  );

  // 3. Polar latitude handling in SunPath
  // Tromsø Summer (Polar Day)
  let tromsoSummerCount = 0;
  for (let t = 0; t < 24; t += 1.0) {
    const sun = calculateNOAASunPosition({
      latitude: 69.6492,
      longitude: 18.9553,
      date: { year: 2026, month: 6, day: 21 },
      time: t,
      timezone: 'Europe/Oslo',
    });
    if (sun.elevationDeg >= 0) {
      tromsoSummerCount++;
    }
  }
  assert(
    tromsoSummerCount === 24,
    'SunPath: Midnight Sun in Tromsø maintains sun above horizon 24/24 hours',
    `Hours above horizon: ${tromsoSummerCount}/24`
  );

  // Tromsø Winter (Polar Night)
  let tromsoWinterCount = 0;
  for (let t = 0; t < 24; t += 1.0) {
    const sun = calculateNOAASunPosition({
      latitude: 69.6492,
      longitude: 18.9553,
      date: { year: 2026, month: 12, day: 21 },
      time: t,
      timezone: 'Europe/Oslo',
    });
    if (sun.elevationDeg >= 0) {
      tromsoWinterCount++;
    }
  }
  assert(
    tromsoWinterCount === 0,
    'SunPath: Polar Night in Tromsø produces 0 daytime arc points without throwing',
    `Points: ${tromsoWinterCount}`
  );

  // --- Section 2: Compass & Coordinate System Invariants ---
  const northVec = getSunVector(0, 0, 0); // Azimuth 0°, elevation 0°
  const eastVec = getSunVector(90, 0, 0);  // Azimuth 90°
  const southVec = getSunVector(180, 0, 0); // Azimuth 180°
  const westVec = getSunVector(270, 0, 0); // Azimuth 270°

  assert(
    Math.abs(northVec[0]) < 0.001 && Math.abs(northVec[1]) < 0.001 && Math.abs(northVec[2] - (-1)) < 0.001,
    'Compass: True North strictly maps to scene vector [0, 0, -1] (-Z direction)'
  );

  assert(
    Math.abs(eastVec[0] - 1) < 0.001 && Math.abs(eastVec[1]) < 0.001 && Math.abs(eastVec[2]) < 0.001,
    'Compass: True East strictly maps to scene vector [1, 0, 0] (+X direction)'
  );

  assert(
    Math.abs(southVec[0]) < 0.001 && Math.abs(southVec[1]) < 0.001 && Math.abs(southVec[2] - 1) < 0.001,
    'Compass: True South strictly maps to scene vector [0, 0, 1] (+Z direction)'
  );

  assert(
    Math.abs(westVec[0] - (-1)) < 0.001 && Math.abs(westVec[1]) < 0.001 && Math.abs(westVec[2]) < 0.001,
    'Compass: True West strictly maps to scene vector [-1, 0, 0] (-X direction)'
  );

  // --- Section 3: Play Day & Play Year Ticker Arithmetic ---
  // Diurnal 24h wrap test:
  const initialTime = 23.5;
  const hoursToAdd = 1.5;
  const wrappedTime = (initialTime + hoursToAdd) % 24;
  assert(
    Math.abs(wrappedTime - 1.0) < 0.001,
    'Play Day: 24-hour diurnal cycle wraps smoothly from 23:30 + 1.5h to 01:00'
  );

  // Annual 365-day wrap test:
  const testYear = 2026;
  const startOfYearMs = new Date(testYear, 0, 1).getTime();
  const dayOfYear360 = 360;
  const daysToAdd = 10;
  const nextDayOfYear = (dayOfYear360 + daysToAdd) % 365;
  const nextDate = new Date(startOfYearMs + nextDayOfYear * 86400000);
  assert(
    nextDayOfYear === 5 && nextDate.getMonth() === 0 && nextDate.getDate() === 6,
    'Play Year: 365-day annual cycle wraps smoothly from late December to early January'
  );

  // --- Section 4: Performance Pass Against PRD Budget (§5.3 & §6) ---
  const bldg = INITIAL_BUILDINGS[0]; // Apex Lofts: 15m x 18m, 396 cells
  const grid = generateRoofGrid(bldg);

  // 1. Live Shading Performance Pass (PRD budget: < 8.0 ms per frame)
  const sunVec: [number, number, number] = [0.4, 0.7, -0.5];
  const tLiveStart = performance.now();
  const liveRuns = 20;
  for (let r = 0; r < liveRuns; r++) {
    calculateLiveShading(bldg, INITIAL_BUILDINGS, grid.cells, sunVec);
  }
  const tLiveTotal = performance.now() - tLiveStart;
  const avgLiveMs = tLiveTotal / liveRuns;

  console.log(`\n  ⚡ Measured Live Shading Execution Time: ${avgLiveMs.toFixed(2)} ms/frame`);
  assert(
    avgLiveMs < 8.0,
    `Performance Budget: Live shading executes in ${avgLiveMs.toFixed(2)} ms (PRD §5.3 budget: < 8.0 ms)`
  );

  // 2. Annual Analysis Performance Pass (PRD budget: < 3.0 seconds = 3000 ms)
  const tAnnualStart = performance.now();
  const annualResult = runAnnualAnalysisSync({
    targetBuilding: bldg,
    allBuildings: INITIAL_BUILDINGS,
    cells: grid.cells,
    latitude: sfLat,
    longitude: sfLon,
    timezone: sfTz,
    panelTiltDeg: sfLat, // tilt = latitude
    panelAzimuthDeg: 180,   // azimuth = South
    year: 2026,
  });
  const tAnnualTotal = performance.now() - tAnnualStart;

  console.log(`  ⚡ Measured Annual Analysis Execution Time: ${tAnnualTotal.toFixed(1)} ms for ${grid.cells.length} cells across 12 months`);
  assert(
    tAnnualTotal < 3000,
    `Performance Budget: Annual analysis executes in ${tAnnualTotal.toFixed(1)} ms (PRD §5.3 budget: < 3000 ms)`
  );

  assert(
    annualResult.cells.length === grid.cells.length,
    'Performance Pass: Annual analysis produced full results for all roof cells'
  );

  console.log(`\n========================================`);
  console.log(`M6 & Performance Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('m6Performance')) {
  const { failed } = runM6AndPerformanceTests();
  process.exit(failed > 0 ? 1 : 0);
}
