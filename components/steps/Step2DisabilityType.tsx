'use client';

import React, { useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { Eye, Brain, Accessibility, VolumeX, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

import type { MainDisabilityCategory } from '@/lib/types';

export type { MainDisabilityCategory };


interface Props {
  onSelectMainCategory: (category: MainDisabilityCategory) => void;
}

export function Step2DisabilityType({ onSelectMainCategory }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();

  // Automatic Speech announcement on mount
  useEffect(() => {
    speak("필요하신 장애 유형을 선택해 주세요. 시각, 고령자, 지체, 청각 장애 항목이 있습니다.", true);
  }, []);

  const DISABILITY_TYPES: {
    id: MainDisabilityCategory;
    title: string;
    icon: React.ReactNode;
    ariaLabel: string;
  }[] = [
    {
      id: 'visual',
      title: t('Visual Impairment'),
      icon: <Eye className="w-9 h-9 shrink-0 text-amber-600" />,
      ariaLabel: t('Go to details for visual impairment'),
    },
    {
      id: 'cognitive',
      title: t('Dyslexia / Elderly'),
      icon: <Brain className="w-9 h-9 shrink-0 text-blue-600" />,
      ariaLabel: t('Go to details for dyslexia and elderly support'),
    },
    {
      id: 'mobility',
      title: t('Physical Disability'),
      icon: <Accessibility className="w-9 h-9 shrink-0 text-emerald-600" />,
      ariaLabel: t('Go to details for physical disability support'),
    },
    {
      id: 'hearing',
      title: t('Hearing Impairment'),
      icon: <VolumeX className="w-9 h-9 shrink-0 text-purple-600" />,
      ariaLabel: t('Go to details for hearing impairment support'),
    },
  ];

  const handleTypeSelect = (category: MainDisabilityCategory) => {
    vibrate([60, 40, 60]);
    const item = DISABILITY_TYPES.find((d) => d.id === category);
    if (item) speak(`${item.title} 선택됨.`, true);
    onSelectMainCategory(category);
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
      className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 pt-20 pb-6 bg-slate-50 text-slate-950 select-none overflow-hidden absolute inset-0"
      role="region"
      aria-label={t("Main Accessibility Type Selection Screen")}
    >
      <div className="w-full flex-1 max-w-md mx-auto flex flex-col justify-center gap-3.5">
        {DISABILITY_TYPES.map((item) => (
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
            key={item.id}
            onClick={() => handleTypeSelect(item.id)}
            className="w-full flex-1 min-h-[76px] rounded-2xl bg-white border border-slate-200/90 hover:border-[#3182f6] hover:bg-blue-50/20 transition-all flex items-center justify-between px-6 py-4 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-400/20"
            aria-label={item.ariaLabel}
          >
            <div className="flex items-center gap-4">
              <span className="text-slate-800 shrink-0">
                {item.icon}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 text-left">
                {item.title}
              </span>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
