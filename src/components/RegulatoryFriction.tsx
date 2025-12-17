'use client';

import { useMemo } from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { State } from '@/types/robotaxi';
import { getRegulatoryFrictionSummary } from '@/lib/utils';

interface RegulatoryFrictionProps {
  states: State[];
}

export function RegulatoryFriction({ states }: RegulatoryFrictionProps) {
  const friction = useMemo(() => getRegulatoryFrictionSummary(states), [states]);

  const categories = [
    {
      key: 'friendly',
      label: 'AV-Friendly',
      icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      data: friction.friendly,
      description: 'Streamlined permits, supportive legislation',
    },
    {
      key: 'mixed',
      label: 'Mixed',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      data: friction.mixed,
      description: 'Some regulatory complexity',
    },
    {
      key: 'restrictive',
      label: 'Restrictive',
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      data: friction.restrictive,
      description: 'Significant regulatory barriers',
    },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-orange-400" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-200">Regulatory Friction</h3>
            <p className="text-[10px] text-neutral-500">State-level AV policy environment</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Counts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {categories.map(cat => (
            <div
              key={cat.key}
              className={`rounded-lg border p-2 text-center ${cat.bgColor} ${cat.borderColor}`}
            >
              <div className="flex justify-center mb-1">{cat.icon}</div>
              <p className={`text-lg font-bold ${cat.color}`}>{cat.data.length}</p>
              <p className="text-[9px] text-neutral-400">{cat.label}</p>
            </div>
          ))}
        </div>

        {/* State Details */}
        <div className="space-y-4">
          {categories.map(cat => (
            cat.data.length > 0 && (
              <div key={cat.key}>
                <div className="flex items-center gap-2 mb-2">
                  {cat.icon}
                  <span className={`text-[10px] uppercase ${cat.color}`}>{cat.label}</span>
                  <span className="text-[10px] text-neutral-600">- {cat.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cat.data.map(state => (
                    <div
                      key={state.id}
                      className={`rounded px-2 py-1.5 border ${cat.bgColor} ${cat.borderColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-200">{state.abbreviation}</span>
                        <span className="text-[10px] text-neutral-400">{state.cityCount} cities</span>
                      </div>
                      {state.avgPermitDays && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          <span className="text-[9px] text-neutral-500">
                            ~{state.avgPermitDays}d avg permit
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Insight */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-[10px] text-neutral-300 leading-relaxed">
              <span className="font-semibold text-orange-400">Key insight:</span> Tesla isn&apos;t necessarily slow
              - regulatory environments vary significantly. TX, AZ, and NV have ~8-85 day permit timelines vs
              CA at ~180 days and NY at 365+.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
