'use client';

import React, { useState, useEffect, useRef } from 'react';
import { menuService, voiceAssistantService } from '@/lib/services';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useRealMicrophone } from '@/hooks/useRealMicrophone';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { 
  Mic, Sliders, ShoppingBag, ArrowLeft, BellRing,
  Sparkles, Star, Beef, Utensils, Fish, UtensilsCrossed,
  Trash2, Plus, Minus, ChevronDown, Pause, Bot, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessAnimation } from '@/components/kiosk/SuccessAnimation';
import { CategoryTab } from '@/components/kiosk/CategoryTab';
import { MenuCard } from '@/components/kiosk/MenuCard';
import { OptionSelectModal } from '@/components/kiosk/OptionSelectModal';
import { VoiceAssistantModal } from '@/components/a11y/VoiceAssistantModal';
import { StaffCallModal } from '@/components/kiosk/StaffCallModal';
import { DebounceButton } from '@/components/ui/DebounceButton';
import { useTranslation } from '@/hooks/useTranslation';
import { mapBurgerToProduct } from '@/lib/data/storeMenuConfig';
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
  const { 
    items, 
    addToCart,
    placeOrder, 
    orderStatus, 
    setVoiceModalOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    toasts,
    removeToast,
    visualCaption
  } = useCartStore();

  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { 
    reduceMotion, 
    easyMode, 
    highContrast, 
    fontScale,
    visualCaptionMode,
    dyslexiaTypography,
    dyslexiaLetterSpacing,
    dyslexiaLineHeight,
    timeoutExtensionEnabled,
    setEasyMode,
    setFontScale,
    setFontMultiplier,
    setHighContrast,
    setReduceMotion,
    resetAll 
  } = useAccessibilityStore();
  const { t, language } = useTranslation();

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = items.reduce((sum, item) => sum + (item.product.price + item.selectedOptions.reduce((acc, o) => acc + o.price, 0)) * item.quantity, 0);

  const [selectedCategory, setSelectedCategory] = useState<string>('burgers');
  const [activeSubSectionId, setActiveSubSectionId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isStaffCallOpen, setIsStaffCallOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'none' | 'ai' | 'cart' | 'settings'>('none');
  const { isListening, transcript, error: micError, startListening, stopListening } = useRealMicrophone();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);

  // Inactivity timeout warning states
  const [inactivitySeconds, setInactivitySeconds] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(15);

  const limitSeconds = timeoutExtensionEnabled ? 180 : 60;

  // Reset timer on user interaction
  useEffect(() => {
    const resetTimer = () => {
      setInactivitySeconds(0);
      setShowTimeoutWarning(false);
      setWarningCountdown(15);
    };

    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [timeoutExtensionEnabled]);

  // Periodic interval checking inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      setInactivitySeconds((prev) => {
        const next = prev + 1;
        if (next >= limitSeconds - 15) {
          setShowTimeoutWarning(true);
        }
        if (next >= limitSeconds) {
          clearInterval(interval);
          // Inactivity limit reached: Clear cart and reset kiosk flow
          clearCart();
          onResetKioskFlow();
          speak(language === 'ko' ? '주문 시간이 초과되어 초기 화면으로 이동합니다.' : 'Session timed out. Returning to home.', true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [limitSeconds, clearCart, onResetKioskFlow, speak, language]);

  // Handle warning countdown ticking
  useEffect(() => {
    if (!showTimeoutWarning) return;
    const interval = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimeoutWarning]);

  const handleAudioRecorded = async (audioBlob: Blob, textFallback?: string) => {
    vibrate(40);
    setIsAiProcessing(true);
    try {
      const result = await voiceAssistantService.parseVoiceAudioWithGroq(audioBlob, textFallback || '');
      setIsAiProcessing(false);
      if (result.matchedProduct && result.intent === 'add_to_cart') {
        addToCart(result.matchedProduct, result.matchedOptions || []);
        setAiResponseText(`"${result.matchedProduct.name}"를 장바구니에 담았습니다!`);
        speak(`"${result.matchedProduct.name}"를 장바구니에 담았습니다.`, true);
      } else if (result.intent === 'clear_cart') {
        clearCart();
        setAiResponseText('장바구니를 비웠습니다.');
        speak('장바구니를 비웠습니다.', true);
      } else if (result.intent === 'checkout') {
        placeOrder(orderType);
        setAiResponseText('주문 및 결제를 진행합니다.');
        speak('주문 및 결제를 진행합니다.', true);
      } else {
        setAiResponseText(result.aiResponseText || result.feedbackMessage);
        speak(result.aiResponseText || result.feedbackMessage, true);
      }
    } catch (err) {
      setIsAiProcessing(false);
      setAiResponseText('음성 처리 중 오류가 발생했습니다. 다시 말씀해 주세요.');
    }
  };

  const toggleAiMic = () => {
    vibrate(30);
    if (isListening) {
      stopListening();
    } else {
      setAiResponseText(null);
      startListening((audioBlob, liveText) => {
        handleAudioRecorded(audioBlob, liveText);
      });
    }
  };

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

  // Scroll sync to active sub-section
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

  const handleScrollToSection = (_secId: string) => {
    vibrate(30);
    const el = document.getElementById(`section-${_secId}`);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      el.setAttribute('tabindex', '-1');
      el.focus();
      const secTitle = sections.find(s => s.id === _secId)?.title || '';
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

  const handleTabClick = (tab: 'ai' | 'cart' | 'settings') => {
    vibrate(30);
    if (activeNavTab === tab) {
      setActiveNavTab('none');
      if (tab === 'ai' && isListening) stopListening();
    } else {
      setActiveNavTab(tab);
      if (tab === 'ai') {
        setAiResponseText(null);
        speak('음성 주문 서비스가 시작되었습니다. 말씀하세요.', true);
        startListening((audioBlob, liveText) => {
          handleAudioRecorded(audioBlob, liveText);
        });
      }
    }
  };

  return (
    <motion.div
      key="menu"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      style={{
        letterSpacing: dyslexiaTypography ? `${dyslexiaLetterSpacing}em` : undefined,
        lineHeight: dyslexiaTypography ? dyslexiaLineHeight : undefined,
      }}
      className="flex-1 w-full h-full flex flex-col justify-between relative overflow-hidden"
      role="region"
      aria-label={t("Menu Order Screen")}
    >
      {/* 1. Top Floating Liquid Glass Action Bar (Back Left, Staff Call Right) */}
      <div className="w-full shrink-0 px-4 pt-3 pb-1 flex items-center justify-between z-20">
        <DebounceButton
          onDebouncedClick={() => {
            vibrate(30);
            onSelectOrderType();
          }}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          aria-label="주문 방식 선택으로 돌아가기"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </DebounceButton>

        <DebounceButton
          onDebouncedClick={() => {
            vibrate(40);
            setIsStaffCallOpen(true);
          }}
          className="px-3.5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white backdrop-blur-md shadow-md border border-rose-400 flex items-center gap-1.5 font-black text-xs cursor-pointer active:scale-95 transition-all min-h-[40px]"
          aria-label="직원 호출"
        >
          <BellRing className="w-4 h-4 text-white animate-pulse" />
          <span>직원 호출</span>
        </DebounceButton>
      </div>

      {/* 2. Main content area: Category Tab & Product Grid */}
      <div className="flex-1 w-full flex flex-col overflow-hidden px-4 pt-2 pb-4">
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
          className="flex-1 overflow-y-auto space-y-8 pr-1 pb-24 phone-scroll"
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
                
                <div className="grid grid-cols-2 gap-3">
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

      {/* Backdrop overlay when navigation sheet is expanded */}
      {activeNavTab !== 'none' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30"
          onClick={() => setActiveNavTab('none')}
        />
      )}

      {/* 3. Integrated Single Sliding Navigation Dock Container */}
      <motion.div
        initial={false}
        animate={{
          y: activeNavTab === 'none' ? 'calc(100% - 72px)' : '0%',
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
        className="fixed bottom-0 inset-x-0 max-h-[82vh] bg-white border-t border-slate-200/90 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.18)] z-50 max-w-[430px] mx-auto flex flex-col overflow-visible"
      >
        {/* Floating Circular Down-Arrow Close Button slightly floating above the navigation bar container */}
        {activeNavTab !== 'none' && (
          <button
            onClick={() => {
              vibrate(20);
              setActiveNavTab('none');
            }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer border-none z-50 active:scale-95"
            aria-label="닫기"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* TOP: NAVIGATION BAR (Height: 72px) - Always visible at top of container, glides UP as container expands */}
        <div className="w-full h-[72px] px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 rounded-t-3xl">
          {/* Left: AI Voice Order */}
          <DebounceButton
            onDebouncedClick={() => handleTabClick('ai')}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl cursor-pointer border-none transition-all ${
              activeNavTab === 'ai'
                ? 'bg-blue-50 text-[#3182f6] font-black'
                : 'bg-transparent text-slate-700 hover:text-slate-900'
            }`}
            aria-label="AI 음성 주문"
          >
            <Mic className={`w-5 h-5 ${activeNavTab === 'ai' ? 'text-[#3182f6]' : 'text-slate-600'}`} />
            <span className="text-[11px] font-black mt-1">AI 주문</span>
          </DebounceButton>

          {/* Center: Custom Cart Button (matching user's reference image) */}
          <DebounceButton
            onDebouncedClick={() => handleTabClick('cart')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border transition-all shadow-2xs active:scale-95 shrink-0 cursor-pointer ${
              activeNavTab === 'cart'
                ? 'border-[#3182f6] ring-2 ring-blue-500/20'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
            aria-label={`장바구니 ${totalItemCount}개 항목`}
          >
            <ShoppingBag className="w-5 h-5 text-[#3182f6] stroke-[2.2] shrink-0" />
            <span className="text-sm font-black text-slate-950 tracking-tight">장바구니</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#3182f6] font-black text-xs border border-blue-100/80 shrink-0">
              {totalItemCount}개
            </span>
          </DebounceButton>

          {/* Right: Setting */}
          <DebounceButton
            onDebouncedClick={() => handleTabClick('settings')}
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-2xl cursor-pointer border-none transition-all ${
              activeNavTab === 'settings'
                ? 'bg-blue-50 text-[#3182f6] font-black'
                : 'bg-transparent text-slate-700 hover:text-slate-900'
            }`}
            aria-label="설정"
          >
            <Sliders className={`w-5 h-5 ${activeNavTab === 'settings' ? 'text-[#3182f6]' : 'text-slate-600'}`} />
            <span className="text-[11px] font-black mt-1">설정</span>
          </DebounceButton>
        </div>

        {/* EXPANDED CONTENT AREA IN THE SPACE CREATED INSIDE THE SLIDING CONTAINER */}
        <AnimatePresence>
          {activeNavTab !== 'none' && (
            <motion.div
              key="expanded-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col overflow-hidden px-4 pt-2 pb-3"
            >
              {activeNavTab === 'cart' && items.length > 0 && (
                <div className="w-full flex items-center justify-end pt-1 pb-1 shrink-0">
                  <button
                    onClick={() => {
                      vibrate(30);
                      clearCart();
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded bg-slate-100 cursor-pointer border-none"
                  >
                    비우기
                  </button>
                </div>
              )}

              {/* TAB CONTENT: 1. CART (장바구니) */}
              {activeNavTab === 'cart' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {items.length > 0 ? (
                    <>
                      {/* Cart Items List */}
                      <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
                        {items.map((item) => {
                          const unitExtra = item.selectedOptions.reduce((sum, o) => sum + o.price, 0);
                          const itemUnitPrice = item.product.price + unitExtra;
                          const formattedUnitPrice = language === 'en' ? `₩${itemUnitPrice.toLocaleString()}` : `${itemUnitPrice.toLocaleString()}원`;

                          return (
                            <div
                              key={item.cartItemId}
                              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 shadow-2xs"
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                                    {t(item.product.name)}
                                  </h4>
                                  <button
                                    onClick={() => {
                                      vibrate(20);
                                      removeFromCart(item.cartItemId);
                                    }}
                                    className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer border-none"
                                    aria-label="삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Selected Options */}
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                  <div className="mt-1 space-y-0.5">
                                    {item.selectedOptions.map((opt, idx) => (
                                      <span key={idx} className="block text-[10px] text-slate-500 font-medium truncate">
                                        • {t(opt.groupTitle)}: {t(opt.optionName)}
                                        {opt.price > 0 && ` (+${opt.price.toLocaleString()}원)`}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Price & Quantity Stepper */}
                                <div className="mt-2.5 flex items-center justify-between">
                                  <span className="text-xs font-black text-[#3182f6]">
                                    {formattedUnitPrice}
                                  </span>

                                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                                    <button
                                      onClick={() => {
                                        vibrate(20);
                                        updateQuantity(item.cartItemId, -1);
                                      }}
                                      className="text-slate-600 hover:text-slate-900 font-bold p-0.5 cursor-pointer border-none"
                                      aria-label="수량 감소"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-xs font-black text-slate-900 min-w-[16px] text-center">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => {
                                        vibrate(20);
                                        updateQuantity(item.cartItemId, 1);
                                      }}
                                      className="text-slate-600 hover:text-slate-900 font-bold p-0.5 cursor-pointer border-none"
                                      aria-label="수량 증가"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Total & Payment Button */}
                      <div className="pt-3 border-t border-slate-100 mt-2 shrink-0 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>총 주문 금액</span>
                          <span className="text-base font-black text-slate-950">
                            {totalCartPrice.toLocaleString()}원
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            vibrate([60, 40, 60]);
                            if (isListening) stopListening();
                            setActiveNavTab('none');
                            placeOrder(orderType);
                          }}
                          className="w-full py-3.5 rounded-2xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-black text-sm shadow-md active:scale-98 transition-all cursor-pointer border-none flex items-center justify-center gap-2 min-h-[50px]"
                        >
                          <ShoppingBag className="w-5 h-5 fill-white text-white" />
                          <span>{totalCartPrice.toLocaleString()}원 결제하기 →</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">장바구니가 비어 있습니다</h4>
                        <p className="text-xs text-slate-400 mt-0.5">맛있는 메뉴를 골라 담아보세요!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 2. AI VOICE (AI 주문) */}
              {activeNavTab === 'ai' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3 my-1">
                  {/* Large Mic / Pause Toggle Button */}
                  <button
                    onClick={toggleAiMic}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border-none ${
                      isListening
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 scale-105'
                        : 'bg-[#3182f6] hover:bg-[#2b70d4] text-white ring-4 ring-blue-100'
                    }`}
                    aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
                  >
                    {isListening ? (
                      <Pause className="w-10 h-10 fill-white text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {isListening
                        ? '말씀을 듣고 있습니다...'
                        : isAiProcessing
                        ? 'AI가 음성을 분석하고 있습니다...'
                        : '탭하여 말씀해보세요'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isListening
                        ? '말씀을 마치고 2.5초간 계시면 자동으로 AI가 처리합니다.'
                        : '"빅맥 세트 하나 담아줘", "결제해줘" 처럼 편하게 말씀해보세요.'}
                    </p>
                  </div>

                  {/* Live Transcript Display */}
                  {transcript && (
                    <div className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 text-center max-w-xs">
                      &ldquo;{transcript}&rdquo;
                    </div>
                  )}

                  {/* AI Response Text Box */}
                  {aiResponseText && (
                    <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1 max-w-xs text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#3182f6]">
                        <Bot className="w-4 h-4" />
                        <span>AI 답변</span>
                      </div>
                      <p className="text-xs text-slate-800 font-bold leading-relaxed whitespace-pre-line">
                        {aiResponseText}
                      </p>
                    </div>
                  )}

                  {micError && (
                    <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">
                      {micError}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      vibrate(40);
                      if (isListening) stopListening();
                      setActiveNavTab('none');
                      setVoiceModalOpen(true);
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs cursor-pointer border-none"
                  >
                    보이스 모드로 변경
                  </button>
                </div>
              )}

            {/* TAB CONTENT: 3. SETTINGS (설정) */}
            {activeNavTab === 'settings' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {/* 1. 쉬운 주문 모드 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#3182f6]/10 border border-[#3182f6]/30">
                  <div>
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <span>쉬운 주문 모드</span>
                      <span className="text-[10px] bg-[#3182f6] text-white px-1.5 py-0.2 rounded font-bold">추천</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">큰 사진과 쉬운 설명 제공</span>
                  </div>
                  <button
                    onClick={() => {
                      vibrate(30);
                      setEasyMode(!easyMode);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer border-none ${
                      easyMode ? 'bg-[#3182f6] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {easyMode ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 2. 글자 크기 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900">글자 크기</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">텍스트 확대</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-xl">
                    {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => {
                          vibrate(20);
                          setFontScale(scale);
                          setFontMultiplier(scale === 'normal' ? 1.0 : scale === 'large' ? 1.25 : 1.5);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border-none ${
                          fontScale === scale ? 'bg-[#3182f6] text-white' : 'text-slate-700 bg-transparent'
                        }`}
                      >
                        {scale === 'normal' ? '보통' : scale === 'large' ? '크게' : '매우크게'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 고대비 테마 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900">고대비 테마</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">명암비 최상으로 설정</span>
                  </div>
                  <button
                    onClick={() => {
                      vibrate(20);
                      setHighContrast(!highContrast);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer border-none ${
                      highContrast ? 'bg-[#3182f6] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {highContrast ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* 4. 움직임 최소화 */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-slate-900">움직임 최소화</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">시각적 애니메이션 최소화</span>
                  </div>
                  <button
                    onClick={() => {
                      vibrate(20);
                      setReduceMotion(!reduceMotion);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer border-none ${
                      reduceMotion ? 'bg-[#3182f6] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {reduceMotion ? 'ON' : 'OFF'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    vibrate([50, 50]);
                    resetAll();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold cursor-pointer border border-slate-200 text-center"
                >
                  기본값으로 초기화
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

      {/* Success Modal */}
      {orderStatus === 'completed' && <SuccessAnimation />}

      {/* Option Select Modal */}
      {selectedProduct && (
        <OptionSelectModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Staff Call Modal */}
      <StaffCallModal
        isOpen={isStaffCallOpen}
        onClose={() => setIsStaffCallOpen(false)}
        tableId={tableId}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal />

      {/* Visual Caption Banner (For hard of hearing: visualCaptionMode) */}
      {visualCaptionMode && visualCaption && (
        <div className="absolute top-20 left-4 right-4 z-50 p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-lg flex items-center justify-center text-center animate-bounce pointer-events-none">
          <span className="text-base font-black text-yellow-400 tracking-tight leading-snug">
            🔊 [안내] {visualCaption}
          </span>
        </div>
      )}

      {/* Global Undo Toasts Container */}
      <div className="absolute bottom-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className="w-full pointer-events-auto bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800 gap-3"
            >
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {toast.message}
              </span>
              {toast.undoCallback && (
                <button
                  onClick={() => {
                    vibrate(40);
                    toast.undoCallback?.();
                    removeToast(toast.id);
                  }}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shrink-0 transition-all border-none"
                >
                  {language === 'ko' ? '되돌리기' : 'Undo'}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Inactivity Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6 max-w-[430px] mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col items-center text-center gap-6 pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center animate-bounce text-rose-500">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'ko' ? '주문 시간이 부족하신가요?' : 'Need More Time?'}
              </h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                {language === 'ko'
                  ? `${warningCountdown}초 후 초기 화면으로 돌아갑니다. 시간이 더 필요하시면 아래 버튼을 눌러주세요.`
                  : `Returning to start in ${warningCountdown}s. If you need more time, tap below.`}
              </p>
            </div>

            <button
              onClick={() => {
                vibrate(40);
                setInactivitySeconds(0);
                setShowTimeoutWarning(false);
                setWarningCountdown(15);
                speak(language === 'ko' ? '주문 시간이 연장되었습니다.' : 'Session extended.', true);
              }}
              className="w-full py-4 rounded-2xl bg-[#3182f6] text-white font-black text-sm shadow-md hover:bg-[#2b70d4] active:scale-95 transition-all border-none cursor-pointer"
            >
              {language === 'ko' ? '시간이 더 필요해요 (연장하기)' : 'I need more time'}
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

