/**
 * Manual Solar Panel Placement & Spatial Validation Engine (PRD FR-7).
 * Pure TypeScript implementation with zero Three.js or React imports.
 *
 * Handles grid snapping, obstacle/setback/overlap collision detection,
 * exposure scoring, best-spot ranking, and area filling.
 */

import { Building, PanelType, PlacedPanel, RoofCell, PanelOrientation } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { AnnualAnalysisOutput } from '../simulation/annualAnalysis';

export const MANUAL_PLACEMENT_CONSTANTS = {
  roofSetbackMargin: 0.8,      // 0.8m perimeter safety setback (PRD FR-7.6)
  obstacleClearanceMargin: 0.5, // 0.5m clearance around obstacles (PRD FR-7.6)
  gridSnapResolution: 0.5,     // 0.5m default grid snap
  minPanelSpacing: 0.05,       // 0.05m minimum physical spacing between panels
  lowExposureThreshold: 0.60,  // 60% exposure threshold warning (PRD FR-7.6)
  highExposureThreshold: 0.80, // 80% high exposure threshold (PRD FR-7.2)
  panelTiltDeg: 10,            // 10° maintenance self-cleaning tilt toward south
};

export interface PanelBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export type RejectionReason =
  | 'outside_setback'
  | 'obstacle_collision'
  | 'panel_collision';

export interface ValidationResult {
  isValid: boolean;
  rejectionReason?: RejectionReason;
  rejectionDetail?: string;
  hasWarning?: boolean;
  warningDetail?: string;
  exposureScore: number; // 0.0 to 1.0
  annualKWh: number;     // Annual kWh generation for this specific panel
  isLitNow: boolean;     // Whether cell is lit in current live shading pass
}

export interface CandidateSlot {
  localX: number;
  localZ: number;
  width: number;
  length: number;
  orientation: PanelOrientation;
  exposureScore: number;
  annualKWh: number;
  isValid: boolean;
  rejectionReason?: RejectionReason;
}

/**
 * Snaps a local rooftop coordinate (localX, localZ) to the snapping grid.
 */
export function snapToGrid(
  coord: number,
  resolution: number = MANUAL_PLACEMENT_CONSTANTS.gridSnapResolution
): number {
  return Math.round(coord / resolution) * resolution;
}

/**
 * Computes axis-aligned bounding box for a panel.
 */
export function getPanelBounds(
  localX: number,
  localZ: number,
  width: number,
  length: number
): PanelBounds {
  return {
    minX: localX - width / 2,
    maxX: localX + width / 2,
    minZ: localZ - length / 2,
    maxZ: localZ + length / 2,
  };
}

/**
 * Tests if two 2D axis-aligned bounding boxes overlap (with optional margin).
 */
export function doBoxesOverlap(
  a: PanelBounds,
  b: PanelBounds,
  margin: number = 0
): boolean {
  return (
    a.minX < b.maxX + margin &&
    a.maxX > b.minX - margin &&
    a.minZ < b.maxZ + margin &&
    a.maxZ > b.minZ - margin
  );
}

/**
 * Evaluates the annual exposure score and live illumination for a panel given its bounding box.
 */
export function evaluatePanelSolarPotential(
  bounds: PanelBounds,
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[]
): { exposureScore: number; annualKWh: number; isLitNow: boolean } {
  let sumScore = 0;
  let count = 0;
  let litCount = 0;
  let annualKWhPerM2Sum = 0;

  const numCells = cells.length;
  for (let i = 0; i < numCells; i++) {
    const cell = cells[i];
    if (
      cell.localX >= bounds.minX &&
      cell.localX <= bounds.maxX &&
      cell.localZ >= bounds.minZ &&
      cell.localZ <= bounds.maxZ
    ) {
      count++;

      // Check annual analysis cell first if available
      if (annualAnalysis && annualAnalysis.cells[i]) {
        const aCell = annualAnalysis.cells[i];
        sumScore += aCell.annualExposureScore;
        annualKWhPerM2Sum += aCell.annualKWhPerM2;
      } else {
        sumScore += cell.exposureScore;
        annualKWhPerM2Sum += cell.exposureScore * 1600; // Fallback baseline
      }

      if (liveShadingCells && liveShadingCells[i]) {
        litCount++;
      }
    }
  }

  const avgExposure = count > 0 ? sumScore / count : 0.85;
  const avgKWhPerM2 = count > 0 ? annualKWhPerM2Sum / count : 1500;
  const panelArea = (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);

  // Annual yield = Panel Area (m²) * Insolation (kWh/m²/yr) * System Efficiency (~18%)
  const efficiency = 0.18;
  const annualKWh = Math.round(panelArea * avgKWhPerM2 * efficiency);
  const isLitNow = count > 0 ? litCount / count >= 0.5 : true;

  return {
    exposureScore: Math.round(avgExposure * 1000) / 1000,
    annualKWh,
    isLitNow,
  };
}

