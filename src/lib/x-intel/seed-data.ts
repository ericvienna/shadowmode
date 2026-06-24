import type {
  XIntelPayload,
  ShadowSignal,
  ReplyConfirmation,
  PromiseEntry,
  TweetCorrelation,
  InformationCascade,
  CityBuzz,
  IncidentFlash,
  CompetitiveEntry,
  StokesSyncDiff,
  GeofenceWhisper,
  FleetCounterWeek,
} from '@/types/x-intel';

export const SEED_SHADOW_SIGNALS: ShadowSignal[] = [
  {
    id: 'ss-1',
    handle: 'cb_doge',
    text: 'Empty Tesla robotaxi driving autonomously through Austin — no one in driver seat',
    url: 'https://x.com/cb_doge/status/1999000000000000000',
    createdAt: '2025-12-13T18:22:00Z',
    cityId: 'tx-austin',
    cityName: 'Austin',
    hasVideo: true,
    credibilityScore: 72,
    hoursBeforeNews: 18,
    sentiment: 'positive',
  },
  {
    id: 'ss-2',
    handle: 'notateslaapp',
    text: 'Multiple Cybercab sightings near Tesla Austin depot this week',
    url: 'https://x.com/notateslaapp/status/1999100000000000000',
    createdAt: '2025-12-10T14:00:00Z',
    cityId: 'tx-austin',
    cityName: 'Austin',
    hasVideo: false,
    credibilityScore: 74,
    hoursBeforeNews: 36,
    sentiment: 'positive',
  },
  {
    id: 'ss-3',
    handle: 'WholeMarsBlog',
    text: 'Robotaxi spotted in Phoenix — mapping vehicle with lidar rack',
    url: 'https://x.com/WholeMarsBlog/status/1998000000000000000',
    createdAt: '2025-11-28T09:15:00Z',
    cityId: 'az-phoenix',
    cityName: 'Phoenix',
    hasVideo: true,
    credibilityScore: 78,
    hoursBeforeNews: 48,
    sentiment: 'neutral',
  },
];

export const SEED_REPLY_CONFIRMATIONS: ReplyConfirmation[] = [
  {
    id: 'rc-1',
    communityTweet: {
      handle: 'cb_doge',
      text: 'Video: Tesla robotaxi with empty driver seat in Austin',
      url: 'https://x.com/cb_doge/status/1999000000000000000',
      createdAt: '2025-12-13T18:22:00Z',
    },
    elonReply: {
      text: 'Testing is underway with no occupants in the car',
      url: 'https://x.com/elonmusk/status/2000302654837371181',
      createdAt: '2025-12-14T02:10:00Z',
    },
    cityId: 'tx-austin',
    cityName: 'Austin',
    milestoneHint: 'no_safety_monitor',
    confidence: 'high',
    confidenceScore: 92,
  },
];

export const SEED_PROMISE_LEDGER: PromiseEntry[] = [
  {
    id: 'pl-1',
    text: 'Tesla will have millions of cars in full self-driving with no one in them',
    url: 'https://x.com/elonmusk/status/1200000000000000000',
    promisedAt: '2020-04-22T00:00:00Z',
    deadline: '2020-12-31',
    deadlineLabel: 'End of 2020',
    status: 'missed',
    daysOverdue: 1900,
    relatedCities: [],
  },
  {
    id: 'pl-2',
    text: 'Robotaxi without steering wheel or pedals — production 2024',
    url: 'https://x.com/elonmusk/status/1400000000000000000',
    promisedAt: '2022-04-07T00:00:00Z',
    deadline: '2024-12-31',
    deadlineLabel: 'End of 2024',
    status: 'missed',
    daysOverdue: 540,
    relatedCities: ['tx-austin'],
  },
  {
    id: 'pl-3',
    text: 'Unsupervised FSD in Austin expanding to more cities in 2025',
    url: 'https://x.com/elonmusk/status/1800000000000000000',
    promisedAt: '2024-10-10T00:00:00Z',
    deadline: '2025-12-31',
    deadlineLabel: 'End of 2025',
    status: 'in_progress',
    relatedCities: ['tx-austin', 'ca-sf', 'az-phoenix'],
  },
  {
    id: 'pl-4',
    text: 'Cybercab fleet scaling to 500 vehicles in Austin',
    url: 'https://x.com/elonmusk/status/1900000000000000000',
    promisedAt: '2025-06-01T00:00:00Z',
    deadline: '2025-09-30',
    deadlineLabel: 'Q3 2025',
    status: 'missed',
    daysOverdue: 80,
    relatedCities: ['tx-austin'],
  },
  {
    id: 'pl-5',
    text: 'Driverless testing with no occupants — underway now',
    url: 'https://x.com/elonmusk/status/2000302654837371181',
    promisedAt: '2025-12-14T02:10:00Z',
    status: 'kept',
    relatedCities: ['tx-austin'],
  },
];

