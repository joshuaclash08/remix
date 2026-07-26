'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useTranslation } from '@/hooks/useTranslation';
import { useRealMicrophone } from '@/hooks/useRealMicrophone';
import { voiceAssistantService } from '@/lib/services';
import { Mic, X, Plus, Volume2, Bot, AlertCircle, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/types';

interface PendingConfirmation {
  product: Product;
  options: { groupTitle: string; optionName: string; price: number }[];
  questionText: string;
}

export function VoiceAssistantModal() {
  const { isVoiceModalOpen, setVoiceModalOpen, addToCart, clearCart, placeOrder } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { t } = useTranslation();

  const { isListening, transcript, error: micError, startListening, stopListening } = useRealMicrophone();
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponseText, setAiResponseText] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  // AI Order Confirmation Step State
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);

  const handleProcessResult = (result: any) => {
    if (result.intent === 'add_to_cart' && result.matchedProduct) {
      // Trigger confirmation step instead of silent addition
      setPendingConfirmation({
        product: result.matchedProduct,
        options: result.matchedOptions || [],
        questionText: `"${result.matchedProduct.name}" 메뉴가 맞나요?`,
      });
      speak(`"${result.matchedProduct.name}" 메뉴가 맞으시면 '네, 맞아요' 버튼을 눌러 주세요.`, true);
    } else if (result.intent === 'clear_cart') {
      clearCart();
      setAiResponseText(result.aiResponseText || result.feedbackMessage);
    } else if (result.intent === 'checkout') {
      placeOrder();
      setAiResponseText(result.aiResponseText || result.feedbackMessage);
    } else {
      setAiResponseText(result.aiResponseText || result.feedbackMessage);
      setRecommendedProducts(result.recommendedProducts || []);
    }
  };

  const handleConfirmOrder = () => {
    if (!pendingConfirmation) return;
    vibrate([80, 40, 80]);
    addToCart(pendingConfirmation.product, pendingConfirmation.options);
    setAiResponseText(`"${pendingConfirmation.product.name}"를 장바구니에 담았습니다!`);
    speak(`"${pendingConfirmation.product.name}"를 장바구니에 담았습니다.`, true);
    setPendingConfirmation(null);
  };

  const handleCancelConfirmation = () => {
    vibrate(40);
    setPendingConfirmation(null);
    setAiResponseText('음성 주문을 취소했습니다. 마이크를 누르고 다시 말씀해 주세요.');
    speak('다시 말씀해 주세요.', true);
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    vibrate(40);
    setIsProcessing(true);
    setLiveTranscript(queryText);
    setPendingConfirmation(null);

    try {
      const result = await voiceAssistantService.parseVoiceIntentWithGroq(queryText);
      setIsProcessing(false);
      handleProcessResult(result);
      vibrate([100, 50, 100]);
    } catch (err) {
      setIsProcessing(false);
      setAiResponseText('음성 처리 중 오류가 발생했습니다. 다시 말씀해 주세요.');
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob, textFallback?: string) => {
    vibrate(40);
    setIsProcessing(true);
    setPendingConfirmation(null);

    try {
      const result = await voiceAssistantService.parseVoiceAudioWithGroq(audioBlob, textFallback || '');
      setIsProcessing(false);

      if (result.spokenText) {
        setLiveTranscript(result.spokenText);
      }

      handleProcessResult(result);
      vibrate([100, 50, 100]);
    } catch (err) {
      setIsProcessing(false);
      setAiResponseText('음성 처리 중 오류가 발생했습니다. 다시 말씀해 주세요.');
    }
  };

  const handleToggleMic = () => {
    vibrate(40);
    if (isListening) {
      stopListening();
    } else {
      setAiResponseText(null);
      setRecommendedProducts([]);
      setLiveTranscript('');
      setPendingConfirmation(null);
      startListening((audioBlob, liveText) => {
        handleAudioRecorded(audioBlob, liveText);
      });
    }
  };

  const PRESET_QUERIES = [
    '1955 버거는 어떤 재료가 들어가?',
    '매운 버거 메뉴 추천해줘',
    '빅맥 1개 장바구니에 담아줘',
    '디저트로 먹기 좋은 메뉴 추천',
  ];

  return (
    <AnimatePresence>
      {isVoiceModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-auto"
          onClick={() => setVoiceModalOpen(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden border-t border-slate-100 max-h-[88vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
                  <Mic className="w-4 h-4 text-[#3182f6]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{t("AI 음성 주문 & 메뉴 추천")}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">마이크를 누르고 궁금한 점이나 메뉴를 말해 보세요</p>
                </div>
              </div>
              <button
                onClick={() => setVoiceModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center min-h-[36px] min-w-[36px]"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 mb-2">
              {/* Mic Section */}
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <button
                  onClick={handleToggleMic}
                  className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all cursor-pointer border-none shadow-md ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100 scale-105'
                      : 'bg-[#3182f6] text-white hover:bg-[#2b70d4] active:scale-95'
                  }`}
                  aria-label="마이크 버튼"
                >
                  <Mic className={`w-8 h-8 ${isListening ? 'animate-bounce' : ''}`} />
                </button>

                <p className="mt-3 text-xs font-black text-slate-800">
                  {isListening
                    ? '말씀해 주세요... (듣고 있습니다)'
                    : isProcessing
                    ? 'AI가 음성을 분석하고 있습니다...'
                    : '마이크 버튼을 눌러 말씀하세요'}
                </p>

                {/* Live Transcript Display */}
                {(liveTranscript || transcript) && (
                  <div className="mt-2.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 shadow-2xs text-center max-w-xs">
                    &ldquo;{liveTranscript || transcript}&rdquo;
                  </div>
                )}

                {micError && (
                  <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{micError}</span>
                  </div>
                )}
              </div>

              {/* AI Order Confirmation Step Card (확인 단계) */}
              {pendingConfirmation && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>주문 확인</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center gap-3">
                    <img
                      src={pendingConfirmation.product.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{pendingConfirmation.product.name}</h4>
                      <span className="text-xs font-extrabold text-[#3182f6]">
                        ₩{pendingConfirmation.product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-black text-amber-950 text-center">
                    이 메뉴가 맞으시면 아래 버튼을 눌러주세요!
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConfirmOrder}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm cursor-pointer border-none flex items-center justify-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>네, 맞아요 (담기)</span>
                    </button>

                    <button
                      onClick={handleCancelConfirmation}
                      className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs cursor-pointer border-none active:scale-95"
                    >
                      <span>다시 말할게요</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Response Text Box */}
              {aiResponseText && !pendingConfirmation && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#3182f6]">
                    <Bot className="w-4 h-4" />
                    <span>AI 답변</span>
                  </div>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed whitespace-pre-line">
                    {aiResponseText}
                  </p>
                </div>
              )}

              {/* Recommended Menu Cards */}
              {recommendedProducts.length > 0 && !pendingConfirmation && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-900 block">
                    추천 메뉴 ({recommendedProducts.length}개)
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#3182f6] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                            <span className="text-xs font-extrabold text-[#3182f6] block">
                              ₩{prod.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            vibrate([60, 40, 60]);
                            setPendingConfirmation({
                              product: prod,
                              options: [],
                              questionText: `"${prod.name}" 메뉴가 맞나요?`,
                            });
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#3182f6] hover:bg-[#2b70d4] text-white font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer border-none shrink-0 min-h-[38px]"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>담기</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Query Pills */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  추천 질문 예시
                </span>
                <div className="flex flex-col gap-1.5">
                  {PRESET_QUERIES.map((qText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleProcessQuery(qText)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-[#3182f6]" />
                        <span>&ldquo;{qText}&rdquo;</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">질문하기 →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
