import { useMemo } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';

// Radius placing markers safely along the outer perimeter of the 3D site (outside all buildings)
const PERIMETER_RADIUS = 58.0;

function createDirectionBadgeTexture(letter: string, fullName: string, accentColor: string, bgColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rounded pill background
    const x = 12;
    const y = 14;
    const w = 232;
    const h = 100;
    const r = 24;

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Prominent Cardinal Letter
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 68, 64);

    // Separator dot
    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.fillText('•', 114, 64);

    // Full Name label (e.g. "North")
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(fullName, 130, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Site Perimeter Geographic Direction Labels (N, E, S, W)
 * Replaces the old misplaced 3D compass with 4 clean geographic perimeter labels
 * placed safely outside building footprints in accordance with NOAA solar coordinates:
 * - North (Azimuth 0°)  -> -Z
 * - East  (Azimuth 90°) -> +X
 * - South (Azimuth 180°)-> +Z
 * - West  (Azimuth 270°)-> -X
 */
export function Compass() {
  const showCompass = useSolarStore((s) => s.showCompass);
  const northOffsetDeg = useSolarStore((s) => s.location.northOffsetDeg || 0);

  // Direction Billboard Textures
  const northTexture = useMemo(() => createDirectionBadgeTexture('N', 'North', '#f87171', 'rgba(15, 23, 42, 0.92)'), []);
  const eastTexture = useMemo(() => createDirectionBadgeTexture('E', 'East', '#38bdf8', 'rgba(15, 23, 42, 0.92)'), []);
  const southTexture = useMemo(() => createDirectionBadgeTexture('S', 'South', '#94a3b8', 'rgba(15, 23, 42, 0.92)'), []);
  const westTexture = useMemo(() => createDirectionBadgeTexture('W', 'West', '#fbbf24', 'rgba(15, 23, 42, 0.92)'), []);

  if (!showCompass) return null;

  return (
    <group position={[0, 0, 0]} rotation={[0, (-northOffsetDeg * Math.PI) / 180, 0]}>
      {/* 1. North Marker (Azimuth 0° along -Z) */}
      <group position={[0, 0, -PERIMETER_RADIUS]}>
        <sprite position={[0, 2.2, 0]} scale={[6.0, 3.0, 1]}>
          <spriteMaterial map={northTexture} depthTest={false} transparent />
        </sprite>
        {/* Subtle ground anchor point */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 24]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 2. East Marker (Azimuth 90° along +X) */}
      <group position={[PERIMETER_RADIUS, 0, 0]}>
        <sprite position={[0, 2.2, 0]} scale={[5.6, 2.8, 1]}>
          <spriteMaterial map={eastTexture} depthTest={false} transparent />
        </sprite>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 24]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 3. South Marker (Azimuth 180° along +Z) */}
      <group position={[0, 0, PERIMETER_RADIUS]}>
        <sprite position={[0, 2.2, 0]} scale={[5.6, 2.8, 1]}>
          <spriteMaterial map={southTexture} depthTest={false} transparent />
        </sprite>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 24]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* 4. West Marker (Azimuth 270° along -X) */}
      <group position={[-PERIMETER_RADIUS, 0, 0]}>
        <sprite position={[0, 2.2, 0]} scale={[5.6, 2.8, 1]}>
          <spriteMaterial map={westTexture} depthTest={false} transparent />
        </sprite>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 24]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
