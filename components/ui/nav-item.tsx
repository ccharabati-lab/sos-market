'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from './utils';
import { Tooltip } from './tooltip';

export function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: number | boolean;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        'relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-180 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2',
        collapsed ? 'w-11 justify-center px-0' : 'w-full',
        active ? 'bg-green-soft text-green' : 'text-text-muted hover:bg-bg-muted hover:text-text-primary',
      )}
      aria-label={collapsed ? label : undefined}
    >
      <Icon size={18} aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
      {badge && (
        <span className={cn('ml-auto rounded-full bg-critical px-1.5 text-[10px] font-bold leading-5 text-white', collapsed && 'absolute right-1 top-1 min-w-5 text-center')}>
          {typeof badge === 'number' ? badge : ''}
        </span>
      )}
    </Link>
  );

  return collapsed ? <Tooltip label={label}>{content}</Tooltip> : content;
}
