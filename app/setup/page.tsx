'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MobileDeviceContainer } from '@/components/layout/MobileDeviceContainer';
import { Step0LanguageSelect } from '@/components/steps/Step0LanguageSelect';
import { Step1DisabilitySelect } from '@/components/steps/Step1DisabilitySelect';
import { Step2DisabilityType, MainDisabilityCategory } from '@/components/steps/Step2DisabilityType';
import { Step2SubDisability } from '@/components/steps/Step2SubDisability';
import { CustomizationPanel } from '@/components/steps/CustomizationPanel';
import { ArrowLeft } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';

type SetupStep = 'lang' | 'step1' | 'step2_main' | 'step2_sub' | 'customization';

import { useSyncAccessibilityTheme } from '@/hooks/useSyncAccessibilityTheme';

export default function SetupPage() {
  const router = useRouter();
  const { setPreset, setProfileId, saveSettingsToCookie } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  const { t } = useTranslation();
  useReducedMotion();
  useSyncAccessibilityTheme();

  const [currentStep, setCurrentStep] = useState<SetupStep>('lang');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainDisabilityCategory>('visual');


  const handleFinishSetup = () => {
    saveSettingsToCookie();
    router.push('/');
  };

  const handleHeaderBack = () => {
    if (currentStep === 'customization') {
      if (selectedMainCategory === 'hearing') {
        setCurrentStep('step2_main');
      } else {
        setCurrentStep('step2_sub');
      }
    } else if (currentStep === 'step2_sub') {
      setCurrentStep('step2_main');
    } else if (currentStep === 'step2_main') {
      setCurrentStep('step1');
    } else if (currentStep === 'step1') {
      setCurrentStep('lang');
    }
  };

  const showBack = currentStep !== 'lang';

  return (
    <MobileDeviceContainer>
      <div className="relative w-full min-h-screen flex-1 flex flex-col overflow-hidden bg-slate-50">
        <main className="flex-1 w-full flex flex-col overflow-hidden bg-slate-50 relative">
          <AnimatePresence mode="popLayout">
            {/* Step 0: Language Select */}
            {currentStep === 'lang' && (
              <Step0LanguageSelect key="lang" onSelectLanguage={() => setCurrentStep('step1')} />
            )}

            {/* Step 1: Disability Need Select */}
            {currentStep === 'step1' && (
              <Step1DisabilitySelect key="step1" onSelectDisability={() => setCurrentStep('step2_main')} />
            )}

            {/* Step 2 Main: Disability Type Select */}
            {currentStep === 'step2_main' && (
              <Step2DisabilityType
                key="step2_main"
                onSelectMainCategory={(cat) => {
                  setSelectedMainCategory(cat);
                  if (cat === 'hearing') {
                    setProfileId('hearing');
                    setPreset('hearing');
                    setCurrentStep('customization');
                  } else {
                    setCurrentStep('step2_sub');
                  }
                }}
              />
            )}

            {/* Step 2 Sub: Detailed Sub Disability Select */}
            {currentStep === 'step2_sub' && (
              <Step2SubDisability
                key="step2_sub"
                mainCategory={selectedMainCategory}
                onSelectSubComplete={() => {
                  const currentProfileId = useAccessibilityStore.getState().profileId;
                  const noParams = ['mobility_switch', 'mobility_wheelchair'];
                  const hasParams = !noParams.includes(currentProfileId || '');
                  if (hasParams) {
                    setCurrentStep('customization');
                  } else {
                    handleFinishSetup();
                  }
                }}
              />
            )}

            {/* Step 2.5: Customization & Fine-Tuning */}
            {currentStep === 'customization' && (
              <CustomizationPanel
                key="customization"
                onComplete={handleFinishSetup}
                onBack={() => {
                  if (selectedMainCategory === 'hearing') {
                    setCurrentStep('step2_main');
                  } else {
                    setCurrentStep('step2_sub');
                  }
                }}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Top Left Floating Back Button inside Phone Bounds */}
        <AnimatePresence>
          {showBack && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute top-6 left-6 z-40"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                onClick={() => {
                  vibrate(30);
                  handleHeaderBack();
                }}
                className="w-12 h-12 rounded-full bg-slate-900 text-white border border-slate-800 shadow-md hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                aria-label={t("Go back to the previous screen")}
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileDeviceContainer>
  );
}
