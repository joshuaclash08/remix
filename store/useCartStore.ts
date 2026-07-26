import { create } from 'zustand';
import type { Product, CartItem, StoreInfo, OrderStatus, OrderReceipt } from '@/lib/types';
import { orderService } from '@/lib/services';

interface ToastItem {
  id: string;
  message: string;
  undoCallback?: () => void;
}

interface CartState {
  storeInfo: StoreInfo;
  items: CartItem[];
  isVoiceModalOpen: boolean;
  isQrModalOpen: boolean;
  isCartDrawerExpanded: boolean;
  orderStatus: OrderStatus;
  lastOrderNumber: string | null;
  lastReceipt: OrderReceipt | null;

  // New accessibility feedback states
  toasts: ToastItem[];
  visualCaption: string | null;
  cartHistory: CartItem[][];

  // Actions
  setStoreInfo: (info: StoreInfo) => void;
  addToCart: (
    product: Product,
    selectedOptions?: { groupTitle: string; optionName: string; price: number }[]
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  setVoiceModalOpen: (open: boolean) => void;
  setQrModalOpen: (open: boolean) => void;
  setCartDrawerExpanded: (expanded: boolean) => void;
  toggleCartDrawer: () => void;
  placeOrder: (orderType?: 'takeout' | 'table') => Promise<void>;
  resetOrder: () => void;

  // New feedback & undo actions
  addToast: (message: string, undoCallback?: () => void) => void;
  removeToast: (id: string) => void;
  setVisualCaption: (caption: string | null) => void;
  pushHistory: () => void;
  undoLastAction: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeInfo: {
    id: 'mcd-gangnam',
    name: '맥도날드 강남점',
    table: '03번 테이블',
    nfcTagId: 'NFC-MCD-GN03',
  },
  items: [
    {
      cartItemId: 'init-1',
      product: {
        id: 'prod-01',
        name: '시그니처 배리어프리 라떼',
        englishName: 'Signature Barrier-Free Latte',
        price: 5500,
        category: 'coffee',
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
        description: '고소한 락토프리 속편한 우유와 아라비카 원두의 부드러운 만남',
        voiceDescription: '시그니처 배리어프리 라떼 5,500원',
      },
      quantity: 1,
      selectedOptions: [
        { groupTitle: '온도 선택', optionName: 'ICE (시원하게)', price: 0 },
        { groupTitle: '우유 변경', optionName: '락토프리 우유 (기본)', price: 0 },
      ],
      totalItemPrice: 5500,
    },
  ],
  isVoiceModalOpen: false,
  isQrModalOpen: false,
  isCartDrawerExpanded: false,
  orderStatus: 'idle',
  lastOrderNumber: null,
  lastReceipt: null,

  toasts: [],
  visualCaption: null,
  cartHistory: [],

  setStoreInfo: (storeInfo) => set({ storeInfo }),

  addToCart: (product, selectedOptions = []) => {
    // 1. Push history first
    get().pushHistory();

    const extraPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    const itemPrice = product.price + extraPrice;
    const cartItemId = `${product.id}-${selectedOptions.map((o) => o.optionName).join('-') || 'default'}`;

    const existingIndex = get().items.findIndex((item) => item.cartItemId === cartItemId);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...get().items];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [
        ...get().items,
        {
          cartItemId,
          product,
          quantity: 1,
          selectedOptions,
          totalItemPrice: itemPrice,
        },
      ];
    }
    set({ items: updated });

