'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { motion } from 'framer-motion';

export function SuccessAnimation() {
  const { lastOrderNumber, resetOrder } = useCartStore();
  const { vibrate } = useHaptics();

  useEffect(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-center p-6 bg-white select-none"
      role="status"
      aria-live="polite"
      aria-label={`주문 완료. 대기 번호 ${lastOrderNumber}번`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full flex flex-col justify-center gap-8"
      >
        <h2 className="text-4xl font-black text-slate-950 text-center">완료</h2>

        {/* Massive Order Number Card */}
        <div className="py-12 bg-yellow-300 border-4 border-slate-950 rounded-[40px] text-center shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">
          <span className="text-slate-900 font-bold block text-base">대기 번호</span>
          <span className="text-7xl font-black tracking-wider block mt-3 text-slate-950">
            {lastOrderNumber}
          </span>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            vibrate(40);
            resetOrder();
          }}
          className="w-full py-6 rounded-[36px] bg-slate-900 text-white font-black text-xl transition-all border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] cursor-pointer focus:ring-4 focus:ring-yellow-400"
          aria-label="처음 화면으로 돌아가기"
        >
          처음으로
        </button>
      </motion.div>
    </div>
  );
}
