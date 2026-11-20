import {
  cleanupRateLimitStore,
  resetRateLimitStore,
  getRateLimitStats,
  checkRateLimit,
  CircuitBreaker,
} from '../src/server/advisorService';

import {
  saveProject,
  getProject,
  listProjects,
  deleteProject,
  validateProjectPayload,
  isValidProjectId,
} from '../server/projectStore';

import { useSolarStore } from '../src/store/useSolarStore';

export async function runSystemDesignTests(): Promise<{ passed: number; failed: number }> {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  console.log('🛡️  Starting System Design & Production Resilience Test Suite...');
  // ========================================================
  // 1. Rate Limiter Memory Leak & Eviction Tests
  // ========================================================
  console.log('\n1. Testing Rate Limiter Memory Leak Prevention & Eviction...');
  resetRateLimitStore();

  assert(getRateLimitStats().trackedIpsCount === 0, 'Rate limiter store starts empty after reset');

  // Populate multiple IPs
  for (let i = 0; i < 50; i++) {
    checkRateLimit(`192.168.1.${i}`);
  }
  assert(getRateLimitStats().trackedIpsCount === 50, 'Tracked IPs count accurately reflects 50 active IPs');

  // Simulate time passage past window (61 seconds in future)
  const futureTime = Date.now() + 65 * 1000;
  const pruned = cleanupRateLimitStore(futureTime);
  assert(pruned === 50, 'cleanupRateLimitStore successfully purges all 50 expired IP entries');
  assert(getRateLimitStats().trackedIpsCount === 0, 'Rate limiter map is completely empty after expiration cleanup');

  // Verify rate limit enforcement for rapid bursts
  const testIp = '10.0.0.1';
  let allowedCount = 0;
  for (let i = 0; i < 35; i++) {
    if (checkRateLimit(testIp)) {
      allowedCount++;
    }
  }
  assert(allowedCount === 30, 'Sliding window permits exactly 30 requests per minute');
  assert(!checkRateLimit(testIp), '31st request is strictly rejected with false (429 condition)');

  // ========================================================
  // 2. Upstream AI Circuit Breaker Tests
  // ========================================================
  console.log('\n2. Testing AI Advisor Circuit Breaker...');
  const breaker = new CircuitBreaker(3, 1000); // 3 failures threshold, 1000ms cooldown

  assert(breaker.getState() === 'CLOSED', 'Circuit breaker starts in CLOSED state');
  assert(breaker.canExecute() === true, 'Circuit breaker allows execution when CLOSED');

  // Record 2 failures (below threshold of 3)
  breaker.recordFailure();
  breaker.recordFailure();
  assert(breaker.getState() === 'CLOSED', 'Circuit breaker remains CLOSED after 2 failures');
  assert(breaker.canExecute() === true, 'Circuit breaker allows execution at failure count 2');

  // 3rd failure trips the breaker
  breaker.recordFailure();
  assert(breaker.getState() === 'OPEN', 'Circuit breaker trips to OPEN after 3 consecutive failures');
  assert(breaker.canExecute() === false, 'Circuit breaker fast-fails (canExecute = false) when OPEN');

  // Wait for cooldown period (1050 ms)
  await new Promise((resolve) => setTimeout(resolve, 1050));
  assert(breaker.getState() === 'HALF_OPEN', 'Circuit breaker transitions to HALF_OPEN after cooldown period');
  assert(breaker.canExecute() === true, 'Circuit breaker permits probe execution when HALF_OPEN');

  // Successful probe resets the circuit breaker
  breaker.recordSuccess();
  assert(breaker.getState() === 'CLOSED', 'Circuit breaker resets to CLOSED on successful probe execution');
  assert(breaker.getStats().failureCount === 0, 'Failure count is reset to 0 after success');

  // ========================================================
  // 3. Project Persistence Store (DDIA Storage Engine)
  // ========================================================
  console.log('\n3. Testing Persistent Project Store...');

  // ID Validation & Traversal Guard
  assert(isValidProjectId('proj_valid_12345'), 'Valid alphanumeric project ID is accepted');
  assert(!isValidProjectId('..'), 'Directory traversal ".." ID is strictly rejected');
  assert(!isValidProjectId('../../etc/passwd'), 'Path traversal sequence is strictly rejected');
  assert(!isValidProjectId('short'), 'ID shorter than 8 characters is rejected');
  assert(!isValidProjectId('invalid/slash'), 'Slash in project ID is rejected');

  // Payload Validation
  const validPayload = {
    name: 'Green Energy Lofts',
    buildingId: 'building-1',
    location: {
      city: 'Dhaka',
      country: 'Bangladesh',
      latitude: 23.8103,
      longitude: 90.4125,
      timezone: 'Asia/Dhaka',
    },
    panelConfig: {
      panelId: 'panel-400w',
      panelName: 'Mono PERC 400W',
      wattage: 400,
      tiltDegrees: 15,
      orientation: 'portrait',
    },
    placedPanels: [
      { id: 'p1', x: 2, y: 3, width: 1.13, height: 1.72, orientation: 'portrait', tiltDeg: 15, azimuthDeg: 180, efficiency: 0.21, wattage: 400 },
      { id: 'p2', x: 4, y: 3, width: 1.13, height: 1.72, orientation: 'portrait', tiltDeg: 15, azimuthDeg: 180, efficiency: 0.21, wattage: 400 },
    ],
    financialParams: {
      currency: 'BDT',
      tariffPerKWh: 10.5,
      exportCreditRatio: 0.5,
    },
    simulationSummary: {
      installedCapacityKW: 0.8,
      panelCount: 2,
      annualGenerationKWh: 1100,
      annualConsumptionKWh: 4000,
      solarCoveragePercent: 27.5,
      surplusKWh: 0,
      totalSystemCost: 68000,
      annualSavings: 11550,
      paybackYears: 5.9,
      twentyYearNetSavings: 163000,
      roiPercent: 239.7,
      annualCO2ReductionTonnes: 0.68,
      equivalentTreesPlanted: 11,
    },
  };

  const validationRes = validateProjectPayload(validPayload);
  assert(validationRes.valid === true, 'Valid project payload passes schema validation');

  const invalidPayload = { ...validPayload, name: '' };
  assert(validateProjectPayload(invalidPayload).valid === false, 'Empty project name is rejected');

  // Save Project
  const saved = await saveProject(validPayload);
  assert(typeof saved.id === 'string' && saved.id.startsWith('proj_'), 'Project saved with generated ID');
  assert(saved.name === 'Green Energy Lofts', 'Project name is preserved');
  assert(saved.placedPanels.length === 2, 'Placed panels array is saved intact');

  // Retrieve Project
  const retrieved = await getProject(saved.id);
  assert(retrieved !== null, 'Saved project retrieved successfully by ID');
  assert(retrieved?.id === saved.id, 'Retrieved project ID matches saved ID');
  assert(retrieved?.location.city === 'Dhaka', 'Retrieved location matches');
  assert(retrieved?.simulationSummary?.annualSavings === 11550, 'Retrieved financial summary matches');

  // List Projects
  const list = await listProjects();
  assert(list.some((p) => p.id === saved.id), 'Saved project appears in project list');

  // Delete Project
  const deleted = await deleteProject(saved.id);
  assert(deleted === true, 'Project deleted successfully');
  const deletedCheck = await getProject(saved.id);
  assert(deletedCheck === null, 'Project is confirmed deleted (get returns null)');

  // ========================================================
  // 4. Client Zustand State Persistence (Export / Import)
  // ========================================================
  console.log('\n4. Testing Client State Serialization & Restoration...');
  const store = useSolarStore.getState();

  const exportedJson = store.exportProjectState();
  assert(typeof exportedJson === 'string', 'exportProjectState produces string output');
  const parsedExport = JSON.parse(exportedJson);
  assert(typeof parsedExport.name === 'string', 'Exported JSON contains project name');
  assert(typeof parsedExport.buildingId === 'string', 'Exported JSON contains buildingId');
  assert(Array.isArray(parsedExport.placedPanels), 'Exported JSON contains placedPanels array');

  const importSuccess = store.importProjectState(exportedJson);
  assert(importSuccess === true, 'importProjectState successfully deserializes and restores project');

  assert(store.importProjectState('invalid json') === false, 'importProjectState gracefully rejects invalid JSON string');

  console.log(`\n========================================`);
  console.log(`System Design Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.includes('systemDesignHoles.test.ts')) {
  runSystemDesignTests().then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
