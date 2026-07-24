'use client';

import React from 'react';
import { X, Smartphone, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function PresentationGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full bg-white border-4 border-yellow-400 rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[90%]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-yellow-300 text-slate-950 font-black">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">시연 & 기술 가이드</h3>
                <p className="text-[10px] text-yellow-600 font-extrabold">모바일/폴더폰 전용 PWA · Bun 사용</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-slate-800 text-xs">
            {/* Box 1 */}
            <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 space-y-1">
              <h4 className="font-black text-slate-950 text-xs flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-yellow-600" />
                1. 폰 & 폴더폰 전용 View
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                넓은 데스크톱 화면 접속 시 주변이 여백(Blank) 처리되며, 중앙 390~430px 전용 폰 프레임에서만 작동합니다.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-black text-slate-950 text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                2. GSAP & Motion.dev 적용
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                카테고리 스프링 탭, 카드 모션, GSAP 완료 축하 애니메이션 적용. <b>모션감소</b> 선택 시 전정기관 보호를 위해 즉시 컷 전환됩니다.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-black text-slate-950 text-xs flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-yellow-600" />
                3. Expo(React Native) 100% 이식성
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                <code>useHaptics</code>, <code>useSpeech</code>, <code>useSensors</code> 하드웨어 추상화 훅 적용으로 네이티브 앱 전환 시 100% 이식 가능합니다.
              </p>
            </div>

            {/* Box 4 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="font-black text-slate-950 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                4. 순백색 테마 + 밝은 노란색 포인트
              </h4>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                WCAG AA 명도 대비 준수 및 휠체어/하단 터치(88px) 지원.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-yellow-300 hover:bg-yellow-400 border border-yellow-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
            >
              시연 시작하기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
