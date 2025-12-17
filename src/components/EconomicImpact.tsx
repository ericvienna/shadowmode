'use client';

import { useMemo, useState } from 'react';
import { DollarSign, Car, TrendingUp, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import type { State, EconomicImpact as EconomicImpactType } from '@/types/robotaxi';
import { calculateCityEconomicImpact, calculateNationalEconomicSummary } from '@/lib/utils';

interface EconomicImpactProps {
  states: State[];
}

interface CityMetric extends EconomicImpactType {
  avgAnnualRevenue: number;
  avgRidesPerDay: number;
}

export function EconomicImpact({ states }: EconomicImpactProps) {
  const [showAllCities, setShowAllCities] = useState(false);

  const national = useMemo(() => calculateNationalEconomicSummary(states), [states]);

  const cityMetrics = useMemo(() => {
    const metrics: CityMetric[] = [];

    states.forEach(state => {
      state.cities.forEach(city => {
        const impact = calculateCityEconomicImpact(city, state.abbreviation);
        if (impact && impact.estimatedFleetSize > 0) {
          metrics.push({
            ...impact,
            avgAnnualRevenue: (impact.estimatedAnnualRevenue.low + impact.estimatedAnnualRevenue.high) / 2,
            avgRidesPerDay: (impact.estimatedRidesPerDay.low + impact.estimatedRidesPerDay.high) / 2,
          });
        }
      });
    });

    return metrics.sort((a, b) => b.avgAnnualRevenue - a.avgAnnualRevenue);
  }, [states]);

  // Calculate derived national metrics
  const nationalMetrics = useMemo(() => {
    const totalRidesPerDay = cityMetrics.reduce((sum, c) => sum + c.avgRidesPerDay, 0);
    const totalAnnualRevenue = (national.totalAnnualTAM.low + national.totalAnnualTAM.high) / 2;
    const currentRevenue = (national.activeMarketRevenue.low + national.activeMarketRevenue.high) / 2;
    const avgRevenuePerVehicle = national.totalEstimatedFleet > 0
      ? totalAnnualRevenue / national.totalEstimatedFleet
      : 0;

    return {
      totalFleetSize: national.totalEstimatedFleet,
      totalRidesPerDay,
      totalAnnualizedTAM: totalAnnualRevenue,
      currentAnnualizedRevenue: currentRevenue,
      avgRevenuePerVehicle,
      citiesWithOperations: cityMetrics.length,
    };
  }, [national, cityMetrics]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toString();
  };

  const displayedCities = showAllCities ? cityMetrics : cityMetrics.slice(0, 5);

  const confidenceColors = {
    high: 'text-green-400',
    medium: 'text-yellow-400',
    low: 'text-neutral-500',
  };

  const penetrationRate = nationalMetrics.totalAnnualizedTAM > 0
    ? (nationalMetrics.currentAnnualizedRevenue / nationalMetrics.totalAnnualizedTAM) * 100
    : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Economic Impact</h3>
              <p className="text-[10px] text-neutral-500">Revenue potential & TAM analysis</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-500 uppercase">Annualized TAM</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(nationalMetrics.totalAnnualizedTAM)}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* National Summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
            <Car className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-neutral-200">{formatNumber(nationalMetrics.totalFleetSize)}</p>
            <p className="text-[9px] text-neutral-500">Total Fleet</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
            <TrendingUp className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-neutral-200">{formatNumber(nationalMetrics.totalRidesPerDay)}</p>
            <p className="text-[9px] text-neutral-500">Daily Rides</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-neutral-200">{formatCurrency(nationalMetrics.avgRevenuePerVehicle)}</p>
            <p className="text-[9px] text-neutral-500">Rev/Vehicle</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
            <Building2 className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-neutral-200">{nationalMetrics.citiesWithOperations}</p>
            <p className="text-[9px] text-neutral-500">Active Cities</p>
          </div>
        </div>

        {/* TAM Breakdown */}
        <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-400 uppercase">Current SAM vs TAM</span>
            <span className="text-[10px] text-green-400">
              {penetrationRate.toFixed(1)}% penetration
            </span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              style={{ width: `${Math.min(penetrationRate, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-[9px] text-neutral-500">Current (Active Markets)</p>
              <p className="text-xs font-semibold text-green-400">{formatCurrency(nationalMetrics.currentAnnualizedRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-neutral-500">Total Addressable</p>
              <p className="text-xs font-semibold text-neutral-300">{formatCurrency(nationalMetrics.totalAnnualizedTAM)}</p>
            </div>
          </div>
        </div>

        {/* City Breakdown */}
        <div>
          <p className="text-[10px] text-neutral-500 uppercase mb-2">Revenue by City</p>
          <div className="space-y-2">
            {displayedCities.map((city, idx) => {
              const revenuePerVehicle = city.estimatedFleetSize > 0
                ? city.avgAnnualRevenue / city.estimatedFleetSize
                : 0;
              return (
                <div key={city.cityId} className="bg-neutral-800/30 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-600 w-4">{idx + 1}</span>
                      <span className="text-xs text-neutral-200">{city.cityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] ${confidenceColors[city.confidenceLevel]}`}>
                        {city.confidenceLevel}
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        {formatCurrency(city.avgAnnualRevenue)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[9px] text-neutral-500">
                    <span>Fleet: {city.estimatedFleetSize}</span>
                    <span>Rides/day: {Math.round(city.avgRidesPerDay)}</span>
                    <span>Rev/vehicle: {formatCurrency(revenuePerVehicle)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {cityMetrics.length > 5 && (
            <button
              onClick={() => setShowAllCities(!showAllCities)}
              className="w-full mt-3 py-2 text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center justify-center gap-1 transition-colors"
            >
              {showAllCities ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show All {cityMetrics.length} Cities
                </>
              )}
            </button>
          )}
        </div>

        {/* Methodology Note */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <p className="text-[9px] text-neutral-600 leading-relaxed">
            Estimates based on: Fleet size from public reports/filings, avg rides/vehicle/day from industry benchmarks
            (~8-15 rides for active fleets), avg fare $15-25 per ride. TAM includes cities with any robotaxi activity.
          </p>
        </div>
      </div>
    </div>
  );
}
