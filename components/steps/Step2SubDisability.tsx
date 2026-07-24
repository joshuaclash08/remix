'use client';

import React from 'react';
import { useAccessibilityStore, A11yPreset } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { MainDisabilityCategory } from './Step2DisabilityType';
import { Eye, ZoomIn, Palette, Moon, Hand, Keyboard, Touchpad, Accessibility, User, Sparkles, BookOpen, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  mainCategory: MainDisabilityCategory;
  onSelectSubComplete: () => void;
}

export function Step2SubDisability({ mainCategory, onSelectSubComplete }: Props) {
  const { 
    setPreset, setHighContrast, setFontScale, setLowReachMode,
    setDyslexiaMode, setDebounceMode, setDarkMode, setSwitchAccessMode,
    setColorBlindMode, setEasyMode
  } = useAccessibilityStore();
  const { vibrate } = useHaptics();

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
        title: '전맹',
        desc: '음성 스크린리더 모드',
        icon: <Eye className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('visual');
        },
      },
      {
        title: '저시력',
        desc: '글씨 200% 확대 및 고대비',
        icon: <ZoomIn className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('visual');
          setHighContrast(true);
          setFontScale('xlarge');
        },
      },
      {
        title: '색각 이상',
        desc: '형태/패턴 이중 기호화',
        icon: <Palette className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('visual');
          setColorBlindMode(true);
        },
      },
      {
        title: '눈부심 / 광과민',
        desc: '다크모드 강제 전환',
        icon: <Moon className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('visual');
          setDarkMode(true);
        },
      },
    ],
    mobility: [
      {
        title: '손떨림 / 수전증',
        desc: '터치 오작동 방지 (디바운스)',
        icon: <Hand className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('mobility');
          setDebounceMode(true);
        },
      },
      {
        title: '상지 마비 / 스위치 제어',
        desc: '키보드 및 스위치 포커스 모드',
        icon: <Keyboard className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('mobility');
          setSwitchAccessMode(true);
        },
      },
      {
        title: '근무력 / 정밀 조작 불가',
        desc: '거대 버튼 및 단일 탭',
        icon: <Touchpad className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('mobility');
          setFontScale('xlarge'); // Makes buttons effectively larger
        },
      },
      {
        title: '하지 지체 / 휠체어',
        desc: '화면 하단 조작부 집중',
        icon: <Accessibility className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('mobility');
          setLowReachMode(true);
        },
      },
    ],
    cognitive: [
      {
        title: '발달 / 지적 장애',
        desc: '쉬운 단어와 그림 중심',
        icon: <Sparkles className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('cognitive');
          setEasyMode(true);
        },
      },
      {
        title: '고령층 / 디지털 미숙',
        desc: '큰 글씨 및 시간제한 없음',
        icon: <User className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('cognitive');
          setFontScale('large');
          setEasyMode(true);
        },
      },
      {
        title: '난독증',
        desc: '글자/줄 간격 확장',
        icon: <BookOpen className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('cognitive');
          setDyslexiaMode(true);
        },
      },
    ],
    hearing: [
      {
        title: '농아 / 난청',
        desc: '안내를 시각/진동 팝업으로 대체',
        icon: <VolumeX className="w-12 h-12 shrink-0" />,
        configureFn: () => {
          setPreset('hearing');
          // hapticFeedback is already true by default in 'hearing' preset
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full flex flex-col justify-center items-center p-6 py-6 bg-white text-slate-950 select-none overflow-y-auto phone-scroll"
      role="region"
      aria-label="세부 장애 디테일 선택 화면"
    >
      <div className="w-full flex-1 flex flex-col justify-center gap-4 max-w-sm my-auto">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSubSelect(opt.configureFn)}
            className="w-full min-h-[140px] p-5 rounded-[32px] bg-white border-4 border-slate-950 hover:bg-yellow-300 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-yellow-400"
            aria-label={`${opt.title} 맞춤 선택`}
          >
            <div className="text-slate-950">{opt.icon}</div>
            <span className="text-2xl font-black tracking-tight">{opt.title}</span>
            <span className="text-sm font-bold text-slate-600 tracking-tight">{opt.desc}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
