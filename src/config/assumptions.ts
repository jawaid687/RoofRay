/**
 * Central Engineering Assumptions & Financial Parameters
 * All units are SI internally: meters, kW, kWh, kg CO2, USD.
 */

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
}

export const CITY_PRESETS: readonly CityPreset[] = [
  {
    id: 'sf',
    name: 'San Francisco, CA',
    country: 'USA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    description: 'Temperate coastal sunbelt, strong summer solar potential',
  },
  {
    id: 'phx',
    name: 'Phoenix, AZ',
    country: 'USA',
    latitude: 33.4484,
    longitude: -112.0740,
    timezone: 'America/Phoenix',
    description: 'High-insolation desert climate, no daylight saving time',
  },
  {
    id: 'nyc',
    name: 'New York, NY',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    description: 'Four-season temperate urban rooftop environment',
  },
  {
    id: 'lon',
    name: 'London',
    country: 'UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    description: 'Northern maritime latitude with distinct seasonal arcs',
  },
  {
    id: 'syd',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    description: 'Southern hemisphere site; midday sun sits in the north',
  },
  {
    id: 'equator',
    name: 'Quito (Equator)',
    country: 'Ecuador',
    latitude: -0.1807,
    longitude: -78.4678,
    timezone: 'America/Guayaquil',
    description: 'Equatorial location with true overhead midday zenith',
  },
  {
    id: 'cancer',
    name: 'Tropic of Cancer Marker',
    country: 'Reference',
    latitude: 23.4365,
    longitude: 0.0,
    timezone: 'UTC',
    description: 'Subsolar point overhead at June Solstice solar noon',
  },
  {
    id: 'tromso',
    name: 'Tromsø',
    country: 'Norway',
    latitude: 69.6492,
    longitude: 18.9553,
    timezone: 'Europe/Oslo',
    description: 'Arctic circle demonstrating polar day (midnight sun) and polar night',
  },
] as const;

export const SIMULATION_ASSUMPTIONS = {
  // Scene Orientation (FR-1.4, FR-4.1)
  // Scene convention: North = -Z, East = +X, Up = +Y
  sceneNorthOffsetDeg: 0, // Clockwise degrees from true north to scene -Z axis

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
  analysisTimes: [8, 10, 12, 14, 16],

  // Solar Generation Formula Parameters
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

  // Clear-Sky Irradiance Model Parameters (FR-5.2)
  solarConstantWPerM2: 1367,      // Extraterrestrial solar constant (W/m²)
  clearSkyClearnessFactor: 0.72,  // Atmospheric clearness coefficient a
  meinelExponent: 0.678,          // Air mass exponent b in Meinel DNI model
  clearSkyDiffuseRatio: 0.12,     // Diffuse sky fraction under clear sky conditions
  groundReflectanceAlbedo: 0.18,  // Ground reflection albedo

  // Unit Conversions
  sqMetersToSqFeet: 10.7639,
} as const;

export type SimulationAssumptions = typeof SIMULATION_ASSUMPTIONS;
