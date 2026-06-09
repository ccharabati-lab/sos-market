'use client';

import { useEffect, useState } from 'react';
import AlertCard from './dashboard/AlertCard';
import { SkeletonLoader } from './ui/feedback';
import { shiftDemoDate } from './ui/utils';
import {
  fetchAlerts,
  type CrisisAlert as MilevaAlert,
} from '../lib/mileva';
import { DEMO_CRISIS_ALERTS } from '../lib/demo-data';

const severityRank: Record<string, number> = { critical: 0, warning: 1, info: 2 };

function humanizeRegionLevel(level: string): string {
  if (level === 'international') return 'International';
  if (level === 'national') return 'National';
  if (level === 'local') return 'Local';
  return level;
}

function impactLabel(value?: string) {
  if (!value) return 'impact à confirmer';
  const shifted = shiftDemoDate(value) ?? value;
  const target = new Date(shifted);
  if (Number.isNaN(target.getTime())) return 'impact à confirmer';

  const diffHours = Math.round((target.getTime() - Date.now()) / 36e5);
  if (diffHours >= 48) return `impact dans ${Math.round(diffHours / 24)} j`;
  if (diffHours >= 1) return `impact dans ${diffHours} h`;
  return 'signal actif';
}

function metaLine(alert: MilevaAlert) {
  const parts: string[] = [];
  if (alert.region) parts.push(alert.region);
  if (alert.regionLevel) parts.push(humanizeRegionLevel(alert.regionLevel));
  parts.push(impactLabel(alert.startTime));
  return parts.join(' · ');
}

function sortBySeverity(list: MilevaAlert[]) {
  return [...list].sort(
    (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
  );
}

function adaptAlert(alert: MilevaAlert) {
  return {
    id: alert.id,
    severity: alert.severity,
    title: alert.title,
    description: metaLine(alert),
    full_description: alert.description,
    sources: alert.sources,
  };
}

export default function DashboardClient() {
  const [alerts, setAlerts] = useState<MilevaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    fetchAlerts()
      .then((nextAlerts) => {
        if (cancelled) return;

        setAlerts(nextAlerts.length > 0 ? nextAlerts : DEMO_CRISIS_ALERTS);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;

        setAlerts(DEMO_CRISIS_ALERTS);
        setFetchError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const localAlerts = sortBySeverity(alerts.filter((alert) => alert.regionLevel === 'local'));
  const globalAlerts = sortBySeverity(alerts.filter((alert) => alert.regionLevel !== 'local'));

  const renderAlertCard = (alert: MilevaAlert) => (
    <AlertCard key={alert.id} alert={adaptAlert(alert)} />
  );

  return (
    <div className="mx-auto w-full max-w-dashboard">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-display text-text-primary">
          Bonjour Olivier, voici vos prévisions
        </h1>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-text-secondary">
          Impossible de charger les alertes Mileva. Données de démonstration affichées.
        </div>
      )}

      <section id="alerts" className="scroll-mt-24">
        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonLoader className="h-24" />
            <SkeletonLoader className="h-24" />
            <SkeletonLoader className="h-24" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {localAlerts.length > 0 && (
              <div>
                <p className="mb-3 text-sm lowercase text-text-muted">local</p>
                <div className="flex flex-col gap-4">
                  {localAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}
            {globalAlerts.length > 0 && (
              <div>
                <p className="mb-3 text-sm lowercase text-text-muted">global</p>
                <div className="flex flex-col gap-4">
                  {globalAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
