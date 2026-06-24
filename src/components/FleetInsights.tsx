'use client';

import { useEffect, useState } from 'react';
import { Car, MapPin, Route, Activity, Loader2, ExternalLink } from 'lucide-react';
import { useRobotaxiTracker } from '@/hooks/useRobotaxiTracker';
import type { RxtArea } from '@/types/robotaxi-tracker';

const FLEET_RXT_AREAS: RxtArea[] = ['austin', 'bay-area', 'dallas', 'houston'];

interface ServiceAreaStats {
  id: string;
  name: string;
  provider: 'tesla' | 'waymo';
  vehicleCount: number;
  tripCount: number;
  totalMiles: number;
}

interface FleetData {
  totalVehicles: number;
  totalTrips: number;
  totalMiles: number;
  teslaVehicles: number;
  waymoVehicles: number;
  serviceAreas: ServiceAreaStats[];
  lastUpdated: string;
}

export function FleetInsights() {
  const { data: rxtData, loading: rxtLoading } = useRobotaxiTracker(FLEET_RXT_AREAS);
  const [fleetData, setFleetData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFleetData() {
      try {
        const response = await fetch('/api/fleet');
        if (response.ok) {
          const data = await response.json();
          setFleetData(data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch fleet data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFleetData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchFleetData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-center gap-2 text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading fleet data...</span>
        </div>
      </div>
    );
  }

  if (error || !fleetData) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <div className="text-center text-neutral-500 text-sm">
          Unable to load fleet data
        </div>
      </div>
    );
  }

  // Get top service areas (Tesla-focused)
  const teslaAreas = fleetData.serviceAreas.filter(a => a.provider === 'tesla');
  const waymoAreas = fleetData.serviceAreas.filter(a => a.provider === 'waymo');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500" />
          Driverless Markets
        </h2>
        <a
          href="https://github.com/path-avmap/av-map-data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          via av-map-data
        </a>
      </div>

      {/* Community fleet intel — robotaxitracker.com */}
      <div className="bg-neutral-950 border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white text-xs font-semibold">Community Fleet Intel</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5 normal-case">
              Discovered vehicles via Ethan McKanna&apos;s tracker
            </p>
          </div>
          <a
            href="https://robotaxitracker.com/?provider=tesla&area=austin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-emerald-500/80 hover:text-emerald-400"
          >
            robotaxitracker.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {rxtLoading ? (
          <div className="flex items-center gap-2 text-neutral-500 text-sm py-4 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading community fleet…
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(rxtData?.areas ?? []).map((area) => (
              <a
                key={area.area}
                href={area.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 hover:border-emerald-500/30 transition-colors"
              >
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{area.areaLabel}</p>
                <p className="text-2xl font-bold text-white mt-1">{area.riderVehicles}</p>
                <p className="text-[9px] text-neutral-600">rider vehicles discovered</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[9px]">
                  {area.unsupervised30d !== null && (
                    <span className="text-emerald-400">{area.unsupervised30d} unsupervised</span>
                  )}
                  {area.cybercabs !== null && (
                    <span className="text-neutral-400">{area.cybercabs} cybercabs</span>
                  )}
                  {area.unsupervisedRides && (
                    <span className="text-neutral-500">{area.unsupervisedRides.pct}% unsup. rides</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
        <p className="text-[9px] text-neutral-700 mt-3 normal-case">
          Community-discovered counts only — undercounts official fleet. Wait-time data loads client-side on
          robotaxitracker.com.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Vehicles */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-4 h-4 text-red-500" />
            <span className="text-[10px] text-neutral-500 uppercase">Total Fleet</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {fleetData.totalVehicles.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Cited in av-map notes
          </div>
        </div>

        {/* Tesla vs Waymo Split */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <span className="text-red-500 text-xs font-bold">T</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase">Tesla</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {fleetData.teslaVehicles.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(fleetData.teslaVehicles / fleetData.totalVehicles) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500">
              {Math.round((fleetData.teslaVehicles / fleetData.totalVehicles) * 100)}%
            </span>
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] text-neutral-500 uppercase">Trips</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {fleetData.totalTrips.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Not live-sourced yet
          </div>
        </div>

        {/* Total Miles */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="text-[10px] text-neutral-500 uppercase">Miles</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {fleetData.totalMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Not live-sourced yet
          </div>
        </div>
      </div>

      {/* Service Areas Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Tesla Service Areas */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-neutral-500 uppercase">Tesla Service Areas</span>
          </div>
          <div className="space-y-2">
            {teslaAreas.length > 0 ? teslaAreas.slice(0, 4).map((area) => (
              <div key={area.id} className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">{area.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{area.vehicleCount}</span>
                  {area.tripCount > 0 && (
                    <span className="text-[10px] text-neutral-500">
                      {area.tripCount} trips
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-sm text-neutral-500">No data available</div>
            )}
          </div>
        </div>

        {/* Waymo Service Areas */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-neutral-500 uppercase">Waymo Service Areas</span>
          </div>
          <div className="space-y-2">
            {waymoAreas.length > 0 ? waymoAreas.slice(0, 4).map((area) => (
              <div key={area.id} className="flex items-center justify-between">
                <span className="text-sm text-neutral-300">{area.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{area.vehicleCount}</span>
                  {area.tripCount > 0 && (
                    <span className="text-[10px] text-neutral-500">
                      {area.tripCount} trips
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-sm text-neutral-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-neutral-600 text-center">
        Deployment intel from av-map-data • Updated {new Date(fleetData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
