import { resolveChromePath } from '../scripts/resolveChrome';
import fs from 'fs';
import os from 'os';

export function runCrossPlatformBrowserTests(): { passed: number; failed: number } {
  console.log('🖥️  Starting Cross-Platform Chrome Resolution Test Suite...\n');

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

  // Test 1: Explicit valid environment override is respected
  const dummyFile = os.platform() === 'win32' ? 'C:\\Windows\\notepad.exe' : '/bin/sh';
  if (fs.existsSync(dummyFile)) {
    const resolved = resolveChromePath(dummyFile);
    assert(resolved === dummyFile, 'Explicit existing binary path is honored directly');
  } else {
    assert(true, 'Explicit existing binary path test skipped (platform dummy file absent)');
  }

  // Test 2: Non-existent custom path falls back cleanly to platform default
  const nonExistent = '/non/existent/path/to/chrome-' + Date.now();
  const fallback = resolveChromePath(nonExistent);
  assert(typeof fallback === 'string' && fallback.length > 0, 'Non-existent override gracefully falls back');

  // Test 3: Default detection returns a valid string on current platform
  const currentDetected = resolveChromePath();
  assert(typeof currentDetected === 'string' && currentDetected.length > 0, 'Current platform detects a default Chrome executable string');

  // Test 4: Does not return hardcoded Windows path on Linux/macOS unless Windows
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    const isWinHardcoded = currentDetected.includes('C:\\Program Files') || currentDetected.includes('chrome.exe');
    assert(!isWinHardcoded, 'Linux/macOS does not inappropriately default to hardcoded Windows path');
  } else if (os.platform() === 'win32') {
    assert(currentDetected.endsWith('.exe'), 'Windows target resolves to .exe binary');
  }

  console.log(`\n========================================`);
  console.log(`Cross-Platform Chrome Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}
