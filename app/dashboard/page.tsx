import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import { getActiveCrises, getMatchingSuppliersByCategories } from '../../lib/queries';
import DashboardClient from '../../components/DashboardClient';
import type { Profile } from '../../types';

export const dynamic = 'force-dynamic';

// Fallback coordinates (Île-de-France centre) used when the user's profile has no geocoordinates.
const FALLBACK_LAT = 48.6833;
const FALLBACK_LNG = 2.1333;

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const [crises, { data: profileData }] = await Promise.all([
    getActiveCrises(),
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
  ]);

  const profile = profileData as Profile | null;
  const userLat = profile?.lat ?? FALLBACK_LAT;
  const userLng = profile?.lng ?? FALLBACK_LNG;

  const allCategories = [...new Set(crises.flatMap((c) => c.affected_categories))];
  const suppliersByCategory = await getMatchingSuppliersByCategories(allCategories, userLat, userLng);

  return (
    <DashboardClient
      crises={crises}
      suppliersByCategory={suppliersByCategory}
      profile={profile}
    />
  );
}
