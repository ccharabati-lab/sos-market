'use client';

import { usePathname } from 'next/navigation';
import { ContactModalProvider } from './ContactModalProvider';
import Sidebar from './Sidebar';
import Header from './Header';
import TabsBar from './TabsBar';
import ContactModal from './ContactModal';

export default function Providers({ children }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/auth') ?? false;

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
      <Sidebar />
      <main className="ml-[72px] flex-1 flex flex-col">
        <Header />
        <TabsBar />
        <div className="p-8 flex-1 max-w-content w-full">{children}</div>
      </main>
      <ContactModal />
    </ContactModalProvider>
  );
}
