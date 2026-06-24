# SEED DATA — Energy + Semi (sourced) — for grok to wire into SHADOWMODE

> Compiled & verified by Jeff, 2026-06-20. EVERY row carries a source URL.
> Discipline gate (per spec): no source_url = no render; reservation ≠ delivery;
> estimates flagged `est.`; stale rows (2017 reservation, no 2024+ update) labeled STALE.
> NOTE: this picture moved a LOT in 2025–26 — volume production line is LIVE,
> real deliveries are happening. Don't ship the old "still just reservations" framing.

## SEMI CONTRACT LEDGER (seed rows)

| Customer | Units | Status | First Announced | Latest Update | Source |
|---|---|---|---|---|---|
| WattEV | 370 ordered (~$100M) | Order (deliveries starting) | May 2026 | First 50 deliver 2026; Port of Oakland drayage | https://electrek.co/2026/05/05/wattev-orders-370-tesla-semis-california-largest-ev-truck-deployment/ |
| PepsiCo | 86 operating | Operating-pilot | 2017 | Sept 2024: Modesto 15 / Sacramento 21 / Fresno 50 | https://www.truckinginfo.com/news/tesla-and-pepsico-give-semi-update-at-iaa-2024 |
| DHL Supply Chain | 1 delivered, more for 2026 | Operating-pilot | 2017 | First DHL delivery Dec 16 2025 | https://www.dhl.com/us-en/home/press/press-archive/2025/dhl-supply-chain-accelerates-sustainability-with-first-tesla-semi-delivery.html |
| Nevoya | 5 delivered | Operating-pilot | 2025 | July 2025: first payment-collected commercial deliveries | https://cleantechnica.com/2025/07/22/electric-truck-startup-nevoya-raises-more-cash-to-spread-its-wings-fly/ |
| Saia LTL | 2 delivered | Operating-pilot | Jan 2025 | 1.73 kWh/mi commercial pilot | https://www.truckinginfo.com/news/saia-partners-with-tesla-to-launch-two-electric-semis |
| ArcBest / ABF | 2 purchased | Operating-pilot | 2025 | June 2026: bought after pilot (1.55 kWh/mi) | https://electrek.co/2026/06/11/arcbest-buys-tesla-semis-abf-freight-pilot/ |
| RoadOne | up to 10 | Operating-pilot | Jan 2026 | Expanding 1→10 on performance | https://evxl.co/2026/01/15/tesla-semi-roadone-plans-10-truck-fleet/ |
| Martin Brower | 2 | Operating-pilot | 2024 | Stockton DC pilot | https://martinbrower.com/newsroom/martin-brower-pilots-tesla-all-electric-semis |
| Walmart Canada | 130 reserved | Reserved | 2017 | May 2024: tripled 15→130 | https://www.newswire.ca/news-releases/walmart-canada-more-than-triples-order-of-tesla-semi-trucks-819028752.html |
| Loblaw (Canada) | ~50 on order | Reserved | 2017 | Doubled fleet; +25 on order | https://www.fleetmanagementweekly.com/grocery-giant-loblaw-doubles-electric-semi-fleet-has-25-tesla-semis-on-order/ |
| UPS | 125 reserved | Reserved — STALE | 2017 | No delivery / no 2024+ update | https://techcrunch.com/?p=1579783 |
| Sysco | 50 deposit | Reserved — STALE | 2017 | 2022: still in queue | https://www.torquenews.com/1084/tesla-semi-truck-customers-are-still-waiting-sysco-says-we-put-deposit-50-trucks-2017-they |
| Anheuser-Busch | 40 ordered | Reserved — STALE | 2017 | No delivery confirmed | https://greenlivingguy.com/2022/10/anheuser-busch-and-sysco-order-more-than-15m-in-tesla-electric-semi-trucks-in-one-day/ |
| FedEx | 20 reserved | Reserved — STALE | 2022 | FedEx Freight LTL; no delivery | https://www.ttnews.com/articles/fedex-orders-20-tesla-semis |
| J.B. Hunt | "multiple" | Reserved — STALE | 2017 | No delivery / no update | https://fortune.com/2017/11/17/tesla-semi-truck-meijer-jb-hunt |

DO NOT render (unverified — keep out per gate): Costco (sighting only), Walmart US (no unit count disclosed), Pride Group (nothing found), Ryder (count not found). Leave as admin TODOs, not public rows.

## SEMI PRODUCTION / INFRA (key milestones — for the Semi panel header)
- High-volume production line: first truck off **April 29, 2026** — https://electrek.co/2026/04/29/tesla-semi-first-truck-high-volume-production-line/
- Stated capacity 50,000/yr at full ramp (Giga Nevada, 1.7M sq ft) — same source
- Pricing (Feb 2026): $260K (325-mi) / $290K (500-mi), 1,072 hp tri-motor
- CA HVIP demand signal: **965 of 1,067** CA clean-truck vouchers were Tesla Semi (90%+) — same Electrek April 2026 source. ← government-sourced, least-spinnable demand metric, USE IT.
- Tesla does NOT report Semi deliveries separately (buried in "Other Models") — label the ledger as the only delivery proxy.
- Megacharger: 1 station live (Ontario CA, Mar 8 2026), 64 sites mapped (Feb 2026), Pilot Flying J deal (Jan 2026). Federal CFI grant $100M IL corridor (Jan 2025, consortium). Sources in spec research.

## ENERGY STORAGE METRICS (seed for the Energy panel)
| Quarter | GWh deployed | Source |
|---|---|---|
| FY2024 | 31.4 (+114% YoY) | Tesla SEC 8-K |
| Q1 2025 | 10.4 | Tesla 8-K Apr 2025 |
| Q2 2025 | 9.6 | Tesla 8-K Jul 2025 |
| Q3 2025 | 12.5 (record at time) | Tesla 8-K Oct 2025 |
| Q4 2025 | 14.2 (record) | Tesla 8-K Jan 2026 |
| FY2025 | 46.7 (+49% YoY) | SEC 8-K |
| Q1 2026 | 8.8 (MISS vs ~14.4 consensus, -38% QoQ) | Tesla IR press release Apr 2 2026 |

Energy segment gross margin: FY2024 26.2% · Q3 2025 31.4% (SEC 10-Q) · Q1 2026 reported 39.5% **but est. inflated by one-time warranty/tariff items — DO NOT use as trend baseline** (Electrek). Normalized ~28–32%.
IRA credits embedded in margin: $756M (2024) vs $115M (2023) — flag separately.

Megafactory capacity: Lathrop CA 40 GWh/yr (operational) · Shanghai 40 GWh/yr target (ramping, ~8 GWh 2025) · Houston 50 GWh/yr (announced Sept 2025, not operational — label PLANNED).
Megapack 3 (5 MWh/unit) + Megablock (20 MWh AC) announced Sept 9 2025, deliveries H2 2026.

Megapack Deal Ledger seed: Intersect Power 15.3 GWh (CA+TX, signed Jul 2024) · Matrix Renewables 500MW/1GWh Scotland (EPC Dec 2025) · Nucor/AZ 200 MWh (operational Oct 2025). Sources in research dump.

> Anti-Belfort reminder for the builder: the Q1 2026 numbers (energy GWh miss, margin one-time inflation) are the kind of thing a stan-dashboard hides. SHOW them — the honesty IS the credibility. Flag the storage QoQ drop and the margin asterisk on the panel.
