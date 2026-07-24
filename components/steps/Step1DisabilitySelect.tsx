'use client';

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Accessibility, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onSelectDisability: () => void;
}

export function Step1DisabilitySelect({ onSelectDisability }: Props) {
  const { vibrate } = useHaptics();

  const handleDisabilityClick = () => {
    vibrate([60, 40, 60]);
    onSelectDisability();
  };

  const handleNonDisabilityClick = () => {
    vibrate(20);
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
      className="flex-1 w-full h-full flex flex-col justify-between items-center p-5 bg-slate-50 text-slate-950 select-none overflow-hidden absolute inset-0"
      role="region"
      aria-label="안내 선택 화면"
    >
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-5 max-w-md mx-auto">
        {/* 🟡 도움이 필요해요 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 600, damping: 15 }}
          onClick={handleDisabilityClick}
          className="w-full flex-1 rounded-[32px] bg-yellow-400 text-slate-900 p-8 flex flex-col items-center justify-center text-center gap-6 shadow-[0_12px_40px_rgba(250,204,21,0.25)] border border-yellow-500/20 hover:bg-yellow-300 transition-colors cursor-pointer focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50"
          aria-label="도움이 필요해요 선택 (접근성 모기 켜기)"
        >
          <Accessibility className="w-28 h-28 shrink-0 stroke-[2.5]" />
          <span className="text-3xl sm:text-4xl font-bold tracking-tight">도움이 필요해요</span>
        </motion.button>

        {/* ⚪ 괜찮아요 (Inactive) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 600, damping: 15 }}
          onClick={handleNonDisabilityClick}
          className="w-full flex-1 rounded-[32px] bg-white text-slate-400 p-8 flex flex-col items-center justify-center text-center gap-6 opacity-70 transition-colors cursor-pointer focus:outline-none hover:bg-slate-50 border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
          aria-label="괜찮아요 선택 (현재 비활성화)"
          aria-disabled="true"
        >
          <ThumbsUp className="w-28 h-28 shrink-0 stroke-[2.5]" />
          <span className="text-3xl sm:text-4xl font-bold tracking-tight">괜찮아요</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
