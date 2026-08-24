import { getSupabaseAdmin } from './supabase';
import type { State, City, Milestone, MilestoneType, DashboardData } from '@/types/robotaxi';
import { SEED_DATA, SEED_AS_OF } from './seed-data';

const MILESTONE_TYPES: MilestoneType[] = [
  'tesla_insurance_available',
  'permit_applied',
  'permit_received',
  'vehicle_operator_ads',
  'robotaxi_fleet_support_ads',
  'final_regulatory_approval',
  'route_validation_tests',
  'robotaxi_app_access_opens',
  'public_test_program_launched',
  'geofence_expanded',
  'vehicles_deployed_20_plus',
  'no_safety_monitor',
];

function emptyMilestonesRecord(): Record<MilestoneType, Milestone> {
  const record: Partial<Record<MilestoneType, Milestone>> = {};
  for (const type of MILESTONE_TYPES) {
    record[type] = { type, status: 'not_started' };
  }
  return record as Record<MilestoneType, Milestone>;
}

/**
 * The real "as of" date for DB-served data, derived rather than guessed.
 *
 * WHY THIS EXISTS (2026-08-24): the success path returned
 * `lastUpdated: new Date().toISOString()` — the time the QUERY RAN, not when the
 * DATA CHANGED. Paired with a UI badge, that rendered a pulsing green "LIVE ·
 * less than a minute ago" over rows of genuinely unknown age. Fetch-freshness
 * presented as data-freshness. Nothing writes to this database (the Firecrawl
 * crons never touched it), so "we just queried it" says nothing at all about
 * whether the numbers are current.
 *
 * It is SCHEMA-AGNOSTIC on purpose. The queries already `select('*')`, so any
 * timestamp column the tables happen to carry is ALREADY in the response and was
 * simply unused. This reads whichever of the usual names is present and takes the
 * newest. If the tables carry none, it returns null and the caller falls back to
 * SEED_AS_OF — an honest old date. It never invents one.
 *
 * The point is that we do not have to KNOW the schema to stop lying about it.
 */
const TIMESTAMP_KEYS = ['updated_at', 'updatedAt', 'last_updated', 'lastUpdated', 'modified_at', 'created_at'];

function latestRowTimestamp(...rowSets: unknown[][]): string | null {
  let newest = 0;
  for (const rows of rowSets) {
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      for (const key of TIMESTAMP_KEYS) {
        const v = (row as Record<string, unknown>)[key];
        if (typeof v !== 'string' && typeof v !== 'number') continue;
        const t = new Date(v).getTime();
        if (!isNaN(t) && t > newest) newest = t;
      }
    }
  }
  return newest > 0 ? new Date(newest).toISOString() : null;
}

export async function getDashboardDataFromDB(): Promise<DashboardData> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return { states: SEED_DATA, lastUpdated: SEED_AS_OF };
  }

  try {
    const [statesRes, citiesRes, milestonesRes] = await Promise.all([
      supabaseAdmin.from('states').select('*').order('name'),
      supabaseAdmin.from('cities').select('*').order('name'),
      supabaseAdmin.from('milestones').select('*'),
    ]);

    if (statesRes.error) throw statesRes.error;
    if (citiesRes.error) throw citiesRes.error;
    if (milestonesRes.error) throw milestonesRes.error;

    const statesData = statesRes.data ?? [];
    const citiesData = citiesRes.data ?? [];
    const milestonesData = milestonesRes.data ?? [];

    // Group milestones by city_id for O(1) lookup
    const milestonesByCity = new Map<string, typeof milestonesData>();
    for (const m of milestonesData) {
      if (!milestonesByCity.has(m.city_id)) milestonesByCity.set(m.city_id, []);
      milestonesByCity.get(m.city_id)!.push(m);
    }

    const states: State[] = statesData.map((s) => {
      const stateCities: City[] = citiesData
        .filter((c) => c.state_id === s.id)
        .map((c) => {
          const cityMilestones = milestonesByCity.get(c.id) ?? [];
          const record = emptyMilestonesRecord();

          for (const m of cityMilestones) {
            record[m.type as MilestoneType] = {
              type: m.type as MilestoneType,
              status: m.status,
              date: m.date ?? undefined,
              value: m.value ?? undefined,
              notes: m.notes ?? undefined,
              source: m.source ?? undefined,
              confidence: m.confidence ?? undefined,
            };
          }

          return { id: c.id, name: c.name, milestones: record };
        });

      return {
        id: s.id,
        name: s.name,
        abbreviation: s.abbreviation,
        regulatoryDifficulty: s.regulatory_difficulty,
        avgPermitDays: s.avg_permit_days,
        bottleneckStage: s.bottleneck_stage,
        notes: s.notes,
        cities: stateCities,
      };
    });

    // Real data date if the rows carry one; an honest old date if they do not.
    // Never the query time — that is not a fact about the data.
    return { states, lastUpdated: latestRowTimestamp(statesData, citiesData, milestonesData) ?? SEED_AS_OF };
  } catch (err) {
    console.error('[db] getDashboardDataFromDB failed, falling back to seed data:', err);
    // Graceful fallback to hardcoded seed data if DB is unavailable
    return { states: SEED_DATA, lastUpdated: SEED_AS_OF };
  }
}
