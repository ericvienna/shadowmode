'use client';

import { useMemo } from 'react';
import { Lock, Shield, Building2, Landmark, Cog } from 'lucide-react';
import type { State } from '@/types/robotaxi';

interface IrreversibilityIndexProps {
  states: State[];
}

type CommitmentLevel = 'Building' | 'Locked' | 'Inevitable';
type ReversalCost = 'Low' | 'Medium' | 'High' | 'Prohibitive';

interface CommitmentItem {
  category: string;
  icon: React.ReactNode;
  status: 'none' | 'partial' | 'committed';
  evidence: string;
}

export function IrreversibilityIndex({ states }: IrreversibilityIndexProps) {
  const commitments = useMemo(() => {
    // Calculate commitment signals from data
    const hasDrivelessCity = states.some(s =>
      s.cities.some(c => c.milestones.no_safety_monitor.status === 'completed')
    );

    const hasInsuranceInMultipleStates = states.filter(s =>
      s.cities.some(c => c.milestones.tesla_insurance_available.status === 'completed')
    ).length >= 3;

    const hasPublicPrograms = states.some(s =>
      s.cities.some(c => c.milestones.public_test_program_launched.status === 'completed')
    );

    const hasRegulatoryFramework = states.some(s =>
      s.cities.some(c => c.milestones.final_regulatory_approval.status === 'completed')
    );

    const items: CommitmentItem[] = [
      {
        category: 'Regulatory',
        icon: <Landmark className="w-3.5 h-3.5" />,
        status: hasRegulatoryFramework ? 'committed' : hasDrivelessCity ? 'partial' : 'none',
        evidence: hasRegulatoryFramework
          ? 'TX S.B. 2807 framework active'
          : hasDrivelessCity
            ? 'Driverless permit issued'
            : 'Review stage only',
      },
      {
        category: 'Insurance',
        icon: <Shield className="w-3.5 h-3.5" />,
        status: hasInsuranceInMultipleStates ? 'committed' : 'partial',
        evidence: hasInsuranceInMultipleStates
          ? 'Multi-state underwriting live'
          : 'Limited state coverage',
      },
      {
        category: 'Corporate',
        icon: <Building2 className="w-3.5 h-3.5" />,
        status: hasDrivelessCity ? 'committed' : hasPublicPrograms ? 'partial' : 'none',
        evidence: hasDrivelessCity
          ? 'Fleet CapEx deployed'
          : hasPublicPrograms
            ? 'Pilot investment made'
            : 'R&D phase',
      },
      {
        category: 'Operational',
        icon: <Cog className="w-3.5 h-3.5" />,
        status: hasDrivelessCity ? 'committed' : 'partial',
        evidence: hasDrivelessCity
          ? 'Driverless ops running'
          : 'Safety driver dependency',
      },
    ];

    // Calculate overall commitment level
    const committedCount = items.filter(i => i.status === 'committed').length;
    let level: CommitmentLevel = 'Building';
    if (committedCount >= 3) level = 'Inevitable';
    else if (committedCount >= 1) level = 'Locked';

    // Calculate reversal cost
    let reversalCost: ReversalCost = 'Low';
    if (hasDrivelessCity && hasInsuranceInMultipleStates) {
      reversalCost = 'Prohibitive';
    } else if (hasDrivelessCity) {
      reversalCost = 'High';
    } else if (hasPublicPrograms) {
      reversalCost = 'Medium';
    }

    return { items, level, reversalCost, hasDrivelessCity };
  }, [states]);

  const levelConfig = {
    Building: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    Locked: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    Inevitable: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  };

  const reversalConfig = {
    Low: { color: 'text-neutral-500', label: 'LOW' },
    Medium: { color: 'text-yellow-400', label: 'MEDIUM' },
    High: { color: 'text-orange-400', label: 'HIGH' },
    Prohibitive: { color: 'text-red-400', label: 'PROHIBITIVE' },
  };

  const statusConfig = {
    none: { color: 'text-neutral-600', symbol: '○' },
    partial: { color: 'text-yellow-400', symbol: '◐' },
    committed: { color: 'text-green-400', symbol: '●' },
  };

  const config = levelConfig[commitments.level];
  const reversal = reversalConfig[commitments.reversalCost];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-neutral-200">Irreversibility</h3>
          </div>
          <div className={`px-2 py-1 rounded border ${config.bg}`}>
            <span className={`text-xs font-bold ${config.color}`}>{commitments.level}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* The Question */}
        <p className="text-[10px] text-neutral-500 italic mb-4 text-center">
          Who has made a decision they can&apos;t walk back?
        </p>

        {/* Commitment Ledger */}
        <div className="space-y-2.5 mb-4">
          {commitments.items.map((item) => {
            const status = statusConfig[item.status];
            return (
              <div key={item.category} className="flex items-center gap-2">
                <span className={`${status.color} text-sm`}>{status.symbol}</span>
                <span className="text-neutral-500">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-300 font-medium uppercase">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-600 truncate">{item.evidence}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reversal Cost */}
        <div className="border-t border-neutral-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-neutral-500 uppercase">Reversal Cost</span>
            <span className={`text-sm font-bold ${reversal.color}`}>{reversal.label}</span>
          </div>
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                commitments.reversalCost === 'Prohibitive'
                  ? 'bg-red-500 w-full'
                  : commitments.reversalCost === 'High'
                    ? 'bg-orange-500 w-3/4'
                    : commitments.reversalCost === 'Medium'
                      ? 'bg-yellow-500 w-1/2'
                      : 'bg-neutral-600 w-1/4'
              }`}
            />
          </div>
        </div>

        {/* Last Commitment */}
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase">Last Commitment</span>
            <span className="text-[10px] text-neutral-400">Dec 14, 2024</span>
          </div>
          <p className="text-[10px] text-green-400 mt-1">
            Tesla • Austin driverless ops
          </p>
        </div>

        {/* Bottom Line */}
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <p className="text-[9px] text-neutral-600 italic text-center">
            {commitments.reversalCost === 'Prohibitive'
              ? 'Capital deployed. Narrative is over. Expansion is timing.'
              : commitments.reversalCost === 'High'
                ? 'Significant sunk costs. Reversal politically difficult.'
                : 'Still in pilot phase. Commitments remain reversible.'}
          </p>
        </div>
      </div>
    </div>
  );
}
