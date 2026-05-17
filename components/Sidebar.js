'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Bell,
  LayoutDashboard,
  Map,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import { NavItem } from './ui/nav-item';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard#alerts', icon: Bell, label: 'Alertes', badge: 1 },
  { href: '/daily', icon: Package, label: 'Stock quotidien' },
  { href: '/network', icon: Map, label: 'Carte réseau' },
  { href: '/reports', icon: BarChart2, label: 'Rapports' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const isActive = (href) =>
    pathname === href.split('#')[0] || (href === '/dashboard' && pathname === '/');

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 bottom-0 z-50 flex-col border-r border-border-default bg-white px-3 py-4 shadow-level-1 transition-[width] duration-180 ease-out ${
        collapsed ? 'w-[68px] items-center' : 'w-[240px]'
      }`}
      aria-label="Navigation principale"
    >
      <div className={`mb-6 flex min-h-12 items-center ${collapsed ? 'justify-center' : 'justify-between gap-3'}`}>
        <Link href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2" aria-label="SOS-Market">
          <Image
            src={collapsed ? '/logo/sos-market-monogram.svg' : '/logo/sos-market-shield-wordmark.svg'}
            alt="SOS-Market"
            width={collapsed ? 40 : 176}
            height={collapsed ? 40 : 45}
            priority
          />
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            aria-label="Réduire la barre latérale"
          >
            <PanelLeftClose size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mb-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          aria-label="Ouvrir la barre latérale"
        >
          <PanelLeftOpen size={18} aria-hidden="true" />
        </button>
      )}

      <nav className={`flex flex-col gap-1.5 ${collapsed ? 'items-center' : ''}`}>
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActive(item.href)}
            collapsed={collapsed}
            badge={item.badge}
          />
        ))}
      </nav>

      <div className={`mt-auto flex flex-col gap-3 ${collapsed ? 'items-center' : ''}`}>
        <NavItem
          href="/settings"
          icon={Settings}
          label="Paramètres"
          active={pathname === '/settings'}
          collapsed={collapsed}
        />
        <div
          title="Intermarché — Gif-sur-Yvette · Pierre Martin"
          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border-default bg-bg-subtle p-2 text-left transition-all duration-180 hover:border-border-emphasized hover:bg-bg-muted focus-within:ring-2 focus-within:ring-green focus-within:ring-offset-2 ${
            collapsed ? 'w-11 justify-center' : 'w-full'
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-green/20 bg-green-soft text-sm font-bold text-green">
            GY
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-text-primary">Intermarché Gif</div>
              <div className="truncate text-xs text-text-muted">Pierre Martin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
