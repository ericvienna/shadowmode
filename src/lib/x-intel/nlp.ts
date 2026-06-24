import type { SentimentLabel, XSignalType } from '@/types/x-intel';

export const CITY_PATTERNS: { cityId: string; cityName: string; stateAbbr: string; patterns: RegExp[] }[] = [
  { cityId: 'tx-austin', cityName: 'Austin', stateAbbr: 'TX', patterns: [/austin/i] },
  { cityId: 'tx-dallas', cityName: 'Dallas', stateAbbr: 'TX', patterns: [/dallas/i] },
  { cityId: 'tx-houston', cityName: 'Houston', stateAbbr: 'TX', patterns: [/houston/i] },
  { cityId: 'tx-san-antonio', cityName: 'San Antonio', stateAbbr: 'TX', patterns: [/san antonio/i] },
  { cityId: 'ca-sf', cityName: 'San Francisco', stateAbbr: 'CA', patterns: [/san francisco|\bsf\b/i] },
  { cityId: 'ca-oak', cityName: 'Oakland', stateAbbr: 'CA', patterns: [/oakland/i] },
  { cityId: 'ca-sj', cityName: 'San Jose', stateAbbr: 'CA', patterns: [/san jose/i] },
  { cityId: 'ca-la', cityName: 'Los Angeles', stateAbbr: 'CA', patterns: [/los angeles|\bla\b/i] },
  { cityId: 'ca-sd', cityName: 'San Diego', stateAbbr: 'CA', patterns: [/san diego/i] },
  { cityId: 'az-phoenix', cityName: 'Phoenix', stateAbbr: 'AZ', patterns: [/phoenix/i] },
  { cityId: 'az-mesa-tempe', cityName: 'Mesa/Tempe', stateAbbr: 'AZ', patterns: [/mesa|tempe/i] },
  { cityId: 'nv-vegas', cityName: 'Las Vegas', stateAbbr: 'NV', patterns: [/las vegas|vegas/i] },
  { cityId: 'co-denver', cityName: 'Denver', stateAbbr: 'CO', patterns: [/denver/i] },
  { cityId: 'il-chicago', cityName: 'Chicago', stateAbbr: 'IL', patterns: [/chicago/i] },
  { cityId: 'fl-miami', cityName: 'Miami', stateAbbr: 'FL', patterns: [/miami/i] },
  { cityId: 'fl-tampa', cityName: 'Tampa', stateAbbr: 'FL', patterns: [/tampa/i] },
  { cityId: 'fl-orlando', cityName: 'Orlando', stateAbbr: 'FL', patterns: [/orlando/i] },
  { cityId: 'fl-jacksonville', cityName: 'Jacksonville', stateAbbr: 'FL', patterns: [/jacksonville/i] },
  { cityId: 'ma-boston', cityName: 'Boston', stateAbbr: 'MA', patterns: [/boston/i] },
  { cityId: 'ny-brooklyn', cityName: 'Brooklyn', stateAbbr: 'NY', patterns: [/brooklyn/i] },
  { cityId: 'ny-queens', cityName: 'Queens', stateAbbr: 'NY', patterns: [/queens/i] },
];

const POSITIVE = /driverless|no occupant|empty|expansion|launch|approved|milestone|unsupervised|scaling|fleet/i;
const NEGATIVE = /crash|accident|nhtsa|investigation|recall|delay|failed|stalled|safety concern|lawsuit/i;

const SIGHTING = /spotted|sighting|empty (cybercab|robotaxi|driver)|no (driver|occupant)|driverless|filmed|caught on/i;
const INCIDENT = /crash|accident|nhtsa|collision|injury|fire|investigation/i;
const GEOFENCE = /geofence|intersection|expansion|downtown|corridor|depot|service area/i;
const PROMISE = /will|by end of|next (month|quarter|year)|soon|timeline|expect|targeting|plan to/i;

export function extractCities(text: string): { cityId: string; cityName: string; stateAbbr: string }[] {
  const hits: { cityId: string; cityName: string; stateAbbr: string }[] = [];
  for (const city of CITY_PATTERNS) {
    if (city.patterns.some((p) => p.test(text))) {
      hits.push({ cityId: city.cityId, cityName: city.cityName, stateAbbr: city.stateAbbr });
    }
  }
  return hits;
}

export function classifySentiment(text: string): SentimentLabel {
  const neg = NEGATIVE.test(text);
  const pos = POSITIVE.test(text);
  if (neg && !pos) return 'negative';
  if (pos && !neg) return 'positive';
  if (neg && pos) return 'neutral';
  return 'neutral';
}

export function classifySignalTypes(text: string, handle: string): XSignalType[] {
  const types: XSignalType[] = [];
  const h = handle.toLowerCase();

  if (h === 'elonmusk') types.push('promise');
  if (h === 'robotaxi' || h === 'tesla') types.push('official');
  if (h === 'jonathanwstokes') types.push('stokes_update');
  if (['waymo', 'zoox'].includes(h)) types.push('competitive');
  if (SIGHTING.test(text)) types.push('sighting');
  if (INCIDENT.test(text)) types.push('incident');
  if (GEOFENCE.test(text)) types.push('geofence');
  if (PROMISE.test(text) && h === 'elonmusk') types.push('promise');

  return [...new Set(types)];
}

export function extractDeadline(text: string, tweetedAt: string): { deadline?: string; deadlineLabel?: string } {
  const year = new Date(tweetedAt).getFullYear();
  const lower = text.toLowerCase();

  const qMatch = lower.match(/q([1-4])\s*(20\d{2})?/i);
  if (qMatch) {
    const q = Number(qMatch[1]);
    const y = qMatch[2] ? Number(qMatch[2]) : year;
    const month = (q - 1) * 3 + 2;
    const deadline = `${y}-${String(month).padStart(2, '0')}-28`;
    return { deadline, deadlineLabel: `Q${q} ${y}` };
  }

  if (/end of (the )?year|by december|this year/i.test(text)) {
    return { deadline: `${year}-12-31`, deadlineLabel: `End of ${year}` };
  }

  const monthMatch = lower.match(/by\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*(20\d{2})?/i);
  if (monthMatch) {
    const months: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    const m = months[monthMatch[1].toLowerCase()];
    const y = monthMatch[2] ? Number(monthMatch[2]) : year;
    const deadline = `${y}-${String(m).padStart(2, '0')}-28`;
    return { deadline, deadlineLabel: `${monthMatch[1]} ${y}` };
  }

  return {};
}

export function isReplyConfirmation(elonText: string): boolean {
  return /testing is underway|yes|confirmed|correct|indeed|happening|no occupants|driverless/i.test(elonText);
}

export function inferMilestoneFromReply(text: string): string | undefined {
  if (/no occupant|driverless|empty/i.test(text)) return 'no_safety_monitor';
  if (/geofence|expansion|expanded/i.test(text)) return 'geofence_expanded';
  if (/launch|public/i.test(text)) return 'public_test_program_launched';
  return undefined;
}