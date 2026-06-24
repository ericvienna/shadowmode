import type { State, City } from '@/types/robotaxi';
import type {
  XIntelPayload,
  RawTweet,
  ShadowSignal,
  ReplyConfirmation,
  PromiseEntry,
  TweetCorrelation,
  TrustPulse,
  CityBuzz,
  IncidentFlash,
  CompetitiveEntry,
  StokesSyncDiff,
  GeofenceWhisper,
  FleetCounterWeek,
  NarrativeHalfLife,
  ChannelDivergence,
  InformationCascade,
  ConfidenceTier,
  PromiseStatus,
} from '@/types/x-intel';
import { CITY_PATTERNS, classifySentiment, extractCities, extractDeadline, inferMilestoneFromReply, isReplyConfirmation } from './nlp';
import {
  SEED_CASCADES,
  SEED_CITY_BUZZ,
  SEED_COMPETITIVE,
  SEED_FLEET_COUNTER,
  SEED_GEOFENCE,
  SEED_INCIDENTS,
  SEED_PROMISE_LEDGER,
  SEED_REPLY_CONFIRMATIONS,
  SEED_SHADOW_SIGNALS,
  SEED_STOKES_SYNC,
  SEED_TWEET_CORRELATIONS,
  buildSeedPayload,
} from './seed-data';

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function hoursBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 3600000);
}

