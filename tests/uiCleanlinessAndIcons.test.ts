import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translations } from '../src/i18n/translations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runUiCleanlinessAndIconsTests() {
  console.log('🎨 Starting UI Cleanliness, Icons & Text Minimization Test Suite...\n');

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

  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.resolve(rootDir, 'src');
  const componentsDir = path.resolve(srcDir, 'components');
  const pagesDir = path.resolve(srcDir, 'pages');

  // Regex matching non-ASCII emoji ranges
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]/u;

  // 1. Verify Translations have zero emojis
  assert(
    !emojiPattern.test(translations.en.locationTime.bdDivisionsLabel) &&
    !emojiPattern.test(translations.bn.locationTime.bdDivisionsLabel),
    'Division selector labels have zero emojis (flags removed)'
  );

  assert(
    !emojiPattern.test(translations.en.locationTime.globalSitesLabel) &&
    !emojiPattern.test(translations.bn.locationTime.globalSitesLabel),
    'Global site labels have zero emojis (globes removed)'
  );

  assert(
    !emojiPattern.test(translations.en.hero.simulatedEphemerisBadge) &&
    !emojiPattern.test(translations.bn.hero.simulatedEphemerisBadge),
    'Simulated ephemeris badge has zero emojis (lightning bolt replaced with Lucide Zap)'
  );

  // Check seasons
  const enSeasons = Object.values(translations.en.locationTime.seasonPresets);
  const bnSeasons = Object.values(translations.bn.locationTime.seasonPresets);
  const seasonEmojis = [...enSeasons, ...bnSeasons].some((s) => emojiPattern.test(s));
  assert(!seasonEmojis, 'Seasonal preset labels have zero emojis (flower, sun, leaf, snowflake replaced)');

  // 2. Scan UI components for raw emojis
  function scanFiles(dir: string, fileList: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanFiles(fullPath, fileList);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const componentFiles = [...scanFiles(componentsDir), ...scanFiles(pagesDir)];
  const filesWithEmojis: string[] = [];

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Strip comments to test actual rendered strings / JSX
    const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    if (emojiPattern.test(stripped)) {
      filesWithEmojis.push(path.relative(rootDir, filePath));
    }
  }

  assert(
    filesWithEmojis.length === 0,
    'All UI components and pages are free from raw emojis',
    filesWithEmojis.length > 0 ? `Found in: ${filesWithEmojis.join(', ')}` : undefined
  );

  // 3. Buzzwords elimination: No "3D CAD" or "CAD studio" badges
  const filesWithCadBuzzwords: string[] = [];
  const prohibitedBuzzwords = ['3d cad', 'cad studio'];

  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Strip comments
    const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').toLowerCase();
    for (const buzz of prohibitedBuzzwords) {
      if (stripped.includes(buzz)) {
        filesWithCadBuzzwords.push(`${path.relative(rootDir, filePath)} ("${buzz}")`);
      }
    }
  }

  assert(
    filesWithCadBuzzwords.length === 0,
    'Prohibited buzzwords ("3D CAD", "CAD Studio") removed from all UI components',
    filesWithCadBuzzwords.join(', ')
  );

  // 4. Model badge elimination in AI Advisor: "Gemini 3.5 Flash-Lite" removed from display
  const aiAdvisorPanelPath = path.resolve(componentsDir, 'panels/AiAdvisorPanel.tsx');
  const aiAdvisorContent = fs.readFileSync(aiAdvisorPanelPath, 'utf-8');
  assert(
    !aiAdvisorContent.includes('Gemini 3.5 Flash-Lite') &&
    !aiAdvisorContent.includes('gemini-3.5-flash-lite'),
    'AI Advisor panel does not display developer model buzzwords ("Gemini 3.5 Flash-Lite")'
  );
  assert(
    aiAdvisorContent.includes('Solar AI'),
    'AI Advisor panel displays clean user-friendly branding ("Solar AI")'
  );

  // 5. Accessibility for icon-only buttons
  const headerPath = path.resolve(componentsDir, 'layout/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert(
    headerContent.includes('aria-label') && headerContent.includes('title='),
    'Header icon-only buttons provide aria-label and title tooltips for accessibility'
  );

  const viewportControlsPath = path.resolve(componentsDir, 'layout/ViewportControls.tsx');
  const viewportControlsContent = fs.readFileSync(viewportControlsPath, 'utf-8');
  assert(
    viewportControlsContent.includes('aria-label') && viewportControlsContent.includes('title='),
    'ViewportControls toggle buttons provide aria-label and title tooltips for accessibility'
  );

  // 6. Text minimization & Collapsible disclosures
  const financialSummaryPath = path.resolve(componentsDir, 'panels/FinancialSummary.tsx');
  const financialSummaryContent = fs.readFileSync(financialSummaryPath, 'utf-8');
  assert(
    financialSummaryContent.includes('<details') && financialSummaryContent.includes('<summary'),
    'FinancialSummary uses collapsible <details> for long regulatory and tariff notes'
  );

  const controlPanelPath = path.resolve(componentsDir, 'panels/ControlPanel.tsx');
  const controlPanelContent = fs.readFileSync(controlPanelPath, 'utf-8');
  assert(
    !controlPanelContent.includes('Deterministic engineering calculations adhere to'),
    'ControlPanel replaces 175-character assumptions paragraph with compact engineering badge'
  );

  // 7. Manual Layout Action Buttons: streamlined with icons
  const manualLayoutPath = path.resolve(componentsDir, 'panels/ManualLayoutPanel.tsx');
  const manualLayoutContent = fs.readFileSync(manualLayoutPath, 'utf-8');
  assert(
    manualLayoutContent.includes('<Undo2') && manualLayoutContent.includes('<Redo2') && manualLayoutContent.includes('<Trash2'),
    'ManualLayoutPanel utilizes Lucide icons for Undo, Redo, and Delete actions'
  );

  // 8. Solar Report Modal: Professional Feasibility Engineering Document
  const reportModalPath = path.resolve(componentsDir, 'ui/SolarReportModal.tsx');
  const reportModalContent = fs.readFileSync(reportModalPath, 'utf-8');
  assert(
    !reportModalContent.includes('Idea to Unicorn'),
    'SolarReportModal removes legacy hackathon competition text'
  );
  assert(
    !reportModalContent.includes('SIMULATION ESTIMATE') &&
    !reportModalContent.includes('simulationEstimateBadge'),
    'SolarReportModal completely removes "SIMULATION ESTIMATE" badge and label'
  );
  assert(
    reportModalContent.includes('report-modal-backdrop') && reportModalContent.includes('report-modal-container'),
    'SolarReportModal incorporates dedicated print-ready container classes'
  );
  assert(
    reportModalContent.includes('financial.annualSavings ?? financial.annualSavingsUSD'),
    'SolarReportModal uses currency-aware annual savings rather than forcing USD alias'
  );

  const indexCssPath = path.resolve(srcDir, 'index.css');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf-8');
  assert(
    indexCssContent.includes('@media print') && indexCssContent.includes('.report-modal-container'),
    'index.css includes dedicated publication-grade print media stylesheet for Solar Report'
  );

  console.log(`\n========================================`);
  console.log(`UI Cleanliness & Icons Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (process.argv[1]?.includes('uiCleanlinessAndIcons.test')) {
  const res = runUiCleanlinessAndIconsTests();
  if (res.failed > 0) process.exit(1);
}
