'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/mockData';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/hooks/useTranslation';
import { X, PlusCircle, Check, Volume2, Info } from 'lucide-react';
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
  const { t, language } = useTranslation();

  const [selectedOpts, setSelectedOpts] = useState<{ [groupTitle: string]: { name: string; price: number } }>({});

  const productName = product ? (language === 'en' ? (product.englishName || t(product.name)) : t(product.name)) : '';
  const formatPrice = (price: number) => (language === 'en' ? `₩${price.toLocaleString()}` : `${price.toLocaleString()}원`);

  const handleSelectOption = (groupTitle: string, optionName: string, price: number) => {
    vibrate(30);
    setSelectedOpts((prev) => ({
      ...prev,
      [groupTitle]: { name: optionName, price },
    }));
  };

  const handleVoiceRead = () => {
    if (!product) return;
    vibrate(30);
    speak(product.voiceDescription || `${productName}, ${product.description || ''}`, true);
  };

  const extraTotal = Object.values(selectedOpts).reduce((sum, item) => sum + item.price, 0);
  const finalPrice = (product?.price || 0) + extraTotal;

  const handleConfirmAddToCart = () => {
    if (!product) return;
    vibrate([60, 40, 60]);

    const formattedOpts = Object.entries(selectedOpts).map(([groupTitle, item]) => ({
      groupTitle,
      optionName: item.name,
      price: item.price,
    }));

    addToCart(product, formattedOpts);
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
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
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col border-t border-slate-100"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                <img
                  src={product.image}
                  alt={productName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">{productName}</h3>
                  <p className="text-xs text-[#3182f6] font-extrabold mt-0.5">
                    {t("Original Price", { price: product.price.toLocaleString() })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleVoiceRead}
                  className="p-2 rounded-full bg-blue-50 text-[#3182f6] hover:bg-blue-100 transition-colors cursor-pointer border-none flex items-center justify-center min-h-[36px] min-w-[36px]"
                  title={t("Listen Description")}
                  aria-label={`${productName} ${t("Listen Description")}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center min-h-[36px] min-w-[36px]"
                  aria-label={t("Close")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Description Box - Shown when configuring options / adding to cart */}
            {product.description && (
              <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#3182f6] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    {product.description}
                  </p>
                </div>
                {product.allergies && product.allergies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500">알레르기:</span>
                    {product.allergies.map((allergy, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Option Groups */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 mb-3">
              {product.optionGroups && product.optionGroups.length > 0 ? (
                product.optionGroups.map((group) => {
                  const currentSel = selectedOpts[group.title]?.name;

                  return (
                    <div key={group.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800">{t(group.title)}</h4>
                        {group.required && (
                          <span className="text-[10px] font-bold text-white bg-[#3182f6] px-1.5 py-0.5 rounded">
                            {t("Required")}
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
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[50px] ${
                                isSelected
                                  ? 'bg-blue-50/80 border-2 border-[#3182f6] text-[#3182f6] font-extrabold shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-bold'
                              } ${lowReachMode ? 'min-h-[58px]' : ''}`}
                            >
                              <span className="text-xs font-extrabold">{t(opt.name)}</span>
                              <div className="flex items-center gap-1">
                                {opt.price > 0 && (
                                  <span className="text-xs font-bold text-slate-900">
                                    +{formatPrice(opt.price)}
                                  </span>
                                )}
                                {isSelected && <Check className="w-4 h-4 text-[#3182f6]" />}
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
                  {t("No extra options needed")}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">{t("Expected Payment")}</span>
                <span className="text-base font-extrabold text-slate-900">{formatPrice(finalPrice)}</span>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer ${
                  lowReachMode ? 'min-h-[64px] text-sm' : ''
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t("Add to Cart")}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

