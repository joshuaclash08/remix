'use client';

import React from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { Volume2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SpeechReader() {
  const { speakingText, isSpeaking, stop } = useSpeech();

  return (
    <AnimatePresence>
      {isSpeaking && speakingText && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-4 z-50 max-w-sm w-full bg-slate-900/95 border-2 border-yellow-400 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-slate-100"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 shrink-0">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                TTS 음성 읽기 중
              </span>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-yellow-400 h-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-yellow-400 h-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-yellow-400 h-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
            <p className="text-xs font-semibold leading-snug truncate text-slate-200">{speakingText}</p>
          </div>

          <button
            onClick={stop}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="음성 읽기 정지"
          >
            <Square className="w-4 h-4 fill-current text-rose-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
