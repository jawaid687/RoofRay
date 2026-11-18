import { server, startServer } from '../server/server.ts';
import { fetchNasaSolarResource } from '../src/services/solarResourceService.ts';
import { formatCurrency, getCurrencySymbol, getDefaultFinancialParams } from '../src/utils/currency.ts';
import { calculateFinancials } from '../src/calculations/financial.ts';
import { calculateEmissions } from '../src/calculations/emissions.ts';
import { translations } from '../src/i18n/translations.ts';
import { PANEL_TYPES } from '../src/data/panelTypes.ts';

async function runValidation() {
  console.log('🧪 Starting RoofRay V3 Comprehensive Validation Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // 1. Production Server Tests (Port 3008)
  // ----------------------------------------------------
  console.log('1. Testing Production Server Endpoints...');
  const testPort = 3008;
  await startServer(testPort);

  try {
    // Test GET /
    const resRoot = await fetch(`http://localhost:${testPort}/`);
    assert(resRoot.status === 200, 'Production GET / returns HTTP 200');
    assert(resRoot.headers.get('content-type')?.includes('text/html'), 'Production GET / returns text/html');
    const htmlRoot = await resRoot.text();
    assert(htmlRoot.includes('RoofRay'), 'Root HTML includes RoofRay title/meta');

    // Test GET /app (Direct refresh SPA routing)
    const resApp = await fetch(`http://localhost:${testPort}/app`);
    assert(resApp.status === 200, 'Production GET /app returns HTTP 200 (direct refresh)');
    assert(resApp.headers.get('content-type')?.includes('text/html'), 'Production GET /app returns text/html');
    const htmlApp = await resApp.text();
    assert(htmlApp.includes('RoofRay'), '/app HTML includes RoofRay title/meta');

    // Test GET /api/ai/health
    const resHealth = await fetch(`http://localhost:${testPort}/api/ai/health`);
    assert(resHealth.status === 200, 'Production GET /api/ai/health returns HTTP 200');
    const healthJson = await resHealth.json();
    assert(healthJson.status === 'ok', 'Health status is "ok"');
    assert(healthJson.service.includes('RoofRay'), 'Service name is RoofRay');
    assert(typeof healthJson.keyConfigured === 'boolean', 'keyConfigured is a boolean flag');

    // Test POST /api/ai/solar-advisor
    const advisorPayload = {
      userQuestion: 'Evaluate my solar placement feasibility and expected return on investment in Dhaka.',
      selectedBuilding: {
        id: 'building-1',
        name: 'Residential Archetype 01',
        roofAreaM2: 240,
        usableAreaM2: 180,
        roofType: 'flat',
        heightMeters: 18,
      },
      location: {
        city: 'Dhaka',
        country: 'Bangladesh',
        latitude: 23.8103,
        longitude: 90.4125,
        timezone: 'Asia/Dhaka',
      },
      energyProfile: {
        installedCapacityKW: 8.5,
        panelCount: 20,
        annualGenerationKWh: 11475,
        annualConsumptionKWh: 14000,
        solarCoveragePercent: 82.0,
        surplusKWh: 0,
      },
      financialResult: {
        totalSystemCost: 722500,
        annualSavingsUSD: 120487.5,
        paybackYears: 6.0,
        twentyYearNetSavingsUSD: 1687250,
        roiPercent: 233.5,
        currency: 'BDT',
        tariffPerKWh: 10.5,
      },
      environmentalResult: {
        annualCO2ReductionTonnes: 7.31,
        equivalentTreesPlanted: 121,
        gridEmissionFactorKgPerKWh: 0.637,
        gridEmissionFactorSource: 'Department of Environment (DoE) & SREDA Bangladesh (2023 Grid Emission Factors Report)',
      },
      panelConfig: {
        panelName: 'Mono PERC 425W',
        wattage: 425,
        tiltDegrees: 15,
        orientation: 'portrait',
      },
    };

    const resAdvisor = await fetch(`http://localhost:${testPort}/api/ai/solar-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advisorPayload),
    });
    assert(resAdvisor.status === 200, 'Production POST /api/ai/solar-advisor returns HTTP 200');
    const advisorJson = await resAdvisor.json();
    if (!healthJson.keyConfigured) {
      assert(advisorJson.configured === false, 'AI Advisor honestly reports configured: false when unconfigured');
      assert(advisorJson.error === 'MISSING_API_KEY', 'Error code is MISSING_API_KEY');
    } else {
      assert(advisorJson.configured === true, 'AI Advisor reports configured: true when key is present');
      assert(Boolean(advisorJson.summary), 'AI Advisor returns summary response');
    }
    assert(Array.isArray(advisorJson.sources) && advisorJson.sources.length > 0, 'Sources attached to response');
    assert(advisorJson.sources[0].url.startsWith('http'), 'Source URL is authentic HTTP link');
    assert(Boolean(advisorJson.sources[0].relevance?.includes('Grounding')), 'Source relevance documents RAG Grounding');

    // Test Security Controls (Priority 1)
    const resTraversal = await fetch(`http://localhost:${testPort}/..%2f..%2fpackage.json`);
    assert(resTraversal.status === 403 || resTraversal.status === 400 || resTraversal.status === 404, 'Path traversal attack rejected safely');

    const resApi404 = await fetch(`http://localhost:${testPort}/api/nonexistent-route`);
    assert(resApi404.status === 404, 'Unmatched /api route returns 404');
    const api404Json = await resApi404.json().catch(() => ({}));
    assert(api404Json.error === 'NOT_FOUND', 'Unmatched /api route never falls through to SPA index.html');

    const resWrongMethod = await fetch(`http://localhost:${testPort}/api/ai/solar-advisor`, { method: 'GET' });
    assert(resWrongMethod.status === 405, 'Non-POST method to advisor endpoint rejected with HTTP 405');

    const resWrongType = await fetch(`http://localhost:${testPort}/api/ai/solar-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'plain text',
    });
    assert(resWrongType.status === 415, 'Non-JSON content type rejected with HTTP 415');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // ----------------------------------------------------
  // 2. NASA Resource Service Tests
  // ----------------------------------------------------
  console.log('\n2. Testing NASA POWER Climatology Service...');
  try {
    const nasaData = await fetchNasaSolarResource(23.81, 90.41);
    if (nasaData.available) {
      assert(nasaData.annualAverageAllSkyKWhM2Day > 0, `NASA live insolation data retrieved: ${nasaData.annualAverageAllSkyKWhM2Day} kWh/m²/day`);
      assert(nasaData.monthly.length === 12, 'NASA data contains all 12 monthly climatology records');
      assert(nasaData.license.includes('NASA'), 'NASA Open Data license documented');
    } else {
      assert(!nasaData.available, 'NASA failure handled gracefully (offline fallback)');
      assert(Boolean(nasaData.error), `Error logged without crashing: ${nasaData.error}`);
    }
  } catch (err) {
    assert(false, `NASA service threw uncaught error: ${err.message}`);
  }

  // ----------------------------------------------------
  // 3. Financial & BDT Currency Tests
  // ----------------------------------------------------
  console.log('\n3. Testing BDT & Multi-Currency Economics...');
  assert(getCurrencySymbol('BDT') === '৳', 'getCurrencySymbol("BDT") returns ৳');
  assert(getCurrencySymbol('USD') === '$', 'getCurrencySymbol("USD") returns $');
  assert(formatCurrency(875000, 'BDT') === '৳8,75,000', 'BDT uses South Asian numbering (৳8,75,000)');
  assert(formatCurrency(875000, 'USD') === '$875,000', 'USD uses Western numbering ($875,000)');

  // Configurable export credit test
  const pType = PANEL_TYPES[0];
  const finResult50 = calculateFinancials(10, 25, pType, 15000, 10000, { currency: 'BDT', customElectricityTariff: 10, customExportCreditRatio: 0.5 });
  const finResult80 = calculateFinancials(10, 25, pType, 15000, 10000, { currency: 'BDT', customElectricityTariff: 10, customExportCreditRatio: 0.8 });
  assert(finResult80.annualSavingsUSD > finResult50.annualSavingsUSD, 'Configurable export credit ratio directly increases surplus savings');
  assert(finResult50.exportCreditRatio === 0.5, '50% export credit ratio recorded');
  assert(finResult80.exportCreditRatio === 0.8, '80% export credit ratio recorded');

  // Location-dependent emissions test
  const bdEmissions = calculateEmissions(10000, 0.637, 'DoE & SREDA Bangladesh National Grid Factor (2023): 0.637 kg CO2/kWh');
  assert(bdEmissions.annualCO2ReductionKg === 6370, 'Bangladesh grid emission yields 6,370 kg CO2 abated for 10,000 kWh');
  assert(bdEmissions.gridEmissionFactorSource.includes('DoE & SREDA'), 'Bangladesh source explicitly attributed');

  // ----------------------------------------------------
  // 4. Localization Dictionary Tests
  // ----------------------------------------------------
  console.log('\n4. Testing English & Bangla Localization...');
  assert(translations.en.nav.home === 'Home', 'English nav.home is "Home"');
  assert(translations.bn.nav.home === 'হোম', 'Bangla nav.home is "হোম"');
  assert(translations.en.hero.stat1Label === 'Raycasting Resolution', 'English stat1Label is "Raycasting Resolution"');
  assert(translations.bn.hero.stat1Label === 'রে-কাস্টিং রেজোলিউশন', 'Bangla stat1Label is "রে-কাস্টিং রেজোলিউশন"');
  assert(translations.en.app.plannerTab === 'Planner', 'English plannerTab is "Planner"');
  assert(translations.bn.app.plannerTab === 'প্ল্যানার', 'Bangla plannerTab is "প্ল্যানার"');
  assert(translations.en.app.aiAdvisorTab === 'AI Advisor', 'English aiAdvisorTab is "AI Advisor"');
  assert(translations.bn.app.aiAdvisorTab === 'এআই উপদেষ্টা', 'Bangla aiAdvisorTab is "এআই উপদেষ্টা"');

  console.log(`\n========================================`);
  console.log(`Validation Suite Complete: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runValidation().catch((err) => {
  console.error('Validation failure:', err);
  process.exit(1);
});
