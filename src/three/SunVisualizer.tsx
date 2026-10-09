import { useMemo } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';
import { calculateSunPosition } from '../simulation/sunPosition';

export function SunVisualizer() {
  const timeOfDay = useSolarStore((s) => s.timeOfDay);
  const showShadows = useSolarStore((s) => s.showShadows);

  const sunState = useMemo(() => calculateSunPosition(timeOfDay, 130), [timeOfDay]);

  // Color temperature shifts: golden sunrise/sunset, crisp white-yellow at noon
  const sunColor = useMemo(() => {
    if (sunState.elevationDeg < 15) {
      return '#ffaa44'; // warm amber near horizon
    } else if (sunState.elevationDeg < 35) {
      return '#fff3cc'; // warm white
    }
    return '#fffff5';   // bright daylight
  }, [sunState.elevationDeg]);

  // Physically balanced ambient and sky illumination factors that prevent pitch-black surfaces
  const ambientIntensity = useMemo(() => {
    // Baseline ambient fill from 1.05 (dawn/dusk) to 1.35 (solar noon)
    return Math.min(1.35, Math.max(1.05, (sunState.elevationDeg / 64) * 0.3 + 1.05));
  }, [sunState.elevationDeg]);

  const hemiIntensity = useMemo(() => {
    // Hemispherical sky dome & ground bounce from 0.85 to 1.15
    return Math.min(1.15, Math.max(0.85, (sunState.elevationDeg / 64) * 0.3 + 0.85));
  }, [sunState.elevationDeg]);

  // Position for soft diffuse skylight scattering from opposite sky quadrant
  const skyFillPosition = useMemo<[number, number, number]>(() => {
    return [
      -sunState.lightPosition[0] * 0.6,
      45,
      -sunState.lightPosition[2] * 0.6,
    ];
  }, [sunState.lightPosition]);

  return (
    <group>
      {/* Omni-directional Ambient Fill Light (prevents pitch-black faces) */}
      <ambientLight intensity={ambientIntensity} color="#e2e8f0" />

      {/* Primary Directional Sun Light with Crisp Dynamic Cast Shadows */}
      <directionalLight
        position={sunState.lightPosition}
        intensity={Math.max(1.8, sunState.sunIntensity * 3.0)}
        color={sunColor}
        castShadow={showShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={320}
        shadow-camera-left={-65}
        shadow-camera-right={65}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
        shadow-bias={-0.0004}
      />

      {/* Atmospheric Rayleigh Scattering Sky Fill (Opposite Sky Quadrant, Soft & Non-Casting) */}
      <directionalLight
        position={skyFillPosition}
        intensity={0.65}
        color="#bae6fd"
        castShadow={false}
      />

      {/* Sky-to-Ground Hemispherical Fill (Natural gradient from blue sky to slate ground bounce) */}
      <hemisphereLight
        args={['#93c5fd', '#3b4d63', hemiIntensity]}
      />

      {/* Visible Celestial Sun Sphere */}
      <mesh position={sunState.lightPosition}>
        <sphereGeometry args={[4.5, 24, 24]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Sun Glow Corona */}
      <mesh position={sunState.lightPosition}>
        <sphereGeometry args={[8.5, 16, 16]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
