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
    const textToRead = product.easyDescription || product.voiceDescription || `${productName}, 가격 ${formattedPrice}. ${product.description}`;
    speak(textToRead, true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleCardClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between p-3.5 shadow-sm hover:border-[#3182f6] ${
        highContrast ? 'border-2 border-black text-black' : 'border-slate-200/90 hover:border-[#3182f6]'
      } ${lowReachMode ? 'min-h-[210px]' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${productName}, ${formattedPrice}. 선택하거나 장바구니에 담으려면 두 번 탭하세요.`}
    >
      {/* Top Bar: Badge (Information: Warm Amber) & Voice Reader Button (Action/Audio: Light Pill) */}
      <div className="flex items-center justify-between mb-2.5 min-h-[32px] z-10">
        {/* Best Badge - Information Color (Warm Amber/Rose, distinct from Action Blue) */}
        {product.isPopular ? (
          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[11px] shadow-2xs"
            aria-label="인기 추천 메뉴"
          >
            <Flame className="w-3.5 h-3.5 fill-white text-white" />
            <span>인기</span>
          </div>
        ) : (
          <div /> // Spacer
        )}

        {/* Voice Read Button with Visible Text ("듣기") + Explicit WAI-ARIA Label */}
        <button
          onClick={handleVoiceRead}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#3182f6] transition-all border border-slate-200 shadow-2xs cursor-pointer active:scale-95 min-h-[32px]"
          title={`${productName} 음성 설명 듣기`}
          aria-label={`${productName} ${formattedPrice} 음성 설명 듣기`}
        >
          <Volume2 className="w-3.5 h-3.5 text-[#3182f6]" />
          <span className="text-[11px] font-extrabold text-slate-700">듣기</span>
        </button>
      </div>

      {/* Product Image Box - Pure image block without any text overlay */}
      <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 border border-slate-200/60 flex items-center justify-center">
        <img
          src={product.image}
          alt="" // Empty alt to prevent unstyled text overflow on top of image when loading or if image is broken
          aria-hidden="true"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Hide broken image element to display fallback container cleanly
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Info - Clean Title Block */}
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-[#3182f6] transition-colors line-clamp-2">
          {productName}
        </h3>
      </div>

      {/* Price & Large Action CTA Button (Primary Action Blue) */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <span className="text-xs sm:text-sm font-black text-slate-950">
          {formattedPrice}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all cursor-pointer min-h-[44px] ${
            lowReachMode ? 'min-h-[52px] px-4 text-sm' : ''
          }`}
          aria-label={`${productName} ${formattedPrice} 장바구니에 담기`}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>담기</span>
        </button>
      </div>
    </motion.div>
  );
}

