import burgersData from './burgers.json';
import type { Store, MenuItem, MenuSection, Product } from '@/lib/types';

export type { Store, MenuItem, MenuSection };


export const STORES: Store[] = [
  {
    id: 'mcd-gangnam',
    name: '맥도날드 강남점',
    table: '03번 테이블',
    nfcTagId: 'NFC-MCD-GN03',
    address: '서울특별시 강남구 테헤란로 123',
    distanceM: 150
  },
  {
    id: 'mcd-sinchon',
    name: '맥도날드 신촌점',
    table: '05번 테이블',
    nfcTagId: 'NFC-MCD-SC05',
    address: '서울특별시 서대문구 신촌로 99',
    distanceM: 1200
  },
  {
    id: 'mcd-hongdae',
    name: '맥도날드 홍대점',
    table: '01번 테이블',
    nfcTagId: 'NFC-MCD-HD01',
    address: '서울특별시 마포구 양화로 160',
    distanceM: 3400
  }
];

export const CATEGORIES = [
  { id: 'burgers', name: '버거', iconName: 'Beef' },
  { id: 'sides', name: '사이드', iconName: 'Egg' },
  { id: 'drinks', name: '음료', iconName: 'CupSoda' },
  { id: 'dessert', name: '디저트', iconName: 'Cake' }
];

export const getStoreMenu = (storeId: string, categoryId: string = 'burgers'): MenuSection[] => {
  // In the future, menus can be filtered or overridden by storeId.
  // For now, if categoryId is 'burgers', return our detailed sections from burgers.json.
  // For other categories, we can return empty or small placeholder arrays.
  if (categoryId === 'burgers') {
    return burgersData as MenuSection[];
  }
  
  // Placeholders for other categories to demonstrate future expandability
  if (categoryId === 'sides') {
    return [
      {
        id: 'section-side-classic',
        title: '클래식 사이드',
        description: '바삭하고 고소한 후렌치 후라이와 디저트 사이드',
        iconName: 'Sparkles',
        items: [
          {
            id: 'fries-item',
            nameKo: '후렌치 후라이',
            nameEn: 'French Fries',
            category: 'sides',
            description: '바삭하고 짭조름한 맥도날드의 시그니처 감자튀김.',
            price: 2200,
            imageUrl: 'https://www.mcdonalds.co.kr/upload/product/main_1587546747190.png',
            voiceDescription: '후렌치 후라이. 가격 2,200원. 시그니처 감자튀김입니다.'
          },
          {
            id: 'hashbrown-item',
            nameKo: '해쉬 브라운',
            nameEn: 'Hash Brown',
            category: 'sides',
            description: '바삭바삭한 식감의 고소한 아침 대표 사이드.',
            price: 1800,
            imageUrl: 'https://www.mcdonalds.co.kr/upload/product/main_1587546793165.png',
            voiceDescription: '해쉬 브라운. 가격 1,800원.'
          }
        ]
      }
    ];
  }

  if (categoryId === 'drinks') {
    return [
      {
        id: 'section-drink-classic',
        title: '탄산 및 음료',
        description: '시원하고 청량감 넘치는 음료 라인업',
        iconName: 'CupSoda',
        items: [
          {
            id: 'coke-item',
            nameKo: '코카-콜라',
            nameEn: 'Coca-Cola',
            category: 'drinks',
            description: '갈증을 해소해 주는 시원한 탄산음료.',
            price: 1700,
            imageUrl: 'https://www.mcdonalds.co.kr/upload/product/main_1587550186985.png',
            voiceDescription: '코카콜라. 가격 1,700원.'
          },
          {
            id: 'coke-zero-item',
            nameKo: '코카-콜라 제로',
            nameEn: 'Coca-Cola Zero',
            category: 'drinks',
            description: '칼로리 걱정 없이 가볍게 즐기는 제로 코카콜라.',
            price: 1700,
            imageUrl: 'https://www.mcdonalds.co.kr/upload/product/main_1587550186985.png',
            voiceDescription: '제로 코카콜라. 가격 1,700원.'
          }
        ]
      }
    ];
  }

  return [];
};

export const mapBurgerToProduct = (item: MenuItem): Product => {
  const isSet = item.category === 'sets';
  return {
    id: item.id,
    name: item.nameKo,
    englishName: item.nameEn,
    price: item.price,
    // Map to categories from mockData. Product category is: 'coffee' | 'beverage' | 'dessert' | 'food'
    category: isSet ? 'food' : 'coffee', 
    image: item.imageUrl,
    description: item.description,
    voiceDescription: item.voiceDescription || `${item.nameKo}, 가격 ${item.price.toLocaleString()}원`,
    isPopular: item.isRecommended || item.isNew,
    allergies: item.allergens,
    optionGroups: isSet ? [
      {
        id: 'opt-side',
        title: '사이드 선택',
        required: true,
        options: [
          { id: 'fries', name: '후렌치 후라이', price: 0 },
          { id: 'cheese-sticks', name: '골든 모짜렐라 치즈스틱 (+500원)', price: 500 },
          { id: 'coleslaw', name: '코울슬로', price: 0 }
        ]
      },
      {
        id: 'opt-drink',
        title: '음료 선택',
        required: true,
        options: [
          { id: 'coke', name: '코카-콜라', price: 0 },
          { id: 'coke-zero', name: '코카-콜라 제로', price: 0 },
          { id: 'sprite', name: '스프라이트', price: 0 }
        ]
      }
    ] : [
      {
        id: 'opt-type',
        title: '구성 선택',
        required: true,
        options: [
          { id: 'single', name: '단품', price: 0 },
          { id: 'set', name: '세트 변경 (+2,000원)', price: 2000 }
        ]
      }
    ]
  };
};

