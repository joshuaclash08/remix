'use client';

import React, { useState } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export function CustomizationPanel({ onComplete, onBack }: Props) {
  const { vibrate } = useHaptics();
  const { t, language } = useTranslation();
  const {
    selectedNeeds,
    fontMultiplier,
    setFontMultiplier,
    debounceDuration,
    setDebounceDuration,
    dyslexiaTypography,
    setDyslexiaTypography,
    dyslexiaLetterSpacing,
    setDyslexiaLetterSpacing,
    dyslexiaLineHeight,
    setDyslexiaLineHeight,
    hapticFeedback,
    setHapticFeedback,
    switchScanInterval,
    setSwitchScanInterval,
    visualCaptionMode,
    setVisualCaptionMode,
    timeoutExtensionEnabled,
    setTimeoutExtensionEnabled,
    saveSettingsToCookie,
  } = useAccessibilityStore();

  // Capture initial settings on mount to revert on Back
  const [initialSettings] = useState({
    fontMultiplier,
    debounceDuration,
    dyslexiaTypography,
    dyslexiaLetterSpacing,
    dyslexiaLineHeight,
    hapticFeedback,
    switchScanInterval,
    visualCaptionMode,
    timeoutExtensionEnabled,
  });

  const [step, setStep] = useState<'config' | 'complete'>('config');

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
    setDyslexiaTypography(initialSettings.dyslexiaTypography);
    setDyslexiaLetterSpacing(initialSettings.dyslexiaLetterSpacing);
    setDyslexiaLineHeight(initialSettings.dyslexiaLineHeight);
    setHapticFeedback(initialSettings.hapticFeedback);
    setSwitchScanInterval(initialSettings.switchScanInterval);
    setVisualCaptionMode(initialSettings.visualCaptionMode);
    setTimeoutExtensionEnabled(initialSettings.timeoutExtensionEnabled);
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

  const increaseLetterSpacing = () => {
    vibrate(20);
    setDyslexiaLetterSpacing(Math.min(0.08, Number((dyslexiaLetterSpacing + 0.01).toFixed(2))));
  };
  const decreaseLetterSpacing = () => {
    vibrate(20);
    setDyslexiaLetterSpacing(Math.max(0.0, Number((dyslexiaLetterSpacing - 0.01).toFixed(2))));
  };

  const increaseLineHeight = () => {
    vibrate(20);
    setDyslexiaLineHeight(Math.min(2.2, Number((dyslexiaLineHeight + 0.1).toFixed(1))));
  };
  const decreaseLineHeight = () => {
    vibrate(20);
    setDyslexiaLineHeight(Math.max(1.2, Number((dyslexiaLineHeight - 0.1).toFixed(1))));
  };

  const increaseSwitchScan = () => {
    vibrate(20);
    setSwitchScanInterval(Math.min(10000, switchScanInterval + 500));
  };
  const decreaseSwitchScan = () => {
    vibrate(20);
    setSwitchScanInterval(Math.max(500, switchScanInterval - 500));
  };

  // Determine which controls to render
  const showFontScale = selectedNeeds.some(n => ['lowVision', 'blindness', 'noFineControl', 'elderly'].includes(n));
  const showDebounce = selectedNeeds.includes('tremor');
  const showDyslexia = selectedNeeds.includes('dyslexia');
  const showSwitchScan = selectedNeeds.includes('switchControl');
  const showHaptics = selectedNeeds.includes('hardOfHearing');
  const showPacing = selectedNeeds.includes('elderly');

  const hasAnyAdjustable = showFontScale || showDebounce || showDyslexia || showSwitchScan || showHaptics || showPacing;

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
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col justify-between max-w-sm mx-auto h-full gap-6 pb-2"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {language === 'ko' ? '상세 조절 및 설정' : 'Fine-Tune Settings'}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {language === 'ko' ? '필요에 맞춰 정밀하게 세팅해 보세요.' : 'Fine-tune settings to match your needs.'}
              </p>
            </div>

            {/* Adjuster List */}
            <div className="w-full flex-1 flex flex-col gap-4 justify-start py-2 overflow-y-auto phone-scroll pr-1">
              
              {/* Adjuster 1: Font Size (Low Vision, Blindness, Muscle Weakness, Elderly) */}
              {showFontScale && (
                <div className="flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    {language === 'ko' ? '글자 크기 비율' : 'Font Size Scale'}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseFont}
                      disabled={fontMultiplier <= 1.0}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-2xl font-black text-slate-900 min-w-[80px] text-center tracking-tight">
                      {Math.round(fontMultiplier * 100)}%
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseFont}
                      disabled={fontMultiplier >= 2.0}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster 2: Touch Debounce Duration (Tremor) */}
              {showDebounce && (
                <div className="flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    {language === 'ko' ? '터치 인식 딜레이 (오클릭 방지)' : 'Touch Recognition Delay'}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseDebounce}
                      disabled={debounceDuration <= 200}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-2xl font-black text-slate-900 min-w-[80px] text-center tracking-tight">
                      {debounceDuration}ms
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseDebounce}
                      disabled={debounceDuration >= 1000}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster 3: Dyslexia Typography Spacing (Dyslexia) */}
              {showDyslexia && (
                <div className="flex flex-col gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {language === 'ko' ? '난독증 가독성 간격 모드' : 'Dyslexia Typography Mode'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        vibrate(20);
                        setDyslexiaTypography(!dyslexiaTypography);
                      }}
                      className={`h-9 px-4 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                        dyslexiaTypography
                          ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {dyslexiaTypography ? (language === 'ko' ? '활성' : 'Active') : (language === 'ko' ? '비활성' : 'Inactive')}
                    </motion.button>
                  </div>

                  {dyslexiaTypography && (
                    <div className="space-y-3 pt-1">
                      {/* Letter Spacing Stepper */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          {language === 'ko' ? '자간(글자 간격)' : 'Letter Spacing'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={decreaseLetterSpacing}
                            disabled={dyslexiaLetterSpacing <= 0.0}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center border-none cursor-pointer text-slate-800 font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-slate-950 min-w-[50px] text-center">
                            {dyslexiaLetterSpacing.toFixed(2)}em
                          </span>
                          <button
                            onClick={increaseLetterSpacing}
                            disabled={dyslexiaLetterSpacing >= 0.08}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center border-none cursor-pointer text-slate-800 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line Height Stepper */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">
                          {language === 'ko' ? '행간(줄바꿈 간격)' : 'Line Height'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={decreaseLineHeight}
                            disabled={dyslexiaLineHeight <= 1.2}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center border-none cursor-pointer text-slate-800 font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-slate-950 min-w-[50px] text-center">
                            {dyslexiaLineHeight.toFixed(1)}x
                          </span>
                          <button
                            onClick={increaseLineHeight}
                            disabled={dyslexiaLineHeight >= 2.2}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center border-none cursor-pointer text-slate-800 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Adjuster 4: Switch Scanning Interval (Switch Control) */}
              {showSwitchScan && (
                <div className="flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    {language === 'ko' ? '스위치 스캔 주기 설정' : 'Switch Scanning Interval'}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decreaseSwitchScan}
                      disabled={switchScanInterval <= 500}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                    <span className="text-2xl font-black text-slate-900 min-w-[80px] text-center tracking-tight">
                      {(switchScanInterval / 1000).toFixed(1)}s
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={increaseSwitchScan}
                      disabled={switchScanInterval >= 10000}
                      className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 disabled:opacity-30 text-slate-800 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster 5: Deaf / Haptic & Captions Settings (Hearing) */}
              {showHaptics && (
                <div className="flex flex-col gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-base font-black text-slate-900 tracking-tight border-b border-slate-100 pb-2">
                    {language === 'ko' ? '청각 보조 설정' : 'Hearing Assistance'}
                  </span>
                  
                  {/* Haptic Toggle */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold text-slate-500">
                      {language === 'ko' ? '화면 반짝임 및 햅틱 진동 피드백' : 'Flash & Haptic Feedback'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        vibrate(20);
                        setHapticFeedback(!hapticFeedback);
                      }}
                      className={`h-9 px-4 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                        hapticFeedback
                          ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {hapticFeedback ? (language === 'ko' ? 'ON' : 'ON') : (language === 'ko' ? 'OFF' : 'OFF')}
                    </motion.button>
                  </div>

                  {/* Caption Banner Toggle */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold text-slate-500">
                      {language === 'ko' ? '무음 동작 시각 텍스트 배너 자막' : 'Visual Caption Banners'}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        vibrate(20);
                        setVisualCaptionMode(!visualCaptionMode);
                      }}
                      className={`h-9 px-4 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                        visualCaptionMode
                          ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {visualCaptionMode ? (language === 'ko' ? 'ON' : 'ON') : (language === 'ko' ? 'OFF' : 'OFF')}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Adjuster 6: Senior Time limits (Pacing) */}
              {showPacing && (
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col text-left">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {language === 'ko' ? '주문 시간 제한 연장' : 'Session Pacing Timeout'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {language === 'ko' ? '결제 시 충분한 여유 시간을 보장합니다.' : 'Gives extra time for checkout.'}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      vibrate(20);
                      setTimeoutExtensionEnabled(!timeoutExtensionEnabled);
                    }}
                    className={`h-9 px-4 rounded-xl font-black text-xs transition-all border cursor-pointer ${
                      timeoutExtensionEnabled
                        ? 'bg-[#3182f6] border-[#3182f6] text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {timeoutExtensionEnabled ? (language === 'ko' ? 'ON' : 'ON') : (language === 'ko' ? 'OFF' : 'OFF')}
                  </motion.button>
                </div>
              )}

              {/* Fallback description when no parameters to fine-tune */}
              {!hasAnyAdjustable && (
                <p className="text-center text-slate-600 font-bold py-8 px-2 text-sm leading-relaxed">
                  {language === 'ko' 
                    ? '선택하신 기능들은 자동으로 화면 배치를 최적화 완료하였습니다. 다음 단계로 넘어가셔도 좋습니다.' 
                    : 'Your selected needs automatically optimized the layout. You can proceed to next.'}
                </p>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="flex gap-3 w-full shrink-0 pt-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePrev}
                className="flex-1 h-14 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-lg font-black tracking-tight transition-all flex items-center justify-center cursor-pointer"
                aria-label={t("Back")}
              >
                {t("Back")}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="flex-1 h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white text-lg font-black tracking-tight transition-all flex items-center justify-center cursor-pointer shadow-md shadow-blue-500/20"
                aria-label={t("Next")}
              >
                {t("Next")}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="flex-1 w-full flex flex-col justify-center items-center text-center max-w-sm mx-auto h-full gap-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
              className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-md"
            >
              <Check className="w-10 h-10 text-[#3182f6] stroke-[3]" />
            </motion.div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {language === 'ko' ? '설정 완료' : 'Save Complete'}
              </h1>
              <p className="text-base font-bold text-slate-500 leading-relaxed max-w-[280px]">
                {language === 'ko' 
                  ? '언제든지 화면 내 퀵 셋업 버튼을 통해 조절이 가능합니다.' 
                  : 'You can easily adjust settings from the kiosk menu at any time.'}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white text-lg font-black tracking-tight transition-all shadow-md flex items-center justify-center cursor-pointer"
            >
              {language === 'ko' ? '키오스크로 이동' : 'Go to Kiosk'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
