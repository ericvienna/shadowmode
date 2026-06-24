import { NextResponse } from 'next/server';
import { getLastLivingReceiptsSnapshot } from '@/lib/firecrawl/living-receipts';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = getLastLivingReceiptsSnapshot();
  if (!snapshot) {
    return NextResponse.json({
      entries: [],
      checkedAt: null,
      changedCount: 0,
      message: 'No living-receipts snapshot yet — cron not run',
    });
  }
  return NextResponse.json(snapshot);
}