import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSolarStore } from '../store/useSolarStore';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const cameraFocusTarget = useSolarStore((s) => s.cameraFocusTarget);
  const cameraPositionTarget = useSolarStore((s) => s.cameraPositionTarget);
  const cameraResetTrigger = useSolarStore((s) => s.cameraResetTrigger);

  const isTransitioning = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(45, 45, 55));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (cameraPositionTarget && cameraFocusTarget) {
      targetCamPos.current.set(...cameraPositionTarget);
      targetLookAt.current.set(...cameraFocusTarget);
      isTransitioning.current = true;
    }
  }, [cameraPositionTarget, cameraFocusTarget, cameraResetTrigger]);

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return;

    // Smooth exponential decay interpolation (framerate independent)
    const factor = 1 - Math.exp(-6 * delta);

    camera.position.lerp(targetCamPos.current, factor);
    controlsRef.current.target.lerp(targetLookAt.current, factor);
    controlsRef.current.update();

    // Check if camera has arrived close enough to stop transition
    const posDist = camera.position.distanceTo(targetCamPos.current);
    const targetDist = controlsRef.current.target.distanceTo(targetLookAt.current);

    if (posDist < 0.2 && targetDist < 0.2) {
      isTransitioning.current = false;
    }
  });

  return null;
}
