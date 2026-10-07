import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { calculateEnergyProfile } from '../calculations/energy';
import { calculateFinancials } from '../calculations/financial';
import { calculateEmissions } from '../calculations/emissions';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { PANEL_TYPES } from '../data/panelTypes';
import { generateRoofGrid } from '../simulation/roofGrid';
import { analyzeRoofExposure } from '../simulation/shadowRaycaster';
import { calculateSolarMetrics } from '../simulation/suitability';
import { placeSolarPanels } from '../optimization/panelPlacement';
import { runOptimization } from '../optimization/optimizationEngine';
import { generateSolarRecommendation } from '../calculations/recommendation';

function runUnitTests() {
  console.log('🧪 Starting deterministic unit test suite for RoofRay...\n');

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

  // Test 1: Unit Conversions
  const testAreaM2 = 250;
  const sqft = testAreaM2 * SIMULATION_ASSUMPTIONS.sqMetersToSqFeet;
  assert(Math.abs(sqft - 2690.975) < 0.1, 'Unit Conversion: 250 m² to sqft');

  // Test 2: Grid Generation & Area Integrity
  const testBldg = INITIAL_BUILDINGS[0]; // Apex Lofts: 15m x 18m = 270 m²
  const expectedTotalRoof = testBldg.width * testBldg.length;
  assert(expectedTotalRoof === 270, 'Building dimension check: 15m x 18m = 270 m²');

  const grid = generateRoofGrid(testBldg);
  assert(grid.cells.length > 0, `Grid cells generated: ${grid.cells.length} cells`);

  // Test 3: Shadow Raycasting Simulation
  const analyzedCells = analyzeRoofExposure(testBldg, INITIAL_BUILDINGS, grid.cells);
  assert(analyzedCells.length === grid.cells.length, 'Analyzed cells count matches grid');

  const metrics = calculateSolarMetrics(testBldg, analyzedCells, grid.cols, grid.rows, grid.cellWidth, grid.cellLength);
  assert(metrics.totalRoofArea === 270, 'Metrics: Total roof area matches expected');
  assert(metrics.availableRoofArea + metrics.obstacleArea >= metrics.totalRoofArea - 0.5, 'Area Invariant: Available + Obstacle ~= Total');
  assert(metrics.recommendedInstallationArea <= metrics.availableRoofArea, 'Area Invariant: Recommended <= Available');

  // Test 4: Automatic Panel Placement
  const panelType = PANEL_TYPES[0]; // 400W
  const placement = placeSolarPanels(testBldg, analyzedCells, panelType);
  assert(placement.panels.length > 0, `Panels placed: ${placement.panels.length}`);
  assert(placement.maxPossiblePanels >= placement.panels.length, 'Placed count <= Max possible');

  // Check boundary constraints on placed panels
  let withinBounds = true;
  for (const p of placement.panels) {
    const halfW = testBldg.width / 2;
    const halfL = testBldg.length / 2;
    if (
      p.localX - p.width / 2 < -halfW ||
      p.localX + p.width / 2 > halfW ||
      p.localZ - p.length / 2 < -halfL ||
      p.localZ + p.length / 2 > halfL
    ) {
      withinBounds = false;
    }
  }
  assert(withinBounds, 'All panels strictly reside inside roof perimeter');

  // Test 5: Energy Generation & Coverage
  const monthlyKWh = 800;
  const energy = calculateEnergyProfile(monthlyKWh, placement.panels, panelType);
  assert(energy.annualConsumptionKWh === 9600, 'Energy: Annual consumption is monthly * 12');
  assert(energy.installedCapacityKW > 0, `Energy: Capacity is ${energy.installedCapacityKW} kW`);
  assert(energy.annualGenerationKWh > 0, `Energy: Annual generation is ${energy.annualGenerationKWh} kWh`);
  assert(energy.solarCoveragePercent >= 0 && energy.solarCoveragePercent <= 100, 'Energy: Coverage capped at 100%');

  // Test 6: Financial Calculations
  const financial = calculateFinancials(
    energy.installedCapacityKW,
    energy.panelCount,
    panelType,
    energy.annualGenerationKWh,
    energy.annualConsumptionKWh
  );
  assert(financial.totalSystemCost > 0, `Financial: Total system cost is $${financial.totalSystemCost}`);
  assert(financial.annualSavingsUSD > 0, `Financial: Annual savings is $${financial.annualSavingsUSD}`);
  assert(financial.paybackYears !== null && financial.paybackYears > 0, `Financial: Payback is ${financial.paybackYears} years`);

  // Test 7: Emissions
  const emissions = calculateEmissions(energy.annualGenerationKWh);
  assert(emissions.annualCO2ReductionKg > 0, `Emissions: ${emissions.annualCO2ReductionKg} kg CO2/yr`);
  assert(emissions.annualCO2ReductionTonnes > 0, `Emissions: ${emissions.annualCO2ReductionTonnes} tonnes CO2/yr`);

  // Test 8: Optimization Modes
  const optNeed = runOptimization(testBldg, metrics, panelType, monthlyKWh, 'need');
  const optMax = runOptimization(testBldg, metrics, panelType, monthlyKWh, 'max_generation');
  const optLow = runOptimization(testBldg, metrics, panelType, monthlyKWh, 'lowest_cost');
  const optBal = runOptimization(testBldg, metrics, panelType, monthlyKWh, 'balanced');

  assert(optMax.placedPanels.length >= optNeed.placedPanels.length, 'Optimization: Max gen >= Need panels');
  assert(optLow.placedPanels.length <= optMax.placedPanels.length, 'Optimization: Lowest cost <= Max gen panels');
  assert(optBal.placedPanels.length > 0, 'Optimization: Balanced mode placed panels');

  // Test 9: Recommendation Narrative
  const rec = generateSolarRecommendation(testBldg, metrics, energy, financial, panelType, 'balanced', placement.maxPossiblePanels);
  assert(rec.headline.includes('kW System Recommended'), 'Recommendation: Headline formatted correctly');
  assert(rec.narrative.length > 50, 'Recommendation: Narrative contains substantive explanation');
  assert(rec.keyPoints.length >= 3, 'Recommendation: Key points provide explainability');

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests();
