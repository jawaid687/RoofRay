import { useState } from 'react';
import * as THREE from 'three';
import { Building, RoofObstacle } from '../types';
import { useSolarStore } from '../store/useSolarStore';
import { SolarPanelMemo } from './SolarPanelMesh';
import { RoofHeatmap } from './RoofHeatmap';

interface BuildingMeshProps {
  building: Building;
}

export function BuildingMesh({ building }: BuildingMeshProps) {
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const selectBuilding = useSolarStore((s) => s.selectBuilding);
  const setHoveredBuilding = useSolarStore((s) => s.setHoveredBuilding);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const analysisResults = useSolarStore((s) => s.analysisResults);
  const showObstacles = useSolarStore((s) => s.showObstacles);

  const [hovered, setHovered] = useState(false);

  const isSelected = selectedBuildingId === building.id;
  const analysis = analysisResults[building.id];

  const { width, length, height, position } = building;
  const [x, y, z] = position;

  // Parapet dimensions (0.3m height, 0.25m thickness around rooftop edge)
  const parapetHeight = 0.35;

  return (
    <group position={[x, y, z]}>
      {/* Main Building Structure */}
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          selectBuilding(building.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setHoveredBuilding(building.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredBuilding(null);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial
          color={building.color || '#55667b'}
          roughness={0.65}
          metalness={0.12}
          emissive={isSelected ? '#38bdf8' : hovered ? '#f59e0b' : '#000000'}
          emissiveIntensity={isSelected ? 0.08 : hovered ? 0.06 : 0}
        />
      </mesh>

      {/* Rooftop Base Surface (Flat roof) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, height + 0.01, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          selectBuilding(building.id);
        }}
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color="#3f5066"
          roughness={0.8}
          metalness={0.08}
        />
      </mesh>

      {/* Roof Parapet Rim (Edge perimeter) */}
      <group position={[0, height + parapetHeight / 2, 0]}>
        {/* North wall */}
        <mesh position={[0, 0, -length / 2 + 0.1]} castShadow receiveShadow>
          <boxGeometry args={[width, parapetHeight, 0.2]} />
          <meshStandardMaterial color="#47586e" roughness={0.7} metalness={0.12} />
        </mesh>
        {/* South wall */}
        <mesh position={[0, 0, length / 2 - 0.1]} castShadow receiveShadow>
          <boxGeometry args={[width, parapetHeight, 0.2]} />
          <meshStandardMaterial color="#47586e" roughness={0.7} metalness={0.12} />
        </mesh>
        {/* West wall */}
        <mesh position={[-width / 2 + 0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, parapetHeight, length - 0.4]} />
          <meshStandardMaterial color="#47586e" roughness={0.7} metalness={0.12} />
        </mesh>
        {/* East wall */}
        <mesh position={[width / 2 - 0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, parapetHeight, length - 0.4]} />
          <meshStandardMaterial color="#47586e" roughness={0.7} metalness={0.12} />
        </mesh>
      </group>

      {/* Selected Indicator Outline Ring / Ground Marker */}
      {isSelected && (
        <group position={[0, 0.08, 0]}>
          <lineSegments>
            <edgesGeometry
              args={[new THREE.BoxGeometry(width + 0.8, 0.1, length + 0.8)]}
            />
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>
          {/* Subtle ground glow plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width + 2, length + 2]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Rooftop Obstacles */}
      {showObstacles &&
        building.roofObstacles.map((obs) => (
          <ObstacleMesh
            key={obs.id}
            obstacle={obs}
            roofHeight={height}
          />
        ))}

      {/* Heatmap (only on selected building) */}
      {isSelected && analysis && (
        <RoofHeatmap building={building} analysis={analysis} />
      )}

      {/* Placed Solar Panels (only on selected building) */}
      {isSelected &&
        placedPanels.map((panel) => (
          <SolarPanelMemo
            key={panel.id}
            panel={panel}
            roofHeight={height}
          />
        ))}
    </group>
  );
}

/**
 * Renders individual rooftop equipment / obstacles.
 */
function ObstacleMesh({
  obstacle,
  roofHeight,
}: {
  obstacle: RoofObstacle;
  roofHeight: number;
}) {
  const { relX, relZ, width, length, height, type } = obstacle;
  const posY = roofHeight + height / 2;

  switch (type) {
    case 'hvac':
      return (
        <group position={[relX, posY, relZ]}>
          {/* Main chiller housing (Galvanized sheet metal) */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#78889b" roughness={0.4} metalness={0.65} />
          </mesh>
          {/* Top exhaust fan grill */}
          <mesh position={[0, height / 2 + 0.05, 0]}>
            <cylinderGeometry args={[Math.min(width, length) * 0.35, Math.min(width, length) * 0.35, 0.1, 16]} />
            <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      );

    case 'water_tank':
      return (
        <group position={[relX, posY, relZ]}>
          {/* Elevated Tank Support Frame (Structural dark steel) */}
          <mesh position={[0, -height * 0.35, 0]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.3, length * 0.9]} />
            <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.45} />
          </mesh>
          {/* Cylindrical Storage Tank (Reflective stainless steel) */}
          <mesh position={[0, height * 0.15, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[width * 0.45, width * 0.45, height * 0.7, 16]} />
            <meshStandardMaterial color="#dbeafe" metalness={0.65} roughness={0.25} />
          </mesh>
        </group>
      );

    case 'utility_room':
    default:
      return (
        <group position={[relX, posY, relZ]}>
          {/* Concrete Penthouse Room (Architectural concrete masonry) */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color="#54657a" roughness={0.75} metalness={0.1} />
          </mesh>
          {/* Rooftop access door */}
          <mesh position={[0, -height * 0.15, length / 2 + 0.02]}>
            <planeGeometry args={[1.0, 1.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* Roof coping slab */}
          <mesh position={[0, height / 2 + 0.05, 0]} castShadow>
            <boxGeometry args={[width + 0.2, 0.1, length + 0.2]} />
            <meshStandardMaterial color="#3b4b5f" roughness={0.65} />
          </mesh>
        </group>
      );
  }
}
