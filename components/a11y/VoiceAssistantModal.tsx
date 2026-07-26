'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useSpeech } from '@/hooks/useSpeech';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import { voiceAssistantService } from '@/lib/services';
import { Mic, X, Sparkles, CheckCircle2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export function VoiceAssistantModal() {
  const { isVoiceModalOpen, setVoiceModalOpen, addToCart, clearCart, placeOrder } = useCartStore();
  const { vibrate } = useHaptics();
  const { t } = useTranslation();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedResult, setRecognizedResult] = useState<string | null>(null);

  const PRESET_COMMANDS = [
    '빅맥 단품 1개 담아줘',
    '맥스파이시 상하이 버거 담아줘',
    '1955 버거 추가',
    '장바구니 비워줘',
    '결제해줘',
  ];

  const handleRunCommand = (cmdText: string) => {
    vibrate([40, 40]);
    setIsListening(true);
    setTranscript(cmdText);

    setTimeout(() => {
      setIsListening(false);
      const result = voiceAssistantService.parseVoiceIntent(cmdText);

      if (result.intent === 'add_to_cart' && result.matchedProduct) {
        addToCart(result.matchedProduct, result.matchedOptions || []);
      } else if (result.intent === 'clear_cart') {
        clearCart();
      } else if (result.intent === 'checkout') {
        placeOrder();
      }

      setRecognizedResult(result.feedbackMessage);
      vibrate([100, 50, 100]);
    }, 1200);
  };

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
            className="w-full max-w-[430px] bg-white rounded-t-3xl p-5 shadow-2xl overflow-hidden border-t-4 border-yellow-400 max-h-[88vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-yellow-300 text-slate-950 font-black">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1">
                    {t("AI Voice Order")}
                    <Sparkles className="w-3.5 h-3.5 text-yellow-600 fill-yellow-400" />
                  </h3>
                  <p className="text-[10px] text-slate-500">{t("Order easily using voice without touch")}</p>
                </div>
              </div>
              <button
                onClick={() => setVoiceModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border-none"
                aria-label={t("Close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer */}
            <div className="flex flex-col items-center justify-center py-4 bg-yellow-50/60 rounded-2xl border border-yellow-200 mb-4">
              <button
                onClick={() => handleRunCommand(PRESET_COMMANDS[0])}
                className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all cursor-pointer border-none ${
                  isListening
                    ? 'bg-yellow-400 text-slate-950 shadow-md scale-105'
                    : 'bg-yellow-300 text-slate-950 hover:bg-yellow-400 border-2 border-yellow-400'
                }`}
                aria-label={t("AI Voice Order")}
              >
                <Mic className={`w-7 h-7 ${isListening ? 'animate-bounce' : ''}`} />
              </button>

              <p className="mt-2 text-xs font-black text-slate-800">
                {isListening ? t("Listening voice...") : t("Tap microphone or examples")}
              </p>

              {transcript && (
                <div className="mt-2 px-3 py-1 bg-white rounded-lg border border-yellow-300 text-[11px] font-extrabold text-slate-900">
                  &ldquo;{transcript}&rdquo;
                </div>
              )}

              {recognizedResult && (
                <div className="mt-2 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-lg text-[11px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{recognizedResult}</span>
                </div>
              )}
            </div>

            {/* Commands */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                {t("Voice Command Examples")}
              </span>
              {PRESET_COMMANDS.map((cmdText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunCommand(cmdText)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-yellow-100 border border-slate-200 text-left text-xs font-extrabold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-yellow-600" />
                    <span>&ldquo;{cmdText}&rdquo;</span>
                  </span>
                  <span className="text-[10px] text-slate-950 font-black">{t("Execute")} →</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

