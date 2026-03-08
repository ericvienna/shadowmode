import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEED_DATA } from '@/lib/seed-data';
import { getCityProgress, formatDate } from '@/lib/utils';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';
import type { City, State, Milestone } from '@/types/robotaxi';
import { ArrowLeft, MapPin, CheckCircle2, Circle, Clock, HelpCircle, Minus, ExternalLink, Car, TrendingUp, Calendar, Shield } from 'lucide-react';

// City coordinates for the focused map view
const CITY_GEO: Record<string, { lat: number; lng: number; zoom: number }> = {
  'tx-austin': { lat: 30.2672, lng: -97.7431, zoom: 11 },
  'tx-dallas': { lat: 32.7767, lng: -96.7970, zoom: 11 },
  'tx-houston': { lat: 29.7604, lng: -95.3698, zoom: 11 },
  'tx-san-antonio': { lat: 29.4241, lng: -98.4936, zoom: 11 },
  'ca-sf': { lat: 37.7749, lng: -122.4194, zoom: 12 },
  'ca-oak': { lat: 37.8044, lng: -122.2712, zoom: 12 },
  'ca-sj': { lat: 37.3382, lng: -121.8863, zoom: 12 },
  'ca-la': { lat: 34.0522, lng: -118.2437, zoom: 11 },
  'ca-sd': { lat: 32.7157, lng: -117.1611, zoom: 11 },
  'az-phoenix': { lat: 33.4484, lng: -112.0740, zoom: 11 },
  'az-mesa-tempe': { lat: 33.4255, lng: -111.9400, zoom: 12 },
  'nv-vegas': { lat: 36.1699, lng: -115.1398, zoom: 11 },
  'co-denver': { lat: 39.7392, lng: -104.9903, zoom: 11 },
  'il-chicago': { lat: 41.8781, lng: -87.6298, zoom: 11 },
  'fl-miami': { lat: 25.7617, lng: -80.1918, zoom: 11 },
  'fl-tampa': { lat: 27.9506, lng: -82.4572, zoom: 11 },
  'fl-orlando': { lat: 28.5383, lng: -81.3792, zoom: 11 },
  'fl-jacksonville': { lat: 30.3322, lng: -81.6557, zoom: 11 },
  'ma-boston': { lat: 42.3601, lng: -71.0589, zoom: 12 },
  'ny-brooklyn': { lat: 40.6782, lng: -73.9442, zoom: 12 },
  'ny-queens': { lat: 40.7282, lng: -73.7949, zoom: 12 },
};

// City-specific content for SEO
const CITY_CONTENT: Record<string, { headline: string; description: string }> = {
  'tx-austin': {
    headline: 'Tesla\'s First Driverless Robotaxi City',
    description: 'Austin made history as the first city where Tesla operates fully driverless robotaxis without a safety monitor. The city serves as Tesla\'s primary testing ground for unsupervised FSD technology.',
  },
  'ca-sf': {
    headline: 'Bay Area Robotaxi Hub',
    description: 'San Francisco represents Tesla\'s key California market, operating alongside competitors like Waymo and Cruise. Tesla is working toward CPUC approval for fully driverless operations.',
  },
  'nv-vegas': {
    headline: 'Entertainment Capital Testing Ground',
    description: 'Las Vegas offers unique testing conditions for Tesla\'s robotaxi program with its 24/7 activity and tourist-heavy traffic patterns.',
  },
};

function findCityAndState(slug: string): { city: City; state: State } | null {
  for (const state of SEED_DATA) {
    for (const city of state.cities) {
      const citySlug = `${city.name.toLowerCase().replace(/[,\s]+/g, '-')}-${state.abbreviation.toLowerCase()}`;
      if (citySlug === slug || city.id === slug) {
        return { city, state };
      }
    }
  }
  return null;
}

