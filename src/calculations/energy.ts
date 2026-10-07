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

  // System Size in kW
  const installedCapacityKW = Math.round((panelCount * panelType.wattage) / 10) / 100;

  // Average exposure factor across all placed panels (e.g. 0.92)
  const averageExposureFactor =
    panels.reduce((sum, p) => sum + p.exposureScore, 0) / panelCount;

  // Annual Generation Formula:
  // annualGen = kW * peakSunHours * 365 * performanceRatio * exposureFactor
  const baselineAnnualGen =
    installedCapacityKW *
    SIMULATION_ASSUMPTIONS.peakSunHoursPerDay *
    365 *
    SIMULATION_ASSUMPTIONS.performanceRatio;

  const annualGenerationKWh = Math.round(baselineAnnualGen * averageExposureFactor);

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
