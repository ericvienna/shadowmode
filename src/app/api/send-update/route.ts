import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    // Verify admin password
    const { password, subject, headline, body, ctaText, ctaUrl } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subject || !headline || !body) {
      return NextResponse.json(
        { error: 'Subject, headline, and body are required' },
        { status: 400 }
      );
    }

    // Get all subscribers from Supabase
    const supabase = getSupabase();
    const { data: subscribers, error: dbError } = await supabase
      .from('subscribers')
      .select('email');

    if (dbError) {
      console.error('[SEND-UPDATE] Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    const emails = subscribers.map((s) => s.email);

    // Create email HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 30px; border-bottom: 1px solid #262626;">
              <span style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">SHADOWMODE</span>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding-top: 30px;">
              <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.2); color: #22c55e; font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                🚗 Driverless Update
              </span>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding-top: 20px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${headline}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-top: 20px;">
              <p style="margin: 0; color: #a3a3a3; font-size: 16px; line-height: 1.7;">
                ${body.replace(/\n/g, '<br>')}
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          ${ctaText && ctaUrl ? `
          <tr>
            <td style="padding-top: 30px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color: #22c55e; color: #000000; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 6px; text-decoration: none;">
                ${ctaText} →
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px; border-top: 1px solid #262626; margin-top: 40px;">
              <p style="margin: 20px 0 0 0; color: #525252; font-size: 12px;">
                You're receiving this because you subscribed to Shadowmode driverless updates.
              </p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://shadowmode.us" style="color: #737373; font-size: 12px; text-decoration: none;">shadowmode.us</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send emails via Resend (batch)
    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: 'Shadowmode <updates@shadowmode.us>',
        to: email,
        subject: subject,
        html: html,
      }))
    );

    if (error) {
      console.error('[SEND-UPDATE] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
    }

    console.log(`[SEND-UPDATE] Sent to ${emails.length} subscribers`);

    return NextResponse.json({
      success: true,
      sent: emails.length,
      message: `Update sent to ${emails.length} subscribers`,
    });
  } catch (error) {
    console.error('[SEND-UPDATE] Error:', error);
    return NextResponse.json({ error: 'Failed to send update' }, { status: 500 });
  }
}
