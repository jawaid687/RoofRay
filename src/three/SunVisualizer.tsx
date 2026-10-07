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

  return (
    <group>
      {/* Ambient Fill Light */}
      <ambientLight intensity={sunState.ambientIntensity} color="#e0f2fe" />

      {/* Directional Sun Light with Shadows */}
      <directionalLight
        position={sunState.lightPosition}
        intensity={sunState.sunIntensity * 2.2}
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

      {/* Secondary Sky Fill Light (Hemisphere) */}
      <hemisphereLight
        args={['#38bdf8', '#0f172a', sunState.ambientIntensity * 0.8]}
      />
    </group>
  );
}
