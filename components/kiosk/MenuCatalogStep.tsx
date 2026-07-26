'use client';

import React, { useState, useEffect, useRef } from 'react';
import { menuService } from '@/lib/services';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { 
  Store as StoreIcon, Mic, Sliders, MapPin, ShoppingBag,
  ChevronRight, Sparkles, Star, Beef, Utensils, Fish, UtensilsCrossed 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TextMorph } from 'torph/react';
import { SuccessAnimation } from '@/components/kiosk/SuccessAnimation';
import { CategoryTab } from '@/components/kiosk/CategoryTab';
import { MenuCard } from '@/components/kiosk/MenuCard';
import { OptionSelectModal } from '@/components/kiosk/OptionSelectModal';
import { OrderSummaryDrawer } from '@/components/kiosk/OrderSummaryDrawer';
import { VoiceAssistantModal } from '@/components/a11y/VoiceAssistantModal';
import { QuickSettingsModal } from '@/components/kiosk/QuickSettingsModal';
import { DebounceButton } from '@/components/ui/DebounceButton';
import { useTranslation } from '@/hooks/useTranslation';
import { mapBurgerToProduct, CATEGORIES } from '@/lib/data/storeMenuConfig';
import type { Product, Store, OrderType } from '@/lib/types';

interface Props {
  activeStore: Store;
  tableId: string | null;
  orderType: OrderType;
  onResetKioskFlow: () => void;
  onSelectOrderType: () => void;
  onResetToStep1: () => void;
}

import { EasyCatalogView } from '@/components/kiosk/EasyCatalogView';

