'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { MobileDeviceContainer } from '@/components/layout/MobileDeviceContainer';
import { LoadingScreen } from '@/components/steps/LoadingScreen';
import { SimpleKiosk } from '@/components/kiosk/SimpleKiosk';

import { useSyncAccessibilityTheme } from '@/hooks/useSyncAccessibilityTheme';

export default function KioskApp() {
  const router = useRouter();
  const { loadSettingsFromCookie, resetAll } = useAccessibilityStore();

  useReducedMotion();
  useSyncAccessibilityTheme();

  const [isInitializing, setIsInitializing] = useState(true);
  const [showKioskLoading, setShowKioskLoading] = useState(false);


  // Check cookie on mount
  useEffect(() => {
    const loaded = loadSettingsFromCookie();
    if (!loaded) {
      // If no cookie settings, go directly to /setup without prototype loading
      router.push('/setup');
    } else {
      // If cookie exists, show prototype loading for menu page
      setTimeout(() => {
        setShowKioskLoading(true);
        setIsInitializing(false);
      }, 0);
    }
  }, [loadSettingsFromCookie, router]);

  const handleResetToSetup = () => {
    resetAll();
    router.push('/setup');
  };

  if (isInitializing) {
    return (
      <MobileDeviceContainer>
        <div className="w-full min-h-screen flex-1 bg-slate-50" />
      </MobileDeviceContainer>
    );
  }

  return (
    <MobileDeviceContainer>
      <div className="relative w-full min-h-screen flex-1 flex flex-col overflow-hidden bg-slate-50">
        <main className="flex-1 w-full flex flex-col overflow-hidden bg-slate-50 relative">
          <AnimatePresence mode="popLayout">
            {/* Prototype Loading Notice for Menu Screen */}
            {showKioskLoading ? (
              <LoadingScreen key="loading" onLoadingComplete={() => setShowKioskLoading(false)} />
            ) : (
              <React.Suspense fallback={<div className="flex-1 w-full bg-slate-50" />}>
                <SimpleKiosk key="kiosk" onResetToStep1={handleResetToSetup} />
              </React.Suspense>
            )}
          </AnimatePresence>
        </main>
      </div>
    </MobileDeviceContainer>
  );
}
