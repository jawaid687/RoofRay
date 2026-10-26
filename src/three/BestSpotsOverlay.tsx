import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useSolarStore } from '../store/useSolarStore';
import { Building, PlacedPanel } from '../types';

interface BestSpotsOverlayProps {
  building: Building;
}

export function BestSpotsOverlay({ building }: BestSpotsOverlayProps) {
  const showBestSpots = useSolarStore((s) => s.showBestSpots);
  const bestSpotsList = useSolarStore((s) => s.bestSpotsList);
  const getCurrentPanelType = useSolarStore((s) => s.getCurrentPanelType);
  const addPlacedPanel = useSolarStore((s) => s.addPlacedPanel);

  if (!showBestSpots || bestSpotsList.length === 0) {
    return null;
  }

  const panelType = getCurrentPanelType();
  const tiltRad = (10 * Math.PI) / 180;

  return (
    <group>
      {bestSpotsList.map((spot, index) => {
        const rank = index + 1;
        const isTop3 = rank <= 3;
        const color = isTop3 ? '#fbbf24' : '#38bdf8'; // Gold for top 3, Cyan for others

        return (
          <group
            key={`best-spot-${spot.localX}-${spot.localZ}`}
            position={[spot.localX, building.height + 0.15, spot.localZ]}
            rotation={[-tiltRad, 0, 0]}
          >
            {/* Clickable transparent target box */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                const newPanel: PlacedPanel = {
                  id: `spot-panel-${Date.now()}-${rank}`,
                  gridCol: 0,
                  gridRow: 0,
                  localX: spot.localX,
                  localZ: spot.localZ,
                  width: spot.width,
                  length: spot.length,
                  orientation: spot.orientation,
                  tiltDegrees: 10,
                  wattage: panelType.wattage,
                  exposureScore: spot.exposureScore,
                  annualKWh: spot.annualKWh,
                };
                addPlacedPanel(newPanel);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[spot.width, 0.02, spot.length]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.35}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>

            {/* Wireframe Outline */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(spot.width, 0.03, spot.length)]} />
              <lineBasicMaterial color={color} linewidth={2} />
            </lineSegments>

            {/* 3D Floating Rank Badge */}
            <Html
              position={[0, 0.35, 0]}
              center
              distanceFactor={24}
              className="pointer-events-none select-none z-40"
            >
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-lg flex items-center gap-1 backdrop-blur-md border ${
                  isTop3
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                    : 'bg-sky-950/80 text-sky-300 border-sky-500/60'
                }`}
              >
                <span>#{rank}</span>
                <span className="text-[9px] font-normal text-slate-300">
                  {spot.annualKWh} kWh
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
