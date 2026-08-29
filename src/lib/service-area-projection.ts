import { geoMercator, geoPath, geoArea } from 'd3-geo';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import bundle from '@/data/service-areas.json';

/**
 * Robotaxi service-area boundaries — Tesla / Waymo / Zoox.
 *
 * Data: github.com/Robotaxi-Tracker/robotaxi-service-areas (MIT), vendored 2026-08-29.
 * Coordinates rounded to 5dp (~1m), which is far finer than the underlying traces justify.
 *
 * 🔴 THESE ARE COMMUNITY TRACES, NOT TESLA-PUBLISHED BOUNDARIES. Tesla has never released
 * its geofences. Anything rendered from this MUST carry the source and the as-of date on
 * the surface the reader sees — see SERVICE_AREA_SOURCE below. A polygon presented as
 * authoritative on a public dashboard is a credibility problem, and this dashboard is
 * linked from a deck Tesla may open.
 */

export const SERVICE_AREA_VIEWBOX = { width: 640, height: 640 } as const;

/** Provenance for the on-screen label. Derived from the bundle — never hardcode a date. */
export const SERVICE_AREA_SOURCE = {
  repo: bundle.sourceRepo as string,
  license: bundle.sourceLicense as string,
  generatedAt: bundle.generatedAt as string,
  vendoredAt: bundle.vendoredAt as string,
} as const;

export type Provider = 'tesla' | 'waymo' | 'zoox';

export interface ServiceArea {
  provider: Provider;
  slug: string;
  name: string;
  centerLat: number;
  centerLng: number;
  isTestRegion?: boolean;
  boundary: Feature<Polygon | MultiPolygon>;
}

/**
 * 🔴 WINDING ORDER — WHY EVERY POLYGON RENDERED AS A BOX FILLING THE FRAME.
 *
 * d3-geo treats polygons as SPHERICAL. Per RFC 7946 an exterior ring must be wound
 * counter-clockwise; a clockwise ring is read as its COMPLEMENT — the whole globe minus
 * the area. The upstream bundle winds clockwise.
 *
 * MEASURED on Tesla Dallas: geoArea() returned 12.5664 steradians, which is exactly 4π —
 * the entire sphere. fitExtent then chose scale 96.8 (a world fit), so the real 0.2°
 * geofence drew as a sub-pixel speck while the "polygon" (the rest of the planet) filled
 * the viewport. That is the empty outline box.
 * After reversing the rings: geoArea 5.175e-6 sr, scale 177571. Correct.
 *
 * CONDITIONAL, NOT BLIND. We rewind only when geoArea says the ring is inverted (> 2π).
 * A blind reversal would silently re-break everything the day upstream fixes their winding,
 * and that breakage would look identical to this one.
 */
function rewindIfInverted<T extends Feature<Polygon | MultiPolygon>>(feature: T): T {
  if (geoArea(feature) <= 2 * Math.PI) return feature;
  const g = feature.geometry;
  const coordinates =
    g.type === 'Polygon'
      ? g.coordinates.map((ring) => [...ring].reverse())
      : g.coordinates.map((poly) => poly.map((ring) => [...ring].reverse()));
  return { ...feature, geometry: { ...g, coordinates } } as T;
}

const areas = (bundle.areas as unknown as ServiceArea[]).map((a) => ({
  ...a,
  boundary: rewindIfInverted(a.boundary),
}));

export function getAreas(provider?: Provider): ServiceArea[] {
  return provider ? areas.filter((a) => a.provider === provider) : areas;
}

export function getArea(provider: Provider, slug: string): ServiceArea | undefined {
  return areas.find((a) => a.provider === provider && a.slug === slug);
}

/**
 * 🔴 JOIN ON `name`, NEVER ON `slug`.
 *
 * The upstream slugs are NOT consistent across providers: Tesla uses `austin` and
 * `bay_area` while Waymo uses `austin-waymo` and `bay-area-waymo` and Zoox uses
 * `bay-area-zoox`. `name` is consistent ("Austin", "Bay Area", "Dallas").
 *
 * A slug-based join therefore reports Austin and Bay Area as TESLA-ONLY, which is false —
 * Waymo operates in both and Zoox in the Bay Area. Note the direction of that error: it
 * OVERSTATES Tesla's uncontested footprint. A flattering bug on a public dashboard is
 * worse than an unflattering one, because it is the kind a Tesla reader spots instantly.
 * Caught before shipping by comparing the provider sets against the raw bundle.
 */
