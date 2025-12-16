'use client';

import { useEffect, useState } from 'react';
import type { City, State } from '@/types/robotaxi';
import { MILESTONE_DEFINITIONS } from '@/types/robotaxi';
import { getCityProgress, formatDate, getStatusColor, getCitySparklineData } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { X, MapPin, Check, Clock, HelpCircle, Minus, Circle, ExternalLink } from 'lucide-react';

interface CityModalProps {
  city: City | null;
  state: State | null;
  onClose: () => void;
}

export function CityModal({ city, state, onClose }: CityModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (city) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [city]);

  if (!city || !state) return null;

  const progress = getCityProgress(city);
  const hasDriverless = city.milestones.no_safety_monitor.status === 'completed';
  const sparklineData = getCitySparklineData(city);

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'unknown':
        return <HelpCircle className="w-4 h-4 text-neutral-500" />;
      case 'n/a':
        return <Minus className="w-4 h-4 text-neutral-600" />;
      default:
        return <Circle className="w-3 h-3 text-neutral-700" />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-neutral-950 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-transform duration-200 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b border-neutral-800 ${hasDriverless ? 'bg-green-500/10' : ''}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white">{city.name}</h2>
                <span className="text-neutral-500 text-sm">{state.abbreviation}</span>
                {hasDriverless && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded border border-green-500/30">
                    DRIVERLESS
                  </span>
                )}
              </div>
              <p className="text-neutral-400 text-sm">{state.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-400 text-xs uppercase">Overall Progress</span>
            <div className="flex items-center gap-3">
              <Sparkline data={sparklineData} width={80} height={24} />
              <span className={`text-lg font-bold ${
                progress >= 75 ? 'text-green-400' :
                progress >= 40 ? 'text-yellow-400' : 'text-neutral-400'
              }`}>
                {progress}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full animate-progress ${
                progress >= 75 ? 'bg-green-500' :
                progress >= 40 ? 'bg-yellow-500' : 'bg-neutral-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Milestones List */}
        <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
          <h3 className="text-neutral-400 text-xs uppercase mb-3">Milestones</h3>
          <div className="space-y-2">
            {MILESTONE_DEFINITIONS.map(def => {
              const milestone = city.milestones[def.type];
              return (
                <div
                  key={def.type}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    milestone.status === 'completed'
                      ? 'bg-green-500/5 border-green-500/20'
                      : milestone.status === 'in_progress'
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-neutral-900/50 border-neutral-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getIcon(milestone.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{def.label}</span>
                    </div>
                    <p className="text-neutral-500 text-[10px]">{def.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(milestone.status)}`}>
                      {milestone.status.replace('_', ' ')}
                    </span>
                    {milestone.date && (
                      <p className="text-neutral-400 text-[10px] mt-1">{formatDate(milestone.date)}</p>
                    )}
                    {milestone.value && (
                      <p className="text-neutral-300 text-[10px] mt-1">{milestone.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-neutral-500 text-[10px]">
            {Object.values(city.milestones).filter(m => m.status === 'completed').length} of {MILESTONE_DEFINITIONS.length} milestones completed
          </span>
          <a
            href={`https://www.google.com/search?q=tesla+robotaxi+${city.name}+${state.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors"
          >
            Search news
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
