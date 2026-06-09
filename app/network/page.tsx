import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabase-server';
import { DEMO_CRISIS_ALERTS } from '../../lib/demo-data';
import milevaAlertsFile from '../../public/data/global_supply_risks/global_supply_risk_alerts_20260513.json';
import NetworkClient from './NetworkClient';
import type { CrisisAlert, Listing, Profile } from '../../types';

export const dynamic = 'force-dynamic';

type NetworkPageProps = {
  searchParams?: {
    alert?: string | string[];
  };
};

type SolutionAlert = {
  id: string;
  title: string;
  affectedCategories: string[];
};

type RawMilevaAlert = {
  alert_id: string;
  title: string;
  affected_categories?: string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function demoAlertById(id: string): SolutionAlert | null {
  const alert = DEMO_CRISIS_ALERTS.find((item) => item.id === id);
  if (!alert) return null;

  return {
    id: alert.id,
    title: alert.title,
    affectedCategories: alert.affectedCategories,
  };
}

function milevaAlertById(id: string): SolutionAlert | null {
  const alerts = (milevaAlertsFile as { alerts?: RawMilevaAlert[] }).alerts ?? [];
  const alert = alerts.find((item) => item.alert_id === id);
  if (!alert) return null;

  return {
    id: alert.alert_id,
    title: alert.title,
    affectedCategories: alert.affected_categories ?? [],
  };
}

function dbAlertToSolution(alert: CrisisAlert | null): SolutionAlert | null {
  if (!alert) return null;

  return {
    id: alert.id,
    title: alert.title,
    affectedCategories: alert.affected_categories ?? [],
  };
}

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const supabase = createServerSupabase();
  const alertId = firstParam(searchParams?.alert);

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
  let solutionAlert: SolutionAlert | null = null;

  if (alertId) {
    if (isUuid(alertId)) {
      const { data: alertData } = await supabase
        .from('crisis_alerts')
        .select('*')
        .eq('id', alertId)
        .maybeSingle();

      solutionAlert = dbAlertToSolution((alertData ?? null) as CrisisAlert | null);
    }

    solutionAlert =
      solutionAlert ??
      milevaAlertById(alertId) ??
      demoAlertById(alertId) ?? {
        id: alertId,
        title: 'Alerte introuvable',
        affectedCategories: [],
      };
  }

  return (
    <NetworkClient
      userId={user.id}
      profile={profile}
      rows={rows}
      solutionAlert={solutionAlert}
    />
  );
}
