import { useMemo } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';

// Center position of architectural compass rose in the open western plaza
const COMPASS_CENTER: [number, number, number] = [-36, 0.08, 0];
const ROSE_RADIUS = 6.0;

function createBadgeTexture(text: string, textColor: string, bgColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Outer circle
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = textColor;
    ctx.stroke();

    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 56px "JetBrains Mono", Consolas, monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Compass() {
  const showCompass = useSolarStore((s) => s.showCompass);
  const northOffsetDeg = useSolarStore((s) => s.location.northOffsetDeg || 0);

  // Badge Textures
  const northTexture = useMemo(() => createBadgeTexture('N', '#ffffff', '#ef4444'), []);
  const eastTexture = useMemo(() => createBadgeTexture('E', '#06b6d4', '#082f49'), []);
  const southTexture = useMemo(() => createBadgeTexture('S', '#94a3b8', '#0f172a'), []);
  const westTexture = useMemo(() => createBadgeTexture('W', '#f59e0b', '#451a03'), []);

  // Dial ring geometry
  const dialRingGeometry = useMemo(() => {
    const segments = 64;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(theta) * ROSE_RADIUS, 0, -Math.cos(theta) * ROSE_RADIUS));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Degree tick marks (every 15 degrees)
  const tickMarks = useMemo(() => {
    const ticks: { x1: number; z1: number; x2: number; z2: number; isMajor: boolean }[] = [];
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const isMajor = deg % 30 === 0;
      const innerR = isCardinal ? ROSE_RADIUS - 1.2 : isMajor ? ROSE_RADIUS - 0.7 : ROSE_RADIUS - 0.4;
      ticks.push({
        x1: Math.sin(rad) * innerR,
        z1: -Math.cos(rad) * innerR,
        x2: Math.sin(rad) * ROSE_RADIUS,
        z2: -Math.cos(rad) * ROSE_RADIUS,
        isMajor,
      });
    }
    return ticks;
  }, []);

  // 3D Star Geometries
  const northArrowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Left facet
      0, 0.14, 0,
      -0.9, 0, -ROSE_RADIUS * 0.35,
      0, 0.06, -ROSE_RADIUS * 0.95,
      // Right facet
      0, 0.14, 0,
      0, 0.06, -ROSE_RADIUS * 0.95,
      0.9, 0, -ROSE_RADIUS * 0.35,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const southArrowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.12, 0,
      0.7, 0, ROSE_RADIUS * 0.3,
      0, 0.04, ROSE_RADIUS * 0.8,
      0, 0.12, 0,
      0, 0.04, ROSE_RADIUS * 0.8,
      -0.7, 0, ROSE_RADIUS * 0.3,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const eastArrowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.1, 0,
      ROSE_RADIUS * 0.3, 0, 0.7,
      ROSE_RADIUS * 0.8, 0.04, 0,
      0, 0.1, 0,
      ROSE_RADIUS * 0.8, 0.04, 0,
      ROSE_RADIUS * 0.3, 0, -0.7,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const westArrowGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0.1, 0,
      -ROSE_RADIUS * 0.3, 0, -0.7,
      -ROSE_RADIUS * 0.8, 0.04, 0,
      0, 0.1, 0,
      -ROSE_RADIUS * 0.8, 0.04, 0,
      -ROSE_RADIUS * 0.3, 0, 0.7,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  if (!showCompass) return null;

  return (
    <group position={COMPASS_CENTER} rotation={[0, (-northOffsetDeg * Math.PI) / 180, 0]}>
      {/* 1. Dark Slate Base Dial Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[ROSE_RADIUS + 0.4, 48]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* 2. Outer Ring Line */}
      <primitive
        object={
          new THREE.Line(
            dialRingGeometry,
            new THREE.LineBasicMaterial({ color: '#475569', linewidth: 2 })
          )
        }
      />

      {/* 3. Inner Concentric Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[ROSE_RADIUS * 0.45, ROSE_RADIUS * 0.47, 36]} />
        <meshBasicMaterial color="#334155" side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Degree Tick Marks */}
      {tickMarks.map((tick, i) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(tick.x1, 0.01, tick.z1),
          new THREE.Vector3(tick.x2, 0.01, tick.z2),
        ]);
        return (
          <primitive
            key={`tick-${i}`}
            object={
              new THREE.Line(
                lineGeo,
                new THREE.LineBasicMaterial({
                  color: tick.isMajor ? '#94a3b8' : '#334155',
                })
              )
            }
          />
        );
      })}

      {/* 5. Faceted 3D Compass Star */}
      <group position={[0, 0.03, 0]}>
        {/* North Arrow (Points along -Z, Vibrant Crimson) */}
        <mesh geometry={northArrowGeometry}>
          <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* South Arrow (Points along +Z, Steel/Slate) */}
        <mesh geometry={southArrowGeometry}>
          <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* East Arrow (Points along +X, Cyan) */}
        <mesh geometry={eastArrowGeometry}>
          <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.4} />
        </mesh>

        {/* West Arrow (Points along -X, Amber) */}
        <mesh geometry={westArrowGeometry}>
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* 6. Central Pivot Brass Cap */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 7. Cardinal Direction Billboard Badges */}
      {/* North: [0, 0.8, -ROSE_RADIUS - 1.4] */}
      <sprite position={[0, 0.9, -ROSE_RADIUS - 1.4]} scale={[2.0, 2.0, 1]}>
        <spriteMaterial map={northTexture} depthTest={false} transparent />
      </sprite>

      {/* East: [ROSE_RADIUS + 1.4, 0.8, 0] */}
      <sprite position={[ROSE_RADIUS + 1.4, 0.8, 0]} scale={[1.8, 1.8, 1]}>
        <spriteMaterial map={eastTexture} depthTest={false} transparent />
      </sprite>

      {/* South: [0, 0.8, ROSE_RADIUS + 1.4] */}
      <sprite position={[0, 0.8, ROSE_RADIUS + 1.4]} scale={[1.8, 1.8, 1]}>
        <spriteMaterial map={southTexture} depthTest={false} transparent />
      </sprite>

      {/* West: [-ROSE_RADIUS - 1.4, 0.8, 0] */}
      <sprite position={[-ROSE_RADIUS - 1.4, 0.8, 0]} scale={[1.8, 1.8, 1]}>
        <spriteMaterial map={westTexture} depthTest={false} transparent />
      </sprite>
    </group>
  );
}
