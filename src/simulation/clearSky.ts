/**
 * Clear-Sky Solar Irradiance Model.
 * Pure TypeScript implementation with zero external dependencies.
 *
 * Implements Kasten-Young optical air mass model, Meinel direct normal beam formula,
 * and isotropic diffuse plane-of-array (POA) transposition. (PRD FR-5.2)
 */

import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

export interface ClearSkyIrradianceInput {
  solarElevationDeg: number;   // Angle above horizon in degrees (refracted or unrefracted)
  solarAzimuthDeg: number;     // Clockwise degrees from true north (0° to 360°)
  sunVector: readonly [number, number, number]; // Normalized unit vector pointing to sun
  dayOfYear: number;           // 1 to 365
  panelTiltDeg?: number;       // Panel surface tilt angle above horizontal (0° = flat roof)
  panelAzimuthDeg?: number;    // Panel surface azimuth (180° = facing South in Northern Hemisphere)
}

export interface ClearSkyIrradianceResult {
  airMass: number;
  extraterrestrialIrradianceWPerM2: number;
  directNormalIrradianceWPerM2: number;
  diffuseHorizontalIrradianceWPerM2: number;
  cosIncidenceAngle: number;
  planeOfArrayBeamWPerM2: number;
  planeOfArrayDiffuseWPerM2: number;
  planeOfArrayTotalUnshadedWPerM2: number;
  planeOfArrayTotalShadedWPerM2: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculates day of year (1 to 365/366) from month (1-12) and day (1-31).
 */
export function getDayOfYear(month: number, day: number, year: number = 2026): number {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonths = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = 0;
  for (let m = 1; m < month; m++) {
    doy += daysInMonths[m];
  }
  return doy + day;
}

/**
 * Computes relative optical air mass (AM) using the Kasten and Young formula (1989).
 */
export function calculateAirMass(elevationDeg: number): number {
  if (elevationDeg <= 0) {
    return 35.0; // Saturated horizon threshold
  }
  const el = Math.max(0.1, elevationDeg);
  const sinEl = Math.sin(degToRad(el));
  const am = 1.0 / (sinEl + 0.50572 * Math.pow(el + 6.07995, -1.6364));
  return Math.max(1.0, Math.min(35.0, am));
}

/**
 * Computes normal vector of a tilted solar panel surface in Three.js coordinates:
 * North = -Z, East = +X, Up = +Y.
 */
export function getPanelSurfaceNormal(
  tiltDeg: number,
  azimuthDeg: number
): [number, number, number] {
  const tiltRad = degToRad(tiltDeg);
  const azRad = degToRad(azimuthDeg);

  // When tilt = 0° (flat horizontal roof): normal is [0, 1, 0] (straight up)
  // When tilt > 0° facing South (180°): normal tilts toward +Z
  // When tilt > 0° facing North (0°): normal tilts toward -Z
  const nx = Math.sin(azRad) * Math.sin(tiltRad);
  const ny = Math.cos(tiltRad);
  const nz = -Math.cos(azRad) * Math.sin(tiltRad);

  return [nx, ny, nz];
}

/**
 * Computes clear-sky solar irradiance and plane-of-array (POA) components.
 */
export function calculateClearSkyIrradiance(
  input: ClearSkyIrradianceInput
): ClearSkyIrradianceResult {
  const {
    solarElevationDeg,
    sunVector,
    dayOfYear,
    panelTiltDeg = 0,
    panelAzimuthDeg = 180,
  } = input;

  if (solarElevationDeg <= 0) {
    // Sun below horizon: zero beam and diffuse
    return {
      airMass: 35.0,
      extraterrestrialIrradianceWPerM2: 0,
      directNormalIrradianceWPerM2: 0,
      diffuseHorizontalIrradianceWPerM2: 0,
      cosIncidenceAngle: 0,
      planeOfArrayBeamWPerM2: 0,
      planeOfArrayDiffuseWPerM2: 0,
      planeOfArrayTotalUnshadedWPerM2: 0,
      planeOfArrayTotalShadedWPerM2: 0,
    };
  }

  // 1. Extraterrestrial irradiance (accounting for Earth's orbital eccentricity)
  const bRad = (2.0 * Math.PI * (dayOfYear - 1)) / 365.0;
  const extraterrestrial =
    SIMULATION_ASSUMPTIONS.solarConstantWPerM2 * (1.0 + 0.033 * Math.cos(bRad));

  // 2. Relative Optical Air Mass
  const airMass = calculateAirMass(solarElevationDeg);

  // 3. Direct Normal Irradiance (Meinel formula with atmospheric clearness coefficient)
  const a = SIMULATION_ASSUMPTIONS.clearSkyClearnessFactor;
  const b = SIMULATION_ASSUMPTIONS.meinelExponent;
  const directNormal = extraterrestrial * Math.pow(a, Math.pow(airMass, b));

  // 4. Diffuse Horizontal Irradiance
  const sinElev = Math.sin(degToRad(solarElevationDeg));
  const diffuseHorizontal =
    directNormal * SIMULATION_ASSUMPTIONS.clearSkyDiffuseRatio * Math.max(0.1, sinElev);

  // 5. Plane-of-Array Incidence Angle
  const panelNormal = getPanelSurfaceNormal(panelTiltDeg, panelAzimuthDeg);
  const cosIncidence =
    sunVector[0] * panelNormal[0] +
    sunVector[1] * panelNormal[1] +
    sunVector[2] * panelNormal[2];

  const clampedCosInc = Math.max(0, cosIncidence);

  // 6. Plane-of-Array Beam and Diffuse Irradiance (W/m²)
  const poaBeam = directNormal * clampedCosInc;

  // Isotropic sky view factor: (1 + cos(tilt)) / 2
  const skyViewFactor = (1.0 + Math.cos(degToRad(panelTiltDeg))) / 2.0;
  const poaDiffuse = diffuseHorizontal * skyViewFactor;

  const totalUnshaded = poaBeam + poaDiffuse;
  const totalShaded = poaDiffuse; // When direct beam is blocked by shade, diffuse light still reaches panel

  return {
    airMass,
    extraterrestrialIrradianceWPerM2: Math.round(extraterrestrial * 10) / 10,
    directNormalIrradianceWPerM2: Math.round(directNormal * 10) / 10,
    diffuseHorizontalIrradianceWPerM2: Math.round(diffuseHorizontal * 10) / 10,
    cosIncidenceAngle: Math.round(clampedCosInc * 1000) / 1000,
    planeOfArrayBeamWPerM2: Math.round(poaBeam * 10) / 10,
    planeOfArrayDiffuseWPerM2: Math.round(poaDiffuse * 10) / 10,
    planeOfArrayTotalUnshadedWPerM2: Math.round(totalUnshaded * 10) / 10,
    planeOfArrayTotalShadedWPerM2: Math.round(totalShaded * 10) / 10,
  };
}
