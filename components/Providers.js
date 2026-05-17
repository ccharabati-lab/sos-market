'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContactModalProvider } from './ContactModalProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import ContactModal from './ContactModal';
import { ToastProvider } from './ui/toast-provider';

export default function Providers({ children }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/auth') ?? false;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('sos-sidebar-collapsed');
    const prefersCompact = window.matchMedia('(max-width: 1279px)').matches;
    setSidebarCollapsed(stored ? stored === 'true' : prefersCompact);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(event) {
      if (event.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('sos-sidebar-collapsed', String(next));
      return next;
    });
  }

  const openMobileNav = useCallback(() => setMobileOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  if (bare) {
    return (
      <ToastProvider>
        <ContactModalProvider>
          <div className="flex-1 min-h-screen flex items-center justify-center px-4">
            {children}
          </div>
          <ContactModal />
        </ContactModalProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ContactModalProvider>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobileNav}
        />
        <main
          className={`min-h-screen flex-1 flex flex-col transition-[margin] duration-180 ease-out ${
            sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'
          }`}
        >
          <Header onOpenMobileNav={openMobileNav} />
          <div className="flex-1 w-full px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        <ContactModal />
      </ContactModalProvider>
    </ToastProvider>
  );
}
