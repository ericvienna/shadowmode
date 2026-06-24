// Public Trust Signal - Mock Data

import type { PublicTrustData, TrustMetric, TrustNegative } from './trustScore';
import { calculateTrustScore, getStatusFromScore } from './trustScore';

const trustMetrics: TrustMetric[] = [
  {
    id: 'permits',
    label: 'Regulatory Permits',
    value: 3,
    subLabel: 'states approved',
    icon: 'permit',
    weight: 30,
    score: 65,
    sources: [
      {
        name: 'Texas DMV',
        url: 'https://www.txdmv.gov',
        date: '2025-06-01',
        type: 'regulatory',
        snippet: 'Tesla approved for robotaxi testing under SB 2807',
      },
      {
        name: 'California CPUC',
        url: 'https://www.cpuc.ca.gov',
        date: '2025-03-18',
        type: 'regulatory',
        snippet: 'TCP permit granted for passenger transport',
      },
      {
        name: 'Nevada DMV',
        url: 'https://dmv.nv.gov',
        date: '2025-02-15',
        type: 'regulatory',
        snippet: 'Autonomous vehicle testing permit approved',
      },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance Coverage',
    value: '$5M',
    subLabel: 'liability per incident',
    icon: 'insurance',
    weight: 20,
    score: 80,
    sources: [
      {
        name: 'Texas Insurance Filing',
        date: '2025-05-15',
        type: 'regulatory',
        snippet: 'Commercial auto liability coverage verified for robotaxi operations',
      },
    ],
  },
  {
    id: 'third_party',
    label: 'Third-Party Validation',
    value: 1,
    subLabel: 'Safety audit completed',
    icon: 'third_party',
    weight: 25,
    score: 70,
    sources: [
      {
        name: 'Third-Party Safety Validation',
        date: '2025-12-10',
        type: 'third_party',
        snippet: 'Independent route and safety validation completed prior to driverless launch in Austin',
      },
    ],
  },
  {
    id: 'public_operation',
    label: 'Public Operations',
    value: '3',
    subLabel: 'driverless markets (TX)',
    icon: 'government',
    weight: 25,
    score: 80,
    sources: [
      {
        name: 'Electrek',
        url: 'https://electrek.co/2026/01/22/tesla-starts-robotaxi-rides-without-safety-monitor-in-austin-what-you-need-to-know/',
        date: '2026-01-22',
        type: 'media',
        snippet: 'Austin: no-in-car-monitor rides begin for a subset of the fleet (mixed fleet; teleoperators remain)',
      },
      {
        name: 'Electrek',
        url: 'https://electrek.co/2026/04/18/tesla-robotaxi-launches-dallas-houston-small-geofences/',
        date: '2026-04-18',
        type: 'media',
        snippet: 'Dallas & Houston launch driverless robotaxi service in small geofences',
      },
    ],
  },
];

const trustNegatives: TrustNegative[] = [
  {
    id: 'nhtsa_investigation',
    label: 'NHTSA Engineering Analysis (EA26002) active',
    severity: 'moderate',
    date: '2026-03-18',
    source: {
      name: 'NHTSA',
      url: 'https://www.nhtsa.gov',
      date: '2026-03-18',
      type: 'regulatory',
      snippet: 'Formal Engineering Analysis EA26002 covers ~3.2M FSD vehicles; 17 robotaxi crash incidents reported (2 teleoperator-caused).',
    },
  },
  {
    id: 'ca_restrictions',
    label: 'CA: supervised-only, no AV permit (CPUC)',
    severity: 'minor',
    date: '2026-03-25',
  },
];

// Calculate the overall score
const overallScore = calculateTrustScore(trustMetrics, trustNegatives);

export const mockTrustData: PublicTrustData = {
  overallScore,
  status: getStatusFromScore(overallScore),
  confidence: 'MEDIUM',
  metrics: trustMetrics,
  negatives: trustNegatives,
  insight: 'Analyst assessment from public sources — not a live feed; updated periodically. As of Jun 2026: Tesla runs driverless rides in Austin (since Jan 2026) plus Dallas & Houston (since Apr 2026); the Bay Area service is supervised-only (no CA AV permit). A formal NHTSA Engineering Analysis (EA26002) covers ~3.2M FSD vehicles.',
  lastUpdated: '2026-06-19',
};
