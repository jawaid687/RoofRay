import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';
import { Building, PanelType } from '../types';

interface PanelGhostProps {
  building: Building;
  panelType: PanelType;
}

export function PanelGhost({ building, panelType }: PanelGhostProps) {
  const ghostPanel = useSolarStore((s) => s.ghostPanel);
  const placementMode = useSolarStore((s) => s.placementMode);

  if (!ghostPanel || placementMode === 'select') {
    return null;
  }

  const {
    localX,
    localZ,
    orientation,
    isValid,
    exposureScore,
    annualKWh,
    isLitNow,
    rejectionReason,
    rejectionDetail,
  } = ghostPanel;

  const width = orientation === 'portrait' ? panelType.width : panelType.length;
  const length = orientation === 'portrait' ? panelType.length : panelType.width;
  const tiltRad = (10 * Math.PI) / 180;

  // Color selection (PRD FR-7.2)
  let statusColor = '#ef4444'; // Red if invalid
  let borderColor = '#f87171';
  let badgeText = 'Invalid Placement';

  if (isValid) {
    if (exposureScore >= 0.8) {
      statusColor = '#10b981'; // Green >= 80%
      borderColor = '#34d399';
      badgeText = 'Excellent Exposure';
    } else if (exposureScore >= 0.6) {
      statusColor = '#f59e0b'; // Amber 60-80%
      borderColor = '#fbbf24';
      badgeText = 'Good Exposure';
    } else {
      statusColor = '#f87171'; // Red < 60%
      borderColor = '#fca5a5';
      badgeText = 'Low Exposure Warning';
    }
  }

  return (
    <group
      position={[localX, building.height + 0.16, localZ]}
      rotation={[-tiltRad, 0, 0]}
    >
      {/* Ghost Panel Translucent Surface */}
      <mesh>
        <boxGeometry args={[width, 0.03, length]} />
        <meshStandardMaterial
          color={statusColor}
          transparent
          opacity={isValid ? 0.65 : 0.75}
          roughness={0.2}
          metalness={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe Perimeter Highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width + 0.02, 0.04, length + 0.02)]} />
        <lineBasicMaterial color={borderColor} linewidth={2} />
      </lineSegments>

      {/* 3D Floating Tooltip Attached to Cursor Panel (PRD FR-7.3) */}
      <Html
        position={[0, 0.6, 0]}
        center
        distanceFactor={22}
        className="pointer-events-none select-none z-50"
      >
        <div className="glass-panel px-3 py-2 rounded-xl text-slate-100 shadow-2xl border border-slate-700/80 backdrop-blur-md min-w-[210px] space-y-1.5 font-sans">
          <div className="flex items-center justify-between gap-3 text-[11px] font-semibold border-b border-slate-700/60 pb-1">
            <span style={{ color: borderColor }}>{badgeText}</span>
            <span className="font-mono text-[10px] text-slate-400 capitalize">
              {orientation}
            </span>
          </div>

          {isValid ? (
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>Annual Exposure:</span>
                <span className="font-bold font-sans" style={{ color: borderColor }}>
                  {Math.round(exposureScore * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Annual Yield:</span>
                <span className="font-bold text-sky-300 font-sans">
                  ~{annualKWh} kWh/yr
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Sunlight Right Now:</span>
                <span
                  className={`text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded ${
                    isLitNow
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {isLitNow ? 'Lit by Sun' : 'In Shadow'}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 text-center pt-1 font-sans border-t border-slate-800">
                Click to place • Q / E rotate
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px]">
              <div className="text-red-400 font-medium">
                {rejectionDetail || 'Placement blocked at this spot.'}
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {rejectionReason === 'outside_setback'
                  ? 'Keep panels ≥ 0.8m from perimeter.'
                  : rejectionReason === 'obstacle_collision'
                  ? 'Maintain ≥ 0.5m obstacle buffer.'
                  : 'Overlaps existing solar panel.'}
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
