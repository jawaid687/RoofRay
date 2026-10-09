import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SunVisualizer } from './SunVisualizer';
import { Neighborhood } from './Neighborhood';
import { CameraController } from './CameraController';

export function Scene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

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
        <color attach="background" args={['#0a1120']} />
        <fog attach="fog" args={['#0a1120', 140, 320]} />

        {/* Dynamic Sun Light, Realistic Shadows & Atmospheric Skylight */}
        <SunVisualizer />

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
