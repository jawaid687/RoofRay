import React from 'react';
import * as THREE from 'three';
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
      {/* Photovoltaic Active Cell Surface (Dark Monocrystalline Silicon) */}
      <mesh castShadow receiveShadow position={[0, frameHeight / 2, 0]}>
        <boxGeometry args={[panel.width - 0.04, 0.02, panel.length - 0.04]} />
        <meshStandardMaterial
          color="#0b1329"
          roughness={0.18}
          metalness={0.85}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Protective Anti-Reflective Glass Layer */}
      <mesh position={[0, frameHeight / 2 + 0.012, 0]}>
        <planeGeometry args={[panel.width - 0.05, panel.length - 0.05]} />
        <meshPhysicalMaterial
          color="#1e293b"
          transparent
          opacity={0.35}
          roughness={0.05}
          transmission={0.6}
          thickness={0.02}
          side={THREE.DoubleSide}
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
