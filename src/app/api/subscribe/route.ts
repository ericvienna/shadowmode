import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Insert into Supabase (upsert to handle duplicates gracefully)
    const supabase = getSupabase();
    const { error } = await supabase
      .from('subscribers')
      .upsert(
        { email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true }
      );

    if (error) {
      console.error('[SUBSCRIBE] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    console.log(`[SUBSCRIBE] New subscriber: ${normalizedEmail}`);

    return NextResponse.json({
      message: 'Subscribed successfully',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('[SUBSCRIBE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return subscriber count
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
  }

  return NextResponse.json({
    count: count || 0,
    message: 'Subscriber count',
  });
}
