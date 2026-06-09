import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import DashboardClient from '../../components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <DashboardClient />;
}
