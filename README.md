<p align="center">
  <img src="https://raw.githubusercontent.com/ericvienna/shadowmode/main/public/shadowmode-logo.svg" alt="SHADOWMODE" width="400" />
</p>

<p align="center">
  <strong>Real-time intelligence on Tesla's autonomous future.</strong>
</p>

<p align="center">
  <a href="https://shadowmode.us">Live Dashboard</a> •
  <a href="#data-sources">Data Sources</a> •
  <a href="#api">API</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-LIVE-00ff00?style=flat-square&logo=tesla" alt="Status: Live" />
  <img src="https://img.shields.io/badge/cities-21-black?style=flat-square" alt="Cities Tracked" />
  <img src="https://img.shields.io/badge/states-9-black?style=flat-square" alt="States Tracked" />
  <img src="https://img.shields.io/badge/updates-real--time-blue?style=flat-square" alt="Real-time Updates" />
</p>

<p align="center">
  <img src="public/screenshot.png" alt="SHADOWMODE Dashboard" width="100%" />
</p>

---

## What is this?

**SHADOWMODE** tracks Tesla's Unsupervised FSD (Robotaxi) regulatory approvals, deployments, and expansion signals across every active US market in real-time.

While Tesla operates in the shadows collecting billions of miles of training data, we're collecting something else: **the paper trail of the autonomous revolution.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ● LIVE   •   UPDATED 16 MINUTES AGO                      SHADOWMODE.US   │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐  ┌──────────┐    │
│   │ 1 DAY    │  │ 9        │  │ @elonmusk               │  │ MOMENTUM │    │
│   │ SINCE    │  │ THIS     │  │ "Testing is underway    │  │ HIGH     │    │
│   │ DRIVER-  │  │ MONTH    │  │  with no occupants      │  │          │    │
│   │ LESS     │  │ MILES-   │  │  in the car"            │  │ ACTIVITY │    │
│   │ AUSTIN   │  │ TONES    │  │              VIEW ON X →│  │ LEVEL    │    │
│   └──────────┘  └──────────┘  └─────────────────────────┘  └──────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

<br />

## Live Stats

| Metric | Value | Description |
|--------|-------|-------------|
| 🏛️ **States** | 9 | With robotaxi activity |
| 🏙️ **Cities** | 21 | Being tracked |
| ⚡ **Active** | 21 | With any progress |
| 🚀 **Public Programs** | 4 | Test programs launched |
| 🚗 **Vehicles** | 30+ | Estimated deployed |
| 🤖 **Driverless** | 1 | No safety monitor (Austin) |

<br />

## Features

<table>
<tr>
<td width="50%">

### 📊 Matrix View
Progress grid showing every city across 13 regulatory milestones. Sort by progress, name, activity, or fleet size.

### 🗺️ Map View  
Geographic visualization of Tesla's autonomous expansion. Watch the network grow.

### ⏱️ Timeline View
Chronological progression of milestones. See the velocity of approvals.

### 📈 Compare View
Side-by-side city comparisons. Who's ahead?

</td>
<td width="50%">

### 📰 Live News Feed
Aggregated coverage from TechCrunch, Electrek, Teslarati, InsideEVs, and more. 62+ articles tracked.

### 𝕏 Elon Tweet Integration
Latest robotaxi-related tweets from @elonmusk displayed in real-time.

### 🎯 Momentum Indicator
Algorithmic activity level tracking: LOW / MEDIUM / HIGH based on recent milestone velocity.

### 🔔 Days Since Counter
Track days since last major milestone (currently: 1 day since driverless Austin).

</td>
</tr>
</table>

<br />

## The Matrix

Every city is tracked across 13 regulatory and operational milestones:

| Column | Milestone | Indicator |
|--------|-----------|-----------|
| **INSURANCE** | Tesla Insurance available in state | ✓ / ✗ |
| **APPLIED** | Permit application filed | Date |
| **PERMIT** | Permit received/approved | Date |
| **OPERATOR ADS** | Vehicle operator job postings | Date |
| **FLEET ADS** | Fleet support job postings | Date |
| **APPROVAL** | Final regulatory approval | Date |
| **LIDAR TESTS** | HD mapping/validation in progress | Date |
| **APP ACCESS** | Robotaxi app access opens | Date |
| **TEST LAUNCH** | Public test program begins | Date |
| **EXPANDED** | Geofence expansion | Date |
| **VEHICLES** | Fleet size deployed | Count |
| **DRIVERLESS** | No safety monitor required | 🏆 |
| **PROGRESS** | Overall completion percentage | 0-100% |

