import { EnvironmentalResult } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

/**
 * Computes deterministic CO2 offset and tangible environmental equivalents.
 */
export function calculateEmissions(annualGenerationKWh: number): EnvironmentalResult {
  const annualCO2ReductionKg = Math.round(
    annualGenerationKWh * SIMULATION_ASSUMPTIONS.gridEmissionFactorKgPerKWh
  );

  const annualCO2ReductionTonnes = Math.round((annualCO2ReductionKg / 1000) * 10) / 10;

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
  };
}
