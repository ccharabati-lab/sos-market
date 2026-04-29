'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, ArrowLeftRight, Map, BarChart2, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Zap,            label: 'Crises' },
  { href: '/daily',     icon: ArrowLeftRight, label: 'Stocks quotidiens', badge: true },
  { href: '#',          icon: Map,            label: 'Carte réseau' },
  { href: '#',          icon: BarChart2,      label: 'Rapports' },
];

function NavIcon({ href, Icon, label, active, badge }) {
  return (
    <Link
      href={href}
      className={`group w-11 h-11 rounded-[10px] flex items-center justify-center cursor-pointer relative transition-colors ${
        active
          ? 'bg-green-light text-green'
          : 'text-muted hover:bg-canvas-soft hover:text-ink-soft'
      }`}
    >
      <Icon size={18} />
      {badge && (
        <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-red border-[1.5px] border-white" />
      )}
      <span className="absolute left-[calc(100%+10px)] bg-ink text-white rounded-md py-[0.3rem] px-2.5 text-[0.72rem] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[99]">
        {label}
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href) =>
    href !== '#' && (pathname === href || (href === '/dashboard' && pathname === '/'));

  return (
    <aside className="w-[72px] bg-paper border-r border-line flex flex-col items-center py-5 gap-[0.2rem] fixed top-0 left-0 bottom-0 z-50">
      <div className="text-[0.78rem] font-extrabold text-green tracking-wider mb-6 text-center leading-tight">
        SOS
        <span className="block text-[0.52rem] text-muted font-medium tracking-[0.1em]">
          Market
        </span>
      </div>

      {navItems.map((item) => (
        <NavIcon
          key={item.label}
          href={item.href}
          Icon={item.icon}
          label={item.label}
          active={isActive(item.href)}
          badge={item.badge}
        />
      ))}

      <div className="mt-auto flex flex-col items-center gap-[0.3rem]">
        <div className="group w-11 h-11 rounded-[10px] flex items-center justify-center cursor-pointer relative transition-colors text-muted hover:bg-canvas-soft hover:text-ink-soft">
          <Settings size={18} />
          <span className="absolute left-[calc(100%+10px)] bg-ink text-white rounded-md py-[0.3rem] px-2.5 text-[0.72rem] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[99]">
            Paramètres
          </span>
        </div>
        <div
          title="Gérant Gif-sur-Yvette"
          className="w-9 h-9 rounded-full bg-green-light text-green flex items-center justify-center text-[0.78rem] font-bold cursor-pointer border-[1.5px] border-green-mid"
        >
          GY
        </div>
      </div>
    </aside>
  );
}
