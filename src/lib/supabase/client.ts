import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

/**
 * Returns a lazily-initialized Supabase client using SUPABASE_URL and
 * SUPABASE_ANON_KEY from the environment. Must only be called from
 * server-side code (Server Components, Route Handlers, or Server Actions).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set',
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}
