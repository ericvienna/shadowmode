import { NextResponse } from 'next/server';
import { runLivingReceiptsCheck } from '@/lib/firecrawl/living-receipts';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === 'development';
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runLivingReceiptsCheck({ limit: 25 });
    return NextResponse.json({
      ok: true,
      changedCount: result.changedCount,
      checked: result.entries.length,
      changed: result.entries.filter((e) => e.status === 'changed').map((e) => e.label),
      errors: result.entries.filter((e) => e.status === 'error').map((e) => ({ id: e.id, error: e.error })),
    });
  } catch (error) {
    console.error('[cron/living-receipts]', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'check failed' },
      { status: 500 }
    );
  }
}