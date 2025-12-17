'use client';

import { X, ExternalLink, FileCheck, Shield, Building2, Newspaper, Users, Scale } from 'lucide-react';
import type { PublicTrustData, ScoreBreakdown, TrustSource } from '@/lib/trustScore';
import { statusConfig, confidenceConfig, calculateScoreBreakdown } from '@/lib/trustScore';

interface TrustEvidenceDrawerProps {
  data: PublicTrustData;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap = {
  permit: FileCheck,
  insurance: Shield,
  regulator: Scale,
  media: Newspaper,
  third_party: Users,
  government: Building2,
};

const sourceTypeColors = {
  official: 'bg-blue-500/20 text-blue-400',
  regulatory: 'bg-purple-500/20 text-purple-400',
  media: 'bg-emerald-500/20 text-emerald-400',
  third_party: 'bg-cyan-500/20 text-cyan-400',
};

export function TrustEvidenceDrawer({ data, isOpen, onClose }: TrustEvidenceDrawerProps) {
  if (!isOpen) return null;

  const status = statusConfig[data.status];
  const confidence = confidenceConfig[data.confidence];
  const breakdown = calculateScoreBreakdown(data.metrics);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-neutral-950 border-l border-neutral-800 z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Public Trust Evidence</h2>
            <p className="text-[10px] text-neutral-500">Score breakdown & source verification</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Overall Score */}
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-neutral-700 mb-3">
              <span className={`text-3xl font-bold ${status.color}`}>{data.overallScore}</span>
            </div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${status.bgColor} ${status.borderColor}`}>
              <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              Based on {data.metrics.length} external validation factors
            </p>
          </div>

          {/* Score Breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase mb-3">Score Breakdown</h3>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.category} className="bg-neutral-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-200">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500">{item.weight}% weight</span>
                      <span className="text-xs font-semibold text-neutral-200">{item.rawScore}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.rawScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Negatives Impact */}
          {data.negatives.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-300 uppercase mb-3">Deductions</h3>
              <div className="space-y-2">
                {data.negatives.map((neg) => (
                  <div key={neg.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-300">{neg.label}</span>
                      <span className="text-[10px] text-red-400">
                        -{neg.severity === 'significant' ? '10' : neg.severity === 'moderate' ? '5' : '2'} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1">{neg.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources by Metric */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase mb-3">Evidence Sources</h3>
            <div className="space-y-4">
              {data.metrics.map((metric) => {
                const Icon = iconMap[metric.icon];
                return (
                  <div key={metric.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-200">{metric.label}</span>
                    </div>
                    <div className="space-y-2 ml-6">
                      {metric.sources.map((source, idx) => (
                        <SourceCard key={idx} source={source} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidence Explanation */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase mb-3">Data Confidence</h3>
            <div className="bg-neutral-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">Confidence Level</span>
                <span className={`text-xs font-semibold ${confidence.color}`}>{confidence.label}</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${confidence.bgColor} rounded-full ${confidence.width}`} />
              </div>
              <p className="text-[10px] text-neutral-500">
                {data.confidence === 'HIGH' && 'Multiple verified official sources with recent dates.'}
                {data.confidence === 'MEDIUM' && 'Mix of official and media sources. Some data points estimated.'}
                {data.confidence === 'LOW' && 'Limited official sources. Most data from media reports or estimates.'}
              </p>
            </div>
          </div>

          {/* Methodology Note */}
          <div className="pt-4 border-t border-neutral-800">
            <p className="text-[9px] text-neutral-600 leading-relaxed">
              <span className="font-semibold text-neutral-500">Methodology:</span> Score weights regulatory permits (30%),
              third-party validation (25%), public operations track record (25%), and insurance coverage (20%).
              Deductions applied for active investigations or pending approvals. This score measures
              &quot;permission to scale&quot; not safety claims.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function SourceCard({ source }: { source: TrustSource }) {
  return (
    <div className="bg-neutral-800/50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${sourceTypeColors[source.type]}`}>
            {source.type}
          </span>
          <span className="text-[10px] text-neutral-300">{source.name}</span>
        </div>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-neutral-700 rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>
        )}
      </div>
      {source.snippet && (
        <p className="text-[9px] text-neutral-500 line-clamp-2">{source.snippet}</p>
      )}
      <p className="text-[9px] text-neutral-600 mt-1">{source.date}</p>
    </div>
  );
}
