'use client';

import React, { useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { motion } from 'framer-motion';

interface Props {
  onSelectLanguage: () => void;
}

export function Step0LanguageSelect({ onSelectLanguage }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { setLanguage } = useAccessibilityStore();

  useEffect(() => {
    speak("언어를 선택해 주세요. Please select a language.", true);
  }, []);

  const handleSelect = (lang: 'ko' | 'en') => {
    vibrate(40);
    setLanguage(lang);
    if (lang === 'ko') {
      speak("한국어가 선택되었습니다.", true);
    } else {
      speak("English selected.", true);
    }
    onSelectLanguage();
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 bg-slate-50 text-slate-950 select-none overflow-hidden absolute inset-0"
      role="region"
      aria-label="언어 선택 Language Selection"
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-5">
        {/* 🔵 한국어 Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          onClick={() => handleSelect('ko')}
          className="w-full h-36 sm:h-40 rounded-3xl bg-[#3182f6] text-white p-7 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:bg-[#2b70d4] transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400/40"
          aria-label="한국어"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight">한국어</span>
        </motion.button>

        {/* ⚪ English Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          onClick={() => handleSelect('en')}
          className="w-full h-36 sm:h-40 rounded-3xl bg-white text-slate-800 p-7 flex items-center justify-center border border-slate-200/90 shadow-sm hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-900/20"
          aria-label="English"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">English</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
