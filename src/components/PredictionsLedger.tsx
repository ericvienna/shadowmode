'use client';

import { Target, CalendarClock } from 'lucide-react';
import { PREDICTIONS, scoreLedger, type PredictionStatus } from '@/lib/predictions';
import { EpistemicStamp } from './EpistemicStamp';

const STATUS_STYLE: Record<PredictionStatus, { label: string; className: string }> = {
  open: { label: 'OPEN', className: 'text-yellow-400 border-yellow-500/30' },
  correct: { label: 'CORRECT', className: 'text-emerald-400 border-emerald-500/30' },
  incorrect: { label: 'INCORRECT', className: 'text-red-400 border-red-500/30' },
  void: { label: 'VOID', className: 'text-neutral-500 border-neutral-700' },
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export function PredictionsLedger() {
  const score = scoreLedger(PREDICTIONS);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-neutral-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-200">Predictions Ledger</h3>
                <EpistemicStamp tier="modeled" />
              </div>
              <p className="text-[10px] text-neutral-500">
                Calls on the record, scored in public. Never edited after posting.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-500 uppercase">Brier Score</p>
            <p className="text-lg font-bold text-neutral-200">
              {score.brier !== null ? score.brier.toFixed(3) : '—'}
            </p>
            {score.brier === null && score.nextResolutionDue && (
              <p className="text-[9px] text-neutral-600">
                first resolutions due {formatDate(score.nextResolutionDue)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calls */}
      <div className="divide-y divide-neutral-800/60">
        {PREDICTIONS.map(pred => {
          const status = STATUS_STYLE[pred.status];
          return (
            <div key={pred.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[11px] text-neutral-200 leading-snug flex-1">{pred.statement}</p>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-neutral-100">
                    {Math.round(pred.probability * 100)}%
                  </p>
                  <span className={`px-1 py-px text-[8px] font-bold tracking-wider border rounded-sm ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-neutral-600 leading-snug normal-case mb-1.5">
                Judged by: {pred.method}
              </p>
              <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-mono">
                <span>posted {formatDate(pred.madeOn)}</span>
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-2.5 h-2.5" />
                  resolves by {formatDate(pred.resolveBy)}
                </span>
                {pred.resolvedOn && <span>resolved {formatDate(pred.resolvedOn)}</span>}
              </div>
              {pred.outcomeNote && (
                <p className="text-[10px] text-neutral-400 mt-1 normal-case">{pred.outcomeNote}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-neutral-800">
        <p className="text-[9px] text-neutral-600 leading-relaxed normal-case">
          Brier score = mean squared error of stated probability vs outcome. 0 is perfect; 0.25 is
          what a coin-flipper scores. Revisions get a new entry — the original stands.{' '}
          <a href="/api/predictions" className="text-neutral-500 hover:text-neutral-300 underline">
            JSON API
          </a>
        </p>
      </div>
    </div>
  );
}
