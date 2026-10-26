import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { PlacedPanel } from '../types';
import { useSolarStore } from '../store/useSolarStore';

interface SolarPanelMeshProps {
  panel: PlacedPanel;
  roofHeight: number;
  buildingPosition?: readonly [number, number, number];
}

export function SolarPanelMesh({ panel, roofHeight, buildingPosition = [0, 0, 0] }: SolarPanelMeshProps) {
  const selectedPanelIds = useSolarStore((s) => s.selectedPanelIds);
  const setSelectedPanelIds = useSolarStore((s) => s.setSelectedPanelIds);
  const placementMode = useSolarStore((s) => s.placementMode);
  const movePanel = useSolarStore((s) => s.movePanel);

  const isSelected = selectedPanelIds.includes(panel.id);
  const isLowExposure = panel.exposureScore < 0.60;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<[number, number] | null>(null);
  const dragStartPos = useRef<[number, number]>([panel.localX, panel.localZ]);

  // Tilt: slight 10° tilt facing south (+Z)
  const tiltRad = (panel.tiltDegrees * Math.PI) / 180;
  const frameHeight = 0.04;

  const currentLocalX = dragOffset ? dragOffset[0] : panel.localX;
  const currentLocalZ = dragOffset ? dragOffset[1] : panel.localZ;

  const handlePointerDown = (e: any) => {
    if (placementMode !== 'select') return;
    e.stopPropagation();

    // Multi-select with shift key or single select
    if (e.shiftKey) {
      if (isSelected) {
        setSelectedPanelIds(selectedPanelIds.filter((id) => id !== panel.id));
      } else {
        setSelectedPanelIds([...selectedPanelIds, panel.id]);
      }
    } else {
      if (!isSelected) {
        setSelectedPanelIds([panel.id]);
      }
    }

    setIsDragging(true);
    dragStartPos.current = [panel.localX, panel.localZ];
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || placementMode !== 'select') return;
    e.stopPropagation();

    const newX = e.point.x - buildingPosition[0];
    const newZ = e.point.z - buildingPosition[2];
    setDragOffset([newX, newZ]);
  };

  const handlePointerUp = (e: any) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);

    if (dragOffset) {
      const moved = movePanel(panel.id, dragOffset[0], dragOffset[1]);
      if (!moved) {
        // Snap back if invalid
        setDragOffset(null);
      } else {
        setDragOffset(null);
      }
    }
  };

  return (
    <group
      position={[currentLocalX, roofHeight + 0.14, currentLocalZ]}
      rotation={[-tiltRad, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        if (placementMode === 'select') {
          e.stopPropagation();
          document.body.style.cursor = 'grab';
        }
      }}
      onPointerOut={() => {
        if (!isDragging) {
          document.body.style.cursor = 'default';
        }
      }}
    >
      {/* Photovoltaic Active Cell Surface (Realistic Very Dark Blue Monocrystalline Silicon) */}
      <mesh castShadow receiveShadow position={[0, frameHeight / 2 + 0.006, 0]}>
        <boxGeometry args={[panel.width - 0.03, 0.016, panel.length - 0.03]} />
        <meshPhysicalMaterial
          color={isLowExposure ? '#3b1c1c' : '#172b4c'}
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
          color={isLowExposure ? '#5c2222' : '#1c345a'}
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>

      {/* Anodized Aluminum Outer Frame */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[panel.width, frameHeight, panel.length]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isLowExposure ? '#f87171' : '#94a3b8'}
          roughness={0.35}
          metalness={0.9}
        />
      </mesh>

      {/* Selected Indicator Outline / Border (PRD FR-7.4) */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(panel.width + 0.04, frameHeight + 0.02, panel.length + 0.04)]} />
          <lineBasicMaterial color="#38bdf8" linewidth={3} />
        </lineSegments>
      )}

      {/* Low Exposure Shading Indicator Warning */}
      {isLowExposure && !isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(panel.width + 0.02, frameHeight + 0.01, panel.length + 0.02)]} />
          <lineBasicMaterial color="#f87171" linewidth={2} />
        </lineSegments>
      )}

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
