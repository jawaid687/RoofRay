import { EnergyResult, PanelType, PlacedPanel } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

/**
 * Computes deterministic solar energy generation and electricity demand coverage.
 */
export function calculateEnergyProfile(
  monthlyConsumptionKWh: number,
  panels: PlacedPanel[],
  panelType: PanelType
): EnergyResult {
  const panelCount = panels.length;
  const annualConsumptionKWh = Math.max(1, Math.round(monthlyConsumptionKWh * 12));

  if (panelCount === 0) {
    return {
      monthlyConsumptionKWh,
      annualConsumptionKWh,
      installedCapacityKW: 0,
      panelCount: 0,
      annualGenerationKWh: 0,
      solarCoveragePercent: 0,
      surplusKWh: 0,
      deficitKWh: annualConsumptionKWh,
      averageCapacityFactorPercent: 0,
    };
  }

  // System Size in kW: strictly sum of individual per-panel capacities (FR-8.1)
  const installedCapacityKW = Math.round(
    panels.reduce((sum, p) => sum + (p.wattage || panelType.wattage) / 1000, 0) * 100
  ) / 100;

  // Annual Generation Formula: strictly sum of per-panel annual yields (FR-8.1)
  const defaultPanelBaseline =
    (panelType.wattage / 1000) *
    SIMULATION_ASSUMPTIONS.peakSunHoursPerDay *
    365 *
    SIMULATION_ASSUMPTIONS.performanceRatio;

  const annualGenerationKWh = panels.reduce((sum, p) => {
    if (p.annualKWh !== undefined) {
      return sum + p.annualKWh;
    }
    const baseline = p.wattage
      ? (p.wattage / 1000) *
        SIMULATION_ASSUMPTIONS.peakSunHoursPerDay *
        365 *
        SIMULATION_ASSUMPTIONS.performanceRatio
      : defaultPanelBaseline;
    return sum + Math.round(baseline * p.exposureScore);
  }, 0);

  // Solar Coverage Percentage (capped at 100% for demand offset, surplus reported separately)
  const exactCoveragePercent = (annualGenerationKWh / annualConsumptionKWh) * 100;
  const solarCoveragePercent = Math.min(100, Math.round(exactCoveragePercent * 10) / 10);

  const surplusKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
  const deficitKWh = Math.max(0, annualConsumptionKWh - annualGenerationKWh);

  // Capacity factor = Annual Gen / (Capacity * 8760 hours)
  const capacityFactor = (annualGenerationKWh / (installedCapacityKW * 8760)) * 100;
  const averageCapacityFactorPercent = Math.round(capacityFactor * 10) / 10;

  return {
    monthlyConsumptionKWh,
    annualConsumptionKWh,
    installedCapacityKW,
    panelCount,
    annualGenerationKWh,
    solarCoveragePercent,
    surplusKWh,
    deficitKWh,
    averageCapacityFactorPercent,
  };
}
