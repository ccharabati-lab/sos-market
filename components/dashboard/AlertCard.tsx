'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { humanizeCategory } from '../../lib/mileva';
import type { Severity } from '../ui/badges';
import { cn } from '../ui/utils';

type AlertSource = {
  name: string;
  url: string;
  type?: string;
  priority?: string;
};

type DashboardAlert = {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  full_description?: string;
  affectedCategories?: string[];
  sources?: AlertSource[];
};

const severityStyles: Record<Severity, {
  card: string;
}> = {
  critical: {
    card: 'border-critical bg-critical-bg',
  },
  warning: {
    card: 'border-warning bg-warning-bg',
  },
  info: {
    card: 'border-info bg-info-bg',
  },
};

function sourceLine(alert: DashboardAlert) {
  const names = (alert.sources ?? []).map((source) => source.name).filter(Boolean);
  return names.length > 0 ? names.join(' · ') : 'Mileva';
}

function briefDescription(alert: DashboardAlert) {
  const text = alert.full_description || alert.description;
  if (text.length <= 180) return text;
  return `${text.slice(0, 177).trim()}...`;
}

function categoryChips(alert: DashboardAlert) {
  const categories = (alert.affectedCategories ?? []).filter(Boolean);
  const visible = categories.slice(0, 4);
  const hiddenCount = categories.length - visible.length;
  return {
    visible: visible.map((category) => humanizeCategory(category)),
    hiddenCount,
  };
}

export default function AlertCard({ alert }: { alert: DashboardAlert }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const style = severityStyles[alert.severity] ?? severityStyles.warning;
  const chips = categoryChips(alert);

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border-2 shadow-level-1 transition-all duration-180',
        style.card,
      )}
    >
      <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className={cn(
            '-m-2 cursor-pointer rounded-lg p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2',
            'hover:bg-white/45',
          )}
        >
          <h2 className="text-lg font-semibold leading-6 text-text-primary">{alert.title}</h2>
          {chips.visible.length > 0 && (
            <div
              className="mt-2 flex max-w-full flex-nowrap gap-1.5 overflow-hidden"
              aria-label="Produits concernés"
            >
              {chips.visible.map((category) => (
                <span
                  key={category}
                  className="inline-block max-w-36 shrink-0 truncate rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium leading-5 text-gray-600"
                >
                  {category}
                </span>
              ))}
              {chips.hiddenCount > 0 && (
                <span className="inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium leading-5 text-gray-600">
                  +{chips.hiddenCount}
                </span>
              )}
            </div>
          )}
          <p className="mt-1 text-sm leading-5 text-text-secondary">{alert.description}</p>
        </button>

        <Link
          href={`/network?alert=${encodeURIComponent(alert.id)}`}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-green px-4 text-sm font-semibold text-white transition-colors hover:bg-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
        >
          Solution
        </Link>
      </div>

      {expanded && (
        <div
          id={panelId}
          className="grid gap-4 border-t border-current/15 bg-white/70 p-4 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
              Détails & sources
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {briefDescription(alert)} Sources&nbsp;: {sourceLine(alert)}.
            </p>
          </div>

          <Link
            href={`/reports#alert-${encodeURIComponent(alert.id)}`}
            className="inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-white hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          >
            Plus d&apos;infos
          </Link>
        </div>
      )}
    </article>
  );
}
