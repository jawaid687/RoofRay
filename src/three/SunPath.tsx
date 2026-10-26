import { useMemo } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';
import { calculateNOAASunPosition } from '../simulation/sunPosition';

const DOME_RADIUS = 85; // Celestial sphere radius in meters

interface ArcPointData {
  timeDecimal: number;
  elevationDeg: number;
  azimuthDeg: number;
  position: THREE.Vector3;
}

function computeDayArcPoints(
  latitude: number,
  longitude: number,
  year: number,
  month: number,
  day: number,
  timezone: string,
  northOffsetDeg: number,
  radius: number
): { points: THREE.Vector3[]; hourMarkers: ArcPointData[]; noonPoint: ArcPointData | null } {
  const points: THREE.Vector3[] = [];
  const hourMarkers: ArcPointData[] = [];
  let peakPoint: ArcPointData | null = null;
  let maxElevation = -90;

  // Sample every 20 minutes (72 steps across 24 hours)
  const stepHours = 20 / 60;
  for (let t = 0; t <= 24; t += stepHours) {
    const sun = calculateNOAASunPosition({
      latitude,
      longitude,
      date: { year, month, day },
      time: t,
      timezone,
      northOffsetDeg,
      distance: radius,
    });

    if (sun.elevationDeg >= -1.0) {
      const vec = new THREE.Vector3(
        sun.vectorToSun[0] * radius,
        Math.max(0, sun.vectorToSun[1] * radius),
        sun.vectorToSun[2] * radius
      );
      points.push(vec);

      if (sun.elevationDeg > maxElevation) {
        maxElevation = sun.elevationDeg;
        peakPoint = {
          timeDecimal: t,
          elevationDeg: sun.elevationDeg,
          azimuthDeg: sun.azimuthDeg,
          position: vec,
        };
      }

      // Collect hour markers at integer hours (e.g. 6:00, 8:00, 10:00, 12:00, 14:00, 16:00, 18:00)
      const isNearIntegerHour = Math.abs(t - Math.round(t)) < 0.05;
      if (isNearIntegerHour && Math.round(t) % 2 === 0 && sun.elevationDeg >= 0) {
        hourMarkers.push({
          timeDecimal: Math.round(t),
          elevationDeg: sun.elevationDeg,
          azimuthDeg: sun.azimuthDeg,
          position: vec,
        });
      }
    }
  }

  return { points, hourMarkers, noonPoint: peakPoint };
}

