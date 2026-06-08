'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Bell,
  LayoutDashboard,
  LogOut,
  Map,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Store,
  X,
} from 'lucide-react';
import { NavItem } from './ui/nav-item';
import { supabaseBrowser } from '../lib/supabase-browser';
import { useToast } from './ui/toast-provider';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard#alerts', icon: Bell, label: 'Alertes', badge: 1 },
  { href: '/daily', icon: Package, label: 'Stock quotidien' },
  { href: '/network', icon: Map, label: 'Carte réseau' },
  { href: '/reports', icon: BarChart2, label: 'Prévisions' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  const avatarRef = useRef(null);

  const isActive = (href) =>
    pathname === href.split('#')[0] || (href === '/dashboard' && pathname === '/');

  useEffect(() => {
    if (!popoverOpen) return;
    function onClick(event) {
      if (
        popoverRef.current?.contains(event.target) ||
        avatarRef.current?.contains(event.target)
      ) {
        return;
      }
      setPopoverOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setPopoverOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [popoverOpen]);

  async function handleSignOut() {
    setPopoverOpen(false);
    await supabaseBrowser.auth.signOut();
    router.replace('/auth/signin');
    router.refresh();
  }

  function handleSwitchStore() {
    setPopoverOpen(false);
    showToast({
      tone: 'info',
      title: 'Changement de magasin',
      message: 'Disponible prochainement pour les comptes multi-sites.',
    });
  }

  const isMobile = mobileOpen;
  const baseSidebarClass =
    'flex fixed left-0 top-0 bottom-0 z-50 flex-col border-r border-border-default bg-white px-3 py-4 shadow-level-1 transition-transform duration-180 ease-out w-[260px]';
  const desktopWidth = collapsed ? 'md:w-[68px] md:items-center' : 'md:w-[240px]';
  const transformClass = isMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-ink/40 md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`${baseSidebarClass} ${desktopWidth} ${transformClass}`}
        aria-label="Navigation principale"
      >
        <div
          className={`mb-6 flex min-h-12 items-center ${
            collapsed && !isMobile ? 'md:justify-center' : 'justify-between gap-3'
          }`}
        >
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            aria-label="SOS-Market"
            onClick={onMobileClose}
          >
            <Image
              src={collapsed && !isMobile ? '/logo/sos-market-monogram.svg' : '/logo/sos-market-shield-wordmark.svg'}
              alt="SOS-Market"
              width={collapsed && !isMobile ? 40 : 176}
              height={collapsed && !isMobile ? 40 : 45}
              priority
            />
          </Link>
          {isMobile ? (
            <button
              type="button"
              onClick={onMobileClose}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 md:hidden"
              aria-label="Fermer le menu"
            >
              <X size={18} aria-hidden="true" />
            </button>
          ) : !collapsed ? (
            <button
              type="button"
              onClick={onToggle}
              className="hidden md:flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
              aria-label="Réduire la barre latérale"
            >
              <PanelLeftClose size={18} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {collapsed && !isMobile && (
          <button
            type="button"
            onClick={onToggle}
            className="hidden md:flex mb-4 h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            aria-label="Ouvrir la barre latérale"
          >
            <PanelLeftOpen size={18} aria-hidden="true" />
          </button>
        )}

        <nav className={`flex flex-col gap-1.5 ${collapsed && !isMobile ? 'md:items-center' : ''}`}>
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              collapsed={collapsed && !isMobile}
              badge={item.badge}
              onClick={onMobileClose}
            />
          ))}
        </nav>

        <div className={`relative mt-auto flex flex-col gap-3 ${collapsed && !isMobile ? 'md:items-center' : ''}`}>
          <NavItem
            href="/settings"
            icon={Settings}
            label="Paramètres"
            active={pathname === '/settings'}
            collapsed={collapsed && !isMobile}
            onClick={onMobileClose}
          />
          <button
            ref={avatarRef}
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={popoverOpen}
            title="Intermarché — Gif-sur-Yvette · Olivier"
            className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border-default bg-bg-subtle p-2 text-left transition-all duration-180 hover:border-border-emphasized hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
              collapsed && !isMobile ? 'md:w-11 md:justify-center w-full' : 'w-full'
            }`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-green/20 bg-green-soft text-sm font-bold text-green">
              GY
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-text-primary">Intermarché Gif</div>
                <div className="truncate text-xs text-text-muted">Olivier</div>
              </div>
            )}
          </button>

          {popoverOpen && (
            <div
              ref={popoverRef}
              role="menu"
              className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[240px] animate-fade-in rounded-xl border border-border-default bg-white p-3 shadow-level-3"
            >
              <div className="rounded-lg bg-bg-subtle px-3 py-2">
                <div className="text-sm font-semibold text-text-primary">Intermarché Gif-sur-Yvette</div>
                <div className="text-xs text-text-muted">Olivier · Gérant</div>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSwitchStore}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-text-secondary transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
                >
                  <Store size={15} aria-hidden="true" />
                  Changer de magasin
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-critical transition-all duration-180 hover:bg-critical-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
