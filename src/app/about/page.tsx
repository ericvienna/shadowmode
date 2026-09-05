import { ProsePage } from '@/components/prose/ProsePage';

export const metadata = {
  title: 'About — SHADOWMODE',
  description:
    "What SHADOWMODE is, where its numbers come from, how corrections are handled, and what it will not tell you.",
  alternates: { canonical: 'https://shadowmode.us/about' },
};

export default function AboutPage() {
  return (
    <ProsePage title="ABOUT" updated="2026-09-05">
      <p>
        SHADOWMODE is a tracker for the physical layer of Tesla&apos;s autonomy and energy
        business: where robotaxi service actually operates, at what supervision level, under
        whose approval, alongside storage deployment and the Semi contract ledger. It exists
        because the interesting questions about autonomous deployment are answered by permits,
        service-area filings and observed vehicles — not by announcements.
      </p>
      <p>
        Every metro is tracked against the same regulatory milestones, and operators other than
        Tesla are tracked on the same axes. That matters more than it sounds: a headline saying a
        state approved Tesla usually means the state approved several operators the same day.
        One of those is a moat. The other is a market opening. The difference only shows up if
        you record the competition in the same table.
      </p>

      <h2>Where the numbers come from</h2>
      <p>
        Figures are sourced, and the source travels with the figure. Service coverage and
        supervision levels come from public autonomous-vehicle event data; observed vehicle
        activity comes from community trackers; market quotes come from public market data;
        headlines link to the publisher. Nothing here is generated, estimated to fill a gap, or
        averaged between two sources that disagree. When two sources conflict, the primary one
        wins and the other is discarded rather than blended.
      </p>
      <p>
        Community-observed vehicle counts undercount official fleets by construction — they see
        only what someone spotted. Those endpoints carry their own methodology notes, and the
        notes are part of the number. A count quoted without its caveat is a different claim
        than the one this site is making.
      </p>

      <h2>Corrections</h2>
      <p>
        When a published figure turns out to be wrong, it is corrected in the open. The{' '}
        <a href="/api/changelog">change log</a> carries an entry marked as a correction, with
        the date and what changed. Entries are not edited away after the fact. In August 2026 an
        entire panel was retired this way, because its crash-rate denominator was modeled from
        assumed constants rather than measured — which made the displayed rate improve on its
        own as time passed. That is in the log.
      </p>
      <p>
        The <a href="/api/predictions">predictions ledger</a> works the same way: dated claims
        with stated probabilities and a written resolution method, scored in public with a Brier
        score once they resolve. It is there so you can check whether this source has been right
        before deciding what to do with what it says now.
      </p>

      <h2>What this is not</h2>
      <p>
        This is not investment advice and contains none. The TSLA quote endpoint returns a price
        and nothing else — no target, no position, no view on what anyone should own. It is not
        affiliated with, endorsed by, or speaking for Tesla, Inc., and it does not publish
        statements attributed to Tesla or its executives. Where a public post is shown, the text
        is verbatim and links to the original; quote the source, not this site.
      </p>

      <h2>For agents</h2>
      <p>
        The full public read surface is described in an{' '}
        <a href="/openapi.json">OpenAPI specification</a>, with per-endpoint guidance on when to
        use each one in <a href="/llms.txt">llms.txt</a>. Endpoints are unauthenticated GET,
        return JSON, and send permissive CORS headers. Errors are JSON, never HTML.
      </p>
    </ProsePage>
  );
}
