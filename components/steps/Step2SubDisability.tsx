'use client';

import React, { useEffect } from 'react';
import { useAccessibilityStore, A11yPreset } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { MainDisabilityCategory } from './Step2DisabilityType';
import { Eye, ZoomIn, Palette, Moon, Hand, Keyboard, Touchpad, Accessibility, User, Sparkles, BookOpen, VolumeX, ChevronRight } from 'lucide-react';
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
  const { speak } = useSpeech();
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
        icon: <Eye className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('visual_blindness');
          setPreset('visual');
        },
      },
      {
        title: t('Low Vision'),
        desc: t('200% Text Zoom & High Contrast'),
        icon: <ZoomIn className="w-8 h-8 text-[#3182f6] shrink-0" />,
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
        icon: <Palette className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('visual_color_blind');
          setPreset('visual');
          setColorBlindMode(true);
        },
      },
      {
        title: t('Photophobia / Light Sensitivity'),
        desc: t('Force Dark Mode'),
        icon: <Moon className="w-8 h-8 text-[#3182f6] shrink-0" />,
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
        icon: <Hand className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_tremor');
          setPreset('mobility');
          setDebounceMode(true);
        },
      },
      {
        title: t('Upper Limb Paralysis / Switch Control'),
        desc: t('Keyboard & Switch Focus Mode'),
        icon: <Keyboard className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_switch');
          setPreset('mobility');
          setSwitchAccessMode(true);
        },
      },
      {
        title: t('Muscle Weakness / No Fine Control'),
        desc: t('Giant Buttons & Single Tab'),
        icon: <Touchpad className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('mobility_weakness');
          setPreset('mobility');
          setFontScale('xlarge');
        },
      },
      {
        title: t('Lower Limb Disability / Wheelchair'),
        desc: t('Focus Controls on Bottom of Screen'),
        icon: <Accessibility className="w-8 h-8 text-[#3182f6] shrink-0" />,
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
        icon: <Sparkles className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('cognitive_intellectual');
          setPreset('cognitive');
          setEasyMode(true);
        },
      },
      {
        title: t('Elderly / Digitally Inexperienced'),
        desc: t('Large Text & No Time Limit'),
        icon: <User className="w-8 h-8 text-[#3182f6] shrink-0" />,
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
        icon: <BookOpen className="w-8 h-8 text-[#3182f6] shrink-0" />,
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
        icon: <VolumeX className="w-8 h-8 text-[#3182f6] shrink-0" />,
        configureFn: () => {
          setProfileId('hearing');
          setPreset('hearing');
        },
      },
    ],
  };

  const options = SUB_OPTIONS[mainCategory] || [];

  // Speech announcement on mount
  useEffect(() => {
    const titles = options.map(o => o.title).join(', ');
    speak(`세부 옵션을 선택해 주세요. ${titles}`, true);
  }, []);

  const handleSubSelect = (title: string, configureFn: () => void) => {
    vibrate([60, 40, 60]);
    speak(`${title} 옵션이 적용되었습니다.`, true);
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
      className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 pt-20 pb-6 bg-slate-50 text-slate-950 select-none overflow-y-auto phone-scroll absolute inset-0"
      role="region"
      aria-label={t("Detailed Disability Selection Screen")}
    >
      <div className="w-full flex-1 max-w-md mx-auto flex flex-col justify-center gap-3.5">
        {options.map((opt, idx) => (
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
            key={idx}
            onClick={() => handleSubSelect(opt.title, opt.configureFn)}
            className="w-full flex-1 min-h-[76px] px-6 py-4 rounded-2xl bg-white border border-slate-200/90 hover:border-[#3182f6] hover:bg-blue-50/20 transition-all flex items-center justify-between cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-400/20"
            aria-label={language === 'ko' ? `${opt.title} 맞춤 선택` : `Select ${opt.title}`}
          >
            <div className="flex items-center gap-4 text-left">
              <span className="text-[#3182f6] shrink-0">{opt.icon}</span>
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">{opt.title}</span>
                <span className="text-sm font-bold text-slate-500 tracking-tight">{opt.desc}</span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 shrink-0 ml-2" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
