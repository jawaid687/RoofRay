import {
  validateAdvisorPayload,
  validateAdvisorResponseSchema,
  checkRateLimit,
  handleSolarAdvisorRequest,
  SolarAdvisorRequest,
  resolveGeminiModel,
  executeGeminiRequest,
  detectExplicitLocationInQuery,
  resolveLocationReconciliation,
} from '../src/server/advisorService';
import { KNOWLEDGE_CORPUS } from '../src/rag/knowledge/corpus';
import { calculateEmissions } from '../src/calculations/emissions';
import { LexicalRetrievalEngine } from '../src/rag/retrievalEngine';

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
      gridEmissionFactorKgPerKWh: 0.62,
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

  // -----------------------------------------------------------------
  // Test 9: Priority 6 Deterministic Context Accuracy & Location Suite
  // -----------------------------------------------------------------
  console.log('\n--- Test 9: Context Accuracy & Location Resolution (Priority 6) ---');
  const savedFetch = globalThis.fetch;
  const mockAiOutput = {
    summary: 'Executive assessment for rooftop solar viability.',
    recommendations: ['Install panels due True South (Azimuth 180°).', 'Maintain 0.8m perimeter safety buffer for access.'],
    advantages: ['High solar yield coverage.'],
    risks: ['Monsoon cloud attenuation requires annual auditing.'],
    assumptions: ['Clear-sky geometric calculation.'],
    next_steps: ['Obtain utility net metering approval under SREDA guidelines.'],
  };

  try {
    let capturedBody: any = null;
    function mockGeminiSuccess(customResponse = mockAiOutput) {
      globalThis.fetch = (async (_url: any, opts: any) => {
        if (opts?.body) {
          try {
            capturedBody = JSON.parse(opts.body);
          } catch {
            // ignore
          }
        }
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({
            candidates: [{ content: { parts: [{ text: JSON.stringify(customResponse) }] } }],
            modelVersion: 'gemini-3.5-flash-lite',
          }),
        } as unknown as Response;
      }) as unknown as typeof fetch;
    }

    // 9.1: Dhaka Location Question
    const dhakaPayload: SolarAdvisorRequest = {
      ...validPayload,
      userQuestion: 'Suggest optimal panel orientation and safety setbacks for a rooftop solar installation in Dhaka, Bangladesh.',
      location: { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
      financialResult: { ...validPayload.financialResult, currency: 'BDT', tariffPerKWh: 10.5 },
    };
    const dhakaLoc = detectExplicitLocationInQuery(dhakaPayload.userQuestion);
    assert(dhakaLoc?.city === 'Dhaka' && dhakaLoc?.country === 'Bangladesh', '9.1: Dhaka query explicitly detected with 23.81°N latitude');
    const dhakaRecon = resolveLocationReconciliation(dhakaPayload);
    assert(!dhakaRecon.hasLocationConflict, '9.1: No conflict when building is in Dhaka');
    mockGeminiSuccess();
    const resDhaka = await handleSolarAdvisorRequest(dhakaPayload, dummyKey);
    assert(resDhaka.configured === true && resDhaka.sources.some((s) => s.title.includes('SREDA')), '9.1: Dhaka inquiry attaches official SREDA citations');

    // 9.2: San Francisco Building Question
    const sfPayload: SolarAdvisorRequest = {
      ...validPayload,
      userQuestion: 'Evaluate solar array placement for Apex Lofts in San Francisco, California.',
      location: { city: 'San Francisco, CA', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
    };
    const sfLoc = detectExplicitLocationInQuery(sfPayload.userQuestion);
    assert(sfLoc?.country === 'United States', '9.2: San Francisco query explicitly detected');
    const sfRecon = resolveLocationReconciliation(sfPayload);
    assert(!sfRecon.hasLocationConflict, '9.2: No conflict when building is in SF');

    // 9.3: Explicit Location Differing from Selected Building (The Critical User Bug)
    const conflictPayload: SolarAdvisorRequest = {
      ...validPayload,
      selectedBuilding: { ...validPayload.selectedBuilding, name: 'Apex Lofts & Residences' },
      location: { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
      userQuestion: 'Suggest optimal panel orientation and safety setbacks for a rooftop solar installation in Dhaka, Bangladesh.',
    };
    const conflictRecon = resolveLocationReconciliation(conflictPayload);
    assert(conflictRecon.hasLocationConflict === true, '9.3: Location conflict detected between Dhaka query and SF building');
    assert(conflictRecon.effectiveTargetLocation.city === 'Dhaka', '9.3: Target location correctly routed to Dhaka');
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(conflictPayload, dummyKey);
    const systemInstructionText = capturedBody?.system_instruction?.parts?.[0]?.text || '';
    assert(systemInstructionText.includes('CRITICAL LOCATION DISCREPANCY'), '9.3: Prompt contains location discrepancy reconciliation directive');
    assert(systemInstructionText.includes('DO NOT DESCRIBE THE BUILDING AS BEING IN SAN FRANCISCO'), '9.3: Prompt strictly forbids describing building as in San Francisco');

    // 9.4: Missing Location in User Query
    const missingLocPayload: SolarAdvisorRequest = {
      ...validPayload,
      userQuestion: 'What is the recommended panel tilt angle and maintenance buffer?',
      location: { city: 'Sylhet', country: 'Bangladesh', latitude: 24.8949, longitude: 91.8687, timezone: 'Asia/Dhaka' },
    };
    assert(detectExplicitLocationInQuery(missingLocPayload.userQuestion) === null, '9.4: Generic query detected with no explicit location override');
    const missingLocRecon = resolveLocationReconciliation(missingLocPayload);
    assert(!missingLocRecon.hasLocationConflict && missingLocRecon.effectiveTargetLocation.city === 'Sylhet', '9.4: Preserves active building location (Sylhet) without conflict');

    // 9.5: Changed Building Selection
    const commercialBldgPayload: SolarAdvisorRequest = {
      ...validPayload,
      selectedBuilding: {
        id: 'bldg-comm-02',
        name: 'Dhaka Export Processing Center',
        width: 35,
        length: 50,
        height: 22,
        roofType: 'flat',
        obstaclesCount: 6,
        roofOrientation: 'horizontal flat (0° tilt)',
        roofAzimuthDeg: 0,
      },
    };
    assert(validateAdvisorPayload(commercialBldgPayload).valid, '9.5: Commercial building payload validates cleanly');
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(commercialBldgPayload, dummyKey);
    const bldgText = capturedBody?.system_instruction?.parts?.[0]?.text || '';
    assert(bldgText.includes('Dhaka Export Processing Center') && bldgText.includes('35m width x 50m length') && bldgText.includes('6 utility obstacles'), '9.5: System prompt synchronizes updated building geometry');

    // 9.6: Changed Panel Configuration
    const newPanelPayload: SolarAdvisorRequest = {
      ...validPayload,
      panelConfig: {
        panelName: 'TopCon Bi-Facial 550W',
        wattage: 550,
        tiltDegrees: 20,
        orientation: 'landscape',
      },
      energyProfile: {
        ...validPayload.energyProfile,
        installedCapacityKW: 19.8,
        panelCount: 36,
      },
    };
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(newPanelPayload, dummyKey);
    const panelText = capturedBody?.system_instruction?.parts?.[0]?.text || '';
    assert(panelText.includes('TopCon Bi-Facial 550W') && panelText.includes('19.8 kW') && panelText.includes('Tilt: 20°') && panelText.includes('landscape'), '9.6: System prompt reflects changed panel wattage, tilt, orientation and capacity');

    // 9.7: Changed Financial Assumptions
    const newFinPayload: SolarAdvisorRequest = {
      ...validPayload,
      financialResult: {
        totalSystemCost: 1850000,
        annualSavings: 285000,
        paybackYears: 6.5,
        twentyYearNetSavings: 3850000,
        roiPercent: 208.1,
        currency: 'BDT',
        tariffPerKWh: 14.5,
      },
    };
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(newFinPayload, dummyKey);
    const finText = capturedBody?.system_instruction?.parts?.[0]?.text || '';
    assert(finText.includes('৳1,850,000') && finText.includes('৳285,000/yr') && finText.includes('6.5 years') && finText.includes('৳14.5/kWh'), '9.7: System prompt preserves exact financial figures and currency (BDT)');

    // 9.8: Missing Simulation Results (Before running annual analysis)
    const missingSimPayload: SolarAdvisorRequest = {
      ...validPayload,
      solarAnalysis: undefined,
    };
    assert(validateAdvisorPayload(missingSimPayload).valid, '9.8: Missing simulation results payload validates without throwing');
    mockGeminiSuccess();
    const missingSimRes = await handleSolarAdvisorRequest(missingSimPayload, dummyKey);
    assert(missingSimRes.configured === true, '9.8: Advisor generates response gracefully even without completed simulation');

    // 9.9: Invalid Numerical Context
    const invalidFin = { ...validPayload, financialResult: { ...validPayload.financialResult, totalSystemCost: -5000 } };
    assert(!validateAdvisorPayload(invalidFin).valid, '9.9: Negative system cost rejected');
    const invalidEnergy = { ...validPayload, energyProfile: { ...validPayload.energyProfile, annualGenerationKWh: -100 } };
    assert(!validateAdvisorPayload(invalidEnergy).valid, '9.9: Negative annual generation rejected');
    const invalidDim = { ...validPayload, selectedBuilding: { ...validPayload.selectedBuilding, length: 0 } };
    assert(!validateAdvisorPayload(invalidDim).valid, '9.9: Zero building dimension rejected');

    // 9.10: Citation Validation (Integrity & Origin)
    mockGeminiSuccess();
    const citationRes = await handleSolarAdvisorRequest(dhakaPayload, dummyKey);
    assert(Array.isArray(citationRes.sources) && citationRes.sources.length === 3, '9.10: Exactly 3 grounded citations attached');
    for (const src of citationRes.sources) {
      assert(src.url !== undefined && src.url.startsWith('http'), '9.10: Citation contains authentic HTTP link');
      const inCorpus = KNOWLEDGE_CORPUS.some((c) => c.title === src.title);
      assert(inCorpus, `9.10: Source title "${src.title}" verified against knowledge corpus`);
      assert(!src.relevance.includes('undefined'), '9.10: Relevance string is properly formatted');
    }

    // --- Test 10: Conversational Multi-Turn Experience ---
    console.log('\n--- Test 10: Multi-Turn Conversation Experience ---');
    const validChatPayload: SolarAdvisorRequest = {
      ...validPayload,
      userQuestion: 'What is the estimated payback period for this setup?',
      conversationHistory: [
        { role: 'user', content: 'Suggest optimal panel orientation and safety setbacks for a rooftop solar installation in Dhaka, Bangladesh.' },
        { role: 'assistant', content: 'In Dhaka, Bangladesh, orient panels True South at 15° tilt with 0.8m setbacks.' },
      ],
    };

    assert(validateAdvisorPayload(validChatPayload).valid, '10.1: Payload with conversationHistory validates cleanly');

    // Reject non-array conversationHistory
    const invalidHistoryType = { ...validPayload, conversationHistory: 'invalid' as any };
    assert(!validateAdvisorPayload(invalidHistoryType).valid, '10.2: Non-array conversationHistory rejected');

    // Reject invalid message role
    const invalidRoleHistory = {
      ...validPayload,
      conversationHistory: [{ role: 'invalid_role' as any, content: 'Hello' }],
    };
    assert(!validateAdvisorPayload(invalidRoleHistory).valid, '10.3: Invalid message role in history rejected');

    // Verify multi-turn location persistence (Dhaka mentioned in turn 1 is preserved in turn 2)
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(validChatPayload, dummyKey);
    const multiTurnText = capturedBody?.contents?.[0]?.parts?.[0]?.text || '';
    assert(multiTurnText.includes('PRIOR CONVERSATION CONTEXT'), '10.4: Prior conversation history injected into user prompt');
    assert(multiTurnText.includes('Dhaka, Bangladesh'), '10.5: Prior turn inquiry location preserved in conversational context');
    assert(multiTurnText.includes('What is the estimated payback period for this setup?'), '10.6: Current follow-up question properly framed');

    // -----------------------------------------------------------------
    // Test 11: Priority 7 Regulatory RAG, Carbon & Financial Transparency Suite
    // -----------------------------------------------------------------
    console.log('\n--- Test 11: Regulatory RAG, Carbon & Financial Transparency Suite ---');

    // 11.1: Single-phase consumer eligibility under 2025 guidelines
    const sreda2025Chunk = KNOWLEDGE_CORPUS.find((c) => c.id === 'sreda-net-metering-guidelines-2025');
    assert(Boolean(sreda2025Chunk), '11.1: SREDA Net Metering Guidelines 2025 chunk exists in knowledge corpus');
    assert(
      Boolean(sreda2025Chunk?.content.includes('both single-phase and three-phase electricity consumers')),
      '11.1: 2025 guidelines explicitly include single-phase consumers'
    );

    // 11.2: Three-phase consumer eligibility and inverter phase matching
    assert(
      Boolean(sreda2025Chunk?.content.includes('Inverter phase output must strictly match the consumer service connection phase')),
      '11.2: 2025 guidelines enforce matching inverter phase to consumer service connection'
    );

    // 11.3: 100% sanctioned-load AC capacity limit
    assert(
      Boolean(sreda2025Chunk?.content.includes('100% of the consumer sanctioned load')),
      '11.3: 2025 guidelines specify 100% sanctioned load cap (superseding 70%)'
    );
    mockGeminiSuccess();
    await handleSolarAdvisorRequest(dhakaPayload, dummyKey);
    const dhakaPrompt = capturedBody?.system_instruction?.parts?.[0]?.text || '';
    assert(
      dhakaPrompt.includes('100% of the consumer sanctioned load') || dhakaPrompt.includes('100% sanctioned load cap'),
      '11.3: System prompt mandates 100% sanctioned load limit for Bangladesh'
    );

    // 11.4: 80% transformer capacity limit for applicable voltage classes
    assert(
      Boolean(sreda2025Chunk?.content.includes('80% of the rated distribution transformer')),
      '11.4: 2025 guidelines enforce 80% distribution transformer/substation limit for MV/HT/EHT'
    );

    // 11.5: IEC 62116 / IEC 61727 / IEEE 1547 anti-islanding <= 2.0s requirement
    const standardsChunk = KNOWLEDGE_CORPUS.find((c) => c.id === 'sreda-technical-standards');
    assert(Boolean(standardsChunk), '11.5: SREDA technical standards chunk exists');
    assert(
      Boolean(standardsChunk?.content.includes('IEC 62116')) &&
      Boolean(standardsChunk?.content.includes('IEC 61727 or IEEE 1547')) &&
      (Boolean(standardsChunk?.content.includes('2.0 seconds')) || Boolean(standardsChunk?.content.includes('2 seconds'))),
      '11.5: Standards accurately distinguish IEC 62116 anti-islanding testing, IEC 61727/IEEE 1547 interconnection, and <= 2.0s disconnect'
    );

    // 11.6: 0.62 emission-factor calculation (6056 kWh × 0.62 / 1000 = 3.755 tonnes CO2)
    const carbonCalc = calculateEmissions(6056, 0.62);
    assert(carbonCalc.annualCO2ReductionKg === 3755, '11.6: 6,056 kWh yields exactly 3,755 kg CO2 reduction at 0.62 kg/kWh');
    assert(carbonCalc.annualCO2ReductionTonnes === 3.755, '11.6: 6,056 kWh yields exactly 3.755 tonnes CO2 reduction');
    assert(
      Boolean(carbonCalc.gridEmissionFactorSource?.includes('2021–2023 reporting period')),
      '11.6: Grid emission factor explicitly cites 2021-2023 reporting period'
    );

    // 11.7: Rajshahi vs Dhaka location synchronization for Meridian Commercial Tower
    const meridianPayload: SolarAdvisorRequest = {
      ...validPayload,
      selectedBuilding: {
        id: 'bldg-2',
        name: 'Meridian Commercial Tower',
        width: 14,
        length: 15,
        height: 26,
        roofType: 'flat',
        obstaclesCount: 2,
        city: 'Rajshahi',
        country: 'Bangladesh',
        latitude: 24.3636,
        longitude: 88.6241,
      },
      userQuestion: 'What is the optimal solar panel orientation for Meridian Commercial Tower in Bangladesh?',
    };
    const meridianRecon = resolveLocationReconciliation(meridianPayload);
    assert(
      meridianRecon.effectiveTargetLocation.city === 'Rajshahi' &&
      meridianRecon.effectiveTargetLocation.latitude === 24.3636 &&
      meridianRecon.effectiveTargetLocation.country === 'Bangladesh',
      '11.7: Meridian Commercial Tower synchronizes to Rajshahi, Bangladesh (24.3636°N, 88.6241°E)'
    );
    assert(
      meridianRecon.hasLocationConflict === false,
      '11.7: Query for Meridian Tower does not falsely conflict or default to Dhaka'
    );

    // 11.8: Missing interval consumption data financial disclosure
    assert(
      dhakaPrompt.includes('annual energy coverage') &&
      dhakaPrompt.includes('Do NOT claim actual real-time self-consumption without 15-minute / hourly interval smart meter load profile data'),
      '11.8: Missing interval consumption data disclosure enforced in system prompt'
    );

    // 11.9: Flat-tariff vs actual net-metering savings disclosure & 20-year projection limitations
    assert(
      dhakaPrompt.includes('annualized flat-tariff net-metering estimate') &&
      dhakaPrompt.includes('Annual PV module degradation (~0.5%/year)') &&
      dhakaPrompt.includes('Inverter replacement required around year 10–12') &&
      dhakaPrompt.includes('operations and maintenance costs (O&M ~1%/year of capex)'),
      '11.9: Flat-tariff and 20-year lifecycle disclosures (degradation, inverter replacement, O&M) mandated'
    );

    // 11.10: Correct citation retrieval from 2025 guideline over 2018
    const engine = new LexicalRetrievalEngine(KNOWLEDGE_CORPUS);
    const sredaSearchResults = engine.search('Bangladesh SREDA net metering guidelines sanctioned load', 3);
    assert(sredaSearchResults.length > 0, '11.10: Search for SREDA net metering returns results');
    assert(
      sredaSearchResults[0].chunk.id === 'sreda-net-metering-guidelines-2025',
      `11.10: SREDA 2025 guideline ranks #1 (${sredaSearchResults[0].chunk.id}) over 2018 historical reference`
    );
    assert(
      sredaSearchResults[0].chunk.publicationYear === 2025,
      '11.10: Top ranked chunk is official 2025 publication'
    );
  } finally {
    globalThis.fetch = savedFetch;
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
