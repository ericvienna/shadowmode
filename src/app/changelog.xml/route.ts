import { CHANGELOG, changeDateToISO, formatChangeDate } from '@/lib/changelog';

export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const items = CHANGELOG.map(e => {
    const title = `[${e.scope}] ${e.change}`;
    const description = [e.detail, `Tier: ${e.tier.toUpperCase()}`, `Source: ${e.source.label}`, `As of: ${formatChangeDate(e.date)}`]
      .filter(Boolean)
      .join(' — ');
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>https://shadowmode.us/#changelog</link>
      <guid isPermaLink="false">${escapeXml(e.id)}</guid>
      <pubDate>${new Date(changeDateToISO(e.date)).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SHADOWMODE — Change Log</title>
    <link>https://shadowmode.us</link>
    <description>The scoreboard, not the story. Every tracked cell that flips gets a timestamped, sourced entry — including corrections to our own numbers.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
