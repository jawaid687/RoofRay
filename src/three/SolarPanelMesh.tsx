import React from 'react';
import { PlacedPanel } from '../types';

interface SolarPanelMeshProps {
  panel: PlacedPanel;
  roofHeight: number;
}

export function SolarPanelMesh({ panel, roofHeight }: SolarPanelMeshProps) {
  // Tilt: slight 10° tilt facing south (+Z)
  const tiltRad = (panel.tiltDegrees * Math.PI) / 180;
  const frameHeight = 0.04;

  return (
    <group
      position={[panel.localX, roofHeight + 0.14, panel.localZ]}
      rotation={[-tiltRad, 0, 0]}
    >
      {/* Photovoltaic Active Cell Surface (Realistic Very Dark Blue Monocrystalline Silicon) */}
      <mesh castShadow receiveShadow position={[0, frameHeight / 2 + 0.006, 0]}>
        <boxGeometry args={[panel.width - 0.03, 0.016, panel.length - 0.03]} />
        <meshPhysicalMaterial
          color="#172b4c"
          roughness={0.24}
          metalness={0.42}
          clearcoat={0.85}
          clearcoatRoughness={0.15}
          reflectivity={0.65}
        />
      </mesh>

      {/* Subtle Photovoltaic Cell Silicon Wafer Depth Layer */}
      <mesh position={[0, frameHeight / 2 + 0.015, 0]}>
        <boxGeometry args={[panel.width - 0.05, 0.002, panel.length - 0.05]} />
        <meshStandardMaterial
          color="#1c345a"
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>

      {/* Anodized Aluminum Outer Frame */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[panel.width, frameHeight, panel.length]} />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.35}
          metalness={0.9}
        />
      </mesh>

      {/* Structural Racking Stanchions / Feet */}
      <group position={[0, -0.08, 0]}>
        {/* Back legs */}
        <mesh
          position={[-panel.width * 0.35, -0.03, -panel.length * 0.35]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh
          position={[panel.width * 0.35, -0.03, -panel.length * 0.35]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Front legs */}
        <mesh
          position={[-panel.width * 0.35, -0.06, panel.length * 0.35]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh
          position={[panel.width * 0.35, -0.06, panel.length * 0.35]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export const SolarPanelMemo = React.memo(SolarPanelMesh);
