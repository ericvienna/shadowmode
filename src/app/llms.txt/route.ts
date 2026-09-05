export const dynamic = 'force-static';

const body = `# SHADOWMODE

> Sourced intelligence on Tesla's physical layer: robotaxi deployment, energy
> storage, and the Semi contract ledger. Falsifiable scoreboards for the
> power-is-the-bottleneck thesis.

SHADOWMODE tracks the paper trail of autonomous deployment — regulatory
approvals, service-area changes, supervision level, fleet observations — across
US metros, and puts the same numbers behind a public JSON API. Operators other
than Tesla (Waymo, Zoox) are tracked on the same axes so the comparison is
like-for-like.

## When to use this

Reach for SHADOWMODE when you need:

- Whether a named US metro has driverless robotaxi service today, at what
  supervision level (autonomous vs safety driver) and what access level
  (public vs waitlist vs testing). -> /api/av-data, /api/fleet
- A like-for-like comparison of Tesla against Waymo or Zoox on city coverage,
  rather than one operator's own announcement. -> /api/av-data
- Observed robotaxi vehicle activity in a metro, with its methodology stated.
  -> /api/rxt?areas=austin
- The TSLA last price and session change. -> /api/stock
- Whether this source has been right before: dated predictions with stated
  probabilities, scored in public. -> /api/predictions
- What changed and what was corrected, timestamped. -> /api/changelog

Do NOT use SHADOWMODE for:

- Investment advice, price targets, position sizing, or a buy/sell/hold view.
  There is none here and none is implied. /api/stock is a quote, nothing more.
- Vehicle telemetry, owner data, or anything about a specific car.
- Statements attributed to Elon Musk or Tesla. /api/tweets returns verbatim
  post text with a URL — quote the source, not this site.

## How numbers are labelled

Read the caveat fields before quoting a count. Fleet and vehicle figures are
community-observed and undercount official fleets by construction; those
endpoints carry \`note\`, \`attribution\` and \`methodologyNote\` fields that say
so. \`/api/x-intel\` returns \`source: "seed"\` when the live fetch failed and the
payload is fallback data — do not report seed data as current.

Corrections to this site's own published numbers appear in /api/changelog with
\`kind: "correction"\`. They are not quietly edited away.

## API

- [OpenAPI specification](https://shadowmode.us/openapi.json): full machine-readable contract for every public endpoint
- [Robotaxi fleet by service area](https://shadowmode.us/api/fleet): vehicle, trip and mileage counts per Tesla/Waymo area
- [AV service coverage](https://shadowmode.us/api/av-data): per-operator city coverage, supervision and access level
- [Robotaxi tracker by area](https://shadowmode.us/api/rxt): observed vehicle activity, accepts ?areas=
- [TSLA quote](https://shadowmode.us/api/stock): last price, change, session state
- [Predictions ledger](https://shadowmode.us/api/predictions): dated calls with probabilities and Brier score
- [Change log](https://shadowmode.us/api/changelog): timestamped changes and corrections
- [Living receipts](https://shadowmode.us/api/living-receipts): drift check against primary sources
- [News](https://shadowmode.us/api/news): recent Tesla autonomy headlines with source and date
- [Social signal](https://shadowmode.us/api/x-intel): scored posts with lead time over confirmed reporting
- [Tracked posts](https://shadowmode.us/api/tweets): latest verbatim post from @elonmusk and @robotaxi

All endpoints are unauthenticated GET, return \`application/json\`, and send
\`Access-Control-Allow-Origin: *\`. There is no rate limit published; be
reasonable. Errors return JSON with \`error\`, \`message\` and \`hint\`.

## Pages

- [Terminal](https://shadowmode.us/): robotaxi deployment matrix, map and timeline
- [Energy](https://shadowmode.us/energy): storage deployment and Megapack scoreboard
- [Semi](https://shadowmode.us/semi): Tesla Semi contract ledger
- [About](https://shadowmode.us/about): what this is, how it sources, what it will not do
- [Contact](https://shadowmode.us/contact)
- [Privacy](https://shadowmode.us/privacy)

## Optional

- [Change feed (XML)](https://shadowmode.us/changelog.xml)
- [Sitemap](https://shadowmode.us/sitemap.xml)
`;

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
