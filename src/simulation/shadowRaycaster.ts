/**
 * Solar raycasting and shadow analysis engine.
 * Pure TypeScript implementation with zero Three.js or React imports.
 * Uses high-performance branchless slab AABB ray intersection tests.
 */

import { Building, RoofCell, CellExposureClassification, LiveShadingResult } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { calculateSunPosition } from './sunPosition';

export interface OccluderBox {
  readonly id: string;
  readonly name: string;
  readonly minX: number;
  readonly minY: number;
  readonly minZ: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly maxZ: number;
}

/**
 * Builds axis-aligned bounding boxes (AABBs) for all occluders in the neighborhood:
 * - Neighboring buildings (full structure volume)
 * - Rooftop obstacles on neighbor buildings
 * - Rooftop obstacles on the target building (cast shadows on own roof)
 */
export function buildNeighborhoodOccluders(
  buildings: readonly Building[],
  targetBuildingId: string
): OccluderBox[] {
  const occluders: OccluderBox[] = [];

  for (let b = 0; b < buildings.length; b++) {
    const bldg = buildings[b];
    const isTarget = bldg.id === targetBuildingId;
    const [bx, by, bz] = bldg.position;

    if (!isTarget) {
      // Neighboring building volume
      occluders.push({
        id: `bldg-${bldg.id}`,
        name: bldg.name,
        minX: bx - bldg.width / 2,
        minY: by,
        minZ: bz - bldg.length / 2,
        maxX: bx + bldg.width / 2,
        maxY: by + bldg.height,
        maxZ: bz + bldg.length / 2,
      });

      // Rooftop obstacles on neighboring building
      const roofTopY = by + bldg.height;
      for (let o = 0; o < bldg.roofObstacles.length; o++) {
        const obs = bldg.roofObstacles[o];
        const obsWorldX = bx + obs.relX;
        const obsWorldZ = bz + obs.relZ;
        occluders.push({
          id: `neighbor-obs-${bldg.id}-${obs.id}`,
          name: `${bldg.name} - ${obs.name}`,
          minX: obsWorldX - obs.width / 2,
          minY: roofTopY,
          minZ: obsWorldZ - obs.length / 2,
          maxX: obsWorldX + obs.width / 2,
          maxY: roofTopY + obs.height,
          maxZ: obsWorldZ + obs.length / 2,
        });
      }
    } else {
      // For target building, its own rooftop obstacles cast shadows on its roof plane
      const roofTopY = by + bldg.height;
      for (let o = 0; o < bldg.roofObstacles.length; o++) {
        const obs = bldg.roofObstacles[o];
        const obsWorldX = bx + obs.relX;
        const obsWorldZ = bz + obs.relZ;
        occluders.push({
          id: `target-obs-${obs.id}`,
          name: obs.name,
          minX: obsWorldX - obs.width / 2,
          minY: roofTopY,
          minZ: obsWorldZ - obs.length / 2,
          maxX: obsWorldX + obs.width / 2,
          maxY: roofTopY + obs.height,
          maxZ: obsWorldZ + obs.length / 2,
        });
      }
    }
  }

  return occluders;
}

/**
 * Fast branchless slab ray-AABB intersection test.
 * Returns true if ray (origin, dir) intersects box within [minDist, maxDist].
 */
export function intersectRayBox(
  ox: number,
  oy: number,
  oz: number,
  invDx: number,
  invDy: number,
  invDz: number,
  box: OccluderBox,
  minDist: number = 0.05,
  maxDist: number = 500.0
): boolean {
  let t1 = (box.minX - ox) * invDx;
  let t2 = (box.maxX - ox) * invDx;
  if (t1 > t2) {
    const tmp = t1;
    t1 = t2;
    t2 = tmp;
  }

  let t3 = (box.minY - oy) * invDy;
  let t4 = (box.maxY - oy) * invDy;
  if (t3 > t4) {
    const tmp = t3;
    t3 = t4;
    t4 = tmp;
  }

  const tminY = t1 > t3 ? t1 : t3;
  const tmaxY = t2 < t4 ? t2 : t4;

  if (tminY > tmaxY) return false;

  let t5 = (box.minZ - oz) * invDz;
  let t6 = (box.maxZ - oz) * invDz;
  if (t5 > t6) {
    const tmp = t5;
    t5 = t6;
    t6 = tmp;
  }

  const tmin = tminY > t5 ? tminY : t5;
  const tmax = tmaxY < t6 ? tmaxY : t6;

  if (tmin > tmax) return false;
  return tmax >= minDist && tmin <= maxDist;
}

/**
 * Computes instantaneous live shading for all roof cells of the target building
 * against all neighborhood occluders for a single sun direction vector. (FR-5.1)
 */