### Status Legend

```
✓  COMPLETED     →  Milestone achieved, date confirmed
◐  IN PROGRESS   →  Underway but not complete  
○  NOT STARTED   →  No activity yet
?  UNKNOWN       →  Unconfirmed or conflicting data
—  N/A           →  Not applicable for this market
```

<br />

## Current Coverage

```
ARIZONA ────────────── Mesa/Tempe (50%) • Phoenix (42%)
CALIFORNIA ─────────── San Francisco (71%) • Oakland (63%) • San Jose (63%)
                       Los Angeles (25%) • San Diego (25%)
COLORADO ───────────── Denver (20%)
FLORIDA ────────────── Jacksonville • Miami • Orlando • Tampa
ILLINOIS ───────────── Chicago (20%)
MASSACHUSETTS ──────── Boston
NEVADA ─────────────── Las Vegas (50%)
NEW YORK ───────────── Brooklyn • Queens
TEXAS ──────────────── Austin (88% 🏆 DRIVERLESS) • Dallas • Houston • San Antonio
```

**Notes displayed in dashboard:**
- 🔶 California: "To remove safety monitors, Tesla needs driverless tester permit..."
- 🔶 Florida: "Tesla Insurance not yet available in Florida"
- 🔶 New York: "Tesla Insurance not yet available in New York"  
- 🔶 Texas: "In 2026, Tesla needs final TxDMV authorization per S.B. 2807"

<br />

## News Feed

Live aggregation from major Tesla/EV news sources:

| Source | Type |
|--------|------|
| **TechCrunch** | Breaking news, regulatory updates |
| **Electrek** | Fleet numbers, Musk statements |
| **Teslarati** | Community sightings, deep dives |
| **InsideEVs** | Industry analysis |
| **NotATeslaApp** | App updates, feature tracking |

Recent headlines tracked:
- *"Tesla Starts Testing Robotaxis in Austin With No Safety Driver"* — TechCrunch
- *"Empty Tesla Robotaxis Spotted Driving Autonomously in Austin"* — NotATeslaApp
- *"Musk Slashes Tesla Robotaxi Fleet Goal From 500 to ~40 in Austin"* — Electrek
- *"NHTSA Opens New Investigation Into Tesla Full Self-Driving"* — TechCrunch

<br />

