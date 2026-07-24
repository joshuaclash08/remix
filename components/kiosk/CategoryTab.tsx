'use client';

import React from 'react';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { motion } from 'framer-motion';

interface Props {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTab({ selectedCategory, onSelectCategory }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();

  return (
    <div className="w-full overflow-x-auto pb-1 mb-4 scrollbar-none">
      <nav className="flex items-center gap-1.5 min-w-max" aria-label="메뉴 카테고리">
        {MOCK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                vibrate(30);
                onSelectCategory(cat.id);
                speak(`${cat.name} 선택됨.`);
              }}
              className={`relative px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSelected
                  ? 'text-slate-950 font-black'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMobileCategoryBg"
                  className="absolute inset-0 bg-yellow-300 border-2 border-yellow-400 rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-xs">{cat.icon}</span>
              <span className="relative z-10">{cat.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
