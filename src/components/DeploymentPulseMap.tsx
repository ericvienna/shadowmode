'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { State } from '@/types/robotaxi';

type MapStatus = 'loading' | 'ready' | 'error' | 'missing-key';

interface GoogleMapsNamespace {
  Map: new (element: HTMLElement, options: {
    center: { lat: number; lng: number };
    zoom: number;
    minZoom: number;
    maxZoom: number;
    backgroundColor: string;
    disableDefaultUI: boolean;
    clickableIcons: boolean;
    gestureHandling: string;
    keyboardShortcuts: boolean;
    mapTypeControl: boolean;
    fullscreenControl: boolean;
    streetViewControl: boolean;
    zoomControl: boolean;
    restriction: {
      latLngBounds: {
        north: number;
        south: number;
        west: number;
        east: number;
      };
      strictBounds: boolean;
    };
    styles: ReadonlyArray<Record<string, unknown>>;
  }) => object;
  Marker: new (options: {
    position: { lat: number; lng: number };
    map: object;
    title: string;
    icon: {
      path: unknown;
      fillColor: string;
      fillOpacity: number;
      strokeColor: string;
      strokeOpacity: number;
      strokeWeight: number;
      scale: number;
    };
  }) => {
    setMap: (map: null) => void;
  };
  SymbolPath: {
    CIRCLE: unknown;
  };
  event: {
    clearInstanceListeners: (instance: object) => void;
  };
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsNamespace;
    };
  }
}

interface DeploymentPulseMapProps {
  states: State[];
}

