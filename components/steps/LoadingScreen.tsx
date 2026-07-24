'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

interface Props {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useAccessibilityStore((state) => state.reduceMotion);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isDone) return;

    const duration = reduceMotion ? 0.2 : 1.0;

    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: '100%',
        duration: duration,
        ease: 'power1.inOut',
        onComplete: () => {
          setIsDone(true);

          if (reduceMotion) {
            onLoadingComplete();
          } else if (overlayRef.current) {
            gsap.to(overlayRef.current, {
              yPercent: -100,
              duration: 0.6,
              ease: 'power3.inOut',
              onComplete: () => {
                onLoadingComplete();
              },
            });
          }
        },
      });
    }
  }, [reduceMotion, onLoadingComplete, isDone]);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-4">
        <h2 className="text-xl font-black tracking-tight">
          프로토타입
        </h2>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-yellow-400 rounded-full w-0"
          />
        </div>
      </div>
    </div>
  );
}
