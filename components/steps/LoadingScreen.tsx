'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { motion } from 'framer-motion';

interface Props {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { setLanguage, reduceMotion } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  const [selected, setSelected] = useState(false);
  const completedRef = useRef(false);

  const safeComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onLoadingComplete();
    }
  };

  const handleLanguageSelect = (lang: 'ko' | 'en') => {
    if (selected) return;
    setSelected(true);
    vibrate(40);
    setLanguage(lang);

    // Failsafe timeout: Guarantee step completion after 800ms regardless of GSAP status
    const fallbackTimer = setTimeout(() => {
      safeComplete();
    }, 800);

    const duration = reduceMotion ? 0.05 : 0.3;

    try {
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          width: '100%',
          duration: duration,
          ease: 'power1.inOut',
          onComplete: () => {
            if (reduceMotion) {
              clearTimeout(fallbackTimer);
              safeComplete();
            } else if (overlayRef.current) {
              gsap.to(overlayRef.current, {
                yPercent: -100,
                duration: 0.4,
                ease: 'power3.inOut',
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
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">
            프로토타입
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            언어를 선택해 주세요<br />Please select a language
          </p>
        </div>

        {/* Language Selection Buttons */}
        <div className="w-full flex flex-col gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            onClick={() => handleLanguageSelect('ko')}
            disabled={selected}
            className="w-full py-4 rounded-2xl bg-yellow-400 text-slate-950 font-bold text-lg hover:bg-yellow-300 transition-colors shadow-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50"
          >
            한국어
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            onClick={() => handleLanguageSelect('en')}
            disabled={selected}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-900/50 disabled:opacity-50"
          >
            English
          </motion.button>
        </div>

        {/* Minimal Progress Bar (only animates upon selection) */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-yellow-400 rounded-full w-0"
          />
        </div>
      </div>
    </div>
  );
}
