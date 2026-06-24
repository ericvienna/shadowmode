import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

// Daily health + freshness cron. Verifies every upstream data source the live
// APIs depend on is still reachable and returning usable data, revalidates the
// DB-backed dashboard so the newest Supabase milestone data is served, and
// emails Eric ONLY when something is broken.
//
// We check the EXTERNAL upstreams directly (Yahoo, Google News, GitHub, Twitter)
// rather than this site's own /api/* — those are firewalled (Vercel BotID) to
// non-browser clients, so a server-side self-fetch would false-fail. The
// upstreams are also what actually breaks.
//
// Triggered by Vercel Cron (see vercel.json) with Authorization: Bearer
// ${CRON_SECRET}; the internal cron invocation is exempt from the firewall.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALERT_TO = 'aireek@gmail.com';
const ALERT_FROM = 'Robotaxi Tracker <updates@shadowmode.us>';

type Upstream = {
  name: string;
  feeds: string; // which site API depends on it
  url: string;
  valid: (status: number, body: string) => boolean;
};

// The external sources behind each live-data API route.
const UPSTREAMS: Upstream[] = [
  {
    name: 'stock',
    feeds: '/api/stock (Yahoo Finance)',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d',
    valid: (s, b) => s === 200 && b.includes('"regularMarketPrice"'),
  },
  {
    name: 'news',
    feeds: '/api/news (Google News RSS)',
    url: 'https://news.google.com/rss/search?q=' + encodeURIComponent('tesla robotaxi OR tesla FSD autonomous'),
    valid: (s, b) => s === 200 && b.includes('<item>'),
  },
  {
    name: 'av-data',
    feeds: '/api/av-data (av-map-data CSV)',
    url: 'https://raw.githubusercontent.com/path-avmap/av-map-data/main/events.csv',
    valid: (s, b) => s === 200 && b.split('\n').length > 1,
  },
  {
    name: 'tweets',
    feeds: '/api/tweets (FxTwitter v2 primary)',
    url:
      'https://api.fxtwitter.com/2/search?q=' +
      encodeURIComponent('from:elonmusk robotaxi'),
    valid: (s, b) => s === 200 && b.includes('"results"') && b.includes('"text"'),
  },
];

// 'ok' = live + valid · 'rate_limited' = throttled (transient, don't page) ·
// 'down' = hard failure or valid-shape lost (page Eric).
type CheckState = 'ok' | 'rate_limited' | 'down';

type CheckResult = {
  name: string;
  feeds: string;
  state: CheckState;
  status: number;
  ms: number;
  error?: string;
};

async function fetchOnce(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Accept: '*/*',
    },
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  return { status: res.status, body: await res.text() };
}

async function checkUpstream(u: Upstream): Promise<CheckResult> {
  const started = Date.now();
  const base = { name: u.name, feeds: u.feeds };
  // One retry on transient throttle/5xx — datacenter IPs get 429'd often
  // (Yahoo, Twitter), so a single 429 is not an outage.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { status, body } = await fetchOnce(u.url);
      const ms = Date.now() - started;
      if (u.valid(status, body)) return { ...base, state: 'ok', status, ms };
      if (status === 429 || status >= 500) {
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        return { ...base, state: 'rate_limited', status, ms, error: `throttled (HTTP ${status})` };
      }
      return { ...base, state: 'down', status, ms, error: `unexpected response (status ${status}, ${body.length}b)` };
    } catch (e) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return {
        ...base,
        state: 'down',
        status: 0,
        ms: Date.now() - started,
        error: e instanceof Error ? e.message : 'fetch failed',
      };
    }
  }
  return { ...base, state: 'down', status: 0, ms: Date.now() - started, error: 'unreachable' };
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

type HealthReport = {
  ok: boolean;
  checkedAt: string;
  revalidated: boolean;
  healthy: string[];
  rateLimited: string[];
  down: string[];
  results: CheckResult[];
  knownIssues: string[];
};

async function sendAlert(report: HealthReport) {
  if (!process.env.RESEND_API_KEY) return;
  const color = { ok: '#16a34a', rate_limited: '#d97706', down: '#dc2626' };
  const rows = report.results
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;font-family:monospace;">${r.name}</td>` +
        `<td style="padding:4px 12px 4px 0;color:#666;font-size:12px;">${r.feeds}</td>` +
        `<td style="padding:4px 0;color:${color[r.state]};">` +
        `${r.state.toUpperCase()} · ${r.status} · ${r.ms}ms${r.error ? ` · ${r.error}` : ''}</td></tr>`
    )
    .join('');
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: ALERT_FROM,
      to: ALERT_TO,
      subject: `⚠️ Robotaxi Tracker: ${report.down.length} data source(s) down (${report.down.join(', ')})`,
      html: `<div style="font-family:-apple-system,sans-serif;font-size:14px;color:#111;">
        <p><strong>${report.down.length} upstream data source(s) failed</strong> the daily check at ${report.checkedAt}.</p>
        <table style="border-collapse:collapse;">${rows}</table>
        <p style="color:#666;font-size:12px;">robotaxitracker.com · /api/cron/refresh</p>
      </div>`,
    });
  } catch {
    // best-effort; the 503 status still signals failure to the cron log
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await Promise.all(UPSTREAMS.map(checkUpstream));

  // Re-pull the DB-backed dashboard so any new Supabase milestone data shows.
  let revalidated = false;
  try {
    revalidatePath('/');
    revalidated = true;
  } catch {
    revalidated = false;
  }

  const down = results.filter((r) => r.state === 'down').map((r) => r.name);
  const report: HealthReport = {
    ok: down.length === 0,
    checkedAt: new Date().toISOString(),
    revalidated,
    healthy: results.filter((r) => r.state === 'ok').map((r) => r.name),
    rateLimited: results.filter((r) => r.state === 'rate_limited').map((r) => r.name),
    down,
    results,
    knownIssues: [
      '/api/fleet self-references teslarobotaxitracker.com/api/fleet (circular) — serves stale cache; needs a real upstream.',
      'Public Trust Signal + city milestones are manually maintained (last updated 2025-12) — need the content-refresh agent.',
    ],
  };

  if (!report.ok) await sendAlert(report);

  return NextResponse.json(report, { status: report.ok ? 200 : 503 });
}
