export type XSignalType =
  | 'sighting'
  | 'reply_confirmation'
  | 'promise'
  | 'incident'
  | 'competitive'
  | 'stokes_update'
  | 'geofence'
  | 'official';

export type PromiseStatus = 'kept' | 'missed' | 'in_progress' | 'pending';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface RawTweet {
  id: string;
  handle: string;
  displayName: string;
  text: string;
  url: string;
  createdAt: string;
  isReply: boolean;
  replyToHandle?: string;
  hasMedia: boolean;
  likes: number;
  retweets: number;
  views?: number;
  cities: string[];
  signalTypes: XSignalType[];
  sentiment: SentimentLabel;
  credibilityScore: number;
}

export interface ShadowSignal {
  id: string;
  handle: string;
  text: string;
  url: string;
  createdAt: string;
  cityId?: string;
  cityName?: string;
  hasVideo: boolean;
  credibilityScore: number;
  hoursBeforeNews?: number;
  sentiment: SentimentLabel;
}

export interface ReplyConfirmation {
  id: string;
  communityTweet: {
    handle: string;
    text: string;
    url: string;
    createdAt: string;
  };
  elonReply: {
    text: string;
    url: string;
    createdAt: string;
  };
  cityId?: string;
  cityName?: string;
  milestoneHint?: string;
  confidence: ConfidenceTier;
  confidenceScore: number;
}

export interface PromiseEntry {
  id: string;
  text: string;
  url: string;
  promisedAt: string;
  deadline?: string;
  deadlineLabel?: string;
  status: PromiseStatus;
  daysOverdue?: number;
  relatedCities: string[];
}

export interface TweetCorrelation {
  id: string;
  eventLabel: string;
  tweetHandle: string;
  tweetText: string;
  tweetUrl: string;
  tweetAt: string;
  tslaNextSessionPct: number;
  tslaNextDayPct?: number;
  category: 'elon' | 'robotaxi' | 'community' | 'incident';
}

export interface TrustPulse {
  score: number;
  status: 'strong' | 'stable' | 'fragile' | 'critical';
  positiveRatio: number;
  negativeRatio: number;
  engagementVelocity: number;
  influencerStance: { handle: string; stance: SentimentLabel; weight: number }[];
  incidentSpike: boolean;
  updatedAt: string;
}

export interface CascadeStep {
  source: 'community' | 'elon' | 'robotaxi' | 'news';
  label: string;
  url?: string;
  timestamp: string;
  lagHoursFromStart?: number;
}

export interface InformationCascade {
  id: string;
  eventTitle: string;
  cityName?: string;
  steps: CascadeStep[];
  totalLagHours: number;
}

export interface CityBuzz {
  cityId: string;
  cityName: string;
  stateAbbr: string;
  mentionCount: number;
  engagementScore: number;
  buzzLevel: 'hot' | 'warm' | 'cool' | 'cold';
  topSignal?: string;
}

export interface IncidentFlash {
  id: string;
  headline: string;
  url: string;
  detectedAt: string;
  severity: 'high' | 'medium' | 'low';
  xFirst: boolean;
  newsLagHours?: number;
  mentionVelocity: number;
}

export interface CompetitiveEntry {
  company: string;
  handle: string;
  tweetVolume7d: number;
  engagement7d: number;
  narrativeSharePct: number;
  latestTweet?: string;
  trend: 'up' | 'flat' | 'down';
}

export interface StokesSyncDiff {
  field: string;
  cityName: string;
  currentValue: string;
  stokesValue: string;
  stokesUrl: string;
  detectedAt: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface GeofenceWhisper {
  id: string;
  location: string;
  cityId: string;
  mentionCount: number;
  latestTweet: string;
  url: string;
  detectedAt: string;
}

export interface FleetCounterWeek {
  weekLabel: string;
  cityId: string;
  cityName: string;
  visualSightings: number;
  trend: 'up' | 'flat' | 'down';
}

export interface NarrativeHalfLife {
  label: 'fresh' | 'active' | 'fading' | 'stale';
  daysSinceLastSignal: number;
  lastSignalSource: string;
  lastSignalText: string;
  lastSignalAt: string;
  lastSignalUrl?: string;
}

export interface ChannelDivergence {
  score: number;
  label: 'aligned' | 'drifting' | 'divergent';
  elonLastAt?: string;
  robotaxiLastAt?: string;
  gapDays: number;
  summary: string;
}

export interface NarrativeDriftX {
  position: number;
  label: 'execution-led' | 'balanced' | 'story-led';
  promisesKept: number;
  promisesMissed: number;
  promisesPending: number;
}

export interface XIntelPayload {
  generatedAt: string;
  source: 'live' | 'hybrid' | 'seed';
  rawTweetCount: number;
  shadowSignals: ShadowSignal[];
  replyConfirmations: ReplyConfirmation[];
  promiseLedger: PromiseEntry[];
  narrativeDrift: NarrativeDriftX;
  tweetCorrelations: TweetCorrelation[];
  trustPulse: TrustPulse;
  informationCascades: InformationCascade[];
  cityBuzz: CityBuzz[];
  incidentFlashes: IncidentFlash[];
  competitiveRadar: CompetitiveEntry[];
  stokesSync: StokesSyncDiff[];
  geofenceWhispers: GeofenceWhisper[];
  fleetCounter: FleetCounterWeek[];
  narrativeHalfLife: NarrativeHalfLife;
  channelDivergence: ChannelDivergence;
}