'use client';

import React from 'react';
import { Product } from '@/lib/mockData';
import { useHaptics } from '@/hooks/useHaptics';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export function MenuCard({ product, onSelectProduct }: Props) {
  const { vibrate } = useHaptics();
  const { highContrast } = useAccessibilityStore();
  const { t, language } = useTranslation();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const productName = language === 'en' ? (product.englishName || t(product.name)) : t(product.name);
  const formattedPrice = language === 'en' ? `₩${product.price.toLocaleString()}` : `${product.price.toLocaleString()}원`;

  const handleCardClick = () => {
    vibrate(40);
    onSelectProduct(product);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleCardClick}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer aspect-square shadow-sm transition-all ${
        highContrast ? 'border-2 border-black' : 'border border-slate-200/60 hover:border-[#3182f6]'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${productName}, ${formattedPrice}. 선택하거나 자세히 보려면 탭하세요.`}
    >
      {/* Skeleton Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-2xl aspect-square z-0" />
      )}

      {/* Product Image - Absolute Inset to Lock Ratio */}
      <img
        src={product.image}
        alt=""
        aria-hidden="true"
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
          setIsLoaded(true);
        }}
      />

      {/* Top Left Badge: "인기" (Popular) Badge overlay */}
      {product.isPopular && (
        <div 
          className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[11px] shadow-xs"
          aria-label="인기 추천 메뉴"
        >
          <Flame className="w-3.5 h-3.5 fill-white text-white" />
          <span>인기</span>
        </div>
      )}

      {/* Bottom Gradient Overlay with Natural Masked Fade Blur */}
      <div 
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white/95 via-white/60 to-transparent backdrop-blur-md rounded-b-2xl px-3 py-2.5 flex items-end justify-between gap-1.5 pointer-events-none z-10 [mask-image:linear-gradient(to_top,black_0%,black_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_0%,black_45%,transparent_100%)]"
      >
        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight line-clamp-1 flex-1 min-w-0">
          {productName}
        </h3>
        <span className="text-xs sm:text-sm font-extrabold text-[#3182f6] shrink-0">
          {formattedPrice}
        </span>
      </div>
    </motion.div>
  );
}


