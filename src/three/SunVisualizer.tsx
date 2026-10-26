import { useMemo } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';

export function SunVisualizer() {
  const sunState = useSolarStore((s) => s.sunState);
  const showShadows = useSolarStore((s) => s.showShadows);

  const isDaylight = sunState.elevationDeg > 0;

  // Direct sun beam color based on astronomical elevation (FR-4.4)
  const sunColor = useMemo(() => {
    if (sunState.elevationDeg < 5) {
      return '#f97316'; // Deep warm sunset/sunrise orange
    } else if (sunState.elevationDeg < 15) {
      return '#fbbf24'; // Warm amber-gold
    } else if (sunState.elevationDeg < 35) {
      return '#fef08a'; // Soft warm daylight
    }
    return '#fffff5';   // Crisp bright midday sunlight
  }, [sunState.elevationDeg]);

  // Scaled directional beam intensity (FR-4.3, FR-4.4)
  // Below horizon: strictly 0 direct light
  const directionalIntensity = useMemo(() => {
    if (!isDaylight) return 0;
    // Ramps from 0.4 at sunrise to ~3.2 at midday zenith
    const sinElev = Math.sin((Math.max(0, sunState.elevationDeg) * Math.PI) / 180);
    return Math.max(0.4, sinElev * 3.2);
  }, [isDaylight, sunState.elevationDeg]);

  // Ambient fill lighting handling night and twilight (FR-4.3)
  const ambientIntensity = useMemo(() => {
    if (sunState.elevationDeg < -12) {
      return 0.12; // Deep night ambient floor
    } else if (sunState.elevationDeg < 0) {
      // Twilight ramp: 0.12 -> 0.35
      const t = (sunState.elevationDeg + 12) / 12;
      return 0.12 + t * 0.23;
    } else {
      // Daylight ramp: 0.35 -> 1.15
      const sinElev = Math.sin((Math.min(90, sunState.elevationDeg) * Math.PI) / 180);
      return 0.35 + sinElev * 0.8;
    }
  }, [sunState.elevationDeg]);

  // Hemispherical sky-to-ground fill
  const hemiConfig = useMemo(() => {
    if (sunState.elevationDeg < -6) {
      return { sky: '#172554', ground: '#020617', intensity: 0.2 }; // Night
    } else if (sunState.elevationDeg < 0) {
      return { sky: '#312e81', ground: '#0f172a', intensity: 0.4 }; // Twilight indigo
    } else if (sunState.elevationDeg < 15) {
      return { sky: '#fdba74', ground: '#1e293b', intensity: 0.65 }; // Golden hour
    }
    return { sky: '#7dd3fc', ground: '#1e293b', intensity: 0.95 }; // Full daylight
  }, [sunState.elevationDeg]);

  // Soft sky quadrant bounce
  const skyFillPosition = useMemo<[number, number, number]>(() => {
    return [
      -sunState.vectorToSun[0] * 70,
      45,
      -sunState.vectorToSun[2] * 70,
    ];
  }, [sunState.vectorToSun]);

  return (
    <group>
      {/* Omni-directional Ambient Light (with smooth twilight/night handling) */}
      <ambientLight intensity={ambientIntensity} color="#e2e8f0" />

      {/* Primary Directional Sun Light driven directly by NOAA solar vector (FR-4.1, FR-4.2) */}
      {isDaylight && (
        <directionalLight
          position={sunState.lightPosition}
          intensity={directionalIntensity}
          color={sunColor}
          castShadow={showShadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={10}
          shadow-camera-far={280}
          shadow-camera-left={-55}
          shadow-camera-right={55}
          shadow-camera-top={55}
          shadow-camera-bottom={-55}
          shadow-bias={-0.0003}
        />
      )}

      {/* Atmospheric Rayleigh Scattering Sky Fill (opposite quadrant, soft) */}
      {isDaylight && (
        <directionalLight
          position={skyFillPosition}
          intensity={0.4}
          color="#93c5fd"
          castShadow={false}
        />
      )}

      {/* Sky-to-Ground Hemispherical Fill */}
      <hemisphereLight
        args={[hemiConfig.sky, hemiConfig.ground, hemiConfig.intensity]}
      />

      {/* Visible Celestial Sun Sphere (FR-4.2) */}
      {sunState.elevationDeg > -4 && (
        <group position={sunState.lightPosition}>
          <mesh>
            <sphereGeometry args={[4.2, 24, 24]} />
            <meshBasicMaterial
              color={sunColor}
              transparent
              opacity={sunState.elevationDeg > 0 ? 1 : Math.max(0, (sunState.elevationDeg + 4) / 4)}
            />
          </mesh>

          {/* Corona halo */}
          {isDaylight && (
            <mesh>
              <sphereGeometry args={[8.0, 16, 16]} />
              <meshBasicMaterial
                color="#f59e0b"
                transparent
                opacity={Math.min(0.35, sunState.sunIntensity * 0.4)}
                side={THREE.BackSide}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}
