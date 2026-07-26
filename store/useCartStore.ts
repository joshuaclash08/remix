import { create } from 'zustand';
import type { Product, CartItem, StoreInfo, OrderStatus, OrderReceipt } from '@/lib/types';
import { orderService } from '@/lib/services';

interface CartState {
  storeInfo: StoreInfo;
  items: CartItem[];
  isVoiceModalOpen: boolean;
  isQrModalOpen: boolean;
  isCartDrawerExpanded: boolean;
  orderStatus: OrderStatus;
  lastOrderNumber: string | null;
  lastReceipt: OrderReceipt | null;

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

  setStoreInfo: (storeInfo) => set({ storeInfo }),

  addToCart: (product, selectedOptions = []) => {
    const extraPrice = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    const itemPrice = product.price + extraPrice;
    const cartItemId = `${product.id}-${selectedOptions.map((o) => o.optionName).join('-') || 'default'}`;

    const existingIndex = get().items.findIndex((item) => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      const updated = [...get().items];
      updated[existingIndex].quantity += 1;
      set({ items: updated });
    } else {
      set({
        items: [
          ...get().items,
          {
            cartItemId,
            product,
            quantity: 1,
            selectedOptions,
            totalItemPrice: itemPrice,
          },
        ],
      });
    }
  },

  removeFromCart: (cartItemId) => {
    set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) });
  },

  updateQuantity: (cartItemId, delta) => {
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
  },

  clearCart: () => set({ items: [] }),

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
    });
  },
}));
