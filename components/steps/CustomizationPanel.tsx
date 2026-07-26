'use client';

import React, { useState, useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Info, Check, Settings2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export function CustomizationPanel({ onComplete, onBack }: Props) {
  const { vibrate } = useHaptics();
  const { t } = useTranslation();
  const {
    profileId,
    fontMultiplier,
    setFontMultiplier,
    debounceDuration,
    setDebounceDuration,
    dyslexiaMode,
    setDyslexiaMode,
    hapticFeedback,
    setHapticFeedback,
    activePreset,
    saveSettingsToCookie,
  } = useAccessibilityStore();

  // Capture initial settings on mount
  const [initialSettings] = useState({
    fontMultiplier,
    debounceDuration,
    dyslexiaMode,
    hapticFeedback,
  });

  const [step, setStep] = useState<'config' | 'saving' | 'complete'>('config');

  // Trigger saving sequence
  const handleSave = () => {
    vibrate(40);
    // Write cookie containing all properties
    saveSettingsToCookie();
    setStep('saving');
  };

  // Timer for saving step
  useEffect(() => {
    if (step !== 'saving') return;
    const timer = setTimeout(() => {
      setStep('complete');
      vibrate([100, 50, 100]); // double haptic pulse on success
    }, 1800);
    return () => clearTimeout(timer);
  }, [step]);

  // Dots animation helper for saving screen
  const [dots, setDots] = useState('');
  useEffect(() => {
    if (step !== 'saving') return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, [step]);

  const handleNext = () => {
    vibrate(40);
    onComplete();
  };

  const handlePrev = () => {
    vibrate(30);
    // Revert settings to initial values
    setFontMultiplier(initialSettings.fontMultiplier);
    setDebounceDuration(initialSettings.debounceDuration);
    setDyslexiaMode(initialSettings.dyslexiaMode);
    setHapticFeedback(initialSettings.hapticFeedback);
    onBack();
  };

  // Adjusters
  const increaseFont = () => {
    vibrate(20);
    setFontMultiplier(Math.min(2.0, Number((fontMultiplier + 0.1).toFixed(1))));
  };
  const decreaseFont = () => {
    vibrate(20);
    setFontMultiplier(Math.max(1.0, Number((fontMultiplier - 0.1).toFixed(1))));
  };

  const increaseDebounce = () => {
    vibrate(20);
    setDebounceDuration(Math.min(1000, debounceDuration + 100));
  };
  const decreaseDebounce = () => {
    vibrate(20);
    setDebounceDuration(Math.max(200, debounceDuration - 100));
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="absolute inset-0 bg-slate-50 text-slate-950 flex flex-col justify-center items-center p-5 pt-8 pb-28 select-none z-50 overflow-y-auto phone-scroll"
    >
      <AnimatePresence mode="wait">
        {step === 'config' && (
          /* ==================== 1. CONFIGURATION VIEW ==================== */
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col justify-center items-center max-w-md mx-auto h-full gap-6"
          >
            {/* Top Area: Header "설정" */}
            <div className="flex flex-col items-center text-center mt-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                {t("Settings")}
              </h1>
            </div>

            {/* Middle Area: Fine-Tuning Controls (No border/outline) */}
            <div className="w-full bg-transparent flex flex-col gap-8 justify-center min-h-[220px]">
              
              {/* Adjuster A: Low Vision (Font Size) */}
              {(profileId?.includes('visual') || profileId?.includes('cognitive') || profileId === 'mobility_weakness' || activePreset === 'visual') && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-bold text-slate-800">{t("Font Size Scale")}</span>
                  <div className="flex items-center gap-6 mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseFont}
                      disabled={fontMultiplier <= 1.0}
                      className="p-3 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    >
                      <Minus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-3xl font-black text-slate-900 min-w-[100px] text-center">
                      {Math.round(fontMultiplier * 100)}%
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseFont}
                      disabled={fontMultiplier >= 2.0}
                      className="p-3 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster B: Tremor (Touch Debounce duration) */}
              {(profileId?.includes('tremor') || activePreset === 'mobility') && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-bold text-slate-800">{t("Touch Recognition Delay (Debounce)")}</span>
                  <div className="flex items-center gap-6 mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseDebounce}
                      disabled={debounceDuration <= 200}
                      className="p-3 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    >
                      <Minus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-3xl font-black text-slate-900 min-w-[100px] text-center">
                      {debounceDuration}ms
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseDebounce}
                      disabled={debounceDuration >= 1000}
                      className="p-3 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster C: Dyslexia typography toggle */}
              {profileId === 'cognitive_dyslexia' && (
                <div className="flex justify-between items-center py-2 px-1">
                  <span className="text-xl font-bold text-slate-800">{t("Dyslexia-specific Typography Mode")}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      vibrate(20);
                      setDyslexiaMode(!dyslexiaMode);
                    }}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all border border-slate-200 cursor-pointer ${
                      dyslexiaMode
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-700 font-extrabold'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    {dyslexiaMode ? t('Active') : t('Inactive')}
                  </motion.button>
                </div>
              )}

              {/* Adjuster D: Hearing haptic pulse toggle */}
              {profileId === 'hearing' && (
                <div className="flex justify-between items-center py-2 px-1">
                  <span className="text-xl font-bold text-slate-800">{t("Visual/Vibration Haptic Feedback")}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      vibrate(20);
                      setHapticFeedback(!hapticFeedback);
                    }}
                    className={`px-6 py-3 rounded-2xl font-bold transition-all border border-slate-200 cursor-pointer ${
                      hapticFeedback
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-700 font-extrabold'
                        : 'bg-white text-slate-500'
                    }`}
                  >
                    {hapticFeedback ? t('Active') : t('Inactive')}
                  </motion.button>
                </div>
              )}

              {/* Fallback description when no parameters to fine-tune */}
              {!profileId?.includes('visual') && !profileId?.includes('cognitive') && !profileId?.includes('tremor') && profileId !== 'hearing' && profileId !== 'mobility_weakness' && (
                <p className="text-center text-slate-500 font-medium py-4 px-2">
                  {t("This category does not require fine-tuning. The automatic operation profile has been successfully loaded.")}
                </p>
              )}
            </div>

            {/* Bottom Area: [이전] [다음] Side-by-Side Action Bar */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  onClick={handlePrev}
                  className="flex-1 py-5 rounded-[24px] bg-slate-200 hover:bg-slate-300 text-slate-800 text-xl font-bold transition-all flex items-center justify-center cursor-pointer"
                  aria-label={t("Go back to the previous screen")}
                >
                  {t("Back")}
                </motion.button>
 
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                  onClick={handleSave}
                  className="flex-1 py-5 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold transition-all flex items-center justify-center cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                  aria-label={t("Save settings and proceed to complete screen")}
                >
                  {t("Next")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'saving' && (
          /* ==================== 2. SAVING VIEW ==================== */
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {t("Saving")}{dots}
            </h1>
          </motion.div>
        )}

        {step === 'complete' && (
          /* ==================== 3. COMPLETE VIEW (Perfect vertical center) ==================== */
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col justify-center items-center text-center max-w-md mx-auto h-full gap-8"
          >
            {/* Top Area: Checked green icon & "저장 완료" */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-600 stroke-[3]" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                {t("Save Complete")}
              </h1>
              {/* Softened friendly warning caption (forced 2 lines) */}
              <p className="text-lg font-bold text-slate-500 leading-relaxed max-w-[320px] mt-4 whitespace-pre-line">
                {t("You can change settings easily at any time, so do not worry.")}
              </p>
            </div>
 
            {/* Bottom Area: Next Button */}
            <div className="flex flex-col gap-5 w-full mt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                onClick={handleNext}
                className="w-full py-5 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold transition-all shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer"
                aria-label={t("Proceed to Kiosk screen")}
              >
                {t("Next")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
