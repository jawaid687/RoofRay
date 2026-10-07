import { Building, RoofCell } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

export interface GridDefinition {
  cols: number;
  rows: number;
  cells: RoofCell[];
  cellWidth: number;
  cellLength: number;
}

/**
 * Discretizes a building roof into regular planar grid cells.
 * Local origin (0,0) is at the center of the rooftop.
 */
export function generateRoofGrid(
  building: Building,
  resolution: number = SIMULATION_ASSUMPTIONS.roofGridResolution
): GridDefinition {
  const { width, length, height, position, roofObstacles } = building;
  const [bldgX, bldgY, bldgZ] = position;
  const roofTopY = bldgY + height;

  const cols = Math.max(2, Math.floor(width / resolution));
  const rows = Math.max(2, Math.floor(length / resolution));

  const actualCellWidth = width / cols;
  const actualCellLength = length / rows;

  const halfWidth = width / 2;
  const halfLength = length / 2;

  const cells: RoofCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Local cell center coordinates relative to roof center
      const localX = -halfWidth + (c + 0.5) * actualCellWidth;
      const localZ = -halfLength + (r + 0.5) * actualCellLength;

      // World coordinates
      const worldX = bldgX + localX;
      const worldY = roofTopY;
      const worldZ = bldgZ + localZ;

      // Check whether this cell is obstructed by any rooftop equipment/obstacle
      let isObstructed = false;
      let blockingObstacleId: string | undefined = undefined;

      const buffer = SIMULATION_ASSUMPTIONS.obstacleBufferMargin;

      for (const obs of roofObstacles) {
        const obsMinX = obs.relX - obs.width / 2 - buffer;
        const obsMaxX = obs.relX + obs.width / 2 + buffer;
        const obsMinZ = obs.relZ - obs.length / 2 - buffer;
        const obsMaxZ = obs.relZ + obs.length / 2 + buffer;

        if (
          localX >= obsMinX &&
          localX <= obsMaxX &&
          localZ >= obsMinZ &&
          localZ <= obsMaxZ
        ) {
          isObstructed = true;
          blockingObstacleId = obs.id;
          break;
        }
      }

      cells.push({
        gridX: c,
        gridZ: r,
        localX,
        localZ,
        worldX,
        worldY,
        worldZ,
        exposureScore: 1.0, // default until raycast analysis
        unblockedSamples: SIMULATION_ASSUMPTIONS.analysisTimes.length,
        totalSamples: SIMULATION_ASSUMPTIONS.analysisTimes.length,
        classification: isObstructed ? 'obstacle' : 'excellent',
        obstacleId: blockingObstacleId,
      });
    }
  }

  return {
    cols,
    rows,
    cells,
    cellWidth: actualCellWidth,
    cellLength: actualCellLength,
  };
}
