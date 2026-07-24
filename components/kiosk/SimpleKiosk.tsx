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
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex-1 w-full h-full flex flex-col justify-between items-center p-5 pt-20 pb-6 bg-slate-50 text-slate-950 select-none relative overflow-hidden absolute inset-0"
      role="region"
      aria-label="주문 선택 화면"
    >
      {/* Centered Menu & CTA elements group filling vertical space */}
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-5 max-w-md mx-auto">
        <DebounceButton
          onDebouncedClick={() => handleSelectItem('coffee')}
          className={`w-full flex-1 rounded-[32px] border flex flex-col sm:flex-row items-center justify-center gap-4 transition-all cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50 text-center ${
            selectedItem === 'coffee'
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
          }`}
          aria-label="아메리카노 선택"
          aria-pressed={selectedItem === 'coffee'}
        >
          <span className={`text-3xl sm:text-4xl font-bold ${selectedItem === 'coffee' ? 'text-yellow-700' : 'text-slate-800'}`}>☕ 아메리카노</span>
          {selectedItem === 'coffee' && <Check className="w-10 h-10 text-yellow-600 stroke-[3] shrink-0" />}
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={() => handleSelectItem('tea')}
          className={`w-full flex-1 rounded-[32px] border flex flex-col sm:flex-row items-center justify-center gap-4 transition-all cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50 text-center ${
            selectedItem === 'tea'
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
          }`}
          aria-label="녹차 선택"
          aria-pressed={selectedItem === 'tea'}
        >
          <span className={`text-3xl sm:text-4xl font-bold ${selectedItem === 'tea' ? 'text-yellow-700' : 'text-slate-800'}`}>🍵 녹차</span>
          {selectedItem === 'tea' && <Check className="w-10 h-10 text-yellow-600 stroke-[3] shrink-0" />}
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={handleOrderSubmit}
          disabled={!selectedItem}
          className={`w-full py-6 mt-2 rounded-[32px] text-3xl font-bold transition-all shadow-[0_12px_40px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50 text-center ${
            selectedItem
              ? 'bg-yellow-400 text-slate-900 cursor-pointer hover:bg-yellow-300 border-none'
              : 'bg-white text-slate-300 cursor-not-allowed opacity-50 shadow-none border border-slate-200/80'
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