/**
 * Validates whether a candidate panel can be placed at a given position on the roof.
 * Enforces PRD FR-7.6:
 *  - 0.8m perimeter setback
 *  - 0.5m obstacle clearance
 *  - No overlap with existing panels
 *  - <60% exposure warning
 */
export function validatePanelPlacement(
  candidate: {
    localX: number;
    localZ: number;
    width: number;
    length: number;
    id?: string;
  },
  building: Building,
  existingPanels: readonly PlacedPanel[],
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[]
): ValidationResult {
  const bounds = getPanelBounds(
    candidate.localX,
    candidate.localZ,
    candidate.width,
    candidate.length
  );

  const setback = MANUAL_PLACEMENT_CONSTANTS.roofSetbackMargin;
  const halfW = building.width / 2;
  const halfL = building.length / 2;

  // 1. Perimeter setback validation (0.8m from roof edges)
  if (
    bounds.minX < -halfW + setback ||
    bounds.maxX > halfW - setback ||
    bounds.minZ < -halfL + setback ||
    bounds.maxZ > halfL - setback
  ) {
    return {
      isValid: false,
      rejectionReason: 'outside_setback',
      rejectionDetail: `Inside ${setback}m roof perimeter setback or outside roof boundary.`,
      exposureScore: 0,
      annualKWh: 0,
      isLitNow: false,
    };
  }

  // 2. Rooftop obstacle clearance validation (0.5m clearance buffer)
  const obsClearance = MANUAL_PLACEMENT_CONSTANTS.obstacleClearanceMargin;
  for (const obs of building.roofObstacles) {
    const obsBounds: PanelBounds = {
      minX: obs.relX - obs.width / 2,
      maxX: obs.relX + obs.width / 2,
      minZ: obs.relZ - obs.length / 2,
      maxZ: obs.relZ + obs.length / 2,
    };

    if (doBoxesOverlap(bounds, obsBounds, obsClearance)) {
      return {
        isValid: false,
        rejectionReason: 'obstacle_collision',
        rejectionDetail: `Within ${obsClearance}m clearance buffer of ${obs.name || obs.type}.`,
        exposureScore: 0,
        annualKWh: 0,
        isLitNow: false,
      };
    }
  }

  // 3. Overlap with other placed panels
  for (const panel of existingPanels) {
    if (candidate.id && panel.id === candidate.id) {
      continue; // Skip self when dragging / updating
    }

    const panelBounds = getPanelBounds(
      panel.localX,
      panel.localZ,
      panel.width,
      panel.length
    );

    if (doBoxesOverlap(bounds, panelBounds, -0.01)) {
      return {
        isValid: false,
        rejectionReason: 'panel_collision',
        rejectionDetail: `Collides or overlaps with existing panel (${panel.id}).`,
        exposureScore: 0,
        annualKWh: 0,
        isLitNow: false,
      };
    }
  }

  // 4. Solar exposure evaluation
  const solar = evaluatePanelSolarPotential(bounds, cells, annualAnalysis, liveShadingCells);

  const hasWarning = solar.exposureScore < MANUAL_PLACEMENT_CONSTANTS.lowExposureThreshold;
  const warningDetail = hasWarning
    ? `Low annual solar exposure (${Math.round(solar.exposureScore * 100)}% < 60%). Increased string mismatch risk.`
    : undefined;

  return {
    isValid: true,
    hasWarning,
    warningDetail,
    exposureScore: solar.exposureScore,
    annualKWh: solar.annualKWh,
    isLitNow: solar.isLitNow,
  };
}

/**
 * Scans candidate slots across a specified rectangle or the entire usable roof,
 * filtering and returning valid placement slots.
 */
