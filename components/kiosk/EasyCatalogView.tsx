'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { RotateCcw, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function EasyCatalogView({ products, onSelectProduct }: Props) {
  const { addToCart, lastReceipt } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();

  const [page, setPage] = useState(0);
  
  // GAIA Guideline: Limit options to 4 per screen for maximum clarity & touch target size
  const ITEMS_PER_PAGE = 4; 

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleReorderLast = () => {
    if (lastReceipt && lastReceipt.items && lastReceipt.items.length > 0) {
      vibrate([60, 40, 60]);
      lastReceipt.items.forEach((item) => {
        addToCart(item.product, item.selectedOptions);
      });
      speak('지난번 주문했던 메뉴를 장바구니에 다시 담았습니다.', true);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between space-y-4 pb-1">
      {/* 1-Touch "지난번과 같은 걸로" Re-order Button */}
      {lastReceipt && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReorderLast}
          className="w-full p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-between shadow-md cursor-pointer border-none transition-all shrink-0"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-white animate-spin-slow" />
            <div className="text-left">
              <span className="block text-[10px] font-black text-amber-100 uppercase tracking-wider">원터치 재주문 (1-Touch Reorder)</span>
              <span className="text-sm font-black text-white">지난번 먹었던 메뉴 그대로 담기</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-700/60 rounded-xl text-xs font-black">1초 주문 →</span>
        </motion.button>
      )}

      {/* 4 Items Grid (2 cols x 2 rows) - Giant easy-to-read cards */}
      <div className="grid grid-cols-2 gap-3.5 flex-1">
        {currentProducts.map((prod) => {
          return (
            <EasyCardItem key={prod.id} prod={prod} onSelectProduct={onSelectProduct} vibrate={vibrate} />
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 shrink-0">
          <button
            disabled={page === 0}
            onClick={() => {
              vibrate(30);
              setPage((p) => Math.max(0, p - 1));
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-black text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 {ITEMS_PER_PAGE}개</span>
          </button>

          <span className="text-xs font-black text-slate-700">
            {page + 1} / {totalPages} 페이지
          </span>

          <button
            disabled={page >= totalPages - 1}
            onClick={() => {
              vibrate(30);
              setPage((p) => Math.min(totalPages - 1, p + 1));
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-black text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <span>다음 {ITEMS_PER_PAGE}개</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function EasyCardItem({
  prod,
  onSelectProduct,
  vibrate,
}: {
  prod: Product;
  onSelectProduct: (p: Product) => void;
  vibrate: (pattern?: number | number[]) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract first sentence of description
  const shortDescription = prod.description 
    ? prod.description.split(/[.!?]/)[0] + '.'
    : '';

  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        vibrate(40);
        onSelectProduct(prod);
      }}
      className="group relative overflow-hidden rounded-3xl bg-white cursor-pointer w-full shadow-xs border border-slate-200/90 hover:border-[#3182f6] transition-all flex flex-col h-full"
      role="button"
      tabIndex={0}
      aria-label={`${prod.name}, ${shortDescription} ${prod.price.toLocaleString()}원. 선택 또는 상세 선택하려면 누르세요.`}
    >
      {/* 1. Image container (45% height) */}
      <div className="relative w-full h-[100px] overflow-hidden bg-slate-100 shrink-0">
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
        )}
        <img
          src={prod.image}
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

        {prod.isPopular && (
          <div 
            className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] shadow-xs"
            aria-label="인기 추천"
          >
            <Flame className="w-2.5 h-2.5 fill-white text-white" />
            <span>추천</span>
          </div>
        )}
      </div>

      {/* 2. Text Content (Name, Description, Price) */}
      <div className="p-3 flex-1 flex flex-col justify-between text-left gap-1">
        <div>
          <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1 tracking-tight">
            {prod.name}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 leading-normal line-clamp-2 mt-1 select-none">
            {shortDescription}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1">
          <span className="text-xs font-black text-[#3182f6]">
            {prod.price.toLocaleString()}원
          </span>
          <span className="text-[9px] bg-blue-50 text-[#3182f6] px-1.5 py-0.5 rounded font-black">
            선택
          </span>
        </div>
      </div>
    </motion.div>
  );
}
