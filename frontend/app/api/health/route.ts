import { NextResponse } from 'next/server';
import { getContract } from '@/lib/contract';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    contractConnected: !!getContract(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
}
