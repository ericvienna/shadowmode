import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SEED_DATA } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  // Auth check
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = { states: 0, cities: 0, milestones: 0, errors: [] as string[] };

    for (const state of SEED_DATA) {
      // Upsert state
      const { error: stateErr } = await supabaseAdmin.from('states').upsert({
        id: state.id,
        name: state.name,
        abbreviation: state.abbreviation,
        regulatory_difficulty: state.regulatoryDifficulty ?? null,
        avg_permit_days: state.avgPermitDays ?? null,
        bottleneck_stage: state.bottleneckStage ?? null,
        notes: state.notes ?? null,
        updated_at: new Date().toISOString(),
      });
      if (stateErr) { results.errors.push(`State ${state.id}: ${stateErr.message}`); continue; }
      results.states++;

      for (const city of state.cities) {
        // Upsert city
        const { error: cityErr } = await supabaseAdmin.from('cities').upsert({
          id: city.id,
          name: city.name,
          state_id: state.id,
          updated_at: new Date().toISOString(),
        });
        if (cityErr) { results.errors.push(`City ${city.id}: ${cityErr.message}`); continue; }
        results.cities++;

        // Upsert milestones
        const milestoneRows = Object.values(city.milestones).map((m) => ({
          city_id: city.id,
          type: m.type,
          status: m.status,
          date: m.date ?? null,
          value: m.value ?? null,
          notes: m.notes ?? null,
          source: m.source ?? null,
          confidence: m.confidence ?? null,
          updated_at: new Date().toISOString(),
        }));

        const { error: msErr } = await supabaseAdmin
          .from('milestones')
          .upsert(milestoneRows, { onConflict: 'city_id,type' });
        if (msErr) { results.errors.push(`Milestones for ${city.id}: ${msErr.message}`); continue; }
        results.milestones += milestoneRows.length;
      }
    }

    return NextResponse.json({
      success: true,
      seeded: results,
      message: `Seeded ${results.states} states, ${results.cities} cities, ${results.milestones} milestones`,
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
