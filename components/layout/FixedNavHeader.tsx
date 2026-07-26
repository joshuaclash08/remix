'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { DebounceButton } from '@/components/ui/DebounceButton';

interface Props {
  showBack: boolean;
  onBack: () => void;
}

export function FixedNavHeader({ showBack, onBack }: Props) {
  const { vibrate } = useHaptics();

  return (
    <header className="w-full h-16 shrink-0 bg-white/80 backdrop-blur-lg px-6 flex items-center justify-between z-30 select-none">
      {showBack ? (
        <DebounceButton
          onDebouncedClick={() => {
            vibrate(30);
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="이전 화면으로 돌아가기"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </DebounceButton>
      ) : (
        <div className="w-12 h-12" /> // Spacer when back button is hidden
      )}
    </header>
  );
}
