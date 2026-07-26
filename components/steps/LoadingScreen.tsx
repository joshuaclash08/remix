'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { motion } from 'framer-motion';

interface Props {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { reduceMotion, language } = useAccessibilityStore();
  const completedRef = useRef(false);

  const safeComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onLoadingComplete();
    }
  };

  useEffect(() => {
    // Faster loading duration (~0.8s)
    const loadingDuration = reduceMotion ? 0.15 : 0.8;

    // Failsafe timeout
    const fallbackTimer = setTimeout(() => {
      safeComplete();
    }, (loadingDuration + 0.6) * 1000);

    const timer = setTimeout(() => {
      try {
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            width: '100%',
            duration: loadingDuration,
            ease: 'power2.out',
            onComplete: () => {
              if (overlayRef.current) {
                // Blur fade out overlay transition
                gsap.to(overlayRef.current, {
                  opacity: 0,
                  filter: 'blur(16px)',
                  scale: 0.98,
                  duration: 0.35,
                  ease: 'power2.inOut',
                  onComplete: () => {
                    clearTimeout(fallbackTimer);
                    safeComplete();
                  },
                });
              } else {
                clearTimeout(fallbackTimer);
                safeComplete();
              }
            },
          });
        } else {
          clearTimeout(fallbackTimer);
          safeComplete();
        }
      } catch (e) {
        console.error('GSAP LoadingScreen animation error:', e);
        clearTimeout(fallbackTimer);
        safeComplete();
      }
    }, 60);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [reduceMotion]);

  const isEn = language === 'en';

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none transition-all duration-300"
    >
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="w-full flex flex-col items-center space-y-6"
        >
          <div className="space-y-1.5 px-2">
            <p className="text-slate-800 font-bold text-base sm:text-lg leading-snug">
              {isEn
                ? 'Currently undergoing internal testing and development.'
                : '현재 내부 테스트 및 개발 중인 프로토타입입니다.'}
            </p>
            <p className="text-slate-400 text-xs font-medium">
              {isEn ? 'Internal Test / Prototype' : '내부 테스트 / 개발 중인 프로토타입'}
            </p>
          </div>

          {/* Minimal Progress Loading Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              ref={progressRef}
              className="h-full bg-[#3182f6] rounded-full w-0 transition-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
