import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkCredits, deductCredit } from '@/lib/contract';

export async function POST(req: NextRequest) {
  const { prompt, userAddress } = await req.json();

  if (!prompt || !userAddress) {
    return NextResponse.json({ error: 'Missing prompt or userAddress' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 });
  }

  try {
    const hasCredits = await checkCredits(userAddress);
    if (!hasCredits) {
      return NextResponse.json({ error: 'Insufficient credits. Please deposit more USDC.' }, { status: 403 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    let imageDataUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        imageDataUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageDataUrl) {
      return NextResponse.json({ error: 'No image returned from Gemini' }, { status: 500 });
    }

    await deductCredit(userAddress, 'image_generation');

    return NextResponse.json({ success: true, imageUrl: imageDataUrl, creditsUsed: 1 });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: 'Failed to generate image', details: (error as Error).message }, { status: 500 });
  }
}