export const SEED_TWEET_CORRELATIONS: TweetCorrelation[] = [
  {
    id: 'tc-1',
    eventLabel: 'Austin driverless confirmation',
    tweetHandle: 'elonmusk',
    tweetText: 'Testing is underway with no occupants in the car',
    tweetUrl: 'https://x.com/elonmusk/status/2000302654837371181',
    tweetAt: '2025-12-14T02:10:00Z',
    tslaNextSessionPct: 4.2,
    tslaNextDayPct: 6.1,
    category: 'elon',
  },
  {
    id: 'tc-2',
    eventLabel: 'Cybercab unveil event',
    tweetHandle: 'elonmusk',
    tweetText: 'Cybercab production begins 2026',
    tweetUrl: 'https://x.com/elonmusk/status/1700000000000000000',
    tweetAt: '2024-10-11T01:00:00Z',
    tslaNextSessionPct: 8.1,
    category: 'elon',
  },
  {
    id: 'tc-3',
    eventLabel: 'Community Austin sighting',
    tweetHandle: 'cb_doge',
    tweetText: 'Empty robotaxi filmed in Austin',
    tweetUrl: 'https://x.com/cb_doge/status/1999000000000000000',
    tweetAt: '2025-12-13T18:22:00Z',
    tslaNextSessionPct: 0.8,
    category: 'community',
  },
  {
    id: 'tc-4',
    eventLabel: '@robotaxi service area update',
    tweetHandle: 'robotaxi',
    tweetText: 'Austin geofence expansion live',
    tweetUrl: 'https://x.com/robotaxi/status/1995000000000000000',
    tweetAt: '2025-11-01T12:00:00Z',
    tslaNextSessionPct: 1.4,
    category: 'robotaxi',
  },
];

export const SEED_CASCADES: InformationCascade[] = [
  {
    id: 'ic-1',
    eventTitle: 'Austin driverless testing confirmed',
    cityName: 'Austin',
    totalLagHours: 42,
    steps: [
      { source: 'community', label: 'cb_doge posts empty-seat robotaxi video', url: 'https://x.com/cb_doge/status/1999000000000000000', timestamp: '2025-12-13T18:22:00Z', lagHoursFromStart: 0 },
      { source: 'elon', label: 'Elon: "Testing is underway with no occupants"', url: 'https://x.com/elonmusk/status/2000302654837371181', timestamp: '2025-12-14T02:10:00Z', lagHoursFromStart: 8 },
      { source: 'robotaxi', label: '@robotaxi acknowledges internal testing phase', timestamp: '2025-12-14T16:00:00Z', lagHoursFromStart: 22 },
      { source: 'news', label: 'TechCrunch: Tesla starts testing robotaxis with no safety driver', url: 'https://techcrunch.com', timestamp: '2025-12-15T08:00:00Z', lagHoursFromStart: 38 },
    ],
  },
  {
    id: 'ic-2',
    eventTitle: 'Phoenix permit received',
    cityName: 'Phoenix',
    totalLagHours: 72,
    steps: [
      { source: 'community', label: 'JonathanWStokes tracker update — Phoenix permit', url: 'https://x.com/JonathanWStokes', timestamp: '2025-09-18T10:00:00Z', lagHoursFromStart: 0 },
      { source: 'news', label: 'Electrek coverage of AZ DOT approval', timestamp: '2025-09-21T14:00:00Z', lagHoursFromStart: 76 },
    ],
  },
];

