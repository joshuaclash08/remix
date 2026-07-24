'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MobileDeviceContainer } from '@/components/layout/MobileDeviceContainer';
import { LoadingScreen } from '@/components/steps/LoadingScreen';
import { Step1DisabilitySelect } from '@/components/steps/Step1DisabilitySelect';
import { Step2DisabilityType, MainDisabilityCategory } from '@/components/steps/Step2DisabilityType';
import { Step2SubDisability } from '@/components/steps/Step2SubDisability';
import { SimpleKiosk } from '@/components/kiosk/SimpleKiosk';
import { ArrowLeft } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

export default function KioskApp() {
  const { highContrast, fontScale, resetAll, dyslexiaMode, darkMode, colorBlindMode, setPreset } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  useReducedMotion();

  // Navigation Steps: 'loading' | 'step1' | 'step2_main' | 'step2_sub' | 'kiosk'
  const [currentStep, setCurrentStep] = useState<'loading' | 'step1' | 'step2_main' | 'step2_sub' | 'kiosk'>('loading');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainDisabilityCategory>('visual');

  // Sync HTML Root Classes for High Contrast, Font Scale, Dyslexia & Dark Modes
  useEffect(() => {
    const htmlEl = document.documentElement;

    if (highContrast) {
      htmlEl.classList.add('high-contrast');
    } else {
      htmlEl.classList.remove('high-contrast');
    }

    if (darkMode) {
      htmlEl.classList.add('dark-mode');
    } else {
      htmlEl.classList.remove('dark-mode');
    }

    if (dyslexiaMode) {
      htmlEl.classList.add('dyslexia-mode');
    } else {
      htmlEl.classList.remove('dyslexia-mode');
    }
    
    if (colorBlindMode) {
      htmlEl.classList.add('color-blind-mode');
    } else {
      htmlEl.classList.remove('color-blind-mode');
    }

    htmlEl.classList.remove('font-large', 'font-xlarge');
    if (fontScale === 'large') htmlEl.classList.add('font-large');
    if (fontScale === 'xlarge') htmlEl.classList.add('font-xlarge');
  }, [highContrast, fontScale, dyslexiaMode, darkMode, colorBlindMode]);

  const handleHeaderBack = () => {
    if (currentStep === 'step2_sub') {
      setCurrentStep('step2_main');
    } else if (currentStep === 'step2_main') {
      setCurrentStep('step1');
    } else if (currentStep === 'kiosk') {
      resetAll();
      setCurrentStep('step2_main');
    }
  };

  const showBack = currentStep !== 'step1' && currentStep !== 'loading';

  return (
    <MobileDeviceContainer>
      <div className="relative w-full min-h-screen flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Content Body Container */}
        <main className="flex-1 w-full flex flex-col overflow-hidden bg-slate-50 relative">
          <AnimatePresence mode="popLayout">
            {/* Step 0: Prototype Loading (slides up) */}
            {currentStep === 'loading' && (
              <LoadingScreen key="loading" onLoadingComplete={() => setCurrentStep('step1')} />
            )}

            {/* Step 1: Disability selection */}
            {currentStep === 'step1' && (
              <Step1DisabilitySelect key="step1" onSelectDisability={() => setCurrentStep('step2_main')} />
            )}

            {/* Step 2 Main: Disability Type selection */}
            {currentStep === 'step2_main' && (
              <Step2DisabilityType
                key="step2_main"
                onSelectMainCategory={(cat) => {
                  setSelectedMainCategory(cat);
                  if (cat === 'hearing') {
                    setPreset('hearing');
                    setCurrentStep('kiosk');
                  } else {
                    setCurrentStep('step2_sub');
                  }
                }}
              />
            )}

            {/* Step 2 Sub: Detailed Sub-Disability Selection */}
            {currentStep === 'step2_sub' && (
              <Step2SubDisability
                key="step2_sub"
                mainCategory={selectedMainCategory}
                onSelectSubComplete={() => setCurrentStep('kiosk')}
              />
            )}

            {/* Step 3: Customized super simple self-order kiosk */}
            {currentStep === 'kiosk' && (
              <SimpleKiosk key="kiosk" onResetToStep1={() => setCurrentStep('step1')} />
            )}
          </AnimatePresence>
        </main>

        {/* Floating Liquid Glass Back Button at the Bottom */}
        <AnimatePresence>
          {showBack && (
            <motion.div
              initial={{ opacity: 0, y: 30, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 30, x: '-50%' }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute bottom-6 left-1/2 z-40"
            >
              <motion.button
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                onClick={() => {
                  vibrate(30);
                  handleHeaderBack();
                }}
                className="px-6 py-4 rounded-full bg-slate-900/90 text-white backdrop-blur-lg border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                aria-label="이전 화면으로 돌아가기"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
                <span className="text-lg font-bold tracking-tight">이전</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileDeviceContainer>
  );
}
