/** SHADOWMODE Semi vertical — every row requires sourceUrl or it must not render */

export type SemiContractStatus =
  | 'reserved'
  | 'reserved-stale'
  | 'deposit-order'
  | 'operating-pilot'
  | 'delivered-volume';

export interface SemiContractRow {
  customer: string;
  units: string;
  status: SemiContractStatus;
  firstAnnounced: string;
  latestUpdate: string;
  sourceUrl: string;
  stale?: boolean;
}

export interface SemiInfraMilestone {
  label: string;
  value: string;
  sourceUrl: string;
  note?: string;
}

export interface SemiScoreboardMetric {
  label: string;
  value: string;
  subtitle?: string;
  sourceUrl: string;
  estimated?: boolean;
}

export interface SemiConversionFlag {
  id: string;
  headline: string;
  detail: string;
  severity: 'hot' | 'warning' | 'info';
}

export interface SemiPanelData {
  thesisLine: string;
  conversionFlags: SemiConversionFlag[];
  scoreboard: SemiScoreboardMetric[];
  infraMilestones: SemiInfraMilestone[];
  contracts: SemiContractRow[];
  disclaimers: string[];
  lastCompiled: string;
  compiledBy: string;
}