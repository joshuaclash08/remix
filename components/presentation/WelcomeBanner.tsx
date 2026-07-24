'use client';

import React, { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { ShieldCheck, MapPin, Store } from 'lucide-react';
import gsap from 'gsap';

export function WelcomeBanner() {
  const { storeInfo } = useCartStore();
  const reduceMotion = useAccessibilityStore((state) => state.reduceMotion);

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion || !bannerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(bannerRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }, bannerRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div ref={bannerRef} className="w-full mb-4">
      <div className="rounded-2xl bg-yellow-300 border-2 border-yellow-400 p-4 shadow-sm text-slate-950">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 text-yellow-300 font-extrabold text-[10px]">
            <ShieldCheck className="w-3 h-3 text-yellow-300" />
            <span>NFC/QR 스마트 태그</span>
          </span>
          <span className="text-[10px] font-bold text-slate-800">
            {storeInfo.nfcTagId}
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
          {storeInfo.name}
        </h2>

        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-900 mt-1">
          <MapPin className="w-3.5 h-3.5 fill-slate-950 text-yellow-300" />
          <span>현재 테이블: {storeInfo.table}</span>
        </div>
      </div>
    </div>
  );
}
