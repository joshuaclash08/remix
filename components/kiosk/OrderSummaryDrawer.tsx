'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextMorph } from 'torph/react';

interface Props {
  onCheckout: () => void;
}

export function OrderSummaryDrawer({ onCheckout }: Props) {
  const { items, updateQuantity, clearCart, isCartDrawerExpanded, toggleCartDrawer } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { lowReachMode, highContrast } = useAccessibilityStore();
  const { t, language } = useTranslation();

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);

  if (totalItemCount === 0) return null;

  const formatPrice = (price: number) => (language === 'en' ? `₩${price.toLocaleString()}` : `${price.toLocaleString()}원`);

  const handleToggleExpand = () => {
    vibrate(30);
    toggleCartDrawer();
  };

  const handleCheckoutClick = () => {
    vibrate([100, 50, 100]);
    onCheckout();
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] max-w-[414px] z-40 p-2 sm:p-3 pointer-events-none">
      <motion.div
        layout
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className={`pointer-events-auto rounded-2xl bg-white border border-slate-200/80 shadow-xl overflow-hidden ${
          highContrast ? 'border-black' : ''
        }`}
      >
        {/* Toggle Bar */}
        <div
          onClick={handleToggleExpand}
          className="flex items-center justify-between px-3.5 py-2.5 bg-[#3182f6] cursor-pointer text-white"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <ShoppingBag className="w-4 h-4 fill-current text-white" />
            <TextMorph>
              {t("Cart ({count} items)", { count: totalItemCount })}
            </TextMorph>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                vibrate(30);
                clearCart();
              }}
              className="text-[10px] font-bold text-white/90 hover:text-white flex items-center gap-0.5 px-2 py-1 rounded bg-white/20 transition-colors cursor-pointer border-none min-h-[32px]"
              aria-label="장바구니 전체 비우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t("Clear All")}</span>
            </button>
            {isCartDrawerExpanded ? <ChevronDown className="w-4 h-4 text-white" /> : <ChevronUp className="w-4 h-4 text-white" />}
          </div>
        </div>

        {/* Item List */}
        <AnimatePresence>
          {isCartDrawerExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-48 overflow-y-auto p-3 space-y-2 border-b border-slate-100 bg-slate-50"
            >
              {items.map((item) => {
                const itemName = language === 'en' ? (item.product.englishName || t(item.product.name)) : t(item.product.name);
                const itemTotalPrice = item.totalItemPrice * item.quantity;

                return (
                  <div
                    key={item.cartItemId}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-bold text-slate-900 truncate">
                        <TextMorph>{itemName}</TextMorph>
                      </h4>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        <TextMorph>
                          {formatPrice(itemTotalPrice)}
                        </TextMorph>
                      </span>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => {
                          vibrate(20);
                          updateQuantity(item.cartItemId, -1);
                        }}
                        className="p-1 rounded bg-white text-slate-800 transition-colors cursor-pointer border-none min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label={`${itemName} 수량 1개 줄이기`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-black text-slate-900 text-xs">{item.quantity}</span>
                      <button
                        onClick={() => {
                          vibrate(20);
                          updateQuantity(item.cartItemId, 1);
                        }}
                        className="p-1 rounded bg-white text-slate-800 transition-colors cursor-pointer border-none min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label={`${itemName} 수량 1개 늘리기`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <div className="p-3 flex items-center justify-between gap-2 bg-white">
          <div>
            <span className="text-[10px] font-bold text-slate-500 block">{t("Total")}</span>
            <span className="text-lg font-extrabold text-slate-900 leading-none">
              <TextMorph>
                {formatPrice(totalPrice)}
              </TextMorph>
            </span>
          </div>

          <button
            onClick={handleCheckoutClick}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer border-none min-h-[48px] ${
              lowReachMode ? 'min-h-[64px] text-sm' : ''
            }`}
            aria-label={`총 ${totalItemCount}개 항목, 합계 ${formatPrice(totalPrice)}. 결제 및 주문하기`}
          >
            <CreditCard className="w-4 h-4 fill-current" />
            <span>{t("Checkout & Order")}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

