'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export function SuccessAnimation() {
  const { lastOrderNumber, resetOrder } = useCartStore();
  const { vibrate } = useHaptics();
  const { t } = useTranslation();

  useEffect(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  return (
    <motion.div
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      transition={{ type: 'tween', duration: 0.8, ease: 'easeOut' }}
      className="absolute inset-0 z-50 flex flex-col justify-center p-6 bg-slate-50 select-none"
      role="status"
      aria-live="polite"
      aria-label={t("Order complete. Waiting number {number}", { number: lastOrderNumber || "" })}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full flex flex-col justify-center gap-8 max-w-md mx-auto"
      >
        <h2 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">{t("Order Complete")}</h2>

        {/* Order Number Card (#3182f6 Toss-style) */}
        <div className="py-10 bg-[#3182f6] rounded-2xl text-center shadow-md shadow-blue-500/20">
          <span className="text-blue-100 font-bold block text-sm">{t("Order Number")}</span>
          <span className="text-6xl font-black tracking-wider block mt-2 text-white">
            {lastOrderNumber}
          </span>
        </div>

        {/* Reset button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            vibrate(40);
            resetOrder();
          }}
          className="w-full h-14 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-extrabold text-base sm:text-lg transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center"
          aria-label={t("Go back to the start screen")}
        >
          {t("Start Over")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
