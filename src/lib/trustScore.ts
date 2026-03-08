// Public Trust Signal - Scoring Logic & Types

export type TrustConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type TrustStatus = 'strong' | 'moderate' | 'developing' | 'weak';

export interface TrustMetric {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  icon: 'permit' | 'insurance' | 'regulator' | 'media' | 'third_party' | 'government';
  weight: number;
  score: number; // 0-100 contribution
  sources: TrustSource[];
}

export interface TrustSource {
  name: string;
  url?: string;
  date: string;
  type: 'official' | 'regulatory' | 'media' | 'third_party';
  snippet?: string;
}

export interface TrustNegative {
  id: string;
  label: string;
  severity: 'minor' | 'moderate' | 'significant';
  date: string;
  source?: TrustSource;
}

export interface PublicTrustData {
  overallScore: number;
  status: TrustStatus;
  confidence: TrustConfidence;
  metrics: TrustMetric[];
  negatives: TrustNegative[];
  insight: string;
  lastUpdated: string;
}

export interface ScoreBreakdown {
  category: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  description: string;
}

// Status thresholds
export function getStatusFromScore(score: number): TrustStatus {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'moderate';
  if (score >= 25) return 'developing';
  return 'weak';
}

// Status display config
export const statusConfig: Record<TrustStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  strong: {
    label: 'Strong',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  developing: {
    label: 'Developing',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  weak: {
    label: 'Weak',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

// Confidence display config
export const confidenceConfig: Record<TrustConfidence, {
  label: string;
  color: string;
  bgColor: string;
  width: string;
}> = {
  LOW: {
    label: 'Low',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
    width: 'w-1/3',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500',
    width: 'w-2/3',
  },
  HIGH: {
    label: 'High',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
    width: 'w-full',
  },
};

// Calculate score breakdown for transparency
export function calculateScoreBreakdown(metrics: TrustMetric[]): ScoreBreakdown[] {
  return metrics.map(m => ({
    category: m.label,
    weight: m.weight,
    rawScore: m.score,
    weightedScore: (m.score * m.weight) / 100,
    description: `${m.value}${m.subLabel ? ` ${m.subLabel}` : ''}`,
  }));
}

// Calculate overall trust score from metrics
export function calculateTrustScore(metrics: TrustMetric[], negatives: TrustNegative[]): number {
  const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
  const weightedSum = metrics.reduce((sum, m) => sum + (m.score * m.weight), 0);

  let baseScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Deduct for negatives
  negatives.forEach(neg => {
    switch (neg.severity) {
      case 'significant':
        baseScore -= 10;
        break;
      case 'moderate':
        baseScore -= 5;
        break;
      case 'minor':
        baseScore -= 2;
        break;
    }
  });

  return Math.max(0, Math.min(100, Math.round(baseScore)));
}
