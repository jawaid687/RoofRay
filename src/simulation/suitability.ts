import { Building, RoofCell, SolarAnalysisResult, RecommendedZone } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

/**
 * Finds the largest contiguous rectangular subarray of suitable (excellent or good) cells.
 * Uses the classic maximal rectangle in histogram algorithm (O(R * C)).
 */
export function findBestInstallationZone(
  cells: RoofCell[],
  cols: number,
  rows: number,
  cellWidth: number,
  cellLength: number
): RecommendedZone | undefined {
  // Build a 2D boolean grid: 1 if cell is suitable for solar, 0 otherwise
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const cellMap = new Map<string, RoofCell>();

  for (const cell of cells) {
    cellMap.set(`${cell.gridX},${cell.gridZ}`, cell);
    if (cell.classification === 'excellent' || cell.classification === 'good') {
      grid[cell.gridZ][cell.gridX] = 1;
    }
  }

  let maxArea = 0;
  let bestRect = { minCol: 0, maxCol: 0, minRow: 0, maxRow: 0 };
  const heights = Array(cols).fill(0);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        heights[c] += 1;
      } else {
        heights[c] = 0;
      }
    }

    // Largest rectangle in histogram
    const stack: number[] = [];
    let c = 0;
    while (c < cols) {
      if (stack.length === 0 || heights[stack[stack.length - 1]] <= heights[c]) {
        stack.push(c++);
      } else {
        const top = stack.pop()!;
        const h = heights[top];
        const w = stack.length === 0 ? c : c - stack[stack.length - 1] - 1;
        const area = h * w;
        if (area > maxArea && h >= 2 && w >= 2) {
          maxArea = area;
          const leftCol = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
          const rightCol = c - 1;
          const topRow = r - h + 1;
          const bottomRow = r;
          bestRect = { minCol: leftCol, maxCol: rightCol, minRow: topRow, maxRow: bottomRow };
        }
      }
    }

    while (stack.length > 0) {
      const top = stack.pop()!;
      const h = heights[top];
      const w = stack.length === 0 ? c : c - stack[stack.length - 1] - 1;
      const area = h * w;
      if (area > maxArea && h >= 2 && w >= 2) {
        maxArea = area;
        const leftCol = stack.length === 0 ? 0 : stack[stack.length - 1] + 1;
        const rightCol = c - 1;
        const topRow = r - h + 1;
        const bottomRow = r;
        bestRect = { minCol: leftCol, maxCol: rightCol, minRow: topRow, maxRow: bottomRow };
      }
    }
  }

  if (maxArea === 0) {
    return undefined;
  }

  // Calculate coordinates and average exposure inside this rectangular zone
  let exposureSum = 0;
  let cellCount = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let r = bestRect.minRow; r <= bestRect.maxRow; r++) {
    for (let c = bestRect.minCol; c <= bestRect.maxCol; c++) {
      const cell = cellMap.get(`${c},${r}`);
      if (cell) {
        exposureSum += cell.exposureScore;
        cellCount++;
        minX = Math.min(minX, cell.localX - cellWidth / 2);
        maxX = Math.max(maxX, cell.localX + cellWidth / 2);
        minZ = Math.min(minZ, cell.localZ - cellLength / 2);
        maxZ = Math.max(maxZ, cell.localZ + cellLength / 2);
      }
    }
  }

  const zoneWidth = maxX - minX;
  const zoneLength = maxZ - minZ;

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: Math.round(zoneWidth * 10) / 10,
    length: Math.round(zoneLength * 10) / 10,
    area: Math.round(zoneWidth * zoneLength * 10) / 10,
    avgExposure: cellCount > 0 ? Math.round((exposureSum / cellCount) * 100) / 100 : 0.85,
  };
}

/**
 * Computes strictly consistent roof area metrics and packages solar analysis results.
 */
export function calculateSolarMetrics(
  building: Building,
  cells: RoofCell[],
  cols: number,
  rows: number,
  cellWidth: number,
  cellLength: number
): SolarAnalysisResult {
  const totalRoofArea = building.width * building.length;
  const singleCellArea = (building.width / cols) * (building.length / rows);

  let obstacleCount = 0;
  let excellentCount = 0;
  let goodCount = 0;
  let poorCount = 0;
  let totalExposureSum = 0;
  let unblockedExposureSum = 0;
  let unblockedCount = 0;

  for (const cell of cells) {
    totalExposureSum += cell.exposureScore;
    if (cell.classification === 'obstacle') {
      obstacleCount++;
    } else {
      unblockedExposureSum += cell.exposureScore;
      unblockedCount++;
      if (cell.classification === 'excellent') {
        excellentCount++;
      } else if (cell.classification === 'good') {
        goodCount++;
      } else {
        poorCount++;
      }
    }
  }

  // Area breakdown derived directly from cell proportions to maintain exact sums
  const obstacleArea = Math.round(obstacleCount * singleCellArea * 10) / 10;
  const excellentArea = Math.round(excellentCount * singleCellArea * 10) / 10;
  const goodArea = Math.round(goodCount * singleCellArea * 10) / 10;
  
  // Available is strictly Total - Obstacle
  const availableRoofArea = Math.max(0, Math.round((totalRoofArea - obstacleArea) * 10) / 10);
  
  // Poor area is the remainder of available roof not classified as excellent or good
  const poorArea = Math.max(0, Math.round((availableRoofArea - excellentArea - goodArea) * 10) / 10);

  // Recommended area is excellent + good
  const recommendedInstallationArea = Math.round((excellentArea + goodArea) * 10) / 10;

  // Average exposure score of usable rooftop cells
  const averageExposureScore = unblockedCount > 0 
    ? Math.round((unblockedExposureSum / unblockedCount) * 100) / 100 
    : 0;

  const recommendedZone = findBestInstallationZone(cells, cols, rows, cellWidth, cellLength);

  return {
    buildingId: building.id,
    timestamp: Date.now(),
    gridResolution: SIMULATION_ASSUMPTIONS.roofGridResolution,
    cells,
    gridCols: cols,
    gridRows: rows,
    totalCells: cells.length,
    totalRoofArea: Math.round(totalRoofArea * 10) / 10,
    obstacleArea,
    availableRoofArea,
    excellentArea,
    goodArea,
    poorArea,
    recommendedInstallationArea,
    averageExposureScore,
    recommendedZone,
  };
}
