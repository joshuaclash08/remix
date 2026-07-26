'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { Check, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { SuccessAnimation } from '@/components/kiosk/SuccessAnimation';
import { DebounceButton } from '@/components/ui/DebounceButton';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onResetToStep1: () => void;
}

export function SimpleKiosk({ onResetToStep1 }: Props) {
  const { placeOrder, orderStatus } = useCartStore();
  const { vibrate } = useHaptics();
  const { fontMultiplier, debounceMode, debounceDuration, dyslexiaMode, darkMode, colorBlindMode } = useAccessibilityStore();
  const { t } = useTranslation();

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
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className="flex-1 w-full h-full flex flex-col justify-between items-center p-5 pt-8 pb-28 bg-slate-50 text-slate-950 select-none relative overflow-hidden absolute inset-0"
      role="region"
      aria-label={t("Order Selection Screen")}
    >
      {/* Centered Menu & CTA elements group filling vertical space */}
      <div className="w-full h-full flex-1 flex flex-col justify-between gap-5 max-w-md mx-auto">
        {/* Active Settings Summary Bar */}
        <div className="w-full bg-white border border-slate-200/50 rounded-2xl p-3 flex flex-wrap items-center justify-between text-xs font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" />
            {t("Active Accessibility Settings")}
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
             {fontMultiplier > 1 && <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg border border-yellow-200/30">{t("Font Size Ratio", { percent: Math.round(fontMultiplier * 100) })}</span>}
             {debounceMode && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/30">{t("Touch Debounce Delay", { duration: debounceDuration })}</span>}
             {dyslexiaMode && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200/30">{t("Dyslexia Font")}</span>}
             {darkMode && <span className="bg-slate-800 text-slate-100 px-2 py-0.5 rounded-lg border border-slate-700">{t("Dark Theme")}</span>}
             {colorBlindMode && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200/30">{t("Color Blind Support")}</span>}
             {fontMultiplier <= 1 && !debounceMode && !dyslexiaMode && !darkMode && !colorBlindMode && <span className="text-slate-400">{t("Default Settings")}</span>}
          </div>
        </div>

        <DebounceButton
          onDebouncedClick={() => handleSelectItem('coffee')}
          className={`w-full flex-1 rounded-[32px] border flex flex-col sm:flex-row items-center justify-center gap-4 transition-all cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50 text-center ${
            selectedItem === 'coffee'
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
          }`}
          aria-label={t("Select Americano")}
          aria-pressed={selectedItem === 'coffee'}
        >
          <span className={`text-3xl sm:text-4xl font-bold ${selectedItem === 'coffee' ? 'text-yellow-700' : 'text-slate-800'}`}>{t("☕ Americano")}</span>
          {selectedItem === 'coffee' && <Check className="w-10 h-10 text-yellow-600 stroke-[3] shrink-0" />}
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={() => handleSelectItem('tea')}
          className={`w-full flex-1 rounded-[32px] border flex flex-col sm:flex-row items-center justify-center gap-4 transition-all cursor-pointer shadow-[0_12px_40px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-[4px] focus:ring-yellow-500/50 text-center ${
            selectedItem === 'tea'
              ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-400/20'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
          }`}
          aria-label={t("Select Green Tea")}
          aria-pressed={selectedItem === 'tea'}
        >
          <span className={`text-3xl sm:text-4xl font-bold ${selectedItem === 'tea' ? 'text-yellow-700' : 'text-slate-800'}`}>{t("🍵 Green Tea")}</span>
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
          aria-label={t("Order selected items")}
          aria-disabled={!selectedItem}
        >
          {t("Place Order")}
        </DebounceButton>
      </div>

      {/* Success Modal */}
      {orderStatus === 'completed' && <SuccessAnimation />}
    </motion.div>
  );
}
