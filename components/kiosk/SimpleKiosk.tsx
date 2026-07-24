'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { SuccessAnimation } from '@/components/kiosk/SuccessAnimation';
import { DebounceButton } from '@/components/ui/DebounceButton';

interface Props {
  onResetToStep1: () => void;
}

export function SimpleKiosk({ onResetToStep1 }: Props) {
  const { placeOrder, orderStatus } = useCartStore();
  const { vibrate } = useHaptics();

  const [selectedItem, setSelectedItem] = useState<'coffee' | 'tea' | null>(null);

  const handleSelectItem = (item: 'coffee' | 'tea') => {
    vibrate(30);
    setSelectedItem(item);
  };

  const handleOrderSubmit = () => {
    vibrate([100, 50, 100]);
    placeOrder();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 min-h-screen w-full flex flex-col justify-between items-center p-6 py-6 bg-white text-slate-950 select-none relative"
      role="region"
      aria-label="주문 선택 화면"
    >
      {/* Centered Menu & CTA elements group filling vertical space */}
      <div className="w-full flex-1 flex flex-col justify-between gap-5 max-w-sm">
        <DebounceButton
          onDebouncedClick={() => handleSelectItem('coffee')}
          className={`w-full flex-1 min-h-[140px] px-6 rounded-[36px] border-4 flex items-center justify-center gap-4 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-yellow-400 text-center ${
            selectedItem === 'coffee'
              ? 'bg-yellow-300 border-slate-950 text-slate-950 font-black'
              : 'bg-white border-slate-950 text-slate-900'
          }`}
          aria-label="아메리카노 선택"
          aria-pressed={selectedItem === 'coffee'}
        >
          <span className="text-3xl sm:text-4xl font-black">☕ 아메리카노</span>
          {selectedItem === 'coffee' && <Check className="w-10 h-10 text-slate-950 stroke-[3] shrink-0" />}
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={() => handleSelectItem('tea')}
          className={`w-full flex-1 min-h-[140px] px-6 rounded-[36px] border-4 flex items-center justify-center gap-4 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-yellow-400 text-center ${
            selectedItem === 'tea'
              ? 'bg-yellow-300 border-slate-950 text-slate-950 font-black'
              : 'bg-white border-slate-950 text-slate-900'
          }`}
          aria-label="녹차 선택"
          aria-pressed={selectedItem === 'tea'}
        >
          <span className="text-3xl sm:text-4xl font-black">🍵 녹차</span>
          {selectedItem === 'tea' && <Check className="w-10 h-10 text-slate-950 stroke-[3] shrink-0" />}
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={handleOrderSubmit}
          disabled={!selectedItem}
          className={`w-full py-8 mt-2 rounded-[36px] text-3xl font-black transition-all border-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-yellow-400 text-center ${
            selectedItem
              ? 'bg-yellow-300 border-slate-950 text-slate-950 cursor-pointer'
              : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-50 shadow-none'
          }`}
          aria-label="선택한 메뉴 주문하기"
          aria-disabled={!selectedItem}
        >
          주문하기
        </DebounceButton>
      </div>

      {/* Success Modal */}
      {orderStatus === 'completed' && <SuccessAnimation />}
    </motion.div>
  );
}
