import { create } from 'zustand';
import { Product, CartItem } from '@/lib/mockData';

interface StoreInfo {
  id: string;
  name: string;
  table: string;
  nfcTagId: string;
}

interface CartState {
  storeInfo: StoreInfo;
  items: CartItem[];
  isVoiceModalOpen: boolean;
  isQrModalOpen: boolean;
  orderStatus: 'idle' | 'processing' | 'completed';
  lastOrderNumber: string | null;

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
  placeOrder: () => Promise<void>;
  resetOrder: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeInfo: {
    id: 'gangnam-01',
    name: '스마트 카페 강남점 (배리어프리 전용)',
    table: '04번 테이블',
    nfcTagId: 'NFC-TAG-8829',
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
  orderStatus: 'idle',
  lastOrderNumber: null,

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

  placeOrder: async () => {
    set({ orderStatus: 'processing' });
    await new Promise((res) => setTimeout(res, 1500));
    const randomOrderNo = `B-${Math.floor(100 + Math.random() * 900)}`;
    set({
      orderStatus: 'completed',
      lastOrderNumber: randomOrderNo,
    });
  },

  resetOrder: () => {
    set({
      orderStatus: 'idle',
      items: [],
      lastOrderNumber: null,
    });
  },
}));
