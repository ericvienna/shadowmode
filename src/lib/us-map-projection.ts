import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { FeatureCollection } from 'geojson';
import statesGeo from '@/data/us-states.json';

/** SVG viewBox dimensions — single source of truth for all map surfaces */
export const MAP_VIEWBOX = { width: 960, height: 600 } as const;

/** [longitude, latitude] — d3-geo convention */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  'ca-sf': [-122.4194, 37.7749],
  'ca-oak': [-122.2712, 37.8044],
  'ca-sj': [-121.8863, 37.3382],
  'ca-la': [-118.2437, 34.0522],
  'ca-sd': [-117.1611, 32.7157],
  'nv-vegas': [-115.1398, 36.1699],
  'az-phoenix': [-112.074, 33.4484],
  'az-mesa-tempe': [-111.8315, 33.4152],
  'tx-austin': [-97.7431, 30.2672],
  'tx-dallas': [-96.797, 32.7767],
  'tx-houston': [-95.3698, 29.7604],
  'tx-san-antonio': [-98.4936, 29.4241],
  'co-denver': [-104.9903, 39.7392],
  'il-chicago': [-87.6298, 41.8781],
  'fl-miami': [-80.1918, 25.7617],
  'fl-tampa': [-82.4572, 27.9506],
  'fl-orlando': [-81.3792, 28.5383],
  'fl-jacksonville': [-81.6557, 30.3322],
  'ma-boston': [-71.0589, 42.3601],
  'ny-brooklyn': [-73.9442, 40.6782],
  'ny-queens': [-73.7949, 40.7282],
};

const statesCollection = statesGeo as FeatureCollection;

let cachedProjection: ReturnType<typeof geoAlbersUsa> | null = null;
let cachedStatePaths: Array<{ id: string; d: string }> | null = null;

export function getMapProjection() {
  if (!cachedProjection) {
    cachedProjection = geoAlbersUsa()
      .scale(1100)
      .translate([MAP_VIEWBOX.width / 2, MAP_VIEWBOX.height / 2]);
  }
  return cachedProjection;
}

export function getStatePaths() {
  if (!cachedStatePaths) {
    const projection = getMapProjection();
    const pathGenerator = geoPath(projection);
    cachedStatePaths = statesCollection.features
      .map((feature) => ({
        id: (feature.properties as { name?: string } | null)?.name ?? 'unknown',
        d: pathGenerator(feature) ?? '',
      }))
      .filter((entry) => entry.d.length > 0);
  }
  return cachedStatePaths;
}

export function projectCity(cityId: string): { x: number; y: number } | null {
  const coords = CITY_COORDINATES[cityId];
  if (!coords) return null;
  const projected = getMapProjection()(coords);
  if (!projected) return null;
  return { x: projected[0], y: projected[1] };
}

export function toPercent(x: number, y: number) {
  return {
    x: (x / MAP_VIEWBOX.width) * 100,
    y: (y / MAP_VIEWBOX.height) * 100,
  };
}

export function getCityMapPosition(cityId: string): { x: number; y: number } | null {
  const projected = projectCity(cityId);
  if (!projected) return null;
  return toPercent(projected.x, projected.y);
}