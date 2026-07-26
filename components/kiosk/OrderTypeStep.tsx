'use client';

import React, { useState } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Store as StoreIcon, MapPin, ChevronRight, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { DebounceButton } from '@/components/ui/DebounceButton';
import { ManualTableSelectorModal } from '@/components/kiosk/ManualTableSelectorModal';
import type { Store } from '@/lib/types';

interface Props {
  activeStore: Store;
  tableId: string | null;
  onBackToStoreSelect: () => void;
  onOrderTypeChosen: (type: 'takeout' | 'table', confirmedTableId?: string) => void;
}

export function OrderTypeStep({
  activeStore,
  tableId,
  onBackToStoreSelect,
  onOrderTypeChosen,
}: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { highContrast, reduceMotion, dyslexiaMode } = useAccessibilityStore();
  const { t } = useTranslation();
  const [isManualTableSelectorOpen, setIsManualTableSelectorOpen] = useState(false);

  const handleSelectType = (type: 'takeout' | 'table') => {
    vibrate([40, 40]);
    if (type === 'table' && !tableId) {
      setIsManualTableSelectorOpen(true);
      return;
    }
    onOrderTypeChosen(type, tableId || undefined);
  };

  const handleTableConfirm = (num: string) => {
    vibrate([40, 40]);
    setIsManualTableSelectorOpen(false);
    onOrderTypeChosen('table', num);
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      key="order_type_select"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={`flex-1 w-full h-full flex flex-col justify-between p-5 pt-6 pb-6 overflow-y-auto relative ${
        dyslexiaMode ? 'font-dyslexia' : ''
      }`}
      role="region"
      aria-label={t("Eating Option Selection Screen")}
    >
      <button
        onClick={onBackToStoreSelect}
        className="absolute top-6 left-6 z-30 w-12 h-12 rounded-full bg-slate-900 text-white border border-slate-800 shadow-md flex items-center justify-center cursor-pointer active:scale-95 transition-all focus:ring-4 focus:ring-slate-500/30"
        aria-label={t("Go back to the previous screen")}
      >
        <ArrowLeft className="w-5 h-5 stroke-[2.5] text-white" />
      </button>

      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center pt-12">
        <div className="mb-6 text-center">
          <button
            onClick={onBackToStoreSelect}
            className={`inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full font-black hover:bg-slate-200 cursor-pointer shadow-xs active:scale-95 transition-all ${
              highContrast ? 'border-2 border-slate-900 text-black' : ''
            }`}
            aria-label={`${t(activeStore.name)}, ${t("Change")}`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{t(activeStore.name)} ({t("Change")})</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-3">
            {t("Select Order Method")}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* 1. 테이블 주문 */}
          <DebounceButton
            onDebouncedClick={() => handleSelectType('table')}
            className={`w-full flex min-h-[76px] rounded-2xl bg-white hover:border-[#3182f6] hover:bg-blue-50/20 transition-all items-center justify-between px-6 py-4 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-400/20 ${
              highContrast ? 'border-2 border-slate-900 text-black' : 'border border-slate-200'
            }`}
            aria-label={tableId ? t("Table {num} Order", { num: tableId }) : t("Enter Table Number Order")}
          >
            <div className="flex items-center gap-4">
              <StoreIcon className="w-8 h-8 text-[#3182f6] shrink-0" />
              <span className="text-base font-black tracking-tight text-slate-900 text-left">
                {tableId ? t("Table {num} Order", { num: tableId }) : t("Enter Table Number Order")}
              </span>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 shrink-0" />
          </DebounceButton>

          {/* 2. 포장 주문 */}
          <DebounceButton
            onDebouncedClick={() => handleSelectType('takeout')}
            className={`w-full flex min-h-[76px] rounded-2xl bg-white hover:border-[#3182f6] hover:bg-blue-50/20 transition-all items-center justify-between px-6 py-4 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-400/20 ${
              highContrast ? 'border-2 border-slate-900 text-black' : 'border border-slate-200'
            }`}
            aria-label={t("Takeout Order")}
          >
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-rose-600 shrink-0" />
              <span className="text-base font-black tracking-tight text-slate-900 text-left">
                {t("Takeout Order")}
              </span>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 shrink-0" />
          </DebounceButton>

          {/* 3. 배달 주문 */}
          <div
            className="w-full flex min-h-[76px] rounded-2xl bg-slate-100/60 border border-slate-200 flex items-center justify-between px-6 py-4 opacity-60 cursor-not-allowed"
            role="button"
            aria-disabled="true"
            aria-label={t("Delivery Order (Coming Soon)")}
          >
            <div className="flex items-center gap-4">
              <Truck className="w-8 h-8 text-slate-400 shrink-0" />
              <span className="text-base font-black tracking-tight text-slate-400 text-left">
                {t("Delivery Order (Coming Soon)")}
              </span>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-300 shrink-0" />
          </div>
        </div>
      </div>

      <ManualTableSelectorModal
        isOpen={isManualTableSelectorOpen}
        onClose={() => setIsManualTableSelectorOpen(false)}
        onConfirmTable={handleTableConfirm}
      />
    </motion.div>
  );
}