    // 2. Trigger feedback via dynamic import (breaks circular dependency)
    import('@/lib/services/A11yFeedbackService').then(({ emitActionFeedback }) => {
      emitActionFeedback(
        'add',
        `장바구니에 ${product.name}이(가) 추가되었습니다.`,
        `${product.name} added to cart.`,
        () => get().undoLastAction()
      );
    });
  },

  removeFromCart: (cartItemId) => {
    const itemToRemove = get().items.find((item) => item.cartItemId === cartItemId);
    if (!itemToRemove) return;

    // 1. Push history first
    get().pushHistory();

    set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) });

    // 2. Trigger feedback
    import('@/lib/services/A11yFeedbackService').then(({ emitActionFeedback }) => {
      emitActionFeedback(
        'remove',
        `장바구니에서 ${itemToRemove.product.name}이(가) 삭제되었습니다.`,
        `${itemToRemove.product.name} removed from cart.`,
        () => get().undoLastAction()
      );
    });
  },

  updateQuantity: (cartItemId, delta) => {
    const targetItem = get().items.find((item) => item.cartItemId === cartItemId);
    if (!targetItem) return;

    // 1. Push history first
    get().pushHistory();

    const items = get().items
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    set({ items });

    // 2. Trigger feedback
    import('@/lib/services/A11yFeedbackService').then(({ emitActionFeedback }) => {
      const msgKo = delta > 0 
        ? `${targetItem.product.name} 수량이 증가했습니다.` 
        : `${targetItem.product.name} 수량이 감소했습니다.`;
      const msgEn = delta > 0 
        ? `${targetItem.product.name} quantity increased.` 
        : `${targetItem.product.name} quantity decreased.`;
      
      emitActionFeedback(
        delta > 0 ? 'add' : 'remove',
        msgKo,
        msgEn,
        () => get().undoLastAction()
      );
    });
  },

  clearCart: () => {
    get().pushHistory();
    set({ items: [] });
    import('@/lib/services/A11yFeedbackService').then(({ emitActionFeedback }) => {
      emitActionFeedback(
        'remove',
        '장바구니를 완전히 비웠습니다.',
        'Cleared the cart.',
        () => get().undoLastAction()
      );
    });
  },

  setVoiceModalOpen: (open) => set({ isVoiceModalOpen: open }),
  setQrModalOpen: (open) => set({ isQrModalOpen: open }),
  setCartDrawerExpanded: (expanded) => set({ isCartDrawerExpanded: expanded }),
  toggleCartDrawer: () => set({ isCartDrawerExpanded: !get().isCartDrawerExpanded }),

  placeOrder: async (orderType: 'takeout' | 'table' = 'table') => {
    set({ orderStatus: 'processing' });
    const receipt = await orderService.submitOrder(get().storeInfo, orderType, get().items);
    set({
      orderStatus: 'completed',
      lastOrderNumber: receipt.orderNumber,
      lastReceipt: receipt,
    });
  },

  resetOrder: () => {
    set({
      orderStatus: 'idle',
      items: [],
      lastOrderNumber: null,
      lastReceipt: null,
      toasts: [],
      visualCaption: null,
      cartHistory: [],
    });
  },

  // Toast & undo helper actions
  addToast: (message, undoCallback) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, undoCallback };
    set({ toasts: [...get().toasts, newToast] });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  setVisualCaption: (visualCaption) => {
    set({ visualCaption });
    if (visualCaption) {
      // Clear visual caption banner after 4.5 seconds
      setTimeout(() => {
        if (get().visualCaption === visualCaption) {
          set({ visualCaption: null });
        }
      }, 4500);
    }
  },

  pushHistory: () => {
    // Limit history stack size to 5 for efficiency
    const newHistory = [...get().cartHistory, [...get().items]].slice(-5);
    set({ cartHistory: newHistory });
  },

  undoLastAction: () => {
    const history = get().cartHistory;
    if (history.length === 0) return;

    const previousItems = history[history.length - 1];
    set({
      items: previousItems,
      cartHistory: history.slice(0, -1),
    });

    // Speak or vibrate feedback on successful undo
    import('@/lib/services/A11yFeedbackService').then(({ emitActionFeedback }) => {
      emitActionFeedback(
        'add',
        '이전 작업이 취소(되돌리기)되었습니다.',
        'Previous action undone.'
      );
    });
  },
}));
