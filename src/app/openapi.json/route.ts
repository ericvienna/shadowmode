import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const BASE = 'https://shadowmode.us';

/**
 * Hand-maintained OpenAPI description of the PUBLIC read surface.
 *
 * Rule: an operation only appears here if the route exists in src/app/api and
 * returns that shape today. Admin, cron and write routes are deliberately
 * absent — they are auth-gated and not part of the agent contract.
 */
const spec = {
  openapi: '3.1.0',
  info: {
    title: 'SHADOWMODE API',
    version: '1.0.0',
    summary: "Sourced intelligence on Tesla's physical layer.",
    description:
      'Read-only JSON endpoints behind shadowmode.us: robotaxi deployment by metro, ' +
      'autonomous-vehicle service coverage across operators, TSLA quote, a public ' +
      'predictions ledger scored with Brier, and a change log that records corrections ' +
      "to this terminal's own numbers. Every endpoint is unauthenticated GET. " +
      'Figures carry their source; where a number is modeled or community-reported ' +
      'rather than measured, the response says so in an attribution or note field.',
    contact: { name: 'SHADOWMODE', url: `${BASE}/contact` },
    license: { name: 'Proprietary — data readable, redistribution by attribution', identifier: 'LicenseRef-shadowmode' },
  },
  servers: [{ url: BASE, description: 'Production' }],
  tags: [
    { name: 'robotaxi', description: 'Autonomous ride-hail deployment and fleet counts' },
    { name: 'market', description: 'TSLA market data' },
    { name: 'record', description: 'Falsifiable claims and correction history' },
    { name: 'signal', description: 'News and social signal ahead of confirmation' },
  ],
  paths: {
    '/api/fleet': {
      get: {
        operationId: 'getFleet',
        tags: ['robotaxi'],
        summary: 'Robotaxi fleet counts by service area',
        description:
          'Aggregate vehicle, trip and mileage counts per Tesla and Waymo service area, ' +
          'derived from the public av-map-data event log. Counts are community-observed ' +
          'and undercount official fleets — treat as a floor, not a census.',
        responses: {
          200: {
            description: 'Fleet totals and per-area breakdown',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FleetData' } } },
          },
          502: { $ref: '#/components/responses/UpstreamError' },
        },
      },
    },
    '/api/av-data': {
      get: {
        operationId: 'getAvData',
        tags: ['robotaxi'],
        summary: 'Autonomous service coverage by company and city',
        description:
          'Per-operator city coverage with supervision level (Autonomous vs safety driver) ' +
          'and access level (Public vs Waitlist vs Testing). Use this to compare Tesla ' +
          'against Waymo, Zoox and other operators on the same axis.',
        responses: {
          200: {
            description: 'Company statistics and the flat service list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AVDataResponse' } } },
          },
        },
      },
    },
    '/api/rxt': {
      get: {
        operationId: 'getRobotaxiTracker',
        tags: ['robotaxi'],
        summary: 'Per-area robotaxi activity from robotaxitracker.com',
        description:
          'Community-discovered vehicle activity for one or more metros. Undercounts the ' +
          'official fleet by construction; every area carries its own attribution and ' +
          'methodology note. Not affiliated with Tesla.',
        parameters: [
          {
            name: 'areas',
            in: 'query',
            required: false,
            description: 'Comma-separated area slugs. Unknown slugs are dropped; empty falls back to austin.',
            schema: { type: 'string', default: 'austin', examples: ['austin', 'austin,bay-area'] },
          },
        ],
        responses: {
          200: {
            description: 'Activity per requested area',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RxtResponse' } } },
          },
          502: { $ref: '#/components/responses/UpstreamError' },
        },
      },
    },
    '/api/stock': {
      get: {
        operationId: 'getStock',
        tags: ['market'],
        summary: 'TSLA last price and session change',
        description:
          'Last trade, absolute change and percent change against previous close, plus ' +
          'whether the regular session is open. Cached 60s. Quote only — this endpoint ' +
          'carries no position, valuation or recommendation.',
        responses: {
          200: {
            description: 'Quote',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Quote' } } },
          },
          502: { $ref: '#/components/responses/UpstreamError' },
        },
      },
    },
    '/api/predictions': {
      get: {
        operationId: 'getPredictions',
        tags: ['record'],
        summary: 'Public predictions ledger with Brier score',
        description:
          'Dated calls with stated probabilities and resolution criteria, scored in public. ' +
          'Entries are never edited after posting. Use this to judge whether this source ' +
          'has been right before trusting what it says now.',
        responses: {
          200: {
            description: 'Ledger and running score',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PredictionLedger' } } },
          },
        },
      },
    },
    '/api/changelog': {
      get: {
        operationId: 'getChangelog',
        tags: ['record'],
        summary: 'Timestamped change and correction log',
        description:
          'Every tracked cell that flips gets a sourced entry — including corrections to ' +
          "this terminal's own published numbers, with kind='correction'.",
        responses: {
          200: {
            description: 'Change entries, newest first',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Changelog' } } },
          },
        },
      },
    },
    '/api/living-receipts': {
      get: {
        operationId: 'getLivingReceipts',
        tags: ['record'],
        summary: 'Latest source-drift snapshot',
        description:
          'Re-checks the primary sources behind published claims and reports which ones ' +
          'changed under us. Returns an empty entries array with a message when no ' +
          'snapshot has been taken yet.',
        responses: {
          200: {
            description: 'Snapshot, possibly empty',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LivingReceipts' } } },
          },
        },
      },
    },
    '/api/news': {
      get: {
        operationId: 'getNews',
        tags: ['signal'],
        summary: 'Recent Tesla autonomy headlines',
        description: 'Up to 20 deduplicated headlines with source and publication date. Cached 15 minutes.',
        responses: {
          200: {
            description: 'Article list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NewsResponse' } } },
          },
        },
      },
    },
    '/api/tweets': {
      get: {
        operationId: 'getTweets',
        tags: ['signal'],
        summary: 'Latest tracked posts from @elonmusk and @robotaxi',
        description:
          'The most recent post from each tracked account, with the retrieval path used. ' +
          'Verbatim quotes of what those accounts posted — not an interpretation of them.',
        responses: {
          200: {
            description: 'One post per tracked account, null when unavailable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TweetsResponse' } } },
          },
        },
      },
    },
    '/api/x-intel': {
      get: {
        operationId: 'getXIntel',
        tags: ['signal'],
        summary: 'Scored social signal, with lead time over news',
        description:
          'Posts scored for credibility and tagged to a city, with hoursBeforeNews measuring ' +
          "how far ahead of confirmed reporting the signal ran. source='live' is freshly " +
          "fetched; source='seed' means the upstream fetch failed and this is fallback data.",
        responses: {
          200: {
            description: 'Signal payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/XIntelPayload' } } },
          },
          500: { $ref: '#/components/responses/UpstreamError' },
        },
      },
    },
  },
  components: {
    responses: {
      UpstreamError: {
        description: 'An upstream data source failed and no cached value was usable.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', description: 'Machine-stable error code.' },
          message: { type: 'string', description: 'Human-readable explanation.' },
          hint: { type: 'string', description: 'What to do about it.' },
        },
      },
      ServiceAreaStats: {
        type: 'object',
        required: ['id', 'name', 'slug', 'provider', 'vehicleCount', 'tripCount', 'totalMiles'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          provider: { type: 'string', enum: ['tesla', 'waymo'] },
          vehicleCount: { type: 'integer' },
          tripCount: { type: 'integer' },
          totalMiles: { type: 'number' },
          supervision: { type: 'string', description: "e.g. 'Autonomous', 'Safety Driver'" },
          access: { type: 'string', description: "e.g. 'Public', 'Waitlist', 'Testing'" },
        },
      },
      FleetData: {
        type: 'object',
        required: ['totalVehicles', 'totalTrips', 'totalMiles', 'serviceAreas', 'lastUpdated', 'source'],
        properties: {
          totalVehicles: { type: 'integer' },
          totalTrips: { type: 'integer' },
          totalMiles: { type: 'number' },
          teslaVehicles: { type: 'integer' },
          waymoVehicles: { type: 'integer' },
          serviceAreas: { type: 'array', items: { $ref: '#/components/schemas/ServiceAreaStats' } },
          lastUpdated: { type: 'string', format: 'date-time' },
          source: { type: 'string', const: 'av-map-data' },
          note: { type: 'string', description: 'Coverage caveat. Read it before quoting the counts.' },
        },
      },
      AVService: {
        type: 'object',
        required: ['company', 'city', 'supervision', 'access'],
        properties: {
          company: { type: 'string' },
          city: { type: 'string' },
          supervision: { type: 'string' },
          access: { type: 'string' },
          vehicles: { type: 'string', description: 'Platform description, not a count.' },
          fares: { type: 'string' },
          serviceModel: { type: 'string' },
          since: { type: 'string', format: 'date' },
          lastUpdate: { type: 'string', format: 'date' },
        },
      },
      CompanyStats: {
        type: 'object',
        required: ['name', 'slug', 'totalCities', 'services'],
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          totalCities: { type: 'integer' },
          autonomousCities: { type: 'integer' },
          publicCities: { type: 'integer' },
          usOnlyCities: { type: 'integer' },
          services: { type: 'array', items: { $ref: '#/components/schemas/AVService' } },
        },
      },
      AVDataResponse: {
        type: 'object',
        required: ['companies', 'allServices', 'lastFetched'],
        properties: {
          companies: { type: 'array', items: { $ref: '#/components/schemas/CompanyStats' } },
          allServices: { type: 'array', items: { $ref: '#/components/schemas/AVService' } },
          lastFetched: { type: 'string', format: 'date-time' },
        },
      },
      RxtArea: {
        type: 'object',
        required: ['area', 'provider', 'sourceUrl', 'attribution', 'fetchedAt'],
        properties: {
          area: { type: 'string' },
          areaLabel: { type: 'string' },
          provider: { type: 'string' },
          riderVehicles: { type: ['integer', 'null'] },
          unsupervised30d: { type: ['integer', 'null'] },
          inactive30d: { type: ['integer', 'null'] },
          cybercabs: { type: ['integer', 'null'] },
          unsupervisedRides: { type: ['integer', 'null'] },
          sourceUrl: { type: 'string', format: 'uri' },
          attribution: { type: 'string' },
          methodologyNote: { type: 'string', description: 'Read before quoting. Explains what the count misses.' },
          fetchedAt: { type: 'string', format: 'date-time' },
        },
      },
      RxtResponse: {
        type: 'object',
        required: ['areas', 'fetchedAt'],
        properties: {
          areas: { type: 'array', items: { $ref: '#/components/schemas/RxtArea' } },
          fetchedAt: { type: 'string', format: 'date-time' },
        },
      },
      Quote: {
        type: 'object',
        required: ['price', 'change', 'changePercent', 'isMarketOpen'],
        properties: {
          price: { type: 'number', description: 'Last trade, USD.' },
          change: { type: 'number', description: 'Absolute change vs previous close, USD.' },
          changePercent: { type: 'number' },
          isMarketOpen: { type: 'boolean', description: 'Regular session only.' },
        },
      },
      Prediction: {
        type: 'object',
        required: ['id', 'statement', 'probability', 'madeOn', 'resolveBy'],
        properties: {
          id: { type: 'string' },
          statement: { type: 'string', description: 'The falsifiable claim, as written when posted.' },
          probability: { type: 'number', minimum: 0, maximum: 1 },
          madeOn: { type: 'string', format: 'date' },
          resolveBy: { type: 'string', format: 'date' },
          method: { type: 'string', description: 'How the claim will be adjudicated.' },
        },
      },
      PredictionLedger: {
        type: 'object',
        required: ['name', 'score', 'predictions'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          score: {
            type: 'object',
            properties: {
              resolvedCount: { type: 'integer' },
              openCount: { type: 'integer' },
              brier: { type: ['number', 'null'], description: 'Null until at least one call resolves.' },
              nextResolutionDue: { type: ['string', 'null'], format: 'date' },
            },
          },
          predictions: { type: 'array', items: { $ref: '#/components/schemas/Prediction' } },
        },
      },
      ChangeEntry: {
        type: 'object',
        required: ['id', 'date', 'scope', 'kind', 'change'],
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date' },
          scope: { type: 'string' },
          kind: { type: 'string', description: "e.g. 'correction', 'update'" },
          change: { type: 'string' },
          detail: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Changelog: {
        type: 'object',
        required: ['name', 'count', 'entries'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          count: { type: 'integer' },
          entries: { type: 'array', items: { $ref: '#/components/schemas/ChangeEntry' } },
        },
      },
      LivingReceipts: {
        type: 'object',
        required: ['entries'],
        properties: {
          entries: { type: 'array', items: { type: 'object' } },
          checkedAt: { type: ['string', 'null'], format: 'date-time' },
          changedCount: { type: 'integer' },
          message: { type: 'string', description: 'Present only when there is no snapshot yet.' },
        },
      },
      NewsItem: {
        type: 'object',
        required: ['id', 'title', 'source', 'url', 'date'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          source: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          date: { type: 'string', format: 'date' },
          snippet: { type: 'string' },
        },
      },
      NewsResponse: {
        type: 'object',
        required: ['articles'],
        properties: { articles: { type: 'array', items: { $ref: '#/components/schemas/NewsItem' } } },
      },
      TweetData: {
        type: 'object',
        required: ['account', 'handle', 'text', 'url', 'date'],
        properties: {
          account: { type: 'string' },
          handle: { type: 'string' },
          text: { type: 'string', description: 'Verbatim post text.' },
          url: { type: 'string', format: 'uri' },
          date: { type: 'string' },
        },
      },
      TweetsResponse: {
        type: 'object',
        required: ['elon', 'robotaxi', 'timestamp', 'source'],
        properties: {
          elon: { anyOf: [{ $ref: '#/components/schemas/TweetData' }, { type: 'null' }] },
          robotaxi: { anyOf: [{ $ref: '#/components/schemas/TweetData' }, { type: 'null' }] },
          timestamp: { type: 'integer', description: 'Epoch milliseconds at retrieval.' },
          source: { type: 'string', enum: ['fxtwitter', 'syndication', 'nitter', 'none'] },
        },
      },
      ShadowSignal: {
        type: 'object',
        required: ['id', 'handle', 'text', 'url'],
        properties: {
          id: { type: 'string' },
          handle: { type: 'string' },
          text: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
          cityId: { type: 'string' },
          cityName: { type: 'string' },
          hasVideo: { type: 'boolean' },
          credibilityScore: { type: 'integer', minimum: 0, maximum: 100 },
          hoursBeforeNews: { type: ['number', 'null'], description: 'Lead time over confirmed reporting.' },
          sentiment: { type: 'string' },
        },
      },
      XIntelPayload: {
        type: 'object',
        required: ['generatedAt', 'source', 'shadowSignals'],
        properties: {
          generatedAt: { type: 'string', format: 'date-time' },
          source: { type: 'string', enum: ['live', 'seed'], description: "'seed' means the live fetch failed." },
          rawTweetCount: { type: 'integer' },
          shadowSignals: { type: 'array', items: { $ref: '#/components/schemas/ShadowSignal' } },
        },
      },
    },
  },
} as const;

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
