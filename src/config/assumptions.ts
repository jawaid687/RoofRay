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
  region?: 'Bangladesh' | 'North America' | 'Europe' | 'Oceania' | 'South America' | 'Global Reference';
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
    region: 'North America',
  },
  {
    id: 'dhaka',
    name: 'Dhaka',
    country: 'Bangladesh',
    latitude: 23.8103,
    longitude: 90.4125,
    timezone: 'Asia/Dhaka',
    description: 'Dense metropolitan center with high solar insolation and urgent rooftop peak-shaving demand',
    region: 'Bangladesh',
  },
  {
    id: 'chattogram',
    name: 'Chattogram',
    country: 'Bangladesh',
    latitude: 22.3569,
    longitude: 91.7832,
    timezone: 'Asia/Dhaka',
    description: 'Major industrial seaport hub with extensive commercial factory rooftops and strong coastal irradiance',
    region: 'Bangladesh',
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    country: 'Bangladesh',
    latitude: 24.8949,
    longitude: 91.8687,
    timezone: 'Asia/Dhaka',
    description: 'Northeastern division with intense summer cloudbursts and high dry-season clear-sky insolation',
    region: 'Bangladesh',
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    country: 'Bangladesh',
    latitude: 24.3636,
    longitude: 88.6241,
    timezone: 'Asia/Dhaka',
    description: 'Northwestern division known for intense summer solar radiation and minimal overcast winters',
    region: 'Bangladesh',
  },
  {
    id: 'khulna',
    name: 'Khulna',
    country: 'Bangladesh',
    latitude: 22.8456,
    longitude: 89.5403,
    timezone: 'Asia/Dhaka',
    description: 'Southwestern riverine delta hub with growing distributed renewable microgrid integration',
    region: 'Bangladesh',
  },
  {
    id: 'barishal',
    name: 'Barishal',
    country: 'Bangladesh',
    latitude: 22.7010,
    longitude: 90.3535,
    timezone: 'Asia/Dhaka',
    description: 'South-central coastal agricultural hub with high horizontal solar irradiance',
    region: 'Bangladesh',
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    country: 'Bangladesh',
    latitude: 25.7439,
    longitude: 89.2752,
    timezone: 'Asia/Dhaka',
    description: 'Northern agrarian plains featuring high dry-season solar yield for irrigation & commercial roofs',
    region: 'Bangladesh',
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    country: 'Bangladesh',
    latitude: 24.7471,
    longitude: 90.4203,
    timezone: 'Asia/Dhaka',
    description: 'North-central division along the Brahmaputra with expanding rooftop solar adoption',
    region: 'Bangladesh',
  },
  {
    id: 'phx',
    name: 'Phoenix, AZ',
    country: 'USA',
    latitude: 33.4484,
    longitude: -112.0740,
    timezone: 'America/Phoenix',
    description: 'High-insolation desert climate, no daylight saving time',
    region: 'North America',
  },
  {
    id: 'nyc',
    name: 'New York, NY',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    description: 'Four-season temperate urban rooftop environment',
    region: 'North America',
  },
  {
    id: 'lon',
    name: 'London',
    country: 'UK',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    description: 'Northern maritime latitude with distinct seasonal arcs',
    region: 'Europe',
  },
  {
    id: 'syd',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    description: 'Southern hemisphere site; midday sun sits in the north',
    region: 'Oceania',
  },
  {
    id: 'equator',
    name: 'Quito (Equator)',
    country: 'Ecuador',
    latitude: -0.1807,
    longitude: -78.4678,
    timezone: 'America/Guayaquil',
    description: 'Equatorial location with true overhead midday zenith',
    region: 'South America',
  },
  {
    id: 'cancer',
    name: 'Tropic of Cancer Marker',
    country: 'Reference',
    latitude: 23.4365,
    longitude: 0.0,
    timezone: 'UTC',
    description: 'Subsolar point overhead at June Solstice solar noon',
    region: 'Global Reference',
  },
  {
    id: 'tromso',
    name: 'Tromsø',
    country: 'Norway',
    latitude: 69.6492,
    longitude: 18.9553,
    timezone: 'Europe/Oslo',
    description: 'Arctic circle demonstrating polar day (midnight sun) and polar night',
    region: 'Europe',
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
  electricityPricePerKWh: 0.165, // $0.165 per kWh average grid rate (US EIA benchmark)
  costPerKW: 1850,              // $1,850 per kW installed turnkey (NREL benchmark)
  baseInstallationCost: 2400,   // Fixed engineering, permitting, and grid interconnection base fee ($)
  
  // Bangladesh Regional Economic Benchmarks (Configurable in UI)
  // Source: BPDB Retail Tariff Schedule 2024 & SREDA Market Surveys
  bangladeshDefaultTariffBDT: 10.50, // ৳10.50 per kWh (BPDB LT-A Residential mid-tier reference)
  bangladeshCostPerKW_BDT: 85000,    // ৳85,000 per kW turnkey installed (SREDA accredited vendor average)
  bangladeshBaseCostBDT: 25000,      // ৳25,000 bi-directional net-meter & inspection fee
  usdToBdtExchangeRate: 120.0,       // Interbank reference rate (BDT per USD)

  // Grid Carbon Intensity
  gridEmissionFactorKgPerKWh: 0.42, // 0.42 kg CO2 / kWh displaced (IEA Global Average)
  
  // Bangladesh Specific Grid Emission Factor
  // Source: Department of Environment (DoE) & SREDA "Grid Emission Factor for the National Grid System of Bangladesh", 2023.
  // Dominant generation mix: Natural gas (~55%), Coal (~18%), Fuel oil (~15%), Renewables/Import (~12%).
  bangladeshGridEmissionFactorKgPerKWh: 0.637, // 0.637 kg CO2 / kWh displaced
  
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
