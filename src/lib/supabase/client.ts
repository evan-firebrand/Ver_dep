import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | undefined;

/**
 * Returns a lazily-initialized Supabase server client using the publishable
 * key. Uses @supabase/ssr's createServerClient (with no-op cookie handlers
 * since this app has no auth) so the publishable key host allowlist is
 * satisfied for server-side requests.
 *
 * Must only be called from server-side code (Server Components, Route
 * Handlers, or Server Actions).
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
    _client = createServerClient(url, key, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
  }
  return _client;
}
