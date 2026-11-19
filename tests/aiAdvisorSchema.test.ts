import {
  validateAdvisorPayload,
  validateAdvisorResponseSchema,
  checkRateLimit,
  handleSolarAdvisorRequest,
  SolarAdvisorRequest,
  resolveGeminiModel,
  executeGeminiRequest,
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

  // Test 6: AI Response Schema Validation (Priority 5)
  const validAiResponse = {
    summary: 'Strong rooftop solar potential with 8.5 kW peak capacity.',
    recommendations: ['Install 21 high-efficiency panels.', 'Maintain 0.8m perimeter setback.'],
    advantages: ['High solar demand coverage.'],
    risks: ['Minor morning shadow from eastern parapet.'],
    assumptions: ['Clear-sky geometric calculation.'],
    next_steps: ['Conduct licensed electrical inspection.'],
  };
  const validSchemaRes = validateAdvisorResponseSchema(validAiResponse);
  assert(validSchemaRes.valid === true, 'Strict response schema validator accepts compliant AI JSON');
  assert(validSchemaRes.data?.recommendations.length === 2, 'Parsed recommendations extracted cleanly');

  // Reject non-object root
  assert(!validateAdvisorResponseSchema('not an object').valid, 'Non-object root response rejected');
  assert(!validateAdvisorResponseSchema([]).valid, 'Array root response rejected');

  // Reject missing/empty summary
  assert(!validateAdvisorResponseSchema({ ...validAiResponse, summary: '' }).valid, 'Empty summary rejected');
  assert(!validateAdvisorResponseSchema({ ...validAiResponse, summary: 123 }).valid, 'Non-string summary rejected');

  // Reject empty recommendations array
  assert(!validateAdvisorResponseSchema({ ...validAiResponse, recommendations: [] }).valid, 'Empty recommendations array rejected');

  // REJECT non-string items in arrays (strictly prevents [object Object] conversion)
  const objectInArray = {
    ...validAiResponse,
    recommendations: [{ title: 'Malformed object recommendation' }],
  };
  const objectRejectRes = validateAdvisorResponseSchema(objectInArray);
  assert(!objectRejectRes.valid, 'Arbitrary object inside array rejected (no silent [object Object] conversion)');
  assert(Boolean(objectRejectRes.error?.includes('must be a string')), 'Descriptive type mismatch error returned');

  const numberInArray = {
    ...validAiResponse,
    risks: [12345],
  };
  assert(!validateAdvisorResponseSchema(numberInArray).valid, 'Numeric item inside string array rejected');

  // -----------------------------------------------------------------
  // Test 7: Centralized Model Configuration Resolution
  // -----------------------------------------------------------------
  const origModelEnv = process.env.GEMINI_MODEL;
  delete process.env.GEMINI_MODEL;
  assert(resolveGeminiModel() === 'gemini-3.5-flash-lite', 'Default model resolves to gemini-3.5-flash-lite');
  assert(resolveGeminiModel(' custom-model ') === 'custom-model', 'Custom model argument resolves and trims');
  process.env.GEMINI_MODEL = 'env-specified-model';
  assert(resolveGeminiModel() === 'env-specified-model', 'Environment variable GEMINI_MODEL takes precedence');
  if (origModelEnv !== undefined) {
    process.env.GEMINI_MODEL = origModelEnv;
  } else {
    delete process.env.GEMINI_MODEL;
  }

  // -----------------------------------------------------------------
  // Test 8: Deterministic Mock Provider Error & Safety Diagnostics
  // -----------------------------------------------------------------
  const originalFetch = globalThis.fetch;
  const dummyKey = 'test_secret_gemini_key_12345';

  try {
    function mockFetchResponse(status: number, statusText: string, bodyJson: unknown) {
      globalThis.fetch = (async () => ({
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: async () => bodyJson,
        text: async () => JSON.stringify(bodyJson),
      })) as unknown as typeof fetch;
    }

    // 8.1: HTTP 400 - Invalid Request
    mockFetchResponse(400, 'Bad Request', {
      error: { code: 400, message: 'Invalid JSON payload structure', status: 'INVALID_ARGUMENT' },
    });
    const res400 = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(res400.httpStatus === 400 && res400.errorCode === 'INVALID_REQUEST', 'HTTP 400 parsed as INVALID_REQUEST');

    // 8.2: HTTP 401 - Authentication Error
    mockFetchResponse(401, 'Unauthorized', {
      error: { code: 401, message: 'API key expired', status: 'UNAUTHENTICATED' },
    });
    const res401 = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(res401.httpStatus === 401 && res401.errorCode === 'AUTHENTICATION_FAILED', 'HTTP 401 parsed as AUTHENTICATION_FAILED');
    assert(res401.userMessage === 'Gemini authentication or project permission needs attention.', 'HTTP 401 formatted user-facing message');

    // 8.3: HTTP 403 - Permission Error
    mockFetchResponse(403, 'Forbidden', {
      error: { code: 403, message: 'Generative Language API has not been used in project', status: 'PERMISSION_DENIED' },
    });
    const res403 = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(res403.httpStatus === 403 && res403.errorCode === 'PERMISSION_DENIED', 'HTTP 403 parsed as PERMISSION_DENIED');
    assert(res403.userMessage === 'Gemini authentication or project permission needs attention.', 'HTTP 403 formatted user-facing message');

    // 8.4: HTTP 404 - Model Unavailable
    mockFetchResponse(404, 'Not Found', {
      error: { code: 404, message: 'models/gemini-unsupported is not found', status: 'NOT_FOUND' },
    });
    const res404 = await executeGeminiRequest('gemini-unsupported', dummyKey, 'sys', 'usr');
    assert(res404.httpStatus === 404 && res404.errorCode === 'MODEL_UNAVAILABLE', 'HTTP 404 parsed as MODEL_UNAVAILABLE');
    assert(res404.userMessage === 'The configured Gemini model is unavailable. Please verify the model configuration.', 'HTTP 404 formatted user-facing message');

    // 8.5: HTTP 429 - Rate Limit Exceeded
    mockFetchResponse(429, 'Too Many Requests', {
      error: { code: 429, message: 'Resource has been exhausted', status: 'RESOURCE_EXHAUSTED' },
    });
    const res429 = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(res429.httpStatus === 429 && res429.errorCode === 'RATE_LIMIT_EXCEEDED', 'HTTP 429 parsed as RATE_LIMIT_EXCEEDED');
    assert(res429.userMessage === 'Gemini AI Advisor has temporarily reached its API usage limit. Your deterministic solar calculations remain available.', 'HTTP 429 formatted user-facing message');

    // 8.6: HTTP 503 - Service Unavailable
    mockFetchResponse(503, 'Service Unavailable', {
      error: { code: 503, message: 'Model is currently experiencing high demand', status: 'UNAVAILABLE' },
    });
    const res503 = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(res503.httpStatus === 503 && res503.errorCode === 'SERVICE_UNAVAILABLE', 'HTTP 503 parsed as SERVICE_UNAVAILABLE');
    assert(res503.userMessage === 'Google Gemini service is temporarily unavailable or experiencing high demand. Your deterministic solar calculations remain available.', 'HTTP 503 formatted user-facing message');

    // 8.7: Timeout Simulation
    globalThis.fetch = (async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    }) as unknown as typeof fetch;
    const resTimeout = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr', 100);
    assert(resTimeout.errorCode === 'TIMEOUT', 'AbortError classified as TIMEOUT');
    assert(resTimeout.userMessage.includes('timed out'), 'Timeout user message returned');

    // 8.8: No Automatic Model Fallback
    mockFetchResponse(503, 'Service Unavailable', {
      error: { code: 503, message: 'High demand spike' },
    });
    const advisorRes503 = await handleSolarAdvisorRequest(validPayload, dummyKey, 'gemini-3.5-flash-lite');
    assert(advisorRes503.modelUsed === 'gemini-3.5-flash-lite', 'No silent fallback: modelUsed strictly remains gemini-3.5-flash-lite');
    assert(!JSON.stringify(advisorRes503).includes('gemini-2.5-flash'), 'Outdated fallback gemini-2.5-flash is never referenced');

    // 8.9: Secret API Key Redaction in Error Messages
    mockFetchResponse(500, 'Internal Server Error', {
      error: { code: 500, message: `Key ${dummyKey} failed server verification` },
    });
    const resRedact = await executeGeminiRequest('gemini-3.5-flash-lite', dummyKey, 'sys', 'usr');
    assert(!resRedact.safeMessage.includes(dummyKey), 'Raw API secret is strictly stripped from safeMessage');
    assert(resRedact.safeMessage.includes('[REDACTED_API_KEY]'), 'Key replaced with [REDACTED_API_KEY] marker');
  } finally {
    globalThis.fetch = originalFetch;
  }

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
