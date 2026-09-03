'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * Headline news modal — a dated, self-expiring takeover for a single live event.
 *
 * WHY IT SELF-EXPIRES (Jeff, 2026-09-03): a modal that says "TODAY" is WRONG tomorrow morning, and
 * a stale headline on a live dashboard is worse than no headline — it quietly tells every visitor
 * the site is not maintained. So the copy carries its own `showUntil` date and the component
 * renders null past it. No cron, no cleanup task, nothing to remember: the expiry is a property of
 * the content, not of anyone's diligence.
 *
 * WHY IT REMEMBERS DISMISSAL: a takeover that reappears on every page load trains people to close
 * it without reading, which is the same attention-erosion as an alert channel that cries wolf.
 * Keyed by headline id, so a NEW headline shows again even to someone who dismissed the last one.
 *
 * 🔴 SOURCING RULE FOR WHOEVER EDITS THIS: every factual claim in `HEADLINE` must be either
 * (a) attributable to a source named in the copy, or (b) Eric's own editorial line about his own
 * dashboard. Do NOT add event specifics — times, venues, announced specs, figures — that have not
 * been verified. An unsourced number on a public tracker is the one thing this project cannot spend.
 */

type Headline = {
  /** Bump this when the copy changes — it re-shows the modal to people who dismissed the old one. */
  id: string;
  eyebrow: string;
  title: string;
  /** Optional supporting lines. Keep each one sourced or clearly editorial. */
  lines?: string[];
  /** Sourced datapoint rendered in its own block, with the source visible. */
  datapoint?: { label: string; value: string; sub: string; source: string };
  cta?: { label: string; href: string };
  /** ISO date (YYYY-MM-DD). The modal stops rendering AFTER this day. */
  showUntil: string;
};

const HEADLINE: Headline = {
  id: 'cybercab-2026-09-03',
  eyebrow: 'Headline',
  title: 'CYBERCAB LAUNCH EVENT — TODAY',
  lines: [
    'Tesla’s Cybercab launch event takes place today.',
    // VERIFIED 2026-09-03: fetched https://www.tesla.com/robotaxi — the page is live and returns
    // the title "Robotaxi | Tesla". Substantive page content is JS-rendered and could NOT be
    // extracted, so nothing about specs, pricing, dates or cities is asserted here. The link lets
    // the reader go and see for themselves, which is the honest version of "details from the site".
    'Tesla’s Robotaxi page is now live.',
  ],
  cta: { label: 'tesla.com/robotaxi', href: 'https://www.tesla.com/robotaxi' },
  datapoint: {
    label: 'TSLA',
    value: '$382.90',
    sub: '+$25.89 (+7.25%) · prev close $357.01',
    source: 'Yahoo Finance · 12:05 PM EDT, 2026-09-03',
  },
  showUntil: '2026-09-03',
};

function isExpired(showUntil: string): boolean {
  // Compare calendar dates in the VIEWER's local time. A viewer in a later timezone should stop
  // seeing "TODAY" when it is no longer their today.
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}` > showUntil;
}

export function HeadlineModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isExpired(HEADLINE.showUntil)) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(`headline-dismissed:${HEADLINE.id}`) === '1';
    } catch {
      // Private mode / blocked storage: fail OPEN and show it. A headline shown twice is a nuisance;
      // a headline never shown is a failed feature.
      dismissed = false;
    }
    if (!dismissed) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(`headline-dismissed:${HEADLINE.id}`, '1');
    } catch {
      // Nothing to do — it will show again next load, which is the safe direction.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="headline-modal-title"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-400">
              {HEADLINE.eyebrow}
            </div>
            <h2
              id="headline-modal-title"
              className="mt-2 text-lg font-semibold leading-tight text-neutral-100"
            >
              {HEADLINE.title}
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Dismiss"
            className="ml-4 shrink-0 rounded p-1 text-neutral-500 transition hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {HEADLINE.lines?.map((line) => (
            <p key={line} className="text-[13px] leading-relaxed text-neutral-400">
              {line}
            </p>
          ))}

          {HEADLINE.datapoint && (
            <div className="rounded-lg border border-neutral-800 bg-black/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                {HEADLINE.datapoint.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-100">
                {HEADLINE.datapoint.value}
              </div>
              <div className="mt-1 text-[12px] tabular-nums text-green-400">
                {HEADLINE.datapoint.sub}
              </div>
              {/* The source line is not decoration. A figure on this dashboard without a visible
                  source is indistinguishable from one that was made up. */}
              <div className="mt-2 text-[10px] text-neutral-600">{HEADLINE.datapoint.source}</div>
            </div>
          )}

          {HEADLINE.cta && (
            <a
              href={HEADLINE.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-neutral-700 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
            >
              {HEADLINE.cta.label}
            </a>
          )}
        </div>

        <div className="border-t border-neutral-800 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
          Shadowmode
        </div>
      </div>
    </div>
  );
}
