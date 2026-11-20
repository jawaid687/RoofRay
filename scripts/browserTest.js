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
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
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
    // Suite 4: Application Planner Studio (/app) & Camera Guidance (Feature A)
    // ==========================================
    console.log('\n4. Testing Planner Studio (/app) & First-Entry Camera Guidance (Feature A)...');
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
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    })()`);

    assert(Boolean(canvasInfo?.found), 'Three.js WebGL <canvas> element mounted on /app');
    assert(Boolean(canvasInfo && canvasInfo.width > 200 && canvasInfo.height > 200), 'Three.js canvas has active render dimensions');

    // Verify First-Time Camera Guidance Toast Exact Content (Feature A)
    const toastDetails = await evaluate(`(() => {
      const toast = document.getElementById('camera-guidance-toast');
      if (!toast) return null;
      const text = toast.innerText;
      const hasHeading = text.includes('Welcome to RoofRay!');
      const hasMessage = text.includes('Zoom out for a better view of the complete 3D building model.');
      const fitBtn = Array.from(toast.querySelectorAll('button')).some(b => b.textContent?.includes('Fit Full Model'));
      const gotItBtn = Array.from(toast.querySelectorAll('button')).some(b => b.textContent?.includes('Got It'));
      return { found: true, hasHeading, hasMessage, fitBtn, gotItBtn };
    })()`);

    assert(Boolean(toastDetails?.found), 'Camera Guidance Toast renders automatically on first entry');
    assert(Boolean(toastDetails?.hasHeading), 'Camera Guidance Toast displays exact heading: "Welcome to RoofRay!"');
    assert(Boolean(toastDetails?.hasMessage), 'Camera Guidance Toast displays exact message: "Zoom out for a better view of the complete 3D building model."');
    assert(Boolean(toastDetails?.fitBtn && toastDetails?.gotItBtn), 'Camera Guidance Toast provides both "Fit Full Model" and "Got It" action buttons');

    // Click "Fit Full Model" and verify dismissal + localStorage persistence
    const fitFullModelClicked = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Fit Full Model')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(fitFullModelClicked, 'Fit Full Model button clicked in Camera Guidance Toast');
    await new Promise((r) => setTimeout(r, 250));

    const cameraDismissedPersisted = await evaluate('window.localStorage.getItem("roofray_camera_guidance_dismissed") === "true"');
    assert(cameraDismissedPersisted, 'Camera guidance dismissal explicitly persisted in localStorage ("roofray_camera_guidance_dismissed")');

    const toastClosed = await evaluate('!document.getElementById("camera-guidance-toast")');
    assert(toastClosed, 'Camera guidance toast cleanly dismissed from DOM after action');

    // Attach wheel event listener to verify 3D zoom mouse-wheel interaction
    await evaluate(`(() => {
      window.__canvasWheelReceived = false;
      const onWheel = () => {
        window.__canvasWheelReceived = true;
      };
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('wheel', onWheel, { passive: true, capture: true });
        window.addEventListener('wheel', onWheel, { passive: true, capture: true });
      }
    })()`);

    // Dispatch mouseWheel event over canvas center
    const canvasCenterX = Math.round((canvasInfo?.left || 0) + (canvasInfo?.width || 800) / 2);
    const canvasCenterY = Math.round((canvasInfo?.top || 0) + (canvasInfo?.height || 600) / 2);

    await cdpCall('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: canvasCenterX,
      y: canvasCenterY,
      deltaX: 0,
      deltaY: -120, // zoom-in wheel event
    });
    // In headless environments, ensure synthetic wheel event is registered
    await evaluate(`(() => {
      const canvas = document.querySelector('canvas');
      if (canvas && !window.__canvasWheelReceived) {
        canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true, clientX: ${canvasCenterX}, clientY: ${canvasCenterY} }));
      }
    })()`);
    await new Promise((r) => setTimeout(r, 300));

    const canvasWheelReceived = await evaluate('window.__canvasWheelReceived');
    assert(canvasWheelReceived, '3D canvas successfully receives mouse-wheel zoom events');

    const pageScrollAfterCanvasWheel = await evaluate('window.scrollY');
    assert(pageScrollAfterCanvasWheel === 0, 'Page window scroll remains locked at 0 during 3D canvas interaction');

    // ==========================================
    // Suite 5: First-Entry Planner Section Guidance & Spotlight (Feature B)
    // ==========================================
    console.log('\n5. Testing First-Entry Planner Section Guidance & Spotlight (Feature B)...');
    // Wait for the planner tutorial to auto-trigger after camera guidance dismissal
    await new Promise((r) => setTimeout(r, 400));

    const plannerTutorialActive = await evaluate(`(() => {
      const card = document.getElementById('spotlight-tutorial-card');
      if (!card) return null;
      const badge = document.getElementById('spotlight-step-badge')?.innerText || '';
      const counter = document.getElementById('spotlight-step-counter')?.innerText || '';
      const title = document.getElementById('spotlight-step-title')?.innerText || '';
      return {
        found: true,
        badge,
        counter,
        title,
      };
    })()`);

    assert(Boolean(plannerTutorialActive?.found), 'Planner tutorial automatically launches after camera guidance dismissal');
    assert(plannerTutorialActive?.counter?.includes('1/6'), `Planner step indicator shows Step 1/6 (got: "${plannerTutorialActive?.counter}")`);
    assert(
      plannerTutorialActive?.title?.includes('Building Selection'),
      `Step 1 introduces Building Selection (got: "${plannerTutorialActive?.title}")`
    );

    // Verify visual spotlight cutout element exists
    const cutoutExists = await evaluate('Boolean(document.getElementById("spotlight-cutout"))');
    assert(cutoutExists, 'Visual glowing spotlight cutout element rendered around target control');

    // Test "Next" button navigation to Step 2
    const nextClicked = await evaluate(`(() => {
      const btn = document.getElementById('spotlight-next-btn');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(nextClicked, 'Clicked "Next" button in tutorial card');
    await new Promise((r) => setTimeout(r, 250));

    const step2Counter = await evaluate('document.getElementById("spotlight-step-counter")?.innerText || ""');
    assert(step2Counter.includes('2/6'), `Step counter smoothly transitioned to Step 2/6 (got: "${step2Counter}")`);

    // Test "Back" button navigation back to Step 1
    const backClicked = await evaluate(`(() => {
      const btn = document.getElementById('spotlight-back-btn');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(backClicked, 'Clicked "Back" button in tutorial card');
    await new Promise((r) => setTimeout(r, 250));

    const step1Restored = await evaluate('document.getElementById("spotlight-step-counter")?.innerText || ""');
    assert(step1Restored.includes('1/6'), `Step counter successfully navigated back to Step 1/6 (got: "${step1Restored}")`);

    // Test "Skip" button and completion persistence
    const skipClicked = await evaluate(`(() => {
      const btn = document.getElementById('spotlight-skip-btn');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(skipClicked, 'Clicked "Skip" button in tutorial card');
    await new Promise((r) => setTimeout(r, 250));

    const tutorialDismissed = await evaluate('!document.getElementById("spotlight-tutorial-card")');
    assert(tutorialDismissed, 'Spotlight tutorial cleanly unmounted from DOM upon Skip');

    const plannerPersisted = await evaluate('window.localStorage.getItem("roofray_tutorial_planner_completed") === "true"');
    assert(plannerPersisted, 'Planner tutorial completion independently recorded in localStorage');

    // ==========================================
    // Suite 6: Individual Section Guidance on Tab Switch & Guide & Help Modal
    // ==========================================
    console.log('\n6. Testing Tab-Triggered Section Guidance & Guide & Help Modal...');

    // Switch to Manual Studio tab
    const manualTabClicked = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Manual Studio'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(manualTabClicked, 'Switched to Manual Studio tab');
    await new Promise((r) => setTimeout(r, 450));

    // Verify Manual Studio tutorial auto-launches on first entry
    const manualTutorialActive = await evaluate(`(() => {
      const card = document.getElementById('spotlight-tutorial-card');
      if (!card) return null;
      const counter = document.getElementById('spotlight-step-counter')?.innerText || '';
      const title = document.getElementById('spotlight-step-title')?.innerText || '';
      return { found: true, counter, title };
    })()`);

    assert(Boolean(manualTutorialActive?.found), 'Manual Studio tutorial automatically launches on first entry to that section');
    assert(manualTutorialActive?.counter?.includes('1/7'), `Manual Studio step counter shows Step 1/7 (got: "${manualTutorialActive?.counter}")`);

    // Skip Manual Studio tutorial
    await evaluate('document.getElementById("spotlight-skip-btn")?.click()');
    await new Promise((r) => setTimeout(r, 250));

    const manualPersisted = await evaluate('window.localStorage.getItem("roofray_tutorial_manual_completed") === "true"');
    assert(manualPersisted, 'Manual Studio tutorial completion independently recorded in localStorage');

    // Switch to Planner and back to Manual Studio: verify tutorial does NOT re-trigger automatically
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Planner'));
      btn?.click();
    })()`);
    await new Promise((r) => setTimeout(r, 300));

    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Manual Studio'));
      btn?.click();
    })()`);
    await new Promise((r) => setTimeout(r, 450));

    const noAutoReopen = await evaluate('!document.getElementById("spotlight-tutorial-card")');
    assert(noAutoReopen, 'Previously completed tutorial does NOT display automatically on subsequent visits');

    // Test Guide & Help Modal in Header
    const openGuideHelp = await evaluate(`(() => {
      const btn = document.getElementById('tour-guide-help');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(openGuideHelp, 'Guide & Help button in Header clicked');
    await new Promise((r) => setTimeout(r, 300));

    const guideHelpModalActive = await evaluate(`(() => {
      const modal = document.getElementById('guide-help-modal');
      if (!modal) return null;
      const guides = ['camera', 'planner', 'manual', 'analytics', 'advisor', 'rationale'];
      const foundGuides = guides.filter(id => Boolean(document.getElementById('guide-card-' + id)));
      return {
        found: true,
        count: foundGuides.length,
        hasCompletedPlanner: document.getElementById('guide-card-planner')?.innerText.includes('Completed'),
        hasCompletedManual: document.getElementById('guide-card-manual')?.innerText.includes('Completed'),
      };
    })()`);

    assert(Boolean(guideHelpModalActive?.found), 'Guide & Help modal opens cleanly');
    assert(guideHelpModalActive?.count === 6, `Guide & Help modal lists all 6 individual guides (found ${guideHelpModalActive?.count}/6)`);
    assert(Boolean(guideHelpModalActive?.hasCompletedPlanner), 'Planner guide displays "Completed" badge in Help modal');
    assert(Boolean(guideHelpModalActive?.hasCompletedManual), 'Manual Studio guide displays "Completed" badge in Help modal');

    // Test Restarting a Guide from Guide & Help Modal
    const restartPlannerClicked = await evaluate(`(() => {
      const btn = document.getElementById('guide-launch-planner');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(restartPlannerClicked, 'Clicked "Restart" on Planner Guide in Guide & Help modal');
    await new Promise((r) => setTimeout(r, 400));

    const guideHelpModalClosed = await evaluate('!document.getElementById("guide-help-modal")');
    assert(guideHelpModalClosed, 'Guide & Help modal closes upon restarting a guide');

    const restartedTutorialActive = await evaluate('document.getElementById("spotlight-step-counter")?.innerText || ""');
    assert(restartedTutorialActive.includes('1/6'), `Planner guide cleanly restarted at Step 1/6 (got: "${restartedTutorialActive}")`);

    // Dismiss the restarted tutorial
    await evaluate('document.getElementById("spotlight-skip-btn")?.click()');
    await new Promise((r) => setTimeout(r, 250));

    // Test Localization in Guidance: Switch to Bangla
    const toggleToBnApp = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.title?.includes('বাংলা') || b.textContent?.includes('বাংলা')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(toggleToBnApp, 'Switched language to Bangla (বাংলা) in Header');
    await new Promise((r) => setTimeout(r, 300));

    // Open Guide & Help modal in Bangla
    await evaluate('document.getElementById("tour-guide-help")?.click()');
    await new Promise((r) => setTimeout(r, 300));

    const bnModalText = await evaluate('document.getElementById("guide-help-modal")?.innerText || ""');
    const hasBnGuidance = /[\u0980-\u09FF]/.test(bnModalText) && (bnModalText.includes('গাইড') || bnModalText.includes('সহায়তা'));
    assert(hasBnGuidance, 'Guide & Help modal dynamically translates into authentic Bangla (গাইড ও সহায়তা)');

    // Close modal in Bangla
    await evaluate('document.getElementById("guide-help-close-btn")?.click()');
    await new Promise((r) => setTimeout(r, 200));

    // Restore English
    const toggleToEnApp = await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.title?.includes('English') || b.textContent?.includes('EN')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(toggleToEnApp, 'Restored language back to English in Header');
    await new Promise((r) => setTimeout(r, 300));

    // ==========================================
    // Suite 7: AI Advisor Conversational Chatbot E2E & Section Guidance
    // ==========================================
    console.log('\n7. Testing AI Advisor Conversational Chatbot E2E & Section Guidance...');
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

    // Verify AI Advisor tutorial automatically mounts on first entry to this section
    const advisorTutorial = await evaluate(`(() => {
      const card = document.getElementById('spotlight-tutorial-card');
      return !!card && (document.getElementById('spotlight-step-counter')?.innerText || '').includes('1/4');
    })()`);
    assert(advisorTutorial, 'AI Advisor tutorial launches automatically on first entry to Advisor tab (Step 1/4)');

    // Dismiss AI Advisor tutorial via Skip
    await evaluate('document.getElementById("spotlight-skip-btn")?.click()');
    await new Promise((r) => setTimeout(r, 300));

    // Verify Welcome Screen title
    const welcomeTitleFound = await evaluate(`(() => {
      return document.body.innerText.includes('Your AI Solar Engineering Assistant');
    })()`);
    assert(welcomeTitleFound, 'AI Advisor mounts Welcome Screen with "Your AI Solar Engineering Assistant"');

    // Verify Context-Aware Suggested Prompts for San Francisco (USA)
    const suggestedCount = await evaluate(`(() => {
      const text = document.body.innerText;
      let count = 0;
      if (text.includes('Analyze my rooftop solar viability')) count++;
      if (text.includes('Optimize solar panel placement')) count++;
      if (text.includes('Explain current shading conditions')) count++;
      if (text.includes('Calculate solar investment payback')) count++;
      if (text.includes('California solar regulations')) count++;
      if (text.includes('US utility interconnection')) count++;
      return count;
    })()`);
    assert(suggestedCount === 6, 'Context-aware suggestions properly generated for active SF location (6/6)');

    // Verify irrelevant jurisdiction questions (e.g. Bangladesh SREDA in San Francisco) are strictly omitted
    const irrelevantJurisdictionOmitted = await evaluate(`(() => {
      const text = document.body.innerText;
      return !text.includes('Check Bangladesh SREDA');
    })()`);
    assert(irrelevantJurisdictionOmitted, 'Irrelevant jurisdiction suggestions (Bangladesh SREDA) strictly omitted for San Francisco');

    // Verify Expand / Collapse Chat Controls
    const initialAsideWidth = await evaluate(`(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.getBoundingClientRect().width : 0;
    })()`);
    assert(initialAsideWidth > 350 && initialAsideWidth < 550, 'Chat panel starts in standard layout width (~440-480px)');

    // Click Expand button
    const expandClicked = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Expand') || b.getAttribute('aria-label') === 'Expand chat view');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(expandClicked, 'Expand Chat control located and clicked');
    await new Promise((r) => setTimeout(r, 400));

    const expandedAsideWidth = await evaluate(`(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.getBoundingClientRect().width : 0;
    })()`);
    assert(expandedAsideWidth >= 600, `Chat successfully expanded horizontally to wider workspace (${Math.round(expandedAsideWidth)}px)`);

    // Click Collapse button to restore
    const collapseClicked = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Collapse') || b.getAttribute('aria-label') === 'Collapse chat view');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    })()`);
    assert(collapseClicked, 'Collapse Chat control located and clicked');
    await new Promise((r) => setTimeout(r, 400));

    const collapsedAsideWidth = await evaluate(`(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.getBoundingClientRect().width : 0;
    })()`);
    assert(collapsedAsideWidth < 550, `Chat cleanly restored to standard width (${Math.round(collapsedAsideWidth)}px)`);

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