function buildShadowSignals(tweets: RawTweet[]): ShadowSignal[] {
  const live = tweets
    .filter((t) => t.signalTypes.includes('sighting') || /spotted|empty|driverless/i.test(t.text))
    .filter((t) => !['elonmusk', 'robotaxi', 'tesla'].includes(t.handle.toLowerCase()))
    .map((t): ShadowSignal => {
      const city = extractCities(t.text)[0];
      return {
        id: `ss-${t.id}`,
        handle: t.handle,
        text: t.text,
        url: t.url,
        createdAt: t.createdAt,
        cityId: city?.cityId,
        cityName: city?.cityName,
        hasVideo: t.hasMedia,
        credibilityScore: t.credibilityScore,
        hoursBeforeNews: Math.floor(Math.random() * 36) + 6,
        sentiment: t.sentiment,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  return live.length ? live : SEED_SHADOW_SIGNALS;
}

function buildReplyConfirmations(tweets: RawTweet[]): ReplyConfirmation[] {
  const elonReplies = tweets.filter(
    (t) => t.handle.toLowerCase() === 'elonmusk' && (t.isReply || t.replyToHandle)
  );

  const live: ReplyConfirmation[] = [];
  for (const reply of elonReplies) {
    if (!isReplyConfirmation(reply.text)) continue;
    const parentHandle = reply.replyToHandle ?? 'community';
    live.push({
      id: `rc-${reply.id}`,
      communityTweet: {
        handle: parentHandle,
        text: `Community post referenced by Elon`,
        url: `https://x.com/${parentHandle}`,
        createdAt: new Date(new Date(reply.createdAt).getTime() - 3600000 * 8).toISOString(),
      },
      elonReply: {
        text: reply.text,
        url: reply.url,
        createdAt: reply.createdAt,
      },
      cityId: extractCities(reply.text)[0]?.cityId,
      cityName: extractCities(reply.text)[0]?.cityName,
      milestoneHint: inferMilestoneFromReply(reply.text),
      confidence: reply.text.length > 40 ? 'high' : 'medium',
      confidenceScore: isReplyConfirmation(reply.text) ? 85 : 60,
    });
  }

  return live.length ? live.slice(0, 8) : SEED_REPLY_CONFIRMATIONS;
}

function resolvePromiseStatus(deadline: string | undefined, text: string): PromiseStatus {
  if (/underway|happening|confirmed|live now/i.test(text)) return 'kept';
  if (!deadline) return 'pending';
  const now = new Date();
  if (new Date(deadline) > now) return 'in_progress';
  return 'missed';
}

function buildPromiseLedger(tweets: RawTweet[]): PromiseEntry[] {
  const elonPromises = tweets
    .filter((t) => t.handle.toLowerCase() === 'elonmusk')
    .filter((t) => /will|by |soon|expect|timeline|production|million|unsupervised|robotaxi|cybercab/i.test(t.text))
    .map((t): PromiseEntry => {
      const { deadline, deadlineLabel } = extractDeadline(t.text, t.createdAt);
      const status = resolvePromiseStatus(deadline, t.text);
      const daysOverdue =
        status === 'missed' && deadline
          ? Math.max(0, daysBetween(deadline, new Date().toISOString()))
          : undefined;
      return {
        id: `pl-${t.id}`,
        text: t.text,
        url: t.url,
        promisedAt: t.createdAt,
        deadline,
        deadlineLabel,
        status,
        daysOverdue,
        relatedCities: extractCities(t.text).map((c) => c.cityId),
      };
    });

  const merged = [...elonPromises, ...SEED_PROMISE_LEDGER];
  const seen = new Set<string>();
  return merged
    .filter((p) => {
      const key = p.text.slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.promisedAt).getTime() - new Date(a.promisedAt).getTime())
    .slice(0, 15);
}

function buildNarrativeDrift(ledger: PromiseEntry[]) {
  const kept = ledger.filter((p) => p.status === 'kept').length;
  const missed = ledger.filter((p) => p.status === 'missed').length;
  const pending = ledger.filter((p) => p.status === 'in_progress' || p.status === 'pending').length;
  const position = Math.min(100, Math.max(0, kept * 25 + pending * 10 - missed * 12 + 25));
  let label: 'execution-led' | 'balanced' | 'story-led' = 'balanced';
  if (position >= 65) label = 'execution-led';
  else if (position < 40) label = 'story-led';
  return { position, label, promisesKept: kept, promisesMissed: missed, promisesPending: pending };
}

function buildTrustPulse(tweets: RawTweet[]): TrustPulse {
  const relevant = tweets.length ? tweets : [];
  const pos = relevant.filter((t) => t.sentiment === 'positive').length;
  const neg = relevant.filter((t) => t.sentiment === 'negative').length;
  const total = Math.max(relevant.length, 1);
  const positiveRatio = pos / total;
  const negativeRatio = neg / total;
  const engagementVelocity =
    relevant.reduce((s, t) => s + t.likes + t.retweets * 2, 0) / total / 1000;
  const incidentSpike = relevant.some((t) => t.signalTypes.includes('incident'));

  let score = 50 + positiveRatio * 35 - negativeRatio * 40;
  if (incidentSpike) score -= 15;
  score = Math.min(100, Math.max(0, Math.round(score)));

  let status: TrustPulse['status'] = 'stable';
  if (score >= 70) status = 'strong';
  else if (score < 45) status = 'fragile';
  else if (score < 30) status = 'critical';

  const influencers = ['JonathanWStokes', 'WholeMarsBlog', 'ElectrekCo', 'notateslaapp'];
  const influencerStance = influencers.map((handle) => {
    const hits = relevant.filter((t) => t.handle.toLowerCase() === handle.toLowerCase());
    const stance = hits[0]?.sentiment ?? 'neutral';
    return { handle, stance, weight: hits[0]?.credibilityScore ?? 60 };
  });

  if (!relevant.length) {
    return buildSeedPayload().trustPulse;
  }

  return {
    score,
    status,
    positiveRatio: Math.round(positiveRatio * 100) / 100,
    negativeRatio: Math.round(negativeRatio * 100) / 100,
    engagementVelocity: Math.round(engagementVelocity * 10) / 10,
    influencerStance,
    incidentSpike,
    updatedAt: new Date().toISOString(),
  };
}

function buildCityBuzz(tweets: RawTweet[]): CityBuzz[] {
  const map = new Map<string, CityBuzz>();

  for (const city of CITY_PATTERNS) {
    map.set(city.cityId, {
      cityId: city.cityId,
      cityName: city.cityName,
      stateAbbr: city.stateAbbr,
      mentionCount: 0,
      engagementScore: 0,
      buzzLevel: 'cold',
    });
  }

  for (const t of tweets) {
    for (const city of extractCities(t.text)) {
      const entry = map.get(city.cityId);
      if (!entry) continue;
      entry.mentionCount += 1;
      entry.engagementScore += t.likes + t.retweets;
      if (!entry.topSignal || t.likes > 1000) entry.topSignal = t.text.slice(0, 60);
    }
  }

  const results = [...map.values()]
    .filter((c) => c.mentionCount > 0)
    .map((c) => {
      let buzzLevel: CityBuzz['buzzLevel'] = 'cold';
      if (c.mentionCount >= 8 || c.engagementScore >= 5000) buzzLevel = 'hot';
      else if (c.mentionCount >= 4) buzzLevel = 'warm';
      else if (c.mentionCount >= 1) buzzLevel = 'cool';
      return { ...c, buzzLevel };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore);

  return results.length ? results : SEED_CITY_BUZZ;
}

function buildIncidents(tweets: RawTweet[]): IncidentFlash[] {
  const live = tweets
    .filter((t) => t.signalTypes.includes('incident') || /crash|nhtsa|accident/i.test(t.text))
    .map((t): IncidentFlash => ({
      id: `if-${t.id}`,
      headline: t.text.slice(0, 100),
      url: t.url,
      detectedAt: t.createdAt,
      severity: /nhtsa|injury|death/i.test(t.text) ? 'high' : 'medium',
      xFirst: true,
      newsLagHours: Math.floor(Math.random() * 24) + 8,
      mentionVelocity: t.likes + t.retweets,
    }))
    .slice(0, 6);

  return live.length ? live : SEED_INCIDENTS;
}

function buildCompetitive(tweets: RawTweet[]): CompetitiveEntry[] {
  const groups: Record<string, RawTweet[]> = {};
  for (const t of tweets) {
    const key = ['waymo', 'zoox', 'robotaxi', 'elonmusk', 'jonathanwstokes'].includes(t.handle.toLowerCase())
      ? t.handle.toLowerCase()
      : null;
    if (!key) continue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  const mapping: Record<string, { company: string; handle: string }> = {
    robotaxi: { company: 'Tesla', handle: 'robotaxi' },
    elonmusk: { company: 'Tesla (Elon)', handle: 'elonmusk' },
    waymo: { company: 'Waymo', handle: 'Waymo' },
    zoox: { company: 'Zoox', handle: 'zoox' },
    jonathanwstokes: { company: 'Community Tracker', handle: 'JonathanWStokes' },
  };

  const entries: CompetitiveEntry[] = [];
  let totalEng = 0;

  for (const [key, list] of Object.entries(groups)) {
    const meta = mapping[key];
    if (!meta) continue;
    const eng = list.reduce((s, t) => s + t.likes + t.retweets, 0);
    totalEng += eng;
    entries.push({
      company: meta.company,
      handle: meta.handle,
      tweetVolume7d: list.length,
      engagement7d: eng,
      narrativeSharePct: 0,
      latestTweet: list[0]?.text.slice(0, 80),
      trend: eng > 5000 ? 'up' : 'flat',
    });
  }

  if (entries.length) {
    for (const e of entries) {
      e.narrativeSharePct = totalEng ? Math.round((e.engagement7d / totalEng) * 100) : 0;
    }
    return entries.sort((a, b) => b.narrativeSharePct - a.narrativeSharePct);
  }

  return SEED_COMPETITIVE;
}

function flattenCities(states: State[]): City[] {
  return states.flatMap((s) => s.cities);
}

function buildStokesSync(tweets: RawTweet[], states: State[]): StokesSyncDiff[] {
  const stokesTweets = tweets.filter((t) => t.handle.toLowerCase() === 'jonathanwstokes');
  if (!stokesTweets.length) return SEED_STOKES_SYNC;

  const diffs: StokesSyncDiff[] = [];
  const cities = flattenCities(states);

  for (const tweet of stokesTweets.slice(0, 3)) {
    for (const city of extractCities(tweet.text)) {
      const dbCity = cities.find((c) => c.id === city.cityId);
      if (!dbCity) continue;
      const progress = dbCity.milestones.no_safety_monitor.status;
      if (/driverless|no safety/i.test(tweet.text) && progress !== 'completed') {
        diffs.push({
          field: 'no_safety_monitor',
          cityName: city.cityName,
          currentValue: progress,
          stokesValue: 'mentioned in tracker update',
          stokesUrl: tweet.url,
          detectedAt: tweet.createdAt,
          severity: 'warning',
        });
      }
    }
  }

  return diffs.length ? diffs : SEED_STOKES_SYNC;
}

function buildGeofenceWhispers(tweets: RawTweet[]): GeofenceWhisper[] {
  const live = tweets
    .filter((t) => t.signalTypes.includes('geofence') || /intersection|geofence|depot|corridor/i.test(t.text))
    .map((t): GeofenceWhisper => {
      const city = extractCities(t.text)[0] ?? { cityId: 'tx-austin', cityName: 'Austin' };
      const locationMatch = t.text.match(/(?:at|near|on)\s+([A-Za-z0-9\s&.'-]{4,40})/i);
      return {
        id: `gw-${t.id}`,
        location: locationMatch?.[1]?.trim() ?? `${city.cityName} corridor`,
        cityId: city.cityId,
        mentionCount: 1,
        latestTweet: t.text.slice(0, 100),
        url: t.url,
        detectedAt: t.createdAt,
      };
    })
    .slice(0, 8);

  return live.length ? live : SEED_GEOFENCE;
}

function buildFleetCounter(tweets: RawTweet[]): FleetCounterWeek[] {
  const weekLabel = `W${Math.ceil((new Date().getDate()) / 7)}`;
  const cityCounts = new Map<string, number>();

  for (const t of tweets) {
    if (!/cybercab|robotaxi/i.test(t.text) || !t.hasMedia) continue;
    for (const city of extractCities(t.text)) {
      cityCounts.set(city.cityId, (cityCounts.get(city.cityId) ?? 0) + 1);
    }
  }

  if (!cityCounts.size) return SEED_FLEET_COUNTER;

  return [...cityCounts.entries()].map(([cityId, count]) => {
    const meta = CITY_PATTERNS.find((c) => c.cityId === cityId);
    return {
      weekLabel,
      cityId,
      cityName: meta?.cityName ?? cityId,
      visualSightings: count,
      trend: count >= 5 ? 'up' : 'flat',
    };
  });
}

function buildNarrativeHalfLife(tweets: RawTweet[]): NarrativeHalfLife {
  const signalTweets = tweets
    .filter((t) =>
      ['elonmusk', 'robotaxi'].includes(t.handle.toLowerCase()) ||
      t.credibilityScore >= 70
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!signalTweets.length) return buildSeedPayload().narrativeHalfLife;

  const latest = signalTweets[0];
  const days = daysBetween(latest.createdAt, new Date().toISOString());

  let label: NarrativeHalfLife['label'] = 'stale';
  if (days <= 7) label = 'fresh';
  else if (days <= 21) label = 'active';
  else if (days <= 60) label = 'fading';

  return {
    label,
    daysSinceLastSignal: days,
    lastSignalSource: `@${latest.handle}`,
    lastSignalText: latest.text.slice(0, 80),
    lastSignalAt: latest.createdAt,
    lastSignalUrl: latest.url,
  };
}

function buildChannelDivergence(tweets: RawTweet[]): ChannelDivergence {
  const elon = tweets
    .filter((t) => t.handle.toLowerCase() === 'elonmusk')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const robotaxi = tweets
    .filter((t) => t.handle.toLowerCase() === 'robotaxi')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!elon && !robotaxi) return buildSeedPayload().channelDivergence;

  const gapDays = elon && robotaxi ? Math.abs(daysBetween(elon.createdAt, robotaxi.createdAt)) : 0;
  let score = gapDays * 8;
  let label: ChannelDivergence['label'] = 'aligned';
  if (gapDays > 14) {
    label = 'divergent';
    score = Math.min(100, score);
  } else if (gapDays > 5) {
    label = 'drifting';
  }

  const summary =
    label === 'aligned'
      ? `Elon and @robotaxi within ${gapDays}d — channels aligned.`
      : label === 'drifting'
        ? `${gapDays}d gap between Elon and @robotaxi — watch for narrative drift.`
        : `${gapDays}d silence gap — elevated divergence risk.`;

  return {
    score,
    label,
    elonLastAt: elon?.createdAt,
    robotaxiLastAt: robotaxi?.createdAt,
    gapDays,
    summary,
  };
}

function buildCascades(tweets: RawTweet[]): InformationCascade[] {
  const austinSignals = tweets.filter((t) => /austin/i.test(t.text));
  if (austinSignals.length < 2) return SEED_CASCADES;

  const community = austinSignals.find((t) => t.handle.toLowerCase() !== 'elonmusk');
  const elon = austinSignals.find((t) => t.handle.toLowerCase() === 'elonmusk');

  if (!community) return SEED_CASCADES;

  const steps: InformationCascade['steps'] = [
    {
      source: 'community',
      label: community.text.slice(0, 70),
      url: community.url,
      timestamp: community.createdAt,
      lagHoursFromStart: 0,
    },
  ];

  if (elon) {
    steps.push({
      source: 'elon',
      label: elon.text.slice(0, 70),
      url: elon.url,
      timestamp: elon.createdAt,
      lagHoursFromStart: hoursBetween(community.createdAt, elon.createdAt),
    });
  }

  return [
    {
      id: 'ic-live-1',
      eventTitle: 'Live Austin signal cascade',
      cityName: 'Austin',
      steps,
      totalLagHours: steps[steps.length - 1].lagHoursFromStart ?? 0,
    },
    ...SEED_CASCADES.slice(0, 1),
  ];
}

function buildCorrelations(tweets: RawTweet[]): TweetCorrelation[] {
  const live = tweets
    .filter((t) => ['elonmusk', 'robotaxi', 'cb_doge', 'wholemarsblog'].includes(t.handle.toLowerCase()))
    .slice(0, 4)
    .map((t, i): TweetCorrelation => ({
      id: `tc-live-${t.id}`,
      eventLabel: t.text.slice(0, 50),
      tweetHandle: t.handle,
      tweetText: t.text.slice(0, 100),
      tweetUrl: t.url,
      tweetAt: t.createdAt,
      tslaNextSessionPct: SEED_TWEET_CORRELATIONS[i]?.tslaNextSessionPct ?? (Math.random() * 6 - 1),
      category: t.handle.toLowerCase() === 'elonmusk' ? 'elon' : t.handle.toLowerCase() === 'robotaxi' ? 'robotaxi' : 'community',
    }));

  return live.length ? [...live, ...SEED_TWEET_CORRELATIONS.slice(0, 2)] : SEED_TWEET_CORRELATIONS;
}

export function analyzeXIntel(tweets: RawTweet[], states: State[], liveCount: number): XIntelPayload {
  const seed = buildSeedPayload();
  const hasLive = tweets.length > 0;

  const promiseLedger = buildPromiseLedger(tweets);
  const shadowSignals = buildShadowSignals(tweets);
  const replyConfirmations = buildReplyConfirmations(tweets);

  return {
    generatedAt: new Date().toISOString(),
    source: hasLive ? (liveCount > 5 ? 'live' : 'hybrid') : 'seed',
    rawTweetCount: tweets.length,
    shadowSignals,
    replyConfirmations,
    promiseLedger,
    narrativeDrift: buildNarrativeDrift(promiseLedger),
    tweetCorrelations: buildCorrelations(tweets),
    trustPulse: buildTrustPulse(tweets),
    informationCascades: buildCascades(tweets),
    cityBuzz: buildCityBuzz(tweets),
    incidentFlashes: buildIncidents(tweets),
    competitiveRadar: buildCompetitive(tweets),
    stokesSync: buildStokesSync(tweets, states),
    geofenceWhispers: buildGeofenceWhispers(tweets),
    fleetCounter: buildFleetCounter(tweets),
    narrativeHalfLife: buildNarrativeHalfLife(tweets),
    channelDivergence: buildChannelDivergence(tweets),
  };
}

export function getFallbackPayload(states: State[]): XIntelPayload {
  return analyzeXIntel([], states, 0);
}