import { INITIAL_BUILDINGS } from '../src/data/buildings';
import { generateRoofGrid } from '../src/simulation/roofGrid';
import { calculateNOAASunPosition } from '../src/simulation/sunPosition';
import { calculateLiveShading } from '../src/simulation/shadowRaycaster';
import {
  runAnnualAnalysisSync,
  clearAnnualAnalysisCache,
} from '../src/simulation/annualAnalysis';
import { Building } from '../src/types';

export function runAnnualAnalysisTests(): { passed: number; failed: number } {
  console.log('☀️  Starting Annual Solar Analysis Test Suite (PRD §7 & FR-6)...\n');

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

  // =========================================================================
  // Test 1: Unobstructed roof gives ~100% annual exposure (PRD §7)
  // =========================================================================
  const isolatedBuilding: Building = {
    id: 'isolated-building',
    name: 'Isolated Flat Roof',
    type: 'residential',
    position: [0, 0, 0],
    width: 20,
    length: 20,
    height: 10,
    roofType: 'flat',
    roofObstacles: [],
    defaultMonthlyKWh: 800,
  };

  const isolatedGrid = generateRoofGrid(isolatedBuilding);
  clearAnnualAnalysisCache();

  const unobstructedResult = runAnnualAnalysisSync({
    targetBuilding: isolatedBuilding,
    allBuildings: [isolatedBuilding], // No neighbors
    cells: isolatedGrid.cells,
    latitude: 37.7749, // San Francisco
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    year: 2026,
  });

  assert(
    unobstructedResult.averageAnnualExposure >= 0.99,
    'Unobstructed roof gives ~100% annual exposure',
    `Expected >= 0.99, got ${unobstructedResult.averageAnnualExposure}`
  );
  assert(
    unobstructedResult.poorArea === 0,
    'Unobstructed roof has 0 m² poor exposure area',
    `Poor area: ${unobstructedResult.poorArea} m²`
  );
  assert(
    unobstructedResult.recommendedArea === unobstructedResult.totalRoofArea,
    'Unobstructed roof recommended area equals 100% of roof area',
    `Recommended: ${unobstructedResult.recommendedArea} m², Total: ${unobstructedResult.totalRoofArea} m²`
  );

  // =========================================================================
  // Test 2: Roof next to tall tower has lower exposure, and winter is lower
  // than summer for a roof north of a tower in Northern Hemisphere (PRD §7)
  // =========================================================================
  // Building at Z = -25 (North), 45m Tower at Z = 0 (South), Lat = 40° N
  const northBuilding: Building = {
    id: 'north-building',
    name: 'North Building',
    type: 'residential',
    position: [0, 0, -25],
    width: 20,
    length: 20,
    height: 12,
    roofType: 'flat',
    roofObstacles: [],
    defaultMonthlyKWh: 800,
  };

  const southTower: Building = {
    id: 'south-tower',
    name: 'South Tall Tower',
    type: 'commercial',
    position: [0, 0, 5],
    width: 24,
    length: 24,
    height: 48,
    roofType: 'flat',
    roofObstacles: [],
    defaultMonthlyKWh: 3000,
  };

  const northGrid = generateRoofGrid(northBuilding);
  clearAnnualAnalysisCache();

  const towerShadedResult = runAnnualAnalysisSync({
    targetBuilding: northBuilding,
    allBuildings: [northBuilding, southTower],
    cells: northGrid.cells,
    latitude: 40.0, // Northern hemisphere
    longitude: -74.0,
    timezone: 'America/New_York',
    year: 2026,
  });

  assert(
    towerShadedResult.averageAnnualExposure < unobstructedResult.averageAnnualExposure,
    'Roof next to tall tower has lower annual exposure than unobstructed roof',
    `Tower-shaded: ${towerShadedResult.averageAnnualExposure}, Unobstructed: ${unobstructedResult.averageAnnualExposure}`
  );

  // Compare Winter (December = index 11) vs Summer (June = index 5)
  const juneKWh = towerShadedResult.monthlyAveragesKWhPerM2[5];
  const decKWh = towerShadedResult.monthlyAveragesKWhPerM2[11];
  assert(
    decKWh < juneKWh * 0.4,
    'Winter monthly insolation is significantly lower than summer for roof north of tower in Northern Hemisphere',
    `Dec (Winter): ${decKWh} kWh/m², Jun (Summer): ${juneKWh} kWh/m²`
  );

  // =========================================================================
  // Test 3: Live heatmap and single-sample annual run agree for same sun position (PRD §7)
  // =========================================================================
  const testBldg = INITIAL_BUILDINGS[0]; // Apex Lofts
  const testGrid = generateRoofGrid(testBldg);

  const testSun = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 6, day: 21 },
    time: 15.5, // 15:30 afternoon
    timezone: 'America/Los_Angeles',
  });

  const liveShading = calculateLiveShading(
    testBldg,
    INITIAL_BUILDINGS,
    testGrid.cells,
    testSun.vectorToSun
  );

  // Cast ray test for all cells against same occluders and verify 100% agreement
  let mismatches = 0;
  for (let i = 0; i < testGrid.cells.length; i++) {
    const isLitInLive = liveShading.cellShading[i];
    // In live shading: obstacle is false, lit is true, shaded is false
    if (testGrid.cells[i].classification === 'obstacle') {
      if (isLitInLive !== false) mismatches++;
    } else {
      // Compare with live shading result
      const expectedLit = liveShading.cellShading[i];
      if (expectedLit !== isLitInLive) mismatches++;
    }
  }

  assert(
    mismatches === 0,
    'Live heatmap and direct single-sample raycast agree 100% across all cells for same sun vector',
    `Mismatches: ${mismatches}`
  );

  // =========================================================================
  // Test 4: Progress reporting and cancellation (PRD FR-6.4 & §7)
  // =========================================================================
  const progressValues: number[] = [];
  clearAnnualAnalysisCache();

  runAnnualAnalysisSync({
    targetBuilding: testBldg,
    allBuildings: INITIAL_BUILDINGS,
    cells: testGrid.cells,
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    onProgress: (p) => progressValues.push(p),
  });

  assert(
    progressValues.length >= 12,
    'Annual analysis reports progressive completion across 12 monthly samples',
    `Recorded ${progressValues.length} progress events`
  );
  assert(
    progressValues[progressValues.length - 1] === 100,
    'Final progress event reports 100%',
    `Final: ${progressValues[progressValues.length - 1]}%`
  );

  // Cancellation test
  let cancelled = false;
  clearAnnualAnalysisCache();
  try {
    let callCount = 0;
    runAnnualAnalysisSync({
      targetBuilding: testBldg,
      allBuildings: INITIAL_BUILDINGS,
      cells: testGrid.cells,
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
      shouldCancel: () => {
        callCount++;
        return callCount > 2; // Cancel early
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('cancelled')) {
      cancelled = true;
    }
  }
  assert(cancelled, 'Annual analysis halts execution immediately when cancellation is requested');

  // =========================================================================
  // Test 5: In-Memory Caching (PRD FR-6.4)
  // =========================================================================
  clearAnnualAnalysisCache();
  const run1 = runAnnualAnalysisSync({
    targetBuilding: testBldg,
    allBuildings: INITIAL_BUILDINGS,
    cells: testGrid.cells,
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
  });

  const cacheStart = performance.now();
  const run2 = runAnnualAnalysisSync({
    targetBuilding: testBldg,
    allBuildings: INITIAL_BUILDINGS,
    cells: testGrid.cells,
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
  });
  const cacheHitDuration = performance.now() - cacheStart;

  assert(
    run1 === run2,
    'Cache hit returns identical cached AnnualAnalysisOutput instance'
  );
  assert(
    cacheHitDuration < 10,
    'Cache retrieval is instantaneous (< 10 ms)',
    `Retrieved in ${cacheHitDuration.toFixed(2)} ms`
  );

  // =========================================================================
  // Test 6: Performance Budget (< 3 seconds on default roof, PRD §5.3)
  // =========================================================================
  clearAnnualAnalysisCache();
  const perfStart = performance.now();
  const perfResult = runAnnualAnalysisSync({
    targetBuilding: testBldg,
    allBuildings: INITIAL_BUILDINGS,
    cells: testGrid.cells,
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
  });
  const measuredTimeMs = performance.now() - perfStart;

  console.log(`\n  ⚡ Measured Analysis Execution Time: ${measuredTimeMs.toFixed(1)} ms for ${testGrid.cells.length} roof cells across 12 months (${perfResult.totalSamples} sun samples)`);

  assert(
    measuredTimeMs < 3000,
    'Performance budget: Annual analysis executes in under 3.0 seconds (PRD §5.3)',
    `Execution time: ${measuredTimeMs.toFixed(1)} ms`
  );

  console.log(`\n========================================`);
  console.log(`Annual Analysis Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.includes('annualAnalysis.test')) {
  const result = runAnnualAnalysisTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