function getAllCitySlugs(): string[] {
  const slugs: string[] = [];
  for (const state of SEED_DATA) {
    for (const city of state.cities) {
      slugs.push(`${city.name.toLowerCase().replace(/[,\s]+/g, '-')}-${state.abbreviation.toLowerCase()}`);
    }
  }
  return slugs;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = findCityAndState(slug);

  if (!result) {
    return { title: 'City Not Found | SHADOWMODE' };
  }

  const { city, state } = result;
  const progress = getCityProgress(city);
  const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
  const status = hasDriverless ? 'DRIVERLESS' : 'IN_PROGRESS';

  return {
    title: `${city.name}, ${state.abbreviation} Tesla Robotaxi Status | SHADOWMODE`,
    description: `Track Tesla Robotaxi deployment in ${city.name}, ${state.abbreviation}. Current progress: ${progress}%. ${hasDriverless ? 'Now operating driverless!' : 'View permit status, milestones, and regulatory updates.'}`,
    keywords: `Tesla Robotaxi ${city.name}, Tesla FSD ${state.name}, autonomous vehicles ${city.name}, Tesla ${city.name} permit`,
    openGraph: {
      title: `${city.name}, ${state.abbreviation} - ${progress}% Complete | Tesla Robotaxi Tracker`,
      description: `Real-time Tesla Robotaxi deployment tracking for ${city.name}. ${hasDriverless ? 'DRIVERLESS operations active!' : `${progress}% toward autonomous deployment.`}`,
      url: `https://shadowmode.us/city/${slug}`,
      images: [
        {
          url: `https://shadowmode.us/api/og?city=${encodeURIComponent(city.name)}&state=${state.abbreviation}&progress=${progress}&status=${status}`,
          width: 1200,
          height: 630,
          alt: `${city.name}, ${state.abbreviation} Tesla Robotaxi Status`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${city.name}, ${state.abbreviation} - Tesla Robotaxi Status`,
      description: `${progress}% complete. ${hasDriverless ? 'Now DRIVERLESS!' : 'Track progress toward autonomous deployment.'}`,
      images: [`https://shadowmode.us/api/og?city=${encodeURIComponent(city.name)}&state=${state.abbreviation}&progress=${progress}&status=${status}`],
    },
    alternates: {
      canonical: `https://shadowmode.us/city/${slug}`,
    },
  };
}

function MilestoneIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'unknown':
      return <HelpCircle className="w-5 h-5 text-blue-500" />;
    case 'n/a':
      return <Minus className="w-5 h-5 text-neutral-600" />;
    default:
      return <Circle className="w-5 h-5 text-neutral-600" />;
  }
}

