'use client';

import { useMemo } from 'react';
import { Activity, Target, Zap, Briefcase, Gauge } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { calculateVelocityMetrics } from '@/lib/utils';

interface NarrativePressureProps {
  states: State[];
}

export function NarrativePressure({ states }: NarrativePressureProps) {
  // Calculate velocity for market implications
  const velocity = useMemo(() => calculateVelocityMetrics(states), [states]);

  // Market implications based on velocity
  const marketImplications = useMemo(() => {
    const implications: string[] = [];

    if (velocity.overallTrend === 'accelerating') {
      implications.push('Execution velocity supports bull thesis on robotaxi timeline.');
      implications.push('Multiple proof points within single quarter strengthens narrative.');
      implications.push('Watch for competitor responses to accelerating Tesla rollout.');
    } else if (velocity.overallTrend === 'slowing') {
      implications.push('Slowing velocity may test investor patience on robotaxi timeline.');
      implications.push('Market may discount future robotaxi announcements until execution resumes.');
      implications.push('Consider regulatory or operational bottlenecks as potential causes.');
    } else {
      implications.push('Steady deployment pace maintains current market expectations.');
      implications.push('Next major catalyst likely to come from geographic expansion or driverless milestone.');
      implications.push('Regulatory approvals remain key unlock for acceleration.');
    }

    return implications;
  }, [velocity]);

  // Narrative drift calculation
  const narrativeDrift = useMemo(() => {
    // Count execution milestones vs announcements
    let executionPoints = 0;

    states.forEach(state => {
      state.cities.forEach(city => {
        if (city.milestones.no_safety_monitor.status === 'completed') executionPoints += 3;
        if (city.milestones.public_test_program_launched.status === 'completed') executionPoints += 2;
        if (city.milestones.geofence_expanded.status === 'completed') executionPoints += 1;
        if (city.milestones.vehicles_deployed_20_plus.value) executionPoints += 1;
      });
    });

    // Scale to 0-100 (execution-led = 100, story-led = 0)
    const position = Math.min(100, Math.max(0, executionPoints * 5));

    let label = '';
    let color = '';

    if (position >= 70) {
      label = 'Execution-Led';
      color = 'text-green-400';
    } else if (position >= 40) {
      label = 'Balanced';
      color = 'text-yellow-400';
    } else {
      label = 'Story-Led';
      color = 'text-red-400';
    }

    return { position, label, color };
  }, [states]);

  // Dynamic catalysts based on actual data
  const catalysts = useMemo(() => {
    const items: { text: string; status: 'achieved' | 'pending' }[] = [];

    // Check for driverless milestone
    const hasDrivelessCity = states.some(s =>
      s.cities.some(c => c.milestones.no_safety_monitor.status === 'completed')
    );

    if (hasDrivelessCity) {
      items.push({ text: 'First city achieves fully driverless operation', status: 'achieved' });
    }

    // Check for public test programs
    const publicTestCount = states.reduce((sum, s) =>
      sum + s.cities.filter(c => c.milestones.public_test_program_launched.status === 'completed').length, 0
    );

    if (publicTestCount >= 3) {
      items.push({ text: '3+ cities with public test programs', status: 'achieved' });
    } else {
      items.push({ text: '3+ cities with public test programs', status: 'pending' });
    }

    // Always pending future catalysts
    items.push({ text: 'Second market achieves driverless status', status: 'pending' });

    return items;
  }, [states]);

  // Narrative Pressure Index calculations
  const narrativePressure = useMemo(() => {
    // Proof Velocity: milestones achieved in last 90 days
    let recentMilestones = 0;
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    states.forEach(state => {
      state.cities.forEach(city => {
        Object.values(city.milestones).forEach(milestone => {
          if (milestone.date && milestone.status === 'completed') {
            const milestoneDate = new Date(milestone.date);
            if (milestoneDate >= ninetyDaysAgo) {
              recentMilestones++;
            }
          }
        });
      });
    });

    // Normalize to monthly rate
    const proofVelocity = Math.round(recentMilestones / 3 * 10) / 10;

    // Narrative Half-Life: based on time since last major catalyst
    let lastCatalystTime = 0;
    states.forEach(state => {
      state.cities.forEach(city => {
        if (city.milestones.no_safety_monitor.date) {
          const time = new Date(city.milestones.no_safety_monitor.date).getTime();
          if (time > lastCatalystTime) {
            lastCatalystTime = time;
          }
        }
        if (city.milestones.public_test_program_launched.date) {
          const time = new Date(city.milestones.public_test_program_launched.date).getTime();
          if (time > lastCatalystTime) {
            lastCatalystTime = time;
          }
        }
      });
    });

    const daysSinceCatalyst = lastCatalystTime > 0
      ? Math.floor((new Date().getTime() - lastCatalystTime) / (1000 * 60 * 60 * 24))
      : 999;

    let halfLifeLabel = '';
    let halfLifeColor = '';
    if (daysSinceCatalyst <= 14) {
      halfLifeLabel = 'Fresh';
      halfLifeColor = 'text-green-400';
    } else if (daysSinceCatalyst <= 45) {
      halfLifeLabel = 'Active';
      halfLifeColor = 'text-blue-400';
    } else if (daysSinceCatalyst <= 90) {
      halfLifeLabel = 'Fading';
      halfLifeColor = 'text-yellow-400';
    } else {
      halfLifeLabel = 'Stale';
      halfLifeColor = 'text-red-400';
    }

    // Regulatory Surface Area: exposure to regulatory risk
    const citiesInRestrictiveStates = states.filter(s =>
      ['California', 'New York'].includes(s.name)
    ).reduce((sum, s) => sum + s.cities.length, 0);

    const totalCities = states.reduce((sum, s) => sum + s.cities.length, 0);
    const regulatoryExposure = totalCities > 0 ? Math.round((citiesInRestrictiveStates / totalCities) * 100) : 0;

    let regLabel = '';
    let regColor = '';
    if (regulatoryExposure <= 20) {
      regLabel = 'Low';
      regColor = 'text-green-400';
    } else if (regulatoryExposure <= 40) {
      regLabel = 'Moderate';
      regColor = 'text-yellow-400';
    } else {
      regLabel = 'High';
      regColor = 'text-orange-400';
    }

    // Overall pressure score (0-100, higher = more pressure to deliver)
    let pressureScore = 50;

    // Low proof velocity increases pressure
    if (proofVelocity < 2) pressureScore += 15;
    else if (proofVelocity > 4) pressureScore -= 15;

    // Stale narrative increases pressure
    if (daysSinceCatalyst > 90) pressureScore += 20;
    else if (daysSinceCatalyst < 30) pressureScore -= 20;

    // High regulatory exposure increases pressure
    if (regulatoryExposure > 40) pressureScore += 10;

    pressureScore = Math.min(100, Math.max(0, pressureScore));

    let pressureLabel = '';
    let pressureColor = '';
    if (pressureScore <= 30) {
      pressureLabel = 'Low';
      pressureColor = 'text-green-400';
    } else if (pressureScore <= 60) {
      pressureLabel = 'Moderate';
      pressureColor = 'text-yellow-400';
    } else {
      pressureLabel = 'High';
      pressureColor = 'text-orange-400';
    }

    return {
      proofVelocity,
      halfLifeLabel,
      halfLifeColor,
      daysSinceCatalyst,
      regulatoryExposure,
      regLabel,
      regColor,
      pressureScore,
      pressureLabel,
      pressureColor,
    };
  }, [states]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Narrative Pressure Index</h3>
            <p className="text-[10px] text-neutral-500">Market patience & execution momentum</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500 uppercase">Pressure</p>
          <p className={`text-lg font-bold ${narrativePressure.pressureColor}`}>
            {narrativePressure.pressureLabel}
          </p>
        </div>
      </div>

      <div className="p-4">
        {/* Narrative Pressure Index - Leading Indicator */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Proof Velocity */}
          <div className="bg-neutral-800/50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-neutral-500 uppercase mb-1">Proof Velocity</p>
            <p className="text-lg font-bold text-blue-400">{narrativePressure.proofVelocity}</p>
            <p className="text-[8px] text-neutral-600">milestones/mo</p>
          </div>

          {/* Narrative Half-Life */}
          <div className="bg-neutral-800/50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-neutral-500 uppercase mb-1">Half-Life</p>
            <p className={`text-lg font-bold ${narrativePressure.halfLifeColor}`}>
              {narrativePressure.halfLifeLabel}
            </p>
            <p className="text-[8px] text-neutral-600">{narrativePressure.daysSinceCatalyst}d since catalyst</p>
          </div>

          {/* Regulatory Surface Area */}
          <div className="bg-neutral-800/50 rounded-lg p-2.5 text-center">
            <p className="text-[9px] text-neutral-500 uppercase mb-1">Reg Exposure</p>
            <p className={`text-lg font-bold ${narrativePressure.regColor}`}>
              {narrativePressure.regLabel}
            </p>
            <p className="text-[8px] text-neutral-600">{narrativePressure.regulatoryExposure}% restrictive</p>
          </div>
        </div>

        {/* Narrative Drift Monitor */}
        <div className="mb-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3 h-3 text-cyan-400" />
            <p className="text-[10px] text-cyan-400 uppercase font-medium">Narrative Drift</p>
          </div>
          <div className="relative">
            <div className="h-2 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full" />
            <div
              className="absolute top-0 w-3 h-2 bg-white rounded-full shadow-lg transition-all"
              style={{ left: `calc(${narrativeDrift.position}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[8px] text-neutral-600">Story-led</span>
            <span className="text-[8px] text-neutral-600">Mixed</span>
            <span className="text-[8px] text-neutral-600">Execution-led</span>
          </div>
          <p className={`text-[10px] mt-2 text-center font-medium ${narrativeDrift.color}`}>
            {narrativeDrift.label}
          </p>
        </div>

        {/* What Changes the Stock */}
        <div className="mb-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3 h-3 text-orange-400" />
            <p className="text-[10px] text-orange-400 uppercase font-medium">What Changes the Stock</p>
          </div>
          <ul className="space-y-1.5">
            {catalysts.map((catalyst, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`text-[10px] mt-0.5 ${catalyst.status === 'achieved' ? 'text-green-400' : 'text-neutral-600'}`}>
                  {catalyst.status === 'achieved' ? '✓' : '○'}
                </span>
                <span className={`text-[10px] leading-relaxed ${catalyst.status === 'achieved' ? 'text-green-400' : 'text-neutral-400'}`}>
                  {catalyst.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Last Catalyst Impact */}
        <div className="mb-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <p className="text-[10px] text-yellow-400 uppercase font-medium">Last Catalyst Impact</p>
          </div>
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-neutral-400">Austin Driverless Announced</span>
              <span className="text-[10px] text-neutral-500">Dec 14, 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">TSLA Response</span>
              <span className="text-xs font-bold text-green-400">+8% next session</span>
            </div>
            <p className="text-[8px] text-neutral-600 mt-2 italic">
              Execution milestones move the stock. Promises don&apos;t.
            </p>
          </div>
        </div>

        {/* Market Read */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-3 h-3 text-purple-400" />
            <p className="text-[10px] text-purple-400 uppercase font-medium">Market Read</p>
          </div>
          <ul className="space-y-1.5">
            {marketImplications.map((implication, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-neutral-600 text-[10px] mt-0.5">•</span>
                <span className="text-[10px] text-neutral-400 leading-relaxed">{implication}</span>
              </li>
            ))}
          </ul>
          <p className="text-[8px] text-neutral-600 mt-2 italic">
            Derived from deployment data. Not investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
