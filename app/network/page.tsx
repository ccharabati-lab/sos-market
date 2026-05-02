import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import NetworkClient from './NetworkClient';
import type { Listing, Profile } from '../../types';

export const dynamic = 'force-dynamic';

export default async function NetworkPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const [{ data: profileData }, { data: listingsData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('listings')
      .select('*, profiles!inner(*)')
      .order('created_at', { ascending: false })
      .limit(60),
  ]);

  const profile = (profileData ?? null) as Profile | null;
  const rows = (listingsData ?? []) as unknown as Array<Listing & { profiles: Profile }>;

  return <NetworkClient profile={profile} rows={rows} />;
}
