import { formatDistanceToNow, format, parseISO, differenceInDays, isAfter, subDays } from 'date-fns';
import type { State, MilestoneStatus, City, MilestoneType, Milestone } from '@/types/robotaxi';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';

export interface ActivityItem {
  id: string;
  cityName: string;
  stateName: string;
  stateAbbr: string;
  milestoneType: MilestoneType;
  milestoneLabel: string;
  status: MilestoneStatus;
  date: string;
  value?: string;
  daysAgo: number;
}

export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatDate(dateString: string): string {
  // Handle year-only dates
  if (/^\d{4}$/.test(dateString)) {
    return dateString;
  }
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  // Handle year-only dates
  if (/^\d{4}$/.test(dateString)) {
    return dateString;
  }
  try {
    return format(parseISO(dateString), 'M/d/yy');
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: MilestoneStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'in_progress':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'not_started':
      return 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30';
    case 'unknown':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'n/a':
      return 'bg-neutral-900 text-neutral-600 border-neutral-800';
    default:
      return 'bg-neutral-800/50 text-neutral-500 border-neutral-700/30';
  }
}

export function getStatusDot(status: MilestoneStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-yellow-500';
    case 'not_started':
      return 'bg-neutral-600';
    case 'unknown':
      return 'bg-blue-500';
    case 'n/a':
      return 'bg-neutral-700';
    default:
      return 'bg-neutral-600';
  }
}

export function calculateStats(states: State[]) {
  let totalCities = 0;
  let citiesWithActivity = 0;
  let citiesWithDriverless = 0;
  let totalVehicles = 0;
  let citiesWithPublicProgram = 0;

  states.forEach(state => {
    state.cities.forEach(city => {
      totalCities++;

      // Check if any milestone is not 'not_started'
      const hasActivity = Object.values(city.milestones).some(
        m => m.status !== 'not_started'
      );
      if (hasActivity) citiesWithActivity++;

      // Check for driverless operation
      if (city.milestones.no_safety_monitor.status === 'completed') {
        citiesWithDriverless++;
      }

      // Count vehicles
      const vehicleMilestone = city.milestones.vehicles_deployed_20_plus;
      if (vehicleMilestone.value) {
        const match = vehicleMilestone.value.match(/(\d+)/);
        if (match) {
          totalVehicles += parseInt(match[1]);
        }
      }

      // Public program
      if (city.milestones.public_test_program_launched.status === 'completed') {
        citiesWithPublicProgram++;
      }
    });
  });

  return {
    totalCities,
    citiesWithActivity,
    citiesWithDriverless,
    totalVehicles,
    citiesWithPublicProgram,
    statesCount: states.length,
  };
}

export function getCityProgress(city: City): number {
  const milestones = Object.values(city.milestones);
  const completed = milestones.filter(m => m.status === 'completed').length;
  const inProgress = milestones.filter(m => m.status === 'in_progress').length;
  const applicable = milestones.filter(m => m.status !== 'n/a').length;

  if (applicable === 0) return 0;
  return Math.round(((completed + inProgress * 0.5) / applicable) * 100);
}

export function getMilestoneCount(states: State[], milestone: MilestoneType): { completed: number; inProgress: number; total: number } {
  let completed = 0;
  let inProgress = 0;
  let total = 0;

  states.forEach(state => {
    state.cities.forEach(city => {
      const m = city.milestones[milestone];
      if (m.status !== 'n/a') {
        total++;
        if (m.status === 'completed') completed++;
        if (m.status === 'in_progress') inProgress++;
      }
    });
  });

  return { completed, inProgress, total };
}

// Check if a milestone date is within the last N days
export function isRecentMilestone(milestone: Milestone, days: number = 30): boolean {
  if (!milestone.date || milestone.status !== 'completed') return false;

  // Skip year-only dates for "recent" check
  if (/^\d{4}$/.test(milestone.date)) return false;

  try {
    const milestoneDate = parseISO(milestone.date);
    const cutoffDate = subDays(new Date(), days);
    return isAfter(milestoneDate, cutoffDate);
  } catch {
    return false;
  }
}

