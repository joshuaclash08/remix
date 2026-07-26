'use client';

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { Eye, Brain, Accessibility, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export type MainDisabilityCategory = 'visual' | 'cognitive' | 'mobility' | 'hearing';

interface Props {
  onSelectMainCategory: (category: MainDisabilityCategory) => void;
}

export function Step2DisabilityType({ onSelectMainCategory }: Props) {
  const { vibrate } = useHaptics();
  const { t } = useTranslation();

  // User-requested order: 시각 장애 ➔ 난독증 / 고령자 ➔ 지체 장애 ➔ 청각 장애
  const DISABILITY_TYPES: {
    id: MainDisabilityCategory;
    title: string;
    icon: React.ReactNode;
    ariaLabel: string;
  }[] = [
    {
      id: 'visual',
      title: t('Visual Impairment'),
      icon: <Eye className="w-14 h-14 shrink-0" />,
      ariaLabel: t('Go to details for visual impairment'),
    },
    {
      id: 'cognitive',
      title: t('Dyslexia / Elderly'),
      icon: <Brain className="w-14 h-14 shrink-0" />,
      ariaLabel: t('Go to details for dyslexia and elderly support'),
    },
    {
      id: 'mobility',
      title: t('Physical Disability'),
      icon: <Accessibility className="w-14 h-14 shrink-0" />,
      ariaLabel: t('Go to details for physical disability support'),
    },
    {
      id: 'hearing',
      title: t('Hearing Impairment'),
      icon: <VolumeX className="w-14 h-14 shrink-0" />,
      ariaLabel: t('Go to details for hearing impairment support'),
    },
  ];

  const handleTypeSelect = (category: MainDisabilityCategory) => {
    vibrate([60, 40, 60]);
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
      className="flex-1 w-full h-full flex flex-col justify-between items-center p-5 pt-8 pb-28 bg-slate-50 text-slate-950 select-none overflow-hidden absolute inset-0"
      role="region"
      aria-label={t("Main Accessibility Type Selection Screen")}
    >
      {/* 4 buttons expanding (flex-1) to fill vertical height completely */}
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-4 max-w-md mx-auto">
        {DISABILITY_TYPES.map((item) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            key={item.id}
            onClick={() => handleTypeSelect(item.id)}
            className="w-full flex-1 rounded-[28px] bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center justify-center gap-4 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-slate-200/50 text-center px-4"
            aria-label={item.ariaLabel}
          >
            <div className="text-slate-700">
              {item.icon}
            </div>
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {item.title}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
