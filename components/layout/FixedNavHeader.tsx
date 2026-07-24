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
    <header className="w-full h-20 shrink-0 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {showBack ? (
        <button
          onClick={() => {
            vibrate(30);
            onBack();
          }}
          className="p-3.5 rounded-full bg-white hover:bg-yellow-300 text-slate-950 border-4 border-slate-950 cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all flex items-center justify-center"
          aria-label="이전 화면으로 돌아가기"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
        </button>
      ) : (
        <div className="w-12 h-12" /> // Spacer when back button is hidden
      )}
    </header>
  );
}
