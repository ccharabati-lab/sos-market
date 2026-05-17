'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, PackageOpen, X } from 'lucide-react';
import { cn } from './utils';

export function SkeletonLoader({ className }: { className?: string }) {
  return <div className={cn('animate-skeleton rounded-xl bg-bg-muted', className)} aria-hidden="true" />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border-default bg-bg-subtle p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border-default bg-white text-text-muted">
        <PackageOpen size={22} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ToastNotification({
  tone = 'info',
  title,
  message,
  onClose,
}: {
  tone?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;
  const toneClass = {
    success: 'border-green/25 bg-green-soft text-green',
    error: 'border-critical/25 bg-critical-bg text-critical',
    info: 'border-info/25 bg-info-bg text-info',
  }[tone];

  return (
    <div className={cn('fixed right-6 top-20 z-[90] flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-level-3', toneClass)} role="status" aria-live="polite">
      <Icon size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {message && <div className="mt-1 text-sm leading-5 text-text-secondary">{message}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="rounded-md p-1 transition-all duration-180 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2" aria-label="Fermer la notification">
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 text-sm text-critical" role="alert">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
