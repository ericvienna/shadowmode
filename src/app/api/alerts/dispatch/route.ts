import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { CHANGELOG, formatChangeDate, type ChangeLogEntry } from '@/lib/changelog';

/**
 * Alert dispatch — the change log is the alert feed.
 * Admin-gated: selects entries from the ledger and emails them to all
 * subscribers via Resend. Every alert carries its epistemic tier and source.
 */

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Resend API key not configured');
  return new Resend(key);
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const KIND_BADGE: Record<ChangeLogEntry['kind'], { label: string; color: string }> = {
  milestone: { label: 'CELL FLIP', color: '#34d399' },
  correction: { label: 'CORRECTION', color: '#f87171' },
  data: { label: 'DATA', color: '#a3a3a3' },
  terminal: { label: 'TERMINAL', color: '#22d3ee' },
};

const TIER_COLOR: Record<ChangeLogEntry['tier'], string> = {
  sourced: '#34d399',
  modeled: '#fbbf24',
  claimed: '#38bdf8',
};

function renderEntry(e: ChangeLogEntry): string {
  const kind = KIND_BADGE[e.kind];
  return `
          <tr>
            <td style="padding: 20px 0; border-bottom: 1px solid #262626;">
              <div style="margin-bottom: 8px;">
                <span style="display: inline-block; border: 1px solid ${kind.color}55; color: ${kind.color}; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border-radius: 3px;">${kind.label}</span>
                <span style="display: inline-block; border: 1px solid ${TIER_COLOR[e.tier]}55; color: ${TIER_COLOR[e.tier]}; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border-radius: 3px; margin-left: 6px;">${e.tier.toUpperCase()}</span>
                <span style="color: #737373; font-size: 11px; font-family: 'Courier New', monospace; margin-left: 8px;">${escapeHtml(formatChangeDate(e.date))} · ${escapeHtml(e.scope)}</span>
              </div>
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600; line-height: 1.4;">${escapeHtml(e.change)}</p>
              ${e.detail ? `<p style="margin: 8px 0 0 0; color: #a3a3a3; font-size: 13px; line-height: 1.6;">${escapeHtml(e.detail)}</p>` : ''}
              <p style="margin: 10px 0 0 0;"><a href="${e.source.url}" style="color: #737373; font-size: 12px;">Source: ${escapeHtml(e.source.label)}</a></p>
            </td>
          </tr>`;
}

export async function POST(request: Request) {
  try {
    const { password, entryIds } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(entryIds) || entryIds.length === 0) {
      return NextResponse.json({ error: 'entryIds required' }, { status: 400 });
    }

    const entries = CHANGELOG.filter(e => entryIds.includes(e.id));
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No matching changelog entries' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: subscribers, error: dbError } = await supabase
      .from('subscribers')
      .select('email');

    if (dbError) {
      console.error('[ALERTS] Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    const subject =
      entries.length === 1
        ? `[SHADOWMODE] ${entries[0].scope}: ${entries[0].change}`
        : `[SHADOWMODE] ${entries.length} scoreboard changes`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #262626;">
              <span style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">SHADOWMODE</span>
              <span style="display: block; color: #737373; font-size: 11px; margin-top: 4px;">The scoreboard, not the story. A tracked cell flipped.</span>
            </td>
          </tr>
${entries.map(renderEntry).join('\n')}
          <tr>
            <td style="padding-top: 24px;">
              <a href="https://shadowmode.us/#changelog" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Full change log →</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px;">
              <p style="margin: 0; color: #525252; font-size: 12px;">
                You subscribed to SHADOWMODE milestone alerts. Every alert is timestamped, sourced, and tiered — SOURCED / MODELED / CLAIMED.
              </p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://shadowmode.us" style="color: #737373; font-size: 12px; text-decoration: none;">shadowmode.us</a>
                &nbsp;·&nbsp;
                <a href="https://shadowmode.us/changelog.xml" style="color: #737373; font-size: 12px; text-decoration: none;">RSS</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const emails = subscribers.map(s => s.email);
    const { error } = await getResend().batch.send(
      emails.map(email => ({
        from: 'Shadowmode <updates@shadowmode.us>',
        to: email,
        subject,
        html,
      }))
    );

    if (error) {
      console.error('[ALERTS] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send alerts' }, { status: 500 });
    }

    console.log(`[ALERTS] Dispatched ${entries.length} entries to ${emails.length} subscribers`);
    return NextResponse.json({
      success: true,
      sent: emails.length,
      entries: entries.map(e => e.id),
      message: `Alert sent to ${emails.length} subscribers`,
    });
  } catch (error) {
    console.error('[ALERTS] Error:', error);
    return NextResponse.json({ error: 'Failed to dispatch alert' }, { status: 500 });
  }
}
