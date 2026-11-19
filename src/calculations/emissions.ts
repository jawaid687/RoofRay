import { EnvironmentalResult } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

/**
 * Computes deterministic CO2 offset and tangible environmental equivalents.
 * Supports configurable grid emission intensity factors with verifiable source attribution.
 */
export function calculateEmissions(
  annualGenerationKWh: number,
  customEmissionFactor?: number,
  sourceDescription?: string
): EnvironmentalResult {
  const emissionFactor = customEmissionFactor !== undefined && customEmissionFactor > 0
    ? customEmissionFactor
    : SIMULATION_ASSUMPTIONS.gridEmissionFactorKgPerKWh;

  const source = sourceDescription || (
    emissionFactor === SIMULATION_ASSUMPTIONS.bangladeshGridEmissionFactorKgPerKWh
      ? 'DoE & SREDA Bangladesh National Grid Emission Factor (2023, 2021–2023 reporting period): 0.620 kg CO2/kWh'
      : 'IEA Global Average Grid Intensity Benchmark (2022): 0.420 kg CO2/kWh'
  );

  const annualCO2ReductionKg = Math.round(annualGenerationKWh * emissionFactor);
  const annualCO2ReductionTonnes = Math.round((annualCO2ReductionKg / 1000) * 1000) / 1000;

  const equivalentTreesPlanted = Math.round(
    annualCO2ReductionTonnes * SIMULATION_ASSUMPTIONS.treesEquivalentPerTonneCO2
  );

  const equivalentMilesDriven = Math.round(
    annualCO2ReductionKg * SIMULATION_ASSUMPTIONS.milesDrivenPerKgCO2
  );

  return {
    annualCO2ReductionKg,
    annualCO2ReductionTonnes,
    equivalentTreesPlanted,
    equivalentMilesDriven,
    gridEmissionFactorKgPerKWh: emissionFactor,
    gridEmissionFactorSource: source,
  };
}
