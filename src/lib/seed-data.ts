import type { State, MilestoneType, Milestone, RegulatoryDifficulty } from '@/types/robotaxi';

/**
 * DATA SOURCE: @JonathanWStokes Robotaxi Progress Tracker (Dec 14, 2025)
 * https://x.com/JonathanWStokes
 *
 * Additional verification from:
 * - TechCrunch, Electrek, Teslarati for major milestones
 * - Tesla job postings for Vehicle Operator Ads dates
 * - CA DMV, AZ DOT, NV DMV for permit dates
 * - NotATeslaApp for Tesla Insurance availability
 */

function createMilestone(
  type: MilestoneType,
  dateOrValue?: string | null,
  status?: 'completed' | 'in_progress' | 'not_started' | 'unknown' | 'n/a',
  notes?: string
): Milestone {
  if (dateOrValue === null || dateOrValue === undefined) {
    return { type, status: status || 'not_started' };
  }
  if (dateOrValue === 'N/A') {
    return { type, status: 'n/a' };
  }
  if (dateOrValue === '?' || dateOrValue === 'Unk') {
    return { type, status: 'unknown' };
  }
  // Check if it's a year only (like "2019", "2021", "2022")
  if (/^\d{4}$/.test(dateOrValue)) {
    return { type, status: 'completed', date: dateOrValue, notes };
  }
  // Check if it's a full date (YYYY-MM-DD) - must check BEFORE value patterns
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrValue)) {
    return { type, status: status || 'completed', date: dateOrValue, notes };
  }
  // Check if it's a number (like "5", "7") indicating pending/in progress count
  if (/^\d+$/.test(dateOrValue)) {
    return { type, status: status || 'in_progress', value: dateOrValue, notes };
  }
  // Check if it has a + (like "30+", "66-100+") - for vehicle counts
  if (dateOrValue.includes('+')) {
    return { type, status: 'completed', value: dateOrValue, notes };
  }
  // Otherwise treat as a date
  return { type, status: status || 'completed', date: dateOrValue, notes };
}

