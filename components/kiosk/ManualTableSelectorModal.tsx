'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTable: (tableNum: string) => void;
}

export function ManualTableSelectorModal({ isOpen, onClose, onConfirmTable }: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden border-t border-slate-100 flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-label={t("Select Table Number")}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900">{t("Select Table Number")}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {t("Select your seated table number")}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-2">
              {['01', '02', '03', '04', '05', '06'].map((num) => (
                <button
                  key={num}
                  onClick={() => onConfirmTable(num)}
                  className="py-3 rounded-xl border border-slate-200 font-extrabold text-sm hover:border-[#3182f6] hover:bg-blue-50 text-slate-800 transition-all cursor-pointer"
                  aria-label={t("Table {num}", { num })}
                >
                  {t("Table {num}", { num })}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

