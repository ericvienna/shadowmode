# SHADOWMODE.US Data Update Guide

## Primary Data Source
**@JonathanWStokes Robotaxi Progress Tracker**
- Twitter/X: https://x.com/JonathanWStokes
- Updates regularly with verified Tesla robotaxi milestones

## Update Schedule
- **Daily**: Check for new Elon tweets about robotaxi/FSD
- **Weekly**: Cross-reference @JonathanWStokes tracker for milestone updates
- **As-needed**: Major announcements (permits, launches, expansions)

---

## How to Update Data

### 1. Seed Data (`src/lib/seed-data.ts`)

#### Adding a new milestone to an existing city:
```typescript
// Find the city in SEED_DATA and add the milestone
{
  id: 'tx-austin',
  name: 'Austin',
  milestones: {
    ...createEmptyMilestones(),
    // Add new milestone here:
    new_milestone: createMilestone('milestone_type', '2025-12-20'),
  },
}
```

#### Milestone status options:
- `'completed'` - Green checkmark (with date)
- `'in_progress'` - Yellow clock (with value like "3" for pending count)
- `'not_started'` - Gray circle
- `'unknown'` - Question mark (use `'?'` or `'Unk'`)
- `'n/a'` - Dash (use `'N/A'`)

#### Date formats:
- Full date: `'2025-12-14'` (YYYY-MM-DD)
- Year only: `'2025'`
- Value/count: `'31+'` or `'3'` (for in_progress items)

### 2. Elon Tweet Widget (`src/components/CountdownWidget.tsx`)

Update when Elon tweets about robotaxi/FSD:
```typescript
{/* Latest Elon Tweet */}
<div className="text-[11px] text-white leading-relaxed">
  [NEW TWEET TEXT HERE]
</div>
<a href="https://x.com/elonmusk/status/[NEW_STATUS_ID]" ...>
```

Also update the date span:
```typescript
<span className="text-[8px] text-neutral-600 ml-auto">[NEW DATE]</span>
```

### 3. News Items (`src/components/SidebarTabs.tsx`)

Add new articles to the `REAL_NEWS` array:
```typescript
{
  id: '[next_number]',
  title: 'Article Title',
  source: 'TechCrunch',  // Must match getSourceColor() mapping
  url: 'https://...',
  date: '2025-12-20',
  snippet: 'Brief description...',
},
```

---

## Verification Sources

### Permits & Regulatory
- **California DMV**: https://www.dmv.ca.gov/portal/vehicle-industry-services/autonomous-vehicles/
- **Arizona DOT**: https://azdot.gov/motor-vehicles
- **Nevada DMV**: https://dmv.nv.gov/
- **Texas DMV**: https://www.txdmv.gov/

### News & Updates
- **TechCrunch**: https://techcrunch.com/tag/tesla/
- **Electrek**: https://electrek.co/guides/tesla/
- **Teslarati**: https://www.teslarati.com/
- **NotATeslaApp**: https://www.notateslaapp.com/

### Tesla Official
- **Robotaxi Page**: https://www.tesla.com/robotaxi
- **Tesla Careers**: https://www.tesla.com/careers/search (for job posting indicators)

### Community Trackers
- **@JonathanWStokes**: https://x.com/JonathanWStokes (primary source)
- **Robotaxi Tracker (Ethan McKenna)**: Austin fleet tracking

---

## Milestone Types Reference

| Type | Description | Example |
|------|-------------|---------|
| `tesla_insurance_available` | Tesla Insurance in state | 2021, 2022, or "1" (pending) |
| `permit_applied` | Applied for AV testing permit | 2025-06-26 |
| `permit_received` | Received AV testing permit | 2025-09-19 |
| `vehicle_operator_ads` | Job postings for vehicle operators | 2025-08-05 |
| `robotaxi_fleet_support_ads` | Fleet support job postings | 2025-10-15 |
| `final_regulatory_approval` | Final permit (TNC, deployment) | 2025-11-17 |
| `lidar_validation_tests` | LiDAR/sensor validation testing | 2025-09-17 |
| `robotaxi_app_access_opens` | App access for rides | 2025-07-30 |
| `public_test_program_launched` | Public can request rides | 2025-06-22 |
| `geofence_expanded` | Service area expanded | 2025-07-14 |
| `vehicles_deployed_20_plus` | 20+ vehicles in city | "30+" |
| `no_safety_monitor` | Driverless testing begins | 2025-12-14 |

---

## Current Data Status (Dec 15, 2025)

### Active Robotaxi Cities:
- **Austin, TX** - Driverless testing (Dec 14)
- **SF Bay Area** - Supervised service (July 30)

### Permitted/Pending Launch:
- **Phoenix, AZ** - TNC permit received (Nov 17)
- **Las Vegas, NV** - Testing permit (Sept 11)

### Expansion Announced (Job Postings):
- Dallas, Houston, San Antonio (TX)
- Miami, Orlando, Tampa, Jacksonville (FL)
- Brooklyn, Queens (NY)
- Chicago (IL)
- Denver (CO)
- Boston (MA)

---

## Changelog

| Date | Update | Source |
|------|--------|--------|
| 2025-12-15 | Initial data from @JonathanWStokes tracker | x.com/JonathanWStokes |
| 2025-12-14 | Austin driverless testing confirmed | Elon tweet, TechCrunch |
