import * as THREE from 'three';
import { Building, RoofCell, CellExposureClassification } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { calculateSunPosition } from './sunPosition';

export interface OccluderBox {
  id: string;
  name: string;
  box: THREE.Box3;
}

/**
 * Builds bounding boxes for all occluders in the neighborhood:
 * - Neighboring buildings
 * - Rooftop obstacles on the target building (cast shadows on own roof)
 * - Rooftop obstacles on other buildings
 */
export function buildNeighborhoodOccluders(
  buildings: Building[],
  targetBuildingId: string
): OccluderBox[] {
  const occluders: OccluderBox[] = [];

  for (const bldg of buildings) {
    const isTarget = bldg.id === targetBuildingId;
    const [bx, by, bz] = bldg.position;

    // If it's another building, its main volume blocks sunlight
    if (!isTarget) {
      const bldgBox = new THREE.Box3(
        new THREE.Vector3(bx - bldg.width / 2, by, bz - bldg.length / 2),
        new THREE.Vector3(bx + bldg.width / 2, by + bldg.height, bz + bldg.length / 2)
      );
      occluders.push({
        id: `bldg-${bldg.id}`,
        name: bldg.name,
        box: bldgBox,
      });

      // Also include obstacles on neighbor buildings
      for (const obs of bldg.roofObstacles) {
        const obsWorldX = bx + obs.relX;
        const obsWorldY = by + bldg.height;
        const obsWorldZ = bz + obs.relZ;
        const obsBox = new THREE.Box3(
          new THREE.Vector3(obsWorldX - obs.width / 2, obsWorldY, obsWorldZ - obs.length / 2),
          new THREE.Vector3(obsWorldX + obs.width / 2, obsWorldY + obs.height, obsWorldZ + obs.length / 2)
        );
        occluders.push({
          id: `neighbor-obs-${bldg.id}-${obs.id}`,
          name: `${bldg.name} - ${obs.name}`,
          box: obsBox,
        });
      }
    } else {
      // For the target building, its rooftop obstacles cast shadows on its own roof
      const roofTopY = by + bldg.height;
      for (const obs of bldg.roofObstacles) {
        const obsWorldX = bx + obs.relX;
        const obsWorldZ = bz + obs.relZ;
        const obsBox = new THREE.Box3(
          new THREE.Vector3(obsWorldX - obs.width / 2, roofTopY, obsWorldZ - obs.length / 2),
          new THREE.Vector3(obsWorldX + obs.width / 2, roofTopY + obs.height, obsWorldZ + obs.length / 2)
        );
        occluders.push({
          id: `target-obs-${obs.id}`,
          name: obs.name,
          box: obsBox,
        });
      }
    }
  }

  return occluders;
}

/**
 * Runs solar raycasting across the roof grid cells against all neighborhood occluders.
 * Evaluates exposure at each analysis sample hour (e.g. 08:00, 10:00, 12:00, 14:00, 16:00).
 */
export function analyzeRoofExposure(
  targetBuilding: Building,
  allBuildings: Building[],
  cells: RoofCell[],
  sampleTimes: readonly number[] = SIMULATION_ASSUMPTIONS.analysisTimes
): RoofCell[] {
  const occluders = buildNeighborhoodOccluders(allBuildings, targetBuilding.id);

  // Precompute sun vectors for the sample times
  const sunVectors = sampleTimes.map((time) => {
    const sunState = calculateSunPosition(time);
    return new THREE.Vector3(...sunState.vectorToSun).normalize();
  });

  const ray = new THREE.Ray();
  const hitPoint = new THREE.Vector3();

  return cells.map((cell) => {
    // If the cell is directly covered by an obstacle, mark obstacle and 0 exposure
    if (cell.classification === 'obstacle') {
      return {
        ...cell,
        exposureScore: 0,
        unblockedSamples: 0,
        totalSamples: sunVectors.length,
      };
    }

    // Origin slightly above roof plane (0.08m) to avoid self-intersection artifacts
    const origin = new THREE.Vector3(cell.worldX, cell.worldY + 0.08, cell.worldZ);
    let unblockedCount = 0;

    for (let s = 0; s < sunVectors.length; s++) {
      const sunDir = sunVectors[s];
      ray.set(origin, sunDir);

      let isBlocked = false;

      for (let o = 0; o < occluders.length; o++) {
        const intersection = ray.intersectBox(occluders[o].box, hitPoint);
        if (intersection !== null) {
          // Check that hit point is in front of ray origin and not behind
          const dist = origin.distanceTo(intersection);
          if (dist > 0.05) {
            isBlocked = true;
            break;
          }
        }
      }

      if (!isBlocked) {
        unblockedCount++;
      }
    }

    const exposureScore = unblockedCount / sunVectors.length;

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
      totalSamples: sunVectors.length,
      classification,
    };
  });
}
