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

  const [step, setStep] = useState<'config' | 'complete'>('config');

  // Trigger saving sequence directly to complete screen immediately
  const handleSave = () => {
    vibrate([100, 50, 100]);
    saveSettingsToCookie();
    setStep('complete');
  };

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
      className="absolute inset-0 bg-slate-50 text-slate-950 flex flex-col justify-center items-center p-6 pt-20 pb-6 select-none z-50 overflow-y-auto phone-scroll"
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
            className="flex-1 w-full flex flex-col justify-center items-center max-w-sm mx-auto h-full gap-6"
          >
            {/* Top Area: Header "설정" */}
            <div className="flex flex-col items-center text-center mt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {t("Settings")}
              </h1>
            </div>

            {/* Middle Area: Fine-Tuning Controls */}
            <div className="w-full bg-transparent flex flex-col gap-5 justify-center min-h-[200px]">
              
              {/* Adjuster A: Low Vision (Font Size) */}
              {(profileId?.includes('visual') || profileId?.includes('cognitive') || profileId === 'mobility_weakness' || activePreset === 'visual') && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">{t("Font Size Scale")}</span>
                  <div className="flex items-center gap-6 mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseFont}
                      disabled={fontMultiplier <= 1.0}
                      className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-xs"
                    >
                      <Minus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 min-w-[100px] text-center tracking-tight">
                      {Math.round(fontMultiplier * 100)}%
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseFont}
                      disabled={fontMultiplier >= 2.0}
                      className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-xs"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster B: Tremor (Touch Debounce duration) */}
              {(profileId?.includes('tremor') || activePreset === 'mobility') && (
                <div className="flex flex-col items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">{t("Touch Recognition Delay (Debounce)")}</span>
                  <div className="flex items-center gap-6 mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseDebounce}
                      disabled={debounceDuration <= 200}
                      className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-xs"
                    >
                      <Minus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 min-w-[100px] text-center tracking-tight">
                      {debounceDuration}ms
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseDebounce}
                      disabled={debounceDuration >= 1000}
                      className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center focus:outline-none cursor-pointer shadow-xs"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster C: Dyslexia typography toggle */}
              {profileId === 'cognitive_dyslexia' && (
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-lg font-extrabold text-slate-900 tracking-tight">{t("Dyslexia-specific Typography Mode")}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      vibrate(20);
                      setDyslexiaMode(!dyslexiaMode);
                    }}
                    className={`h-12 px-6 rounded-xl font-extrabold text-base transition-all border cursor-pointer ${
                      dyslexiaMode
                        ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {dyslexiaMode ? t('Active') : t('Inactive')}
                  </motion.button>
                </div>
              )}

              {/* Adjuster D: Hearing haptic pulse toggle */}
              {profileId === 'hearing' && (
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-lg font-extrabold text-slate-900 tracking-tight">{t("Visual/Vibration Haptic Feedback")}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      vibrate(20);
                      setHapticFeedback(!hapticFeedback);
                    }}
                    className={`h-12 px-6 rounded-xl font-extrabold text-base transition-all border cursor-pointer ${
                      hapticFeedback
                        ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {hapticFeedback ? t('Active') : t('Inactive')}
                  </motion.button>
                </div>
              )}

              {/* Fallback description when no parameters to fine-tune */}
              {!profileId?.includes('visual') && !profileId?.includes('cognitive') && !profileId?.includes('tremor') && profileId !== 'hearing' && profileId !== 'mobility_weakness' && (
                <p className="text-center text-slate-600 font-bold py-4 px-2 text-base leading-relaxed">
                  {t("This category does not require fine-tuning. The automatic operation profile has been successfully loaded.")}
                </p>
              )}
            </div>

            {/* Bottom Area: [이전] [다음] Side-by-Side Action Bar */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                  onClick={handlePrev}
                  className="flex-1 h-14 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-lg font-extrabold tracking-tight transition-all flex items-center justify-center cursor-pointer active:scale-[0.98]"
                  aria-label={t("Go back to the previous screen")}
                >
                  {t("Back")}
                </motion.button>
 
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                  onClick={handleSave}
                  className="flex-1 h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white text-lg font-extrabold tracking-tight transition-all flex items-center justify-center cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.98]"
                  aria-label={t("Save settings and proceed to complete screen")}
                >
                  {t("Next")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          /* ==================== 2. COMPLETE VIEW ==================== */
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col justify-center items-center text-center max-w-sm mx-auto h-full gap-8"
          >
            {/* ✅ Save Complete State with Animated Checkmark */}
            <motion.div
              key="inline-complete"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
                className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 shadow-md shadow-blue-500/10"
              >
                <Check className="w-10 h-10 text-[#3182f6] stroke-[3]" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900"
              >
                {t("Save Complete")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-lg font-bold text-slate-600 leading-relaxed max-w-[320px] mt-4"
              >
                {t("You can change settings easily at any time, so do not worry.")}
              </motion.p>
            </motion.div>

            {/* Bottom Area: Next Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col gap-4 w-full mt-2"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                onClick={handleNext}
                className="w-full h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white text-lg font-extrabold tracking-tight transition-all shadow-md shadow-blue-500/20 flex items-center justify-center cursor-pointer active:scale-[0.98]"
                aria-label={t("Proceed to Kiosk screen")}
              >
                {t("Next")}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
