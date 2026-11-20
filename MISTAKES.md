# RoofRay Mistake Log & Prevention Registry

This document records architectural, environmental, and implementation mistakes discovered in the RoofRay codebase, their root causes, how they were resolved, and strict preventive rules so they are **never repeated** in production or future development conversations.

---

## Mistake 1: Hardcoded OS-Specific (Windows) Chrome Path in E2E Browser Test Suite

### Symptoms & Failure Mode
* **Command:** `npm run test:browser` or `npm run test:all` executed in Linux, macOS, Docker containers, or CI environments without an explicit `CHROME_PATH` environment variable.
* **Error:**
  ```text
  node:events:487
        throw er; // Unhandled 'error' event
        ^
  Error: spawn C:\Program Files\Google\Chrome\Application\chrome.exe ENOENT
      at ChildProcess._handle.onexit (node:internal/child_process:287:19)
      ...
      syscall: 'spawn C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ```
* **Impact:** 100% test failure on non-Windows platforms. Blocked production CI/CD pipelines, container builds, and Linux developer environments.

### Root Cause
1. In `scripts/browserTest.js`, the executable path was hardcoded as:
   ```javascript
   const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
   ```
2. The code assumed the host operating system is always Windows if `CHROME_PATH` is unset.
3. No cross-platform fallback or auto-detection existed for standard Linux (`/usr/bin/google-chrome`, `/usr/bin/google-chrome-stable`, `/usr/bin/chromium`, `/usr/bin/chromium-browser`, `/snap/bin/chromium`) or macOS (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).
4. Headless Chrome on Linux was launched without `--no-sandbox`, `--disable-setuid-sandbox`, or `--disable-dev-shm-usage`, which causes permission crashes in non-root or containerized environments.
5. `chromeProcess` lacked an unhandled `error` listener, causing Node.js process termination without diagnostic output.

### Resolution & Fix
1. Created modular cross-platform resolver `scripts/resolveChrome.ts`:
   * Checks `process.env.CHROME_PATH` and verifies file existence via `fs.existsSync()`.
   * Uses `os.platform()` to inspect the runtime OS (`linux`, `darwin`, `win32`).
   * Iterates through canonical system binary paths on Linux, macOS, and Windows.
2. Updated `scripts/browserTest.js`:
   * Imports and calls `resolveChromePath()`.
   * Conditionally appends `--no-sandbox`, `--disable-setuid-sandbox`, and `--disable-dev-shm-usage` when running on Linux.
   * Attaches an explicit `chromeProcess.on('error', ...)` handler.
3. Added deterministic test suite `tests/crossPlatformBrowser.test.ts` wired directly into `src/tests/calculations.test.ts` (tested during `npm test`).

