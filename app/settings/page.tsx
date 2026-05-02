import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import SettingsClient from './SettingsClient';
import type { Profile } from '../../types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
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

  const profile = (profileData ?? null) as Profile | null;

  return <SettingsClient profile={profile} email={user.email ?? null} />;
}
