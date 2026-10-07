/**
 * Central Engineering Assumptions & Financial Parameters
 * All units are SI internally: meters, kW, kWh, kg CO2, USD.
 */

export const SIMULATION_ASSUMPTIONS = {
  // Grid Discretization
  roofGridResolution: 0.8, // 0.8m x 0.8m grid cells for fast and accurate raycasting

  // Solar Exposure Thresholds
  excellentExposureThreshold: 0.80, // >= 80% unblocked solar hours
  goodExposureThreshold: 0.60,      // >= 60% unblocked solar hours
  minimumViableExposureScore: 0.60, // Minimum exposure required to place a solar panel

  // Layout Constraints (Meters)
  roofEdgeMargin: 0.8,       // 0.8m perimeter setback for firefighter access & wind buffer
  obstacleBufferMargin: 0.5, // 0.5m clearance buffer around AC units and utility rooms
  panelSpacingX: 0.15,       // 0.15m inter-panel air gap along X
  panelSpacingZ: 0.25,       // 0.25m inter-row spacing along Z for maintenance & tilt clearance

  // Representative Solar Sample Times (Hours of Day in 24h format)
  // Used by raycaster to compute cumulative solar irradiance potential
  analysisTimes: [8, 10, 12, 14, 16],

  // Solar Generation Formula Parameters
  // annualGen = systemKW * peakSunHoursPerDay * 365 * performanceRatio * exposureFactor
  peakSunHoursPerDay: 4.6, // Representative temperate/sunbelt average
  performanceRatio: 0.82,  // Inverter, soiling, temperature & wiring efficiency (82%)

  // Economics & Tariff Assumptions
  electricityPricePerKWh: 0.165, // $0.165 per kWh average grid rate
  costPerKW: 1850,              // $1,850 per kW installed turnkey
  baseInstallationCost: 2400,   // Fixed engineering, permitting, and grid interconnection base fee ($)
  
  // Grid Carbon Intensity
  gridEmissionFactorKgPerKWh: 0.42, // 0.42 kg CO2 / kWh displaced
  treesEquivalentPerTonneCO2: 45,   // ~45 seedling trees grown for 10 years per tonne CO2
  milesDrivenPerKgCO2: 2.5,         // Average EPA vehicle equivalence

  // Unit Conversions
  sqMetersToSqFeet: 10.7639,
} as const;

export type SimulationAssumptions = typeof SIMULATION_ASSUMPTIONS;