function createEmptyMilestones(): Record<MilestoneType, Milestone> {
  const types: MilestoneType[] = [
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

  const milestones: Partial<Record<MilestoneType, Milestone>> = {};
  types.forEach(type => {
    milestones[type] = { type, status: 'not_started' };
  });
  return milestones as Record<MilestoneType, Milestone>;
}

// Data sourced from @JonathanWStokes tracker (Dec 14, 2025) with verification
export const SEED_DATA: State[] = [
  {
    id: 'az',
    name: 'Arizona',
    abbreviation: 'AZ',
    regulatoryDifficulty: 'friendly',
    avgPermitDays: 85,
    bottleneckStage: 'final_regulatory_approval',
    cities: [
      {
        id: 'az-phoenix',
        name: 'Phoenix',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2022'),
          permit_applied: createMilestone('permit_applied', '2025-06-26'),
          permit_received: createMilestone('permit_received', '2025-09-19'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '?'),
          final_regulatory_approval: createMilestone('final_regulatory_approval', '2025-11-17'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-09-17'),
        },
      },
      {
        id: 'az-mesa-tempe',
        name: 'Mesa, Tempe',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2022'),
          permit_applied: createMilestone('permit_applied', '2025-06-26'),
          permit_received: createMilestone('permit_received', '2025-09-19'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-07-18'),
          final_regulatory_approval: createMilestone('final_regulatory_approval', '2025-11-17'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-09-10'),
        },
      },
    ],
  },
  {
    id: 'ca',
    name: 'California',
    abbreviation: 'CA',
    regulatoryDifficulty: 'mixed',
    avgPermitDays: 180,
    bottleneckStage: 'final_regulatory_approval',
    notes: 'To remove safety monitors, Tesla needs Driverless Tester Permit and CPUC enrollment.',
    cities: [
      {
        id: 'ca-la',
        name: 'Los Angeles',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2019'),
          permit_applied: createMilestone('permit_applied', '2024'),
          permit_received: createMilestone('permit_received', '2025-09-29'),
        },
      },
      {
        id: 'ca-sd',
        name: 'San Diego',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2019'),
          permit_applied: createMilestone('permit_applied', '2024'),
          permit_received: createMilestone('permit_received', '2025-07-02'),
        },
      },
      {
        id: 'ca-sf',
        name: 'San Francisco',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2019'),
          permit_applied: createMilestone('permit_applied', '2024'),
          permit_received: createMilestone('permit_received', '2025-07-18'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-10-12'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2', 'in_progress'),
          robotaxi_app_access_opens: createMilestone('robotaxi_app_access_opens', '2025-07-30'),
          public_test_program_launched: createMilestone('public_test_program_launched', '2025-11-18'),
          geofence_expanded: createMilestone('geofence_expanded', '2025-07-31'),
          vehicles_deployed_20_plus: createMilestone('vehicles_deployed_20_plus', '2025-09-04'),
        },
      },
      {
        id: 'ca-oak',
        name: 'Oakland',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2019'),
          permit_applied: createMilestone('permit_applied', '2024'),
          permit_received: createMilestone('permit_received', '2025-07-18'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2', 'in_progress'),
          robotaxi_app_access_opens: createMilestone('robotaxi_app_access_opens', '2025-07-30'),
          public_test_program_launched: createMilestone('public_test_program_launched', '2025-11-18'),
          geofence_expanded: createMilestone('geofence_expanded', '2025-07-31'),
          vehicles_deployed_20_plus: createMilestone('vehicles_deployed_20_plus', '2025-09-04'),
        },
      },
      {
        id: 'ca-sj',
        name: 'San Jose',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2019'),
          permit_applied: createMilestone('permit_applied', '2024'),
          permit_received: createMilestone('permit_received', '2025-07-18'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2', 'in_progress'),
          robotaxi_app_access_opens: createMilestone('robotaxi_app_access_opens', '2025-07-30'),
          public_test_program_launched: createMilestone('public_test_program_launched', '2025-11-18'),
          geofence_expanded: createMilestone('geofence_expanded', '2025-07-31'),
          vehicles_deployed_20_plus: createMilestone('vehicles_deployed_20_plus', '2025-09-04'),
        },
      },
    ],
  },
  {
    id: 'co',
    name: 'Colorado',
    abbreviation: 'CO',
    regulatoryDifficulty: 'friendly',
    notes: 'No AV permit required in Colorado.',
    cities: [
      {
        id: 'co-denver',
        name: 'Denver',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2022'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-10-13'),
        },
      },
    ],
  },
  {
    id: 'fl',
    name: 'Florida',
    abbreviation: 'FL',
    regulatoryDifficulty: 'friendly',
    bottleneckStage: 'tesla_insurance_available',
    notes: 'No AV permit required. Tesla Insurance not yet available in Florida.',
    cities: [
      {
        id: 'fl-jacksonville',
        name: 'Jacksonville',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
        },
      },
      {
        id: 'fl-miami',
        name: 'Miami',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-26'),
        },
      },
      {
        id: 'fl-orlando',
        name: 'Orlando',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-26'),
        },
      },
      {
        id: 'fl-tampa',
        name: 'Tampa',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-28'),
        },
      },
    ],
  },
  {
    id: 'il',
    name: 'Illinois',
    abbreviation: 'IL',
    regulatoryDifficulty: 'mixed',
    notes: 'No state-level AV permit required, but local regulations may apply.',
    cities: [
      {
        id: 'il-chicago',
        name: 'Chicago',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2021'),
          permit_applied: createMilestone('permit_applied', 'N/A'),
          permit_received: createMilestone('permit_received', 'N/A'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-07-31'),
        },
      },
    ],
  },
  {
    id: 'ma',
    name: 'Massachusetts',
    abbreviation: 'MA',
    regulatoryDifficulty: 'restrictive',
    avgPermitDays: 240,
    bottleneckStage: 'permit_received',
    notes: 'Requires local approval and state coordination for AV testing.',
    cities: [
      {
        id: 'ma-boston',
        name: 'Boston',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', '?'),
          permit_received: createMilestone('permit_received', '?'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-11-15'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-11-20'),
        },
      },
    ],
  },
  {
    id: 'nv',
    name: 'Nevada',
    abbreviation: 'NV',
    regulatoryDifficulty: 'friendly',
    avgPermitDays: 8,
    notes: 'Pro-AV state with streamlined permit process.',
    cities: [
      {
        id: 'nv-vegas',
        name: 'Las Vegas',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2022'),
          permit_applied: createMilestone('permit_applied', '2025-09-03'),
          permit_received: createMilestone('permit_received', '2025-09-11'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-25'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-10-12'),
          geofence_expanded: createMilestone('geofence_expanded', '2025-11-24'),
        },
      },
    ],
  },
  {
    id: 'ny',
    name: 'New York',
    abbreviation: 'NY',
    regulatoryDifficulty: 'restrictive',
    avgPermitDays: 365,
    bottleneckStage: 'permit_applied',
    notes: 'Strict AV regulations. Tesla Insurance not yet available in New York.',
    cities: [
      {
        id: 'ny-brooklyn',
        name: 'Brooklyn',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', '?'),
          permit_received: createMilestone('permit_received', '?'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
        },
      },
      {
        id: 'ny-queens',
        name: 'Queens',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '1', 'in_progress'),
          permit_applied: createMilestone('permit_applied', '?'),
          permit_received: createMilestone('permit_received', '?'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
        },
      },
    ],
  },
  {
    id: 'tx',
    name: 'Texas',
    abbreviation: 'TX',
    regulatoryDifficulty: 'friendly',
    avgPermitDays: 60,
    bottleneckStage: 'final_regulatory_approval',
    notes: 'Pro-AV state. In 2026, Tesla needs final TxDMV authorization per Senate Bill 2807.',
    cities: [
      {
        id: 'tx-austin',
        name: 'Austin',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2021'),
          permit_applied: createMilestone('permit_applied', 'Unk'),
          permit_received: createMilestone('permit_received', '2025-08-06'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-05-27'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-02'),
          final_regulatory_approval: createMilestone('final_regulatory_approval', '3', 'in_progress'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-05-22'),
          robotaxi_app_access_opens: createMilestone('robotaxi_app_access_opens', '2025-11-18'),
          public_test_program_launched: createMilestone('public_test_program_launched', '2025-06-22'),
          geofence_expanded: createMilestone('geofence_expanded', '2025-07-14'),
          vehicles_deployed_20_plus: createMilestone('vehicles_deployed_20_plus', '30+'),
          no_safety_monitor: createMilestone('no_safety_monitor', '2025-12-14'),
        },
      },
      {
        id: 'tx-dallas',
        name: 'Dallas',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2021'),
          permit_applied: createMilestone('permit_applied', 'Unk'),
          permit_received: createMilestone('permit_received', '2025-08-06'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-08-05'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-15'),
          final_regulatory_approval: createMilestone('final_regulatory_approval', '3', 'in_progress'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-09-23'),
        },
      },
      {
        id: 'tx-houston',
        name: 'Houston',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2021'),
          permit_applied: createMilestone('permit_applied', 'Unk'),
          permit_received: createMilestone('permit_received', '2025-08-06'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '2025-07-30'),
          robotaxi_fleet_support_ads: createMilestone('robotaxi_fleet_support_ads', '2025-10-15'),
          final_regulatory_approval: createMilestone('final_regulatory_approval', '3', 'in_progress'),
        },
      },
      {
        id: 'tx-san-antonio',
        name: 'San Antonio',
        milestones: {
          ...createEmptyMilestones(),
          tesla_insurance_available: createMilestone('tesla_insurance_available', '2021'),
          permit_applied: createMilestone('permit_applied', 'Unk'),
          permit_received: createMilestone('permit_received', '2025-08-06'),
          vehicle_operator_ads: createMilestone('vehicle_operator_ads', '?'),
          route_validation_tests: createMilestone('route_validation_tests', '2025-07-29'),
        },
      },
    ],
  },
];

export function getDashboardData() {
  return {
    states: SEED_DATA,
    lastUpdated: new Date().toISOString(),
  };
}
