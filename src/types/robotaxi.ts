export type MilestoneType =
  | 'tesla_insurance_available'
  | 'permit_applied'
  | 'permit_received'
  | 'vehicle_operator_ads'
  | 'robotaxi_fleet_support_ads'
  | 'final_regulatory_approval'
  | 'lidar_validation_tests'
  | 'robotaxi_app_access_opens'
  | 'public_test_program_launched'
  | 'geofence_expanded'
  | 'vehicles_deployed_20_plus'
  | 'no_safety_monitor';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'unknown' | 'n/a';

export interface Milestone {
  type: MilestoneType;
  status: MilestoneStatus;
  date?: string;
  value?: string; // For things like vehicle count "30+"
  notes?: string;
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
    type: 'lidar_validation_tests',
    label: 'LiDAR Validation Tests',
    shortLabel: 'LiDAR Tests',
    description: 'Third-party LiDAR validation testing completed',
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
