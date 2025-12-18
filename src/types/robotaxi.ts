export type MilestoneType =
  | 'tesla_insurance_available'
  | 'permit_applied'
  | 'permit_received'
  | 'vehicle_operator_ads'
  | 'robotaxi_fleet_support_ads'
  | 'final_regulatory_approval'
  | 'route_validation_tests'
  | 'robotaxi_app_access_opens'
  | 'public_test_program_launched'
  | 'geofence_expanded'
  | 'vehicles_deployed_20_plus'
  | 'no_safety_monitor';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'unknown' | 'n/a';

// Source and confidence scoring for milestones
export type MilestoneSource = 'tesla_official' | 'regulator' | 'media' | 'inferred';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Milestone {
  type: MilestoneType;
  status: MilestoneStatus;
  date?: string;
  value?: string; // For things like vehicle count "30+"
  notes?: string;
  source?: MilestoneSource;
  confidence?: ConfidenceLevel;
}

// Regulatory friction scoring
export type RegulatoryDifficulty = 'friendly' | 'mixed' | 'restrictive';

// Readiness Index weights (0-100 scale)
export interface ReadinessWeights {
  regulatory_approval: number;      // 30%
  insurance_live: number;           // 20%
  app_access_onboarding: number;    // 15%
  fleet_deployed: number;           // 15%
  driverless_achieved: number;      // 20%
}

export interface ReadinessScore {
  cityId: string;
  cityName: string;
  score: number;          // 0-100
  breakdown: {
    regulatory: number;
    insurance: number;
    appAccess: number;
    fleet: number;
    driverless: number;
  };
  trend: 'rising' | 'stable' | 'new';
}

// Time-to-Driverless Projection
export type ProjectionRange = '3-5 months' | '6-9 months' | '9-12 months' | '>12 months' | 'achieved';

export interface TimeToDriverlessProjection {
  cityId: string;
  cityName: string;
  currentProgress: number;          // 0-100%
  estimatedRange: ProjectionRange;
  basedOn: string;                  // "Austin baseline" or custom
  confidenceLevel: ConfidenceLevel;
  factors: string[];                // ["Strong regulatory environment", "Fleet already deployed"]
}

// Rollout Velocity Metrics
export type VelocityTrend = 'accelerating' | 'stable' | 'slowing';

export interface VelocityMetrics {
  newCitiesThisMonth: number;
  newCitiesLastMonth: number;
  testLaunchesThisQuarter: number;
  testLaunchesLastQuarter: number;
  driverlessEventsThisYear: number;
  overallTrend: VelocityTrend;
  monthlyTrend: number[];           // Last 6 months of new city entries
}

// Safety Signal Metrics
export interface SafetyMetrics {
  estimatedMilesDriven: number;
  incidentHeadlinesLast90Days: number;
  daysSinceLastIncident: number | null;
  safetyRating: 'excellent' | 'good' | 'monitoring';
  lastUpdated: string;
}

// Economic Impact Estimates
export interface EconomicImpact {
  cityId: string;
  cityName: string;
  estimatedFleetSize: number;
  estimatedRidesPerDay: { low: number; high: number };
  estimatedAnnualRevenue: { low: number; high: number };
  confidenceLevel: ConfidenceLevel;
}

export interface NationalEconomicSummary {
  trackedCities: number;
  totalEstimatedFleet: number;
  totalAnnualTAM: { low: number; high: number };
  activeMarketRevenue: { low: number; high: number };
}

// News-Milestone Causality
export interface NewsImpact {
  newsId: string;
  headline: string;
  date: string;
  affectedCities: string[];
  affectedMilestones: MilestoneType[];
  impactDescription: string;
}

// Executive Summary (algorithmically generated)
export interface ExecutiveSummary {
  headline: string;
  newCitiesLast60Days: number;
  projectedDriverlessNext6Months: number;
  velocityStatus: VelocityTrend;
  keyHighlights: string[];
  generatedAt: string;
}

export interface City {
  id: string;
  name: string;
  milestones: Record<MilestoneType, Milestone>;
}

export interface State {
  id: string;
  name: string;
  abbreviation: string;
  cities: City[];
  notes?: string;
  regulatoryDifficulty?: RegulatoryDifficulty;
  avgPermitDays?: number;           // Average days in permit stage
  bottleneckStage?: MilestoneType;  // Which stage takes longest
}

export interface DashboardData {
  states: State[];
  lastUpdated: string;
}

export interface MilestoneDefinition {
  type: MilestoneType;
  label: string;
  shortLabel: string;
  description: string;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    type: 'tesla_insurance_available',
    label: 'Tesla Insurance Available',
    shortLabel: 'Insurance',
    description: 'Tesla Insurance is available in this state',
  },
  {
    type: 'permit_applied',
    label: 'Permit Applied',
    shortLabel: 'Applied',
    description: 'Tesla has applied for AV testing/deployment permit',
  },
  {
    type: 'permit_received',
    label: 'Permit Received',
    shortLabel: 'Permit',
    description: 'Tesla has received AV testing/deployment permit',
  },
  {
    type: 'vehicle_operator_ads',
    label: 'Vehicle Operator Job Ads',
    shortLabel: 'Operator Ads',
    description: 'Tesla is advertising for vehicle operator positions',
  },
  {
    type: 'robotaxi_fleet_support_ads',
    label: 'Fleet Support Job Ads',
    shortLabel: 'Fleet Ads',
    description: 'Tesla is advertising for fleet support positions',
  },
  {
    type: 'final_regulatory_approval',
    label: 'Final Regulatory Approval',
    shortLabel: 'Approval',
    description: 'Full regulatory approval received for autonomous operation',
  },
  {
    type: 'route_validation_tests',
    label: 'Route Validation Tests',
    shortLabel: 'Route Val',
    description: 'Route mapping and safety validation testing completed',
  },
  {
    type: 'robotaxi_app_access_opens',
    label: 'Robotaxi App Access Opens',
    shortLabel: 'App Access',
    description: 'Robotaxi app becomes available for riders',
  },
  {
    type: 'public_test_program_launched',
    label: 'Public Test Program Launched',
    shortLabel: 'Test Launch',
    description: 'Public testing program has begun',
  },
  {
    type: 'geofence_expanded',
    label: 'Geofence Expanded',
    shortLabel: 'Expanded',
    description: 'Operating area has been expanded',
  },
  {
    type: 'vehicles_deployed_20_plus',
    label: '20+ Vehicles Deployed',
    shortLabel: 'Vehicles',
    description: 'At least 20 vehicles deployed in this market',
  },
  {
    type: 'no_safety_monitor',
    label: 'No Safety Monitor',
    shortLabel: 'Driverless',
    description: 'Vehicles operating without human safety monitor',
  },
];
