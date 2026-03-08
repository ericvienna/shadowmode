'use client';

import { useState } from 'react';
import { ShieldCheck, FileCheck, Shield, Building2, Users, AlertTriangle, ChevronRight } from 'lucide-react';
import type { PublicTrustData } from '@/lib/trustScore';
import { statusConfig, confidenceConfig } from '@/lib/trustScore';
import { TrustEvidenceDrawer } from './TrustEvidenceDrawer';

interface PublicTrustSignalCardProps {
  data: PublicTrustData;
}

const metricIcons = {
  permit: FileCheck,
  insurance: Shield,
  regulator: ShieldCheck,
  media: Building2,
  third_party: Users,
  government: Building2,
};

export function PublicTrustSignalCard({ data }: PublicTrustSignalCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const status = statusConfig[data.status];
  const confidence = confidenceConfig[data.confidence];

  // Get top 4 metrics for display
  const displayMetrics = data.metrics.slice(0, 4);

  return (
    <>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">Public Trust Signal</h3>
                <p className="text-[10px] text-neutral-500">External validation & legitimacy</p>
              </div>
            </div>
            {/* Score Badge */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-neutral-500 uppercase">Trust Score</p>
                <p className={`text-lg font-bold ${status.color}`}>{data.overallScore}</p>
              </div>
              <div className={`px-2 py-1 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                <span className={`text-[10px] font-semibold ${status.color}`}>{status.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {displayMetrics.map((metric) => {
              const Icon = metricIcons[metric.icon];
              return (
                <div
                  key={metric.id}
                  className="bg-neutral-800/50 rounded-lg p-2.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[9px] text-neutral-500 uppercase truncate">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-neutral-200">{metric.value}</span>
                    {metric.subLabel && (
                      <span className="text-[9px] text-neutral-500 truncate">{metric.subLabel}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Negatives Line */}
          {data.negatives.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-[10px] text-red-300">
                  {data.negatives.map(n => n.label).join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Insight Line */}
          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              {data.insight}
            </p>
          </div>

          {/* Data Confidence */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-neutral-500 uppercase">Data Confidence</p>
              <span className={`text-[10px] font-semibold ${confidence.color}`}>{confidence.label}</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className={`h-full ${confidence.bgColor} rounded-full ${confidence.width}`} />
            </div>
          </div>

          {/* View Evidence Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-[10px] text-neutral-400 hover:text-white transition-colors"
          >
            View Evidence & Score Breakdown
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Methodology Note */}
          <div className="mt-3 pt-3 border-t border-neutral-800">
            <p className="text-[9px] text-neutral-600 leading-relaxed">
              Measures &quot;permission to scale&quot; via external validation (permits, insurance, audits) — not Tesla claims.
              Updated: {data.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Drawer */}
      <TrustEvidenceDrawer
        data={data}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
