'use client';

import { useState } from 'react';
import { GitCommit, ExternalLink, Rss, ChevronDown, ChevronUp } from 'lucide-react';
import { CHANGELOG, formatChangeDate, type ChangeKind } from '@/lib/changelog';
import { EpistemicStamp } from './EpistemicStamp';

const KIND_STYLE: Record<ChangeKind, { label: string; className: string }> = {
  milestone: { label: 'FLIP', className: 'text-emerald-400 border-emerald-500/30' },
  correction: { label: 'CORRECTION', className: 'text-red-400 border-red-500/30' },
  data: { label: 'DATA', className: 'text-neutral-400 border-neutral-700' },
  terminal: { label: 'TERMINAL', className: 'text-cyan-400 border-cyan-500/30' },
};

export function ChangeLog() {
  const [showAll, setShowAll] = useState(false);
  const entries = showAll ? CHANGELOG : CHANGELOG.slice(0, 5);

  return (
    <div id="changelog" className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden scroll-mt-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-neutral-400" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">Change Log</h3>
              <p className="text-[10px] text-neutral-500">
                Every cell that flips gets an entry — including our own corrections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/changelog.xml"
              className="flex items-center gap-1 px-2 py-1 text-[9px] text-neutral-500 hover:text-white bg-neutral-950 border border-neutral-800 rounded transition-colors"
              title="RSS feed"
            >
              <Rss className="w-3 h-3" />
              RSS
            </a>
            <a
              href="/api/changelog"
              className="px-2 py-1 text-[9px] text-neutral-500 hover:text-white bg-neutral-950 border border-neutral-800 rounded transition-colors"
              title="JSON API"
            >
              API
            </a>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-neutral-800/60">
        {entries.map(entry => {
          const kind = KIND_STYLE[entry.kind];
          return (
            <div key={entry.id} className="px-4 py-2.5">
              <div className="flex items-start gap-3">
                <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap pt-0.5 w-24 shrink-0">
                  {formatChangeDate(entry.date)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className={`px-1 py-px text-[8px] font-bold tracking-wider border rounded-sm ${kind.className}`}>
                      {kind.label}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase">{entry.scope}</span>
                    <EpistemicStamp tier={entry.tier} />
                  </div>
                  <p className="text-[11px] text-neutral-200 leading-snug">{entry.change}</p>
                  {entry.detail && (
                    <p className="text-[10px] text-neutral-500 leading-snug mt-0.5 normal-case">{entry.detail}</p>
                  )}
                  <a
                    href={entry.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] text-neutral-500 hover:text-neutral-300 mt-1 transition-colors"
                  >
                    {entry.source.label}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {CHANGELOG.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-[10px] text-neutral-500 hover:text-neutral-200 flex items-center justify-center gap-1 border-t border-neutral-800 transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show Recent
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Full Log ({CHANGELOG.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
