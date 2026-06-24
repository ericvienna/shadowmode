# SHADOWMODE Expansion Spec — Tesla Energy + Tesla Semi verticals

> Author: **Jeff** (financial brain) · Builder: **grok** · For: Eric · 2026-06-20
> Status: SPEC — not built. Build against this; do not invent values.

## Why these two, why now

SHADOWMODE's edge today is that it's **specific and falsifiable** (day-counts,
milestones, the Irreversibility Index). The expansion rule is the same: every new
vertical ships its **own falsifiable scoreboard** — real, sourced numbers or it
doesn't ship. No vibe-meters. (Anti-Belfort: a reservation is not a delivery; an
announcement is not revenue. Label every metric by what it actually is.)

These two are the cleanest bridges from "Robotaxi tracker" to **Eric's energy
thesis** (power is the bottleneck of the digital-energy economy):

- **Tesla Energy** = the energy thesis *directly*. Storage is what makes all the
  new load (robotaxi, Semi, datacenters) absorbable on the grid.
- **Tesla Semi** = electrification of freight → diesel demand shifts to grid power
  + the **contract book is the demand signal**. The order ledger is the receipts.

Both reinforce the through-line: **everything Elon ships is energy-and-compute
bound, and power is the constraint.**

---

## VERTICAL 1 — TESLA ENERGY (Megapack / Powerwall / storage)

**Panel thesis line (UI):** "Storage is the grid's release valve. Track whether
Tesla is actually building the bottleneck-breaker — or just talking about it."

### Falsifiable scoreboard metrics
| Metric | What it proves | Source (real) | Cadence |
|---|---|---|---|
| **Storage deployed (GWh/qtr + TTM)** | Is the core business actually scaling | Tesla IR quarterly update / shareholder deck ("Energy storage deployed") | Quarterly |
| **Energy gen & storage GROSS MARGIN %** | Is it a real business or loss-leader | Tesla 10-Q (segment breakout) | Quarterly |
| **Megafactory capacity online (GWh/yr)** | Lathrop (40GWh) + Shanghai ramp = forward supply | Tesla earnings calls, factory updates | Event |
| **Powerwall installs / attach** | Distributed-storage demand | Earnings commentary | Quarterly |
| **Megapack project backlog** | Forward demand (utility-scale) | Press releases, utility IRP filings, project announcements | Event |

### Key panel: "Megapack Deal Ledger" (mirror the contract-ledger pattern below)
Each row = utility-scale storage project: site, MWh, customer/utility, status
(announced / under-construction / energized), date, **source link**.

### Falsifiable hook for the X account
Storage-deployment growth rate vs. Tesla's own guidance; energy gross-margin
trend (the "is this real" check). Point @alphacheeeno posts back at this panel.

---

## VERTICAL 2 — TESLA SEMI (production + the contract book)

**Panel thesis line (UI):** "Freight is ~10% of US diesel demand. Every Semi
delivered is grid load that used to be a diesel pump. The order book is the signal
— if the contracts convert, the energy shift is real."

### Falsifiable scoreboard metrics
| Metric | What it proves | Source (real) | Cadence |
|---|---|---|---|
| **Volume production start (Nevada Semi factory, ~50k units/yr cap)** | Ramp is real, not a 2017 promise | Tesla IR, factory updates | Event |
| **Semi deliveries / qtr** | Conversion of orders → road | Tesla delivery reports (may sit in "other models" early) | Quarterly |
| **Megacharger corridor sites live** | Charging infra = the enabler | Tesla, DOE/FHWA grant updates | Event |
| **Federal charging-corridor grants ($)** | Public capital behind it | DOE / FHWA announcements (e.g. CA Semi corridor grant) | Event |

### KEY PANEL — "Semi Contract Ledger" (this is the centerpiece Eric asked for)
Auditable order book. Each row:
`Customer · Units · Status · First announced · Latest update · Source link`

Seed rows (ALL must carry a source link + a STATUS label — these are mostly
**announced reservations 2017–2023, not confirmed deliveries**; label honestly):
- PepsiCo — operating fleet (Sacramento/Modesto) + ordered ~100
- Walmart Canada — reserved (~130)
- UPS — reserved (125)
- Sysco — reserved (50)
- Anheuser-Busch — reserved (40)
- DHL, FedEx, Pride Group, Saia, ArcBest, Costco, Loblaw, Martin Brower — reserved (units per source)

**Status taxonomy (color-coded, falsifiable):**
`Reserved` (announcement only) → `Deposit/Order` → `Operating (pilot)` → `Delivered (volume)`.
The whole point: watch reservations CONVERT (or not). Stale reservations that
never convert are themselves a signal — surface the age of each.

### Falsifiable hook for the X account
The conversion gap: X reserved units vs. Y actually on the road. That gap IS the
story — bull or bear. Honest either way.

---

## Cross-cutting build notes
- Reuse existing patterns: milestone/status components, the ticker, the
  Irreversibility-Index style for "conversion" status.
- Data: same Supabase + admin-editor approach already in the repo; add `energy`
  and `semi` tables mirroring the milestone schema.
- **Discipline gate (non-negotiable):** every value needs a `source_url`. A row
  without a source does not render. No estimated/derived number shows without an
  `est.` flag. This is what separates the terminal from a stan-dashboard.
- Thesis tie-in copy on each panel connects it to "power is the bottleneck."

## Phasing (Jeff's rec)
1. **Tesla Energy first** (cleanest data, most direct thesis bridge).
2. **Semi Contract Ledger** second (the auditable order book — high narrative value).
3. Then xAI/Colossus compute-power draw + Starship cadence (later).

Don't boil the ocean. Prove the scoreboard pattern holds on these two, then expand.
