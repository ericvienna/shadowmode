import { formatDistanceToNow, format, parseISO, differenceInDays, isAfter, subDays, subMonths } from 'date-fns';
import type {
  State,
  MilestoneStatus,
  City,
  MilestoneType,
  Milestone,
  ReadinessScore,
  TimeToDriverlessProjection,
  ProjectionRange,
  VelocityMetrics,
  VelocityTrend,
  SafetyMetrics,
  EconomicImpact,
  NationalEconomicSummary,
  ExecutiveSummary,
  ConfidenceLevel,
} from '@/types/robotaxi';
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
    'route_validation_tests',
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

// ============================================
// INVESTOR INTELLIGENCE CALCULATIONS
// ============================================

// Readiness weights (must sum to 100)
const READINESS_WEIGHTS = {
  regulatory: 30,    // Final regulatory approval + permits
  insurance: 20,     // Tesla Insurance available
  appAccess: 15,     // App access + public program
  fleet: 15,         // Vehicles deployed + fleet support
  driverless: 20,    // No safety monitor achieved
};

/**
 * Calculate Readiness Score for a city (0-100)
 * Weighted score based on milestone completion
 */
export function calculateReadinessScore(city: City, stateName: string): ReadinessScore {
  const m = city.milestones;

  // Regulatory component (30%): permits + final approval
  let regulatoryScore = 0;
  if (m.permit_received.status === 'completed') regulatoryScore += 10;
  else if (m.permit_applied.status === 'completed' || m.permit_applied.status === 'in_progress') regulatoryScore += 5;
  if (m.final_regulatory_approval.status === 'completed') regulatoryScore += 15;
  else if (m.final_regulatory_approval.status === 'in_progress') regulatoryScore += 7;
  if (m.route_validation_tests.status === 'completed') regulatoryScore += 5;
  regulatoryScore = Math.min(regulatoryScore, READINESS_WEIGHTS.regulatory);

  // Insurance component (20%)
  let insuranceScore = 0;
  if (m.tesla_insurance_available.status === 'completed') insuranceScore = READINESS_WEIGHTS.insurance;
  else if (m.tesla_insurance_available.status === 'in_progress') insuranceScore = READINESS_WEIGHTS.insurance * 0.5;

  // App Access component (15%): app access + public program
  let appAccessScore = 0;
  if (m.robotaxi_app_access_opens.status === 'completed') appAccessScore += 8;
  if (m.public_test_program_launched.status === 'completed') appAccessScore += 7;
  else if (m.public_test_program_launched.status === 'in_progress') appAccessScore += 3;
  appAccessScore = Math.min(appAccessScore, READINESS_WEIGHTS.appAccess);

  // Fleet component (15%): vehicles + support + operator ads
  let fleetScore = 0;
  if (m.vehicles_deployed_20_plus.status === 'completed') fleetScore += 8;
  if (m.robotaxi_fleet_support_ads.status === 'completed') fleetScore += 4;
  else if (m.robotaxi_fleet_support_ads.status === 'in_progress') fleetScore += 2;
  if (m.vehicle_operator_ads.status === 'completed') fleetScore += 3;
  fleetScore = Math.min(fleetScore, READINESS_WEIGHTS.fleet);

  // Driverless component (20%)
  let driverlessScore = 0;
  if (m.no_safety_monitor.status === 'completed') driverlessScore = READINESS_WEIGHTS.driverless;
  else if (m.geofence_expanded.status === 'completed') driverlessScore = 5;

  const totalScore = Math.round(regulatoryScore + insuranceScore + appAccessScore + fleetScore + driverlessScore);

  // Determine trend based on recent activity
  const recentMilestones = Object.values(m).filter(milestone =>
    milestone.date &&
    milestone.status === 'completed' &&
    !/^\d{4}$/.test(milestone.date) &&
    differenceInDays(new Date(), parseISO(milestone.date)) <= 60
  ).length;

  const trend = recentMilestones >= 2 ? 'rising' : recentMilestones === 1 ? 'stable' : 'new';

  return {
    cityId: city.id,
    cityName: `${city.name}, ${stateName}`,
    score: totalScore,
    breakdown: {
      regulatory: regulatoryScore,
      insurance: insuranceScore,
      appAccess: appAccessScore,
      fleet: fleetScore,
      driverless: driverlessScore,
    },
    trend,
  };
}