export const SEED_CITY_BUZZ: CityBuzz[] = [
  { cityId: 'tx-austin', cityName: 'Austin', stateAbbr: 'TX', mentionCount: 847, engagementScore: 98, buzzLevel: 'hot', topSignal: 'Driverless testing chatter' },
  { cityId: 'ca-sf', cityName: 'San Francisco', stateAbbr: 'CA', mentionCount: 312, engagementScore: 72, buzzLevel: 'warm', topSignal: 'CPUC permit speculation' },
  { cityId: 'az-phoenix', cityName: 'Phoenix', stateAbbr: 'AZ', mentionCount: 198, engagementScore: 55, buzzLevel: 'warm', topSignal: 'Mapping vehicle sightings' },
  { cityId: 'tx-houston', cityName: 'Houston', stateAbbr: 'TX', mentionCount: 89, engagementScore: 34, buzzLevel: 'cool', topSignal: 'Permit application rumors' },
  { cityId: 'nv-vegas', cityName: 'Las Vegas', stateAbbr: 'NV', mentionCount: 67, engagementScore: 28, buzzLevel: 'cool' },
  { cityId: 'fl-miami', cityName: 'Miami', stateAbbr: 'FL', mentionCount: 41, engagementScore: 18, buzzLevel: 'cold' },
];

export const SEED_INCIDENTS: IncidentFlash[] = [
  {
    id: 'if-1',
    headline: 'NHTSA opens investigation into Tesla FSD',
    url: 'https://x.com/search?q=NHTSA+Tesla+FSD',
    detectedAt: '2025-10-18T06:30:00Z',
    severity: 'high',
    xFirst: true,
    newsLagHours: 14,
    mentionVelocity: 340,
  },
  {
    id: 'if-2',
    headline: 'Austin robotaxi incident reports circulating',
    url: 'https://x.com/search?q=austin+robotaxi+crash',
    detectedAt: '2025-11-02T22:00:00Z',
    severity: 'medium',
    xFirst: true,
    newsLagHours: 28,
    mentionVelocity: 120,
  },
];

export const SEED_COMPETITIVE: CompetitiveEntry[] = [
  { company: 'Tesla', handle: 'robotaxi', tweetVolume7d: 12, engagement7d: 45000, narrativeSharePct: 38, latestTweet: 'Austin service area update', trend: 'up' },
  { company: 'Waymo', handle: 'Waymo', tweetVolume7d: 18, engagement7d: 62000, narrativeSharePct: 34, latestTweet: 'SF expansion milestone', trend: 'flat' },
  { company: 'Zoox', handle: 'zoox', tweetVolume7d: 8, engagement7d: 22000, narrativeSharePct: 18, latestTweet: 'Las Vegas ride expansion', trend: 'up' },
  { company: 'Community', handle: 'JonathanWStokes', tweetVolume7d: 6, engagement7d: 18000, narrativeSharePct: 10, latestTweet: 'Tracker matrix update', trend: 'flat' },
];

export const SEED_STOKES_SYNC: StokesSyncDiff[] = [
  {
    field: 'no_safety_monitor',
    cityName: 'Austin',
    currentValue: 'in_progress',
    stokesValue: 'in_progress (internal testing)',
    stokesUrl: 'https://x.com/JonathanWStokes',
    detectedAt: '2025-12-30T00:00:00Z',
    severity: 'info',
  },
  {
    field: 'vehicles_deployed_20_plus',
    cityName: 'Austin',
    currentValue: '135+',
    stokesValue: '~135 vehicles',
    stokesUrl: 'https://x.com/JonathanWStokes',
    detectedAt: '2025-12-30T00:00:00Z',
    severity: 'info',
  },
];

