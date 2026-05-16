import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import { getMatchingSuppliersByCategories } from '../../lib/queries';
import { COMMON_FR_CATEGORIES } from '../../lib/mileva';
import DashboardClient from '../../components/DashboardClient';
import type { Profile } from '../../types';

export const dynamic = 'force-dynamic';

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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;
  const userLat = profile?.lat ?? FALLBACK_LAT;
  const userLng = profile?.lng ?? FALLBACK_LNG;

  const suppliersByCategory = await getMatchingSuppliersByCategories(
    COMMON_FR_CATEGORIES,
    userLat,
    userLng,
  );

  return (
    <DashboardClient
      suppliersByCategory={suppliersByCategory}
      profile={profile}
    />
  );
}
