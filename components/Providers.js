'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ContactModalProvider } from './ContactModalProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import ContactModal from './ContactModal';

export default function Providers({ children }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/auth') ?? false;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('sos-sidebar-collapsed');
    const prefersCompact = window.matchMedia('(max-width: 1279px)').matches;
    setSidebarCollapsed(stored ? stored === 'true' : prefersCompact);
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('sos-sidebar-collapsed', String(next));
      return next;
    });
  }

  if (bare) {
    return (
      <ContactModalProvider>
        <div className="flex-1 min-h-screen flex items-center justify-center px-4">
          {children}
        </div>
        <ContactModal />
      </ContactModalProvider>
    );
  }

  return (
    <ContactModalProvider>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main
        className={`min-h-screen flex-1 flex flex-col transition-[margin] duration-180 ease-out ${
          sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'
        }`}
      >
        <Header />
        <div className="flex-1 w-full px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
      <ContactModal />
    </ContactModalProvider>
  );
}
