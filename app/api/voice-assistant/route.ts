import { NextResponse } from 'next/server';
import { menuService } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let spokenText = '';
    let storeId = 'mcd-gangnam';

    const apiKey = process.env.GROQ_API_KEY;

    // Handle audio Blob upload from MediaRecorder
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as Blob | null;
      const textParam = formData.get('text') as string | null;
      storeId = (formData.get('storeId') as string) || 'mcd-gangnam';

      if (textParam && textParam.trim()) {
        spokenText = textParam;
      } else if (audioFile && apiKey) {
        // Send audio to Groq Whisper API for transcription
        const groqForm = new FormData();
        groqForm.append('file', audioFile, 'speech.webm');
        groqForm.append('model', 'whisper-large-v3-turbo');
        groqForm.append('language', 'ko');

        const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: groqForm,
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          spokenText = whisperData.text || '';
        } else {
          const errText = await whisperRes.text();
          console.error('Groq Whisper API Error:', errText);
        }
      }
    } else {
      const body = await request.json();
      spokenText = body.text || '';
      storeId = body.storeId || 'mcd-gangnam';
    }

    if (!spokenText.trim()) {
      return NextResponse.json({
        intent: 'unknown',
        spokenText: '',
        aiResponseText: '음성이 잘 들리지 않았습니다. 마이크 버튼을 누르고 다시 말씀해 주세요.',
        recommendedProducts: [],
        feedbackMessage: '음성이 인식되지 않았습니다.',
      });
    }

    const allProducts = menuService.getAllProducts(storeId);

    // Prepare rich menu context including full descriptions, allergens, and recipes
    const menuCatalogPrompt = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      englishName: p.englishName,
      price: p.price,
      description: p.description,
      voiceDescription: p.voiceDescription || p.description,
      allergies: p.allergies || [],
      optionGroups: p.optionGroups?.map(g => ({
        title: g.title,
        required: g.required,
        options: g.options.map(o => ({ name: o.name, price: o.price }))
      })) || []
    }));

    if (!apiKey) {
      // Fallback matching when GROQ_API_KEY is unconfigured
      const matched = menuService.findProductByName(spokenText, storeId);
      if (matched) {
        return NextResponse.json({
          intent: 'add_to_cart',
          spokenText,
          aiResponseText: `${matched.name}는 ${matched.description || '인기 메뉴'}입니다.`,
          recommendedProducts: [matched],
          matchedProductId: matched.id,
          matchedProductName: matched.name,
          options: [],
          feedbackMessage: `${matched.name}를 장바구니에 담았습니다.`
        });
      }
      return NextResponse.json({
        intent: 'unknown',
        spokenText,
        aiResponseText: '요청하신 메뉴에 대해 안내드리기가 어렵습니다. 메뉴 이름을 다시 말씀해 주세요.',
        recommendedProducts: [],
        feedbackMessage: '메뉴를 찾을 수 없습니다.'
      });
    }

    const systemPrompt = `You are a helpful, concise, and modern AI Order Assistant for a fast-food / cafe kiosk.
Analyze the user's spoken command or question and match it against the store's current menu products, descriptions, and recipes.

AVAILABLE MENU CATALOG & RECIPES:
${JSON.stringify(menuCatalogPrompt, null, 2)}

INSTRUCTIONS:
1. Determine intent: "add_to_cart" (user explicitly wants to add an item), "recommendation" (user asks for recommendations, ingredients, descriptions, or choices like "매운 버거 추천해줘", "1955 버거 어떤 거야?"), "clear_cart", "checkout", or "unknown".
2. If intent is "recommendation" or "info":
   - Read the relevant product description(s) and recipes.
   - Formulate a clean, polite Korean answer in "aiResponseText" explaining the item or suggesting matching products.
   - Put matched product IDs in "recommendedProductIds" array.
3. If intent is "add_to_cart":
   - Identify "matchedProductId". Match user options if mentioned.
   - Also include matched product in "recommendedProductIds".
   - Formulate "aiResponseText" stating the item has been added.
4. Output STRICT JSON with this schema:
{
  "intent": "add_to_cart" | "recommendation" | "clear_cart" | "checkout" | "unknown",
  "aiResponseText": string (Korean natural response message describing the menu / recommendation),
  "recommendedProductIds": string[],
  "matchedProductId": string or null,
  "matchedProductName": string or null,
  "options": [
    { "groupTitle": string, "optionName": string, "price": number }
  ],
  "feedbackMessage": string
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: spokenText }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq LLM API Error:', errText);
      const matched = menuService.findProductByName(spokenText, storeId);
      if (matched) {
        return NextResponse.json({
          intent: 'add_to_cart',
          spokenText,
          aiResponseText: `${matched.name} (${matched.price.toLocaleString()}원)를 찾았습니다.`,
          recommendedProducts: [matched],
          matchedProductId: matched.id,
          matchedProductName: matched.name,
          options: [],
          feedbackMessage: `${matched.name}를 장바구니에 담았습니다.`
        });
      }
      return NextResponse.json({
        intent: 'unknown',
        spokenText,
        aiResponseText: `"${spokenText}"에 대해 안내해 드립니다. 어떤 메뉴를 도와드릴까요?`,
        recommendedProducts: [],
        feedbackMessage: '문의하신 답변을 확인했습니다.'
      });
    }

    const groqData = await groqResponse.json();
    const contentText = groqData.choices?.[0]?.message?.content || '{}';
    const parsedResult = JSON.parse(contentText);

    const recIds: string[] = parsedResult.recommendedProductIds || (parsedResult.matchedProductId ? [parsedResult.matchedProductId] : []);
    const recommendedProducts = allProducts.filter(p => recIds.includes(p.id));

    return NextResponse.json({
      intent: parsedResult.intent || 'unknown',
      spokenText,
      aiResponseText: parsedResult.aiResponseText || parsedResult.feedbackMessage || '도움이 필요하시면 메뉴를 물어보세요.',
      recommendedProducts: recommendedProducts,
      matchedProductId: parsedResult.matchedProductId || null,
      matchedProductName: parsedResult.matchedProductName || null,
      options: parsedResult.options || [],
      feedbackMessage: parsedResult.feedbackMessage || parsedResult.aiResponseText || '처리가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Voice Assistant API Exception:', error);
    return NextResponse.json(
      {
        intent: 'unknown',
        spokenText: '',
        aiResponseText: '서버 처리 중 예외가 발생했습니다.',
        recommendedProducts: [],
        feedbackMessage: '예외가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