function getMilestoneValue(milestone: Milestone): string {
  if (milestone.value) return milestone.value;
  if (milestone.date) return formatDate(milestone.date);
  return '—';
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = findCityAndState(slug);

  if (!result) {
    notFound();
  }

  const { city, state } = result;
  const progress = getCityProgress(city);
  const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
  const geo = CITY_GEO[city.id] || { lat: 39.8283, lng: -98.5795, zoom: 4 };
  const content = CITY_CONTENT[city.id];

  // Get milestone timeline (completed ones with dates)
  const timeline = MILESTONE_DEFINITIONS
    .map(def => ({
      ...def,
      milestone: city.milestones[def.type],
    }))
    .filter(item => item.milestone.date && item.milestone.status === 'completed')
    .sort((a, b) => {
      const dateA = a.milestone.date || '';
      const dateB = b.milestone.date || '';
      return dateB.localeCompare(dateA);
    });

  // Count stats
  const completedCount = Object.values(city.milestones).filter(m => m.status === 'completed').length;
  const inProgressCount = Object.values(city.milestones).filter(m => m.status === 'in_progress').length;
  const totalMilestones = MILESTONE_DEFINITIONS.length;

  // Find related cities in same state
  const relatedCities = state.cities.filter(c => c.id !== city.id);

  // JSON-LD for city page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": `${city.name}, ${state.abbreviation}`,
    "description": `Tesla Robotaxi deployment status for ${city.name}, ${state.name}`,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": geo.lat,
      "longitude": geo.lng
    },
    "containedInPlace": {
      "@type": "State",
      "name": state.name
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
              SHADOWMODE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-red-500" />
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {city.name}, {state.abbreviation}
                </h1>
                {hasDriverless && (
                  <span className="px-3 py-1 text-sm font-bold bg-green-500/20 text-green-400 rounded-full border border-green-500/30 animate-pulse">
                    DRIVERLESS
                  </span>
                )}
              </div>
              <p className="text-neutral-400 text-lg">
                {content?.headline || `Tesla Robotaxi Deployment in ${state.name}`}
              </p>
            </div>

            {/* Progress Circle */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#262626"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={progress >= 75 ? '#22c55e' : progress >= 50 ? '#eab308' : progress >= 25 ? '#f97316' : '#6b7280'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark Map Section */}
        <div className="mb-8 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
          <div className="relative h-64 sm:h-80">
            {/* Dark map using a free tile service */}
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${geo.lng - 0.15}%2C${geo.lat - 0.1}%2C${geo.lng + 0.15}%2C${geo.lat + 0.1}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`}
              className="w-full h-full border-0 grayscale invert brightness-[0.8] contrast-[1.2]"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-transparent to-neutral-950/50 pointer-events-none" />

            {/* Service area indicator */}
            <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/80 border border-neutral-700 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${hasDriverless ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                <span className="text-xs text-neutral-300">
                  {hasDriverless ? 'Active Service Area' : 'Testing Zone'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-neutral-500 uppercase">Completed</span>
            </div>
            <div className="text-2xl font-bold text-white">{completedCount}</div>
            <div className="text-xs text-neutral-500">of {totalMilestones} milestones</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-neutral-500 uppercase">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">{inProgressCount}</div>
            <div className="text-xs text-neutral-500">active milestones</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-neutral-500 uppercase">Vehicles</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {city.milestones.vehicles_deployed_20_plus.value || '—'}
            </div>
            <div className="text-xs text-neutral-500">deployed</div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-neutral-500 uppercase">Status</span>
            </div>
            <div className={`text-lg font-bold ${hasDriverless ? 'text-green-400' : 'text-yellow-400'}`}>
              {hasDriverless ? 'Driverless' : 'Supervised'}
            </div>
            <div className="text-xs text-neutral-500">operation mode</div>
          </div>
        </div>

        {/* Description */}
        {content && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 mb-8">
            <p className="text-neutral-300 leading-relaxed">
              {content.description}
            </p>
          </div>
        )}

        {/* State Notes */}
        {state.notes && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-lg">*</div>
              <p className="text-yellow-200/80 text-sm">{state.notes}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Milestones */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Milestone Status
            </h2>
            <div className="space-y-3">
              {MILESTONE_DEFINITIONS.map(def => {
                const milestone = city.milestones[def.type];
                return (
                  <div
                    key={def.type}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      milestone.status === 'completed'
                        ? 'bg-green-500/5 border-green-500/20'
                        : milestone.status === 'in_progress'
                        ? 'bg-yellow-500/5 border-yellow-500/20'
                        : 'bg-neutral-900/50 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MilestoneIcon status={milestone.status} />
                      <div>
                        <div className="text-sm text-white">{def.label}</div>
                        <div className="text-xs text-neutral-500">{def.description}</div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-400">
                      {getMilestoneValue(milestone)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Milestone Timeline
            </h2>
            {timeline.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-neutral-800" />
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.type} className="flex items-start gap-4 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                        index === 0 ? 'bg-green-500' : 'bg-neutral-700'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="text-sm font-medium text-white">{item.label}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {formatDate(item.milestone.date!)}
                          {item.milestone.value && ` • ${item.milestone.value}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 text-sm">No dated milestones yet.</p>
            )}
          </div>
        </div>

        {/* Related Cities */}
        {relatedCities.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              Other Cities in {state.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedCities.map(relatedCity => {
                const relatedProgress = getCityProgress(relatedCity);
                const relatedSlug = `${relatedCity.name.toLowerCase().replace(/[,\s]+/g, '-')}-${state.abbreviation.toLowerCase()}`;
                return (
                  <Link
                    key={relatedCity.id}
                    href={`/city/${relatedSlug}`}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="text-sm font-medium text-white">{relatedCity.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            relatedProgress >= 75 ? 'bg-green-500' : relatedProgress >= 50 ? 'bg-yellow-500' : 'bg-neutral-600'
                          }`}
                          style={{ width: `${relatedProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">{relatedProgress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors"
          >
            View All Cities
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-neutral-600 text-xs">
            SHADOWMODE • Tesla Robotaxi Tracker • Not affiliated with Tesla, Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
