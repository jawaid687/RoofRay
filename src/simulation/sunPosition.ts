/**
 * NOAA Solar Position Algorithm & Celestial Coordinates.
 * Pure TypeScript implementation with zero external dependencies (no Three.js, no React).
 *
 * Implements astronomical algorithms developed by Jean Meeus and standardized
 * by the National Oceanic and Atmospheric Administration (NOAA) Earth System Research Laboratories.
 *
 * Coordinate Convention (Three.js standard):
 *   North: -Z
 *   East:  +X
 *   Up:    +Y (Zenith)
 *   South: +Z
 *   West:  -X
 *
 * Azimuth: Measured clockwise from True North (0° = North, 90° = East, 180° = South, 270° = West).
 * Elevation: Angle in degrees above the local horizon (negative below horizon).
 */

import { localToUtc, utcToLocal, formatMinutesToTime, formatDecimalTime } from './timezone';

export interface SolarTimeInput {
  hour: number;
  minute: number;
  second?: number;
}

export interface SolarPositionInput {
  latitude: number;           // -90 to +90 degrees (North positive)
  longitude: number;          // -180 to +180 degrees (East positive, West negative)
  date: Date | string | { year: number; month: number; day: number };
  time?: SolarTimeInput | number; // Local time as {hour, minute} or decimal hour (e.g. 13.5 = 13:30)
  timezone?: string;          // IANA timezone string e.g. 'America/Los_Angeles' or 'UTC'
  northOffsetDeg?: number;    // True-north rotation offset of the scene in degrees (default 0)
  distance?: number;          // Visual distance of celestial light/orb in meters (default 130m)
}

export interface SolarEvent {
  utc: Date;
  localTimeFormatted: string;
  utcTimeFormatted: string;
}

export interface SolarNoonEvent extends SolarEvent {
  elevationDeg: number;
}

export interface SunState {
  timeDecimal: number;
  formattedTime: string;
  azimuthDeg: number;
  elevationDeg: number;
  unrefractedElevationDeg: number;
  zenithDeg: number;
  declinationDeg: number;
  equationOfTimeMinutes: number;
  hourAngleDeg: number;

  // Day timeline events
  solarNoon: SolarNoonEvent;
  sunrise: SolarEvent | null;
  sunset: SolarEvent | null;
  dayLengthMinutes: number;
  isDaylight: boolean;
  isPolarDay: boolean;
  isPolarNight: boolean;

