'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/mockData';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { X, PlusCircle, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function OptionSelectModal({ product, onClose }: Props) {
  const { addToCart } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const lowReachMode = useAccessibilityStore((state) => state.lowReachMode);

  const [selectedOpts, setSelectedOpts] = useState<{ [groupTitle: string]: { name: string; price: number } }>({});

  if (!product) return null;

  const handleSelectOption = (groupTitle: string, optionName: string, price: number) => {
    vibrate(30);
    setSelectedOpts((prev) => ({
      ...prev,
      [groupTitle]: { name: optionName, price },
    }));
    speak(`${groupTitle} ${optionName} 선택됨.`);
  };

  const extraTotal = Object.values(selectedOpts).reduce((sum, item) => sum + item.price, 0);
  const finalPrice = product.price + extraTotal;

  const handleConfirmAddToCart = () => {
    vibrate([60, 40, 60]);

    const formattedOpts = Object.entries(selectedOpts).map(([groupTitle, item]) => ({
      groupTitle,
      optionName: item.name,
      price: item.price,
    }));

    addToCart(product, formattedOpts);
    speak(`${product.name}가 장바구니에 담겼습니다. 총 금액 ${finalPrice.toLocaleString()}원입니다.`, true);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full bg-white border-t-4 border-yellow-400 rounded-t-3xl p-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">{product.name}</h3>
                <p className="text-xs text-yellow-600 font-extrabold mt-0.5">
                  기본: {product.price.toLocaleString()}원
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Option Groups */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 mb-3">
            {product.optionGroups && product.optionGroups.length > 0 ? (
              product.optionGroups.map((group) => {
                const currentSel = selectedOpts[group.title]?.name;

                return (
                  <div key={group.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800">{group.title}</h4>
                      {group.required && (
                        <span className="text-[10px] font-extrabold text-slate-900 bg-yellow-300 px-1.5 py-0.5 rounded">
                          필수
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {group.options.map((opt) => {
                        const isSelected = currentSel === opt.name;

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(group.title, opt.name, opt.price)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-yellow-300/40 border-yellow-400 text-slate-950 font-black ring-2 ring-yellow-400'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            } ${lowReachMode ? 'min-h-[54px]' : ''}`}
                          >
                            <span className="text-xs font-extrabold">{opt.name}</span>
                            <div className="flex items-center gap-1">
                              {opt.price > 0 && (
                                <span className="text-xs font-bold text-slate-900">
                                  +{opt.price.toLocaleString()}원
                                </span>
                              )}
                              {isSelected && <Check className="w-4 h-4 text-slate-950" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                별도 옵션 없이 장바구니에 담으실 수 있습니다.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block font-bold">결제 예정 금액</span>
              <span className="text-base font-black text-slate-950">{finalPrice.toLocaleString()}원</span>
            </div>

            <button
              onClick={handleConfirmAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer ${
                lowReachMode ? 'min-h-[64px] text-sm' : ''
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>장바구니 담기</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
