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
        <h2 className="text-4xl font-extrabold text-slate-900 text-center">{t("Order Complete")}</h2>

        {/* Massive Order Number Card (Toss-style) */}
        <div className="py-12 bg-yellow-400 rounded-3xl text-center shadow-[0_12px_40px_rgba(250,204,21,0.25)] border border-yellow-500/20">
          <span className="text-yellow-900 font-bold block text-lg">{t("Order Number")}</span>
          <span className="text-7xl font-black tracking-wider block mt-3 text-slate-950">
            {lastOrderNumber}
          </span>
        </div>

        {/* Reset button (Toss-style) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            vibrate(40);
            resetOrder();
          }}
          className="w-full py-5 rounded-[24px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl transition-all shadow-[0_8px_24px_rgba(0,0,0,0.15)] cursor-pointer flex items-center justify-center"
          aria-label={t("Go back to the start screen")}
        >
          {t("Start Over")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
