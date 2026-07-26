'use client';

import React from 'react';
import { Product } from '@/lib/mockData';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Volume2, Plus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export function MenuCard({ product, onSelectProduct }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { highContrast, lowReachMode } = useAccessibilityStore();
  const { t, language } = useTranslation();

  const productName = language === 'en' ? (product.englishName || t(product.name)) : t(product.name);
  const formattedPrice = language === 'en' ? `₩${product.price.toLocaleString()}` : `${product.price.toLocaleString()}원`;

  const handleCardClick = () => {
    vibrate(40);
    onSelectProduct(product);
  };

  const handleVoiceRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(30);
    speak(product.voiceDescription || `${productName}, ${formattedPrice}`, true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleCardClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between p-3.5 shadow-sm hover:border-[#3182f6] ${
        highContrast ? 'border-2 border-black text-black' : 'border-slate-200/90 hover:border-[#3182f6]'
      } ${lowReachMode ? 'min-h-[200px]' : ''}`}
      role="button"
      aria-label={`${productName}, ${formattedPrice}`}
    >
      {/* Best Badge */}
      {product.isPopular && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3182f6] text-white font-black text-[11px] shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-white text-white" />
          <span>BEST</span>
        </div>
      )}

      {/* Voice Read Button */}
      <button
        onClick={handleVoiceRead}
        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-xs hover:bg-blue-50 text-slate-700 transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
        title={t("Listen Description")}
        aria-label={`${productName} ${t("Listen Description")}`}
      >
        <Volume2 className="w-4 h-4 text-slate-700" />
      </button>

      <div>
        {/* Product Image */}
        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-100">
          <img
            src={product.image}
            alt={productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info - Clean, bold, minimal text without glance paragraph clutter */}
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-[#3182f6] transition-colors line-clamp-2">
          {productName}
        </h3>
      </div>

      {/* Price & Large Add CTA Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <span className="text-xs sm:text-sm font-black text-slate-950">
          {formattedPrice}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all cursor-pointer min-h-[44px] ${
            lowReachMode ? 'min-h-[52px] px-4 text-sm' : ''
          }`}
          aria-label={`${t("Add to Cart")}: ${productName}`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t("Add to Cart")}</span>
        </button>
      </div>
    </motion.div>
  );
}

