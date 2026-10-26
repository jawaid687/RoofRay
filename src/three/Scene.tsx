import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SunVisualizer } from './SunVisualizer';
import { Neighborhood } from './Neighborhood';
import { CameraController } from './CameraController';
import { SunPath } from './SunPath';
import { Compass } from './Compass';
import { SolarAnimator } from './SolarAnimator';
import { useSolarStore } from '../store/useSolarStore';

export function Scene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const sunElevation = useSolarStore((s) => s.sunState.elevationDeg);

  const skyColor = useMemo(() => {
    if (sunElevation < -6) return '#040711'; // Deep night
    if (sunElevation <= 0) return '#0d1222'; // Civil twilight indigo
    if (sunElevation < 12) return '#181422'; // Warm dusk / dawn horizon
    return '#0a1120'; // Standard dark energy-tech slate
  }, [sunElevation]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows="soft"
        camera={{ position: [-38, 32, 22], fov: 42, near: 0.5, far: 600 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full bg-slate-950"
        onCreated={({ scene, camera, gl }) => {
          (window as any).__three = { scene, camera, gl };
        }}
      >
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 140, 320]} />

        {/* Dynamic Sun Light, Realistic Shadows & Atmospheric Skylight */}
        <SunVisualizer />

        {/* 3D Sun Path Arc with Solstices & Equinox (FR-4.6) */}
        <SunPath />

        {/* 3D Architectural North Compass Rose (FR-4.6) */}
        <Compass />

        {/* 60 FPS Diurnal and Annual Animation Ticker (FR-2.4) */}
        <SolarAnimator />

        {/* 3D Neighborhood (Buildings, Roads, Trees, Roof Obstacles, Solar Panels) */}
        <Neighborhood />

        {/* Smooth Camera Interpolation when selecting buildings or demoing */}
        <CameraController controlsRef={controlsRef} />

        {/* Orbit Controls with bounded polar angles to avoid clipping beneath ground */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={10}
          maxDistance={180}
          maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground horizon
          target={[-16, 10, -6]} // default center on Apex Lofts
        />
      </Canvas>
    </div>
  );
}
