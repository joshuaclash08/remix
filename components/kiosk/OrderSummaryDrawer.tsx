'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onCheckout: () => void;
}

export function OrderSummaryDrawer({ onCheckout }: Props) {
  const { items, updateQuantity, clearCart } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { lowReachMode, highContrast } = useAccessibilityStore();

  const [isExpanded, setIsExpanded] = React.useState(false);

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);

  if (totalItemCount === 0) return null;

  const handleToggleExpand = () => {
    vibrate(30);
    const next = !isExpanded;
    setIsExpanded(next);
    speak(next ? '장바구니가 열렸습니다.' : '장바구니가 접혔습니다.');
  };

  const handleCheckoutClick = () => {
    vibrate([100, 50, 100]);
    speak(`총 ${totalItemCount}개, ${totalPrice.toLocaleString()}원 주문 진행합니다.`, true);
    onCheckout();
  };

  return (
    <div className="absolute bottom-0 inset-x-0 z-40 p-2 sm:p-3 pointer-events-none">
      <motion.div
        layout
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className={`pointer-events-auto rounded-2xl bg-white border-2 border-yellow-400 shadow-xl overflow-hidden ${
          highContrast ? 'border-black' : ''
        }`}
      >
        {/* Toggle Bar */}
        <div
          onClick={handleToggleExpand}
          className="flex items-center justify-between px-3.5 py-2 bg-yellow-300 border-b border-yellow-400 cursor-pointer text-slate-950"
        >
          <div className="flex items-center gap-1.5 text-xs font-black">
            <ShoppingBag className="w-4 h-4 fill-current" />
            <span>장바구니 ({totalItemCount}개)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                vibrate(30);
                clearCart();
                speak('장바구니 비움');
              }}
              className="text-[10px] font-black text-rose-700 hover:text-rose-900 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>전체삭제</span>
            </button>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {/* Item List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-48 overflow-y-auto p-3 space-y-2 border-b border-slate-100 bg-slate-50"
            >
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-extrabold text-slate-900 truncate">{item.product.name}</h4>
                    <span className="text-xs font-black text-slate-950 block">
                      {(item.totalItemPrice * item.quantity).toLocaleString()}원
                    </span>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => {
                        vibrate(20);
                        updateQuantity(item.cartItemId, -1);
                      }}
                      className="p-1 rounded bg-white text-slate-800 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">{item.quantity}</span>
                    <button
                      onClick={() => {
                        vibrate(20);
                        updateQuantity(item.cartItemId, 1);
                      }}
                      className="p-1 rounded bg-white text-slate-800 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <div className="p-3 flex items-center justify-between gap-2 bg-white">
          <div>
            <span className="text-[10px] font-bold text-slate-500 block">합계</span>
            <span className="text-lg font-black text-slate-950 leading-none">
              {totalPrice.toLocaleString()}원
            </span>
          </div>

          <button
            onClick={handleCheckoutClick}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer ${
              lowReachMode ? 'min-h-[64px] text-sm' : ''
            }`}
          >
            <CreditCard className="w-4 h-4 fill-current" />
            <span>결제 및 주문하기</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
