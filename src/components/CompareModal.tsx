'use client';

import { useState, useMemo } from 'react';
import type { State, City } from '@/types/robotaxi';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';
import { getCityProgress, getStatusColor, getCitySparklineData } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { X, Plus, Check, Clock, Minus, Circle, HelpCircle, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  states: State[];
  isOpen: boolean;
  onClose: () => void;
}

export function CompareModal({ states, isOpen, onClose }: CompareModalProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showSelector, setShowSelector] = useState(false);

  const allCities = useMemo(() => {
    const cities: Array<{ city: City; state: State }> = [];
    states.forEach(state => {
      state.cities.forEach(city => {
        cities.push({ city, state });
      });
    });
    return cities.sort((a, b) => getCityProgress(b.city) - getCityProgress(a.city));
  }, [states]);

  const selectedCityData = useMemo(() => {
    return selectedCities.map(id => {
      const found = allCities.find(c => c.city.id === id);
      return found;
    }).filter(Boolean) as Array<{ city: City; state: State }>;
  }, [selectedCities, allCities]);

  const addCity = (cityId: string) => {
    if (selectedCities.length < 3 && !selectedCities.includes(cityId)) {
      setSelectedCities([...selectedCities, cityId]);
    }
    setShowSelector(false);
  };

  const removeCity = (cityId: string) => {
    setSelectedCities(selectedCities.filter(id => id !== cityId));
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'unknown':
        return <HelpCircle className="w-3 h-3 text-neutral-500" />;
      case 'n/a':
        return <Minus className="w-3 h-3 text-neutral-600" />;
      default:
        return <Circle className="w-2 h-2 text-neutral-700" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative bg-neutral-950 border border-neutral-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Compare Cities</h2>
            <p className="text-neutral-500 text-[10px]">Select up to 3 cities to compare</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* City Selectors */}
        <div className="px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            {selectedCityData.map(({ city, state }) => (
              <div
                key={city.id}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <span className="text-white text-xs">{city.name}, {state.abbreviation}</span>
                <button
                  onClick={() => removeCity(city.id)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {selectedCities.length < 3 && (
              <div className="relative">
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-600 rounded-lg transition-colors text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add City
                </button>

                {showSelector && (
                  <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 max-h-[300px] overflow-y-auto min-w-[200px]">
                    {allCities
                      .filter(({ city }) => !selectedCities.includes(city.id))
                      .map(({ city, state }) => (
                        <button
                          key={city.id}
                          onClick={() => addCity(city.id)}
                          className="w-full px-3 py-2 text-left hover:bg-neutral-800 transition-colors flex items-center justify-between"
                        >
                          <span className="text-neutral-300 text-xs">{city.name}, {state.abbreviation}</span>
                          <span className="text-neutral-500 text-[10px]">{getCityProgress(city)}%</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedCityData.length > 0 ? (
          <div className="px-6 py-4 max-h-[500px] overflow-y-auto">
            {/* Progress Row */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `200px repeat(${selectedCityData.length}, 1fr)` }}>
              <div className="text-neutral-500 text-[10px] uppercase">Progress</div>
              {selectedCityData.map(({ city }) => {
                const progress = getCityProgress(city);
                return (
                  <div key={city.id} className="flex items-center gap-2">
                    <Sparkline data={getCitySparklineData(city)} width={60} height={20} />
                    <span className={`text-sm font-bold ${
                      progress >= 75 ? 'text-green-400' : progress >= 40 ? 'text-yellow-400' : 'text-neutral-400'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Milestones Comparison */}
            {MILESTONE_DEFINITIONS.map(def => (
              <div
                key={def.type}
                className="grid gap-4 py-2 border-b border-neutral-800/50"
                style={{ gridTemplateColumns: `200px repeat(${selectedCityData.length}, 1fr)` }}
              >
                <div>
                  <span className="text-neutral-300 text-xs">{def.shortLabel}</span>
                </div>
                {selectedCityData.map(({ city }) => {
                  const milestone = city.milestones[def.type];
                  return (
                    <div key={city.id} className="flex items-center gap-2">
                      {getIcon(milestone.status)}
                      <span className={`text-[10px] ${
                        milestone.status === 'completed' ? 'text-green-400' :
                        milestone.status === 'in_progress' ? 'text-yellow-400' : 'text-neutral-500'
                      }`}>
                        {milestone.date || milestone.value || milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-neutral-500 text-sm">
            Select cities to compare their progress
          </div>
        )}
      </div>
    </div>
  );
}
