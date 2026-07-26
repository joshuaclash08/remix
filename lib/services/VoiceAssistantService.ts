import { menuService } from './MenuService';
import type { VoiceIntentResult } from '@/lib/types';

export class VoiceAssistantService {
  /**
   * Process natural language spoken text into structured voice intent actions.
   */
  public parseVoiceIntent(spokenText: string): VoiceIntentResult {
    const text = spokenText.trim().toLowerCase();

    if (!text) {
      return {
        intent: 'unknown',
        feedbackMessage: '음성을 인식하지 못했습니다. 다시 한 번 말씀해 주세요.',
      };
    }

    // 1. Order / Cart Addition Intent
    if (text.includes('담아') || text.includes('추가') || text.includes('주문') || text.includes('선택')) {
      const matchedProduct = menuService.findProductByName(text);
      if (matchedProduct) {
        return {
          intent: 'add_to_cart',
          matchedProduct,
          matchedQuantity: 1,
          feedbackMessage: `${matchedProduct.name}를 장바구니에 담았습니다.`,
        };
      } else {
        return {
          intent: 'unknown',
          feedbackMessage: '요청하신 메뉴를 찾을 수 없습니다. 메뉴명을 정확히 말씀해 주세요.',
        };
      }
    }

    // 2. Clear Cart Intent
    if (text.includes('취소') || text.includes('비워') || text.includes('전체 삭제')) {
      return {
        intent: 'clear_cart',
        feedbackMessage: '장바구니를 모두 비웠습니다.',
      };
    }

    // 3. Checkout Intent
    if (text.includes('결제') || text.includes('계산') || text.includes('주문 완료')) {
      return {
        intent: 'checkout',
        feedbackMessage: '주문을 진행합니다.',
      };
    }

    // 4. Allergen query intent
    if (text.includes('알레르기') || text.includes('알러지')) {
      return {
        intent: 'query_allergens',
        feedbackMessage: '알레르기 유발 성분 정보는 메뉴 선택 시 상세 보기에 표기되어 있습니다.',
      };
    }

    // Default fallback matching
    const productMatch = menuService.findProductByName(text);
    if (productMatch) {
      return {
        intent: 'add_to_cart',
        matchedProduct: productMatch,
        matchedQuantity: 1,
        feedbackMessage: `${productMatch.name}를 장바구니에 추가합니다.`,
      };
    }

    return {
      intent: 'unknown',
      feedbackMessage: '도움이 필요하시면 "라떼 담아줘" 또는 "결제해줘"라고 말씀해 보세요.',
    };
  }
}

export const voiceAssistantService = new VoiceAssistantService();
