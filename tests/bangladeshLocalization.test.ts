import { CITY_PRESETS, SIMULATION_ASSUMPTIONS } from '../src/config/assumptions';
import { calculateNOAASunPosition } from '../src/simulation/sunPosition';
import { formatCurrency, getDefaultFinancialParams } from '../src/utils/currency';

export function runBangladeshLocalizationTests() {
  console.log('🇧🇩 Starting Bangladesh Localization & Ephemeris Test Suite...\n');

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

  // Test 1: Verify all 8 Divisional cities exist
  const requiredCities = [
    'Dhaka',
    'Chattogram',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Rangpur',
    'Mymensingh',
  ];

  for (const cityName of requiredCities) {
    const preset = CITY_PRESETS.find((c) => c.name === cityName);
    assert(!!preset, `Division preset exists: ${cityName}`);
    if (preset) {
      assert(preset.country === 'Bangladesh', `${cityName} country is Bangladesh`);
      assert(preset.timezone === 'Asia/Dhaka', `${cityName} timezone is Asia/Dhaka`);
      assert(preset.latitude >= 20.0 && preset.latitude <= 27.0, `${cityName} latitude is geographically valid within Bangladesh bounds (${preset.latitude}°N)`);
      assert(preset.longitude >= 88.0 && preset.longitude <= 93.0, `${cityName} longitude is geographically valid within Bangladesh bounds (${preset.longitude}°E)`);
    }
  }

  // Test 2: Astronomical Solar Ephemeris for Dhaka (23.8103°N, 90.4125°E)
  const dhaka = CITY_PRESETS.find((c) => c.id === 'dhaka')!;
  
  // Summer Solstice solar noon in Dhaka (June 21 at 12:00 solar time / ~11:58 local standard time)
  // At latitude 23.81°N and declination +23.44°, elevation should be nearly 90° (89.6° ± 0.5°)
  const dhakaSummerNoon = calculateNOAASunPosition({
    latitude: dhaka.latitude,
    longitude: dhaka.longitude,
    date: { year: 2026, month: 6, day: 21 },
    time: 12.0,
    timezone: dhaka.timezone,
    northOffsetDeg: 0,
  });

  assert(dhakaSummerNoon.elevationDeg > 88.0, `Dhaka summer solstice noon elevation near zenith: ${dhakaSummerNoon.elevationDeg.toFixed(2)}°`);
  assert(dhakaSummerNoon.isDaylight, 'Dhaka summer noon is daylight');

  // Winter Solstice solar noon in Dhaka (Dec 21)
  // Elevation = 90 - 23.81 - 23.44 ≈ 42.75°
  const dhakaWinterNoon = calculateNOAASunPosition({
    latitude: dhaka.latitude,
    longitude: dhaka.longitude,
    date: { year: 2026, month: 12, day: 21 },
    time: 12.0,
    timezone: dhaka.timezone,
    northOffsetDeg: 0,
  });

  assert(
    Math.abs(dhakaWinterNoon.elevationDeg - 42.75) < 2.0,
    `Dhaka winter solstice noon elevation matches astronomical formula (~42.75°): ${dhakaWinterNoon.elevationDeg.toFixed(2)}°`
  );
  assert(
    dhakaSummerNoon.elevationDeg - dhakaWinterNoon.elevationDeg > 40,
    'Dhaka seasonal elevation delta is > 40 degrees between summer and winter'
  );

  // Test 3: Currency & BDT Formatting
  const bdtFormatted = formatCurrency(85000, 'BDT');
  assert(bdtFormatted.startsWith('৳'), `BDT format uses Taka symbol: ${bdtFormatted}`);

  const usdFormatted = formatCurrency(1850, 'USD');
  assert(usdFormatted.startsWith('$'), `USD format uses Dollar symbol: ${usdFormatted}`);

  const bdtDefaults = getDefaultFinancialParams('BDT');
  assert(bdtDefaults.currencySymbol === '৳', 'BDT default currency symbol is ৳');
  assert(bdtDefaults.tariffPerKWh === SIMULATION_ASSUMPTIONS.bangladeshDefaultTariffBDT, 'BDT default tariff matches ৳10.50/kWh');
  assert(bdtDefaults.costPerKW === SIMULATION_ASSUMPTIONS.bangladeshCostPerKW_BDT, 'BDT default turnkey cost matches ৳85,000/kW');
  assert(bdtDefaults.gridEmissionFactor === SIMULATION_ASSUMPTIONS.bangladeshGridEmissionFactorKgPerKWh, 'BDT grid emission factor is 0.62 kg CO2/kWh');

  console.log(`\n========================================`);
  console.log(`Bangladesh Localization Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

if (process.argv[1]?.includes('bangladeshLocalization.test')) {
  const res = runBangladeshLocalizationTests();
  if (res.failed > 0) process.exit(1);
}