export function SunPath() {
  const showSunPath = useSolarStore((s) => s.showSunPath);
  const location = useSolarStore((s) => s.location);
  const dateTime = useSolarStore((s) => s.dateTime);
  const sunState = useSolarStore((s) => s.sunState);

  // 1. Today's Solar Arc
  const todayData = useMemo(() => {
    return computeDayArcPoints(
      location.latitude,
      location.longitude,
      dateTime.year,
      dateTime.month,
      dateTime.day,
      location.timezone,
      location.northOffsetDeg,
      DOME_RADIUS
    );
  }, [location.latitude, location.longitude, location.timezone, location.northOffsetDeg, dateTime.year, dateTime.month, dateTime.day]);

  // 2. Summer Solstice Arc (June 21)
  const summerSolsticeData = useMemo(() => {
    return computeDayArcPoints(
      location.latitude,
      location.longitude,
      dateTime.year,
      6,
      21,
      location.timezone,
      location.northOffsetDeg,
      DOME_RADIUS
    );
  }, [location.latitude, location.longitude, location.timezone, location.northOffsetDeg, dateTime.year]);

  // 3. Winter Solstice Arc (December 21)
  const winterSolsticeData = useMemo(() => {
    return computeDayArcPoints(
      location.latitude,
      location.longitude,
      dateTime.year,
      12,
      21,
      location.timezone,
      location.northOffsetDeg,
      DOME_RADIUS
    );
  }, [location.latitude, location.longitude, location.timezone, location.northOffsetDeg, dateTime.year]);

  // 4. Spring Equinox Arc (March 20)
  const equinoxData = useMemo(() => {
    return computeDayArcPoints(
      location.latitude,
      location.longitude,
      dateTime.year,
      3,
      20,
      location.timezone,
      location.northOffsetDeg,
      DOME_RADIUS
    );
  }, [location.latitude, location.longitude, location.timezone, location.northOffsetDeg, dateTime.year]);

  // Create curves for tubes
  const todayCurve = useMemo(() => {
    if (todayData.points.length < 2) return null;
    return new THREE.CatmullRomCurve3(todayData.points);
  }, [todayData.points]);

  const summerCurve = useMemo(() => {
    if (summerSolsticeData.points.length < 2) return null;
    return new THREE.CatmullRomCurve3(summerSolsticeData.points);
  }, [summerSolsticeData.points]);

  const winterCurve = useMemo(() => {
    if (winterSolsticeData.points.length < 2) return null;
    return new THREE.CatmullRomCurve3(winterSolsticeData.points);
  }, [winterSolsticeData.points]);

  const equinoxCurve = useMemo(() => {
    if (equinoxData.points.length < 2) return null;
    return new THREE.CatmullRomCurve3(equinoxData.points);
  }, [equinoxData.points]);

  // Horizon ring line geometry
  const horizonLineGeometry = useMemo(() => {
    const segments = 96;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.sin(theta) * DOME_RADIUS, 0.05, -Math.cos(theta) * DOME_RADIUS));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Current sun marker coordinates on dome
  const currentSunDomePos = useMemo<[number, number, number]>(() => {
    return [
      sunState.vectorToSun[0] * DOME_RADIUS,
      Math.max(0, sunState.vectorToSun[1] * DOME_RADIUS),
      sunState.vectorToSun[2] * DOME_RADIUS,
    ];
  }, [sunState.vectorToSun]);

  // Ground drop-line from current sun position down to horizon plane
  const dropLineGeometry = useMemo(() => {
    const [sx, sy, sz] = currentSunDomePos;
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(sx, sy, sz),
      new THREE.Vector3(sx, 0.05, sz),
      new THREE.Vector3(0, 0.05, 0),
    ]);
  }, [currentSunDomePos]);

  if (!showSunPath) return null;

  return (
    <group>
      {/* 1. Local Horizon Ring (Radius = DOME_RADIUS) */}
      <primitive object={new THREE.Line(horizonLineGeometry, new THREE.LineBasicMaterial({ color: '#334155', transparent: true, opacity: 0.5 }))} />

      {/* 2. Today's Sun Path Arc (Brilliant Amber/Gold) */}
      {todayCurve && (
        <mesh>
          <tubeGeometry args={[todayCurve, 64, 0.22, 8, false]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* 3. Summer Solstice Arc (Emerald / Teal) */}
      {summerCurve && (
        <mesh>
          <tubeGeometry args={[summerCurve, 64, 0.14, 8, false]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.6}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* 4. Winter Solstice Arc (Sky Blue / Cyan) */}
      {winterCurve && (
        <mesh>
          <tubeGeometry args={[winterCurve, 64, 0.14, 8, false]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.6}
            roughness={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* 5. Spring Equinox Arc (Silver Slate) */}
      {equinoxCurve && (
        <mesh>
          <tubeGeometry args={[equinoxCurve, 64, 0.11, 8, false]} />
          <meshStandardMaterial
            color="#94a3b8"
            emissive="#94a3b8"
            emissiveIntensity={0.4}
            roughness={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* 6. Hour Marker Beads on Today's Arc */}
      {todayData.hourMarkers.map((marker) => (
        <group key={`hour-${marker.timeDecimal}`} position={[marker.position.x, marker.position.y, marker.position.z]}>
          <mesh>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.7}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* 7. Current Sun Orb & Halo Indicator on the Arc */}
      {sunState.elevationDeg >= -1.0 && (
        <group position={currentSunDomePos}>
          {/* Main glowing sun bead on arc */}
          <mesh>
            <sphereGeometry args={[1.3, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fbbf24"
              emissiveIntensity={1.4}
              roughness={0.1}
            />
          </mesh>

          {/* Corona halo ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.4, 24]} />
            <meshBasicMaterial
              color="#f59e0b"
              side={THREE.DoubleSide}
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      )}

      {/* 8. Altitude Drop-Line and Ground Azimuth Projection */}
      {sunState.elevationDeg > 0 && (
        <primitive
          object={
            new THREE.Line(
              dropLineGeometry,
              new THREE.LineDashedMaterial({
                color: '#f59e0b',
                dashSize: 2,
                gapSize: 1.5,
                transparent: true,
                opacity: 0.45,
              })
            )
          }
          onUpdate={(line: THREE.Line) => line.computeLineDistances()}
        />
      )}

      {/* 9. Subdued Horizon Reference Tick Marks */}
      <group position={[0, 0.05, 0]}>
        {/* North Tick mark at [0, 0, -DOME_RADIUS] */}
        <mesh position={[0, 0, -DOME_RADIUS]}>
          <boxGeometry args={[1.2, 0.1, 3.5]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* East Tick mark at [DOME_RADIUS, 0, 0] */}
        <mesh position={[DOME_RADIUS, 0, 0]}>
          <boxGeometry args={[3.5, 0.1, 1.2]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        {/* South Tick mark at [0, 0, DOME_RADIUS] */}
        <mesh position={[0, 0, DOME_RADIUS]}>
          <boxGeometry args={[1.2, 0.1, 3.5]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        {/* West Tick mark at [-DOME_RADIUS, 0, 0] */}
        <mesh position={[-DOME_RADIUS, 0, 0]}>
          <boxGeometry args={[3.5, 0.1, 1.2]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>
    </group>
  );
}
