'use client';

import type { ReactNode } from 'react';
import { cn } from './utils';

export function SourceLink({
  name,
  url,
  type,
}: {
  name: string;
  url: string;
  type?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border-default bg-white px-3 py-2 text-sm text-text-secondary transition-all duration-180 hover:-translate-y-0.5 hover:border-green hover:bg-green-soft hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
    >
      <span className="min-w-0 truncate font-semibold">{name}</span>
      {type && (
        <span className="flex-shrink-0 rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-[11px] font-semibold text-text-muted">
          {type}
        </span>
      )}
    </a>
  );
}

export function ActionItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn('flex items-start gap-3 rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm leading-5 text-text-secondary', className)}>
      <span>{children}</span>
    </li>
  );
}
