/** Tesla ecosystem verticals — physical layer of the digital energy thesis */

export type EcosystemVerticalId = 'robotaxi' | 'energy' | 'semi' | 'optimus';

export interface EcosystemVertical {
  id: EcosystemVerticalId;
  label: string;
  tagline: string;
  href: string;
  signal: string;
  signalDetail: string;
  sourceUrl: string;
  status: 'live' | 'ramping' | 'planned' | 'watch';
  flag?: string;
}