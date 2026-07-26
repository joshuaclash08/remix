'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/data/storeMenuConfig';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface Props {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryTab({ selectedCategory, onSelectCategory }: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-auto pb-1 mb-4 scrollbar-none">
      <nav className="flex items-center gap-1.5 min-w-max" aria-label={t("Category")}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[cat.iconName] || Icons.Star;

          return (
            <button
              key={cat.id}
              onClick={() => {
                vibrate(30);
                onSelectCategory(cat.id);
              }}
              className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer border ${
                isSelected
                  ? 'text-white font-extrabold border-[#3182f6]'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMobileCategoryBg"
                  className="absolute inset-0 bg-[#3182f6] rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              </span>
              <span className="relative z-10 text-xs">{t(cat.name)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

