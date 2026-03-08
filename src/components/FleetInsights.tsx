'use client';

import { useEffect, useState } from 'react';
import { Car, MapPin, Route, Activity, Loader2 } from 'lucide-react';

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
          Live Fleet Tracking
        </h2>
        <a
          href="https://www.teslarobotaxitracker.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-500 hover:text-neutral-400 transition-colors"
        >
          via teslarobotaxitracker.com
        </a>
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
            Vehicles tracked
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
            Completed rides
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
            Total distance
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
        Data from community tracking • Updated {new Date(fleetData.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}
