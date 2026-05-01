import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import { getActiveCrises, getMatchingSuppliers } from '../../lib/queries';
import DashboardClient from '../../components/DashboardClient';
import type { Profile } from '../../types';

export const dynamic = 'force-dynamic';

// Intermarché Gif-sur-Yvette — used as the "you" coordinate for distance ranking.
const STORE_LAT = 48.6833;
const STORE_LNG = 2.1333;

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const [crises, suppliers] = await Promise.all([
    getActiveCrises(),
    getMatchingSuppliers('eau', STORE_LAT, STORE_LNG),
  ]);

  return (
    <DashboardClient
      crises={crises}
      suppliers={suppliers}
      profile={profile as Profile | null}
    />
  );
}
