#!/usr/bin/env node
/**
 * test-upstream-retry.mjs — positive control on the health-checker retry widening.
 *
 * WHY THIS EXISTS (Jeff, 2026-08-12, at sakbot's insistence):
 * The fix widened `checkUpstream` to retry ANY invalid response once, where it previously
 * retried only 429/5xx. That fixes a false page (a transient 404 from api.fxtwitter.com
 * paged Eric at 13:01Z while the upstream was healthy 4h later).
 *
 * 🔴 BUT THE WIDENING COULD TRADE A FALSE PAGE FOR A MISSED OUTAGE, which is the worse
 * direction. So this asserts BOTH halves, not just the one the fix was written for:
 *
 *   1. TRANSIENT 404  -> exactly ONE retry, then 'ok'      (the false page is gone)
 *   2. PERSISTENT 404 -> retried once, still reaches 'down' (a real outage still pages)
 *   3. TRANSIENT 429  -> unchanged behaviour, still 'ok'
 *   4. PERSISTENT 429 -> 'rate_limited', NOT 'down'         (the split is preserved)
 *
 * A test that only proved #1 would let the fix silently mute real failures. #2 is the
 * control that makes #1 trustworthy.
 *
 * This reimplements checkUpstream's control flow against a fake fetch rather than importing
 * the route (which pulls the Next runtime). If the route's logic changes, this must be
 * updated in step — the shape is asserted in the comment above the loop in route.ts.
 *
 * RUN: node scripts/test-upstream-retry.mjs      exit 0 = all pass
 */

const SLEEP_MS = 0; // no real delay in test

// Mirror of checkUpstream's control flow (route.ts). Keep in sync.
async function checkUpstream(u, fetchOnce) {
  const started = Date.now();
  const base = { name: u.name, feeds: u.feeds };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { status, body } = await fetchOnce(u.url);
      const ms = Date.now() - started;
      if (u.valid(status, body)) return { ...base, state: 'ok', status, ms };
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, SLEEP_MS));
        continue;
      }
      if (status === 429 || status >= 500) {
        return { ...base, state: 'rate_limited', status, ms, error: `throttled (HTTP ${status})` };
      }
      return { ...base, state: 'down', status, ms, error: `unexpected response (status ${status}, ${body.length}b)` };
    } catch (e) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, SLEEP_MS));
        continue;
      }
      return { ...base, state: 'down', status: 0, ms: Date.now() - started, error: String(e) };
    }
  }
  return { ...base, state: 'down', status: 0, ms: Date.now() - started, error: 'unreachable' };
}

const UP = {
  name: 'tweets',
  feeds: '/api/tweets (FxTwitter v2 primary)',
  url: 'https://api.fxtwitter.com/2/search?q=x',
  valid: (s, b) => s === 200 && b.includes('"results"') && b.includes('"text"'),
};

const GOOD = '{"code":200,"results":[{"text":"hi"}]}';
const NOTFOUND = '{"code":404,"message":"Not found"}';

function scripted(responses) {
  let i = 0;
  const calls = [];
  const fn = async () => {
    const r = responses[Math.min(i, responses.length - 1)];
    calls.push(r.status);
    i++;
    return r;
  };
  fn.calls = calls;
  return fn;
}

const cases = [
  {
    name: 'TRANSIENT 404 -> ok, exactly one retry',
    responses: [{ status: 404, body: NOTFOUND }, { status: 200, body: GOOD }],
    wantState: 'ok',
    wantCalls: 2,
  },
  {
    name: 'PERSISTENT 404 -> still DOWN (a real outage must still page)',
    responses: [{ status: 404, body: NOTFOUND }],
    wantState: 'down',
    wantCalls: 2,
  },
  {
    name: 'TRANSIENT 429 -> ok (unchanged)',
    responses: [{ status: 429, body: '' }, { status: 200, body: GOOD }],
    wantState: 'ok',
    wantCalls: 2,
  },
  {
    name: 'PERSISTENT 429 -> rate_limited, NOT down (split preserved)',
    responses: [{ status: 429, body: '' }],
    wantState: 'rate_limited',
    wantCalls: 2,
  },
  {
    name: 'PERSISTENT 503 -> rate_limited (5xx still separated from down)',
    responses: [{ status: 503, body: '' }],
    wantState: 'rate_limited',
    wantCalls: 2,
  },
  {
    name: 'HEALTHY -> ok on first call, NO retry (no wasted probe)',
    responses: [{ status: 200, body: GOOD }],
    wantState: 'ok',
    wantCalls: 1,
  },
  {
    name: 'VALID-SHAPE LOST (200 but wrong body) -> down, not ok',
    responses: [{ status: 200, body: '{"code":200}' }],
    wantState: 'down',
    wantCalls: 2,
  },
];

let failed = 0;
for (const c of cases) {
  const f = scripted(c.responses);
  const res = await checkUpstream(UP, f);
  const okState = res.state === c.wantState;
  const okCalls = f.calls.length === c.wantCalls;
  const pass = okState && okCalls;
  if (!pass) failed++;
  console.log(
    `  ${pass ? '✅' : '🔴'} ${c.name}\n` +
      `       state=${res.state} (want ${c.wantState}) · fetches=${f.calls.length} (want ${c.wantCalls})`,
  );
}

console.log();
if (failed) {
  console.log(`  🔴 ${failed} of ${cases.length} FAILED`);
  process.exit(1);
}
console.log(`  ✅ all ${cases.length} passed — false page fixed AND real outages still page`);
process.exit(0);
