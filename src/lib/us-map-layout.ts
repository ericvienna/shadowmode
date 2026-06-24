import type { City, State } from '@/types/robotaxi';
import { getCityProgress } from '@/lib/utils';
import { getCityMapPosition } from '@/lib/us-map-projection';

export interface MapCityPoint {
  city: City;
  state: State;
  x: number;
  y: number;
  progress: number;
  driverless: boolean;
  testing: boolean;
}

export function buildMapCityPoints(states: State[]): MapCityPoint[] {
  const points: MapCityPoint[] = [];
  for (const state of states) {
    for (const city of state.cities) {
      const pos = getCityMapPosition(city.id);
      if (!pos) continue;
      const dl = city.milestones.no_safety_monitor;
      points.push({
        city,
        state,
        x: pos.x,
        y: pos.y,
        progress: getCityProgress(city),
        driverless: dl.status === 'completed',
        testing: dl.status === 'in_progress',
      });
    }
  }
  return points.sort((a, b) => b.progress - a.progress);
}

export function markerColor(progress: number, driverless: boolean, testing: boolean): string {
  if (driverless) return '#22c55e';
  if (testing) return '#facc15';
  if (progress >= 75) return '#22c55e';
  if (progress >= 50) return '#eab308';
  if (progress >= 25) return '#f97316';
  return '#ff5d5d';
}

export function markerSize(progress: number, driverless: boolean, testing: boolean): number {
  if (driverless || testing) return 12;
  if (progress >= 50) return 10;
  return 8;
}