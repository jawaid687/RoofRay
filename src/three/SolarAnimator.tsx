import { useFrame } from '@react-three/fiber';
import { useSolarStore } from '../store/useSolarStore';

/**
 * Headless R3F component that drives Play Day and Play Year animations
 * synchronized with Three.js 60 FPS requestAnimationFrame loop.
 */
export function SolarAnimator() {
  const isPlayingDay = useSolarStore((s) => s.isPlayingDay);
  const isPlayingYear = useSolarStore((s) => s.isPlayingYear);
  const tickPlayDay = useSolarStore((s) => s.tickPlayDay);
  const tickPlayYear = useSolarStore((s) => s.tickPlayYear);

  useFrame((_, delta) => {
    // Clamp frame delta to prevent jarring jumps on tab blur/focus
    const clampedDelta = Math.min(delta, 0.1);
    if (isPlayingDay) {
      tickPlayDay(clampedDelta);
    } else if (isPlayingYear) {
      tickPlayYear(clampedDelta);
    }
  });

  return null;
}
