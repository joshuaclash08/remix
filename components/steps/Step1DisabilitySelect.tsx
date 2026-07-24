'use client';

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Accessibility, UserX } from 'lucide-react';
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full flex flex-col justify-between items-center p-6 py-8 bg-white text-slate-950 select-none"
      role="region"
      aria-label="장애 여부 선택 화면"
    >
      <div className="w-full flex-1 flex flex-col justify-between gap-6 max-w-sm">
        {/* 🟡 장애인 지원 */}
        <button
          onClick={handleDisabilityClick}
          className="w-full flex-1 min-h-[220px] rounded-[44px] bg-yellow-300 hover:bg-yellow-400 border-4 border-slate-950 text-slate-950 p-8 flex flex-col items-center justify-center text-center gap-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] active:scale-[0.98] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer focus:ring-4 focus:ring-yellow-400"
          aria-label="장애인 지원 선택"
        >
          <Accessibility className="w-24 h-24 shrink-0" />
          <span className="text-3xl sm:text-4xl font-black">장애인 지원</span>
        </button>

        {/* ⚪ 비장애인 (Inactive) */}
        <button
          onClick={handleNonDisabilityClick}
          className="w-full flex-1 min-h-[220px] rounded-[44px] bg-slate-100 border-4 border-slate-300 text-slate-400 p-8 flex flex-col items-center justify-center text-center gap-4 opacity-50 cursor-not-allowed transition-all"
          aria-label="비장애인 일반 선택 (현재 비활성화)"
          aria-disabled="true"
        >
          <UserX className="w-24 h-24 shrink-0" />
          <span className="text-3xl sm:text-4xl font-black">비장애인</span>
        </button>
      </div>
    </motion.div>
  );
}
