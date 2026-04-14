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
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
    }
    _client = createClient(url, key);
  }
  return _client;
}
