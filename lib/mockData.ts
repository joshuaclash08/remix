import type { ProductOption, ProductOptionGroup, Product, CartItem } from '@/lib/types';

export type { ProductOption, ProductOptionGroup, Product, CartItem };


export const MOCK_CATEGORIES = [
  { id: 'all', name: '전체 메뉴', icon: '✨' },
  { id: 'coffee', name: '커피 (Coffee)', icon: '☕' },
  { id: 'beverage', name: '음료 & 티 (Drinks)', icon: '🍵' },
  { id: 'dessert', name: '디저트 (Dessert)', icon: '🥐' },
  { id: 'food', name: '샌드위치 & 샐러드', icon: '🥗' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: '시그니처 배리어프리 라떼',
    englishName: 'Signature Barrier-Free Latte',
    price: 5500,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    description: '고소한 락토프리 속편한 우유와 아라비카 원두의 부드러운 만남',
    voiceDescription: '시그니처 배리어프리 라떼. 가격 5,500원. 속편한 락토프리 우유가 들어간 인기 음료입니다.',
    isPopular: true,
    allergies: ['우유 포함 (락토프리)'],
    optionGroups: [
      {
        id: 'opt-temp',
        title: '온도 선택',
        required: true,
        options: [
          { id: 'ice', name: 'ICE (시원하게)', price: 0 },
          { id: 'hot', name: 'HOT (따뜻하게)', price: 0 },
        ],
      },
      {
        id: 'opt-milk',
        title: '우유 변경',
        required: false,
        options: [
          { id: 'lacto', name: '락토프리 우유 (기본)', price: 0 },
          { id: 'oat', name: '귀리 오트유 변경', price: 500 },
          { id: 'soy', name: '두유 변경', price: 0 },
        ],
      },
      {
        id: 'opt-shot',
        title: '샷 추가',
        required: false,
        options: [
          { id: 'shot-none', name: '기본 샷', price: 0 },
          { id: 'shot-add', name: '에스프레소 샷 추가 (+500원)', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'prod-02',
    name: '아이스 아메리카노',
    englishName: 'Iced Americano',
    price: 4500,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    description: '진하고 깔끔한 풍미의 아라비카 100% 에스프레소 아메리카노',
    voiceDescription: '아이스 아메리카노. 가격 4,500원. 깔끔하고 시원한 에스프레소 음료입니다.',
    isPopular: true,
    optionGroups: [
      {
        id: 'opt-shot-2',
        title: '농도 선택',
        required: true,
        options: [
          { id: 'std', name: '보통 (2샷)', price: 0 },
          { id: 'mild', name: ' 연하게 (1샷)', price: 0 },
          { id: 'strong', name: '진하게 (3샷)', price: 500 },
        ],
      },
    ],
  },
  {
    id: 'prod-03',
    name: '제주 유기농 말차 라떼',
    englishName: 'Jeju Organic Matcha Latte',
    price: 6000,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    description: '제주 산지 직송 말차 가루와 부드러운 우유의 조화',
    voiceDescription: '제주 유기농 말차 라떼. 가격 6,000원. 카페인이 적은 말차 음료입니다.',
    isPopular: true,
    allergies: ['우유 포함'],
    optionGroups: [
      {
        id: 'opt-temp-m',
        title: '온도 선택',
        required: true,
        options: [
          { id: 'ice-m', name: 'ICE (시원하게)', price: 0 },
          { id: 'hot-m', name: 'HOT (따뜻하게)', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'prod-04',
    name: '수제 자몽 자몽 에이드',
    englishName: 'Handcrafted Grapefruit Ade',
    price: 6200,
    category: 'beverage',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: '생 자몽 착즙 원액과 톡 쏘는 탄산수의 청량한 만남',
    voiceDescription: '수제 자몽 에이드. 가격 6,200원. 톡 쏘는 과일 탄산 음료입니다.',
  },
  {
    id: 'prod-05',
    name: '플레인 크로플 & 아이스크림',
    englishName: 'Plain Croffle & Ice Cream',
    price: 6500,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    description: '겉은 바삭하고 속은 촉촉한 프랑스 버터 크로플과 바닐라 아이스크림',
    voiceDescription: '플레인 크로플과 아이스크림. 가격 6,500원. 따뜻한 크로플 위에 차가운 바닐라 아이스크림이 올라갑니다.',
    isPopular: true,
    allergies: ['밀, 우유, 계란 포함'],
  },
  {
    id: 'prod-06',
    name: '속편한 쌀 롤케이크 (글루텐 프리)',
    englishName: 'Gluten-Free Rice Roll Cake',
    price: 5800,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80',
    description: '100% 국산 쌀가루로 만들어 부담 없고 부드러운 순수 생크림 롤',
    voiceDescription: '속편한 쌀 롤케이크. 가격 5,800원. 글루텐 프리 알레르기 안심 디저트입니다.',
    allergies: ['우유, 계란 포함 (밀가루 미포함)'],
  },
  {
    id: 'prod-07',
    name: '아보카도 에그 샌드위치',
    englishName: 'Avocado Egg Sandwich',
    price: 7800,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    description: '신선한 생 아보카도와 무항생제 계란, 호밀빵으로 만든 든든한 샌드위치',
    voiceDescription: '아보카도 에그 샌드위치. 가격 7,800원. 한 끼 식사로 든든한 건강 샌드위치입니다.',
    allergies: ['밀, 계란 포함'],
  },
  {
    id: 'prod-08',
    name: '훈제 연어 리코타 샐러드',
    englishName: 'Smoked Salmon Ricotta Salad',
    price: 9500,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: '노르웨이 프리미엄 연어와 생 리코타 치즈, 레몬 드레싱',
    voiceDescription: '훈제 연어 리코타 샐러드. 가격 9,500원. 연어와 리코타 치즈가 듬뿍 들어간 샐러드입니다.',
    allergies: ['생선, 우유 포함'],
  },
];
