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
    easyMode,
    fontScale,
    reduceMotion,
    setHighContrast,
    setDarkMode,
    setColorBlindMode,
    setDyslexiaMode,
    setTtsEnabled,
    setEasyMode,
    setFontScale,
    setFontMultiplier,
    setReduceMotion,
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
                  <SlidersHorizontal className="w-4 h-4 text-[#3182f6]" />
                </div>
                <h3 className="text-sm font-black text-slate-900">{t("Setting")}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center min-h-[36px] min-w-[36px]"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Setting toggles list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 mb-4">
              {/* 1. 쉬운 주문 모드 (Easy Mode) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#3182f6]/10 border border-[#3182f6]/30">
                <div>
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>쉬운 주문 모드</span>
                    <span className="text-[10px] bg-[#3182f6] text-white px-1.5 py-0.2 rounded font-bold">추천</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">큰 사진, 쉬운 단어 설명, 화면당 4~6개 항목</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(30);
                    setEasyMode(!easyMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer transition-colors ${
                    easyMode ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {easyMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 2. 글자 크기 & 자간 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">글자 크기 및 자간</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">화면의 텍스트 크기와 간격 맞춤 설정</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-xl">
                  {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => {
                        vibrate(20);
                        setFontScale(scale);
                        setFontMultiplier(scale === 'normal' ? 1.0 : scale === 'large' ? 1.25 : 1.5);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border-none ${
                        fontScale === scale ? 'bg-[#3182f6] text-white' : 'text-slate-700 bg-transparent'
                      }`}
                    >
                      {scale === 'normal' ? '보통' : scale === 'large' ? '크게' : '매우크게'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 고대비 테마 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">고대비 테마</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">명암비를 최고 수준으로 상향</span>
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

              {/* 4. 애니메이션 끄기 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">애니메이션 끄기</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">화면 흔들림 및 시각적 움직임 최소화</span>
                </div>
                <button
                  onClick={() => {
                    vibrate(20);
                    setReduceMotion(!reduceMotion);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    reduceMotion ? 'bg-[#3182f6] text-white border-none' : 'bg-slate-200 text-slate-700 border-none'
                  }`}
                >
                  {reduceMotion ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* 5. 오디오 낭독 기본값 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs font-bold text-slate-900">오디오 낭독 기본값</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">쉬운말 설명을 자동으로 낭독</span>
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