export function calculateLiveShading(
  targetBuilding: Building,
  allBuildings: readonly Building[],
  cells: readonly RoofCell[],
  sunVector: readonly [number, number, number]
): LiveShadingResult {
  const isSunUp = sunVector[1] > 0.001; // Sun above horizon
  const totalCells = cells.length;
  const cellShading = new Array<boolean>(totalCells);

  let litCellsCount = 0;
  let shadedCellsCount = 0;
  let obstacleCellsCount = 0;

  if (!isSunUp) {
    // Night: all cells are unlit
    for (let i = 0; i < totalCells; i++) {
      if (cells[i].classification === 'obstacle') {
        obstacleCellsCount++;
      } else {
        shadedCellsCount++;
      }
      cellShading[i] = false;
    }

    return {
      isSunUp: false,
      totalCells,
      litCellsCount: 0,
      shadedCellsCount,
      obstacleCellsCount,
      litRatio: 0,
      cellShading,
    };
  }

  const occluders = buildNeighborhoodOccluders(allBuildings, targetBuilding.id);
  const numOccluders = occluders.length;

  const [dx, dy, dz] = sunVector;
  const invDx = Math.abs(dx) > 1e-9 ? 1.0 / dx : 1e9;
  const invDy = Math.abs(dy) > 1e-9 ? 1.0 / dy : 1e9;
  const invDz = Math.abs(dz) > 1e-9 ? 1.0 / dz : 1e9;

  for (let i = 0; i < totalCells; i++) {
    const cell = cells[i];

    if (cell.classification === 'obstacle') {
      obstacleCellsCount++;
      cellShading[i] = false;
      continue;
    }

    // Origin elevated 0.08m above roof plane to avoid self-intersection
    const ox = cell.worldX;
    const oy = cell.worldY + 0.08;
    const oz = cell.worldZ;

    let isBlocked = false;
    for (let o = 0; o < numOccluders; o++) {
      if (intersectRayBox(ox, oy, oz, invDx, invDy, invDz, occluders[o], 0.05, 500)) {
        isBlocked = true;
        break;
      }
    }

    if (isBlocked) {
      shadedCellsCount++;
      cellShading[i] = false;
    } else {
      litCellsCount++;
      cellShading[i] = true;
    }
  }

  const availableCells = totalCells - obstacleCellsCount;
  const litRatio = availableCells > 0 ? litCellsCount / availableCells : 0;

  return {
    isSunUp: true,
    totalCells,
    litCellsCount,
    shadedCellsCount,
    obstacleCellsCount,
    litRatio: Math.round(litRatio * 100) / 100,
    cellShading,
  };
}

/**
 * Runs multi-sample solar raycasting across the roof grid cells against all neighborhood occluders.
 * Pure TypeScript implementation without Three.js.
 */
export function analyzeRoofExposure(
  targetBuilding: Building,
  allBuildings: readonly Building[],
  cells: readonly RoofCell[],
  sampleTimes: readonly number[] = SIMULATION_ASSUMPTIONS.analysisTimes
): RoofCell[] {
  const occluders = buildNeighborhoodOccluders(allBuildings, targetBuilding.id);
  const numOccluders = occluders.length;

  // Precompute ray directions and inverses for each sample time
  const samples = sampleTimes.map((time) => {
    const sunState = calculateSunPosition(time);
    const [dx, dy, dz] = sunState.vectorToSun;
    return {
      dx,
      dy,
      dz,
      invDx: Math.abs(dx) > 1e-9 ? 1.0 / dx : 1e9,
      invDy: Math.abs(dy) > 1e-9 ? 1.0 / dy : 1e9,
      invDz: Math.abs(dz) > 1e-9 ? 1.0 / dz : 1e9,
    };
  });

  const totalSamples = samples.length;

  return cells.map((cell) => {
    if (cell.classification === 'obstacle') {
      return {
        ...cell,
        exposureScore: 0,
        unblockedSamples: 0,
        totalSamples,
      };
    }

    const ox = cell.worldX;
    const oy = cell.worldY + 0.08;
    const oz = cell.worldZ;

    let unblockedCount = 0;

    for (let s = 0; s < totalSamples; s++) {
      const { invDx, invDy, invDz } = samples[s];

      let isBlocked = false;
      for (let o = 0; o < numOccluders; o++) {
        if (intersectRayBox(ox, oy, oz, invDx, invDy, invDz, occluders[o], 0.05, 500)) {
          isBlocked = true;
          break;
        }
      }

      if (!isBlocked) {
        unblockedCount++;
      }
    }

    const exposureScore = unblockedCount / totalSamples;

    const classification: CellExposureClassification =
      exposureScore >= SIMULATION_ASSUMPTIONS.excellentExposureThreshold
        ? 'excellent'
        : exposureScore >= SIMULATION_ASSUMPTIONS.goodExposureThreshold
        ? 'good'
        : 'poor';

    return {
      ...cell,
      exposureScore,
      unblockedSamples: unblockedCount,
      totalSamples,
      classification,
    };
  });
}
