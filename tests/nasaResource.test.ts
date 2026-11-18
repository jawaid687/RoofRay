import { parseNasaPowerPayload } from '../src/services/solarResourceService';

export function runNasaResourceTests() {
  console.log('🛰️ Starting Deterministic NASA POWER Climatology Test Suite...\n');

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

  const validMonthKeys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Helper to build a synthetic mock NASA POWER response
  function buildMockNasaPayload(opts: {
    omitClrSky?: boolean;
    omitAllSky?: boolean;
    missingMonth?: string;
    clrSkyBelowAllSky?: boolean;
    omitTemp?: boolean;
  } = {}) {
    const allSky: Record<string, number> = {};
    const clrSky: Record<string, number> = {};
    const t2m: Record<string, number | null> = {};

    for (const m of validMonthKeys) {
      if (opts.missingMonth === m) continue;
      allSky[m] = 4.5;
      clrSky[m] = opts.clrSkyBelowAllSky && m === 'JUN' ? 3.8 : 5.8;
      t2m[m] = opts.omitTemp ? null : 26.5;
    }

    const parameter: any = {};
    if (!opts.omitAllSky) parameter.ALLSKY_SFC_SW_DWN = allSky;
    if (!opts.omitClrSky) parameter.CLRSKY_SFC_SW_DWN = clrSky;
    if (!opts.omitTemp) parameter.T2M = t2m;

    return {
      properties: { parameter },
    };
  }

  // Test 1: Complete valid response produces 12 months & accurate averages
  const validPayload = buildMockNasaPayload();
  const result = parseNasaPowerPayload(validPayload, 23.81, 90.41);
  assert(result.available === true, 'Valid payload returns available: true');
  assert(result.monthly.length === 12, 'Valid payload produces 12 monthly climatology records');
  assert(result.annualAverageAllSkyKWhM2Day === 4.5, 'Annual all-sky average accurately calculated');
  assert(result.annualAverageClearSkyKWhM2Day === 5.8, 'Annual clear-sky average accurately calculated');
  assert(result.averageCloudPenaltyPercent === 22, 'Cloud penalty percent accurately calculated (5.8 - 4.5 / 5.8 = ~22%)');

  // Test 2: Temperature preservation & nullability (no 25.0 fallback)
  const noTempPayload = buildMockNasaPayload({ omitTemp: true });
  const noTempResult = parseNasaPowerPayload(noTempPayload, 23.81, 90.41);
  assert(noTempResult.monthly[0].ambientTempC === null, 'Missing temperature is strictly null (never defaults to 25.0°C)');
  assert(noTempResult.monthly[11].ambientTempC === null, 'All months preserve null temperature when unrecorded');

  // Test 3: Missing CLRSKY_SFC_SW_DWN must throw error, NEVER substitute all-sky
  let clrSkyErrorCaught = false;
  try {
    const missingClrSkyPayload = buildMockNasaPayload({ omitClrSky: true });
    parseNasaPowerPayload(missingClrSkyPayload, 23.81, 90.41);
  } catch (err: any) {
    clrSkyErrorCaught = true;
    assert(err.message.includes('CLRSKY_SFC_SW_DWN'), 'Missing clear-sky parameter throws descriptive error');
  }
  assert(clrSkyErrorCaught, 'Missing clear-sky data is NEVER substituted with all-sky irradiance');

  // Test 4: Missing ALLSKY_SFC_SW_DWN must throw error
  let allSkyErrorCaught = false;
  try {
    const missingAllSkyPayload = buildMockNasaPayload({ omitAllSky: true });
    parseNasaPowerPayload(missingAllSkyPayload, 23.81, 90.41);
  } catch (err: any) {
    allSkyErrorCaught = true;
    assert(err.message.includes('ALLSKY_SFC_SW_DWN') || err.message.includes('missing parameters'), 'Missing all-sky parameter throws descriptive error');
  }
  assert(allSkyErrorCaught, 'Missing all-sky parameter strictly rejected');

  // Test 5: Missing month data must throw error
  let monthErrorCaught = false;
  try {
    const missingMonthPayload = buildMockNasaPayload({ missingMonth: 'JUL' });
    parseNasaPowerPayload(missingMonthPayload, 23.81, 90.41);
  } catch (err: any) {
    monthErrorCaught = true;
    assert(err.message.includes('Incomplete NASA POWER data'), 'Missing month observation strictly rejected');
  }
  assert(monthErrorCaught, 'Incomplete 11-month response rejected as unavailable');

  // Test 6: Physically invalid data (Clear-sky < All-sky) must throw error
  let physicalErrorCaught = false;
  try {
    const physicalPayload = buildMockNasaPayload({ clrSkyBelowAllSky: true });
    parseNasaPowerPayload(physicalPayload, 23.81, 90.41);
  } catch (err: any) {
    physicalErrorCaught = true;
    assert(err.message.includes('Physically invalid'), 'Clear-sky lower than all-sky rejected as physically invalid');
  }
  assert(physicalErrorCaught, 'Physical constraint enforced: Clear-sky >= All-sky');

  console.log(`\n========================================`);
  console.log(`NASA Resource Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }

  return { passed, failed };
}

if (process.argv[1]?.endsWith('nasaResource.test.ts')) {
  runNasaResourceTests();
}
