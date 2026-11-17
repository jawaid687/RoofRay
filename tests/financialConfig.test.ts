import { calculateFinancials } from '../src/calculations/financial';
import { calculateEmissions } from '../src/calculations/emissions';
import { PANEL_TYPES } from '../src/data/panelTypes';
import { SIMULATION_ASSUMPTIONS } from '../src/config/assumptions';

export function runFinancialConfigTests() {
  console.log('💰 Starting Financial Configuration & BDT Currency Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  const panelType = PANEL_TYPES[0]; // 400W panel
  const installedCapacityKW = 10;
  const panelCount = 25;
  const annualGenerationKWh = 14000;
  const annualConsumptionKWh = 12000;

  // Test 1: USD Baseline calculations
  const usdDefault = calculateFinancials(
    installedCapacityKW,
    panelCount,
    panelType,
    annualGenerationKWh,
    annualConsumptionKWh
  );

  assert(usdDefault.currency === 'USD', 'Default currency is USD');
  assert(usdDefault.totalSystemCost === Math.round(SIMULATION_ASSUMPTIONS.baseInstallationCost + 10 * SIMULATION_ASSUMPTIONS.costPerKW), 'USD total capex matches default assumptions');
  assert(usdDefault.paybackYears !== null && usdDefault.paybackYears > 0, `USD payback period computed: ${usdDefault.paybackYears} years`);
  assert(usdDefault.annualSavingsUSD > 0, 'USD savings is positive');

  // Test 2: BDT Calculations
  const bdtResult = calculateFinancials(
    installedCapacityKW,
    panelCount,
    panelType,
    annualGenerationKWh,
    annualConsumptionKWh,
    { currency: 'BDT' }
  );

  assert(bdtResult.currency === 'BDT', 'Currency is BDT');
  const expectedBdtCost = Math.round(SIMULATION_ASSUMPTIONS.bangladeshBaseCostBDT + 10 * SIMULATION_ASSUMPTIONS.bangladeshCostPerKW_BDT);
  assert(bdtResult.totalSystemCost === expectedBdtCost, `BDT total capex matches ৳${expectedBdtCost}`);
  assert(bdtResult.annualSavingsUSD > 5000, `BDT annual savings is substantial in Taka: ৳${bdtResult.annualSavingsUSD}`);
  assert(bdtResult.paybackYears !== null && bdtResult.paybackYears > 0, `BDT payback period computed: ${bdtResult.paybackYears} years`);

  // Test 3: Missing or zero tariff does not calculate misleading payback period (Rule 4.B)
  const zeroTariffResult = calculateFinancials(
    installedCapacityKW,
    panelCount,
    panelType,
    annualGenerationKWh,
    annualConsumptionKWh,
    { currency: 'BDT', customElectricityTariff: 0 }
  );

  assert(zeroTariffResult.paybackYears === null, 'Missing/zero tariff results in null payback period');
  assert(zeroTariffResult.annualSavingsUSD === 0, 'Missing/zero tariff produces zero bill savings');

  // Test 4: Custom Tariff and Custom Turnkey Cost
  const customResult = calculateFinancials(
    installedCapacityKW,
    panelCount,
    panelType,
    annualGenerationKWh,
    annualConsumptionKWh,
    {
      currency: 'BDT',
      customElectricityTariff: 14.50, // High tier commercial slab
      customCostPerKW: 75000,         // Competitive commercial EPC
      customBaseCost: 15000,
    }
  );

  const expectedCustomCapex = 15000 + 10 * 75000;
  assert(customResult.totalSystemCost === expectedCustomCapex, `Custom capex is exactly ৳${expectedCustomCapex}`);
  assert(customResult.tariffPerKWh === 14.50, 'Custom tariff of ৳14.50/kWh is respected');
  assert(customResult.paybackYears !== null && customResult.paybackYears < bdtResult.paybackYears!, 'Higher tariff yields faster payback period');

  // Test 5: Configurable Export Credit Ratio (Priority 2.6)
  const defaultCreditResult = calculateFinancials(
    10, 25, panelType, 15000, 10000, // 5000 kWh surplus
    { currency: 'BDT', customElectricityTariff: 10.0 }
  );
  // Surplus = 5000, self-consumed = 10000. Default credit = 50%: 10000*10 + 5000*(10*0.5) = 100000 + 25000 = 125000
  assert(defaultCreditResult.annualSavingsUSD === 125000, 'Default 50% export credit calculates ৳125,000 savings');
  assert(defaultCreditResult.exportCreditRatio === 0.5, 'Default export credit ratio is 0.5');

  const customCreditResult = calculateFinancials(
    10, 25, panelType, 15000, 10000,
    { currency: 'BDT', customElectricityTariff: 10.0, customExportCreditRatio: 0.8 } // 80% export credit
  );
  // 10000*10 + 5000*(10*0.8) = 100000 + 40000 = 140000
  assert(customCreditResult.annualSavingsUSD === 140000, 'Custom 80% export credit calculates ৳140,000 savings');
  assert(customCreditResult.exportCreditRatio === 0.8, 'Custom export credit ratio is 0.8');

  // Test 6: Carbon Emission Factor Configuration (Phase 2.C & Priority 2.5)
  const globalEmissions = calculateEmissions(annualGenerationKWh, SIMULATION_ASSUMPTIONS.gridEmissionFactorKgPerKWh);
  assert(globalEmissions.annualCO2ReductionKg === Math.round(annualGenerationKWh * 0.420), 'Global emissions use 0.420 kg CO2/kWh');

  const bdEmissions = calculateEmissions(annualGenerationKWh, SIMULATION_ASSUMPTIONS.bangladeshGridEmissionFactorKgPerKWh);
  assert(bdEmissions.annualCO2ReductionKg === Math.round(annualGenerationKWh * 0.637), 'Bangladesh emissions use 0.637 kg CO2/kWh');
  assert(bdEmissions.annualCO2ReductionKg > globalEmissions.annualCO2ReductionKg, 'Bangladesh grid emissions offset is higher due to fossil generation mix');
  assert(Boolean(bdEmissions.gridEmissionFactorSource?.includes('DoE & SREDA')), 'Bangladesh emission source is attributed to DoE & SREDA');

  console.log(`\n========================================`);
  console.log(`Financial Configuration Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (process.argv[1]?.includes('financialConfig.test')) {
  const res = runFinancialConfigTests();
  if (res.failed > 0) process.exit(1);
}
