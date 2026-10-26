import { calculateNOAASunPosition, getSunVector } from '../src/simulation/sunPosition';
import { localToUtc, utcToLocal, isValidTimezone } from '../src/simulation/timezone';

export function runSunPositionTests(): { passed: number; failed: number } {
  console.log('☀️  Starting NOAA Solar Position & Astronomical Test Suite...\n');

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

  // =========================================================================
  // Case 1: Equinox solar noon at the equator (elevation about 90°)
  // Latitude: 0.0°, Longitude: 0.0°, Date: 2026-03-20.
  // Solar noon occurs at ~12:07:26 UTC when hour angle is 0.
  // At solar noon, elevation should be within 0.1° of 90° (zenith ~0°).
  // =========================================================================
  const equatorEquinox = calculateNOAASunPosition({
    latitude: 0.0,
    longitude: 0.0,
    date: { year: 2026, month: 3, day: 20 },
    time: { hour: 12, minute: 7, second: 26 },
    timezone: 'UTC',
  });

  assert(
    Math.abs(equatorEquinox.elevationDeg - 90.0) <= 0.1,
    'Equinox solar noon at the equator: elevation within 0.1° of 90°',
    `Observed: ${equatorEquinox.elevationDeg}°, expected ~90.0°`
  );
  assert(
    equatorEquinox.solarNoon.elevationDeg >= 89.9,
    'Equator equinox solar noon event reports peak elevation ~90°',
    `Observed noon elevation: ${equatorEquinox.solarNoon.elevationDeg}°`
  );

  // =========================================================================
  // Case 2: Northern Tropic at June solstice noon (elevation about 90°)
  // Tropic of Cancer: latitude 23.4365° N, Longitude: 0.0°, Date: 2026-06-21.
  // Solar noon occurs at ~12:01:49 UTC.
  // Subsolar point aligns with Tropic of Cancer, so elevation at noon is ~90°.
  // =========================================================================
  const cancerSolstice = calculateNOAASunPosition({
    latitude: 23.4365,
    longitude: 0.0,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 12, minute: 1, second: 49 },
    timezone: 'UTC',
  });

  assert(
    Math.abs(cancerSolstice.elevationDeg - 90.0) <= 0.1,
    'Tropic of Cancer June solstice noon: elevation within 0.1° of 90°',
    `Observed: ${cancerSolstice.elevationDeg}°, expected ~90.0°`
  );

  // =========================================================================
  // Case 3: Mid-latitude northern summer vs winter noon elevation matches reference
  // Location: San Francisco, CA (37.7749° N, -122.4194° W, America/Los_Angeles).
  // NOAA Reference Values for SF solar noon:
  // - Summer Solstice (2026-06-21): Solar Noon ~13:11:35 PDT, elevation = 75.66°
  // - Winter Solstice (2026-12-21): Solar Noon ~12:07:55 PST, elevation = 28.82° (refracted)
  // =========================================================================
  const sfSummerNoon = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 13, minute: 11, second: 35 },
    timezone: 'America/Los_Angeles',
  });

  const sfWinterNoon = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 12, day: 21 },
    time: { hour: 12, minute: 7, second: 55 },
    timezone: 'America/Los_Angeles',
  });

  assert(
    Math.abs(sfSummerNoon.elevationDeg - 75.66) <= 0.1,
    'Mid-latitude SF Summer Solstice noon elevation matches NOAA reference within 0.1°',
    `Observed: ${sfSummerNoon.elevationDeg}°, expected 75.66°`
  );
  assert(
    Math.abs(sfWinterNoon.elevationDeg - 28.82) <= 0.1,
    'Mid-latitude SF Winter Solstice noon elevation matches NOAA reference within 0.1°',
    `Observed: ${sfWinterNoon.elevationDeg}°, expected 28.82°`
  );
  assert(
    sfSummerNoon.elevationDeg > sfWinterNoon.elevationDeg + 45.0,
    'Summer noon elevation is significantly higher than winter noon (>45° difference)'
  );

  // Summer noon azimuth should be near South (180°)
  assert(
    Math.abs(sfSummerNoon.azimuthDeg - 180.0) <= 0.5,
    'SF Summer solar noon azimuth is due South (180° ± 0.5°)',
    `Observed: ${sfSummerNoon.azimuthDeg}°`
  );

  // =========================================================================
  // Case 4: Southern-hemisphere site: sun at noon is in the north (azimuth near 0° or 360°)
  // Location: Sydney, Australia (-33.8688° S, 151.2093° E, Australia/Sydney).
  // Date: 2026-12-21 (Southern Summer Solstice).
  // Solar Noon ~12:53:02 AEDT (UTC+11).
  // Since site is south of the Tropic of Capricorn (-23.44°), the noon sun sits to the NORTH.
  // Azimuth must be within 0.1° of 0° / 360°.
  // =========================================================================
  const sydneyNoon = calculateNOAASunPosition({
    latitude: -33.8688,
    longitude: 151.2093,
    date: { year: 2026, month: 12, day: 21 },
    time: { hour: 12, minute: 53, second: 2 },
    timezone: 'Australia/Sydney',
  });

  const isNorth = sydneyNoon.azimuthDeg <= 0.5 || sydneyNoon.azimuthDeg >= 359.5;
  assert(
    isNorth,
    'Southern hemisphere site (Sydney) solar noon azimuth is in the North (0°/360°)',
    `Observed: ${sydneyNoon.azimuthDeg}°`
  );
  assert(
    sydneyNoon.elevationDeg >= 79.5 && sydneyNoon.elevationDeg <= 79.7,
    'Sydney summer solstice noon elevation matches NOAA reference (79.57° ± 0.1°)',
    `Observed: ${sydneyNoon.elevationDeg}°`
  );

  // =========================================================================
  // Case 5: Polar day and polar night return no sunrise or sunset without throwing
  // Location: Tromsø, Norway (69.6492° N, 18.9553° E, Europe/Oslo).
  // - Summer Solstice (2026-06-21): Midnight Sun (Polar Day), 24h sunlight, no set.
  // - Winter Solstice (2026-12-21): Polar Night, 0h sunlight, no rise.
  // =========================================================================
  const tromsoPolarDay = calculateNOAASunPosition({
    latitude: 69.6492,
    longitude: 18.9553,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 12, minute: 0 },
    timezone: 'Europe/Oslo',
  });

  assert(
    tromsoPolarDay.isPolarDay === true,
    'Tromsø summer solstice detects Polar Day (Midnight Sun)'
  );
  assert(
    tromsoPolarDay.sunrise === null && tromsoPolarDay.sunset === null,
    'Polar Day returns null for sunrise and sunset without throwing'
  );
  assert(
    tromsoPolarDay.dayLengthMinutes === 1440,
    'Polar Day reports 24-hour day length (1440 minutes)'
  );

  const tromsoPolarNight = calculateNOAASunPosition({
    latitude: 69.6492,
    longitude: 18.9553,
    date: { year: 2026, month: 12, day: 21 },
    time: { hour: 12, minute: 0 },
    timezone: 'Europe/Oslo',
  });

  assert(
    tromsoPolarNight.isPolarNight === true,
    'Tromsø winter solstice detects Polar Night'
  );
  assert(
    tromsoPolarNight.sunrise === null && tromsoPolarNight.sunset === null,
    'Polar Night returns null for sunrise and sunset without throwing'
  );
  assert(
    tromsoPolarNight.dayLengthMinutes === 0,
    'Polar Night reports 0-minute day length'
  );
  assert(
    tromsoPolarNight.elevationDeg < 0,
    'Polar Night noon elevation is below horizon'
  );

  // =========================================================================
  // Case 6: DST boundary date converts local time to the correct UTC
  // US Daylight Saving Time Begins: Sunday, March 8, 2026.
  // At 01:59:59 local is PST (UTC-8) -> 09:59:59 UTC.
  // At 03:00:00 local is PDT (UTC-7) -> 10:00:00 UTC.
  // =========================================================================
  const pstUtc = localToUtc(
    { year: 2026, month: 3, day: 8 },
    { hour: 1, minute: 30, second: 0 },
    'America/Los_Angeles'
  );
  const pdtUtc = localToUtc(
    { year: 2026, month: 3, day: 8 },
    { hour: 3, minute: 30, second: 0 },
    'America/Los_Angeles'
  );

  assert(
    pstUtc.toISOString() === '2026-03-08T09:30:00.000Z',
    'DST: 01:30 PST maps accurately to 09:30 UTC'
  );
  assert(
    pdtUtc.toISOString() === '2026-03-08T10:30:00.000Z',
    'DST: 03:30 PDT maps accurately to 10:30 UTC'
  );
  const elapsedHours = (pdtUtc.getTime() - pstUtc.getTime()) / 3600000;
  assert(
    Math.abs(elapsedHours - 1.0) < 0.001,
    'DST transition gap: 1:30 PST to 3:30 PDT is exactly 1 elapsed hour'
  );

  const localRoundTrip = utcToLocal(pdtUtc, 'America/Los_Angeles');
  assert(
    localRoundTrip.hour === 3 && localRoundTrip.minute === 30,
    'Timezone round-trip preserves local wall clock time'
  );
  assert(
    isValidTimezone('America/New_York') && !isValidTimezone('Invalid/Nowhere'),
    'Timezone validator distinguishes valid and invalid IANA zones'
  );

  // =========================================================================
  // Case 7: 3D Scene Vector Convention (North = -Z, East = +X, Up = +Y)
  // =========================================================================
  const northVec = getSunVector(0, 0); // Azimuth 0°, elevation 0°
  assert(
    Math.abs(northVec[0]) < 1e-6 && northVec[1] === 0 && Math.abs(northVec[2] - (-1)) < 1e-6,
    'Vector convention: Azimuth 0° (North) points to -Z [0, 0, -1]',
    `Observed: [${northVec.map((v) => v.toFixed(3)).join(', ')}]`
  );

  const eastVec = getSunVector(90, 0); // Azimuth 90°, elevation 0°
  assert(
    Math.abs(eastVec[0] - 1) < 1e-6 && eastVec[1] === 0 && Math.abs(eastVec[2]) < 1e-6,
    'Vector convention: Azimuth 90° (East) points to +X [1, 0, 0]',
    `Observed: [${eastVec.map((v) => v.toFixed(3)).join(', ')}]`
  );

  const southVec = getSunVector(180, 0); // Azimuth 180°, elevation 0°
  assert(
    Math.abs(southVec[0]) < 1e-6 && southVec[1] === 0 && Math.abs(southVec[2] - 1) < 1e-6,
    'Vector convention: Azimuth 180° (South) points to +Z [0, 0, 1]',
    `Observed: [${southVec.map((v) => v.toFixed(3)).join(', ')}]`
  );

  const westVec = getSunVector(270, 0); // Azimuth 270°, elevation 0°
  assert(
    Math.abs(westVec[0] - (-1)) < 1e-6 && westVec[1] === 0 && Math.abs(westVec[2]) < 1e-6,
    'Vector convention: Azimuth 270° (West) points to -X [-1, 0, 0]',
    `Observed: [${westVec.map((v) => v.toFixed(3)).join(', ')}]`
  );

  const zenithVec = getSunVector(180, 90); // Elevation 90°
  assert(
    Math.abs(zenithVec[0]) < 1e-6 && Math.abs(zenithVec[1] - 1) < 1e-6 && Math.abs(zenithVec[2]) < 1e-6,
    'Vector convention: Elevation 90° (Zenith) points to +Y [0, 1, 0]',
    `Observed: [${zenithVec.map((v) => v.toFixed(3)).join(', ')}]`
  );

  // =========================================================================
  // Case 8: Night and Twilight Photometrics
  // Below 0° elevation, direct sun intensity should be 0.
  // =========================================================================
  const nightSun = calculateNOAASunPosition({
    latitude: 37.7749,
    longitude: -122.4194,
    date: { year: 2026, month: 6, day: 21 },
    time: { hour: 0, minute: 0 }, // Midnight
    timezone: 'America/Los_Angeles',
  });

  assert(
    nightSun.elevationDeg < -15,
    'Midnight in SF has negative elevation (deep night)'
  );
  assert(
    nightSun.sunIntensity === 0,
    'Direct sun intensity is strictly 0 when sun is below horizon'
  );
  assert(
    nightSun.isDaylight === false,
    'isDaylight is false at midnight'
  );
  assert(
    nightSun.ambientIntensity > 0 && nightSun.ambientIntensity < 0.2,
    'Ambient intensity provides dim night floor'
  );

  console.log(`\n========================================`);
  console.log(`Sun Engine Tests: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  return { passed, failed };
}

// Auto-run if executed directly via tsx / node
if (process.argv[1]?.includes('sunPosition.test')) {
  const result = runSunPositionTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
