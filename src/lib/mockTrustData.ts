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
    value: '6+',
    subLabel: 'months supervised rides',
    icon: 'government',
    weight: 25,
    score: 75,
    sources: [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/2025/06/22/tesla-launches-robotaxi-rides-in-austin/',
        date: '2025-06-22',
        type: 'media',
        snippet: 'Tesla robotaxi service launched in Austin with safety monitors',
      },
      {
        name: 'Tesla Official',
        date: '2025-12-14',
        type: 'official',
        snippet: 'Driverless operation commenced after 6 months of supervised testing',
      },
    ],
  },
];

const trustNegatives: TrustNegative[] = [
  {
    id: 'nhtsa_investigation',
    label: 'NHTSA FSD investigation active',
    severity: 'moderate',
    date: '2025-10-09',
    source: {
      name: 'NHTSA',
      url: 'https://www.nhtsa.gov',
      date: '2025-10-09',
      type: 'regulatory',
      snippet: 'Investigation covers 2.9M vehicles for FSD-related traffic violations',
    },
  },
  {
    id: 'ca_restrictions',
    label: 'CA driverless permit pending',
    severity: 'minor',
    date: '2025-12-01',
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
  insight: 'Tesla has secured key permits and completed third-party validation in Austin. Permission to scale is progressing, though California driverless approval remains pending.',
  lastUpdated: '2025-12-16',
};
