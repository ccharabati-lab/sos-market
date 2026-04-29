'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ArrowLeftRight } from 'lucide-react';

const tabs = [
  { href: '/dashboard', icon: Zap,            label: 'Alertes Crises',     count: 2 },
  { href: '/daily',     icon: ArrowLeftRight, label: 'Gestion Quotidienne', count: 5 },
];

export default function TabsBar() {
  const pathname = usePathname();
  return (
    <div className="bg-paper border-b border-line px-8 flex">
      {tabs.map(({ href, icon: Icon, label, count }) => {
        const active =
          pathname === href || (href === '/dashboard' && pathname === '/');
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 py-[0.9rem] px-5 text-[0.84rem] font-semibold cursor-pointer border-b-2 -mb-px transition-colors whitespace-nowrap ${
              active
                ? 'text-green border-green'
                : 'text-muted hover:text-ink-soft border-transparent'
            }`}
          >
            <Icon size={14} />
            {label}
            <span
              className={`text-[0.66rem] font-bold py-[0.1rem] px-[0.42rem] rounded-full border ${
                active
                  ? 'bg-green-light text-green border-green-mid'
                  : 'bg-red-light text-red border-red-mid'
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
