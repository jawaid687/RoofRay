export type RoofType = 'flat';

export type ObstacleType = 'hvac' | 'water_tank' | 'utility_room' | 'skylight';

export interface RoofObstacle {
  readonly id: string;
  readonly name: string;
  readonly type: ObstacleType;
  /** Position relative to roof center: [-width/2 .. width/2, -length/2 .. length/2] in meters */
  readonly relX: number;
  readonly relZ: number;
  readonly width: number;
  readonly length: number;
  readonly height: number;
}

export interface Building {
  readonly id: string;
  readonly name: string;
  readonly type: 'residential' | 'commercial' | 'mixed_use' | 'industrial';
  readonly position: readonly [number, number, number]; // [x, y, z] in world coordinates (meters)
  readonly width: number;                               // X dimension (meters)
  readonly length: number;                              // Z dimension (meters)
  readonly height: number;                              // Y dimension (meters)
  readonly roofType: RoofType;
  readonly roofObstacles: readonly RoofObstacle[];
  readonly defaultMonthlyKWh: number;
  readonly color?: string;
  readonly description?: string;
}

export type HeatmapMode = 'live' | 'annual' | 'monthly';

export interface LocationState {
  readonly city: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
  readonly northOffsetDeg: number;
}

export interface DateTimeState {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly timeDecimal: number; // e.g. 13.5 = 13:30
}

export interface LiveShadingResult {
  readonly isSunUp: boolean;
  readonly totalCells: number;
  readonly litCellsCount: number;
  readonly shadedCellsCount: number;
  readonly obstacleCellsCount: number;
  readonly litRatio: number; // 0.0 to 1.0 of available roof cells
  readonly cellShading: readonly boolean[]; // true = lit, false = shaded or obstacle
}

export type CellExposureClassification = 'excellent' | 'good' | 'poor' | 'obstacle';

export interface RoofCell {
  gridX: number; // grid column index
  gridZ: number; // grid row index
  localX: number; // relative to roof center X (meters)
  localZ: number; // relative to roof center Z (meters)
  worldX: number;
  worldY: number; // roof top level
  worldZ: number;
  exposureScore: number; // 0.0 to 1.0 (ratio of unblocked sun sample vectors)
  unblockedSamples: number;
  totalSamples: number;
  classification: CellExposureClassification;
  obstacleId?: string;
}

export interface RecommendedZone {
  minX: number; // local relative meters
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  length: number;
  area: number;
  avgExposure: number;
}

export interface SolarAnalysisResult {
  buildingId: string;
  timestamp: number;
  gridResolution: number;
  cells: RoofCell[];
  gridCols: number;
  gridRows: number;
  totalCells: number;
  // Areas in square meters
  totalRoofArea: number;
  obstacleArea: number;
  availableRoofArea: number;
  excellentArea: number;
  goodArea: number;
  poorArea: number;
  recommendedInstallationArea: number;
  averageExposureScore: number;
  recommendedZone?: RecommendedZone;
}

export interface PanelType {
  id: string;
  name: string;
  wattage: number; // Watts, e.g. 400
  width: number;   // meters, e.g. 1.13
  length: number;  // meters, e.g. 1.72
  cost: number;    // USD demo cost per panel
  efficiencyPercent: number;
  category: 'Residential' | 'Commercial' | 'High-Density';
  description: string;
}

export type PanelOrientation = 'portrait' | 'landscape';

export interface PlacedPanel {
  id: string;
  gridCol: number;
  gridRow: number;
  localX: number; // relative to roof center
  localZ: number; // relative to roof center
  width: number;  // panel width along local X (depending on orientation)
  length: number; // panel length along local Z
  orientation: PanelOrientation;
  tiltDegrees: number;
  wattage: number;
  exposureScore: number; // average exposure of cells covered by this panel
  annualKWh?: number;    // per-panel estimated annual generation in kWh (FR-7.8)
}

export type PlacementMode = 'select' | 'place' | 'fill';

export type OptimizationMode = 
  | 'need'             // Meet My Electricity Need
  | 'max_generation'   // Maximum Solar Generation
  | 'lowest_cost'      // Lowest Initial Cost
  | 'balanced';        // Best Value / Balanced

export type AnalysisStatus = 'not_analyzed' | 'analyzing' | 'analyzed' | 'stale';

export type LayoutStatus = 'not_generated' | 'generating' | 'generated' | 'outdated';

export interface EnergyResult {
  monthlyConsumptionKWh: number;
  annualConsumptionKWh: number;
  installedCapacityKW: number;
  panelCount: number;
  annualGenerationKWh: number;
  solarCoveragePercent: number;
  surplusKWh: number;
  deficitKWh: number;
  averageCapacityFactorPercent: number;
}

export interface FinancialResult {
  totalSystemCost: number;
  baseInstallationCost: number;
  equipmentCost: number;
  annualSavingsUSD: number;
  paybackYears: number | null;
  twentyYearNetSavingsUSD: number;
  roiPercent: number;
}

export interface EnvironmentalResult {
  annualCO2ReductionKg: number;
  annualCO2ReductionTonnes: number;
  equivalentTreesPlanted: number;
  equivalentMilesDriven: number;
}

export interface SolarRecommendation {
  headline: string;
  narrative: string;
  keyPoints: string[];
  exclusions: string[];
  technicalHighlights: string[];
}
