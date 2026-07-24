'use client';

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Eye, Brain, Accessibility, Ear } from 'lucide-react';
import { motion } from 'framer-motion';

export type MainDisabilityCategory = 'visual' | 'cognitive' | 'mobility' | 'hearing';

interface Props {
  onSelectMainCategory: (category: MainDisabilityCategory) => void;
}

export function Step2DisabilityType({ onSelectMainCategory }: Props) {
  const { vibrate } = useHaptics();

  // User-requested order: 시각 장애 ➔ 난독증 / 고령자 ➔ 지체 장애 ➔ 청각 장애
  const DISABILITY_TYPES: {
    id: MainDisabilityCategory;
    title: string;
    icon: React.ReactNode;
    ariaLabel: string;
  }[] = [
    {
      id: 'visual',
      title: '시각 장애',
      icon: <Eye className="w-14 h-14 shrink-0" />,
      ariaLabel: '시각 장애 지원 세부 선택으로 이동',
    },
    {
      id: 'cognitive',
      title: '난독증 / 고령자',
      icon: <Brain className="w-14 h-14 shrink-0" />,
      ariaLabel: '난독증 및 고령자 지원 세부 선택으로 이동',
    },
    {
      id: 'mobility',
      title: '지체 장애',
      icon: <Accessibility className="w-14 h-14 shrink-0" />,
      ariaLabel: '지체 장애 지원 세부 선택으로 이동',
    },
    {
      id: 'hearing',
      title: '청각 장애',
      icon: <Ear className="w-14 h-14 shrink-0" />,
      ariaLabel: '청각 장애 지원 세부 선택으로 이동',
    },
  ];

  const handleTypeSelect = (category: MainDisabilityCategory) => {
    vibrate([60, 40, 60]);
    onSelectMainCategory(category);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full flex flex-col justify-between items-center p-6 py-6 bg-white text-slate-950 select-none"
      role="region"
      aria-label="메인 장애 유형 선택 화면"
    >
      {/* 4 buttons expanding (flex-1) to fill vertical height completely */}
      <div className="w-full flex-1 flex flex-col justify-between gap-4 max-w-sm">
        {DISABILITY_TYPES.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTypeSelect(item.id)}
            className="w-full flex-1 min-h-[110px] px-6 rounded-3xl bg-white border-4 border-slate-950 hover:bg-yellow-300 transition-all flex items-center justify-center gap-5 cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-yellow-400 text-center"
            aria-label={item.ariaLabel}
          >
            <div className="text-slate-950">
              {item.icon}
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
