'use client';

import React, { useState } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { BellRing, X, Droplets, Sparkles, HelpCircle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string | null;
}

export function StaffCallModal({ isOpen, onClose, tableId }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();

  const [calledReason, setCalledReason] = useState<string | null>(null);

  const callOptions = [
    { id: 'general', label: '직원 즉시 호출', icon: BellRing, color: 'bg-rose-500 text-white' },
    { id: 'water', label: '물 / 휴지 요청', icon: Droplets, color: 'bg-blue-500 text-white' },
    { id: 'clean', label: '테이블 정돈', icon: Sparkles, color: 'bg-amber-500 text-white' },
    { id: 'other', label: '기타 문의', icon: HelpCircle, color: 'bg-slate-700 text-white' },
  ];

  const handleCallStaff = (reason: string) => {
    vibrate([60, 40, 60, 40]);
    setCalledReason(reason);
    speak(`${reason}로 직원을 호출했습니다. 잠시만 기다려 주세요.`, true);

    setTimeout(() => {
      setCalledReason(null);
      onClose();
    }, 2000);
  };

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
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden border-t border-slate-100 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="직원 호출"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold border border-rose-100">
                  <BellRing className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">직원 호출 서비스</h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {tableId ? `테이블 ${tableId}번` : '매장 서비스'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center min-h-[36px] min-w-[36px]"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Confirmation Alert Banner if called */}
            {calledReason ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="my-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-emerald-900">호출이 완료되었습니다!</h4>
                <p className="text-xs font-bold text-emerald-700">
                  [{calledReason}] 직원이 곧 방문할 예정입니다.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {callOptions.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleCallStaff(opt.label)}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all min-h-[100px] shadow-2xs"
                    >
                      <div className={`p-2.5 rounded-xl ${opt.color} shadow-xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Close Button */}
            {!calledReason && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer border-none mt-2"
              >
                취소
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
