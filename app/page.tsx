'use client';

import React, { useState, useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MobileDeviceContainer } from '@/components/layout/MobileDeviceContainer';
import { FixedNavHeader } from '@/components/layout/FixedNavHeader';
import { LoadingScreen } from '@/components/steps/LoadingScreen';
import { Step1DisabilitySelect } from '@/components/steps/Step1DisabilitySelect';
import { Step2DisabilityType, MainDisabilityCategory } from '@/components/steps/Step2DisabilityType';
import { Step2SubDisability } from '@/components/steps/Step2SubDisability';
import { SimpleKiosk } from '@/components/kiosk/SimpleKiosk';

export default function KioskApp() {
  const { highContrast, fontScale, resetAll, dyslexiaMode, darkMode, colorBlindMode } = useAccessibilityStore();
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

  const showHeader = currentStep !== 'loading';
  const showBack = currentStep !== 'step1' && currentStep !== 'loading';

  return (
    <MobileDeviceContainer>
      <div className="relative w-full min-h-screen flex-1 flex flex-col overflow-hidden bg-white">
        {/* Permanent Top Navigation Header (Never overlaps content below) */}
        {showHeader && (
          <FixedNavHeader showBack={showBack} onBack={handleHeaderBack} />
        )}

        {/* Content Body Container */}
        <main className="flex-1 w-full flex flex-col overflow-hidden bg-white">
          {/* Step 0: Prototype Loading (slides up) */}
          {currentStep === 'loading' && (
            <LoadingScreen onLoadingComplete={() => setCurrentStep('step1')} />
          )}

          {/* Step 1: Disability selection */}
          {currentStep === 'step1' && (
            <Step1DisabilitySelect onSelectDisability={() => setCurrentStep('step2_main')} />
          )}

          {/* Step 2 Main: Disability Type selection */}
          {currentStep === 'step2_main' && (
            <Step2DisabilityType
              onSelectMainCategory={(cat) => {
                setSelectedMainCategory(cat);
                setCurrentStep('step2_sub');
              }}
            />
          )}

          {/* Step 2 Sub: Detailed Sub-Disability Selection */}
          {currentStep === 'step2_sub' && (
            <Step2SubDisability
              mainCategory={selectedMainCategory}
              onSelectSubComplete={() => setCurrentStep('kiosk')}
            />
          )}

          {/* Step 3: Customized super simple self-order kiosk */}
          {currentStep === 'kiosk' && (
            <SimpleKiosk onResetToStep1={() => setCurrentStep('step1')} />
          )}
        </main>
      </div>
    </MobileDeviceContainer>
  );
}
