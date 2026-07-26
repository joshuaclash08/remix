'use client';

import React, { useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { Accessibility, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onSelectDisability: () => void;
}

export function Step1DisabilitySelect({ onSelectDisability }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();

  // Automatic Speech announcement on mount for blind / low vision users
  useEffect(() => {
    speak("도움이 필요하시면 화면 상단의 도움이 필요해요 버튼을 눌러주세요.", true);
  }, []);

  const handleDisabilityClick = () => {
    vibrate([60, 40, 60]);
    speak("맞춤 접근성 모드를 시작합니다.", true);
    onSelectDisability();
  };

  const handleNonDisabilityClick = () => {
    vibrate(20);
    speak("일반 화면입니다.");
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
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
      aria-label={t("Guidance Selection Screen")}
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-5">
        {/* 🔵 도움이 필요해요 (Primary #3182f6 Toss Blue) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          onClick={handleDisabilityClick}
          className="w-full h-36 sm:h-40 rounded-3xl bg-[#3182f6] text-white p-7 flex items-center justify-between shadow-lg shadow-blue-500/25 hover:bg-[#2b70d4] transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400/40"
          aria-label={t("Select I need help (Turn on accessibility mode)")}
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight">{t("I need help")}</span>
          <Accessibility className="w-12 h-12 sm:w-14 sm:h-14 text-white shrink-0" />
        </motion.button>

        {/* ⚪ 괜찮아요 (Inactive / Standard) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          onClick={handleNonDisabilityClick}
          className="w-full h-36 sm:h-40 rounded-3xl bg-white text-slate-700 p-7 flex items-center justify-between border border-slate-200/90 shadow-sm hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
          aria-label={t("Select I'm fine (Currently disabled)")}
          aria-disabled="true"
        >
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800">{t("I'm fine")}</span>
          <ThumbsUp className="w-12 h-12 sm:w-14 sm:h-14 text-slate-300 shrink-0" />
        </motion.button>
      </div>
    </motion.div>
  );
}
