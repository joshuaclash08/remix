'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { QrCode, X, Radio, CheckCircle, Store, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StoreQrModal() {
  const { isQrModalOpen, setQrModalOpen, storeInfo, setStoreInfo } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();

  const STORES = [
    {
      id: 'gangnam-01',
      name: '스마트 카페 강남점 (배리어프리)',
      table: '04번 테이블',
      nfcTagId: 'NFC-TAG-8829',
    },
    {
      id: 'seongsu-12',
      name: '배리어프리 성수 플래그십',
      table: '12번 리셉션 테이블',
      nfcTagId: 'NFC-TAG-4910',
    },
    {
      id: 'hongdae-07',
      name: '스마트 셀프오더 홍대점',
      table: '07번 테라스 테이블',
      nfcTagId: 'NFC-TAG-1022',
    },
  ];

  const handleSelectStore = (store: (typeof STORES)[0]) => {
    vibrate([80, 50, 80]);
    setStoreInfo(store);
    speak(`${store.name} ${store.table} 접속됨.`, true);
    setQrModalOpen(false);
  };

  if (!isQrModalOpen) return null;

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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-yellow-300 text-slate-950 font-black">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">QR / NFC 태그 접속 시뮬레이터</h3>
                <p className="text-[10px] text-slate-500">테이블 QR/NFC 태깅 시 즉시 실행되는 모드</p>
              </div>
            </div>
            <button
              onClick={() => setQrModalOpen(false)}
              className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Graphic */}
          <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200 mb-3">
            <div className="w-20 h-20 border-2 border-dashed border-yellow-400 rounded-xl flex items-center justify-center relative">
              <Smartphone className="w-8 h-8 text-yellow-600" />
            </div>
            <span className="mt-2 text-[11px] font-black text-slate-900 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
              <span>PWA 모바일 자동 연결 중</span>
            </span>
          </div>

          {/* List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              데모 매장 선택
            </span>
            {STORES.map((s) => {
              const isSelected = storeInfo.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStore(s)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-300 border-yellow-400 text-slate-950 font-black'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black">{s.name}</h4>
                      <p className="text-[10px] text-slate-600 mt-0.5">{s.table}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-slate-950 shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
