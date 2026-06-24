export type RxtArea = 'austin' | 'bay-area' | 'dallas' | 'houston';

export interface RxtUnsupervisedRides {
  pct: number;
  completed: number;
  total: number;
  windowLabel: string;
}

export interface RxtAreaStats {
  area: RxtArea;
  areaLabel: string;
  provider: 'tesla';
  riderVehicles: number;
  unsupervised30d: number | null;
  inactive30d: number | null;
  cybercabs: number | null;
  unsupervisedRides: RxtUnsupervisedRides | null;
  sourceUrl: string;
  attribution: string;
  methodologyNote: string;
  fetchedAt: string;
}

export interface RxtPayload {
  areas: RxtAreaStats[];
  fetchedAt: string;
}