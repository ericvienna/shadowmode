import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function checkAuth(req: Request): boolean {
  const body_password = null; // extracted from body in PATCH
  void body_password;
  const authHeader = req.headers.get('x-admin-password');
  return authHeader === process.env.ADMIN_PASSWORD;
}

// GET /api/admin/milestones — list all states, cities, milestones
export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [statesRes, citiesRes, milestonesRes] = await Promise.all([
    supabaseAdmin.from('states').select('id, name, abbreviation').order('name'),
    supabaseAdmin.from('cities').select('id, name, state_id').order('name'),
    supabaseAdmin.from('milestones').select('*').order('type'),
  ]);

  if (statesRes.error) return NextResponse.json({ error: statesRes.error.message }, { status: 500 });
  if (citiesRes.error) return NextResponse.json({ error: citiesRes.error.message }, { status: 500 });
  if (milestonesRes.error) return NextResponse.json({ error: milestonesRes.error.message }, { status: 500 });

  return NextResponse.json({
    states: statesRes.data,
    cities: citiesRes.data,
    milestones: milestonesRes.data,
  });
}

// PATCH /api/admin/milestones — update a single milestone
export async function PATCH(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { city_id, type, status, date, value, notes } = body;

  if (!city_id || !type) {
    return NextResponse.json({ error: 'city_id and type are required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('milestones')
    .upsert(
      {
        city_id,
        type,
        status: status ?? 'not_started',
        date: date || null,
        value: value ?? null,
        notes: notes || null,
      },
      { onConflict: 'city_id,type' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
