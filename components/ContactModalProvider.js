'use client';

import { createContext, useContext, useState } from 'react';

const ContactModalContext = createContext(null);

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error('useContactModal must be used within ContactModalProvider');
  }
  return ctx;
}

export function ContactModalProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    supplier: '',
    stage: 'choose',
  });

  const value = {
    ...state,
    open: (supplier) => setState({ open: true, supplier, stage: 'choose' }),
    close: () => setState((s) => ({ ...s, open: false })),
    confirm: () => setState((s) => ({ ...s, stage: 'sent' })),
  };

  return (
    <ContactModalContext.Provider value={value}>
      {children}
    </ContactModalContext.Provider>
  );
}
