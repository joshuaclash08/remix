'use client';

import React from 'react';
import { useAccessibilityStore, A11yPreset } from '@/store/useAccessibilityStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import {
  Eye,
  Ear,
  Accessibility,
  Brain,
  RotateCcw,
  Volume2,
  VolumeX,
  Type,
  SunMoon,
  MoveDown,
  Presentation,
  QrCode,
  Mic,
} from 'lucide-react';

interface Props {
  onOpenGuide: () => void;
  onOpenQr: () => void;
  onOpenVoice: () => void;
}

export function AccessibilityBar({ onOpenGuide, onOpenQr, onOpenVoice }: Props) {
  const {
    highContrast,
    fontScale,
    lowReachMode,
    ttsEnabled,
    activePreset,
    setHighContrast,
    setFontScale,
    setLowReachMode,
    setTtsEnabled,
    setPreset,
    resetAll,
  } = useAccessibilityStore();

  const { vibrate } = useHaptics();
  const { speak } = useSpeech();

  const handlePresetSelect = (preset: A11yPreset, label: string) => {
    vibrate([40, 40]);
    setPreset(preset);
    speak(`${label} 모드가 설정되었습니다.`, true);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-100 shadow-sm transition-all">
      <div className="px-3.5 py-2.5 space-y-2">
        {/* Top Title & Main Action Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-yellow-300 text-slate-950 font-black text-sm shadow-sm">
              ♿
            </span>
            <div>
              <h1 className="font-black text-xs sm:text-sm text-slate-900 leading-none">
                배리어프리 키오스크
              </h1>
              <span className="text-[10px] font-bold text-slate-500">
                폰 & 폴더폰 전용 PWA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* QR/NFC Button */}
            <button
              onClick={() => {
                vibrate(30);
                onOpenQr();
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              title="QR/NFC 연결"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* AI Voice Assistant */}
            <button
              onClick={() => {
                vibrate(30);
                onOpenVoice();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 fill-current" />
              <span>음성주문</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={() => {
                vibrate(30);
                onOpenGuide();
              }}
              className="p-1.5 rounded-xl bg-slate-900 text-yellow-300 transition-colors cursor-pointer"
              title="시연 가이드"
            >
              <Presentation className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Accessibility Preset Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => handlePresetSelect('visual', '시각장애')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              activePreset === 'visual'
                ? 'bg-yellow-300 text-slate-950 ring-2 ring-yellow-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>시각</span>
          </button>

          <button
            onClick={() => handlePresetSelect('hearing', '청각장애')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              activePreset === 'hearing'
                ? 'bg-sky-300 text-slate-950 ring-2 ring-sky-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ear className="w-3 h-3" />
            <span>청각</span>
          </button>

          <button
            onClick={() => handlePresetSelect('mobility', '휠체어/하단')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              activePreset === 'mobility'
                ? 'bg-emerald-300 text-slate-950 ring-2 ring-emerald-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Accessibility className="w-3 h-3" />
            <span>휠체어</span>
          </button>

          <button
            onClick={() => handlePresetSelect('cognitive', '모션감소')}
            className={`px-2 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
              activePreset === 'cognitive'
                ? 'bg-purple-300 text-slate-950 ring-2 ring-purple-400'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Brain className="w-3 h-3" />
            <span>모션감소</span>
          </button>

          {/* Quick Option Toggles */}
          <button
            onClick={() => {
              vibrate(30);
              const next = !highContrast;
              setHighContrast(next);
              speak(next ? '고대비 켜짐' : '고대비 꺼짐', true);
            }}
            className={`p-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 shrink-0 transition-all cursor-pointer ${
              highContrast ? 'bg-yellow-300 text-slate-950' : 'bg-slate-100 text-slate-700'
            }`}
            title="고대비"
          >
            <SunMoon className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              vibrate(30);
              const nextScale = fontScale === 'normal' ? 'large' : fontScale === 'large' ? 'xlarge' : 'normal';
              setFontScale(nextScale);
            }}
            className={`p-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 shrink-0 transition-all cursor-pointer ${
              fontScale !== 'normal' ? 'bg-yellow-300 text-slate-950' : 'bg-slate-100 text-slate-700'
            }`}
            title="글자 크기"
          >
            <Type className="w-3 h-3" />
            <span>{fontScale === 'normal' ? '1x' : fontScale === 'large' ? '1.25x' : '1.5x'}</span>
          </button>

          <button
            onClick={() => {
              vibrate(30);
              const next = !lowReachMode;
              setLowReachMode(next);
              speak(next ? '하단배치 켜짐' : '하단배치 꺼짐', true);
            }}
            className={`p-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 shrink-0 transition-all cursor-pointer ${
              lowReachMode ? 'bg-emerald-300 text-slate-950' : 'bg-slate-100 text-slate-700'
            }`}
            title="하단배치 모드"
          >
            <MoveDown className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              vibrate(30);
              const next = !ttsEnabled;
              setTtsEnabled(next);
              speak(next ? '음성 읽기 켜짐' : '음성 읽기 꺼짐', true);
            }}
            className={`p-1 rounded-lg text-[11px] font-bold flex items-center gap-0.5 shrink-0 transition-all cursor-pointer ${
              ttsEnabled ? 'bg-sky-300 text-slate-950' : 'bg-slate-100 text-slate-700'
            }`}
            title="TTS 음성 읽기"
          >
            {ttsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          {activePreset !== 'default' && (
            <button
              onClick={() => {
                vibrate(30);
                resetAll();
                speak('기본 설정 초기화', true);
              }}
              className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="초기화"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
