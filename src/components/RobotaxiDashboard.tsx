'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import type { DashboardData, City, State } from '@/types/robotaxi';
import { ProgressMatrix } from './ProgressMatrix';
import { StatsCards } from './StatsCards';
import { MilestoneLegend } from './MilestoneLegend';
import { SidebarTabs } from './SidebarTabs';
import { LiveTimestamp } from './LiveTimestamp';
import { CountdownWidget } from './CountdownWidget';
import { USMap } from './USMap';
import { TimelineView } from './TimelineView';
import { CityModal } from './CityModal';
import { CompareModal } from './CompareModal';
import { FilterSort, type SortOption, type SortDirection, type FilterOption } from './FilterSort';
import { ExecutiveSummary } from './ExecutiveSummary';
import { ReadinessIndex } from './ReadinessIndex';
import { NarrativePressure } from './NarrativePressure';
import { TimeToDriverless } from './TimeToDriverless';
import { RolloutVelocity } from './RolloutVelocity';
import { IrreversibilityIndex } from './IrreversibilityIndex';
import { RegulatoryFriction } from './RegulatoryFriction';
import { SafetySignals } from './SafetySignals';
import { EconomicImpact } from './EconomicImpact';
import { PublicTrustSignalCard } from './PublicTrustSignalCard';
import { EmailSignup } from './EmailSignup';
import { EpistemicStamp } from './EpistemicStamp';
import { ChangeLog } from './ChangeLog';
import { PredictionsLedger } from './PredictionsLedger';
import { FleetInsights } from './FleetInsights';
import { AVLandscape } from './AVLandscape';
import { ShadowmodeHero } from './ShadowmodeHero';

