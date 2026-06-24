export interface RxtCommunityOps {
  totalRides: number;
  pricedRides: number;
  avgFare: number | null;
  medianFare: number | null;
  avgMiles: number | null;
  farePerMile: number | null;
  sourceUrl: string;
  attribution: string;
  methodologyNote: string;
  fetchedAt: string;
}

export interface RxtMarketUnsupervised {
  market: 'austin' | 'dallas' | 'houston' | 'bay-area';
  vehicles: number;
  rides: number;
  unsupervisedSharePct: number;
}

export interface RxtUnsupervisedSummary {
  activeVehicles: number;
  loggedRides: number;
  sharePct: number;
  loggedMiles: number;
}

export interface RxtRegulatoryCrosscheck {
  texasDmvRegistered: number;
  communityVinMatches: number;
  complaintCasesOpen: number;
  sourceUrl: string;
  attribution: string;
  methodologyNote: string;
  fetchedAt: string;
}

export interface RxtExtendedPayload {
  communityOps: RxtCommunityOps | null;
  unsupervisedMarkets: RxtMarketUnsupervised[];
  unsupervisedSummary: RxtUnsupervisedSummary | null;
  regulatory: RxtRegulatoryCrosscheck | null;
  fetchedAt: string;
  ingestionMethod: 'firecrawl' | 'fallback';
}

export interface LivingReceiptEntry {
  id: string;
  url: string;
  label: string;
  vertical: string;
  status: 'same' | 'changed' | 'error' | 'new';
  lastChecked: string;
  lastChanged?: string;
  contentHash?: string;
  error?: string;
}

export interface LivingReceiptsPayload {
  entries: LivingReceiptEntry[];
  checkedAt: string;
  changedCount: number;
}