  // 3D Scene mapping (North = -Z, East = +X, Up = +Y)
  vectorToSun: [number, number, number];
  lightPosition: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
  utcDate: Date;
  localDate: { year: number; month: number; day: number };
  timezone: string;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates apparent solar elevation corrected for atmospheric refraction (in degrees).
 */
export function calculateAtmosphericRefraction(unrefractedElevDeg: number): number {
  if (unrefractedElevDeg > 85.0) {
    return 0;
  }
  if (unrefractedElevDeg > 5.0) {
    const te = Math.tan(degToRad(unrefractedElevDeg));
    const arcsec = 58.1 / te - 0.07 / Math.pow(te, 3) + 0.000086 / Math.pow(te, 5);
    return arcsec / 3600;
  }
  if (unrefractedElevDeg > -0.575) {
    const e = unrefractedElevDeg;
    const arcsec = 1735.0 + e * (-518.2 + e * (103.4 + e * (-12.79 + e * 0.711)));
    return arcsec / 3600;
  }
  const te = Math.tan(degToRad(unrefractedElevDeg));
  return te !== 0 ? (-20.774 / te) / 3600 : 0;
}

/**
 * Computes 3D normalized direction vector pointing toward the sun in Three.js coordinates.
 * Convention: North = -Z, East = +X, Up = +Y.
 * Azimuth: Clockwise from North (0° = North, 90° = East, 180° = South, 270° = West).
 */
export function getSunVector(
  azimuthDeg: number,
  elevationDeg: number,
  northOffsetDeg: number = 0
): [number, number, number] {
  const azRad = degToRad(azimuthDeg);
  const elRad = degToRad(elevationDeg);
  const cosEl = Math.cos(elRad);

  // Direction pointing toward sun before scene orientation rotation
  // At az=0° (North): x = 0, y = sin(el), z = -cos(el) (-Z is North)
  // At az=90° (East): x = cos(el), y = sin(el), z = 0 (+X is East)
  // At az=180° (South): x = 0, y = sin(el), z = +cos(el) (+Z is South)
  // At az=270° (West): x = -cos(el), y = sin(el), z = 0 (-X is West)
  const rawX = Math.sin(azRad) * cosEl;
  const rawY = Math.sin(elRad);
  const rawZ = -Math.cos(azRad) * cosEl;

  if (northOffsetDeg === 0) {
    return [rawX, rawY, rawZ];
  }

  // Rotate clockwise around Y axis by northOffsetDeg
  const offsetRad = degToRad(northOffsetDeg);
  const cosOff = Math.cos(offsetRad);
  const sinOff = Math.sin(offsetRad);

  const rotX = rawX * cosOff + rawZ * sinOff;
  const rotY = rawY;
  const rotZ = -rawX * sinOff + rawZ * cosOff;

  return [rotX, rotY, rotZ];
}

/**
 * Evaluates core NOAA astronomical ephemeris for a specific UTC timestamp and geographical point.
 */
export function calculateNOAASunPosition(input: SolarPositionInput): SunState {
  const latitude = clamp(input.latitude, -90, 90);
  const longitude = clamp(input.longitude, -180, 180);
  const timezone = input.timezone || 'UTC';
  const northOffsetDeg = input.northOffsetDeg || 0;
  const distance = input.distance || 130;

  // Resolve UTC Date and local time
  let utcDate: Date;
  let localYear: number;
  let localMonth: number;
  let localDay: number;
  let localHour: number;
  let localMinute: number;
  let localSecond: number;
  let localTimeDecimal: number;

  if (input.date instanceof Date) {
    utcDate = input.date;
    const local = utcToLocal(utcDate, timezone);
    localYear = local.year;
    localMonth = local.month;
    localDay = local.day;
    localHour = local.hour;
    localMinute = local.minute;
    localSecond = local.second;
    localTimeDecimal = local.timeDecimal;
  } else {
    // Structured date input
    if (typeof input.date === 'string') {
      const parts = input.date.split('-').map((p) => parseInt(p, 10));
      localYear = parts[0] || 2026;
      localMonth = parts[1] || 6;
      localDay = parts[2] || 21;
    } else {
      localYear = input.date.year;
      localMonth = input.date.month;
      localDay = input.date.day;
    }

    if (typeof input.time === 'number') {
      localTimeDecimal = Math.max(0, Math.min(24, input.time));
      localHour = Math.floor(localTimeDecimal);
      const rem = (localTimeDecimal - localHour) * 60;
      localMinute = Math.floor(rem);
      localSecond = Math.round((rem - localMinute) * 60);
    } else if (input.time) {
      localHour = input.time.hour ?? 12;
      localMinute = input.time.minute ?? 0;
      localSecond = input.time.second ?? 0;
      localTimeDecimal = localHour + localMinute / 60 + localSecond / 3600;
    } else {
      localHour = 12;
      localMinute = 0;
      localSecond = 0;
      localTimeDecimal = 12.0;
    }

    utcDate = localToUtc(
      { year: localYear, month: localMonth, day: localDay },
      { hour: localHour, minute: localMinute, second: localSecond },
      timezone
    );
  }

  // 1. Julian Day and Julian Century
  const timeMs = utcDate.getTime();
  const julianDay = timeMs / 86400000 + 2440587.5;
  const julianCentury = (julianDay - 2451545.0) / 36525.0;

  // 2. Solar Ephemeris Parameters
  const geomMeanLongSun = (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;
  const geomMeanAnomSun = 357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  const eccentEarthOrbit = 0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury);

  const mRad = degToRad(geomMeanAnomSun);
  const sunEqOfCtr =
    Math.sin(mRad) * (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
    Math.sin(2 * mRad) * (0.019993 - 0.000101 * julianCentury) +
    Math.sin(3 * mRad) * 0.000289;

  const sunTrueLong = geomMeanLongSun + sunEqOfCtr;
  const sunAppLong = sunTrueLong - 0.00569 - 0.00478 * Math.sin(degToRad(125.04 - 1934.136 * julianCentury));

  const meanObliqEcliptic =
    23 +
    (26 +
      (21.448 -
        julianCentury * (46.815 + julianCentury * (0.00059 - julianCentury * 0.001813))) /
        60) /
      60;
  const obliqCorr = meanObliqEcliptic + 0.00256 * Math.cos(degToRad(125.04 - 1934.136 * julianCentury));

  const obliqCorrRad = degToRad(obliqCorr);
  const sunAppLongRad = degToRad(sunAppLong);

  // 3. Sun Declination
  const sinDecl = Math.sin(obliqCorrRad) * Math.sin(sunAppLongRad);
  const declinationRad = Math.asin(sinDecl);
  const declinationDeg = radToDeg(declinationRad);

  // 4. Equation of Time (minutes)
  const varY = Math.tan(obliqCorrRad / 2) * Math.tan(obliqCorrRad / 2);
  const l0Rad = degToRad(geomMeanLongSun);
  const eqOfTimeMinutes =
    4 *
    radToDeg(
      varY * Math.sin(2 * l0Rad) -
        2 * eccentEarthOrbit * Math.sin(mRad) +
        4 * eccentEarthOrbit * varY * Math.sin(mRad) * Math.cos(2 * l0Rad) -
        0.5 * varY * varY * Math.sin(4 * l0Rad) -
        1.25 * eccentEarthOrbit * eccentEarthOrbit * Math.sin(2 * mRad)
    );

  // 5. UTC Minutes from Midnight for current moment
  const utcHours = utcDate.getUTCHours();
  const utcMinutesTotal = utcHours * 60 + utcDate.getUTCMinutes() + utcDate.getUTCSeconds() / 60;

  // 6. True Solar Time & Hour Angle
  let trueSolarTime = (utcMinutesTotal + 4 * longitude + eqOfTimeMinutes) % 1440;
  if (trueSolarTime < 0) trueSolarTime += 1440;

  let hourAngleDeg = trueSolarTime / 4 - 180;
  if (hourAngleDeg < -180) hourAngleDeg += 360;

  // 7. Solar Zenith & Elevation
  const latRad = degToRad(latitude);
  const haRad = degToRad(hourAngleDeg);

  let cosZenith =
    Math.sin(latRad) * Math.sin(declinationRad) +
    Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(haRad);
  cosZenith = clamp(cosZenith, -1, 1);
  const zenithDeg = radToDeg(Math.acos(cosZenith));
  const unrefractedElevationDeg = 90 - zenithDeg;

  // 8. Atmospheric Refraction Correction
  const refractionDeg = calculateAtmosphericRefraction(unrefractedElevationDeg);
  const elevationDeg = unrefractedElevationDeg + refractionDeg;

  // 9. Solar Azimuth (measured clockwise from True North: 0° to 360°)
  let azimuthDeg = 0;
  const sinZenith = Math.sin(degToRad(zenithDeg));

  if (sinZenith < 1e-6) {
    // Sun directly overhead (zenith)
    azimuthDeg = hourAngleDeg > 0 ? 180 : 0;
  } else {
    let cosAz =
      (Math.sin(latRad) * Math.cos(degToRad(zenithDeg)) - Math.sin(declinationRad)) /
      (Math.cos(latRad) * sinZenith);
    cosAz = clamp(cosAz, -1, 1);
    const azRaw = radToDeg(Math.acos(cosAz));

    if (hourAngleDeg > 0) {
      azimuthDeg = (azRaw + 180) % 360;
    } else {
      azimuthDeg = (540 - azRaw) % 360;
    }
  }

  // 10. Solar Day Events (Noon, Sunrise, Sunset)
  // Solar Noon in UTC minutes from start of UTC day
  const solarNoonUtcMinutes = 720 - 4 * longitude - eqOfTimeMinutes;

  // Date object corresponding to UTC solar noon on this day
  const midnightUtcMs = Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  );
  const solarNoonUtcDate = new Date(midnightUtcMs + solarNoonUtcMinutes * 60000);
  const solarNoonLocal = utcToLocal(solarNoonUtcDate, timezone);

  // Maximum solar elevation at noon: 90° - |latitude - declination| + refraction
  const noonZenith = Math.abs(latitude - declinationDeg);
  const noonUnrefractedElev = 90 - noonZenith;
  const noonElev = noonUnrefractedElev + calculateAtmosphericRefraction(noonUnrefractedElev);

  const solarNoon: SolarNoonEvent = {
    utc: solarNoonUtcDate,
    localTimeFormatted: solarNoonLocal.formattedTime,
    utcTimeFormatted: formatMinutesToTime(solarNoonUtcMinutes) || '12:00',
    elevationDeg: Math.round(noonElev * 100) / 100,
  };

  // Sunrise and Sunset: NOAA uses 90.833° standard zenith (50 arcminutes: 34' refraction + 16' radius)
  const zenith0Rad = degToRad(90.833);
  let isPolarDay = false;
  let isPolarNight = false;
  let dayLengthMinutes = 0;
  let sunrise: SolarEvent | null = null;
  let sunset: SolarEvent | null = null;

  const cosLatCosDecl = Math.cos(latRad) * Math.cos(declinationRad);
  if (Math.abs(cosLatCosDecl) < 1e-7) {
    // Geographic poles
    if (latitude * declinationDeg > 0) {
      isPolarDay = true;
      dayLengthMinutes = 1440;
    } else {
      isPolarNight = true;
      dayLengthMinutes = 0;
    }
  } else {
    const cosHa0 = (Math.cos(zenith0Rad) - Math.sin(latRad) * Math.sin(declinationRad)) / cosLatCosDecl;

    if (cosHa0 > 1) {
      // Sun never reaches standard rise zenith: Polar Night
      isPolarNight = true;
      dayLengthMinutes = 0;
    } else if (cosHa0 < -1) {
      // Sun never sets below standard zenith: Polar Day
      isPolarDay = true;
      dayLengthMinutes = 1440;
    } else {
      const ha0Deg = radToDeg(Math.acos(cosHa0));
      dayLengthMinutes = ha0Deg * 8; // (2 * ha0Deg / 15 deg/hr) * 60 min/hr

      const sunriseUtcMinutes = solarNoonUtcMinutes - ha0Deg * 4;
      const sunsetUtcMinutes = solarNoonUtcMinutes + ha0Deg * 4;

      const sunriseUtcDate = new Date(midnightUtcMs + sunriseUtcMinutes * 60000);
      const sunsetUtcDate = new Date(midnightUtcMs + sunsetUtcMinutes * 60000);

      sunrise = {
        utc: sunriseUtcDate,
        localTimeFormatted: utcToLocal(sunriseUtcDate, timezone).formattedTime,
        utcTimeFormatted: formatMinutesToTime(sunriseUtcMinutes) || '',
      };

      sunset = {
        utc: sunsetUtcDate,
        localTimeFormatted: utcToLocal(sunsetUtcDate, timezone).formattedTime,
        utcTimeFormatted: formatMinutesToTime(sunsetUtcMinutes) || '',
      };
    }
  }

  // 11. 3D Scene Vectors and Photometric Intensities
  const vectorToSun = getSunVector(azimuthDeg, elevationDeg, northOffsetDeg);
  const lightPosition: [number, number, number] = [
    vectorToSun[0] * distance,
    vectorToSun[1] * distance,
    vectorToSun[2] * distance,
  ];

  // Sunlight is only active when above horizon
  const isDaylight = elevationDeg > 0;
  const sinElev = Math.max(0, Math.sin(degToRad(Math.max(0, elevationDeg))));
  const sunIntensity = isDaylight ? clamp(sinElev * 1.25, 0.05, 1.0) : 0;

  // Realistic twilight ambient falloff
  let ambientIntensity: number;
  if (elevationDeg >= 0) {
    ambientIntensity = clamp(0.35 + sinElev * 0.75, 0.35, 1.1);
  } else if (elevationDeg >= -6) {
    // Civil twilight (0° down to -6°)
    const t = (elevationDeg + 6) / 6;
    ambientIntensity = 0.15 + t * 0.2;
  } else if (elevationDeg >= -18) {
    // Nautical to astronomical twilight (-6° down to -18°)
    const t = (elevationDeg + 18) / 12;
    ambientIntensity = 0.08 + t * 0.07;
  } else {
    // Night
    ambientIntensity = 0.08;
  }

  const formattedTime = formatDecimalTime(localTimeDecimal);

  return {
    timeDecimal: localTimeDecimal,
    formattedTime,
    azimuthDeg: Math.round(azimuthDeg * 100) / 100,
    elevationDeg: Math.round(elevationDeg * 100) / 100,
    unrefractedElevationDeg: Math.round(unrefractedElevationDeg * 100) / 100,
    zenithDeg: Math.round(zenithDeg * 100) / 100,
    declinationDeg: Math.round(declinationDeg * 100) / 100,
    equationOfTimeMinutes: Math.round(eqOfTimeMinutes * 100) / 100,
    hourAngleDeg: Math.round(hourAngleDeg * 100) / 100,

    solarNoon,
    sunrise,
    sunset,
    dayLengthMinutes: Math.round(dayLengthMinutes),
    isDaylight,
    isPolarDay,
    isPolarNight,

    vectorToSun,
    lightPosition,
    sunIntensity,
    ambientIntensity,
    utcDate,
    localDate: { year: localYear, month: localMonth, day: localDay },
    timezone,
  };
}

/**
 * Universal backwards-compatible function for calculating sun position.
 * Supports both modern SolarPositionInput and legacy (timeDecimal, distance) signature.
 */
export function calculateSunPosition(
  param: number | SolarPositionInput,
  distance: number = 130
): SunState {
  if (typeof param === 'number') {
    // Default baseline for legacy calls: San Francisco on Spring Equinox (March 20)
    return calculateNOAASunPosition({
      latitude: 37.7749,
      longitude: -122.4194,
      date: { year: 2026, month: 3, day: 20 },
      time: param,
      timezone: 'America/Los_Angeles',
      distance,
    });
  }

  return calculateNOAASunPosition(param);
}
