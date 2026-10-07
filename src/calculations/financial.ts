import { FinancialResult, PanelType } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

/**
 * Computes deterministic financial metrics including system capital cost,
 * annual electricity bill savings, payback period, and 20-year net cash return.
 */
export function calculateFinancials(
  installedCapacityKW: number,
  panelCount: number,
  panelType: PanelType,
  annualGenerationKWh: number,
  annualConsumptionKWh: number
): FinancialResult {
  if (panelCount === 0 || installedCapacityKW <= 0) {
    return {
      totalSystemCost: 0,
      baseInstallationCost: 0,
      equipmentCost: 0,
      annualSavingsUSD: 0,
      paybackYears: null,
      twentyYearNetSavingsUSD: 0,
      roiPercent: 0,
    };
  }

  const baseInstallationCost = SIMULATION_ASSUMPTIONS.baseInstallationCost;
  
  // Total turnkey system cost: base engineering/permitting + capacity rate
  const totalSystemCost = Math.round(
    baseInstallationCost + installedCapacityKW * SIMULATION_ASSUMPTIONS.costPerKW
  );

  const equipmentCost = Math.round(panelCount * panelType.cost + installedCapacityKW * 450);

  // Self-consumed generation offsets retail grid tariff directly ($0.165/kWh)
  const selfConsumedKWh = Math.min(annualGenerationKWh, annualConsumptionKWh);
  const selfConsumedSavings = selfConsumedKWh * SIMULATION_ASSUMPTIONS.electricityPricePerKWh;

  // Surplus exported generation credits at wholesale/net-metering credit factor (~50%)
  const surplusKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
  const exportCredit = surplusKWh * (SIMULATION_ASSUMPTIONS.electricityPricePerKWh * 0.5);

  const annualSavingsUSD = Math.round(selfConsumedSavings + exportCredit);

  // Payback period in years
  let paybackYears: number | null = null;
  if (annualSavingsUSD > 50) {
    paybackYears = Math.round((totalSystemCost / annualSavingsUSD) * 10) / 10;
  }

  // 20-Year cumulative net financial benefit (accounting for minimal inverter replacement reserve)
  const twentyYearGrossSavings = annualSavingsUSD * 20;
  const twentyYearNetSavingsUSD = Math.round(twentyYearGrossSavings - totalSystemCost);

  const roiPercent = totalSystemCost > 0
    ? Math.round(((twentyYearNetSavingsUSD) / totalSystemCost) * 100)
    : 0;

  return {
    totalSystemCost,
    baseInstallationCost,
    equipmentCost,
    annualSavingsUSD,
    paybackYears,
    twentyYearNetSavingsUSD,
    roiPercent,
  };
}
