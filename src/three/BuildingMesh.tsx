import { useState, useRef } from 'react';
import * as THREE from 'three';
import { Building, RoofObstacle, PlacedPanel } from '../types';
import { useSolarStore } from '../store/useSolarStore';
import { SolarPanelMemo } from './SolarPanelMesh';
import { RoofHeatmap } from './RoofHeatmap';
import { PanelGhost } from './PanelGhost';
import { BestSpotsOverlay } from './BestSpotsOverlay';

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

  // Manual placement state & actions
  const placementMode = useSolarStore((s) => s.placementMode);
  const ghostPanel = useSolarStore((s) => s.ghostPanel);
  const updateGhostPosition = useSolarStore((s) => s.updateGhostPosition);
  const clearGhostPanel = useSolarStore((s) => s.clearGhostPanel);
  const addPlacedPanel = useSolarStore((s) => s.addPlacedPanel);
  const fillAreaManual = useSolarStore((s) => s.fillAreaManual);
  const getCurrentPanelType = useSolarStore((s) => s.getCurrentPanelType);

  const [hovered, setHovered] = useState(false);
  const [fillDrag, setFillDrag] = useState<{ start: [number, number]; current: [number, number] } | null>(null);
  const isDraggingFill = useRef(false);

  const isSelected = selectedBuildingId === building.id;
  const analysis = analysisResults[building.id];
  const currentPanelType = getCurrentPanelType();

  const { width, length, height, position } = building;
  const [x, y, z] = position;

  // Parapet dimensions (0.35m height, 0.2m thickness around rooftop edge)
  const parapetHeight = 0.35;

  const handleRoofPointerMove = (e: any) => {
    if (!isSelected) return;
    const localX = e.point.x - x;
    const localZ = e.point.z - z;

    if (placementMode === 'place') {
      e.stopPropagation();
      updateGhostPosition(localX, localZ);
    } else if (placementMode === 'fill' && isDraggingFill.current && fillDrag) {
      e.stopPropagation();
      setFillDrag({ start: fillDrag.start, current: [localX, localZ] });
    }
  };

  const handleRoofPointerDown = (e: any) => {
    if (!isSelected) return;
    if (placementMode === 'fill') {
      e.stopPropagation();
      const localX = e.point.x - x;
      const localZ = e.point.z - z;
      isDraggingFill.current = true;
      setFillDrag({ start: [localX, localZ], current: [localX, localZ] });
    }
  };

  const handleRoofPointerUp = (e: any) => {
    if (!isSelected) return;
    if (placementMode === 'fill' && isDraggingFill.current && fillDrag) {
      e.stopPropagation();
      isDraggingFill.current = false;
      const minX = Math.min(fillDrag.start[0], fillDrag.current[0]);
      const maxX = Math.max(fillDrag.start[0], fillDrag.current[0]);
      const minZ = Math.min(fillDrag.start[1], fillDrag.current[1]);
      const maxZ = Math.max(fillDrag.start[1], fillDrag.current[1]);

      setFillDrag(null);

      // Only fill if rectangle has sufficient dimension (at least 1m x 1m)
      if (maxX - minX >= 1.0 && maxZ - minZ >= 1.0) {
        fillAreaManual({ minX, maxX, minZ, maxZ });
      }
    }
  };

  const handleRoofClick = (e: any) => {
    e.stopPropagation();
    if (!isSelected) {
      selectBuilding(building.id);
      return;
    }

    if (placementMode === 'place' && ghostPanel?.isValid) {
      const panelType = currentPanelType;
      const newPanel: PlacedPanel = {
        id: `manual-panel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        gridCol: 0,
        gridRow: 0,
        localX: ghostPanel.localX,
        localZ: ghostPanel.localZ,
        width: ghostPanel.orientation === 'portrait' ? panelType.width : panelType.length,
        length: ghostPanel.orientation === 'portrait' ? panelType.length : panelType.width,
        orientation: ghostPanel.orientation,
        tiltDegrees: 10,
        wattage: panelType.wattage,
        exposureScore: ghostPanel.exposureScore,
        annualKWh: ghostPanel.annualKWh,
      };
      addPlacedPanel(newPanel);
    }
  };

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
        onClick={handleRoofClick}
        onPointerMove={handleRoofPointerMove}
        onPointerDown={handleRoofPointerDown}
        onPointerUp={handleRoofPointerUp}
        onPointerLeave={() => {
          if (placementMode === 'place') {
            clearGhostPanel();
          }
        }}
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color="#3f5066"
          roughness={0.8}
          metalness={0.08}
        />
      </mesh>

      {/* Invisible Interactive Top Hit Plane (Ensures continuous raycasting over obstacles and heatmaps) */}
      {isSelected && (placementMode === 'place' || placementMode === 'fill') && (
        <mesh
          position={[0, height + 0.08, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleRoofClick}
          onPointerMove={handleRoofPointerMove}
          onPointerDown={handleRoofPointerDown}
          onPointerUp={handleRoofPointerUp}
          onPointerLeave={() => {
            if (placementMode === 'place') {
              clearGhostPanel();
            }
          }}
        >
          <planeGeometry args={[width, length]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Fill Area Drag Preview Box */}
      {fillDrag && (
        (() => {
          const minX = Math.min(fillDrag.start[0], fillDrag.current[0]);
          const maxX = Math.max(fillDrag.start[0], fillDrag.current[0]);
          const minZ = Math.min(fillDrag.start[1], fillDrag.current[1]);
          const maxZ = Math.max(fillDrag.start[1], fillDrag.current[1]);
          const boxW = Math.max(0.1, maxX - minX);
          const boxL = Math.max(0.1, maxZ - minZ);
          const centerX = (minX + maxX) / 2;
          const centerZ = (minZ + maxZ) / 2;

          return (
            <group position={[centerX, height + 0.12, centerZ]}>
              <mesh>
                <boxGeometry args={[boxW, 0.05, boxL]} />
                <meshStandardMaterial color="#0284c7" transparent opacity={0.35} depthWrite={false} />
              </mesh>
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(boxW, 0.06, boxL)]} />
                <lineBasicMaterial color="#38bdf8" linewidth={2} />
              </lineSegments>
            </group>
          );
        })()
      )}

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

      {/* Heatmap (rendered whenever building is selected, displaying live shading or annual exposure) */}
      {isSelected && (
        <RoofHeatmap building={building} analysis={analysis} />
      )}

      {/* Placed Solar Panels (only on selected building) */}
      {isSelected &&
        placedPanels.map((panel) => (
          <SolarPanelMemo
            key={panel.id}
            panel={panel}
            roofHeight={height}
            buildingPosition={position}
          />
        ))}

      {/* Ghost Panel Preview (FR-7.2 & FR-7.3) */}
      {isSelected && (
        <PanelGhost building={building} panelType={currentPanelType} />
      )}

      {/* Best Spots Ranking Overlay (FR-7.6) */}
      {isSelected && (
        <BestSpotsOverlay building={building} />
      )}
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
            <meshStandardMaterial color="#47586e" metalness={0.75} roughness={0.45} />
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
