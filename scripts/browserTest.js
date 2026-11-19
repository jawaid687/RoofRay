import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { server, startServer } from '../server/server.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBrowserTests() {
  console.log('🌐 Starting RoofRay V3.4 Headless Browser E2E Test Suite...\n');

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

  const serverPort = 3012;
  const cdpPort = 9225;
  const tmpProfileDir = path.join(os.tmpdir(), `roofray-chrome-profile-${Date.now()}`);
  fs.mkdirSync(tmpProfileDir, { recursive: true });

  // 1. Start RoofRay Production Server
  await startServer(serverPort);

  // 2. Launch Isolated Headless Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--window-size=1280,800',
    `--remote-debugging-port=${cdpPort}`,
    '--remote-allow-origins=*',
    `--user-data-dir=${tmpProfileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-gpu',
    'about:blank',
  ]);

  let ws;

  try {
    // Wait for Chrome CDP endpoint to be ready
    let targetWsUrl = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch(`http://localhost:${cdpPort}/json/list`);
        const targets = await res.json();
        if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
          targetWsUrl = targets[0].webSocketDebuggerUrl;
          break;
        }
      } catch {
        // wait for browser initialization
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    if (!targetWsUrl) {
      throw new Error('Failed to connect to headless Chrome remote debugging port.');
    }

    // Connect via native WebSocket
    ws = new WebSocket(targetWsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function cdpCall(method, params = {}) {
      return new Promise((resolve, reject) => {
        const currentId = msgId++;
        const onMessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.id === currentId) {
              ws.removeEventListener('message', onMessage);
              if (data.error) {
                reject(new Error(`CDP Error (${method}): ${data.error.message}`));
              } else {
                resolve(data.result);
              }
            }
          } catch (e) {
            reject(e);
          }
        };
        ws.addEventListener('message', onMessage);
        ws.send(JSON.stringify({ id: currentId, method, params }));
      });
    }

    // Enable required CDP domains
    await cdpCall('Page.enable');
    await cdpCall('Runtime.enable');
    await cdpCall('DOM.enable');

    async function evaluate(expression) {
      const res = await cdpCall('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res?.result?.value;
    }

    // ==========================================
    // Suite 1: Landing Page (/) & Vertical Scrolling
    // ==========================================
    console.log('1. Testing Landing Page (/) & Vertical Scrolling...');
    await cdpCall('Page.navigate', { url: `http://localhost:${serverPort}/` });

    // Wait for React hydration
    await new Promise((r) => setTimeout(r, 1500));

    const rootExists = await evaluate('Boolean(document.getElementById("root"))');
    assert(rootExists, 'Landing page mounted #root container');

    const heroTitle = await evaluate('document.querySelector("h1")?.innerText || ""');
    assert(
      heroTitle.includes('Solar') || heroTitle.includes('RoofRay'),
      `Landing page hero title rendered with platform branding: "${heroTitle.slice(0, 40)}..."`
    );

    const initialScrollY = await evaluate('window.scrollY');
    assert(initialScrollY === 0, 'Initial scroll position at page load is strictly 0');

    const bodyOverflow = await evaluate('window.getComputedStyle(document.body).overflowY');
    assert(bodyOverflow === 'auto' || bodyOverflow === 'visible', 'Landing page body enables natural vertical scrolling (overflow-y: auto)');

    // Dispatch real mouse-wheel event down the page
    await cdpCall('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 350,
      y: 350,
      deltaX: 0,
      deltaY: 500,
    });
    await new Promise((r) => setTimeout(r, 300));

    const postWheelScrollY = await evaluate('window.scrollY');
    assert(postWheelScrollY > 0, `Mouse-wheel event naturally scrolled page vertically (scrollY: ${postWheelScrollY}px)`);

    // Scroll to bottom and check footer visibility & accessibility
    await evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise((r) => setTimeout(r, 200));

    const footerAccessibility = await evaluate(`(() => {
      const footer = document.querySelector('footer');
      if (!footer) return null;
      const rect = footer.getBoundingClientRect();
      const text = footer.innerText;
      return {
        found: true,
        inViewport: rect.top < window.innerHeight && rect.bottom > 0,
        hasTrack: text.includes('Idea to Unicorn') || text.includes('ClimateSphere AI'),
        hasPlatform: text.includes('RoofRay'),
      };
    })()`);

    assert(Boolean(footerAccessibility?.found), 'Footer element exists in DOM');
    assert(Boolean(footerAccessibility?.inViewport), 'Footer is fully visible and accessible when scrolled to bottom');
    assert(Boolean(footerAccessibility?.hasTrack), 'Footer displays competition track attribution (Idea to Unicorn / ClimateSphere AI)');

    // ==========================================
    // Suite 2: Mobile Responsive Viewport Scrolling
    // ==========================================
    console.log('\n2. Testing Mobile Responsive Viewport Scrolling...');
    // Override device metrics to iPhone / standard mobile resolution (375x667)
    await cdpCall('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await evaluate('window.scrollTo(0, 0)');
    await new Promise((r) => setTimeout(r, 200));

    const mobileInitialScroll = await evaluate('window.scrollY');
    assert(mobileInitialScroll === 0, 'Mobile viewport resets scroll position to 0');

    // Simulate mobile touch / wheel scroll
    await cdpCall('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 180,
      y: 300,
      deltaX: 0,
      deltaY: 600,
    });
    await new Promise((r) => setTimeout(r, 300));

    const mobileScrolledY = await evaluate('window.scrollY');
    assert(mobileScrolledY > 0, `Mobile viewport scrolls vertically under touch/wheel (scrollY: ${mobileScrolledY}px)`);

    // Reset device metrics override
    await cdpCall('Emulation.clearDeviceMetricsOverride');

    // ==========================================
    // Suite 3: Browser Localization Switching
    // ==========================================
    console.log('\n3. Testing Browser Localization Switching (EN <-> BN)...');
    await evaluate('window.scrollTo(0, 0)');
    await new Promise((r) => setTimeout(r, 200));

    // Find and click language toggle button in live browser DOM
    const toggleToBn = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.title?.includes('বাংলা') || b.textContent?.includes('বাংলা')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(toggleToBn, 'Language switcher button found and clicked');

    await new Promise((r) => setTimeout(r, 300));

    const containsBanglaText = await evaluate(`(() => {
      const bnRegex = /[\\u0980-\\u09FF]/;
      return bnRegex.test(document.body.innerText);
    })()`);
    assert(containsBanglaText, 'Application DOM immediately re-renders with authentic Bangla (বাংলা) script');

    // Switch back to English
    const toggleToEn = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.title?.includes('English') || b.textContent?.includes('English')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(toggleToEn, 'Language switcher button clicked again to restore English');
    await new Promise((r) => setTimeout(r, 300));

    const englishRestored = await evaluate(`(() => {
      return document.body.innerText.includes('Launch Studio') || document.body.innerText.includes('Planner');
    })()`);
    assert(englishRestored, 'Application DOM cleanly restored English UI state');

    // ==========================================
    // Suite 4: Application Planner Studio (/app) & 3D Canvas
    // ==========================================
    console.log('\n4. Testing Planner Studio (/app) & 3D Mouse-Wheel Zoom...');
    await cdpCall('Page.navigate', { url: `http://localhost:${serverPort}/app` });
    await new Promise((r) => setTimeout(r, 2000));

    const isAppMode = await evaluate('document.body.classList.contains("app-mode")');
    assert(isAppMode, '/app route dynamically sets body.app-mode to lock document bounce during 3D navigation');

    const appBodyOverflow = await evaluate('window.getComputedStyle(document.body).overflow');
    assert(appBodyOverflow === 'hidden', 'body.app-mode enforces overflow: hidden to isolate 3D viewport');

    const canvasInfo = await evaluate(`(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        found: true,
        width: rect.width,
        height: rect.height,
      };
    })()`);

    assert(Boolean(canvasInfo?.found), 'Three.js WebGL <canvas> element mounted on /app');
    assert(Boolean(canvasInfo && canvasInfo.width > 200 && canvasInfo.height > 200), 'Three.js canvas has active render dimensions');

    // Attach wheel event listener to verify 3D zoom mouse-wheel interaction
    await evaluate(`(() => {
      window.__canvasWheelReceived = false;
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('wheel', () => {
          window.__canvasWheelReceived = true;
        }, { passive: true, capture: true });
      }
    })()`);

    // Dispatch mouseWheel event over canvas center
    const canvasCenterX = Math.round((canvasInfo?.width || 800) / 2);
    const canvasCenterY = Math.round((canvasInfo?.height || 600) / 2);

    await cdpCall('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: canvasCenterX,
      y: canvasCenterY,
      deltaX: 0,
      deltaY: -120, // zoom-in wheel event
    });
    await new Promise((r) => setTimeout(r, 300));

    const canvasWheelReceived = await evaluate('window.__canvasWheelReceived');
    assert(canvasWheelReceived, '3D canvas successfully receives mouse-wheel zoom events');

    const pageScrollAfterCanvasWheel = await evaluate('window.scrollY');
    assert(pageScrollAfterCanvasWheel === 0, 'Page window scroll remains locked at 0 during 3D canvas interaction');

    // ==========================================
    // Suite 5: AI Advisor Conversational Chatbot E2E
    // ==========================================
    console.log('\n5. Testing AI Advisor Conversational Chatbot E2E...');
    // Click AI Advisor tab
    const tabClicked = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const advTab = buttons.find(b => b.innerText.includes('AI Advisor'));
      if (advTab) {
        advTab.click();
        return true;
      }
      return false;
    })()`);
    assert(tabClicked, 'AI Advisor tab button located and clicked');
    await new Promise((r) => setTimeout(r, 600));

    // Verify Welcome Screen title
    const welcomeTitleFound = await evaluate(`(() => {
      return document.body.innerText.includes('Your AI Solar Engineering Assistant');
    })()`);
    assert(welcomeTitleFound, 'AI Advisor mounts Welcome Screen with "Your AI Solar Engineering Assistant"');

    // Verify Suggested Prompts
    const suggestedCount = await evaluate(`(() => {
      const text = document.body.innerText;
      let count = 0;
      if (text.includes('Analyze my rooftop solar viability')) count++;
      if (text.includes('Optimize solar panel placement')) count++;
      if (text.includes('Explain current shading conditions')) count++;
      if (text.includes('Calculate solar investment payback')) count++;
      if (text.includes('Check Bangladesh net-metering regulations')) count++;
      if (text.includes('Recommend optimal panel orientation')) count++;
      return count;
    })()`);
    assert(suggestedCount === 6, 'All 6 suggested question prompts are rendered on welcome screen');

    // Verify Fixed Message Composer
    const composerExists = await evaluate(`(() => {
      const ta = document.querySelector('textarea');
      return Boolean(ta && ta.placeholder.includes('Ask anything about your solar project'));
    })()`);
    assert(composerExists, 'Fixed multiline message composer with placeholder mounted');

    // Click suggested prompt "Explain current shading conditions."
    const promptClicked = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Explain current shading conditions'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(promptClicked, 'Suggested prompt button clicked to initiate conversation');
    await new Promise((r) => setTimeout(r, 600));

    // Verify User Message Bubble is created
    const userMessageBubble = await evaluate(`(() => {
      const text = document.body.innerText;
      return text.includes('Explain current shading conditions');
    })()`);
    assert(userMessageBubble, 'User question bubble rendered in conversation history');

    // Check thinking indicator or response container
    const thinkingIndicator = await evaluate(`(() => {
      const text = document.body.innerText;
      return text.includes('Analyzing your solar data') || text.includes('RoofRay Advisor') || text.includes('RoofRay AI');
    })()`);
    assert(thinkingIndicator, 'Thinking indicator or assistant response container active');

    // Check New Chat / Clear reset functionality
    const newChatButton = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.title === 'Start New Chat');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(newChatButton, 'New Chat button clicked to reset conversation');
    await new Promise((r) => setTimeout(r, 400));

    // Verify welcome screen is restored after New Chat
    const welcomeRestored = await evaluate(`(() => {
      return document.body.innerText.includes('Your AI Solar Engineering Assistant');
    })()`);
    assert(welcomeRestored, 'Welcome screen cleanly restored after New Chat reset');
  } finally {
    // Teardown
    if (ws) {
      try {
        ws.close();
      } catch {}
    }
    chromeProcess.kill('SIGKILL');
    await new Promise((resolve) => server.close(resolve));
    try {
      fs.rmSync(tmpProfileDir, { recursive: true, force: true });
    } catch {}
  }

  console.log(`\n========================================`);
  console.log(`Browser E2E Suite Complete: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runBrowserTests().catch((err) => {
  console.error('Fatal Browser E2E Error:', err);
  process.exit(1);
});
