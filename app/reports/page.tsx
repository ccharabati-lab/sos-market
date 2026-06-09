'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchAlerts,
  fetchLocalSignals,
  fetchScenarios,
  humanizeCategory,
  type CrisisAlert,
  type LocalSignal,
  type Scenario,
} from '../../lib/mileva';
import { DEMO_CRISIS_ALERTS } from '../../lib/demo-data';
import { SeverityBadge, type Severity } from '../../components/ui/badges';
import { SkeletonLoader } from '../../components/ui/feedback';

const fullDateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const severityRank: Record<CrisisAlert['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

type RichLocalSignal = LocalSignal & {
  impact_pathway?: string;
  impact_level?: string;
  time_to_retail_effect?: string;
  reliability?: string;
  why_kept?: string;
};

function sortAlerts(alerts: CrisisAlert[]) {
  return [...alerts].sort(
    (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
  );
}

function formatDate(value?: string) {
  if (!value) return 'date non précisée';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date non précisée';
  return fullDateFmt.format(date);
}

function sourceNames(alert: CrisisAlert) {
  const names = alert.sources.map((source) => source.name).filter(Boolean);
  return names.length > 0 ? names.join(' · ') : 'Mileva';
}

function whyText(alert: CrisisAlert) {
  if (alert.evidence) return alert.evidence;
  if (alert.matchingNotes) return alert.matchingNotes;

  const categories = alert.affectedCategories.map(humanizeCategory).join(', ');
  const confidence = Math.round(alert.confidence * 100);
  const categoryText = categories || 'plusieurs catégories sensibles';

  return `Mileva signale une exposition sur ${categoryText}, avec une confiance estimée à ${confidence} %.`;
}

function humanizeHorizon(value: string): string {
  const labels: Record<string, string> = {
    court_terme: 'Court terme',
    moyen_terme: 'Moyen terme',
    long_terme: 'Long terme',
    '1_3_mois': '1 à 3 mois',
  };
  return labels[value] ?? value.replace(/_/g, ' ');
}

export default function ReportsPage() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [signals, setSignals] = useState<LocalSignal[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    Promise.allSettled([
      fetchAlerts(),
      fetchLocalSignals(),
      fetchScenarios(),
    ]).then(([alertsRes, signalsRes, scenariosRes]) => {
      if (cancelled) return;

      if (alertsRes.status === 'fulfilled' && alertsRes.value.length > 0) {
        setAlerts(alertsRes.value);
      } else {
        setAlerts(DEMO_CRISIS_ALERTS);
        if (alertsRes.status === 'rejected') setFetchError(true);
      }

      setSignals(signalsRes.status === 'fulfilled' ? signalsRes.value : []);
      setScenarios(scenariosRes.status === 'fulfilled' ? scenariosRes.value : []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const orderedAlerts = useMemo(() => sortAlerts(alerts), [alerts]);
  const topScenarios = scenarios.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-dashboard">
      <div className="mb-8">
        <h1 className="font-display text-display text-text-primary">Vos prévisions</h1>
        <p className="mt-2 text-body-lg text-text-muted">Le point du jour</p>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-text-secondary">
          Impossible de charger les alertes Mileva. Données de démonstration affichées.
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          <SkeletonLoader className="h-48" />
          <SkeletonLoader className="h-48" />
        </div>
      ) : (
        <div className="grid gap-10">
          <section className="grid gap-4">
            {orderedAlerts.map((alert) => (
              <AlertForecastEntry key={alert.id} alert={alert} />
            ))}
          </section>

          {signals.length > 0 && (
            <section>
              <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
                Signaux locaux — axe Paris-Saclay
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {signals.slice(0, 3).map((signal, index) => (
                  <LocalSignalCard key={`${signal.title}-${index}`} signal={signal} />
                ))}
              </div>
            </section>
          )}

          {topScenarios.length > 0 && (
            <section>
              <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
                Scénarios à anticiper — prospective Mileva
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {topScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

function AlertForecastEntry({ alert }: { alert: CrisisAlert }) {
  return (
    <article
      id={`alert-${alert.id}`}
      className="scroll-mt-24 rounded-xl border border-border-default bg-white p-5 shadow-level-1"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <SeverityBadge severity={alert.severity as Severity} className="mb-3" />
          <h2 className="text-h2 text-text-primary">{alert.title}</h2>
        </div>
        <div className="rounded-full border border-border-default bg-bg-subtle px-3 py-1 text-xs font-semibold text-text-muted">
          {alert.region || 'Zone à préciser'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ForecastBlock title="Ce qui se passe">
          {alert.description}
        </ForecastBlock>
        <ForecastBlock title="Pourquoi">
          {whyText(alert)}
        </ForecastBlock>
        <ForecastBlock title="Sources">
          {sourceNames(alert)} · {formatDate(alert.detectedAt)}
        </ForecastBlock>
      </div>
    </article>
  );
}

function ForecastBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="rounded-lg bg-bg-subtle p-4">
      <h3 className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{children}</p>
    </section>
  );
}

function LocalSignalCard({ signal }: { signal: LocalSignal }) {
  const richSignal = signal as RichLocalSignal;
  const products = (signal.impacted_products ?? []).map((product) => product.product);

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-white p-4 shadow-level-1">
      <div>
        <h3 className="text-sm font-semibold leading-snug text-text-primary">{signal.title}</h3>
        <p className="mt-1 text-xs text-text-muted">
          {signal.zone ?? 'Zone locale'} · {signal.category ?? 'signal local'}
        </p>
      </div>

      {products.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {products.map((product) => (
            <span
              key={product}
              className="rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary"
            >
              {product}
            </span>
          ))}
        </div>
      )}

      {richSignal.impact_pathway && (
        <p className="text-sm leading-5 text-text-secondary">{richSignal.impact_pathway}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
        {richSignal.impact_level && <span>Niveau&nbsp;: {richSignal.impact_level}</span>}
        {richSignal.reliability && <span>Fiabilité&nbsp;: {richSignal.reliability}</span>}
        {richSignal.time_to_retail_effect && (
          <span>Effet rayon&nbsp;: {richSignal.time_to_retail_effect}</span>
        )}
        {signal.date_publication && <span>Date&nbsp;: {formatDate(signal.date_publication)}</span>}
      </div>

      {richSignal.why_kept && (
        <p className="rounded-lg bg-bg-subtle p-3 text-xs leading-5 text-text-muted">
          {richSignal.why_kept}
        </p>
      )}

      <div className="mt-auto pt-1 text-xs text-text-muted">
        Source&nbsp;: {signal.source_name ?? 'source inconnue'}
      </div>
    </article>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-white p-4 shadow-level-1">
      <div>
        <h3 className="font-semibold leading-snug text-text-primary">{scenario.title}</h3>
        <p className="mt-1 text-xs text-text-muted">
          Probabilité {scenario.probability} · Sévérité {scenario.severity} · {humanizeHorizon(scenario.timeHorizon)}
        </p>
      </div>

      <p className="text-sm leading-6 text-text-secondary">{scenario.supplyChainPathway}</p>

      <div className="flex flex-wrap gap-1.5">
        {scenario.affectedProducts.slice(0, 5).map((slug) => (
          <span
            key={slug}
            className="rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {humanizeCategory(slug)}
          </span>
        ))}
      </div>

      <div className="mt-auto border-t border-border-default pt-3">
        <h4 className="mb-2 text-caption font-semibold uppercase tracking-[0.08em] text-green">
          À surveiller
        </h4>
        <p className="text-sm text-text-secondary">
          {scenario.earlyWarningIndicators.join(' · ')}
        </p>
        {scenario.retailerActions.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {scenario.retailerActions.map((action) => (
              <li key={action} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-[0.45rem] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-green" />
                {action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
