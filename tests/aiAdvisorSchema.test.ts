import {
  validateAdvisorPayload,
  checkRateLimit,
  handleSolarAdvisorRequest,
  SolarAdvisorRequest,
} from '../src/server/advisorService';

export async function runAiAdvisorTests() {
  console.log('🤖 Starting AI Solar Advisor Schema & Safety Test Suite...\n');

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

  // Test 1: Payload Validator
  const invalid1 = validateAdvisorPayload(null);
  assert(!invalid1.valid, 'Null payload rejected');

  const invalid2 = validateAdvisorPayload({});
  assert(!invalid2.valid, 'Empty payload rejected');

  const validPayload: SolarAdvisorRequest = {
    selectedBuilding: {
      id: 'bldg-1',
      name: 'Apex Lofts',
      width: 15,
      length: 18,
      height: 12,
      roofType: 'flat',
      obstaclesCount: 2,
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
      panelCount: 21,
      annualGenerationKWh: 11200,
      annualConsumptionKWh: 9600,
      solarCoveragePercent: 100,
      surplusKWh: 1600,
    },
    financialResult: {
      totalSystemCost: 747500,
      annualSavingsUSD: 117600,
      paybackYears: 6.4,
      twentyYearNetSavingsUSD: 1604500,
      roiPercent: 215,
      currency: 'BDT',
      tariffPerKWh: 10.5,
    },
    environmentalResult: {
      annualCO2ReductionTonnes: 7.1,
      equivalentTreesPlanted: 320,
      gridEmissionFactorKgPerKWh: 0.637,
      gridEmissionFactorSource: 'DoE & SREDA Bangladesh',
    },
    panelConfig: {
      panelName: 'Mono PERC 400W',
      wattage: 400,
      tiltDegrees: 15,
      orientation: 'portrait',
    },
  };

  const validRes = validateAdvisorPayload(validPayload);
  assert(validRes.valid, 'Valid solar context payload accepted');

  // Test 2: Rate Limiter
  const ip = '192.168.1.100';
  let allowedCount = 0;
  for (let i = 0; i < 35; i++) {
    if (checkRateLimit(ip)) allowedCount++;
  }
  assert(allowedCount === 30, `Rate limiter caps requests to exactly 30 per window (allowed: ${allowedCount})`);

  // Test 3: Missing API Key Handling (Phase 3.C & Rule 11: Do not pretend a mock is real AI)
  const unconfiguredResponse = await handleSolarAdvisorRequest(validPayload, '');
  assert(!unconfiguredResponse.configured, 'Unconfigured API key correctly marked configured: false');
  assert(unconfiguredResponse.error === 'MISSING_API_KEY', 'Error code is MISSING_API_KEY');
  assert(!!unconfiguredResponse.setupGuide, 'Setup guide instructions provided');
  assert(unconfiguredResponse.sources.length > 0, 'Technical citations attached even when API key is unconfigured');
  assert(Array.isArray(unconfiguredResponse.recommendations), 'Recommendations is valid array');
  assert(Array.isArray(unconfiguredResponse.advantages), 'Advantages is valid array');
  assert(Array.isArray(unconfiguredResponse.risks), 'Risks is valid array');
  assert(Array.isArray(unconfiguredResponse.assumptions), 'Assumptions is valid array');
  assert(Array.isArray(unconfiguredResponse.next_steps), 'Next steps is valid array');

  // Test 4: Extended Input Range Validation (Priority 3.A)
  const invalidLatPayload = { ...validPayload, location: { ...validPayload.location, latitude: 120 } };
  assert(!validateAdvisorPayload(invalidLatPayload).valid, 'Out-of-range latitude (> 90°) rejected');

  const invalidLonPayload = { ...validPayload, location: { ...validPayload.location, longitude: -210 } };
  assert(!validateAdvisorPayload(invalidLonPayload).valid, 'Out-of-range longitude (< -180°) rejected');

  const invalidBldgPayload = { ...validPayload, selectedBuilding: { ...validPayload.selectedBuilding, width: -10 } };
  assert(!validateAdvisorPayload(invalidBldgPayload).valid, 'Negative building dimension rejected');

  const oversizedBldgPayload = { ...validPayload, selectedBuilding: { ...validPayload.selectedBuilding, width: 9999 } };
  assert(!validateAdvisorPayload(oversizedBldgPayload).valid, 'Excessive building dimension (> 500m) rejected');

  const invalidWattagePayload = { ...validPayload, panelConfig: { ...validPayload.panelConfig, wattage: 20 } };
  assert(!validateAdvisorPayload(invalidWattagePayload).valid, 'Unrealistic panel wattage (< 50W) rejected');

  const longQuestion = 'A'.repeat(1200);
  const oversizedQuestionPayload = { ...validPayload, userQuestion: longQuestion };
  assert(!validateAdvisorPayload(oversizedQuestionPayload).valid, 'Oversized user prompt (> 1000 chars) rejected');

  // Test 5: Fallback safety when key is missing or invalid
  const fallbackSafe = await handleSolarAdvisorRequest(validPayload, 'invalid_key_for_testing');
  assert(fallbackSafe.configured === true, 'Treated as configured attempt');
  assert(Boolean(fallbackSafe.error), 'Safe error code returned without throwing unhandled exception');
  assert(!JSON.stringify(fallbackSafe).includes('invalid_key_for_testing'), 'API secret is NEVER leaked in response text');

  console.log(`\n========================================`);
  console.log(`AI Advisor Schema Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (process.argv[1]?.includes('aiAdvisorSchema.test')) {
  runAiAdvisorTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
