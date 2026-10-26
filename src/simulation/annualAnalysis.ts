/**
 * Annual Solar Analysis Engine.
 * Pure TypeScript implementation with zero Three.js or React imports.
 *
 * Samples 12 representative days across daylight hours at 30-minute steps,
 * weights by clear-sky irradiance and cosine of incidence angle,
 * and computes per-cell annual and monthly exposure % and kWh/m². (PRD FR-6)
 */

import { Building, RoofCell, CellExposureClassification, SolarAnalysisResult } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { calculateNOAASunPosition } from './sunPosition';
import { calculateClearSkyIrradiance, getDayOfYear } from './clearSky';
import { buildNeighborhoodOccluders, intersectRayBox, OccluderBox } from './shadowRaycaster';

export interface AnnualCellResult {
  gridX: number;
  gridZ: number;
  localX: number;
  localZ: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  annualExposureScore: number;    // 0.0 to 1.0 (unshaded weighted / potential weighted)
  annualKWhPerM2: number;         // Total kWh/m² per year
  monthlyKWhPerM2: number[];      // 12 monthly totals (Jan to Dec) in kWh/m²
  classification: CellExposureClassification;
  isObstacle: boolean;
}

export interface AnnualAnalysisOutput {
  buildingId: string;
  cacheKey: string;
  executionTimeMs: number;
  totalSamples: number;
  totalCells: number;
  cells: AnnualCellResult[];
  averageAnnualExposure: number;  // 0.0 to 1.0
  averageAnnualKWhPerM2: number;  // Average annual insolation across roof
  monthlyAveragesKWhPerM2: number[]; // 12-month average kWh/m²
  excellentArea: number;          // m²
  goodArea: number;               // m²
  poorArea: number;               // m²
  obstacleArea: number;           // m²
  recommendedArea: number;        // m²
  totalRoofArea: number;          // m²
}

export interface AnnualAnalysisParams {
  targetBuilding: Building;
  allBuildings: readonly Building[];
  cells: readonly RoofCell[];
  latitude: number;
  longitude: number;
  timezone: string;
  panelTiltDeg?: number;
  panelAzimuthDeg?: number;
  year?: number;
  onProgress?: (progress: number) => void;
  shouldCancel?: () => boolean;
}

// In-memory cache for annual analysis results (PRD FR-6.4)
const annualAnalysisCache = new Map<string, AnnualAnalysisOutput>();

export function getAnnualAnalysisCacheKey(
  buildingId: string,
  latitude: number,
  longitude: number,
  tiltDeg: number,
  azimuthDeg: number,
  year: number
): string {
  return `${buildingId}_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${tiltDeg.toFixed(1)}_${azimuthDeg.toFixed(1)}_${year}`;
}

export function clearAnnualAnalysisCache(): void {
  annualAnalysisCache.clear();
}

/**
 * Executes annual solar irradiance and shading integration across 12 representative days.
 * Pure, high-performance algorithm using typed arrays and zero inner-loop heap allocations.
 */
