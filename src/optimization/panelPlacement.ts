import { Building, PanelType, PlacedPanel, RoofCell, PanelOrientation } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

export interface PlacementCandidate {
  localX: number;
  localZ: number;
  width: number;
  length: number;
  orientation: PanelOrientation;
  exposureScore: number;
  coveredCellsCount: number;
}

export interface PlacementResult {
  panels: PlacedPanel[];
  maxPossiblePanels: number;
  chosenOrientation: PanelOrientation;
  totalCapacityKW: number;
  averageExposureScore: number;
}

/**
 * Checks if a candidate panel box intersects with any roof obstacle (including buffer margin).
 */
function isPanelBlockedByObstacles(
  candidateMinX: number,
  candidateMaxX: number,
  candidateMinZ: number,
  candidateMaxZ: number,
  building: Building,
  buffer: number = SIMULATION_ASSUMPTIONS.obstacleBufferMargin
): boolean {
  for (const obs of building.roofObstacles) {
    const obsMinX = obs.relX - obs.width / 2 - buffer;
    const obsMaxX = obs.relX + obs.width / 2 + buffer;
    const obsMinZ = obs.relZ - obs.length / 2 - buffer;
    const obsMaxZ = obs.relZ + obs.length / 2 + buffer;

    // AABB intersection test
    const overlaps =
      candidateMinX < obsMaxX &&
      candidateMaxX > obsMinX &&
      candidateMinZ < obsMaxZ &&
      candidateMaxZ > obsMinZ;

    if (overlaps) return true;
  }
  return false;
}

/**
 * Computes average exposure score for cells covered by a candidate panel.
 * If any covered cell is an obstacle or classified as poor, rejects candidate.
 */
function evaluatePanelExposure(
  candidateMinX: number,
  candidateMaxX: number,
  candidateMinZ: number,
  candidateMaxZ: number,
  cells: RoofCell[]
): { isValid: boolean; avgExposure: number; count: number } {
  let sumExposure = 0;
  let count = 0;

  for (const cell of cells) {
    if (
      cell.localX >= candidateMinX &&
      cell.localX <= candidateMaxX &&
      cell.localZ >= candidateMinZ &&
      cell.localZ <= candidateMaxZ
    ) {
      if (cell.classification === 'obstacle' || cell.exposureScore < SIMULATION_ASSUMPTIONS.minimumViableExposureScore) {
        return { isValid: false, avgExposure: 0, count: 0 };
      }
      sumExposure += cell.exposureScore;
      count++;
    }
  }

  // If no cells are found under panel, fallback check
  if (count === 0) return { isValid: false, avgExposure: 0, count: 0 };

  const avgExposure = sumExposure / count;
  return { isValid: true, avgExposure, count };
}

/**
 * Generates all valid candidate panel slots for a given orientation.
 */
function generateCandidatesForOrientation(
  building: Building,
  cells: RoofCell[],
  panelType: PanelType,
  orientation: PanelOrientation
): PlacementCandidate[] {
  const panelW = orientation === 'portrait' ? panelType.width : panelType.length;
  const panelL = orientation === 'portrait' ? panelType.length : panelType.width;

  const margin = SIMULATION_ASSUMPTIONS.roofEdgeMargin;
  const gapX = SIMULATION_ASSUMPTIONS.panelSpacingX;
  const gapZ = SIMULATION_ASSUMPTIONS.panelSpacingZ;

  const usableMinX = -building.width / 2 + margin;
  const usableMaxX = building.width / 2 - margin;
  const usableMinZ = -building.length / 2 + margin;
  const usableMaxZ = building.length / 2 - margin;

  const candidates: PlacementCandidate[] = [];

  // Iterate across grid from South to North, West to East
  for (let z = usableMinZ; z + panelL <= usableMaxZ + 0.01; z += panelL + gapZ) {
    for (let x = usableMinX; x + panelW <= usableMaxX + 0.01; x += panelW + gapX) {
      const minX = x;
      const maxX = x + panelW;
      const minZ = z;
      const maxZ = z + panelL;

      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // 1. Check obstacle bounding boxes
      if (isPanelBlockedByObstacles(minX, maxX, minZ, maxZ, building)) {
        continue;
      }

      // 2. Check solar exposure over covered cells
      const { isValid, avgExposure, count } = evaluatePanelExposure(minX, maxX, minZ, maxZ, cells);
      if (!isValid) {
        continue;
      }

      candidates.push({
        localX: centerX,
        localZ: centerZ,
        width: panelW,
        length: panelL,
        orientation,
        exposureScore: Math.round(avgExposure * 100) / 100,
        coveredCellsCount: count,
      });
    }
  }

  // Sort candidates by highest solar exposure first (greedy optimal ranking)
  candidates.sort((a, b) => b.exposureScore - a.exposureScore);

  return candidates;
}

