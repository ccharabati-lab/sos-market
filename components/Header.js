'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bell, Info, Menu } from 'lucide-react';
import SignOutButton from './SignOutButton';
import { StatusPill } from './ui/badges';
import { fetchAlerts } from '../lib/mileva';
import { shiftDemoDate } from './ui/utils';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const severityStyles = {
  critical: { Icon: AlertTriangle, badge: 'bg-critical-bg text-critical' },
  warning: { Icon: AlertTriangle, badge: 'bg-warning-bg text-warning' },
  info: { Icon: Info, badge: 'bg-info-bg text-info' },
};

function relativeFromNow(iso) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  const abs = Math.abs(diff);
  const hours = Math.round(abs / 36e5);
  const days = Math.round(abs / 864e5);
  if (diff >= 0) {
    if (hours < 36) return `dans ${Math.max(1, hours)} h`;
    return `dans ${Math.max(1, days)} j`;
  }
  if (hours < 36) return `il y a ${Math.max(1, hours)} h`;
  return `il y a ${Math.max(1, days)} j`;
}

export default function Header({ onOpenMobileNav }) {
  const currentDate = dateFmt.format(new Date());
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts()
      .then((next) => {
        if (cancelled) return;
        setAlerts(next.slice(0, 3));
      })
      .catch(() => {
        if (cancelled) return;
        setAlerts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(event) {
      if (
        dropdownRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-border-default bg-white px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Ouvrir le menu"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 md:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate text-sm font-bold text-text-primary md:text-[0.95rem]">
            Intermarché — Gif-sur-Yvette
          </div>
          <div className="hidden truncate text-xs text-text-muted sm:block">
            Gérant : Pierre Martin · 3 rue de la Vallée, 91190
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusPill label="Surveillance active" />
        <span className="hidden text-sm font-medium text-text-muted lg:inline">
          {currentDate}
        </span>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
            aria-label="Ouvrir les notifications"
          >
            <Bell size={18} aria-hidden="true" />
            {criticalCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                {criticalCount}
              </span>
            )}
          </button>
          {open && (
            <div
              ref={dropdownRef}
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] animate-fade-in rounded-xl border border-border-default bg-white p-3 shadow-level-3"
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Alertes récentes
                </span>
                <Link
                  href="/dashboard#alerts"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-green hover:text-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 rounded"
                >
                  Tout voir
                </Link>
              </div>
              {alerts.length === 0 ? (
                <div className="rounded-lg bg-bg-subtle px-3 py-4 text-center text-sm text-text-muted">
                  Aucune alerte récente.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {alerts.map((alert) => {
                    const meta = severityStyles[alert.severity] || severityStyles.info;
                    const SeverityIcon = meta.Icon;
                    const shifted = shiftDemoDate(alert.startTime) ?? alert.startTime;
                    const rel = relativeFromNow(shifted);
                    return (
                      <Link
                        key={alert.id}
                        href="/dashboard#alerts"
                        onClick={() => setOpen(false)}
                        role="menuitem"
                        className="flex gap-3 rounded-lg p-2 transition-all duration-180 hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${meta.badge}`}>
                          <SeverityIcon size={15} aria-hidden="true" />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-text-primary">{alert.title}</span>
                          {rel && (
                            <span className="text-xs text-text-muted">{rel}</span>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <span className="hidden md:inline">
          <SignOutButton />
        </span>
      </div>
    </header>
  );
}
