'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
  showBack: boolean;
  onBack: () => void;
}

export function FixedNavHeader({ showBack, onBack }: Props) {
  const { vibrate } = useHaptics();

  return (
    <header className="w-full h-16 shrink-0 bg-white/80 backdrop-blur-lg px-6 flex items-center justify-between z-30 select-none">
      {showBack ? (
        <button
          onClick={() => {
            vibrate(30);
            onBack();
          }}
          className="p-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-slate-200/50"
          aria-label="이전 화면으로 돌아가기"
        >
          <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
        </button>
      ) : (
        <div className="w-12 h-12" /> // Spacer when back button is hidden
      )}
    </header>
  );
}
