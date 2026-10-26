import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Building, SolarAnalysisResult } from '../types';
import { useSolarStore } from '../store/useSolarStore';
import { generateRoofGrid } from '../simulation/roofGrid';

interface RoofHeatmapProps {
  building: Building;
  analysis?: SolarAnalysisResult;
}

export function RoofHeatmap({ building, analysis }: RoofHeatmapProps) {
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const heatmapMode = useSolarStore((s) => s.heatmapMode);
  const liveShading = useSolarStore((s) => s.liveShading);
  const annualAnalysisResult = useSolarStore((s) => s.annualAnalysisResult);
  const selectedMonth = useSolarStore((s) => s.selectedMonth);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Fallback to generated grid if annual analysis has not yet been executed
  const grid = useMemo(() => {
    if (analysis) {
      return {
        cells: analysis.cells,
        cols: analysis.gridCols,
        rows: analysis.gridRows,
        cellWidth: (building.width / analysis.gridCols) * 0.94,
        cellLength: (building.length / analysis.gridRows) * 0.94,
      };
    }
    const gen = generateRoofGrid(building);
    return {
      cells: gen.cells,
      cols: gen.cols,
      rows: gen.rows,
      cellWidth: gen.cellWidth * 0.94,
      cellLength: gen.cellLength * 0.94,
    };
  }, [analysis, building]);

  const { cells, cellWidth, cellLength } = grid;
  const count = cells.length;

  // Pre-allocate instance dummy Object3D and dynamic color buffer
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute colors based on heatmapMode (FR-5.3 & FR-6.5)
  const colorArray = useMemo(() => {
    const colors = new Float32Array(count * 3);

    // Color swatches
    const colorLit = new THREE.Color('#10b981');      // Emerald Green
    const colorShaded = new THREE.Color('#ef4444');   // Crimson Red
    const colorObstacle = new THREE.Color('#475569'); // Slate Grey

    const colorMap = {
      excellent: new THREE.Color('#10b981'), // Green >= 80%
      good: new THREE.Color('#f59e0b'),      // Amber 60-80%
      poor: new THREE.Color('#ef4444'),      // Red < 60%
      obstacle: colorObstacle,
    };

    if (heatmapMode === 'live' && liveShading && liveShading.cellShading) {
      // Live Shading Mode: Lit (green) vs Shaded (red) vs Obstacle (grey)
      for (let i = 0; i < count; i++) {
        const cell = cells[i];
        let c = colorObstacle;

        if (cell.classification === 'obstacle') {
          c = colorObstacle;
        } else if (liveShading.cellShading[i]) {
          c = colorLit;
        } else {
          c = colorShaded;
        }

        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    } else if (heatmapMode === 'monthly' && annualAnalysisResult) {
      // Monthly Solar Insolation Gradient Mode (kWh/m²)
      // Find peak monthly insolation among non-obstacle cells for relative scaling
      let maxMonthly = 0;
      for (const c of annualAnalysisResult.cells) {
        if (!c.isObstacle && c.monthlyKWhPerM2[selectedMonth] > maxMonthly) {
          maxMonthly = c.monthlyKWhPerM2[selectedMonth];
        }
      }
      if (maxMonthly <= 0) maxMonthly = 1;

      const tempColor = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const annualCell = annualAnalysisResult.cells[i];
        if (!annualCell || annualCell.isObstacle) {
          colors[i * 3 + 0] = colorObstacle.r;
          colors[i * 3 + 1] = colorObstacle.g;
          colors[i * 3 + 2] = colorObstacle.b;
        } else {
          const kwh = annualCell.monthlyKWhPerM2[selectedMonth] || 0;
          const t = Math.max(0, Math.min(1, kwh / maxMonthly));

          if (t < 0.35) {
            // Low insolation: Deep indigo to sky blue
            tempColor.set('#1e1b4b').lerp(new THREE.Color('#0284c7'), t / 0.35);
          } else if (t < 0.7) {
            // Mid insolation: Sky blue to solar amber
            tempColor.set('#0284c7').lerp(new THREE.Color('#f59e0b'), (t - 0.35) / 0.35);
          } else {
            // High insolation: Solar amber to brilliant gold
            tempColor.set('#f59e0b').lerp(new THREE.Color('#fef08a'), (t - 0.7) / 0.3);
          }

          colors[i * 3 + 0] = tempColor.r;
          colors[i * 3 + 1] = tempColor.g;
          colors[i * 3 + 2] = tempColor.b;
        }
      }
    } else if (annualAnalysisResult) {
      // Annual Solar Exposure Classification Mode (from 12-month integrated worker analysis)
      for (let i = 0; i < count; i++) {
        const annualCell = annualAnalysisResult.cells[i];
        const classification = annualCell ? annualCell.classification : cells[i].classification;
        const c = colorMap[classification] || colorMap.poor;
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    } else {
      // Fallback Annual / Initial Classification Mode
      for (let i = 0; i < count; i++) {
        const cell = cells[i];
        const c = colorMap[cell.classification] || colorMap.poor;
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    }

    return colors;
  }, [cells, count, heatmapMode, liveShading, annualAnalysisResult, selectedMonth]);

  // Position instanced meshes over the rooftop
  useEffect(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < count; i++) {
      const cell = cells[i];
      dummy.position.set(cell.localX, 0.05, cell.localZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;

    // Apply instanced vertex colors
    const colorAttr = new THREE.InstancedBufferAttribute(colorArray, 3);
    meshRef.current.geometry.setAttribute('color', colorAttr);
    meshRef.current.instanceColor = colorAttr;
  }, [cells, colorArray, dummy, count]);

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

      {/* Recommended Installation Zone Perimeter Boundary (when annual analysis is available) */}
      {analysis?.recommendedZone && heatmapMode === 'annual' && (
        <group
          position={[
            (analysis.recommendedZone.minX + analysis.recommendedZone.maxX) / 2,
            0.1,
            (analysis.recommendedZone.minZ + analysis.recommendedZone.maxZ) / 2,
          ]}
        >
          {/* Glowing Recommended Area Border */}
          <lineSegments>
            <edgesGeometry
              args={[
                new THREE.BoxGeometry(
                  analysis.recommendedZone.width + 0.1,
                  0.05,
                  analysis.recommendedZone.length + 0.1
                ),
              ]}
            />
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>

          {/* Transparent highlight fill */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry
              args={[analysis.recommendedZone.width, analysis.recommendedZone.length]}
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
