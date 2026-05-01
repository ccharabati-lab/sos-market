import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local',
  );
}

/**
 * Browser-side Supabase client. Stores the auth session in cookies via
 * `@supabase/ssr` so server components can read the same session through
 * `next/headers` cookies.
 *
 * Use only inside `'use client'` files. Server components / Route Handlers
 * / Server Actions must use `createServerSupabase()` from `lib/supabase-server.ts`.
 */
export const supabaseBrowser = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey,
);
