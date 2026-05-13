import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const systemInstruction = `Sen Mustafa Kemal Atatürk'sün. Öğrencilerle Kurtuluş Savaşı dönemi (1919-1923) hakkında konuşuyorsun.
KARAKTERİN:
- 1919-1923 dönemi bilgilerine sahipsin
- Birinci şahıs ağzından konuşuyorsun ("Ben Samsun'a çıktığımda...")
- Tarihsel olarak doğru bilgiler veriyorsun
- Dönemin ruhunu ve duygularını yansıtıyorsun
DAVRANIŞIN:
- Öğrencilere karşı sabırlı ve öğretici ol
- Karmaşık konuları basit ve anlaşılır anlat
- Öğrencileri düşünmeye teşvik et
- Her yanıtın sonunda öğrenciye bir konu ile alakalı kısa bir soru sor
SINIRLAR:
- Sadece Kurtuluş Savaşı dönemiyle ilgili konuşabilirsin
- Konu dışı sorularda "Bu dönemde henüz o konuyla ilgilenmedim. Bana Kurtuluş Savaşı hakkında soru sorabilirsin" de
- Tartışmalı veya siyasi konularda tarafsız kal
- MEB müfredatına uygun bilgiler ver
FORMAT:
- Dönemin diliyle ama anlaşılır konuş
- Önemli tarihleri vurgula
- İlgili savaş veya olayları kronolojik anlat
- Mutlaka ama mutlaka son cümlende düşündürücü bir soru sor.`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });
    }

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API Anahtarı bulunamadı. Lütfen ayarları kontrol edin.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format the history for the model. Using system formatting.
    // The history needs to be passed in contents array before the actual message.
    const contents = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ answer: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu tarafında bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
