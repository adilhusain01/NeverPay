import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkCredits, deductCredit } from '@/lib/contract';

export async function POST(req: NextRequest) {
  const { message, history, userAddress } = await req.json();

  if (!message || !userAddress) {
    return NextResponse.json({ error: 'Missing message or userAddress' }, { status: 400 });
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
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history: history || [],
    });

    const response = await chat.sendMessage({ message });

    await deductCredit(userAddress, 'text_generation');

    return NextResponse.json({ success: true, response: response.text, creditsUsed: 1 });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response', details: (error as Error).message }, { status: 500 });
  }
}
