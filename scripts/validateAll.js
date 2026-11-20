import http from 'http';
import fs from 'fs';
import { server, startServer, shutdownServer } from '../server/server.ts';
import { parseNasaPowerPayload, fetchNasaSolarResource } from '../src/services/solarResourceService.ts';
import { formatCurrency, getCurrencySymbol, getDefaultFinancialParams } from '../src/utils/currency.ts';
import { calculateFinancials } from '../src/calculations/financial.ts';
import { calculateEmissions } from '../src/calculations/emissions.ts';
import { translations } from '../src/i18n/translations.ts';
import { PANEL_TYPES } from '../src/data/panelTypes.ts';

async function runValidation() {
  console.log('🧪 Starting RoofRay Comprehensive Validation Suite...\n');
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
  // 1. Production Server & Security Tests (Port 3008)
  // ----------------------------------------------------
  console.log('1. Testing Production Server & Security Controls...');
  const testPort = 3008;
  await startServer(testPort);

  try {
    // Unique Application Markers on / and /app
    const resRoot = await fetch(`http://localhost:${testPort}/`);
    assert(resRoot.status === 200, 'Production GET / returns HTTP 200');
    assert(resRoot.headers.get('content-type')?.includes('text/html'), 'Production GET / returns text/html');
    const htmlRoot = await resRoot.text();
    assert(
      htmlRoot.includes('id="root"') && htmlRoot.includes('AI-Powered 3D Solar Rooftop Planning & Recommendation Platform'),
      'Root HTML includes unique application shell markers (id="root" & full platform title)'
    );

    const resApp = await fetch(`http://localhost:${testPort}/app`);
    assert(resApp.status === 200, 'Production GET /app returns HTTP 200 (direct refresh)');
    assert(resApp.headers.get('content-type')?.includes('text/html'), 'Production GET /app returns text/html');
    const htmlApp = await resApp.text();
    assert(
      htmlApp.includes('id="root"') && htmlApp.includes('solar-favicon.svg'),
      '/app HTML includes unique application shell markers (id="root" & solar favicon)'
    );

    // Health Endpoint
    const resHealth = await fetch(`http://localhost:${testPort}/api/ai/health`);
    assert(resHealth.status === 200, 'Production GET /api/ai/health returns HTTP 200');
    const healthJson = await resHealth.json();
    assert(healthJson.status === 'ok', 'Health status is "ok"');
    assert(healthJson.service.includes('RoofRay'), 'Service name is RoofRay');
    assert(typeof healthJson.keyConfigured === 'boolean', 'keyConfigured is a boolean flag');
    assert(healthJson.dailyQuota?.limitPerInstance === 500, 'Daily AI quota limit (500 req/day) is documented in health metadata');

    // AI Advisor Endpoint
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
        annualSavings: 120487.5,
        paybackYears: 6.0,
        twentyYearNetSavings: 1687250,
        roiPercent: 233.5,
        currency: 'BDT',
        tariffPerKWh: 10.5,
      },
      environmentalResult: {
        annualCO2ReductionTonnes: 7.11,
        equivalentTreesPlanted: 121,
        gridEmissionFactorKgPerKWh: 0.62,
        gridEmissionFactorSource: 'Department of Environment (DoE) & SREDA Bangladesh (2023 Grid Emission Factors Report, 2021–2023 reporting period: 0.620 kg CO2/kWh)',
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

    // Helper for raw HTTP requests (bypassing fetch's client-side URL normalization)
    function rawHttpGet(pathStr) {
      return new Promise((resolve, reject) => {
        const req = http.request({ host: 'localhost', port: testPort, path: pathStr, method: 'GET' }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        req.end();
      });
    }

    // Security Test: Canonical Path Traversal Defense
    const resTraversal1 = await rawHttpGet('/..%2f..%2fpackage.json');
    assert(resTraversal1.status === 403, 'Path traversal attack (/..%2f..%2fpackage.json) strictly returns 403 Forbidden');

    const resTraversal2 = await rawHttpGet('/%2e%2e/%2e%2e/package.json');
    assert(resTraversal2.status === 403, 'Encoded traversal attack (/%2e%2e/%2e%2e/package.json) strictly returns 403 Forbidden');

    // Security Test: Sibling Directory Prefix Attack Defense
    const resSibling = await fetch(`http://localhost:${testPort}/dist_sibling/secret.txt`);
    assert(resSibling.status === 404 || resSibling.status === 403, 'Sibling directory prefix attack strictly contained');

    // Security Test: Malformed URL Encoding
    const resMalformedUrl = await fetch(`http://localhost:${testPort}/%FF`);
    assert(resMalformedUrl.status === 400, 'Malformed URL encoding (%FF) returns HTTP 400 Bad Request');

    // Security Test: Disallowed CORS Origin
    const resDisallowedCors = await fetch(`http://localhost:${testPort}/api/ai/health`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://malicious-attacker.com' },
    });
    assert(resDisallowedCors.status === 403, 'OPTIONS preflight from disallowed origin returns HTTP 403');
    assert(
      !resDisallowedCors.headers.get('access-control-allow-origin')?.includes('malicious-attacker'),
      'Disallowed origin does NOT receive Access-Control-Allow-Origin header'
    );

    // Security Test: Allowed CORS Origin
    const resAllowedCors = await fetch(`http://localhost:${testPort}/api/ai/health`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:3000' },
    });
    assert(resAllowedCors.status === 204, 'OPTIONS preflight from allowed origin returns HTTP 204');
    assert(
      resAllowedCors.headers.get('access-control-allow-origin') === 'http://localhost:3000',
      'Allowed origin receives correct Access-Control-Allow-Origin header'
    );

    // Security Test: Request-Size Limits (> 100KB)
    const largeBody = JSON.stringify({ data: 'X'.repeat(120 * 1024) });
    const resOversized = await fetch(`http://localhost:${testPort}/api/ai/solar-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largeBody,
    });
    assert(resOversized.status === 413, 'Oversized payload (>100KB) strictly rejected with HTTP 413 Payload Too Large');

    // Security Test: SPA 404 Fallthrough Defense
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

    // Security Test: Standard Defense-in-Depth Headers
    assert(resRoot.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header present');
    assert(resRoot.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header present');
    assert(resRoot.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Referrer-Policy header present');

    // Performance Test: HTTP Gzip Compression
    const cssFile = fs.existsSync('dist/assets')
      ? (fs.readdirSync('dist/assets').find(f => f.endsWith('.css')) || '')
      : '';
    const gzipTargetPath = cssFile ? `/assets/${cssFile}` : '/';

    const rawGzipRes = await new Promise((resolve) => {
      const req = http.request({
        host: 'localhost',
        port: testPort,
        path: gzipTargetPath,
        method: 'GET',
        headers: { 'Accept-Encoding': 'gzip' }
      }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
      req.end();
    });
    if (rawGzipRes.status === 200) {
      assert(rawGzipRes.headers['content-encoding'] === 'gzip', 'Compressible static asset served with Content-Encoding: gzip');
      assert(rawGzipRes.headers['vary'] === 'Accept-Encoding', 'Vary: Accept-Encoding header set on compressed response');
    }

    // Health & Observability: Liveness & Readiness Probes
    assert(typeof healthJson.uptimeSeconds === 'number', 'Health check reports process uptime in seconds');
    assert(typeof healthJson.memoryUsage === 'object', 'Health check reports memory usage');
    assert(healthJson.circuitBreaker?.state === 'CLOSED', 'Circuit breaker is monitored in health metadata');
    assert(healthJson.liveness === true, 'Liveness flag present in health check');
    assert(healthJson.readiness === true, 'Readiness flag present in health check');

    const resLiveness = await fetch(`http://localhost:${testPort}/api/health/liveness`);
    assert(resLiveness.status === 200, 'GET /api/health/liveness returns HTTP 200');
    const livenessJson = await resLiveness.json();
    assert(livenessJson.liveness === true, 'Liveness probe reports true');

    const resReadiness = await fetch(`http://localhost:${testPort}/api/health/readiness`);
    assert(resReadiness.status === 200, 'GET /api/health/readiness returns HTTP 200');
    const readinessJson = await resReadiness.json();
    assert(readinessJson.readiness === true, 'Readiness probe reports true');

    // DDIA Data Layer: Project Persistence API Endpoints
    const testProjectPayload = {
      name: 'Integration Test Solar Layout',
      buildingId: 'building-1',
      location: {
        city: 'San Francisco',
        country: 'United States',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
      },
      panelConfig: {
        panelId: 'panel-1',
        panelName: 'Mono PERC 400W',
        wattage: 400,
        tiltDegrees: 20,
        orientation: 'portrait',
      },
      placedPanels: [
        { id: 'panel-01', x: 5, y: 5, width: 1.13, height: 1.72, orientation: 'portrait', tiltDeg: 20, azimuthDeg: 180, efficiency: 0.20, wattage: 400 }
      ],
      financialParams: {
        currency: 'USD',
        tariffPerKWh: 0.28,
        exportCreditRatio: 0.5,
      },
      simulationSummary: {
        installedCapacityKW: 0.4,
        panelCount: 1,
        annualGenerationKWh: 580,
        annualConsumptionKWh: 3000,
        solarCoveragePercent: 19.3,
        surplusKWh: 0,
        totalSystemCost: 1120,
        annualSavings: 162.4,
        paybackYears: 6.9,
        twentyYearNetSavings: 2128,
        roiPercent: 190,
        annualCO2ReductionTonnes: 0.24,
        equivalentTreesPlanted: 4,
      }
    };

    const resSaveProject = await fetch(`http://localhost:${testPort}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProjectPayload),
    });
    assert(resSaveProject.status === 201, 'POST /api/projects returns HTTP 201 Created');
    const saveProjectJson = await resSaveProject.json();
    assert(saveProjectJson.success === true && typeof saveProjectJson.project?.id === 'string', 'Project saved with valid ID');
    const createdProjectId = saveProjectJson.project.id;

    // GET /api/projects (List)
    const resListProjects = await fetch(`http://localhost:${testPort}/api/projects`);
    assert(resListProjects.status === 200, 'GET /api/projects returns HTTP 200');
    const listProjectsJson = await resListProjects.json();
    assert(Array.isArray(listProjectsJson.projects), 'Projects list is an array');
    assert(listProjectsJson.projects.some(p => p.id === createdProjectId), 'Saved project is listed in project catalog');

    // GET /api/projects/:id (Read)
    const resGetProject = await fetch(`http://localhost:${testPort}/api/projects/${createdProjectId}`);
    assert(resGetProject.status === 200, 'GET /api/projects/:id returns HTTP 200');
    const getProjectJson = await resGetProject.json();
    assert(getProjectJson.project.id === createdProjectId, 'Retrieved project ID matches created ID');
    assert(getProjectJson.project.name === 'Integration Test Solar Layout', 'Retrieved project name matches');

    // Security: Malicious Project ID traversal
    const resBadProjId = await fetch(`http://localhost:${testPort}/api/projects/..%2f..%2fetc`);
    assert(resBadProjId.status === 400 || resBadProjId.status === 403 || resBadProjId.status === 404, 'Invalid/traversal project ID safely rejected');

    // DELETE /api/projects/:id
    const resDeleteProject = await fetch(`http://localhost:${testPort}/api/projects/${createdProjectId}`, {
      method: 'DELETE',
    });
    assert(resDeleteProject.status === 200, 'DELETE /api/projects/:id returns HTTP 200');

    // Verify deletion
    const resGetDeleted = await fetch(`http://localhost:${testPort}/api/projects/${createdProjectId}`);
    assert(resGetDeleted.status === 404, 'GET deleted project returns HTTP 404 Not Found');
  } finally {
    await shutdownServer(1000);
  }

  // ----------------------------------------------------
  // 2. Deterministic NASA POWER Climatology Tests (Fixtures)
  // ----------------------------------------------------
  console.log('\n2. Testing Deterministic NASA POWER Climatology...');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const mockAllSky = {};
  const mockClrSky = {};
  const mockT2M = {};
  months.forEach((m) => {
    mockAllSky[m] = 4.5;
    mockClrSky[m] = 5.8;
    mockT2M[m] = null; // Unrecorded temperature
  });

  const validMockPayload = {
    properties: {
      parameter: {
        ALLSKY_SFC_SW_DWN: mockAllSky,
        CLRSKY_SFC_SW_DWN: mockClrSky,
        T2M: mockT2M,
      },
    },
  };

  const parsedNasa = parseNasaPowerPayload(validMockPayload, 23.81, 90.41);
  assert(parsedNasa.available === true, 'NASA fixture parsed successfully with available: true');
  assert(parsedNasa.monthly.length === 12, 'NASA fixture yields exactly 12 monthly climatology records');
  assert(parsedNasa.annualAverageAllSkyKWhM2Day === 4.5, 'NASA all-sky insolation average is 4.5 kWh/m²/day');
  assert(parsedNasa.annualAverageClearSkyKWhM2Day === 5.8, 'NASA clear-sky insolation average is 5.8 kWh/m²/day');
  assert(parsedNasa.monthly[0].ambientTempC === null, 'NASA unrecorded temperature strictly preserved as null');

  // Verify missing clear-sky is never substituted with all-sky
  let clearSkySubstBlocked = false;
  try {
    const incompletePayload = {
      properties: {
        parameter: {
          ALLSKY_SFC_SW_DWN: mockAllSky,
          // CLRSKY omitted
        },
      },
    };
    parseNasaPowerPayload(incompletePayload, 23.81, 90.41);
  } catch (err) {
    clearSkySubstBlocked = true;
  }
  assert(clearSkySubstBlocked, 'Missing clear-sky irradiance is strictly rejected and never substituted with all-sky');

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
  assert(finResult80.annualSavings > finResult50.annualSavings, 'Configurable export credit ratio directly increases surplus savings');
  assert(finResult50.exportCreditRatio === 0.5, '50% export credit ratio recorded');
  assert(finResult80.exportCreditRatio === 0.8, '80% export credit ratio recorded');

  // Location-dependent emissions test
  const bdEmissions = calculateEmissions(10000, 0.62, 'DoE & SREDA Bangladesh National Grid Factor (2023, 2021–2023 reporting period): 0.620 kg CO2/kWh');
  assert(bdEmissions.annualCO2ReductionKg === 6200, 'Bangladesh grid emission yields 6,200 kg CO2 abated for 10,000 kWh');
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
  assert(translations.en.locationTime.simple === 'Simple', 'English locationTime.simple is "Simple"');
  assert(translations.bn.locationTime.simple === 'সহজ', 'Bangla locationTime.simple is "সহজ"');
  assert(translations.en.solarAnalysis.reanalyzePotential === 'Re-analyze Solar Potential', 'English reanalyzePotential translated');
  assert(translations.bn.solarAnalysis.reanalyzePotential === 'সৌর সম্ভাবনা পুনরায় বিশ্লেষণ করুন', 'Bangla reanalyzePotential translated');

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