export function MenuCatalogStep({
  activeStore,
  tableId,
  orderType,
  onResetKioskFlow,
  onSelectOrderType,
  onResetToStep1,
}: Props) {
  const { items, toggleCartDrawer, placeOrder, orderStatus, setVoiceModalOpen } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { reduceMotion, easyMode } = useAccessibilityStore();
  const { t } = useTranslation();

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [selectedCategory, setSelectedCategory] = useState<string>('burgers');
  const [activeSubSectionId, setActiveSubSectionId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sections = menuService.getMenuSections(activeStore.id, selectedCategory);

  // Synchronize active sub-section in render
  const [prevCategory, setPrevCategory] = useState(selectedCategory);
  const [prevStoreId, setPrevStoreId] = useState(activeStore.id);

  if (selectedCategory !== prevCategory || activeStore.id !== prevStoreId) {
    setPrevCategory(selectedCategory);
    setPrevStoreId(activeStore.id);
    setActiveSubSectionId(sections[0]?.id || '');
  }

  // Scroll sync to active sub-section in Breadcrumb
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const currentSections = menuService.getMenuSections(activeStore.id, selectedCategory);
      let currentActiveId = currentSections[0]?.id || '';
      
      for (const sec of currentSections) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          if (rect.top - containerRect.top <= 120) {
            currentActiveId = sec.id;
          }
        }
      }
      
      if (currentActiveId && currentActiveId !== activeSubSectionId) {
        setActiveSubSectionId(currentActiveId);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeStore, selectedCategory, activeSubSectionId]);

  const handleScrollToSection = (secId: string) => {
    vibrate(30);
    const el = document.getElementById(`section-${secId}`);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      el.setAttribute('tabindex', '-1');
      el.focus();
      const secTitle = sections.find(s => s.id === secId)?.title || '';
      speak(`${secTitle} 영역으로 이동합니다.`);
    }
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      case 'Beef': return <Beef className="w-4 h-4 text-rose-600" />;
      case 'Utensils': return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'Fish': return <Fish className="w-4 h-4 text-blue-500" />;
      case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4 text-amber-600" />;
      default: return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      key="menu"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="flex-1 w-full h-full flex flex-col justify-between relative overflow-hidden"
      role="region"
      aria-label={t("Menu Order Screen")}
    >
      {/* 1. Header / Breadcrumb Navigator */}
      <div className="w-full shrink-0 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap" role="navigation" aria-label={t("Current Path")}>
          <DebounceButton 
            onDebouncedClick={onResetKioskFlow}
            className="text-[#3182f6] hover:underline flex items-center gap-0.5 px-2 py-1 rounded bg-blue-50 focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[36px] border-none"
            aria-label={`${t(activeStore.name)}, ${t("Change")}`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t(activeStore.name)}</span>
          </DebounceButton>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <DebounceButton 
            onDebouncedClick={onSelectOrderType}
            className="text-[#3182f6] hover:underline flex items-center gap-0.5 px-2 py-1 rounded bg-blue-50 focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[36px] border-none"
            aria-label={t("Select Order Method")}
          >
            <TextMorph>
              {orderType === 'table' ? t("Table {num}", { num: tableId || "" }) : t("Takeout Order")}
            </TextMorph>
          </DebounceButton>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          
          <span className="text-slate-600 px-1 py-0.5">
            <TextMorph>
              {t(CATEGORIES.find(c => c.id === selectedCategory)?.name || '')}
            </TextMorph>
          </span>
          
          {activeSubSectionId && sections.find(s => s.id === activeSubSectionId) && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <DebounceButton 
                onDebouncedClick={() => handleScrollToSection(activeSubSectionId)}
                className="text-slate-900 hover:underline px-2 py-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[36px] border-none"
                aria-label={`Section: ${t(sections.find(s => s.id === activeSubSectionId)?.title || '')}`}
              >
                <TextMorph>
                  {t(sections.find(s => s.id === activeSubSectionId)?.title || '')}
                </TextMorph>
              </DebounceButton>
            </>
          )}
        </div>
      </div>

      {/* 2. Main content area: Category Tab & Product Grid */}
      <div className="flex-1 w-full flex flex-col overflow-hidden px-4 pt-3 pb-4">
        <CategoryTab 
          selectedCategory={selectedCategory} 
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            const newSections = menuService.getMenuSections(activeStore.id, catId);
            if (newSections.length > 0) {
              setActiveSubSectionId(newSections[0].id);
            }
          }} 
        />

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto space-y-8 pr-1 pb-28 phone-scroll"
          role="feed"
          aria-busy="false"
        >
          {easyMode ? (
            <EasyCatalogView
              products={menuService.getAllProducts(activeStore.id)}
              onSelectProduct={(prod) => {
                vibrate(40);
                setSelectedProduct(prod);
              }}
            />
          ) : sections.length > 0 ? (
            sections.map((section) => (
              <div 
                key={section.id} 
                id={`section-${section.id}`}
                className="space-y-4 focus:outline-none"
              >
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/80">
                  {getSectionIcon(section.iconName)}
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    {t(section.title)}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    {t("Items", { count: section.items.length })}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3.5">
                  {section.items.map((item) => {
                    const product = mapBurgerToProduct(item);
                    return (
                      <MenuCard 
                        key={product.id}
                        product={product}
                        onSelectProduct={(prod) => {
                          vibrate(40);
                          setSelectedProduct(prod);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <p className="text-sm font-bold">{t("Category Coming Soon")}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Compact Light Glass Floating Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[340px] h-[60px] bg-white/95 backdrop-blur-2xl text-slate-900 border border-slate-200/90 rounded-full shadow-[0_10px_32px_rgba(0,0,0,0.12)] flex items-center justify-between z-30 select-none px-2"
        aria-label="Main Navigation"
      >
        {/* Left: AI Voice Order */}
        <DebounceButton
          onDebouncedClick={() => {
            vibrate(40);
            setVoiceModalOpen(true);
          }}
          className="flex flex-col items-center justify-center min-w-[50px] h-[48px] rounded-full text-[#3182f6] hover:bg-blue-50 cursor-pointer border-none bg-transparent active:scale-95 transition-all"
          aria-label="AI 음성 주문"
        >
          <Mic className="w-4.5 h-4.5 text-[#3182f6] animate-pulse" />
          <span className="text-[10px] font-black mt-0.5 text-[#3182f6]">AI 주문</span>
        </DebounceButton>

        {/* Center: Wide Cart Button with Number BEFORE Icon & Tight Margin */}
        <DebounceButton
          onDebouncedClick={() => {
            vibrate(40);
            if (totalItemCount > 0) {
              placeOrder(orderType);
            } else {
              speak('장바구니가 비어 있습니다. 메뉴를 담아 주세요.');
            }
          }}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 h-[44px] rounded-full font-black text-xs cursor-pointer border-none transition-all shadow-xs active:scale-95 flex-1 max-w-[175px] mx-0.5 ${
            totalItemCount > 0
              ? 'bg-[#3182f6] hover:bg-[#2b70d4] text-white shadow-blue-500/20'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          aria-label={`장바구니 ${totalItemCount}개 항목. 선택 시 주문하기`}
        >
          {totalItemCount > 0 && (
            <span className="font-black text-sm text-white shrink-0">
              {totalItemCount}
            </span>
          )}
          <ShoppingBag className={`w-4 h-4 shrink-0 ${totalItemCount > 0 ? 'text-white fill-current' : 'text-slate-600'}`} />
          <span className="truncate font-black">장바구니</span>
        </DebounceButton>

        {/* Right: Setting */}
        <DebounceButton
          onDebouncedClick={() => {
            vibrate(30);
            setIsQuickSettingsOpen(true);
          }}
          className="flex flex-col items-center justify-center min-w-[50px] h-[48px] rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer border-none bg-transparent active:scale-95 transition-all"
          aria-label="설정"
        >
          <Sliders className="w-4.5 h-4.5 text-slate-700" />
          <span className="text-[10px] font-black mt-0.5 text-slate-700">설정</span>
        </DebounceButton>
      </nav>

      {/* Success Modal */}
      {orderStatus === 'completed' && <SuccessAnimation />}

      {/* Option Select Modal */}
      {selectedProduct && (
        <OptionSelectModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal />

      {/* Quick Settings Modal */}
      <QuickSettingsModal
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        onResetToStep1={onResetToStep1}
      />
    </motion.div>
  );
}
