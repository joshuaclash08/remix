'use client';

import React from 'react';
import { Product } from '@/lib/mockData';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
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

  const handleCardClick = () => {
    vibrate(40);
    onSelectProduct(product);
  };

  const handleVoiceRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate(30);
    speak(product.voiceDescription || `${product.name}, 가격 ${product.price.toLocaleString()}원`, true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border-2 transition-all cursor-pointer flex flex-col justify-between p-3.5 shadow-sm hover:shadow-md ${
        highContrast ? 'border-black text-black' : 'border-slate-200 hover:border-yellow-400'
      } ${lowReachMode ? 'min-h-[190px]' : ''}`}
      role="button"
      aria-label={`${product.name}, 가격 ${product.price.toLocaleString()}원`}
    >
      {/* Best Badge */}
      {product.isPopular && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-yellow-300 text-slate-950 font-black text-[10px] shadow-sm border border-yellow-400">
          <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
          <span>BEST</span>
        </div>
      )}

      {/* Voice Read Button */}
      <button
        onClick={handleVoiceRead}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-xl bg-slate-100 hover:bg-yellow-300 text-slate-800 transition-colors border border-slate-300 cursor-pointer"
        title="음성으로 메뉴 설명 듣기"
        aria-label={`${product.name} 음성 듣기`}
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>

      <div>
        {/* Product Image */}
        <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-2.5 bg-slate-100 border border-slate-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-yellow-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
      </div>

      {/* Price & Add CTA Button */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <span className="text-xs sm:text-sm font-black text-slate-950">
          {product.price.toLocaleString()}원
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer ${
            lowReachMode ? 'min-h-[48px] px-3' : ''
          }`}
          aria-label={`${product.name} 담기`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>담기</span>
        </button>
      </div>
    </motion.div>
  );
}
