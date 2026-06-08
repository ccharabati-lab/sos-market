'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { cn } from './utils';

export type Severity = 'critical' | 'warning' | 'info';

export const severityMeta: Record<Severity, {
  label: string;
  shortLabel: string;
  icon: typeof AlertTriangle;
  badgeClass: string;
  panelClass: string;
  borderClass: string;
  textClass: string;
}> = {
  critical: {
    label: 'Critique',
    shortLabel: 'Critique',
    icon: AlertTriangle,
    badgeClass: 'border-critical/25 bg-critical-bg text-critical',
    panelClass: 'bg-critical-bg text-critical',
    borderClass: 'border-critical/35',
    textClass: 'text-critical',
  },
  warning: {
    label: 'Avertissement',
    shortLabel: 'Avert.',
    icon: AlertTriangle,
    badgeClass: 'border-warning/25 bg-warning-bg text-warning',
    panelClass: 'bg-warning-bg text-warning',
    borderClass: 'border-warning/35',
    textClass: 'text-warning',
  },
  info: {
    label: 'Information',
    shortLabel: 'Info',
    icon: Info,
    badgeClass: 'border-info/25 bg-info-bg text-info',
    panelClass: 'bg-info-bg text-info',
    borderClass: 'border-info/35',
    textClass: 'text-info',
  },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const meta = severityMeta[severity];

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-caption font-semibold uppercase tracking-[0.08em]', meta.badgeClass, className)}>
      {meta.label}
    </span>
  );
}

export function CategoryPill({
  children,
  active = false,
  clickable = false,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  clickable?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-180 ease-out',
        active ? 'border-green bg-green-soft text-green' : 'border-border-default bg-bg-subtle text-text-secondary',
        clickable && 'cursor-pointer hover:border-green hover:bg-green-soft hover:text-green',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusPill({
  label,
  active = true,
  className,
}: {
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border border-green/20 bg-green-soft px-3 py-1.5 text-xs font-semibold text-green', className)}>
      <span className={cn('h-2 w-2 rounded-full bg-green-bright', active && 'animate-status-pulse')} aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatePill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'success' | 'warning' | 'neutral' }) {
  const toneClass = {
    success: 'border-green/20 bg-green-soft text-green',
    warning: 'border-warning/20 bg-warning-bg text-warning',
    neutral: 'border-border-default bg-bg-muted text-text-muted',
  }[tone];

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', toneClass)}>
      {tone === 'success' && <CheckCircle2 size={12} aria-hidden="true" />}
      {tone === 'warning' && <AlertTriangle size={12} aria-hidden="true" />}
      {tone === 'neutral' && <ShieldCheck size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
