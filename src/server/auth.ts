import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const secret = process.env.SUPABASE_SECRET_KEY || '';

export function createSupabaseAdminClient() {
  if (!url || !secret) {
    throw new Error('Missing Supabase server credentials.');
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseUserClient(accessToken: string) {
  if (!url) {
    throw new Error('Missing Supabase URL.');
  }

  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '', {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
