'use client';

import React, { useState, useEffect } from 'react';
import { useAccessibilityStore, AccessibilityNeed } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Volume2, Palette, Moon, Hand, Keyboard, 
  Touchpad, Accessibility, Sparkles, BookOpen, VolumeX, Clock, Check, ChevronRight
} from 'lucide-react';

interface Props {
  viewLevel: 1 | 2;
  onChangeViewLevel: (level: 1 | 2) => void;
  onSelectNeedsComplete: () => void;
}

type MainCategory = 'visual' | 'mobility' | 'cognitive' | 'hearing';

interface NeedOption {
  id: AccessibilityNeed;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  icon: React.ReactNode;
}

interface CategoryData {
  id: MainCategory;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  icon: React.ReactNode;
  needs: AccessibilityNeed[];
}

export function Step2NeedsSelect({ viewLevel, onChangeViewLevel, onSelectNeedsComplete }: Props) {
  const { setSelectedNeeds } = useAccessibilityStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { language } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedNeeds, setSelectedNeedsState] = useState<AccessibilityNeed[]>([]);

  // List of all needs configurations
  const NEED_DEFINITIONS: Record<AccessibilityNeed, NeedOption> = {
    lowVision: {
      id: 'lowVision',
      titleKo: '글씨가 잘 안 보여요',
      titleEn: 'Text is hard to read',
      descKo: '고대비 및 텍스트 200% 확대',
      descEn: 'High contrast & 200% text zoom',
      icon: <Eye className="w-5 h-5 stroke-[2.2]" />,
    },
    blindness: {
      id: 'blindness',
      titleKo: '소리로 안내를 듣고 싶어요',
      titleEn: 'I want voice guidance',
      descKo: '음성 스크린 리더 화면 가이드',
      descEn: 'Full audio screen reader',
      icon: <Volume2 className="w-5 h-5 stroke-[2.2]" />,
    },
    colorBlind: {
      id: 'colorBlind',
      titleKo: '색상 구분이 어려워요',
      titleEn: 'Color blind / Weakness',
      descKo: '도형 및 텍스트 강조 이중 인지',
      descEn: 'Patterns & labels dual coding',
      icon: <Palette className="w-5 h-5 stroke-[2.2]" />,
    },
    photophobia: {
      id: 'photophobia',
      titleKo: '눈부심이 심하고 쉽게 피로해요',
      titleEn: 'Light sensitivity',
      descKo: '눈부심 방지용 저자극 다크테마',
      descEn: 'Forced dark mode',
      icon: <Moon className="w-5 h-5 stroke-[2.2]" />,
    },
    tremor: {
      id: 'tremor',
      titleKo: '손이 떨려 터치가 힘들어요',
      titleEn: 'Hand tremors',
      descKo: '터치 오작동 필터링 (디바운싱)',
      descEn: 'Ignore accidental quick taps',
      icon: <Hand className="w-5 h-5 stroke-[2.2]" />,
    },
    switchControl: {
      id: 'switchControl',
      titleKo: '보조 스위치/키보드를 사용해요',
      titleEn: 'Switch access',
      descKo: '키보드/단일 스위치 자동 탐색',
      descEn: 'Assistive switch key navigation',
      icon: <Keyboard className="w-5 h-5 stroke-[2.2]" />,
    },
    noFineControl: {
      id: 'noFineControl',
      titleKo: '크고 쉬운 터치 버튼이 편해요',
      titleEn: 'Giant touch target buttons',
      descKo: '클릭 영역 및 크기 대폭 확대',
      descEn: 'Enlarged hitboxes & giant buttons',
      icon: <Touchpad className="w-5 h-5 stroke-[2.2]" />,
    },
    wheelchair: {
      id: 'wheelchair',
      titleKo: '낮게 조작하고 싶어요 (휠체어)',
      titleEn: 'Low reach (Wheelchair)',
      descKo: '모든 중요 버튼과 카탈로그 하단 배치',
      descEn: 'Place controls at screen bottom',
      icon: <Accessibility className="w-5 h-5 stroke-[2.2]" />,
    },
    cognitiveSimple: {
      id: 'cognitiveSimple',
      titleKo: '그림과 쉬운 설명이 필요해요',
      titleEn: 'Cognitive / Simple UI',
      descKo: '단순화된 화면 및 쉬운 낱말 설명',
      descEn: 'Simplified layout & pictograms',
      icon: <Sparkles className="w-5 h-5 stroke-[2.2]" />,
    },
    elderly: {
      id: 'elderly',
      titleKo: '천천히 여유 있는 주문과 큰 글자',
      titleEn: 'Senior / Digital beginner',
      descKo: '제한 시간 연장 및 명확한 글자 안내',
      descEn: 'Auto timeout extension & guide',
      icon: <Clock className="w-5 h-5 stroke-[2.2]" />,
    },
    dyslexia: {
      id: 'dyslexia',
      titleKo: '자간/행간 간격이 넓어야 해요',
      titleEn: 'Dyslexia readability',
      descKo: '가독성을 높여주는 자간/행간 확대',
      descEn: 'Wider letters & line-spacing',
      icon: <BookOpen className="w-5 h-5 stroke-[2.2]" />,
    },
    hardOfHearing: {
      id: 'hardOfHearing',
      titleKo: '화면 깜빡임과 진동이 편해요',
      titleEn: 'Deaf / Visual alert',
      descKo: '소리 안내 대신 햅틱 및 시각화 지원',
      descEn: 'Visual flash & strong haptic vibration',
      icon: <VolumeX className="w-5 h-5 stroke-[2.2]" />,
    },
  };

  // Categories definitions mapping sub-needs
  const CATEGORIES: CategoryData[] = [
    {
      id: 'visual',
      titleKo: '시각 장애',
      titleEn: 'Visual Impairment',
      descKo: '글씨 크기 확대, 스크린 리더 음성 안내가 필요할 때',
      descEn: 'Text zoom, high contrast, screen reader voice guide',
      icon: <Eye className="w-6 h-6 stroke-[2.2]" />,
      needs: ['lowVision', 'blindness', 'colorBlind', 'photophobia'],
    },
    {
      id: 'mobility',
      titleKo: '지체/신체 장애',
      titleEn: 'Physical Disability',
      descKo: '터치 오작동 필터, 하단 조작 영역 배치, 보조 스위치가 필요할 때',
      descEn: 'Touch debounce, low reach layouts, switch control',
      icon: <Accessibility className="w-6 h-6 stroke-[2.2]" />,
      needs: ['tremor', 'switchControl', 'noFineControl', 'wheelchair'],
    },
    {
      id: 'cognitive',
      titleKo: '발달/인지/고령자 장애',
      titleEn: 'Cognitive / Elderly',
      descKo: '쉬운 모드, 픽토그램 가이드, 난독증 글자 간격, 음성 병행 안내가 필요할 때',
      descEn: 'Dyslexia spacing, easy mode, senior timeouts, audio backups',
      icon: <Sparkles className="w-6 h-6 stroke-[2.2]" />,
      needs: ['cognitiveSimple', 'elderly', 'dyslexia', 'blindness', 'lowVision'],
    },
    {
      id: 'hearing',
      titleKo: '청각 장애',
      titleEn: 'Hearing Impairment',
      descKo: '소리 안내를 대체하는 시각 번쩍임과 진동 알림이 필요할 때',
      descEn: 'Visual captions, haptic vibrations, sound alternatives',
      icon: <VolumeX className="w-6 h-6 stroke-[2.2]" />,
      needs: ['hardOfHearing'],
    },
  ];

  useEffect(() => {
    if (viewLevel === 1) {
      const announcement = language === 'ko'
        ? '도움이 필요한 장애 영역을 선택해 주세요. 시각, 지체 신체, 발달 인지 고령자, 청각 장애 영역이 있습니다.'
        : 'Select an accessibility category. Visual, Physical, Cognitive and Elderly, or Hearing support sections are available.';
      speak(announcement, true);
    }
  }, [viewLevel, language]);

  const handleCategoryClick = (cat: CategoryData) => {
    vibrate(30);
    setSelectedCategory(cat.id);
    onChangeViewLevel(2);
    const catName = language === 'ko' ? cat.titleKo : cat.titleEn;
    speak(language === 'ko' ? `${catName} 세부 설정을 진행합니다.` : `Opening ${catName} settings.`, true);
  };

  const handleToggleNeed = (needId: AccessibilityNeed, title: string) => {
    vibrate(30);
    const updated = selectedNeeds.includes(needId)
      ? selectedNeeds.filter(id => id !== needId)
      : [...selectedNeeds, needId];
    
    setSelectedNeedsState(updated);
    
    const statusText = selectedNeeds.includes(needId)
      ? (language === 'ko' ? `${title} 선택 해제됨` : `${title} deselected`)
      : (language === 'ko' ? `${title} 선택됨` : `${title} selected`);
    speak(statusText, true);
  };

  const handleNext = () => {
    vibrate([60, 40, 60]);
    setSelectedNeeds(selectedNeeds);
    onSelectNeedsComplete();
  };

  const activeCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const activeCategoryTitle = activeCategoryData 
    ? (language === 'ko' ? activeCategoryData.titleKo : activeCategoryData.titleEn) 
    : '';

  const isStretchOptions = true; // Always stretch options to fill vertical space

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className={`flex-1 w-full h-full flex flex-col justify-start items-center p-6 bg-slate-50 text-slate-950 select-none overflow-hidden absolute inset-0 ${
      viewLevel === 2 ? 'pt-8' : 'pt-20'
    }`}>
      <div className="w-full max-w-md mx-auto flex flex-col h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewLevel === 1 ? (
            /* ================= LEVEL 1: CATEGORY SELECTION LIST ================= */
            <motion.div
              key="categories-view"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="text-center mb-6 shrink-0">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {language === 'ko' ? '도움이 필요한 부분을 모두 선택해 주세요' : 'How can we assist you?'}
                </h1>
              </div>

              {/* Category Grid (Stretched to fill remaining space) */}
              <div className="flex-1 flex flex-col justify-stretch gap-3 pb-24 pr-1">
                {CATEGORIES.map((cat) => {
                  const title = language === 'ko' ? cat.titleKo : cat.titleEn;
                  const desc = language === 'ko' ? cat.descKo : cat.descEn;
                  const selectedInCat = cat.needs.filter(n => selectedNeeds.includes(n)).length;

                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className="flex-1 w-full text-left p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#3182f6]/50 transition-all flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400/10 shadow-xs relative"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3182f6] flex items-center justify-center shrink-0">
                          {cat.icon}
                        </div>
                        <div className="flex flex-col text-left gap-1 pr-4">
                          <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {title}
                            {selectedInCat > 0 && (
                              <span className="text-[10px] bg-[#3182f6] text-white px-2 py-0.5 rounded-full font-black">
                                {selectedInCat} 선택됨
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-bold text-slate-400 leading-normal line-clamp-2">
                            {desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Floating Bottom button */}
              <div className="absolute bottom-6 left-0 right-0 z-30 pt-6 pb-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={selectedNeeds.length === 0}
                  className="w-full h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-black text-lg shadow-lg disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer flex items-center justify-center"
                >
                  {language === 'ko' ? '설정 계속하기' : 'Continue Setup'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ================= LEVEL 2: DETAILED SUB-NEEDS CHECKLIST ================= */
            <motion.div
              key="needs-view"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between h-full"
            >
              {/* Category Sub-Header (Cleaned header structure) */}
              <div className="mb-6 text-center shrink-0">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {activeCategoryTitle}
                </h1>
              </div>

              {/* Sub-needs List (Conditionally stretched if 3 or 4 options) */}
              <div className={`flex-1 pr-1 pb-24 ${isStretchOptions ? 'flex flex-col justify-stretch gap-2' : 'overflow-y-auto space-y-2 phone-scroll'}`}>
                {activeCategoryData?.needs.map((needId) => {
                  const opt = NEED_DEFINITIONS[needId];
                  if (!opt) return null;

                  const isSelected = selectedNeeds.includes(needId);
                  const title = language === 'ko' ? opt.titleKo : opt.titleEn;
                  const desc = language === 'ko' ? opt.descKo : opt.descEn;

                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                      key={needId}
                      onClick={() => handleToggleNeed(needId, title)}
                      className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400/20 ${
                        isStretchOptions ? 'flex-1' : ''
                      } ${
                        isSelected
                          ? 'bg-blue-50/50 border-[#3182f6] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                      aria-checked={isSelected}
                      role="checkbox"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#3182f6] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {opt.icon}
                        </div>
                        <div className="flex flex-col text-left gap-0.5 pr-2">
                          <span className="text-base font-black text-slate-900 tracking-tight leading-tight">
                            {title}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {desc}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isSelected ? 'bg-[#3182f6] border-[#3182f6] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Confirm / Go back to Categories button */}
              <div className="absolute bottom-6 left-0 right-0 z-30 pt-6 pb-2 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent flex gap-3">
                <button
                  onClick={() => {
                    vibrate(30);
                    onChangeViewLevel(1);
                  }}
                  className="w-full h-14 rounded-2xl bg-[#3182f6] text-white font-black text-lg shadow-lg cursor-pointer flex items-center justify-center border-none"
                >
                  {language === 'ko' ? '확인' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
