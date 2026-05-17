'use client';

import { Bell } from 'lucide-react';
import SignOutButton from './SignOutButton';
import { StatusPill } from './ui/badges';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Header() {
  const currentDate = dateFmt.format(new Date());

  return (
    <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-border-default bg-white px-4 md:px-8">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="truncate text-sm font-bold text-text-primary md:text-[0.95rem]">
          Intermarché — Gif-sur-Yvette
        </div>
        <div className="hidden truncate text-xs text-text-muted sm:block">
          Gérant : Pierre Martin · 3 rue de la Vallée, 91190
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusPill label="Surveillance active" />
        <span className="hidden text-sm font-medium text-text-muted lg:inline">
          {currentDate}
        </span>
        <button
          type="button"
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          aria-label="Ouvrir les notifications"
        >
          <Bell size={18} aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-critical ring-2 ring-white" aria-hidden="true" />
        </button>
        <SignOutButton />
      </div>
    </header>
  );
}
