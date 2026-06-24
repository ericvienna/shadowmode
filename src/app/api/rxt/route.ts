import { NextResponse } from 'next/server';
import { getRobotaxiTrackerData, RXT_AREAS } from '@/lib/robotaxi-tracker';
import type { RxtArea } from '@/types/robotaxi-tracker';

export const revalidate = 900;

function parseAreasParam(raw: string | null): RxtArea[] {
  if (!raw) return ['austin'];
  const requested = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is RxtArea => (RXT_AREAS as string[]).includes(s));
  return requested.length > 0 ? requested : ['austin'];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areas = parseAreasParam(searchParams.get('areas'));

  try {
    const data = await getRobotaxiTrackerData(areas);
    return NextResponse.json(data);
  } catch (error) {
    console.error('RXT API error:', error);
    return NextResponse.json({ error: 'Failed to fetch robotaxitracker data' }, { status: 502 });
  }
}