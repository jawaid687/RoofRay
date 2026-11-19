import fs from 'fs';
import path from 'path';
import {
  handleSolarAdvisorRequest,
  validateAdvisorResponseSchema,
  SolarAdvisorRequest,
  DEFAULT_GEMINI_MODEL,
  STABLE_FALLBACK_MODEL,
} from '../src/server/advisorService';

// Zero-dependency .env loader supporting local environment
function loadEnv() {
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        let v = trimmed.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!(k in process.env)) {
          process.env[k] = v;
        }
      }
    }
  }
}

loadEnv();

async function runGeminiLiveSuite() {
  console.log('🤖 RoofRay V3.3 — Live Google Gemini & AQ Authentication Test Suite\n');
  console.log('================================================================');

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

  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  const configuredModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  // ----------------------------------------------------
  // TEST 1: Key Configuration
  // ----------------------------------------------------
  console.log('\n--- 1. Key Configuration Verification ---');
  const hasKey = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10);
  assert(hasKey, 'GEMINI_API_KEY is configured in server environment');
  assert(apiKey.length >= 30, `Key has authentic token length (${apiKey.length} characters)`);
  
  const isAqFormat = apiKey.startsWith('AQ.');
  console.log(`   • Key Format Detected: ${isAqFormat ? 'Google AQ Authorization Key (AQ...)' : 'Standard Google AI Studio Key'}`);
  console.log(`   • Sanitized Key Preview: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (${apiKey.length} chars)`);
  console.log(`   • Configured Target Model: ${configuredModel}`);
  console.log(`   • Stable Fallback Model: ${STABLE_FALLBACK_MODEL}`);

  if (!hasKey) {
    console.error('\n❌ ABORT: Cannot proceed with live tests without GEMINI_API_KEY.');
    process.exit(1);
  }

  // ----------------------------------------------------
  // TEST 2: Model Availability via Models Endpoint
  // ----------------------------------------------------
  console.log('\n--- 2. Model Availability Verification ---');
  let availableModels: string[] = [];
  try {
    const listRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    assert(listRes.status === 200, `GET /v1beta/models responded with HTTP 200 (status: ${listRes.status})`);
    
    if (listRes.ok) {
      const listJson = await listRes.json();
      availableModels = (listJson?.models || []).map((m: any) => m.name.replace('models/', ''));
      console.log(`   • Total Available Models: ${availableModels.length}`);
      
      const hasConfigured = availableModels.includes(configuredModel);
      assert(hasConfigured, `Configured model "${configuredModel}" is present in authorized models catalog`);

      const hasFallback = availableModels.includes(STABLE_FALLBACK_MODEL);
      assert(hasFallback, `Stable fallback model "${STABLE_FALLBACK_MODEL}" is present in authorized models catalog`);
    } else {
      const errData = await listRes.json().catch(() => null);
      console.error('   • Models listing error:', errData);
      assert(false, 'Models listing succeeded');
    }
  } catch (err: any) {
    assert(false, 'Models endpoint reachable without network failure', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Minimal Text-Generation Request
  // ----------------------------------------------------
  console.log(`\n--- 3. Minimal Text Generation Request ---`);
  let minimalGenerationSucceeded = false;
  let activeTestedModel = configuredModel;

  try {
    const ctrl1 = new AbortController();
    const tId1 = setTimeout(() => ctrl1.abort(), 12000);
    let minGenRes: Response | null = null;
    let minJson: any = null;
    let timedOut = false;

    try {
      minGenRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with the exact word: ROOFRAY_ONLINE' }] }],
        }),
        signal: ctrl1.signal,
      });
      clearTimeout(tId1);
      minJson = await minGenRes.json().catch(() => null);
    } catch (fetchErr: any) {
      clearTimeout(tId1);
      if (fetchErr.name === 'AbortError') {
        timedOut = true;
        console.log(`   • ${configuredModel} Timed out after 12s (high queuing latency on preview cluster)`);
      } else {
        throw fetchErr;
      }
    }

    if (minGenRes && minGenRes.ok) {
      console.log(`   • ${configuredModel} HTTP Status: ${minGenRes.status} ${minGenRes.statusText}`);
      const replyText = minJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      assert(Boolean(replyText), `Minimal text generation returned candidate output: "${replyText}"`);
      minimalGenerationSucceeded = true;
    } else {
      if (minGenRes) {
        console.log(`   • ${configuredModel} HTTP Status: ${minGenRes.status} ${minGenRes.statusText}`);
        const providerMsg = minJson?.error?.message || 'Unknown error';
        console.log(`   • Provider Error Message: ${providerMsg}`);
        console.log(`   • Provider Status: ${minJson?.error?.status || minGenRes.status}`);
      }

      const shouldFallback = timedOut || (minGenRes && (minGenRes.status === 503 || minGenRes.status === 404));
      if (shouldFallback) {
        console.log(`   ⚠️ Model "${configuredModel}" unavailable or queued. Testing fallback model "${STABLE_FALLBACK_MODEL}"...`);
        const ctrl2 = new AbortController();
        const tId2 = setTimeout(() => ctrl2.abort(), 15000);
        const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${STABLE_FALLBACK_MODEL}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with the exact word: ROOFRAY_ONLINE' }] }],
          }),
          signal: ctrl2.signal,
        });
        clearTimeout(tId2);

        console.log(`   • ${STABLE_FALLBACK_MODEL} HTTP Status: ${fallbackRes.status} ${fallbackRes.statusText}`);
        const fallbackJson = await fallbackRes.json().catch(() => null);
        if (fallbackRes.ok) {
          const fallbackText = fallbackJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          assert(Boolean(fallbackText), `Fallback model "${STABLE_FALLBACK_MODEL}" generation succeeded: "${fallbackText}"`);
          minimalGenerationSucceeded = true;
          activeTestedModel = STABLE_FALLBACK_MODEL;
        } else {
          assert(false, `Fallback generation failed with HTTP ${fallbackRes.status}`);
        }
      } else {
        assert(false, `Minimal generation failed with HTTP ${minGenRes?.status}`);
      }
    }
  } catch (err: any) {
    assert(false, 'Minimal generation request completed without network error', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: Full AI Solar Advisor Request
  // ----------------------------------------------------
  console.log('\n--- 4. Full AI Solar Advisor Synthesis Request ---');
  const samplePayload: SolarAdvisorRequest = {
    userQuestion: 'Evaluate my 8.5 kW residential solar system in Dhaka for financial return and SREDA net metering viability.',
    selectedBuilding: {
      id: 'bldg-residential-01',
      name: 'Dhanmondi Residential Building',
      width: 15,
      length: 16,
      height: 18,
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
    solarAnalysis: {
      annualExposurePercent: 92.4,
      unshadedAreaM2: 210,
      recommendedZoneAreaM2: 180,
    },
    energyProfile: {
      installedCapacityKW: 8.5,
      panelCount: 20,
      annualGenerationKWh: 12410,
      annualConsumptionKWh: 14000,
      solarCoveragePercent: 88.6,
      surplusKWh: 850,
    },
    financialResult: {
      totalSystemCost: 722500,
      annualSavings: 130305,
      paybackYears: 5.5,
      twentyYearNetSavings: 1883600,
      roiPercent: 260.7,
      currency: 'BDT',
      tariffPerKWh: 10.5,
    },
    environmentalResult: {
      annualCO2ReductionTonnes: 7.9,
      equivalentTreesPlanted: 131,
      gridEmissionFactorKgPerKWh: 0.637,
      gridEmissionFactorSource: 'DoE & SREDA Bangladesh Grid Baseline (2023)',
    },
    panelConfig: {
      panelName: 'Mono PERC 425W',
      wattage: 425,
      tiltDegrees: 15,
      orientation: 'portrait',
    },
  };

  let advisorResponse: any = null;
  try {
    advisorResponse = await handleSolarAdvisorRequest(samplePayload, apiKey);

    assert(advisorResponse.configured === true, 'AI Advisor reports configured: true');
    assert(!advisorResponse.error, `AI Advisor completed without error (error: ${advisorResponse.error || 'none'})`);
    assert(Boolean(advisorResponse.summary), 'AI Advisor generated executive summary');
    assert(advisorResponse.recommendations.length > 0, `Recommendations generated (${advisorResponse.recommendations.length} items)`);
    assert(advisorResponse.sources.length > 0, `Authentic Lexical RAG sources attached (${advisorResponse.sources.length} citations)`);
    console.log(`   • Model Used: ${advisorResponse.modelUsed}`);
    console.log(`   • Summary Snippet: "${advisorResponse.summary.slice(0, 120)}..."`);
  } catch (err: any) {
    assert(false, 'handleSolarAdvisorRequest completed without throwing', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: Structured JSON Response Schema Validation
  // ----------------------------------------------------
  console.log('\n--- 5. Structured JSON Response Schema Validation ---');
  if (advisorResponse) {
    const schemaValidation = validateAdvisorResponseSchema({
      summary: advisorResponse.summary,
      recommendations: advisorResponse.recommendations,
      advantages: advisorResponse.advantages,
      risks: advisorResponse.risks,
      assumptions: advisorResponse.assumptions,
      next_steps: advisorResponse.next_steps,
    });

    assert(schemaValidation.valid === true, 'AI Advisor response strictly validates against schema');
    assert(typeof advisorResponse.summary === 'string', 'Summary is valid string');
    assert(Array.isArray(advisorResponse.recommendations), 'Recommendations is valid string array');
    assert(Array.isArray(advisorResponse.advantages), 'Advantages is valid string array');
    assert(Array.isArray(advisorResponse.risks), 'Risks is valid string array');
    assert(Array.isArray(advisorResponse.assumptions), 'Assumptions is valid string array');
    assert(Array.isArray(advisorResponse.next_steps), 'Next steps is valid string array');
    
    // Check that items are pure strings (no [object Object])
    const hasOnlyStrings = advisorResponse.recommendations.every((item: any) => typeof item === 'string');
    assert(hasOnlyStrings, 'All recommendation array items are strictly strings (no [object Object] serialization)');
  } else {
    assert(false, 'Advisor response schema validated (no response received)');
  }

  console.log('\n================================================================');
  console.log(`Live Gemini Integration Suite: ${passed} passed, ${failed} failed.`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGeminiLiveSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
