"use client";

import React, { useState, useEffect } from "react";
import { storeService } from "@/lib/services";
import { useHaptics } from "@/hooks/useHaptics";
import { useSpeech } from "@/hooks/useSpeech";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/hooks/useTranslation";
import { MapPin, ChevronRight, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Store } from "@/lib/types";

interface Props {
  onResetToStep1: () => void;
  onStoreSelected: (store: Store) => void;
  onSimulateQr: () => void;
  onSimulateNfc: () => void;
}

export function StoreSelectStep({
  onResetToStep1,
  onStoreSelected,
  onSimulateQr,
  onSimulateNfc,
}: Props) {
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const { highContrast, reduceMotion, dyslexiaMode } = useAccessibilityStore();
  const { t } = useTranslation();

  const [isManualStoreListOpen, setIsManualStoreListOpen] = useState(false);
  const [scanAnimMode, setScanAnimMode] = useState<"nfc" | "qr">("nfc");

  const sortedStores = storeService.getNearbyStores();

  useEffect(() => {
    const interval = setInterval(() => {
      setScanAnimMode((prev) => (prev === "nfc" ? "qr" : "nfc"));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
    return `${m}m`;
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      key="store_select"
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className={`flex-1 w-full h-full flex flex-col justify-between p-5 pt-6 pb-6 overflow-y-auto ${
        dyslexiaMode ? "font-dyslexia" : ""
      }`}
      role="region"
      aria-label={t("QR and NFC Waiting Screen")}
    >
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-start relative pt-12 pb-4">
        {/* Top Control Bar */}
        <div className="absolute top-2 left-0 right-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSimulateQr}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
              aria-label="QR Test"
            >
              qr
            </button>
            <button
              onClick={onSimulateNfc}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
              aria-label="NFC Test"
            >
              nfc
            </button>
          </div>

          <button
            onClick={onResetToStep1}
            className="h-9 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all focus:ring-4 focus:ring-slate-300/30"
            aria-label={t("Reset Accessibility")}
          >
            {t("Reset Accessibility")}
          </button>
        </div>

        {/* Main Scan Guide Card & Area */}
        <div className="text-center flex flex-col items-center pt-6 pb-4">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {t("Table Scan Order")}
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            {t("QR Scan or NFC Contact")}
          </p>

          {/* Alternating NFC & QR Pictogram */}
          <div className="relative w-40 h-40 mt-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {scanAnimMode === "nfc" ? (
                <motion.div
                  key="nfc-anim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  <svg
                    className="w-28 h-28 text-slate-800"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.g
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: 0,
                        duration: 2.2,
                        ease: "easeInOut",
                      }}
                    >
                      <rect
                        x="15"
                        y="11"
                        width="18"
                        height="28"
                        rx="3.5"
                        fill="white"
                        strokeWidth="2.2"
                      />
                      <rect
                        x="20.5"
                        y="14.2"
                        width="7"
                        height="2.2"
                        rx="1.1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </motion.g>
                  </svg>
                </motion.div>
              ) : (
                <motion.div
                  key="qr-anim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  <svg
                    className="w-28 h-28 text-slate-800"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.g
                      animate={{ scale: [1, 0.82, 1.03, 1] }}
                      transition={{
                        duration: 0.45,
                        ease: "easeInOut",
                        times: [0, 0.35, 0.7, 1],
                      }}
                    >
                      <rect x="10" y="10" width="11" height="11" rx="1.5" />
                      <rect
                        x="12.5"
                        y="12.5"
                        width="6"
                        height="6"
                        rx="0.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <rect x="27" y="10" width="11" height="11" rx="1.5" />
                      <rect
                        x="29.5"
                        y="12.5"
                        width="6"
                        height="6"
                        rx="0.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <rect x="10" y="27" width="11" height="11" rx="1.5" />
                      <rect
                        x="12.5"
                        y="29.5"
                        width="6"
                        height="6"
                        rx="0.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <rect
                        x="29.5"
                        y="29.5"
                        width="6"
                        height="6"
                        rx="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </motion.g>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Manual Store Selector Toggler */}
        <div className="mt-1 text-center w-full">
          <button
            onClick={() => {
              vibrate(20);
              setIsManualStoreListOpen(!isManualStoreListOpen);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-[#3182f6] bg-slate-100/90 hover:bg-blue-50 border border-slate-200/80 cursor-pointer py-2 px-4 rounded-full transition-all shadow-2xs active:scale-95"
            aria-expanded={isManualStoreListOpen}
            aria-label={t("Or select store manually")}
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-600" />
            <span>{t("Or select store manually")}</span>
          </button>

          {/* Collapsible Manual Store List */}
          <AnimatePresence>
            {isManualStoreListOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 text-left space-y-2.5 w-full"
              >
                {sortedStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      vibrate([40, 40]);
                      onStoreSelected(store);
                    }}
                    className={`w-full flex min-h-[76px] rounded-2xl bg-white hover:border-[#3182f6] hover:bg-blue-50/20 transition-all items-center justify-between px-6 py-4 cursor-pointer shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-400/20 ${
                      highContrast
                        ? "border-2 border-slate-900 text-black"
                        : "border border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <MapPin className="w-8 h-8 text-blue-600 shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="text-base font-black tracking-tight text-slate-900">
                          {t(store.name)}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold mt-0.5">
                          {t(store.address)} ({t(store.table)})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-[#3182f6]">
                        {formatDistance(store.distanceM)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

