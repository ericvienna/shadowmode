import { NextResponse } from 'next/server';
import { CHANGELOG, changeDateToISO } from '@/lib/changelog';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    name: 'SHADOWMODE change log',
    description:
      'Every tracked cell that flips gets a timestamped, sourced entry — including corrections to our own numbers.',
    count: CHANGELOG.length,
    entries: CHANGELOG.map(e => ({
      ...e,
      timestamp: changeDateToISO(e.date),
    })),
  });
}