interface CityMarker {
  key: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  progress: number;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SRC = GOOGLE_MAPS_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&v=quarterly`
  : null;

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Dallas, TX': { lat: 32.7767, lng: -96.797 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'San Antonio, TX': { lat: 29.4241, lng: -98.4936 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Oakland, CA': { lat: 37.8044, lng: -122.2712 },
  'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
  'San Diego, CA': { lat: 32.7157, lng: -117.1611 },
  'Mesa, AZ': { lat: 33.4152, lng: -111.8315 },
  'Tempe, AZ': { lat: 33.4255, lng: -111.94 },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.074 },
  'Las Vegas, NV': { lat: 36.1699, lng: -115.1398 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Jacksonville, FL': { lat: 30.3322, lng: -81.6557 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918 },
  'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
  'Tampa, FL': { lat: 27.9506, lng: -82.4572 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589 },
  'Brooklyn, NY': { lat: 40.6782, lng: -73.9442 },
  'Queens, NY': { lat: 40.7282, lng: -73.7949 },
};

const US_BOUNDS = {
  north: 49.6,
  south: 24.3,
  west: -125.2,
  east: -66.7,
};

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#121417' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8f979f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121417' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#1e2328' }] },
  { featureType: 'administrative.province', elementType: 'geometry.fill', stylers: [{ color: '#171a1d' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#34383d' }, { weight: 1.15 }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#c4ccd4' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.stroke', stylers: [{ color: '#121417' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#7f8790' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.stroke', stylers: [{ color: '#121417' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#14181c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0b1116' }] },
  { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

let googleMapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(src: string) {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps="shadowmode"]');
    if (existing) {
      if (window.google?.maps) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'shadowmode';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps.'));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

function getCityProgress(state: State, city: State['cities'][number]) {
  const milestones = Object.values(city.milestones);
  const completed = milestones.filter((milestone) => milestone.status === 'completed').length;
  return Math.round((completed / milestones.length) * 100);
}

const FallbackMap = memo(function FallbackMap({
  message,
  cities,
}: {
  message: string;
  cities: CityMarker[];
}) {
  return (
    <div className="h-full rounded-[20px] border border-neutral-800 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_52%),linear-gradient(180deg,#171b1f_0%,#0b0d10_100%)] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-500">
            US Robotaxi Map
          </div>
          <div className="mt-1 text-xs text-neutral-600">
            Google Maps style target: state borders + city labels only
          </div>
        </div>
        <div className="text-right text-[10px] text-neutral-700">
          {cities.length} tracked cities
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-neutral-700 bg-[#0d1013]/70 p-4 text-xs text-neutral-500">
        {message}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
        {cities.slice(0, 12).map((city) => (
          <div
            key={city.key}
            className="rounded-xl border border-neutral-800 bg-[#12161a]/80 px-3 py-2"
          >
            <div className="text-[11px] font-medium text-neutral-200">
              {city.name}, {city.state}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-red-400/80">
              {city.progress}% complete
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export function DeploymentPulseMap({ states }: DeploymentPulseMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapStatus, setMapStatus] = useState<MapStatus>(
    GOOGLE_MAPS_SRC ? 'loading' : 'missing-key'
  );

  const cityMarkers = useMemo<CityMarker[]>(() => {
    return states.flatMap((state) =>
      state.cities
        .map((city) => {
          const key = `${city.name}, ${state.abbreviation}`;
          const coords = CITY_COORDS[key];
          if (!coords) return null;

          return {
            key,
            name: city.name,
            state: state.abbreviation,
            lat: coords.lat,
            lng: coords.lng,
            progress: getCityProgress(state, city),
          };
        })
        .filter((city): city is CityMarker => city !== null)
    );
  }, [states]);

  useEffect(() => {
    if (!GOOGLE_MAPS_SRC) {
      return;
    }

    let cancelled = false;
    let map: object | null = null;
    const markers: Array<{ setMap: (map: null) => void }> = [];

    loadGoogleMapsScript(GOOGLE_MAPS_SRC)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const maps = window.google.maps;

        const googleMap = new maps.Map(mapRef.current, {
          center: { lat: 38.5, lng: -96.5 },
          zoom: 4.2,
          minZoom: 3.5,
          maxZoom: 6,
          backgroundColor: '#0b0f13',
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: 'none',
          keyboardShortcuts: false,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false,
          restriction: {
            latLngBounds: US_BOUNDS,
            strictBounds: false,
          },
          styles: MAP_STYLES,
        });

        map = googleMap;

        cityMarkers.forEach((city) => {
          const intensity = Math.max(city.progress / 100, 0.35);

          const marker = new maps.Marker({
            position: { lat: city.lat, lng: city.lng },
            map: googleMap,
            title: `${city.name}, ${city.state} (${city.progress}% complete)`,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              fillColor: '#ff5d5d',
              fillOpacity: intensity,
              strokeColor: '#fff5f5',
              strokeOpacity: 0.9,
              strokeWeight: 1.25,
              scale: city.progress >= 70 ? 6.5 : city.progress >= 40 ? 5.25 : 4.25,
            },
          });

          markers.push(marker);
        });

        setMapStatus('ready');
      })
      .catch((error) => {
        console.error('[DeploymentPulseMap]', error);
        if (!cancelled) setMapStatus('error');
      });

    return () => {
      cancelled = true;
      markers.forEach((marker) => marker.setMap(null));
      if (map && window.google?.maps) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [cityMarkers]);

  const statusText =
    mapStatus === 'missing-key'
      ? 'Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env.local` to render the live Google map in the hero.'
      : mapStatus === 'error'
        ? 'Google Maps failed to load. Check the API key, Maps JavaScript API enablement, and domain restrictions.'
        : 'Loading Google Maps...';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#0b0f13]">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-500">
            US Robotaxi Map
          </div>
          <div className="mt-1 text-[11px] text-neutral-600">
            Google basemap tuned to state outlines and city labels only
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.28em] text-neutral-700">
            Shadowmode
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {cityMarkers.length} tracked cities
          </div>
        </div>
      </div>

      <div className="relative min-h-[280px] flex-1">
        <div
          ref={mapRef}
          className={`absolute inset-0 h-full w-full ${mapStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />

        {mapStatus === 'ready' ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0b0f13] via-[#0b0f13]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0b0f13] to-transparent" />
          </>
        ) : (
          <FallbackMap message={statusText} cities={cityMarkers} />
        )}
      </div>
    </div>
  );
}
