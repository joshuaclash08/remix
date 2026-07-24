'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { useSpeech } from './useSpeech';

/**
 * Hardware Abstraction Hook: Device Motion / Gyro Sensors
 * ----------------------------------------------------
 * Phase 1 (Web): DeviceOrientationEvent / DeviceMotionEvent & Mouse Tilt Simulation
 * Phase 2 (Expo Native Migration):
 *   Import Expo Sensors module instead:
 *   `import { Accelerometer, Gyroscope } from 'expo-sensors'`
 */
export function useSensors(onTiltHelp?: () => void) {
  const [tilt, setTilt] = useState<{ gamma: number; beta: number }>({ gamma: 0, beta: 0 });
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();

  const handleDeviceMotion = useCallback(
    (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0; // Left to right tilt [-90, 90]
      const beta = event.beta || 0; // Front to back tilt [-180, 180]

      setTilt({ gamma, beta });

      // If phone is tilted steeply to the side (>45 deg) for 1 second, trigger help request demo
      if (Math.abs(gamma) > 45 && onTiltHelp) {
        vibrate([100, 100, 100]);
        speak('기기 기울임이 감지되었습니다. 직원 호출을 진행하시겠습니까?', true);
      }
    },
    [onTiltHelp, vibrate, speak]
  );

  const requestPermission = useCallback(async () => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setIsPermissionGranted(true);
          window.addEventListener('deviceorientation', handleDeviceMotion);
        }
      } catch (e) {
        console.warn('Sensor permission error', e);
      }
    } else if (typeof window !== 'undefined') {
      setIsPermissionGranted(true);
      window.addEventListener('deviceorientation', handleDeviceMotion);
    }
  }, [handleDeviceMotion]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceMotion);
      }
    };
  }, [handleDeviceMotion]);

  return {
    tilt,
    isPermissionGranted,
    requestPermission,
  };
}
