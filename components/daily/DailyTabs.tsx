'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

export type DailyTab = 'publish' | 'matches' | 'map';

export function DailyTabButton({
  id,
  active,
  icon: Icon,
  label,
  onClick,
}: {
  id: DailyTab;
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: (tab: DailyTab) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onClick(id)}
      className={cn(
        'inline-flex min-h-11 flex-shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-180 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2',
        active ? 'bg-green text-white shadow-level-1' : 'bg-white text-text-muted hover:bg-bg-muted hover:text-text-primary',
      )}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