import { VerticalNav } from './shared/VerticalNav';
import { getCityProgress } from '@/lib/utils';
import { mockTrustData } from '@/lib/mockTrustData';
import { useXIntel } from '@/hooks/useXIntel';
import {
  MetaPanels,
  ShadowSignalPanel,
  ReplyConfirmationPanel,
  PromiseLedgerPanel,
  TweetCorrelationPanel,
  CascadePanel,
  CityBuzzSection,
  IncidentPanel,
  CompetitivePanel,
  StokesSyncPanel,
  GeofencePanel,
  FleetCounterPanel,
} from './v2/panels';
import {
  Car,
  ExternalLink,
  Info,
  LayoutGrid,
  Clock,
  Map,
  GitCompare,
  X,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface RobotaxiDashboardProps {
  data: DashboardData;
}

type ViewMode = 'matrix' | 'timeline' | 'map';

export function RobotaxiDashboard({ data }: RobotaxiDashboardProps) {
  const { intel, loading: intelLoading, error: intelError, refresh: refreshIntel } = useXIntel();
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('progress');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  // Filter and sort states/cities
  const processedStates = useMemo(() => {
    let states = [...data.states];

    // Apply filter
    if (filterOption !== 'all') {
      states = states.map(state => ({
        ...state,
        cities: state.cities.filter(city => {
          switch (filterOption) {
            case 'driverless':
              return city.milestones.no_safety_monitor.status === 'completed';
            case 'public_program':
              return city.milestones.public_test_program_launched.status === 'completed';
            case 'active':
              return Object.values(city.milestones).some(m => m.status !== 'not_started');
            default:
              return true;
          }
        }),
      })).filter(state => state.cities.length > 0);
    }

    // Apply sort
    states = states.map(state => ({
      ...state,
      cities: [...state.cities].sort((a, b) => {
        let comparison = 0;
        switch (sortOption) {
          case 'progress':
            comparison = getCityProgress(b) - getCityProgress(a);
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'recent':
            // Sort by most recent milestone date
            const getLatestDate = (city: City) => {
              const dates = Object.values(city.milestones)
                .filter(m => m.date && !/^\d{4}$/.test(m.date))
                .map(m => new Date(m.date!).getTime());
              return dates.length > 0 ? Math.max(...dates) : 0;
            };
            comparison = getLatestDate(b) - getLatestDate(a);
            break;
          case 'vehicles':
            const getVehicles = (city: City) => {
              const v = city.milestones.vehicles_deployed_20_plus.value;
              if (!v) return 0;
              const match = v.match(/(\d+)/);
              return match ? parseInt(match[1]) : 0;
            };
            comparison = getVehicles(b) - getVehicles(a);
            break;
        }
        return sortDirection === 'asc' ? -comparison : comparison;
      }),
    }));

    return states;
  }, [data.states, filterOption, sortOption, sortDirection]);

  const handleCityClick = (city: City, state: State) => {
    setSelectedCity(city);
    setSelectedState(state);
  };

  const handleCityIdClick = (cityId: string) => {
    data.states.forEach(state => {
      const city = state.cities.find(c => c.id === cityId);
      if (city) {
        setSelectedCity(city);
        setSelectedState(state);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur border-b border-neutral-800 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between relative">
            {/* Left: Logo and Text */}
            <div className="flex items-center gap-3">
              <Image
                src="/shadowmode-logo.svg"
                alt="SHADOWMODE"
                width={200}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wide">
                    Digital Energy Terminal
                  </span>
                  <span className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wide">
                    Power · Compute · Autonomy
                  </span>
                </div>
                <span className="px-1.5 py-0.5 text-[8px] font-semibold bg-red-500/20 text-red-400 rounded border border-red-500/30">
                  BETA
                </span>
              </div>
            </div>

            {/* Center: Tesla Wordmark (desktop only) */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/tesla-wordmark.png"
                alt="Tesla"
                width={150}
                height={25}
                className="h-6 w-auto object-contain opacity-60"
              />
            </div>

            {/* Right: Vertical nav + Timestamp */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:block">
                <VerticalNav active="robotaxi" compact />
              </div>
              <LiveTimestamp lastUpdated={data.lastUpdated} />
              {intel && (
                <a
                  href="#x-intel"
                  className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors text-[9px] text-cyan-400 font-bold tracking-wider"
                  title="Jump to X Intelligence"
                >
                  <Zap className="w-3 h-3" />
                  X {intel.source.toUpperCase()}
                </a>
              )}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-1.5 sm:p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                title="About"
              >
                <Info className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      {showInfo && (
        <div className="bg-neutral-950 border-b border-neutral-800 px-3 sm:px-4 lg:px-6 py-4 animate-slide-in">
          <div className="max-w-4xl">
            <div className="flex items-start justify-between">
              <h3 className="text-white font-semibold text-sm mb-2">
                About This Tracker
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-neutral-400 text-xs mb-3 normal-case">
              SHADOWMODE tracks Tesla&apos;s physical layer with sourced, falsifiable scoreboards:
              Robotaxi deployment across US cities, Energy storage (GWh deployed, Megapack deals),
              and the Semi contract ledger. Every metric links to a source — reservation ≠ delivery.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <a
                href="https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
              >
                CA DMV AV Database
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://www.tesla.com/careers/search"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
              >
                Tesla Careers
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-800">
              <p className="text-neutral-500 text-[10px]">
                <strong>Notes:</strong> Tesla Insurance only available in 12 US States.
                In California, Tesla needs Driverless Tester Permit + CPUC enrollment to remove safety monitors.
                In Texas, final TxDMV authorization required per Senate Bill 2807 (2026).
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="w-full px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        {/* Hero — Ticker + Mission Clock + Pulse Map */}
        <ShadowmodeHero states={data.states} intel={intel} />

        {/* X Intelligence Layer — woven into v1 */}
        {intel && (
          <section id="x-intel" className="mb-6 scroll-mt-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <h2 className="text-white text-sm font-semibold">X Intelligence</h2>
                <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
                  Live social signals · {intel.rawTweetCount} tweets ingested
                </span>
              </div>
              <button
                onClick={refreshIntel}
                disabled={intelLoading}
                className="flex items-center gap-1 text-[9px] text-neutral-500 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${intelLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {intelError && (
              <p className="text-[10px] text-yellow-500 mb-3 normal-case">X feed partial — using hybrid/seed fallbacks.</p>
            )}
            <MetaPanels data={intel} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 items-start">
              <ShadowSignalPanel data={intel} />
              <ReplyConfirmationPanel data={intel} />
              <StokesSyncPanel data={intel} />
            </div>
          </section>
        )}

        {/* Executive Summary - Desktop: Above the Fold, Mobile: After Stats */}
        <section className="mb-6 hidden lg:block">
          <ExecutiveSummary states={data.states} />
        </section>

        {/* Countdown Widgets */}
        <section className="mb-6">
          <CountdownWidget states={data.states} />
        </section>

        {/* Stats Cards */}
        <section className="mb-6">
          <StatsCards states={data.states} />
        </section>

        {/* Executive Summary - Mobile only: After Stats, Before Email */}
        <section className="mb-6 lg:hidden">
          <ExecutiveSummary states={data.states} />
        </section>

        {/* The Ledger — the diff and the record */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-neutral-400 to-neutral-600 rounded-full" />
            <h2 className="text-white text-sm font-semibold">The Ledger</h2>
            <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
              What changed, and what we said would happen
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <ChangeLog />
            <PredictionsLedger />
          </div>
        </section>

        {/* Email Signup */}
        <section className="mb-6">
          <EmailSignup />
        </section>

        {/* Desktop: Legend before main grid */}
        <section className="mb-4 hidden lg:block">
          <MilestoneLegend />
        </section>

        {/* Desktop: View Toggle and Filter/Sort before main grid */}
        <section className="mb-4 hidden lg:flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                  viewMode === 'matrix' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                Matrix
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                  viewMode === 'timeline' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                  viewMode === 'map' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Map className="w-3 h-3" />
                Map
              </button>
            </div>

            {/* Compare Button */}
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <GitCompare className="w-3 h-3" />
              Compare
            </button>
          </div>

          {/* Filter/Sort - only show for matrix view */}
          {viewMode === 'matrix' && (
            <FilterSort
              onSortChange={(sort, dir) => {
                setSortOption(sort);
                setSortDirection(dir);
              }}
              onFilterChange={setFilterOption}
              currentSort={sortOption}
              currentDirection={sortDirection}
              currentFilter={filterOption}
            />
          )}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar - Mobile: First (News), Desktop: Right side */}
          <div className="lg:sticky lg:top-20 lg:self-start order-1 lg:order-2">
            <SidebarTabs states={data.states} intel={intel} />
          </div>

          {/* Mobile: Legend after Sidebar/News */}
          <div className="order-2 lg:hidden">
            <MilestoneLegend />
          </div>

          {/* Mobile: View Toggle and Filter/Sort after Legend */}
          <section className="order-3 lg:hidden flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                    viewMode === 'matrix' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3" />
                  Matrix
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                    viewMode === 'timeline' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded transition-colors ${
                    viewMode === 'map' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  Map
                </button>
              </div>

              {/* Compare Button */}
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <GitCompare className="w-3 h-3" />
                Compare
              </button>
            </div>

            {/* Filter/Sort - only show for matrix view */}
            {viewMode === 'matrix' && (
              <FilterSort
                onSortChange={(sort, dir) => {
                  setSortOption(sort);
                  setSortDirection(dir);
                }}
                onFilterChange={setFilterOption}
                currentSort={sortOption}
                currentDirection={sortDirection}
                currentFilter={filterOption}
              />
            )}
          </section>

          {/* Main View Area */}
          <div className="lg:col-span-3 order-4 lg:order-1" id="main-content">
            {viewMode === 'matrix' && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white text-sm font-semibold flex items-center gap-2">
                    <Car className="w-4 h-4 text-red-500" />
                    Deployment Progress by City
                    <EpistemicStamp tier="sourced" />
                  </h2>
                  <span className="text-[10px] text-neutral-500 hidden sm:inline">
                    {filterOption !== 'all' && `Filtered • `}
                    Scroll horizontally to see all milestones →
                  </span>
                </div>
                <ProgressMatrix states={processedStates} />
              </section>
            )}

            {viewMode === 'timeline' && (
              <TimelineView states={data.states} onCityClick={handleCityIdClick} />
            )}

            {viewMode === 'map' && (
              <>
                <USMap states={data.states} onCityClick={handleCityClick} />
                {intel && (
                  <div className="mt-4">
                    <CityBuzzSection data={intel} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* City buzz — compact, once per page */}
        {intel && viewMode !== 'map' && (
          <section className="mt-6">
            <CityBuzzSection data={intel} />
          </section>
        )}

        {/* Live Fleet Tracking */}
        <section className="mt-8 space-y-4">
          <FleetInsights />
          {intel && <FleetCounterPanel data={intel} />}
        </section>

        {/* Competitive Landscape */}
        <section className="mt-8 space-y-4">
          <AVLandscape />
          {intel && <CompetitivePanel data={intel} />}
        </section>

        {/* Investor Intelligence Section */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h2 className="text-white text-sm font-semibold">Investor Intelligence</h2>
            <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
              Leading Indicators & Risk Analysis
            </span>
          </div>

          {/* Row 1: Readiness + Time-to-Driverless */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
            <ReadinessIndex states={data.states} />
            <TimeToDriverless states={data.states} />
          </div>

          {/* Row 2: Narrative Pressure (v1 + X) + Promise Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
            <NarrativePressure states={data.states} xIntel={intel} />
            {intel && <PromiseLedgerPanel data={intel} />}
          </div>

          {/* Row 3: Cascade + Tweet Correlation — tight pair */}
          {intel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start content-start">
              <CascadePanel data={intel} />
              <TweetCorrelationPanel data={intel} />
            </div>
          )}

          {/* Row 4: Safety (v1 + X incidents) + Trust (v1 + X pulse) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <SafetySignals states={data.states} incidentFlashes={intel?.incidentFlashes} />
            <PublicTrustSignalCard data={mockTrustData} xTrust={intel?.trustPulse} />
          </div>

          {/* Row 5: Incidents + Geofence whispers */}
          {intel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-start">
              <IncidentPanel data={intel} />
              <GeofencePanel data={intel} />
            </div>
          )}

          {/* Row 6: Economic Impact & Regulatory Friction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <EconomicImpact states={data.states} />
            <RegulatoryFriction states={data.states} />
          </div>

          {/* Row 7: Rollout Velocity + Irreversibility */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RolloutVelocity states={data.states} />
            <IrreversibilityIndex states={data.states} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-neutral-900 py-3">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-neutral-600 text-[10px]">
              Tesla Robotaxi Tracker • Data from public sources • Not affiliated with Tesla, Inc.
            </p>
            <p className="text-neutral-600 text-[10px]">
              Inspired by{' '}
              <a
                href="https://twitter.com/JonathanWStokes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                @JonathanWStokes
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CityModal
        city={selectedCity}
        state={selectedState}
        onClose={() => {
          setSelectedCity(null);
          setSelectedState(null);
        }}
      />

      <CompareModal
        states={data.states}
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
      />
    </div>
  );
}
