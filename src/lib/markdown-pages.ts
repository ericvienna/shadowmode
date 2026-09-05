/**
 * Markdown bodies for the Accept-negotiated text variants.
 *
 * Keyed by path with no leading slash; '' is the home page. Deliberately
 * figure-free — see the note in src/app/md/[[...slug]]/route.ts.
 */
export const MARKDOWN_PAGES: Record<string, string> = {
  '': `# SHADOWMODE

Sourced intelligence on Tesla's physical layer: robotaxi deployment, energy
storage, and the Semi contract ledger.

## What this terminal tracks

- **Robotaxi deployment** — every tracked US metro against the same regulatory
  milestones, with supervision level (autonomous vs safety driver) and access
  level (public vs waitlist vs testing). Waymo and Zoox are tracked on the same
  axes, so an approval that covered several operators does not read as one
  company's moat.
- **Energy** — storage deployment and Megapack scoreboard. See /energy.
- **Semi** — contract ledger, order book and conversion gap. See /semi.

## Getting the numbers

This page carries no figures on purpose. Every number is available from the
JSON API with its source and its caveat attached, and a figure quoted without
its caveat is a different claim than the one this site is making.

- Full contract: <https://shadowmode.us/openapi.json>
- When to use each endpoint: <https://shadowmode.us/llms.txt>

Start with \`/api/av-data\` for coverage by operator and city, \`/api/fleet\` for
observed fleet counts, and \`/api/changelog\` for what changed and what was
corrected.

## Judging the source

Dated predictions with stated probabilities are scored in public at
\`/api/predictions\`. Corrections to this site's own published numbers are
logged at \`/api/changelog\` with \`kind: "correction"\` and are never edited
away. Both exist so the record can be checked rather than trusted.

## Not what this is

No investment advice, no price targets, no position sizing. \`/api/stock\`
returns a quote and nothing more. Not affiliated with or speaking for Tesla,
Inc.

More: [about](https://shadowmode.us/about) ·
[contact](https://shadowmode.us/contact) ·
[privacy](https://shadowmode.us/privacy)
`,

  about: `# About SHADOWMODE

SHADOWMODE tracks the physical layer of Tesla's autonomy and energy business:
where robotaxi service actually operates, at what supervision level, under
whose approval, alongside storage deployment and the Semi contract ledger. It
exists because the interesting questions about autonomous deployment are
answered by permits, service-area filings and observed vehicles — not by
announcements.

Operators other than Tesla are tracked on the same axes. That matters more than
it sounds: a headline saying a state approved Tesla usually means the state
approved several operators the same day. One of those is a moat, the other is a
market opening, and the difference only shows up if the competition is in the
same table.

## Where the numbers come from

Figures are sourced, and the source travels with the figure. Service coverage
and supervision levels come from public autonomous-vehicle event data; observed
vehicle activity from community trackers; quotes from public market data;
headlines link to the publisher. Nothing is generated, estimated to fill a gap,
or averaged between two sources that disagree — when sources conflict the
primary one wins and the other is discarded rather than blended.

Community-observed vehicle counts undercount official fleets by construction:
they see only what someone spotted. Those endpoints carry methodology notes,
and the note is part of the number.

## Corrections

Wrong figures are corrected in the open. \`/api/changelog\` carries an entry
marked as a correction with the date and what changed, and entries are not
edited away afterwards. In August 2026 an entire panel was retired this way,
because its crash-rate denominator was modeled from assumed constants rather
than measured — which made the displayed rate improve on its own as time
passed. That is in the log.

\`/api/predictions\` works the same way: dated claims with stated probabilities
and a written resolution method, scored in public with a Brier score once they
resolve. It is there so you can check whether this source has been right before
deciding what to do with what it says now.

## What this is not

Not investment advice, and it contains none. The quote endpoint returns a price
and nothing else — no target, no position, no view on what anyone should own.
Not affiliated with, endorsed by, or speaking for Tesla, Inc., and it does not
publish statements attributed to Tesla or its executives. Where a public post
is shown the text is verbatim and links to the original; quote the source, not
this site.

## For agents

The public read surface is described at <https://shadowmode.us/openapi.json>,
with per-endpoint guidance at <https://shadowmode.us/llms.txt>. Endpoints are
unauthenticated GET, return JSON, and send permissive CORS headers. Errors are
JSON, never HTML.
`,

  contact: `# Contact

SHADOWMODE is run by one operator, not a support department. There is no ticket
queue. The channels below are the real ones, and they are read.

## Report a wrong number

The message most worth sending. If a figure here is wrong, stale, or missing
the caveat that makes it honest, say so and point at the primary source — a
filing, a regulator page, an operator's own announcement. Sourced corrections
are applied and logged publicly at \`/api/changelog\`, marked as corrections
rather than edited away.

Open an issue: <https://github.com/ericvienna/shadowmode/issues>

The tracker is open source. The code that produces every number on this site is
at <https://github.com/ericvienna/shadowmode>, so a claim about how a figure was
computed can be checked rather than argued about.

## Data, deletion and privacy requests

Same channel. To have your address removed from the update list, or to ask what
is stored about you, open an issue. The honest answer is usually "an email
address and nothing else" — see <https://shadowmode.us/privacy>. Deletion
requests are actioned, not negotiated.

## Updates

The update list is the outbound channel: material changes to the trackers, and
corrections when they happen. Sign up from the terminal at
<https://shadowmode.us/>. Low volume, unsubscribe on everything.

## What will not get an answer

- Requests for investment advice, price targets, or a view on what to buy or
  sell. There is none here.
- Requests to add data about private individuals.
- Requests to remove a sourced, accurate figure about a company's public
  activity.

## For agents

You probably want <https://shadowmode.us/openapi.json> or
<https://shadowmode.us/llms.txt> rather than this page. Both describe the full
public read surface, and the endpoints need no credentials.
`,

  privacy: `# Privacy

SHADOWMODE is a public dashboard. Reading it requires no account, no login and
no identification of any kind, and the API is unauthenticated for the same
reason. This page describes the only two places where data about a visitor
exists at all.

## Email, if you give it

If you submit your email address to the update list, that address is stored so
updates can be sent to it. It is used for that and nothing else: not sold,
rented, traded, used to build a profile, or passed to advertisers. Storage is
handled by Supabase and delivery by Resend, both acting as processors on behalf
of this site. Ask and the address is deleted — see
<https://shadowmode.us/contact>. There is no retention argument to be had about
it; the list exists to send updates, so leaving it ends the reason to keep the
record.

## Traffic measurement

Page views are counted with Vercel Analytics, which is cookieless and does not
attempt to identify individual visitors or follow them to other sites. It
reports aggregates. Requests are also logged by the hosting platform in the
ordinary course of serving them, which includes IP addresses, for the
operational purposes any web server has: keeping the thing up and stopping
abuse.

## What is deliberately absent

- No advertising or third-party tracking scripts.
- No cross-site profiling and no data broker relationships.
- No cookies set by this site for tracking purposes.
- No accounts, so no passwords and no credential storage.
- No collection of location, contacts, or device identifiers.

## Data about third parties

The tracked content on this site concerns companies and their published
activity — regulatory filings, service areas, public posts by public accounts
about their own products. It is not a database about private individuals, and
requests to add one will be declined.

## Changes

If this policy changes materially, the change is dated here rather than applied
quietly. Questions, deletion requests and corrections go through
<https://shadowmode.us/contact>.
`,
};
