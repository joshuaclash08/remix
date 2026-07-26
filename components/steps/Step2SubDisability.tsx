'use client';

import React from 'react';
import { useAccessibilityStore, A11yPreset } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { MainDisabilityCategory } from './Step2DisabilityType';
import { Eye, ZoomIn, Palette, Moon, Hand, Keyboard, Touchpad, Accessibility, User, Sparkles, BookOpen, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  mainCategory: MainDisabilityCategory;
  onSelectSubComplete: () => void;
}

export function Step2SubDisability({ mainCategory, onSelectSubComplete }: Props) {
  const { 
    setPreset, setHighContrast, setFontScale, setLowReachMode,
    setDyslexiaMode, setDebounceMode, setDarkMode, setSwitchAccessMode,
    setColorBlindMode, setEasyMode, setProfileId
  } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  const { t, language } = useTranslation();

  const SUB_OPTIONS: Record<
    MainDisabilityCategory,
    {
      title: string;
      desc: string;
      icon: React.ReactNode;
      configureFn: () => void;
    }[]
  > = {
    visual: [
      {
        title: t('Blindness'),
        desc: t('Voice Screen Reader Mode'),
        icon: <Eye className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('visual_blindness');
          setPreset('visual');
        },
      },
      {
        title: t('Low Vision'),
        desc: t('200% Text Zoom & High Contrast'),
        icon: <ZoomIn className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('visual_low_vision');
          setPreset('visual');
          setHighContrast(true);
          setFontScale('xlarge');
        },
      },
      {
        title: t('Color Blindness'),
        desc: t('Shape/Pattern Dual Coding'),
        icon: <Palette className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('visual_color_blind');
          setPreset('visual');
          setColorBlindMode(true);
        },
      },
      {
        title: t('Photophobia / Light Sensitivity'),
        desc: t('Force Dark Mode'),
        icon: <Moon className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('visual_photophobia');
          setPreset('visual');
          setDarkMode(true);
        },
      },
    ],
    mobility: [
      {
        title: t('Hand Tremor'),
        desc: t('Touch Misclick Prevention (Debounce)'),
        icon: <Hand className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_tremor');
          setPreset('mobility');
          setDebounceMode(true);
        },
      },
      {
        title: t('Upper Limb Paralysis / Switch Control'),
        desc: t('Keyboard & Switch Focus Mode'),
        icon: <Keyboard className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_switch');
          setPreset('mobility');
          setSwitchAccessMode(true);
        },
      },
      {
        title: t('Muscle Weakness / No Fine Control'),
        desc: t('Giant Buttons & Single Tab'),
        icon: <Touchpad className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_weakness');
          setPreset('mobility');
          setFontScale('xlarge');
        },
      },
      {
        title: t('Lower Limb Disability / Wheelchair'),
        desc: t('Focus Controls on Bottom of Screen'),
        icon: <Accessibility className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_wheelchair');
          setPreset('mobility');
          setLowReachMode(true);
        },
      },
    ],
    cognitive: [
      {
        title: t('Intellectual Disability'),
        desc: t('Simple Words & Pictures'),
        icon: <Sparkles className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('cognitive_intellectual');
          setPreset('cognitive');
          setEasyMode(true);
        },
      },
      {
        title: t('Elderly / Digitally Inexperienced'),
        desc: t('Large Text & No Time Limit'),
        icon: <User className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('cognitive_elderly');
          setPreset('cognitive');
          setFontScale('large');
          setEasyMode(true);
        },
      },
      {
        title: t('Dyslexia'),
        desc: t('Expanded Letter & Line Spacing'),
        icon: <BookOpen className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('cognitive_dyslexia');
          setPreset('cognitive');
          setDyslexiaMode(true);
        },
      },
    ],
    hearing: [
      {
        title: t('Deaf / Hard of Hearing'),
        desc: t('Replace Guidance with Visual & Vibration Popup'),
        icon: <VolumeX className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setProfileId('hearing');
          setPreset('hearing');
        },
      },
    ],
  };

  const options = SUB_OPTIONS[mainCategory] || [];

  const handleSubSelect = (configureFn: () => void) => {
    vibrate([60, 40, 60]);
    configureFn();
    onSelectSubComplete();
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
      className="flex-1 w-full h-full flex flex-col justify-between items-center p-5 pt-8 pb-28 bg-slate-50 text-slate-950 select-none overflow-y-auto phone-scroll absolute inset-0"
      role="region"
      aria-label={t("Detailed Disability Selection Screen")}
    >
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-4 max-w-md mx-auto">
        {options.map((opt, idx) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            key={idx}
            onClick={() => handleSubSelect(opt.configureFn)}
            className="w-full flex-1 px-5 rounded-[28px] bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-center justify-center text-center gap-4 cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-slate-200/50"
            aria-label={language === 'ko' ? `${opt.title} 맞춤 선택` : `Select ${opt.title}`}
          >
            <div className="text-slate-700 shrink-0">{opt.icon}</div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-2xl font-bold tracking-tight text-slate-800">{opt.title}</span>
              <span className="text-base font-semibold text-slate-500 tracking-tight mt-1">{opt.desc}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
