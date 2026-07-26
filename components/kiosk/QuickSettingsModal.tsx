'use client';

import React from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onResetToStep1: () => void;
}

export function QuickSettingsModal({ isOpen, onClose, onResetToStep1 }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();
  const {
    highContrast,
    darkMode,
    colorBlindMode,
    dyslexiaMode,
    ttsEnabled,
    setHighContrast,
    setDarkMode,
    setColorBlindMode,
    setDyslexiaMode,
    setTtsEnabled,
    resetAll,
  } = useAccessibilityStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden border-t border-slate-100 flex flex-col max-h-[88vh]"
            role="dialog"
            aria-modal="true"
            aria-label={t("Setting")}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#3182f6]" />
                <h3 className="text-sm font-black text-slate-900">{t("Setting")}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Setting toggles list */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 mb-4">
              {/* 1. 고대비 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t("High Contrast Mode")}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t("Maximize visual contrast")}</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setHighContrast(!highContrast);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    highContrast ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {highContrast ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 2. 다크모드 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t("Dark Mode")}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t("Prevent screen glare")}</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setDarkMode(!darkMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    darkMode ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {darkMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 3. 색각지원 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t("Color Blind Assist")}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t("Assist users with color vision deficiency")}</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setColorBlindMode(!colorBlindMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    colorBlindMode ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {colorBlindMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 4. 난독증 보완 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t("Dyslexia Font Mode")}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t("Increase letter and line spacing")}</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setDyslexiaMode(!dyslexiaMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    dyslexiaMode ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {dyslexiaMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 5. 음성 안내 TTS */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">{t("Voice Screen Reader")}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t("Read out menu selections")}</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setTtsEnabled(!ttsEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    ttsEnabled ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {ttsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  vibrate([50, 50]);
                  resetAll();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer border border-slate-200 text-center"
              >
                {t("Reset to Default")}
              </button>

              <button
                onClick={() => {
                  vibrate([60, 40, 60]);
                  onClose();
                  onResetToStep1();
                }}
                className="w-full py-3 rounded-xl bg-[#3182f6] text-white hover:bg-[#2b70d4] text-xs font-extrabold cursor-pointer text-center border-none"
              >
                {t("Rerun Accessibility Wizard")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