export function cityKey(a: ServiceArea): string {
  return a.name.trim().toLowerCase();
}

/** Every city more than one provider operates in — the comparison set. Keyed on name. */
export function getContestedCities(): Array<{ city: string; name: string; providers: Provider[] }> {
  const byCity = new Map<string, { name: string; providers: Set<Provider> }>();
  for (const a of areas) {
    const k = cityKey(a);
    if (!byCity.has(k)) byCity.set(k, { name: a.name, providers: new Set() });
    byCity.get(k)!.providers.add(a.provider);
  }
  return [...byCity.entries()]
    .filter(([, v]) => v.providers.size > 1)
    .map(([city, v]) => ({ city, name: v.name, providers: [...v.providers].sort() }))
    .sort((x, y) => x.name.localeCompare(y.name));
}

/**
 * 🔴 THE CORRECTNESS POINT OF THIS WHOLE FILE.
 *
 * Project a SET of areas through ONE shared projection fitted to their COMBINED extent.
 *
 * If each polygon were fitted to its own extent, every service area would fill its frame
 * and they would all look the same size — a 25 sq mi geofence and a 245 sq mi geofence
 * rendering identically. That is not a styling choice, it is a false comparison, and it
 * would be worst precisely where the comparison matters most.
 *
 * Anything that renders two providers side by side MUST come through this function.
 */
export function projectTogether(
  subject: ServiceArea[],
): { paths: Array<{ provider: Provider; slug: string; name: string; d: string }>; empty: boolean } {
  if (subject.length === 0) return { paths: [], empty: true };

  const collection = {
    type: 'FeatureCollection' as const,
    features: subject.map((a) => a.boundary),
  };

  const projection = geoMercator().fitExtent(
    [
      [16, 16],
      [SERVICE_AREA_VIEWBOX.width - 16, SERVICE_AREA_VIEWBOX.height - 16],
    ],
    collection,
  );

  const path = geoPath(projection);

  const paths = subject
    .map((a) => ({ provider: a.provider, slug: a.slug, name: a.name, d: path(a.boundary) ?? '' }))
    .filter((p) => p.d.length > 0);

  return { paths, empty: paths.length === 0 };
}

/**
 * All providers present in one city, projected comparably. Keyed on name, not slug.
 *
 * NAMED projectCityServiceAreas, NOT projectCity, deliberately: DeploymentPulseMap already
 * has a local projectCity(city.id) that projects a city POINT to map XY. Two functions with
 * one name and different meanings in the same codebase is a bug waiting for whoever imports
 * the wrong one — and it would typecheck.
 */
export function projectCityServiceAreas(city: string) {
  return projectTogether(areasForDashboardCity(city));
}

/**
 * Dashboard city name -> service-area city key.
 *
 * The dashboard splits the Bay Area into separate cities (San Francisco, Oakland, San Jose)
 * while the boundary data ships ONE "Bay Area" polygon per operator. Without this, clicking
 * San Francisco would report "no service area" for a metro all three operators serve.
 *
 * The upstream bundle HAS an `aliases` field, which would be the natural place for this —
 * but it is empty for all 20 areas (checked, not assumed), so the mapping is maintained
 * here. If upstream ever populates aliases, prefer theirs and delete this.
 *
 * Everything not listed falls through to an exact name match, which covers Austin, Dallas,
 * Houston, Las Vegas, Los Angeles, Miami, Orlando and Phoenix.
 */
const CITY_ALIASES: Record<string, string> = {
  'san francisco': 'bay area',
  'oakland': 'bay area',
  'san jose': 'bay area',
};

/** Service areas for a city as the DASHBOARD names it. Empty array = genuinely no data. */
export function areasForDashboardCity(city: string): ServiceArea[] {
  const raw = city.trim().toLowerCase();
  const key = CITY_ALIASES[raw] ?? raw;
  return areas.filter((a) => cityKey(a) === key);
}

/** Cheap predicate for deciding whether a city dot should be clickable at all. */
export function hasServiceAreaData(city: string): boolean {
  return areasForDashboardCity(city).length > 0;
}
