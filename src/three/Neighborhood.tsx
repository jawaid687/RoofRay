import { useMemo } from 'react';
import { useSolarStore } from '../store/useSolarStore';
import { BuildingMesh } from './BuildingMesh';

export function Neighborhood() {
  const buildings = useSolarStore((s) => s.buildings);

  // Decorative trees placed along sidewalks
  const treePositions = useMemo(() => [
    [-30, 0, -20],
    [-24, 0, -20],
    [-8, 0, -10],
    [-6, 0, 10],
    [6, 0, -10],
    [8, 0, 10],
    [26, 0, -18],
    [30, 0, -22],
    [-2, 0, 18],
    [4, 0, 18],
    [-24, 0, 24],
    [28, 0, 26],
  ], []);

  return (
    <group>
      {/* Surrounding Ground Plane (Muted charcoal grass/terrain) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Urban Ground Grid Guide */}
      <gridHelper args={[140, 70, '#334155', '#1e293b']} position={[0, -0.02, 0]} />

      {/* Main East-West Asphalt Roadway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]} receiveShadow>
        <planeGeometry args={[140, 12]} />
        <meshStandardMaterial color="#1a2234" roughness={0.7} />
      </mesh>

      {/* Main North-South Asphalt Roadway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[12, 140]} />
        <meshStandardMaterial color="#1a2234" roughness={0.7} />
      </mesh>

      {/* East-West Yellow Centerline Road Markings */}
      <group position={[0, 0.03, 5]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`ew-line-${i}`}
            position={[-60 + i * 9.5, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[4.5, 0.3]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        ))}
      </group>

      {/* North-South Yellow Centerline Road Markings */}
      <group position={[0, 0.035, 0]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`ns-line-${i}`}
            position={[0, 0, -60 + i * 9.5]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          >
            <planeGeometry args={[4.5, 0.3]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        ))}
      </group>

      {/* Concrete Sidewalk Curbs / Pedestrian Walkways */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, 0.04, -14]} receiveShadow>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.04, -14]} receiveShadow>
        <planeGeometry args={[34, 18]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-24, 0.04, 24]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[24, 0.04, 24]} receiveShadow>
        <planeGeometry args={[34, 22]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Decorative Urban Trees */}
      {treePositions.map(([tx, ty, tz], i) => (
        <group key={`tree-${i}`} position={[tx, ty, tz]}>
          {/* Tree Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 2.4, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {/* Foliage Cone */}
          <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
            <coneGeometry args={[1.6, 3.2, 7]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Render All Neighborhood Buildings */}
      {buildings.map((bldg) => (
        <BuildingMesh key={bldg.id} building={bldg} />
      ))}
    </group>
  );
}
