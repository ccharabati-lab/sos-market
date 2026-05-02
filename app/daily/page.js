import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import ExchangeWorkspace from '../../components/ExchangeWorkspace';
import MesSignaux from '../../components/MesSignaux';

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
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Gestion des stocks quotidienne
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          {activeCount === 0
            ? 'Publiez vos surplus et besoins pour que le réseau les voie en temps réel.'
            : `${activeCount} signal${activeCount > 1 ? 'aux' : ''} actif${activeCount > 1 ? 's' : ''} dans votre réseau · Mis à jour à l'instant`}
        </p>
      </div>

      <div className="mb-6">
        <ExchangeWorkspace userId={user.id} profile={profile} />
      </div>

      <MesSignaux listings={listings} />
    </>
  );
}