/**
 * Automatically places solar panels on the rooftop.
 * Compares portrait and landscape layouts, and clamps to targetPanelCount if specified.
 */
export function placeSolarPanels(
  building: Building,
  cells: RoofCell[],
  panelType: PanelType,
  targetPanelCount?: number,
  preferredOrientation?: PanelOrientation
): PlacementResult {
  const portraitCandidates = generateCandidatesForOrientation(building, cells, panelType, 'portrait');
  const landscapeCandidates = generateCandidatesForOrientation(building, cells, panelType, 'landscape');

  let chosenOrientation: PanelOrientation = preferredOrientation || 'portrait';
  let candidates = portraitCandidates;

  if (!preferredOrientation) {
    // If target count is specified, choose orientation that achieves target with higher average exposure.
    // Otherwise, choose orientation that fits more total panels.
    if (targetPanelCount !== undefined) {
      const portraitMeetsTarget = portraitCandidates.length >= targetPanelCount;
      const landscapeMeetsTarget = landscapeCandidates.length >= targetPanelCount;

      if (landscapeMeetsTarget && !portraitMeetsTarget) {
        chosenOrientation = 'landscape';
        candidates = landscapeCandidates;
      } else if (portraitMeetsTarget && !landscapeMeetsTarget) {
        chosenOrientation = 'portrait';
        candidates = portraitCandidates;
      } else {
        // Both meet target or neither does: compare average exposure of top target panels
        const count = Math.min(targetPanelCount, Math.min(portraitCandidates.length, landscapeCandidates.length));
        const avgP = portraitCandidates.slice(0, count).reduce((sum, c) => sum + c.exposureScore, 0) / (count || 1);
        const avgL = landscapeCandidates.slice(0, count).reduce((sum, c) => sum + c.exposureScore, 0) / (count || 1);
        if (avgL > avgP) {
          chosenOrientation = 'landscape';
          candidates = landscapeCandidates;
        } else {
          chosenOrientation = 'portrait';
          candidates = portraitCandidates;
        }
      }
    } else {
      if (landscapeCandidates.length > portraitCandidates.length) {
        chosenOrientation = 'landscape';
        candidates = landscapeCandidates;
      } else {
        chosenOrientation = 'portrait';
        candidates = portraitCandidates;
      }
    }
  } else {
    candidates = preferredOrientation === 'landscape' ? landscapeCandidates : portraitCandidates;
  }

  const maxPossiblePanels = candidates.length;
  const countToPlace = targetPanelCount !== undefined
    ? Math.min(targetPanelCount, maxPossiblePanels)
    : maxPossiblePanels;

  const selectedCandidates = candidates.slice(0, countToPlace);

  const placedPanels: PlacedPanel[] = selectedCandidates.map((cand, index) => ({
    id: `panel-${building.id}-${index + 1}`,
    gridCol: index,
    gridRow: 0,
    localX: cand.localX,
    localZ: cand.localZ,
    width: cand.width,
    length: cand.length,
    orientation: cand.orientation,
    tiltDegrees: 10, // 10° maintenance self-cleaning tilt toward south
    wattage: panelType.wattage,
    exposureScore: cand.exposureScore,
  }));

  const totalCapacityKW = Math.round((placedPanels.length * panelType.wattage) / 10) / 100;
  const averageExposureScore = placedPanels.length > 0
    ? Math.round((placedPanels.reduce((sum, p) => sum + p.exposureScore, 0) / placedPanels.length) * 100) / 100
    : 0;

  return {
    panels: placedPanels,
    maxPossiblePanels,
    chosenOrientation,
    totalCapacityKW,
    averageExposureScore,
  };
}