/**
 * Calculate all city readiness scores
 */
export function calculateAllReadinessScores(states: State[]): ReadinessScore[] {
  const scores: ReadinessScore[] = [];
  states.forEach(state => {
    state.cities.forEach(city => {
      scores.push(calculateReadinessScore(city, state.abbreviation));
    });
  });
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Calculate state average readiness
 */
export function calculateStateReadiness(states: State[]): { stateId: string; stateName: string; avgScore: number; cityCount: number }[] {
  return states.map(state => {
    const cityScores = state.cities.map(city => calculateReadinessScore(city, state.abbreviation).score);
    const avgScore = cityScores.length > 0
      ? Math.round(cityScores.reduce((a, b) => a + b, 0) / cityScores.length)
      : 0;
    return {
      stateId: state.id,
      stateName: state.name,
      avgScore,
      cityCount: state.cities.length,
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
}

/**
 * Calculate national readiness trend (sparkline data)
 */
export function calculateNationalReadinessTrend(states: State[]): number[] {
  // Simulate 6-month trend based on milestone dates
  const now = new Date();
  const trend: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    let totalScore = 0;
    let cityCount = 0;

    states.forEach(state => {
      state.cities.forEach(city => {
        // Count milestones completed before this month
        const completedBefore = Object.values(city.milestones).filter(m => {
          if (m.status !== 'completed' || !m.date) return false;
          if (/^\d{4}$/.test(m.date)) return true; // Year-only dates count as old
          try {
            return isAfter(monthDate, parseISO(m.date)) || m.date <= format(monthDate, 'yyyy-MM-dd');
          } catch {
            return false;
          }
        }).length;

        // Rough score estimate based on milestone count
        totalScore += Math.min(completedBefore * 8, 100);
        cityCount++;
      });
    });

    trend.push(cityCount > 0 ? Math.round(totalScore / cityCount) : 0);
  }

  return trend;
}

// Austin baseline: ~7 months from first test to driverless (June 2025 → Dec 2025)
const AUSTIN_BASELINE_DAYS = 180;

/**
 * Calculate Time-to-Driverless projection for a city
 */
export function calculateTimeToDriverless(city: City, state: State): TimeToDriverlessProjection {
  const m = city.milestones;
  const progress = getCityProgress(city);

  // Already achieved
  if (m.no_safety_monitor.status === 'completed') {
    return {
      cityId: city.id,
      cityName: `${city.name}, ${state.abbreviation}`,
      currentProgress: progress,
      estimatedRange: 'achieved',
      basedOn: 'Completed',
      confidenceLevel: 'high',
      factors: ['Driverless operation active'],
    };
  }

  const factors: string[] = [];
  let baseEstimateDays = AUSTIN_BASELINE_DAYS;

  // Regulatory friction adjustment
  if (state.regulatoryDifficulty === 'friendly') {
    baseEstimateDays *= 0.8;
    factors.push('Friendly regulatory environment');
  } else if (state.regulatoryDifficulty === 'restrictive') {
    baseEstimateDays *= 1.5;
    factors.push('Restrictive regulatory environment');
  } else {
    factors.push('Mixed regulatory environment');
  }

  // Progress-based adjustment
  const progressMultiplier = 1 - (progress / 100) * 0.7;
  baseEstimateDays *= progressMultiplier;

  // Key milestone bonuses
  if (m.public_test_program_launched.status === 'completed') {
    baseEstimateDays *= 0.6;
    factors.push('Public test program active');
  }
  if (m.vehicles_deployed_20_plus.status === 'completed') {
    baseEstimateDays *= 0.8;
    factors.push('Fleet deployed');
  }
  if (m.final_regulatory_approval.status === 'completed') {
    baseEstimateDays *= 0.5;
    factors.push('Regulatory approval secured');
  }
  if (m.robotaxi_app_access_opens.status === 'completed') {
    baseEstimateDays *= 0.7;
    factors.push('App access live');
  }

  // Determine range
  let estimatedRange: ProjectionRange;
  let confidenceLevel: ConfidenceLevel;

  if (baseEstimateDays <= 150) {
    estimatedRange = '3-5 months';
    confidenceLevel = progress > 60 ? 'medium' : 'low';
  } else if (baseEstimateDays <= 270) {
    estimatedRange = '6-9 months';
    confidenceLevel = progress > 40 ? 'medium' : 'low';
  } else if (baseEstimateDays <= 365) {
    estimatedRange = '9-12 months';
    confidenceLevel = 'low';
  } else {
    estimatedRange = '>12 months';
    confidenceLevel = 'low';
  }

  // No real progress = very uncertain
  if (progress < 20) {
    estimatedRange = '>12 months';
    confidenceLevel = 'low';
    factors.push('Early stage - high uncertainty');
  }

  return {
    cityId: city.id,
    cityName: `${city.name}, ${state.abbreviation}`,
    currentProgress: progress,
    estimatedRange,
    basedOn: 'Austin baseline + regulatory factors',
    confidenceLevel,
    factors: factors.slice(0, 4), // Limit to 4 factors
  };
}

/**
 * Calculate all time-to-driverless projections
 */
export function calculateAllProjections(states: State[]): TimeToDriverlessProjection[] {
  const projections: TimeToDriverlessProjection[] = [];
  states.forEach(state => {
    state.cities.forEach(city => {
      projections.push(calculateTimeToDriverless(city, state));
    });
  });
  return projections.sort((a, b) => {
    const order: Record<ProjectionRange, number> = {
      'achieved': 0,
      '3-5 months': 1,
      '6-9 months': 2,
      '9-12 months': 3,
      '>12 months': 4,
    };
    return order[a.estimatedRange] - order[b.estimatedRange];
  });
}

/**
 * Calculate Rollout Velocity Metrics
 */
export function calculateVelocityMetrics(states: State[]): VelocityMetrics {
  const now = new Date();
  const thisMonth = subDays(now, 30);
  const lastMonth = subDays(now, 60);
  const thisQuarter = subDays(now, 90);
  const lastQuarter = subDays(now, 180);
  const thisYear = subDays(now, 365);

  let newCitiesThisMonth = 0;
  let newCitiesLastMonth = 0;
  let testLaunchesThisQuarter = 0;
  let testLaunchesLastQuarter = 0;
  let driverlessEventsThisYear = 0;

  // Monthly trend (last 6 months)
  const monthlyTrend: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = subMonths(now, i + 1);
    const monthEnd = subMonths(now, i);
    let count = 0;

    states.forEach(state => {
      state.cities.forEach(city => {
        // Count cities that got their first "real" milestone this month
        const firstMilestone = Object.values(city.milestones).find(m =>
          m.status === 'completed' &&
          m.date &&
          !/^\d{4}$/.test(m.date)
        );
        if (firstMilestone?.date) {
          try {
            const date = parseISO(firstMilestone.date);
            if (isAfter(date, monthStart) && !isAfter(date, monthEnd)) {
              count++;
            }
          } catch { /* skip */ }
        }
      });
    });
    monthlyTrend.push(count);
  }

  states.forEach(state => {
    state.cities.forEach(city => {
      const m = city.milestones;

      // Check for activity in periods
      Object.values(m).forEach(milestone => {
        if (milestone.status === 'completed' && milestone.date && !/^\d{4}$/.test(milestone.date)) {
          try {
            const date = parseISO(milestone.date);

            // New cities (first activity)
            if (isAfter(date, thisMonth)) newCitiesThisMonth++;
            else if (isAfter(date, lastMonth)) newCitiesLastMonth++;
          } catch { /* skip */ }
        }
      });

      // Test launches
      if (m.public_test_program_launched.status === 'completed' && m.public_test_program_launched.date) {
        try {
          const date = parseISO(m.public_test_program_launched.date);
          if (isAfter(date, thisQuarter)) testLaunchesThisQuarter++;
          else if (isAfter(date, lastQuarter)) testLaunchesLastQuarter++;
        } catch { /* skip */ }
      }

      // Driverless events
      if (m.no_safety_monitor.status === 'completed' && m.no_safety_monitor.date) {
        try {
          const date = parseISO(m.no_safety_monitor.date);
          if (isAfter(date, thisYear)) driverlessEventsThisYear++;
        } catch { /* skip */ }
      }
    });
  });

  // Determine trend (month-over-month comparison)
  let overallTrend: VelocityTrend;

  // Compare this month vs last month activity
  if (newCitiesThisMonth > newCitiesLastMonth * 1.2) {
    overallTrend = 'accelerating';
  } else if (newCitiesThisMonth < newCitiesLastMonth * 0.8) {
    overallTrend = 'slowing';
  } else {
    overallTrend = 'stable';
  }

  return {
    newCitiesThisMonth,
    newCitiesLastMonth,
    testLaunchesThisQuarter,
    testLaunchesLastQuarter,
    driverlessEventsThisYear,
    overallTrend,
    monthlyTrend,
  };
}

/**
 * Calculate Safety Metrics (estimated based on available data)
 */
export function calculateSafetyMetrics(states: State[]): SafetyMetrics {
  // These are estimates based on public information
  // In a real app, would pull from news API or official sources
  const stats = calculateStats(states);

  // Estimate miles: ~100 miles/day per vehicle for testing
  const estimatedMilesDriven = stats.totalVehicles * 100 * 180; // 6 months of testing

  return {
    estimatedMilesDriven,
    incidentHeadlinesLast90Days: 0, // Would come from news API
    daysSinceLastIncident: null,    // No known incidents
    safetyRating: 'excellent',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Calculate Economic Impact for a city
 */
export function calculateCityEconomicImpact(city: City, stateAbbr: string): EconomicImpact {
  const m = city.milestones;

  // Extract vehicle count
  let estimatedFleetSize = 0;
  if (m.vehicles_deployed_20_plus.value) {
    const match = m.vehicles_deployed_20_plus.value.match(/(\d+)/);
    if (match) estimatedFleetSize = parseInt(match[1]);
  } else if (m.vehicles_deployed_20_plus.status === 'completed') {
    estimatedFleetSize = 20;
  }

  // Estimate rides per day (based on fleet size and operational status)
  const isOperational = m.public_test_program_launched.status === 'completed';
  const ridesPerVehicle = isOperational ? { low: 8, high: 15 } : { low: 0, high: 0 };

  const estimatedRidesPerDay = {
    low: estimatedFleetSize * ridesPerVehicle.low,
    high: estimatedFleetSize * ridesPerVehicle.high,
  };

  // Estimate annual revenue ($15-25 per ride average)
  const revenuePerRide = { low: 15, high: 25 };
  const estimatedAnnualRevenue = {
    low: estimatedRidesPerDay.low * revenuePerRide.low * 365,
    high: estimatedRidesPerDay.high * revenuePerRide.high * 365,
  };

  // Confidence based on data availability
  let confidenceLevel: ConfidenceLevel = 'low';
  if (m.vehicles_deployed_20_plus.value && isOperational) confidenceLevel = 'medium';
  if (m.no_safety_monitor.status === 'completed') confidenceLevel = 'medium';

  return {
    cityId: city.id,
    cityName: `${city.name}, ${stateAbbr}`,
    estimatedFleetSize,
    estimatedRidesPerDay,
    estimatedAnnualRevenue,
    confidenceLevel,
  };
}

/**
 * Calculate National Economic Summary
 */
export function calculateNationalEconomicSummary(states: State[]): NationalEconomicSummary {
  let totalEstimatedFleet = 0;
  let totalAnnualTAMLow = 0;
  let totalAnnualTAMHigh = 0;
  let activeMarketRevenueLow = 0;
  let activeMarketRevenueHigh = 0;
  let trackedCities = 0;

  states.forEach(state => {
    state.cities.forEach(city => {
      trackedCities++;
      const impact = calculateCityEconomicImpact(city, state.abbreviation);
      totalEstimatedFleet += impact.estimatedFleetSize;

      // TAM includes all cities
      totalAnnualTAMLow += impact.estimatedAnnualRevenue.low || 0;
      totalAnnualTAMHigh += impact.estimatedAnnualRevenue.high || 0;

      // Active market revenue only from cities with public programs
      if (city.milestones.public_test_program_launched.status === 'completed') {
        activeMarketRevenueLow += impact.estimatedAnnualRevenue.low || 0;
        activeMarketRevenueHigh += impact.estimatedAnnualRevenue.high || 0;
      }
    });
  });

  return {
    trackedCities,
    totalEstimatedFleet,
    totalAnnualTAM: { low: totalAnnualTAMLow, high: totalAnnualTAMHigh },
    activeMarketRevenue: { low: activeMarketRevenueLow, high: activeMarketRevenueHigh },
  };
}

/**
 * Generate Executive Summary (algorithmically generated headline)
 */
export function generateExecutiveSummary(states: State[]): ExecutiveSummary {
  const velocity = calculateVelocityMetrics(states);
  const projections = calculateAllProjections(states);
  const readiness = calculateAllReadinessScores(states);

  // Count cities in various states
  const achievedCount = projections.filter(p => p.estimatedRange === 'achieved').length;
  const nearTermCount = projections.filter(p =>
    p.estimatedRange === '3-5 months' || p.estimatedRange === '6-9 months'
  ).length;
  const risingCities = readiness.filter(r => r.trend === 'rising').length;

  // Build headline
  let headline: string;
  if (velocity.overallTrend === 'accelerating') {
    headline = `Robotaxi deployment accelerating: ${velocity.newCitiesThisMonth + velocity.newCitiesLastMonth} cities showed new activity in the last 60 days`;
    if (nearTermCount > 0) {
      headline += `, with ${nearTermCount} projected to reach driverless within 9 months.`;
    } else {
      headline += '.';
    }
  } else if (achievedCount > 0) {
    headline = `${achievedCount} ${achievedCount === 1 ? 'city has' : 'cities have'} achieved driverless operation. ${nearTermCount} more projected within 9 months.`;
  } else {
    headline = `${readiness.length} cities tracked across ${states.length} states. ${risingCities} showing accelerating progress.`;
  }

  // Key highlights
  const highlights: string[] = [];
  if (achievedCount > 0) highlights.push(`${achievedCount} driverless market${achievedCount > 1 ? 's' : ''} active`);
  if (velocity.testLaunchesThisQuarter > 0) highlights.push(`${velocity.testLaunchesThisQuarter} new test launches this quarter`);
  if (risingCities > 0) highlights.push(`${risingCities} cities with rising momentum`);
  const friendlyStates = states.filter(s => s.regulatoryDifficulty === 'friendly').length;
  if (friendlyStates > 0) highlights.push(`${friendlyStates} AV-friendly states in pipeline`);

  return {
    headline,
    newCitiesLast60Days: velocity.newCitiesThisMonth + velocity.newCitiesLastMonth,
    projectedDriverlessNext6Months: projections.filter(p =>
      p.estimatedRange === '3-5 months' || p.estimatedRange === '6-9 months'
    ).length,
    velocityStatus: velocity.overallTrend,
    keyHighlights: highlights.slice(0, 4),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get regulatory friction summary
 */
export function getRegulatoryFrictionSummary(states: State[]) {
  const friendly = states.filter(s => s.regulatoryDifficulty === 'friendly');
  const mixed = states.filter(s => s.regulatoryDifficulty === 'mixed');
  const restrictive = states.filter(s => s.regulatoryDifficulty === 'restrictive');

  return {
    friendly: friendly.map(s => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      avgPermitDays: s.avgPermitDays,
      cityCount: s.cities.length,
    })),
    mixed: mixed.map(s => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      avgPermitDays: s.avgPermitDays,
      cityCount: s.cities.length,
    })),
    restrictive: restrictive.map(s => ({
      id: s.id,
      name: s.name,
      abbreviation: s.abbreviation,
      avgPermitDays: s.avgPermitDays,
      cityCount: s.cities.length,
    })),
  };
}
