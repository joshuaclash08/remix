'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MobileDeviceContainer } from '@/components/layout/MobileDeviceContainer';
import { Step0LanguageSelect } from '@/components/steps/Step0LanguageSelect';
import { Step1DisabilitySelect } from '@/components/steps/Step1DisabilitySelect';
import { Step2NeedsSelect } from '@/components/steps/Step2NeedsSelect';
import { CustomizationPanel } from '@/components/steps/CustomizationPanel';
import { ArrowLeft } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import { useSyncAccessibilityTheme } from '@/hooks/useSyncAccessibilityTheme';
import { DebounceButton } from '@/components/ui/DebounceButton';

type SetupStep = 'lang' | 'step1' | 'step2_needs' | 'customization';

export default function SetupPage() {
  const router = useRouter();
  const { saveSettingsToCookie } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  const { t } = useTranslation();
  useReducedMotion();
  useSyncAccessibilityTheme();

  const [currentStep, setCurrentStep] = useState<SetupStep>('lang');
  const [needsSelectLevel, setNeedsSelectLevel] = useState<1 | 2>(1);

  const handleFinishSetup = () => {
    saveSettingsToCookie();
    router.push('/');
  };

  const handleHeaderBack = () => {
    if (currentStep === 'customization') {
      setCurrentStep('step2_needs');
    } else if (currentStep === 'step2_needs') {
      if (needsSelectLevel === 2) {
        setNeedsSelectLevel(1);
      } else {
        setCurrentStep('step1');
      }
    } else if (currentStep === 'step1') {
      setCurrentStep('lang');
    }
  };

  const showBack = currentStep !== 'lang' && !(currentStep === 'step2_needs' && needsSelectLevel === 2);

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
              <Step1DisabilitySelect key="step1" onSelectDisability={() => setCurrentStep('step2_needs')} />
            )}

            {/* Step 2: Consolidated Multi-Select Needs */}
            {currentStep === 'step2_needs' && (
              <Step2NeedsSelect
                key="step2_needs"
                viewLevel={needsSelectLevel}
                onChangeViewLevel={setNeedsSelectLevel}
                onSelectNeedsComplete={() => setCurrentStep('customization')}
              />
            )}

            {/* Step 3: Customization & Fine-Tuning */}
            {currentStep === 'customization' && (
              <CustomizationPanel
                key="customization"
                onComplete={handleFinishSetup}
                onBack={() => setCurrentStep('step2_needs')}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Top Left Floating Back Button */}
        <AnimatePresence>
          {showBack && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute top-6 left-6 z-40"
            >
              <DebounceButton
                onDebouncedClick={() => {
                  vibrate(30);
                  handleHeaderBack();
                }}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
                aria-label={t("Go back to the previous screen")}
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </DebounceButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileDeviceContainer>
  );
}
