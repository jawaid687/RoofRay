export type RoofType = 'flat';

export type ObstacleType = 'hvac' | 'water_tank' | 'utility_room' | 'skylight';

export interface RoofObstacle {
  id: string;
  name: string;
  type: ObstacleType;
  /** Position relative to roof center: [-width/2 .. width/2, -length/2 .. length/2] in meters */
  relX: number;
  relZ: number;
  width: number;
  length: number;
  height: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed_use' | 'industrial';
  position: [number, number, number]; // [x, y, z] in world coordinates (meters)
  width: number;                      // X dimension (meters)
  length: number;                     // Z dimension (meters)
  height: number;                     // Y dimension (meters)
  roofType: RoofType;
  roofObstacles: RoofObstacle[];
  defaultMonthlyKWh: number;
  color?: string;
  description?: string;
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
}

export type OptimizationMode = 
  | 'need'             // Meet My Electricity Need
  | 'max_generation'   // Maximum Solar Generation
  | 'lowest_cost'      // Lowest Initial Cost
  | 'balanced';        // Best Value / Balanced

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
