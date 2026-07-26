export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionGroup {
  id: string;
  title: string;
  required: boolean;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  englishName: string;
  price: number;
  category: 'coffee' | 'beverage' | 'dessert' | 'food';
  image: string;
  description: string;
  voiceDescription: string;
  easyDescription?: string;
  isPopular?: boolean;
  isSoldOut?: boolean;
  allergies?: string[];
  optionGroups?: ProductOptionGroup[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOptions: {
    groupTitle: string;
    optionName: string;
    price: number;
  }[];
  totalItemPrice: number;
}

export interface Store {
  id: string;
  name: string;
  table: string;
  nfcTagId: string;
  address: string;
  distanceM: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  table: string;
  nfcTagId: string;
}

export interface MenuItem {
  id: string;
  nameKo: string;
  nameEn: string;
  category: string;
  subCategory?: string;
  description: string;
  voiceDescription?: string;
  easyDescription?: string;
  price: number;
  imageUrl: string;
  isNew?: boolean;
  isRecommended?: boolean;
  nutrition?: Record<string, number>;
  allergens?: string[];
}

export interface MenuSection {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: MenuItem[];
}

export type KioskStep = 'store_select' | 'order_type_select' | 'menu';

export type OrderStatus = 'idle' | 'processing' | 'completed' | 'cancelled';
export type OrderType = 'takeout' | 'table';

export interface OrderReceipt {
  orderId: string;
  orderNumber: string;
  storeInfo: StoreInfo;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalPrice: number;
  createdAt: string;
  status: OrderStatus;
}

export interface VoiceIntentResult {
  intent: 'add_to_cart' | 'recommendation' | 'clear_cart' | 'checkout' | 'query_allergens' | 'unknown';
  matchedProduct?: Product;
  matchedQuantity?: number;
  matchedOptions?: { groupTitle: string; optionName: string; price: number }[];
  aiResponseText?: string;
  recommendedProducts?: Product[];
  feedbackMessage: string;
}

export interface MenuFilterOptions {
  categoryId?: string;
  searchQuery?: string;
  excludeAllergens?: string[];
  easyModeOnly?: boolean;
}