export const SEED_GEOFENCE: GeofenceWhisper[] = [
  { id: 'gw-1', location: 'South Congress & Riverside', cityId: 'tx-austin', mentionCount: 23, latestTweet: 'Robotaxi turning at SoCo intersection', url: 'https://x.com/search?q=austin+robotaxi+soco', detectedAt: '2025-12-12T00:00:00Z' },
  { id: 'gw-2', location: 'Tesla Austin Gigafactory depot', cityId: 'tx-austin', mentionCount: 41, latestTweet: 'Fleet staging at Giga Texas lot', url: 'https://x.com/search?q=tesla+austin+depot', detectedAt: '2025-12-11T00:00:00Z' },
  { id: 'gw-3', location: 'Market St corridor', cityId: 'ca-sf', mentionCount: 12, latestTweet: 'Mapping runs on Market St', url: 'https://x.com/search?q=sf+tesla+mapping', detectedAt: '2025-11-20T00:00:00Z' },
];

export const SEED_FLEET_COUNTER: FleetCounterWeek[] = [
  { weekLabel: 'W50', cityId: 'tx-austin', cityName: 'Austin', visualSightings: 47, trend: 'up' },
  { weekLabel: 'W49', cityId: 'tx-austin', cityName: 'Austin', visualSightings: 38, trend: 'up' },
  { weekLabel: 'W50', cityId: 'az-phoenix', cityName: 'Phoenix', visualSightings: 12, trend: 'flat' },
  { weekLabel: 'W50', cityId: 'ca-sf', cityName: 'San Francisco', visualSightings: 8, trend: 'up' },
];

export function buildSeedPayload(): XIntelPayload {
  const kept = SEED_PROMISE_LEDGER.filter((p) => p.status === 'kept').length;
  const missed = SEED_PROMISE_LEDGER.filter((p) => p.status === 'missed').length;
  const pending = SEED_PROMISE_LEDGER.filter((p) => p.status === 'in_progress' || p.status === 'pending').length;
  const executionScore = Math.min(100, Math.max(0, kept * 25 + pending * 10 - missed * 15 + 30));

  let label: 'execution-led' | 'balanced' | 'story-led' = 'balanced';
  if (executionScore >= 65) label = 'execution-led';
  else if (executionScore < 40) label = 'story-led';

  return {
    generatedAt: new Date().toISOString(),
    source: 'seed',
    rawTweetCount: 0,
    shadowSignals: SEED_SHADOW_SIGNALS,
    replyConfirmations: SEED_REPLY_CONFIRMATIONS,
    promiseLedger: SEED_PROMISE_LEDGER,
    narrativeDrift: { position: executionScore, label, promisesKept: kept, promisesMissed: missed, promisesPending: pending },
    tweetCorrelations: SEED_TWEET_CORRELATIONS,
    trustPulse: {
      score: 62,
      status: 'stable',
      positiveRatio: 0.54,
      negativeRatio: 0.28,
      engagementVelocity: 1.2,
      influencerStance: [
        { handle: 'JonathanWStokes', stance: 'positive', weight: 88 },
        { handle: 'WholeMarsBlog', stance: 'positive', weight: 78 },
        { handle: 'ElectrekCo', stance: 'neutral', weight: 68 },
      ],
      incidentSpike: false,
      updatedAt: new Date().toISOString(),
    },
    informationCascades: SEED_CASCADES,
    cityBuzz: SEED_CITY_BUZZ,
    incidentFlashes: SEED_INCIDENTS,
    competitiveRadar: SEED_COMPETITIVE,
    stokesSync: SEED_STOKES_SYNC,
    geofenceWhispers: SEED_GEOFENCE,
    fleetCounter: SEED_FLEET_COUNTER,
    narrativeHalfLife: {
      label: 'fresh',
      daysSinceLastSignal: 5,
      lastSignalSource: '@robotaxi',
      lastSignalText: 'Austin internal driverless testing phase',
      lastSignalAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      lastSignalUrl: 'https://x.com/robotaxi',
    },
    channelDivergence: {
      score: 22,
      label: 'aligned',
      elonLastAt: '2025-12-14T02:10:00Z',
      robotaxiLastAt: '2025-12-14T16:00:00Z',
      gapDays: 0,
      summary: 'Elon and @robotaxi messaging aligned within 24h on Austin driverless testing.',
    },
  };
}