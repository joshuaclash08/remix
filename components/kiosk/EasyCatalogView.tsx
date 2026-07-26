'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/mockData';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { Volume2, Plus, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
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
  const ITEMS_PER_PAGE = 4; // Exactly 4 large items per view for minimal cognitive load

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    vibrate([40, 40]);
    addToCart(product, []);
    speak(`${product.name}를 장바구니에 담았습니다.`, true);

    setAddedItemIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1200);
  };

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
    <div className="w-full flex flex-col space-y-4">
      {/* 1-Touch "지난번과 같은 걸로" Re-order Button */}
      {lastReceipt && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleReorderLast}
          className="w-full p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm flex items-center justify-between shadow-md cursor-pointer border-none transition-all"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-white animate-spin-slow" />
            <div className="text-left">
              <span className="block text-xs font-extrabold text-amber-100">원터치 재주문</span>
              <span className="text-sm font-black text-white">지난번 먹었던 메뉴 그대로 담기</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-700/60 rounded-xl text-xs font-black">1초 주문 →</span>
        </motion.button>
      )}

      {/* 4 Large Items Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {currentProducts.map((prod) => {
          const isRecentlyAdded = addedItemIds.has(prod.id);
          const easyText = prod.easyDescription || prod.voiceDescription || `${prod.name}, ${prod.price.toLocaleString()}원`;

          return (
            <motion.div
              key={prod.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                vibrate(40);
                onSelectProduct(prod);
              }}
              className="relative rounded-2xl bg-white border-2 border-slate-300 p-3 shadow-sm hover:border-[#3182f6] flex flex-col justify-between cursor-pointer min-h-[260px]"
            >
              {/* Top Bar: Listen Button */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {prod.price.toLocaleString()}원
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    vibrate(30);
                    speak(easyText, true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#3182f6] border border-blue-200 cursor-pointer text-[11px] font-black"
                  aria-label={`${prod.name} 쉬운 설명 듣기`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#3182f6]" />
                  <span>설명 듣기</span>
                </button>
              </div>

              {/* Large Image */}
              <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden mb-2.5 flex items-center justify-center border border-slate-200">
                <img
                  src={prod.image}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Title & Short Easy Description */}
              <div className="flex-1 flex flex-col justify-start">
                <h3 className="text-sm font-black text-slate-900 leading-tight mb-1 truncate">
                  {prod.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-600 line-clamp-2 leading-relaxed">
                  {prod.easyDescription || prod.description}
                </p>
              </div>

              {/* Big CTA Button */}
              <button
                onClick={(e) => handleAddToCart(prod, e)}
                className={`mt-2.5 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all border-none cursor-pointer min-h-[48px] ${
                  isRecentlyAdded
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : 'bg-[#3182f6] hover:bg-[#2b70d4] text-white active:scale-95'
                }`}
                aria-label={`${prod.name} ${prod.price.toLocaleString()}원 담기`}
              >
                {isRecentlyAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>담겼습니다!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>담기</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page === 0}
            onClick={() => {
              vibrate(30);
              setPage((p) => Math.max(0, p - 1));
            }}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-black text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 4개</span>
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
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-black text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <span>다음 4개</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
