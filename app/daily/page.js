import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import { stockStatus, networkSignals } from '../../data/demo';
import StockStatusCard from '../../components/StockStatusCard';
import NetworkFeed from '../../components/NetworkFeed';
import NetworkMap from '../../components/NetworkMap';
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Gestion des stocks quotidienne
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          5 opportunités d&apos;échange identifiées dans votre réseau · Mis à jour il y a 12 min
        </p>
      </div>

      <ExchangeWorkspace userId={user.id} profile={profile} />

      <div className="grid grid-cols-2 gap-5 mb-8">
        <StockStatusCard items={stockStatus} />
        <NetworkFeed signals={networkSignals} />
      </div>

      <NetworkMap signals={networkSignals} />
    </>
  );
}
