'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSpeech } from '@/hooks/useSpeech';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { storeService } from '@/lib/services';
import { StoreSelectStep } from '@/components/kiosk/StoreSelectStep';
import { OrderTypeStep } from '@/components/kiosk/OrderTypeStep';
import { MenuCatalogStep } from '@/components/kiosk/MenuCatalogStep';
import type { Store, KioskStep, OrderType } from '@/lib/types';

interface Props {
  onResetToStep1: () => void;
}

export function SimpleKiosk({ onResetToStep1 }: Props) {
  const { clearCart, setStoreInfo } = useCartStore();
  const { vibrate } = useHaptics();
  const { speak } = useSpeech();
  const searchParams = useSearchParams();

  // Kiosk Flow States
  const [kioskStep, setKioskStep] = useState<KioskStep>('store_select');
  const [activeStore, setActiveStore] = useState<Store>(storeService.getNearbyStores()[0]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('table');

  // URL query parameters parsing via StoreService
  const storeParam = searchParams?.get('store');
  const tableParam = searchParams?.get('table');

  useEffect(() => {
    if (storeParam) {
      const parsedInfo = storeService.parseTagUrl(storeParam, tableParam);
      if (parsedInfo) {
        const store = storeService.getStoreById(parsedInfo.id);
        if (store) {
          setTimeout(() => {
            setActiveStore(store);
            setTableId(parsedInfo.table);
            setStoreInfo(parsedInfo);
            setKioskStep('order_type_select');
          }, 0);
        }
      }
    }
  }, [storeParam, tableParam, setStoreInfo]);

  // Voice announcements on step transitions
  useEffect(() => {
    if (kioskStep === 'store_select') {
      speak('매장 테이블의 QR 코드를 스캔하거나 휴대폰을 NFC 태그에 대주세요. 또는 수동으로 매장을 직접 고르실 수 있습니다.', true);
    } else if (kioskStep === 'order_type_select') {
      const tableInfo = tableId ? `식별된 테이블은 ${tableId}번입니다.` : '식별된 테이블 정보가 없습니다.';
      speak(`주문 방식 선택 화면입니다. ${tableInfo} 테이블 주문 또는 포장 중 원하는 형태를 탭해 주세요.`, true);
    } else if (kioskStep === 'menu') {
      const orderTypeKo = orderType === 'table' ? `${tableId}번 테이블 주문` : '포장 주문';
      speak(`${activeStore.name} ${orderTypeKo} 메뉴판 화면입니다. 화면 상단에는 현재 탐색 경로가 표시됩니다.`, true);
    }
  }, [kioskStep, activeStore, speak, tableId, orderType]);

  const handleSimulateQrScan = () => {
    vibrate([40, 40]);
    window.history.pushState({}, '', '/?store=mcd-gangnam&table=03');
    const store = storeService.getStoreById('mcd-gangnam')!;
    setActiveStore(store);
    setTableId('03');
    setStoreInfo({ id: store.id, name: store.name, table: '03번 테이블', nfcTagId: store.nfcTagId });
    clearCart();
    setKioskStep('order_type_select');
    speak('강남점 03번 테이블 QR 코드를 성공적으로 스캔했습니다.', true);
  };

  const handleSimulateNfcTap = () => {
    vibrate([40, 40]);
    window.history.pushState({}, '', '/?store=mcd-sinchon&table=05');
    const store = storeService.getStoreById('mcd-sinchon')!;
    setActiveStore(store);
    setTableId('05');
    setStoreInfo({ id: store.id, name: store.name, table: '05번 테이블', nfcTagId: store.nfcTagId });
    clearCart();
    setKioskStep('order_type_select');
    speak('신촌점 05번 테이블 NFC 스티커 태그를 성공적으로 스캔했습니다.', true);
  };

  const handleManualStoreSelect = (store: Store) => {
    vibrate([40, 40]);
    setActiveStore(store);
    setTableId(null);
    setStoreInfo({ id: store.id, name: store.name, table: store.table, nfcTagId: store.nfcTagId });
    clearCart();
    window.history.pushState({}, '', '/');
    setKioskStep('order_type_select');
    speak(`${store.name}가 선택되었습니다. 주문 방식을 설정해 주세요.`, true);
  };

  const handleOrderTypeChosen = (chosenType: OrderType, confirmedTableId?: string) => {
    vibrate([40, 40]);
    const finalTableId = confirmedTableId || tableId || '01';
    setOrderType(chosenType);
    setTableId(finalTableId);
    setStoreInfo({
      id: activeStore.id,
      name: activeStore.name,
      table: `${finalTableId}번 테이블`,
      nfcTagId: activeStore.nfcTagId,
    });
    setKioskStep('menu');
    speak(
      chosenType === 'table'
        ? `${finalTableId}번 테이블 주문으로 이동합니다.`
        : '포장 주문으로 메뉴판에 진입합니다.',
      true
    );
  };

  const handleResetKioskFlow = () => {
    vibrate(30);
    setKioskStep('store_select');
    setTableId(null);
    clearCart();
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-50 text-slate-950 select-none relative overflow-hidden absolute inset-0">
      <AnimatePresence mode="wait">
        {kioskStep === 'store_select' && (
          <StoreSelectStep
            onResetToStep1={onResetToStep1}
            onStoreSelected={handleManualStoreSelect}
            onSimulateQr={handleSimulateQrScan}
            onSimulateNfc={handleSimulateNfcTap}
          />
        )}

        {kioskStep === 'order_type_select' && (
          <OrderTypeStep
            activeStore={activeStore}
            tableId={tableId}
            onBackToStoreSelect={handleResetKioskFlow}
            onOrderTypeChosen={handleOrderTypeChosen}
          />
        )}

        {kioskStep === 'menu' && (
          <MenuCatalogStep
            activeStore={activeStore}
            tableId={tableId}
            orderType={orderType}
            onResetKioskFlow={handleResetKioskFlow}
            onSelectOrderType={() => setKioskStep('order_type_select')}
            onResetToStep1={onResetToStep1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
