import { INITIAL_BUILDINGS } from '../src/data/buildings';
import { calculateLiveShading } from '../src/simulation/shadowRaycaster';
import { generateRoofGrid } from '../src/simulation/roofGrid';
import { calculateNOAASunPosition } from '../src/simulation/sunPosition';

export function runFixedBuildingsTests(): { passed: number; failed: number } {
  console.log('🏛️  Starting Fixed Buildings & Live Shading Test Suite...\n');

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
  // Test 1: Immutability of INITIAL_BUILDINGS (FR-1.1, Acceptance Criteria)
  // Assert that buildings, obstacles, and position arrays are frozen.
  // =========================================================================
  const testBldg = INITIAL_BUILDINGS[0];
  assert(Object.isFrozen(INITIAL_BUILDINGS), 'INITIAL_BUILDINGS array is deeply frozen with Object.freeze');
  assert(Object.isFrozen(testBldg), 'Building object is frozen');
  assert(Object.isFrozen(testBldg.position), 'Building position tuple is frozen');
  assert(Object.isFrozen(testBldg.roofObstacles), 'Building roofObstacles array is frozen');
  if (testBldg.roofObstacles.length > 0) {
    assert(Object.isFrozen(testBldg.roofObstacles[0]), 'Individual roof obstacle is frozen');
  }

  let mutationPrevented = false;
  try {
    // Attempt runtime mutation in strict mode
    (testBldg as any).width = 999;
  } catch {
    mutationPrevented = true;
  }
  // In non-strict fallback, check that property was not mutated
  if (!mutationPrevented) {
    mutationPrevented = testBldg.width !== 999;
  }
  assert(mutationPrevented, 'Mutating building width is prevented at runtime');

  // =========================================================================
  // Test 2: Live Shading Raycaster Tests (FR-5.1)
  // Apex Lofts (-16, 0, -6) sits northwest of the 26m Meridian Tower (-16, 0, 16).
  // When sun is in the south (e.g. azimuth 180° / South), Meridian Tower casts shadow northward.
  // =========================================================================
  const grid = generateRoofGrid(testBldg);
  assert(grid.cells.length > 0, `Roof grid has ${grid.cells.length} cells`);

  // Sun at midday zenith in SF on Summer Solstice (high sun, low shadow)
  const summerNoonSun = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 13, minute: 11 },
    timezone: 'America/Los_Angeles',
  });

  const summerShading = calculateLiveShading(testBldg, INITIAL_BUILDINGS, grid.cells, summerNoonSun.vectorToSun);
  assert(summerShading.isSunUp === true, 'Summer noon detects sun is above horizon');
  assert(summerShading.litCellsCount > 0, `Summer noon: ${summerShading.litCellsCount} cells lit`);
  assert(summerShading.litRatio > 0.7, `Summer noon high sun has high lit ratio (${Math.round(summerShading.litRatio * 100)}%)`);

  // Winter low afternoon sun in SF on Winter Solstice (sun at ~15:00 has low elevation ~15°)
  const winterAfternoonSun = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 12, day: 21 },
    time: { hour: 15, minute: 30 },
    timezone: 'America/Los_Angeles',
  });

  const winterShading = calculateLiveShading(testBldg, INITIAL_BUILDINGS, grid.cells, winterAfternoonSun.vectorToSun);
  assert(
    winterShading.litCellsCount < summerShading.litCellsCount,
    'Winter low sun casts longer shadows than summer high sun',
    `Winter lit: ${winterShading.litCellsCount}, Summer lit: ${summerShading.litCellsCount}`
  );

  // Night test (elevation < 0)
  const nightSun = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 23, minute: 0 },
    timezone: 'America/Los_Angeles',
  });

  const nightShading = calculateLiveShading(testBldg, INITIAL_BUILDINGS, grid.cells, nightSun.vectorToSun);
  assert(nightShading.isSunUp === false, 'Night shading correctly detects sun is down');
  assert(nightShading.litCellsCount === 0, 'Night shading marks 0 cells lit');
  assert(nightShading.litRatio === 0, 'Night shading has 0% lit ratio');

  console.log(`\n========================================`);
  console.log(`Fixed Buildings Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.includes('fixedBuildings.test')) {
  const result = runFixedBuildingsTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
