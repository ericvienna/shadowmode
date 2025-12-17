'use client';

import Image from 'next/image';
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
import { TimeToDriverless } from './TimeToDriverless';
import { RolloutVelocity } from './RolloutVelocity';
import { RegulatoryFriction } from './RegulatoryFriction';
import { SafetySignals } from './SafetySignals';
import { EconomicImpact } from './EconomicImpact';
import { PublicTrustSignalCard } from './PublicTrustSignalCard';
import { EmailSignup } from './EmailSignup';
import { getCityProgress } from '@/lib/utils';
import { mockTrustData } from '@/lib/mockTrustData';
import {
  Car,
  ExternalLink,
  Info,
  LayoutGrid,
  Clock,
  Map,
  GitCompare,
  X,
} from 'lucide-react';

interface RobotaxiDashboardProps {
  data: DashboardData;
}

type ViewMode = 'matrix' | 'timeline' | 'map';

export function RobotaxiDashboard({ data }: RobotaxiDashboardProps) {
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
                    Tesla FSD / Robotaxi
                  </span>
                  <span className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-wide">
                    Deployment Progress
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

            {/* Right: Timestamp and Info */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LiveTimestamp lastUpdated={data.lastUpdated} />
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
            <p className="text-neutral-400 text-xs mb-3">
              This dashboard tracks Tesla's Unsupervised Full Self-Driving (Robotaxi)
              regulatory approval progress across US cities and states. Data sourced from
              public regulatory filings, job postings, and news reports.
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
        {/* Executive Summary - Above the Fold */}
        <section className="mb-6">
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

        {/* Email Signup */}
        <section className="mb-6">
          <EmailSignup />
        </section>

        {/* Legend */}
        <section className="mb-4">
          <MilestoneLegend />
        </section>

        {/* View Toggle and Filter/Sort */}
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          {/* Main View Area */}
          <div className="lg:col-span-3 order-2 lg:order-1" id="main-content">
            {viewMode === 'matrix' && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white text-sm font-semibold flex items-center gap-2">
                    <Car className="w-4 h-4 text-red-500" />
                    Deployment Progress by City
                  </h2>
                  <span className="text-[10px] text-neutral-500">
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
              <USMap states={data.states} onCityClick={handleCityClick} />
            )}
          </div>

          {/* Sidebar - matches left column height */}
          <div className="lg:self-stretch order-1 lg:order-2">
            <SidebarTabs states={data.states} />
          </div>
        </div>

        {/* Investor Intelligence Section */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <h2 className="text-white text-sm font-semibold">Investor Intelligence</h2>
            <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
              Leading Indicators & Risk Analysis
            </span>
          </div>

          {/* Row 1: Readiness & Time-to-Driverless */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ReadinessIndex states={data.states} />
            <TimeToDriverless states={data.states} />
          </div>

          {/* Row 2: Safety + Trust */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <SafetySignals states={data.states} />
            <PublicTrustSignalCard data={mockTrustData} />
          </div>

          {/* Row 3: Economic Impact & Regulatory Friction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <EconomicImpact states={data.states} />
            <RegulatoryFriction states={data.states} />
          </div>

          {/* Row 4: Rollout Velocity */}
          <div className="grid grid-cols-1 gap-4">
            <RolloutVelocity states={data.states} />
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
