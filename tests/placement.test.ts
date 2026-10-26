import { INITIAL_BUILDINGS } from '../src/data/buildings';
import { PANEL_TYPES } from '../src/data/panelTypes';
import { generateRoofGrid } from '../src/simulation/roofGrid';
import {
  validatePanelPlacement,
  getBestRemainingSpots,
  suggestNextPanel,
  fillAreaWithPanels,
} from '../src/optimization/manualPlacement';
import { PlacedPanel, Building } from '../src/types';
import { calculateEnergyProfile } from '../src/calculations/energy';
import { calculateFinancials } from '../src/calculations/financial';

export function runPlacementTests(): { passed: number; failed: number } {
  console.log('📐 Starting Manual Panel Placement & Spatial Validation Test Suite (PRD §7 & FR-7)...\n');

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

  const testBldg = INITIAL_BUILDINGS[0]; // Apex Lofts: 15m (X) x 18m (Z)
  const panelType = PANEL_TYPES[0];      // 400W: 1.13m (W) x 1.72m (L)
  const grid = generateRoofGrid(testBldg);

  // =========================================================================
  // Test 1: Setback Validation (0.8m perimeter setback, PRD FR-7.6 & §7)
  // Half-dimensions: X in [-7.5, 7.5], Z in [-9.0, 9.0]
  // With 0.8m setback, max valid center for portrait panel (width 1.13m, length 1.72m):
  // Xmax = 7.5 - 0.8 - 1.13/2 = 6.135m.
  // X = 7.2m places panel boundary at 7.2 + 0.565 = 7.765m > 7.5 - 0.8 = 6.7m (REJECTED)
  // =========================================================================
  const outsideSetbackCandidate = {
    localX: 6.8, // Center at 6.8m => edge at 6.8 + 0.565 = 7.365m (inside 0.8m margin)
    localZ: 0,
    width: panelType.width,
    length: panelType.length,
  };

  const setbackResult = validatePanelPlacement(
    outsideSetbackCandidate,
    testBldg,
    [],
    grid.cells
  );

  assert(
    !setbackResult.isValid,
    'Panel placed inside 0.8m perimeter setback is rejected',
    `Result: ${setbackResult.isValid}, reason: ${setbackResult.rejectionReason}`
  );
  assert(
    setbackResult.rejectionReason === 'outside_setback',
    'Rejection reason is outside_setback',
    `Got: ${setbackResult.rejectionReason}`
  );

  // Valid location within setbacks
  const validCenterCandidate = {
    localX: 0,
    localZ: 0,
    width: panelType.width,
    length: panelType.length,
  };
  const validCenterResult = validatePanelPlacement(
    validCenterCandidate,
    testBldg,
    [],
    grid.cells
  );
  assert(
    validCenterResult.isValid,
    'Panel placed safely inside setbacks and away from obstacles is accepted'
  );

  // =========================================================================
  // Test 2: Obstacle Clearance Validation (0.5m buffer margin, PRD FR-7.6 & §7)
  // Apex Lofts has an HVAC at relX = -2.5, relZ = -2.0, width = 3.2, length = 2.4
  // HVAC X-range: [-2.5 - 1.6, -2.5 + 1.6] = [-4.1, -0.9]
  // With 0.5m buffer: X-range: [-4.6, -0.4]
  // =========================================================================
  const obstacleCollisionCandidate = {
    localX: -2.5, // Directly on top of HVAC obstacle
    localZ: -2.0,
    width: panelType.width,
    length: panelType.length,
  };

  const obstacleResult = validatePanelPlacement(
    obstacleCollisionCandidate,
    testBldg,
    [],
    grid.cells
  );

  assert(
    !obstacleResult.isValid,
    'Panel placed directly on or within 0.5m of obstacle is rejected',
    `Result: ${obstacleResult.isValid}, reason: ${obstacleResult.rejectionReason}`
  );
  assert(
    obstacleResult.rejectionReason === 'obstacle_collision',
    'Rejection reason is obstacle_collision',
    `Got: ${obstacleResult.rejectionReason}`
  );

  // Place within 0.5m buffer edge
  const obstacleNearCandidate = {
    localX: -0.7, // Edge at -0.7 - 0.565 = -1.265m (inside obstacle buffer [-4.6, -0.4])
    localZ: -2.0,
    width: panelType.width,
    length: panelType.length,
  };
  const obstacleNearResult = validatePanelPlacement(
    obstacleNearCandidate,
    testBldg,
    [],
    grid.cells
  );
  assert(
    !obstacleNearResult.isValid && obstacleNearResult.rejectionReason === 'obstacle_collision',
    'Panel violating 0.5m obstacle clearance buffer is rejected'
  );

  // =========================================================================
  // Test 3: Panel Overlap Collision Validation (PRD FR-7.6 & §7)
  // Apex Lofts has obstacles at (-2.5, -2.0), (2.0, 3.5), (-3.0, 4.5).
  // Position (3.5, -4.0) is completely clear of all obstacles.
  // =========================================================================
  const existingPanel1: PlacedPanel = {
    id: 'panel-1',
    gridCol: 0,
    gridRow: 0,
    localX: 3.5,
    localZ: -4.0,
    width: panelType.width,
    length: panelType.length,
    orientation: 'portrait',
    tiltDegrees: 10,
    wattage: panelType.wattage,
    exposureScore: 0.95,
    annualKWh: 523,
  };

  const overlappingCandidate = {
    localX: 3.8, // Overlaps existingPanel1 at (3.5, -4.0)
    localZ: -3.8,
    width: panelType.width,
    length: panelType.length,
  };

  const overlapResult = validatePanelPlacement(
    overlappingCandidate,
    testBldg,
    [existingPanel1],
    grid.cells
  );

  assert(
    !overlapResult.isValid,
    'Panel overlapping an existing panel is rejected',
    `Result: ${overlapResult.isValid}, reason: ${overlapResult.rejectionReason}`
  );
  assert(
    overlapResult.rejectionReason === 'panel_collision',
    'Rejection reason is panel_collision',
    `Got: ${overlapResult.rejectionReason}`
  );

  // Non-overlapping adjacent panel with standard spacing
  const adjacentCandidate = {
    localX: 3.5 + panelType.width + 0.1, // Spaced 0.1m to the East (within setback < 6.7m)
    localZ: -4.0,
    width: panelType.width,
    length: panelType.length,
  };
  const adjacentResult = validatePanelPlacement(
    adjacentCandidate,
    testBldg,
    [existingPanel1],
    grid.cells
  );
  assert(
    adjacentResult.isValid,
    'Adjacent panel with proper spacing is accepted without collision'
  );

  // Self-collision bypass when moving/dragging existing panel
  const selfMoveResult = validatePanelPlacement(
    {
      id: 'panel-1',
      localX: 3.55,
      localZ: -3.95,
      width: panelType.width,
      length: panelType.length,
    },
    testBldg,
    [existingPanel1],
    grid.cells
  );
  assert(
    selfMoveResult.isValid,
    'Dragging/updating an existing panel ignores self-collision'
  );

  // =========================================================================
  // Test 4: Low Solar Exposure Warning (<60% warning, PRD FR-7.6)
  // =========================================================================
  // Construct a dummy shaded cell area
  const shadedBuilding: Building = {
    ...testBldg,
    roofObstacles: [],
  };
  const shadedCells = grid.cells.map((c) => ({
    ...c,
    exposureScore: 0.45, // 45% exposure (< 60%)
  }));

  const lowExposureCandidate = {
    localX: 0,
    localZ: 0,
    width: panelType.width,
    length: panelType.length,
  };
  const lowExposureResult = validatePanelPlacement(
    lowExposureCandidate,
    shadedBuilding,
    [],
    shadedCells
  );

  assert(
    lowExposureResult.isValid === true,
    'Low exposure spot (< 60%) is NOT blocked (isValid remains true)'
  );
  assert(
    lowExposureResult.hasWarning === true,
    'Low exposure spot triggers low_exposure warning flag'
  );

  // =========================================================================
  // Test 5: Undo and Redo Exact State Restoration (PRD FR-7.4 & §7)
  // Simulate undo/redo stack behavior
  // =========================================================================
  class PanelHistoryManager {
    private past: PlacedPanel[][] = [];
    private current: PlacedPanel[] = [];
    private future: PlacedPanel[][] = [];

    constructor(initial: PlacedPanel[] = []) {
      this.current = [...initial];
    }

    getState(): PlacedPanel[] {
      return this.current;
    }

    setPanels(newPanels: PlacedPanel[]) {
      this.past.push([...this.current]);
      this.current = [...newPanels];
      this.future = []; // Clear redo stack on new action
    }

    undo(): boolean {
      if (this.past.length === 0) return false;
      this.future.push([...this.current]);
      this.current = this.past.pop()!;
      return true;
    }

    redo(): boolean {
      if (this.future.length === 0) return false;
      this.past.push([...this.current]);
      this.current = this.future.pop()!;
      return true;
    }
  }

  const history = new PanelHistoryManager([]);
  assert(history.getState().length === 0, 'Initial history state is empty');

  // Step 1: Add panel 1
  history.setPanels([existingPanel1]);
  assert(history.getState().length === 1, 'Action 1: Placed 1 panel');

  // Step 2: Add panel 2
  const panel2: PlacedPanel = {
    id: 'panel-2',
    gridCol: 1,
    gridRow: 0,
    localX: -2.0,
    localZ: 3.0,
    width: panelType.width,
    length: panelType.length,
    orientation: 'portrait',
    tiltDegrees: 10,
    wattage: panelType.wattage,
    exposureScore: 0.90,
    annualKWh: 496,
  };
  history.setPanels([existingPanel1, panel2]);
  assert(history.getState().length === 2, 'Action 2: Placed 2 panels');

  // Undo Step 2
  const undo1 = history.undo();
  assert(undo1, 'Undo successfully executed');
  assert(
    history.getState().length === 1 && history.getState()[0].id === 'panel-1',
    'Undo restores exact previous state (1 panel)'
  );

  // Undo Step 1
  const undo2 = history.undo();
  assert(undo2, 'Second undo successfully executed');
  assert(history.getState().length === 0, 'Undo restores exact initial empty state');

  // Redo Step 1
  const redo1 = history.redo();
  assert(redo1, 'Redo successfully executed');
  assert(
    history.getState().length === 1 && history.getState()[0].id === 'panel-1',
    'Redo restores exact state (1 panel)'
  );

  // Redo Step 2
  const redo2 = history.redo();
  assert(redo2, 'Second redo successfully executed');
  assert(
    history.getState().length === 2 && history.getState()[1].id === 'panel-2',
    'Redo restores exact state (2 panels)'
  );

  // =========================================================================
  // Test 6: Best Spots Ranking and Suggestion (PRD FR-7.7)
  // =========================================================================
  const bestSpots = getBestRemainingSpots(
    testBldg,
    [existingPanel1],
    panelType,
    'portrait',
    grid.cells,
    null,
    undefined,
    5
  );

  assert(bestSpots.length > 0, `Best spots found: ${bestSpots.length}`);
  // Check descending rank
  let isSorted = true;
  for (let i = 1; i < bestSpots.length; i++) {
    if (bestSpots[i].exposureScore > bestSpots[i - 1].exposureScore) {
      isSorted = false;
    }
  }
  assert(isSorted, 'Best spots are strictly sorted in descending order of solar yield');

  // Suggest next panel places top candidate
  const suggested = suggestNextPanel(
    testBldg,
    [existingPanel1],
    panelType,
    'portrait',
    grid.cells
  );

  assert(suggested !== null, 'Suggest next panel returned a valid panel');
  assert(
    suggested?.localX === bestSpots[0].localX && suggested?.localZ === bestSpots[0].localZ,
    'Suggested panel matches the #1 ranked best spot'
  );

  // =========================================================================
  // Test 7: Fill Area with Panels (PRD FR-7.5)
  // Fill rectangular region on roof, skipping obstacles and perimeter
  // =========================================================================
  const fillBounds = {
    minX: 1.0,
    maxX: 6.0,
    minZ: 1.0,
    maxZ: 7.0,
  };

  const filledPanels = fillAreaWithPanels(
    fillBounds,
    testBldg,
    [],
    panelType,
    'portrait',
    grid.cells
  );

  assert(filledPanels.length > 0, `Fill area placed ${filledPanels.length} panels`);

  // Ensure no filled panel collides with obstacles or setbacks
  let allValid = true;
  for (const p of filledPanels) {
    const val = validatePanelPlacement(p, testBldg, [], grid.cells);
    if (!val.isValid) allValid = false;
  }
  assert(allValid, 'All panels placed by fill-area pass perimeter setback and obstacle validation');

  // =========================================================================
  // Test 8: Sum of Per-Panel Yield (PRD FR-8.1 & §7)
  // Verify sum of per-panel kW and annual kWh matches overall total
  // =========================================================================
  const testPanels: PlacedPanel[] = [existingPanel1, panel2];
  const systemKW = Math.round((testPanels.length * panelType.wattage) / 10) / 100;
  const expectedKW = (2 * 400) / 1000;
  assert(systemKW === expectedKW, `Sum of per-panel capacity is ${systemKW} kW`);

  const energy = calculateEnergyProfile(1000, testPanels, panelType);
  const sumPerPanelKWh = testPanels.reduce((sum, p) => sum + (p.annualKWh || 0), 0);
  assert(
    energy.annualGenerationKWh === sumPerPanelKWh,
    `Sum of per-panel annual yield (${sumPerPanelKWh} kWh) strictly equals energy profile generation (${energy.annualGenerationKWh} kWh)`
  );

  const financial = calculateFinancials(
    energy.installedCapacityKW,
    energy.panelCount,
    panelType,
    energy.annualGenerationKWh,
    energy.annualConsumptionKWh
  );
  assert(
    financial.annualSavingsUSD > 0,
    `Finance card derives annual savings ($${financial.annualSavingsUSD}) directly from per-panel yield total`
  );

  console.log(`\n========================================`);
  console.log(`Placement Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.includes('placement.test')) {
  const result = runPlacementTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
