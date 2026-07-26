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

  /**
   * Process voice intent via backend Groq AI assistant API route.
   */
  public async parseVoiceIntentWithGroq(spokenText: string, storeId: string = 'mcd-gangnam'): Promise<VoiceIntentResult> {
    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenText, storeId }),
      });

      if (!res.ok) {
        return this.parseVoiceIntent(spokenText);
      }

      const data = await res.json();
      if (data.intent === 'add_to_cart' && data.matchedProductId) {
        const allProducts = menuService.getAllProducts(storeId);
        const product =
          allProducts.find((p) => p.id === data.matchedProductId) ||
          menuService.findProductByName(data.matchedProductName || spokenText, storeId);

        if (product) {
          return {
            intent: 'add_to_cart',
            matchedProduct: product,
            matchedOptions: data.options || [],
            matchedQuantity: 1,
            feedbackMessage: data.feedbackMessage || `${product.name}를 장바구니에 담았습니다.`,
          };
        }
      }

      return {
        intent: data.intent || 'unknown',
        matchedProduct: data.matchedProductId
          ? menuService.getAllProducts(storeId).find((p) => p.id === data.matchedProductId)
          : undefined,
        matchedOptions: data.options || [],
        aiResponseText: data.aiResponseText,
        recommendedProducts: data.recommendedProducts || [],
        feedbackMessage: data.feedbackMessage || data.aiResponseText || '처리하지 못한 명령입니다.',
      };
    } catch (error) {
      console.error('Groq voice processing failed, falling back:', error);
      return this.parseVoiceIntent(spokenText);
    }
  }

  /**
   * Send binary recorded audio blob (from MediaRecorder) directly to backend Groq Whisper + LLM API route.
   */
  public async parseVoiceAudioWithGroq(
    audioBlob: Blob,
    textFallback: string = '',
    storeId: string = 'mcd-gangnam'
  ): Promise<VoiceIntentResult & { spokenText?: string }> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.webm');
      formData.append('storeId', storeId);
      if (textFallback) {
        formData.append('text', textFallback);
      }

      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        return this.parseVoiceIntent(textFallback);
      }

      const data = await res.json();
      const allProducts = menuService.getAllProducts(storeId);
      const matchedProd = data.matchedProductId
        ? allProducts.find((p) => p.id === data.matchedProductId)
        : undefined;

      return {
        intent: data.intent || 'unknown',
        matchedProduct: matchedProd,
        matchedOptions: data.options || [],
        aiResponseText: data.aiResponseText,
        recommendedProducts: data.recommendedProducts || [],
        feedbackMessage: data.feedbackMessage || data.aiResponseText || '처리가 완료되었습니다.',
        spokenText: data.spokenText || textFallback,
      };
    } catch (error) {
      console.error('Audio upload to Groq failed, falling back:', error);
      return this.parseVoiceIntent(textFallback);
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();
