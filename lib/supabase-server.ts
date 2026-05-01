import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local',
  );
}

/**
 * Server-side Supabase client tied to the current request's cookies.
 * Use in Server Components, Route Handlers, or Server Actions to call
 * `auth.getUser()` and run authenticated queries under the user's RLS.
 *
 * Cookie writes (token refresh) are wrapped in try/catch because Server
 * Components run in a read-only cookie context — token refresh ends up
 * being handled the next time the client navigates or via middleware.
 */
export function createServerSupabase() {
  const store = cookies();
  return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          store.set({ name, value, ...options });
        } catch {
          // Read-only cookie context (Server Component during render).
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          store.set({ name, value: '', ...options });
        } catch {
          // Read-only cookie context.
        }
      },
    },
  });
}
