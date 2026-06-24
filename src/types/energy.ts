/** SHADOWMODE Energy vertical — every row requires sourceUrl or it must not render */

export interface SourcedValue {
  value: string;
  sourceUrl: string;
  sourceDate?: string;
  note?: string;
  estimated?: boolean;
}

export interface EnergyDeploymentQuarter {
  quarter: string;
  gwh: number;
  yoyNote?: string;
  sourceUrl: string;
  flag?: 'miss' | 'record';
  flagNote?: string;
}

export interface MegafactoryRow {
  site: string;
  capacityGwhPerYear: string;
  status: 'operational' | 'ramping' | 'planned';
  note?: string;
  sourceUrl: string;
}

export interface MegapackDealRow {
  customer: string;
  capacity: string;
  location?: string;
  status: 'announced' | 'under-construction' | 'operational';
  date: string;
  sourceUrl: string;
}

export interface AntiBelfortFlag {
  id: string;
  headline: string;
  detail: string;
  severity: 'warning' | 'info';
}

export interface EnergyPanelData {
  thesisLine: string;
  deployments: EnergyDeploymentQuarter[];
  grossMargin: SourcedValue;
  grossMarginNormalized?: SourcedValue;
  megafactories: MegafactoryRow[];
  megapackDeals: MegapackDealRow[];
  flags: AntiBelfortFlag[];
  lastCompiled: string;
  compiledBy: string;
}