// Get all recent activities sorted by date
export function getRecentActivity(states: State[], days: number = 90): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const cutoffDate = subDays(new Date(), days);

  states.forEach(state => {
    state.cities.forEach(city => {
      Object.entries(city.milestones).forEach(([type, milestone]) => {
        if (milestone.date && milestone.status === 'completed') {
          // Skip year-only dates
          if (/^\d{4}$/.test(milestone.date)) return;

          try {
            const milestoneDate = parseISO(milestone.date);
            if (isAfter(milestoneDate, cutoffDate)) {
              const def = MILESTONE_DEFINITIONS.find(d => d.type === type);
              activities.push({
                id: `${city.id}-${type}`,
                cityName: city.name,
                stateName: state.name,
                stateAbbr: state.abbreviation,
                milestoneType: type as MilestoneType,
                milestoneLabel: def?.label || type,
                status: milestone.status,
                date: milestone.date,
                value: milestone.value,
                daysAgo: differenceInDays(new Date(), milestoneDate),
              });
            }
          } catch {
            // Skip invalid dates
          }
        }
      });
    });
  });

  // Sort by date descending (most recent first)
  return activities.sort((a, b) => a.daysAgo - b.daysAgo);
}

// Get countdown stats
export function getCountdownStats(states: State[]) {
  let mostRecentMilestone: { city: string; state: string; milestone: string; date: string; daysAgo: number } | null = null;
  let citiesUntilNextDriverless = 0;
  let milestonesThisMonth = 0;

  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  states.forEach(state => {
    state.cities.forEach(city => {
      // Check for cities close to driverless (have most milestones but not no_safety_monitor)
      const hasPublicProgram = city.milestones.public_test_program_launched.status === 'completed';
      const hasVehicles = city.milestones.vehicles_deployed_20_plus.status === 'completed';
      const notDriverless = city.milestones.no_safety_monitor.status !== 'completed';

      if (hasPublicProgram && hasVehicles && notDriverless) {
        citiesUntilNextDriverless++;
      }

      Object.entries(city.milestones).forEach(([type, milestone]) => {
        if (milestone.date && milestone.status === 'completed' && !/^\d{4}$/.test(milestone.date)) {
          try {
            const milestoneDate = parseISO(milestone.date);
            const daysAgo = differenceInDays(now, milestoneDate);

            // Count milestones in last 30 days
            if (isAfter(milestoneDate, thirtyDaysAgo)) {
              milestonesThisMonth++;
            }

            // Track most recent
            if (!mostRecentMilestone || daysAgo < mostRecentMilestone.daysAgo) {
              const def = MILESTONE_DEFINITIONS.find(d => d.type === type);
              mostRecentMilestone = {
                city: city.name,
                state: state.abbreviation,
                milestone: def?.shortLabel || type,
                date: milestone.date,
                daysAgo,
              };
            }
          } catch {
            // Skip invalid dates
          }
        }
      });
    });
  });

  return {
    mostRecentMilestone,
    citiesUntilNextDriverless,
    milestonesThisMonth,
  };
}

// Generate sparkline data for a city's progress over time
export function getCitySparklineData(city: City): number[] {
  const milestoneOrder: MilestoneType[] = [
    'tesla_insurance_available',
    'permit_applied',
    'permit_received',
    'vehicle_operator_ads',
    'robotaxi_fleet_support_ads',
    'final_regulatory_approval',
    'lidar_validation_tests',
    'robotaxi_app_access_opens',
    'public_test_program_launched',
    'geofence_expanded',
    'vehicles_deployed_20_plus',
    'no_safety_monitor',
  ];

  let cumulative = 0;
  return milestoneOrder.map(type => {
    const milestone = city.milestones[type];
    if (milestone.status === 'completed') {
      cumulative += 1;
    } else if (milestone.status === 'in_progress') {
      cumulative += 0.5;
    }
    return cumulative;
  });
}
