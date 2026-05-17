import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import ExchangeWorkspace from '../../components/ExchangeWorkspace';

export const dynamic = 'force-dynamic';

export default async function DailyPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const [{ data: profile }, { data: myListings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('listings')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const listings = myListings ?? [];
  const activeCount = listings.length;

  return (
    <ExchangeWorkspace
      userId={user.id}
      profile={profile}
      initialListings={listings}
      activeCount={activeCount}
    />
  );
}
