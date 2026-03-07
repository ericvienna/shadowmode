import { supabaseAdmin } from './supabase';
import type { State, City, Milestone, MilestoneType, DashboardData } from '@/types/robotaxi';
import { SEED_DATA } from './seed-data';

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

export async function getDashboardDataFromDB(): Promise<DashboardData> {
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

    return { states, lastUpdated: new Date().toISOString() };
  } catch (err) {
    console.error('[db] getDashboardDataFromDB failed, falling back to seed data:', err);
    // Graceful fallback to hardcoded seed data if DB is unavailable
    return { states: SEED_DATA, lastUpdated: new Date().toISOString() };
  }
}
