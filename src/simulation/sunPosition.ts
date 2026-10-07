/**
 * Solar position calculations based on a simplified mathematical celestial sphere.
 * Assumes a mid-latitude (~38°N) spring/equinox solar path.
 * 
 * Coordinate System (Three.js):
 *   +X: East
 *   -X: West
 *   +Y: Zenith (Up)
 *   -Z: North
 *   +Z: South
 */

export interface SunState {
  timeDecimal: number;         // e.g. 13.5 = 13:30
  formattedTime: string;       // "13:30"
  azimuthDeg: number;          // 0° = North, 90° = East, 180° = South, 270° = West
  elevationDeg: number;        // Angle above horizon in degrees (0° to ~65°)
  vectorToSun: [number, number, number]; // Normalized unit vector pointing to sun
  lightPosition: [number, number, number]; // Position for DirectionalLight (radius ~ 120m)
  sunIntensity: number;        // Direct beam intensity factor (0.0 to 1.0)
  ambientIntensity: number;    // Ambient fill light factor
}

export function calculateSunPosition(timeDecimal: number, distance: number = 140): SunState {
  // Clamp time between 5:30 and 18:30 for daylight simulation
  const clampedTime = Math.max(5.5, Math.min(18.5, timeDecimal));
  
  // Format hours and minutes
  const hours = Math.floor(clampedTime);
  const minutes = Math.floor((clampedTime - hours) * 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Time progress across 12-hour solar day: 6:00 (sunrise) to 18:00 (sunset)
  // t: -1 at 6:00, 0 at 12:00, +1 at 18:00
  const solarHourAngle = ((clampedTime - 12) / 6) * (Math.PI / 2);

  // Maximum solar elevation at noon (~64 degrees)
  const maxElevationRad = (64 * Math.PI) / 180;
  
  // Elevation follows a cosine curve reaching peak at solar noon (12:00)
  const elevationRad = Math.max(0, Math.cos(solarHourAngle) * maxElevationRad);
  const elevationDeg = (elevationRad * 180) / Math.PI;

  // Azimuth path: Sunrise at ~95° (East-South-East), South at 180° (noon), Sunset at ~265° (West-South-West)
  // In Three.js:
  //   X = sin(azimuth) * cos(elevation)
  //   Y = sin(elevation)
  //   Z = cos(azimuth) * cos(elevation)
  // At 6:00 (East, +X), at 12:00 (South, +Z), at 18:00 (West, -X)
  const azimuthRad = (Math.PI / 2) + solarHourAngle * 0.95; 
  const azimuthDeg = (azimuthRad * 180) / Math.PI;

  // Direction vector pointing TOWARDS the sun from origin
  const cosElev = Math.cos(elevationRad);
  const dirX = Math.sin(azimuthRad) * cosElev;
  const dirY = Math.sin(elevationRad);
  const dirZ = Math.cos(azimuthRad) * cosElev;

  // Normalize
  const length = Math.hypot(dirX, dirY, dirZ);
  const normX = dirX / length;
  const normY = dirY / length;
  const normZ = dirZ / length;

  // Calculate realistic atmospheric lighting intensity
  // Sunlight is strongest when high in the sky, warmer/weaker near horizon
  const sinElev = Math.max(0, Math.sin(elevationRad));
  const sunIntensity = Math.min(1.0, Math.max(0.1, sinElev * 1.15));
  const ambientIntensity = Math.min(0.55, Math.max(0.15, sinElev * 0.45 + 0.1));

  return {
    timeDecimal: clampedTime,
    formattedTime,
    azimuthDeg: Math.round(azimuthDeg),
    elevationDeg: Math.round(elevationDeg * 10) / 10,
    vectorToSun: [normX, normY, normZ],
    lightPosition: [normX * distance, normY * distance, normZ * distance],
    sunIntensity,
    ambientIntensity,
  };
}
