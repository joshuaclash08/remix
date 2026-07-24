'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { useSpeech } from '@/hooks/useSpeech';
import { useHaptics } from '@/hooks/useHaptics';
import { Mic, X, Sparkles, CheckCircle2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceAssistantModal() {
  const { isVoiceModalOpen, setVoiceModalOpen, addToCart } = useCartStore();
  const { speak } = useSpeech();
  const { vibrate } = useHaptics();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognizedResult, setRecognizedResult] = useState<string | null>(null);

  const PRESET_COMMANDS = [
    {
      text: '시그니처 라떼 ICE 1잔 담아줘',
      action: () => {
        const prod = MOCK_PRODUCTS.find((p) => p.id === 'prod-01')!;
        addToCart(prod, [
          { groupTitle: '온도 선택', optionName: 'ICE (시원하게)', price: 0 },
          { groupTitle: '우유 변경', optionName: '락토프리 우유 (기본)', price: 0 },
        ]);
        return '시그니처 라떼 아이스가 담겼습니다.';
      },
    },
    {
      text: '아이스 아메리카노 2잔 추가',
      action: () => {
        const prod = MOCK_PRODUCTS.find((p) => p.id === 'prod-02')!;
        addToCart(prod, [{ groupTitle: '농도 선택', optionName: '보통 (2샷)', price: 0 }]);
        addToCart(prod, [{ groupTitle: '농도 선택', optionName: '보통 (2샷)', price: 0 }]);
        return '아이스 아메리카노 2잔이 담겼습니다.';
      },
    },
    {
      text: '글루텐프리 쌀 롤케이크 담아줘',
      action: () => {
        const prod = MOCK_PRODUCTS.find((p) => p.id === 'prod-06')!;
        addToCart(prod, []);
        return '쌀 롤케이크가 장바구니에 담겼습니다.';
      },
    },
  ];

  const handleRunCommand = (cmdText: string, actionFn: () => string) => {
    vibrate([40, 40]);
    setIsListening(true);
    setTranscript(cmdText);

    setTimeout(() => {
      setIsListening(false);
      const resMsg = actionFn();
      setRecognizedResult(resMsg);
      speak(resMsg, true);
      vibrate([100, 50, 100]);
    }, 1200);
  };

  if (!isVoiceModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full bg-white border-4 border-yellow-400 rounded-3xl p-5 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-yellow-300 text-slate-950 font-black">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1">
                  AI 음성 주문
                  <Sparkles className="w-3.5 h-3.5 text-yellow-600 fill-yellow-400" />
                </h3>
                <p className="text-[10px] text-slate-500">터치 없이 음성으로 쉽게 주문하세요</p>
              </div>
            </div>
            <button
              onClick={() => setVoiceModalOpen(false)}
              className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visualizer */}
          <div className="flex flex-col items-center justify-center py-4 bg-yellow-50/60 rounded-2xl border border-yellow-200 mb-4">
            <button
              onClick={() => handleRunCommand(PRESET_COMMANDS[0].text, PRESET_COMMANDS[0].action)}
              className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all cursor-pointer ${
                isListening
                  ? 'bg-yellow-400 text-slate-950 shadow-md scale-105'
                  : 'bg-yellow-300 text-slate-950 hover:bg-yellow-400 border-2 border-yellow-400'
              }`}
            >
              <Mic className={`w-7 h-7 ${isListening ? 'animate-bounce' : ''}`} />
            </button>

            <p className="mt-2 text-xs font-black text-slate-800">
              {isListening ? '음성을 인지하는 중...' : '마이크 또는 예시를 누르세요'}
            </p>

            {transcript && (
              <div className="mt-2 px-3 py-1 bg-white rounded-lg border border-yellow-300 text-[11px] font-extrabold text-slate-900">
                "{transcript}"
              </div>
            )}

            {recognizedResult && (
              <div className="mt-2 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-lg text-[11px] font-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{recognizedResult}</span>
              </div>
            )}
          </div>

          {/* Commands */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              음성 명령 시연 예시
            </span>
            {PRESET_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => handleRunCommand(cmd.text, cmd.action)}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-yellow-100 border border-slate-200 text-left text-xs font-extrabold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-600" />
                  <span>"{cmd.text}"</span>
                </span>
                <span className="text-[10px] text-slate-950 font-black">실행 →</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
