import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  _admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _admin;
}

/** @deprecated Use getSupabaseAdmin() — may be null when env is unset */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    if (!client) {
      throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)');
    }
    return Reflect.get(client, prop, client);
  },
});