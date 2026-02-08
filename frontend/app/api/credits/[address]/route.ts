import { NextRequest, NextResponse } from 'next/server';
import { getContract } from '@/lib/contract';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const contract = getContract();

  if (!contract) {
    return NextResponse.json({ credits: 0, contractConnected: false });
  }

  try {
    const credits = await contract.getAvailableCredits(address);
    return NextResponse.json({ credits: credits.toString(), contractConnected: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