export function getAvailablePlacementSlots(
  building: Building,
  existingPanels: readonly PlacedPanel[],
  panelType: PanelType,
  orientation: PanelOrientation,
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[],
  boundsBox?: PanelBounds
): CandidateSlot[] {
  const panelW = orientation === 'portrait' ? panelType.width : panelType.length;
  const panelL = orientation === 'portrait' ? panelType.length : panelType.width;

  const setback = MANUAL_PLACEMENT_CONSTANTS.roofSetbackMargin;
  const gapX = SIMULATION_ASSUMPTIONS.panelSpacingX;
  const gapZ = SIMULATION_ASSUMPTIONS.panelSpacingZ;

  const minX = boundsBox ? Math.max(boundsBox.minX, -building.width / 2 + setback) : -building.width / 2 + setback;
  const maxX = boundsBox ? Math.min(boundsBox.maxX, building.width / 2 - setback) : building.width / 2 - setback;
  const minZ = boundsBox ? Math.max(boundsBox.minZ, -building.length / 2 + setback) : -building.length / 2 + setback;
  const maxZ = boundsBox ? Math.min(boundsBox.maxZ, building.length / 2 - setback) : building.length / 2 - setback;

  const slots: CandidateSlot[] = [];

  for (let z = minZ + panelL / 2; z + panelL / 2 <= maxZ + 0.01; z += panelL + gapZ) {
    for (let x = minX + panelW / 2; x + panelW / 2 <= maxX + 0.01; x += panelW + gapX) {
      const snapX = Math.round(x * 100) / 100;
      const snapZ = Math.round(z * 100) / 100;

      const validation = validatePanelPlacement(
        { localX: snapX, localZ: snapZ, width: panelW, length: panelL },
        building,
        existingPanels,
        cells,
        annualAnalysis,
        liveShadingCells
      );

      if (validation.isValid) {
        slots.push({
          localX: snapX,
          localZ: snapZ,
          width: panelW,
          length: panelL,
          orientation,
          exposureScore: validation.exposureScore,
          annualKWh: validation.annualKWh,
          isValid: true,
        });
      }
    }
  }

  return slots;
}

/**
 * Finds and ranks remaining valid spots on the rooftop by annual yield (FR-7.7).
 */
export function getBestRemainingSpots(
  building: Building,
  existingPanels: readonly PlacedPanel[],
  panelType: PanelType,
  orientation: PanelOrientation,
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[],
  limit: number = 10
): CandidateSlot[] {
  const slots = getAvailablePlacementSlots(
    building,
    existingPanels,
    panelType,
    orientation,
    cells,
    annualAnalysis,
    liveShadingCells
  );

  // Sort descending by highest exposure score then annual kWh
  slots.sort((a, b) => b.exposureScore !== a.exposureScore ? b.exposureScore - a.exposureScore : b.annualKWh - a.annualKWh);

  return slots.slice(0, limit);
}

/**
 * Suggests the single best remaining placement spot (FR-7.7).
 */
export function suggestNextPanel(
  building: Building,
  existingPanels: readonly PlacedPanel[],
  panelType: PanelType,
  orientation: PanelOrientation,
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[]
): PlacedPanel | null {
  const bestSlots = getBestRemainingSpots(
    building,
    existingPanels,
    panelType,
    orientation,
    cells,
    annualAnalysis,
    liveShadingCells,
    1
  );

  if (bestSlots.length === 0) return null;

  const best = bestSlots[0];
  const newIndex = existingPanels.length + 1;

  return {
    id: `manual-panel-${Date.now()}-${newIndex}`,
    gridCol: 0,
    gridRow: 0,
    localX: best.localX,
    localZ: best.localZ,
    width: best.width,
    length: best.length,
    orientation: best.orientation,
    tiltDegrees: MANUAL_PLACEMENT_CONSTANTS.panelTiltDeg,
    wattage: panelType.wattage,
    exposureScore: best.exposureScore,
  };
}

/**
 * Fills an area with solar panels, skipping invalid spots (FR-7.5).
 */
export function fillAreaWithPanels(
  boundsBox: PanelBounds,
  building: Building,
  existingPanels: readonly PlacedPanel[],
  panelType: PanelType,
  orientation: PanelOrientation,
  cells: readonly RoofCell[],
  annualAnalysis?: AnnualAnalysisOutput | null,
  liveShadingCells?: readonly boolean[]
): PlacedPanel[] {
  const slots = getAvailablePlacementSlots(
    building,
    existingPanels,
    panelType,
    orientation,
    cells,
    annualAnalysis,
    liveShadingCells,
    boundsBox
  );

  const placed: PlacedPanel[] = [...existingPanels];
  const newlyPlaced: PlacedPanel[] = [];

  for (const slot of slots) {
    // Check collision against previously placed in this same fill operation
    const validation = validatePanelPlacement(
      { localX: slot.localX, localZ: slot.localZ, width: slot.width, length: slot.length },
      building,
      placed,
      cells,
      annualAnalysis,
      liveShadingCells
    );

    if (validation.isValid) {
      const p: PlacedPanel = {
        id: `manual-panel-${Date.now()}-${placed.length + 1}`,
        gridCol: 0,
        gridRow: 0,
        localX: slot.localX,
        localZ: slot.localZ,
        width: slot.width,
        length: slot.length,
        orientation: slot.orientation,
        tiltDegrees: MANUAL_PLACEMENT_CONSTANTS.panelTiltDeg,
        wattage: panelType.wattage,
        exposureScore: slot.exposureScore,
      };
      placed.push(p);
      newlyPlaced.push(p);
    }
  }

  return newlyPlaced;
}
