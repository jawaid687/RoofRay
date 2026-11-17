import { CurrencyCode } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

export function getCurrencySymbol(currency: CurrencyCode = 'USD'): string {
  return currency === 'BDT' ? '৳' : '$';
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD', decimals: number = 0): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency === 'BDT' ? '৳0' : '$0';
  }

  if (currency === 'BDT') {
    // Format BDT with Taka symbol ৳
    const num = decimals > 0 ? parseFloat(amount.toFixed(decimals)) : Math.round(amount);
    return `৳${num.toLocaleString('en-IN')}`;
  }

  // Format USD
  const num = decimals > 0 ? parseFloat(amount.toFixed(decimals)) : Math.round(amount);
  return `$${num.toLocaleString('en-US')}`;
}

export function getDefaultFinancialParams(currency: CurrencyCode = 'USD') {
  if (currency === 'BDT') {
    return {
      tariffPerKWh: SIMULATION_ASSUMPTIONS.bangladeshDefaultTariffBDT,
      costPerKW: SIMULATION_ASSUMPTIONS.bangladeshCostPerKW_BDT,
      baseInstallationCost: SIMULATION_ASSUMPTIONS.bangladeshBaseCostBDT,
      gridEmissionFactor: SIMULATION_ASSUMPTIONS.bangladeshGridEmissionFactorKgPerKWh,
      currencySymbol: '৳',
      currencyLabel: 'BDT (৳)',
    };
  }

  return {
    tariffPerKWh: SIMULATION_ASSUMPTIONS.electricityPricePerKWh,
    costPerKW: SIMULATION_ASSUMPTIONS.costPerKW,
    baseInstallationCost: SIMULATION_ASSUMPTIONS.baseInstallationCost,
    gridEmissionFactor: SIMULATION_ASSUMPTIONS.gridEmissionFactorKgPerKWh,
    currencySymbol: '$',
    currencyLabel: 'USD ($)',
  };
}