## Data Sources

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   California DMV ──────┐                                     │
│                        │                                     │
│   CPUC Filings ────────┼────► SHADOWMODE ────► Dashboard     │
│                        │           │                         │
│   Texas DMV ───────────┤           ├────► News Feed          │
│                        │           │                         │
│   Tesla Careers ───────┤           ├────► Elon Tweets        │
│                        │           │                         │
│   News APIs ───────────┤           └────► Activity Log       │
│                        │                                     │
│   Twitter/X API ───────┘                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| [CA DMV](https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/) | Permits, test authorizations | Weekly |
| [CPUC](https://www.cpuc.ca.gov/) | Driverless deployment permits | As filed |
| [TxDMV](https://www.txdmv.gov/) | Texas authorizations | Weekly |
| [Tesla Careers](https://www.tesla.com/careers) | Job postings (leading indicator) | Daily |
| News APIs | Announcements, coverage | Real-time |
| Twitter/X | @elonmusk robotaxi tweets | Real-time |
| SEC EDGAR | Official disclosures | As filed |

<br />

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/shadowmode.git
cd shadowmode

# Install
pnpm install

# Set up environment
cp .env.example .env.local
# Add your Supabase + Twitter API credentials

# Run migrations
pnpm db:migrate

# Seed with current data
pnpm db:seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and you're tracking.

<br />

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twitter/X API (for Elon tweets)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# News APIs
NEWS_API_KEY=your_newsapi_key

# Optional: Scraping
BROWSERLESS_API_KEY=your_browserless_key
```

<br />

## Tech Stack

```
Next.js 14          App Router, Server Actions, Edge Runtime
Supabase            Postgres + Realtime subscriptions  
Tailwind CSS        Dark mode everything
Recharts            Data visualization
Vercel              Deployment + Cron jobs
Twitter API v2      @elonmusk tweet integration
NewsAPI             News aggregation
Playwright          Headless scraping for job postings
```

<br />

## API

All data is available via public API endpoints.

```bash
# Get all cities and their current status
GET /api/v1/cities

# Get specific city progress
GET /api/v1/cities/austin-tx

# Get all milestones for a state
GET /api/v1/states/california

# Get recent changes
GET /api/v1/changelog

# Get momentum/activity metrics
GET /api/v1/momentum

# Get latest Elon robotaxi tweets
GET /api/v1/tweets

# Get news feed
GET /api/v1/news?limit=20
```

**Response format:**

```json
{
  "city": "Austin",
  "state": "TX",
  "status": "driverless",
  "progress": 88,
  "milestones": {
    "insurance": { "status": "completed", "date": "2021" },
    "permit": { "status": "completed", "date": "2024-08-06" },
    "driverless": { "status": "completed", "date": "2024-12-14" }
  },
  "vehicles_deployed": "30+",
  "last_updated": "2024-12-15T00:00:00Z"
}
```

<br />

## Project Structure

```
shadowmode/
├── app/
│   ├── page.tsx              # Matrix view (home)
│   ├── timeline/              # Timeline view
│   ├── map/                   # Geographic view
│   ├── compare/               # Comparison view
│   ├── city/[slug]/           # City detail pages
│   └── api/                   # Public API routes
├── components/
│   ├── matrix/                # Progress matrix + cells
│   ├── stats/                 # Stat cards, momentum indicator
│   ├── news/                  # News feed, tweet card
│   ├── map/                   # US map visualization
│   └── charts/                # Progress bars, fleet icons
├── lib/
│   ├── supabase/              # Database client & types
│   ├── twitter/               # Tweet fetching
│   ├── scrapers/              # Data collection scripts
│   └── utils/                 # Helpers, momentum calc
└── supabase/
    ├── migrations/            # SQL schema
    └── seed.sql               # Initial data
```

<br />

## Contributing

Found a new city deployment? Spotted an error? Have a news source we're missing? PRs welcome.

```bash
# Fork the repo
git checkout -b fix/houston-date-correction

# Make changes + commit
git commit -m "fix: correct Houston permit date to 2024-08-06"

# Push and open PR
git push origin fix/houston-date-correction
```

### Data Contributions

If you have verified information about Tesla Robotaxi deployments:

1. Open an issue with the `data-update` label
2. Include source URL (news article, official filing, etc.)
3. We'll verify and merge

<br />

## Roadmap

- [x] Core matrix dashboard
- [x] Real-time Supabase sync
- [x] Mobile responsive
- [x] Live news feed aggregation
- [x] Elon tweet integration
- [x] Momentum indicator
- [x] Days since counter
- [x] Progress percentages
- [x] Vehicle fleet visualization
- [x] State-level notes/context
- [x] Activity log (62+ events)
- [ ] Interactive US map
- [ ] Timeline/Gantt view (in progress)
- [ ] Compare view (in progress)
- [ ] Email alerts for specific cities
- [ ] Predictive model for next cities
- [ ] Competitor tracking (Waymo, Cruise, Zoox)
- [ ] Embeddable widgets
- [ ] Discord bot
- [ ] Push notifications

<br />

## Disclaimer

SHADOWMODE is an independent project and is not affiliated with, endorsed by, or connected to Tesla, Inc. in any way.

All data is sourced from publicly available information including government databases, regulatory filings, news reports, public job postings, and social media. We make no guarantees about accuracy or completeness.

This is not financial advice. Do your own research.

<br />

## License

MIT — do whatever you want with it.

<br />

---

<p align="center">
  <sub>Built by people who believe the future should be trackable.</sub>
</p>

<p align="center">
  <a href="https://shadowmode.us">shadowmode.us</a>
</p>