### Prevention Rule for Future Sessions
> **Rule 1.1:** Never hardcode platform-specific paths (e.g. `C:\`, `/home/`, `/usr/bin/`) in scripts, tests, or application logic. Always use `os.platform()`, `path.join()`, and verify existence before spawning external binaries.  
> **Rule 1.2:** Any spawned child process MUST attach an `error` event handler immediately after creation to prevent unhandled node event exceptions.

---

## Mistake 2: Single-Instance In-Memory Quotas Without Distribution Disclosure

### Symptoms & Nuance
* In `server/server.ts`, daily AI quotas were tracked via an in-memory counter:
  ```typescript
  const MAX_DAILY_AI_REQUESTS = 500;
  let dailyAiRequestsCount = 0;
  ```
* In horizontally scaled multi-instance deployments (e.g., Render, Kubernetes, multiple containers), each process instance maintains its own memory space. Resetting a container resets the count.

### Prevention Rule for Future Sessions
> **Rule 2.1:** Any in-memory state (rate limiting, quotas, caches) must be explicitly documented in health endpoints and comments as `in-memory (single process instance)` to prevent mistaken assumptions of distributed persistence. For distributed production clusters, use Redis or database-backed counters.

---

## Mistake 3: Removing or Weakening Tests to "Make Things Pass"

### Hazard
* When introducing changes or porting code, deleting or skipping existing test cases ("done remove any tests") undermines production reliability, breaks invariants, and introduces regressions.

### Prevention Rule for Future Sessions
> **Rule 3.1:** NEVER delete, weaken, or comment out existing test assertions. Every test exists for a reason (PRD specifications, edge cases, astronomical invariants, or security defenses).  
> **Rule 3.2:** If a test fails, fix the underlying code or configuration; do not lower the bar in the test suite. Always verify `npm test`, `npm run test:integration`, `npm run test:browser`, and `npm run test:all`.


---

## Mistake 4: Property Name Mismatch (`watts` vs `wattage`) in Client State Export

### Symptoms & Failure Mode
* **Command:** `npm run build` (`tsc && vite build`) failed with TypeScript error:
  ```text
  src/store/useSolarStore.ts:1933:33 - error TS2339: Property 'watts' does not exist on type 'PanelType'.
  1933           wattage: currentPanel.watts,
  ```

### Root Cause
* In `src/types/index.ts`, `PanelType` declares module power output under the property name `wattage: number`, but `exportProjectState` attempted to read `currentPanel.watts`.

### Resolution & Fix
* Updated `src/store/useSolarStore.ts` to reference `currentPanel.wattage` and fallback to `state.placedPanels[0]?.tiltDegrees ?? Math.min(45, Math.max(10, Math.abs(state.location.latitude)))`.

### Prevention Rule for Future Sessions
> **Rule 4.1:** Always verify interface properties against canonical domain types (`src/types/index.ts`) before compiling or serializing state. Run `npm run build` to catch TypeScript compiler checks prior to running tests.

---

## Mistake 5: Unhandled 'error' Event on HTTP Server Listen

### Symptoms & Failure Mode
* **Command:** `npm run test:browser` or `npm run test:all` intermittently crashed with:
  ```text
  node:events:487
        throw er; // Unhandled 'error' event
        ^
  Error: listen EADDRINUSE: address already in use :::3012
  ```
* **Impact:** Node process terminated unhandled when a test server port was in a transient `TIME_WAIT` state from a prior run.

### Root Cause
* In `server/server.ts`, `startServer(port)` invoked `server.listen(port, ...)` inside a `new Promise` without attaching an `error` listener to the `server` instance. In Node.js, `net.Server` emits an `'error'` event on listen errors; without a listener, Node raises an uncaught exception.

### Resolution & Fix
* Updated `startServer` in `server/server.ts` to attach `server.once('error', onError)` and remove it on `'listening'`, cleanly rejecting the Promise so callers can catch or fall back dynamically.
* Added dynamic port fallback in `scripts/browserTest.js` if port 3012 is occupied.
* Added active connection draining in `shutdownServer()`.

### Prevention Rule for Future Sessions
> **Rule 5.1:** Whenever calling `server.listen()`, always attach a `server.once('error', reject)` listener before calling listen to prevent unhandled node event crashes.

---

## Mistake 6: Unbounded In-Memory Map in Rate Limiting Middleware

### Symptoms & Failure Mode
* `rateLimitMap` stored client IP request timestamps without ever removing expired keys, leading to monotonic heap memory growth under long-running production workloads.

### Root Cause
* `checkRateLimit` filtered timestamps for window validity but kept the empty array key in `rateLimitMap` even after all timestamps expired.

### Resolution & Fix
* Implemented `cleanupRateLimitStore()` that purges empty/expired IP keys.
* Added periodic auto-pruning every 250 requests and bounded the map with an LRU eviction cap of `MAX_TRACKED_IPS = 10000`.

### Prevention Rule for Future Sessions
> **Rule 6.1:** Any in-memory cache or tracking map must have an explicit eviction strategy (TTL-based cleanup and a hard max-size cap with LRU eviction) to prevent memory leaks in production.
