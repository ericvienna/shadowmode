export interface TrackedAccount {
  handle: string;
  displayName: string;
  credibility: number;
  category: 'official' | 'community' | 'media' | 'competitor' | 'tracker';
}

export const TRACKED_ACCOUNTS: TrackedAccount[] = [
  { handle: 'elonmusk', displayName: 'Elon Musk', credibility: 95, category: 'official' },
  { handle: 'robotaxi', displayName: '@robotaxi', credibility: 90, category: 'official' },
  { handle: 'JonathanWStokes', displayName: 'Jonathan Stokes', credibility: 88, category: 'tracker' },
  { handle: 'cb_doge', displayName: 'cb_doge', credibility: 72, category: 'community' },
  { handle: 'WholeMarsBlog', displayName: 'Whole Mars Catalog', credibility: 78, category: 'community' },
  { handle: 'Tesla', displayName: 'Tesla', credibility: 85, category: 'official' },
  { handle: 'Teslarati', displayName: 'Teslarati', credibility: 70, category: 'media' },
  { handle: 'Waymo', displayName: 'Waymo', credibility: 80, category: 'competitor' },
  { handle: 'zoox', displayName: 'Zoox', credibility: 75, category: 'competitor' },
  { handle: 'notateslaapp', displayName: 'NotATeslaApp', credibility: 74, category: 'community' },
  { handle: 'ElectrekCo', displayName: 'Electrek', credibility: 68, category: 'media' },
];

export function getAccountCredibility(handle: string): number {
  const normalized = handle.replace('@', '').toLowerCase();
  const found = TRACKED_ACCOUNTS.find((a) => a.handle.toLowerCase() === normalized);
  return found?.credibility ?? 45;
}

export function getAccountCategory(handle: string): TrackedAccount['category'] {
  const normalized = handle.replace('@', '').toLowerCase();
  const found = TRACKED_ACCOUNTS.find((a) => a.handle.toLowerCase() === normalized);
  return found?.category ?? 'community';
}