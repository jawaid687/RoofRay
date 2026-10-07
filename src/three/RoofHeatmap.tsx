import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Building, SolarAnalysisResult } from '../types';
import { useSolarStore } from '../store/useSolarStore';

interface RoofHeatmapProps {
  building: Building;
  analysis: SolarAnalysisResult;
}

export function RoofHeatmap({ building, analysis }: RoofHeatmapProps) {
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { cells, gridCols, gridRows, recommendedZone } = analysis;
  const count = cells.length;

  const cellWidth = (building.width / gridCols) * 0.94; // slight gap between tiles
  const cellLength = (building.length / gridRows) * 0.94;

  // Pre-calculate transformation matrices and colors
  const { colorArray, dummy } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const colors = new Float32Array(count * 3);

    const colorMap = {
      excellent: new THREE.Color('#10b981'), // Emerald green
      good: new THREE.Color('#f59e0b'),      // Amber / Gold
      poor: new THREE.Color('#ef4444'),      // Red / Shaded
      obstacle: new THREE.Color('#475569'),  // Muted Slate
    };

    cells.forEach((cell, i) => {
      const c = colorMap[cell.classification] || colorMap.poor;
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });

    return { colorArray: colors, dummy };
  }, [cells, count]);

  useEffect(() => {
    if (!meshRef.current) return;

    cells.forEach((cell, i) => {
      // Position relative to building rooftop
      dummy.position.set(cell.localX, 0.05, cell.localZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Apply instance colors
    const colorAttr = new THREE.InstancedBufferAttribute(colorArray, 3);
    meshRef.current.geometry.setAttribute('color', colorAttr);
    meshRef.current.instanceColor = colorAttr;
  }, [cells, colorArray, dummy]);

  if (!showHeatmap) return null;

  return (
    <group position={[0, building.height, 0]}>
      {/* Instanced Heatmap Grid Cells */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        receiveShadow
      >
        <boxGeometry args={[cellWidth, 0.04, cellLength]} />
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={0.82}
          roughness={0.4}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Recommended Installation Zone Perimeter Boundary */}
      {recommendedZone && (
        <group
          position={[
            (recommendedZone.minX + recommendedZone.maxX) / 2,
            0.1,
            (recommendedZone.minZ + recommendedZone.maxZ) / 2,
          ]}
        >
          {/* Glowing Recommended Area Border */}
          <lineSegments>
            <edgesGeometry
              args={[
                new THREE.BoxGeometry(
                  recommendedZone.width + 0.1,
                  0.05,
                  recommendedZone.length + 0.1
                ),
              ]}
            />
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>

          {/* Transparent highlight fill */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry
              args={[recommendedZone.width, recommendedZone.length]}
            />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
