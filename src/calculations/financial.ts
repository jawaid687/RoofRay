import { FinancialResult, PanelType, FinancialCustomInputs } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { formatCurrency } from '../utils/currency';

/**
 * Computes deterministic financial metrics including system capital cost,
 * annual electricity bill savings, payback period, and 20-year net cash return.
 * Supports configurable tariffs, custom turnkey costs, and multi-currency (USD / BDT).
 */
export function calculateFinancials(
  installedCapacityKW: number,
  panelCount: number,
  panelType: PanelType,
  annualGenerationKWh: number,
  annualConsumptionKWh: number,
  customInputs?: FinancialCustomInputs
): FinancialResult {
  const currency = customInputs?.currency || 'USD';
  const isBDT = currency === 'BDT';

  const defaultTariff = isBDT
    ? SIMULATION_ASSUMPTIONS.bangladeshDefaultTariffBDT
    : SIMULATION_ASSUMPTIONS.electricityPricePerKWh;
  const defaultCostPerKW = isBDT
    ? SIMULATION_ASSUMPTIONS.bangladeshCostPerKW_BDT
    : SIMULATION_ASSUMPTIONS.costPerKW;
  const defaultBaseCost = isBDT
    ? SIMULATION_ASSUMPTIONS.bangladeshBaseCostBDT
    : SIMULATION_ASSUMPTIONS.baseInstallationCost;

  const tariff = customInputs?.customElectricityTariff ?? defaultTariff;
  const costPerKW = customInputs?.customCostPerKW ?? defaultCostPerKW;
  const baseInstallationCost = customInputs?.customBaseCost ?? defaultBaseCost;
  const exportCreditRatio = customInputs?.customExportCreditRatio ?? 0.5;

  if (panelCount === 0 || installedCapacityKW <= 0) {
    return {
      totalSystemCost: 0,
      baseInstallationCost: 0,
      equipmentCost: 0,
      annualSavings: 0,
      annualSavingsUSD: 0,
      paybackYears: null,
      twentyYearNetSavings: 0,
      twentyYearNetSavingsUSD: 0,
      roiPercent: 0,
      currency,
      annualSavingsFormatted: formatCurrency(0, currency),
      totalSystemCostFormatted: formatCurrency(0, currency),
      tariffPerKWh: tariff,
      exportCreditRatio,
    };
  }
  
  // Total turnkey system cost: base engineering/permitting + capacity rate
  const totalSystemCost = Math.round(
    baseInstallationCost + installedCapacityKW * costPerKW
  );

  // Equipment cost: panels + inverter/racking
  const panelUnitCost = isBDT
    ? panelType.cost * SIMULATION_ASSUMPTIONS.usdToBdtExchangeRate
    : panelType.cost;
  const balanceCostPerKW = isBDT ? 450 * SIMULATION_ASSUMPTIONS.usdToBdtExchangeRate : 450;
  const equipmentCost = Math.round(panelCount * panelUnitCost + installedCapacityKW * balanceCostPerKW);

  // Missing or non-positive tariff prevents misleading payback calculation (PRD & Rule 4.B)
  if (tariff <= 0 || costPerKW <= 0) {
    return {
      totalSystemCost,
      baseInstallationCost,
      equipmentCost,
      annualSavings: 0,
      annualSavingsUSD: 0,
      paybackYears: null,
      twentyYearNetSavings: -totalSystemCost,
      twentyYearNetSavingsUSD: -totalSystemCost,
      roiPercent: -100,
      currency,
      annualSavingsFormatted: formatCurrency(0, currency),
      totalSystemCostFormatted: formatCurrency(totalSystemCost, currency),
      tariffPerKWh: tariff,
    };
  }

  // Self-consumed generation offsets retail grid tariff directly
  const selfConsumedKWh = Math.min(annualGenerationKWh, annualConsumptionKWh);
  const selfConsumedSavings = selfConsumedKWh * tariff;

  // Surplus exported generation credits at wholesale/net-metering credit factor (default 50%, configurable)
  const surplusKWh = Math.max(0, annualGenerationKWh - annualConsumptionKWh);
  const exportCredit = surplusKWh * (tariff * exportCreditRatio);

  const annualSavings = Math.round(selfConsumedSavings + exportCredit);

  // Payback period in years: Only compute when savings are non-negligible
  const minThreshold = isBDT ? 500 : 50;
  let paybackYears: number | null = null;
  if (annualSavings > minThreshold) {
    paybackYears = Math.round((totalSystemCost / annualSavings) * 10) / 10;
  }

  // 20-Year cumulative lifecycle financial modeling:
  // - Annual panel degradation rate: 0.5%/yr (crystalline silicon benchmark)
  // - Annual operation & maintenance (O&M): 1% of initial CapEx per year
  // - Central inverter replacement at Year 10: 12% of initial CapEx
  const degradationRate = 0.005;
  const annualOMCost = Math.round(0.01 * totalSystemCost);
  const inverterReplacementCost = Math.round(0.12 * totalSystemCost);

  let cumulativeGrossSavings = 0;
  let cumulativeNetSavings = 0;

  for (let year = 1; year <= 20; year++) {
    const degradationFactor = Math.pow(1 - degradationRate, year - 1);
    const yrGen = annualGenerationKWh * degradationFactor;
    const yrSelfConsumed = Math.min(yrGen, annualConsumptionKWh);
    const yrSurplus = Math.max(0, yrGen - annualConsumptionKWh);
    const yrGrossSavings = yrSelfConsumed * tariff + yrSurplus * (tariff * exportCreditRatio);

    cumulativeGrossSavings += yrGrossSavings;
    let yrNet = yrGrossSavings - annualOMCost;
    if (year === 10) {
      yrNet -= inverterReplacementCost;
    }
    cumulativeNetSavings += yrNet;
  }

  const twentyYearGrossSavings = Math.round(cumulativeGrossSavings);
  const twentyYearNetSavings = Math.round(cumulativeNetSavings - totalSystemCost);

  const roiPercent = totalSystemCost > 0
    ? Math.round((twentyYearNetSavings / totalSystemCost) * 100)
    : 0;

  return {
    totalSystemCost,
    baseInstallationCost,
    equipmentCost,
    annualSavings,
    annualSavingsUSD: annualSavings,
    paybackYears,
    twentyYearNetSavings,
    twentyYearNetSavingsUSD: twentyYearNetSavings,
    roiPercent,
    currency,
    annualSavingsFormatted: formatCurrency(annualSavings, currency),
    totalSystemCostFormatted: formatCurrency(totalSystemCost, currency),
    tariffPerKWh: tariff,
    exportCreditRatio,
    annualOMCost,
    inverterReplacementCost,
    degradationRatePercent: 0.5,
    twentyYearGrossSavings,
  };
}
