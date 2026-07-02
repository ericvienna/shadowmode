import { NextResponse } from 'next/server';
import { PREDICTIONS, scoreLedger } from '@/lib/predictions';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    name: 'SHADOWMODE predictions ledger',
    description:
      'Calls on the record with stated probabilities and resolution dates, scored in public (Brier). Entries are never edited after posting.',
    score: scoreLedger(PREDICTIONS),
    predictions: PREDICTIONS,
  });
}