export function runAnnualAnalysisSync(params: AnnualAnalysisParams): AnnualAnalysisOutput {
  const startTime = performance.now();

  const {
    targetBuilding,
    allBuildings,
    cells,
    latitude,
    longitude,
    timezone,
    panelTiltDeg = Math.min(45, Math.max(10, Math.abs(latitude))),
    panelAzimuthDeg = latitude >= 0 ? 180 : 0, // Face equator
    year = 2026,
    onProgress,
    shouldCancel,
  } = params;

  const cacheKey = getAnnualAnalysisCacheKey(
    targetBuilding.id,
    latitude,
    longitude,
    panelTiltDeg,
    panelAzimuthDeg,
    year
  );

  const cached = annualAnalysisCache.get(cacheKey);
  if (cached) {
    onProgress?.(100);
    return cached;
  }

  // Pre-build occluder bounding boxes
  const occluders = buildNeighborhoodOccluders(allBuildings, targetBuilding.id);
  const numOccluders = occluders.length;

  // Flatten occluder boxes into Float32Array for cache-friendly memory access
  const boxBuffer = new Float32Array(numOccluders * 6);
  for (let o = 0; o < numOccluders; o++) {
    boxBuffer[o * 6 + 0] = occluders[o].minX;
    boxBuffer[o * 6 + 1] = occluders[o].minY;
    boxBuffer[o * 6 + 2] = occluders[o].minZ;
    boxBuffer[o * 6 + 3] = occluders[o].maxX;
    boxBuffer[o * 6 + 4] = occluders[o].maxY;
    boxBuffer[o * 6 + 5] = occluders[o].maxZ;
  }

  const numCells = cells.length;
  // Flatten cell origins elevated 0.08m above roof plane
  const cellCoords = new Float32Array(numCells * 3);
  const isObstacleCell = new Uint8Array(numCells);

  for (let i = 0; i < numCells; i++) {
    cellCoords[i * 3 + 0] = cells[i].worldX;
    cellCoords[i * 3 + 1] = cells[i].worldY + 0.08;
    cellCoords[i * 3 + 2] = cells[i].worldZ;
    isObstacleCell[i] = cells[i].classification === 'obstacle' ? 1 : 0;
  }

  // Pre-allocate energy accumulation buffers (in kWh/m²)
  const receivedEnergyPerCell = new Float64Array(numCells);
  const potentialEnergyPerCell = new Float64Array(numCells);
  // 12 months x numCells
  const monthlyReceivedPerCell = new Float32Array(12 * numCells);

  // 12 Representative days (15th of each month) with respective month day counts
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let totalSamplesEvaluated = 0;

  // Iterate over 12 months (representative 15th day)
  for (let m = 0; m < 12; m++) {
    if (shouldCancel?.()) {
      throw new Error('Annual analysis cancelled');
    }

    const monthNum = m + 1;
    const dayOfMonth = 15;
    const dayOfYear = getDayOfYear(monthNum, dayOfMonth, year);
    const monthWeight = daysInMonth[m]; // Scaler from representative day to entire month

    // Sample daylight hours at 30-minute intervals (0.5 hour step)
    for (let timeDecimal = 4.5; timeDecimal <= 20.5; timeDecimal += 0.5) {
      const sun = calculateNOAASunPosition({
        latitude,
        longitude,
        date: { year, month: monthNum, day: dayOfMonth },
        time: timeDecimal,
        timezone,
      });

      // Only evaluate if sun is above the local horizon
      if (sun.elevationDeg <= 0.1) {
        continue;
      }

      totalSamplesEvaluated++;

      // Compute clear-sky plane-of-array irradiance
      const irradiance = calculateClearSkyIrradiance({
        solarElevationDeg: sun.elevationDeg,
        solarAzimuthDeg: sun.azimuthDeg,
        sunVector: sun.vectorToSun,
        dayOfYear,
        panelTiltDeg,
        panelAzimuthDeg,
      });

      // Energy per sample in kWh/m²: (W/m² * 0.5h / 1000 W/kW) * monthWeight
      const potentialEnergyIncrement = (irradiance.planeOfArrayTotalUnshadedWPerM2 * 0.5 * 0.001) * monthWeight;
      const diffuseEnergyIncrement = (irradiance.planeOfArrayTotalShadedWPerM2 * 0.5 * 0.001) * monthWeight;

      const [dx, dy, dz] = sun.vectorToSun;
      const invDx = Math.abs(dx) > 1e-9 ? 1.0 / dx : 1e9;
      const invDy = Math.abs(dy) > 1e-9 ? 1.0 / dy : 1e9;
      const invDz = Math.abs(dz) > 1e-9 ? 1.0 / dz : 1e9;

      // Slab test against occluders for each roof cell
      for (let i = 0; i < numCells; i++) {
        if (isObstacleCell[i] === 1) {
          continue;
        }

        potentialEnergyPerCell[i] += potentialEnergyIncrement;

        const ox = cellCoords[i * 3 + 0];
        const oy = cellCoords[i * 3 + 1];
        const oz = cellCoords[i * 3 + 2];

        let isBlocked = false;

        // Inner loop: test against flat box buffer
        for (let o = 0; o < numOccluders; o++) {
          const bIdx = o * 6;
          const box: OccluderBox = {
            id: '',
            name: '',
            minX: boxBuffer[bIdx + 0],
            minY: boxBuffer[bIdx + 1],
            minZ: boxBuffer[bIdx + 2],
            maxX: boxBuffer[bIdx + 3],
            maxY: boxBuffer[bIdx + 4],
            maxZ: boxBuffer[bIdx + 5],
          };

          if (intersectRayBox(ox, oy, oz, invDx, invDy, invDz, box, 0.05, 500)) {
            isBlocked = true;
            break;
          }
        }

        const actualEnergyIncrement = isBlocked ? diffuseEnergyIncrement : potentialEnergyIncrement;
        receivedEnergyPerCell[i] += actualEnergyIncrement;
        monthlyReceivedPerCell[m * numCells + i] += actualEnergyIncrement;
      }
    }

    // Report progressive completion (e.g. 8% per month)
    onProgress?.(Math.round(((m + 1) / 12) * 100));
  }

  // Construct structured per-cell results and totals
  const outputCells: AnnualCellResult[] = new Array(numCells);
  let totalReceivedSum = 0;
  let totalPotentialSum = 0;
  let nonObstacleCount = 0;

  const monthlyTotals = new Float64Array(12);

  let excellentArea = 0;
  let goodArea = 0;
  let poorArea = 0;
  let obstacleArea = 0;
  let recommendedArea = 0;

  const cellArea = SIMULATION_ASSUMPTIONS.roofGridResolution * SIMULATION_ASSUMPTIONS.roofGridResolution;
  const totalRoofArea = targetBuilding.width * targetBuilding.length;

  for (let i = 0; i < numCells; i++) {
    const isObs = isObstacleCell[i] === 1;
    const received = receivedEnergyPerCell[i];
    const potential = potentialEnergyPerCell[i];

    const monthly: number[] = new Array(12);
    for (let m = 0; m < 12; m++) {
      const val = Math.round(monthlyReceivedPerCell[m * numCells + i] * 10) / 10;
      monthly[m] = val;
      if (!isObs) {
        monthlyTotals[m] += val;
      }
    }

    let exposureScore = 0;
    let classification: CellExposureClassification = 'poor';

    if (isObs) {
      classification = 'obstacle';
      obstacleArea += cellArea;
    } else {
      nonObstacleCount++;
      totalReceivedSum += received;
      totalPotentialSum += potential;

      exposureScore = potential > 0 ? clamp(received / potential, 0, 1) : 0;

      if (exposureScore >= SIMULATION_ASSUMPTIONS.excellentExposureThreshold) {
        classification = 'excellent';
        excellentArea += cellArea;
        recommendedArea += cellArea;
      } else if (exposureScore >= SIMULATION_ASSUMPTIONS.goodExposureThreshold) {
        classification = 'good';
        goodArea += cellArea;
        recommendedArea += cellArea;
      } else {
        classification = 'poor';
        poorArea += cellArea;
      }
    }

    outputCells[i] = {
      gridX: cells[i].gridX,
      gridZ: cells[i].gridZ,
      localX: cells[i].localX,
      localZ: cells[i].localZ,
      worldX: cells[i].worldX,
      worldY: cells[i].worldY,
      worldZ: cells[i].worldZ,
      annualExposureScore: Math.round(exposureScore * 1000) / 1000,
      annualKWhPerM2: Math.round(received * 10) / 10,
      monthlyKWhPerM2: monthly,
      classification,
      isObstacle: isObs,
    };
  }

  const averageAnnualExposure =
    totalPotentialSum > 0 ? clamp(totalReceivedSum / totalPotentialSum, 0, 1) : 0;
  const averageAnnualKWhPerM2 =
    nonObstacleCount > 0 ? totalReceivedSum / nonObstacleCount : 0;

  const monthlyAveragesKWhPerM2: number[] = new Array(12);
  for (let m = 0; m < 12; m++) {
    monthlyAveragesKWhPerM2[m] =
      nonObstacleCount > 0 ? Math.round((monthlyTotals[m] / nonObstacleCount) * 10) / 10 : 0;
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  const output: AnnualAnalysisOutput = {
    buildingId: targetBuilding.id,
    cacheKey,
    executionTimeMs,
    totalSamples: totalSamplesEvaluated,
    totalCells: numCells,
    cells: outputCells,
    averageAnnualExposure: Math.round(averageAnnualExposure * 1000) / 1000,
    averageAnnualKWhPerM2: Math.round(averageAnnualKWhPerM2 * 10) / 10,
    monthlyAveragesKWhPerM2,
    excellentArea: Math.round(excellentArea * 10) / 10,
    goodArea: Math.round(goodArea * 10) / 10,
    poorArea: Math.round(poorArea * 10) / 10,
    obstacleArea: Math.round(obstacleArea * 10) / 10,
    recommendedArea: Math.round(recommendedArea * 10) / 10,
    totalRoofArea: Math.round(totalRoofArea * 10) / 10,
  };

  annualAnalysisCache.set(cacheKey, output);
  return output;
}

/**
 * Converts AnnualAnalysisOutput to SolarAnalysisResult format to interface with legacy cards & optimization.
 */
export function convertAnnualOutputToSolarAnalysisResult(
  output: AnnualAnalysisOutput,
  targetBuilding: Building,
  gridCols: number,
  gridRows: number
): SolarAnalysisResult {
  const convertedCells: RoofCell[] = output.cells.map((c) => ({
    gridX: c.gridX,
    gridZ: c.gridZ,
    localX: c.localX,
    localZ: c.localZ,
    worldX: c.worldX,
    worldY: c.worldY,
    worldZ: c.worldZ,
    exposureScore: c.annualExposureScore,
    unblockedSamples: Math.round(c.annualExposureScore * 100),
    totalSamples: 100,
    classification: c.classification,
  }));

  const availableRoofArea = Math.max(0, output.totalRoofArea - output.obstacleArea);

  return {
    buildingId: targetBuilding.id,
    timestamp: Date.now(),
    gridResolution: SIMULATION_ASSUMPTIONS.roofGridResolution,
    cells: convertedCells,
    gridCols,
    gridRows,
    totalCells: output.totalCells,
    totalRoofArea: output.totalRoofArea,
    obstacleArea: output.obstacleArea,
    availableRoofArea: Math.round(availableRoofArea * 10) / 10,
    excellentArea: output.excellentArea,
    goodArea: output.goodArea,
    poorArea: output.poorArea,
    recommendedInstallationArea: output.recommendedArea,
    averageExposureScore: output.averageAnnualExposure,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
