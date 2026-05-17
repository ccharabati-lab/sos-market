'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ToastNotification } from './feedback';

type Tone = 'success' | 'error' | 'info';

type ToastInput = {
  tone?: Tone;
  title: string;
  message?: string;
  durationMs?: number;
};

type ActiveToast = ToastInput & { id: number };

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const timerRef = useRef<number | null>(null);
  const counterRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    counterRef.current += 1;
    const next: ActiveToast = { id: counterRef.current, tone: 'info', ...input };
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    setToast(next);
    timerRef.current = window.setTimeout(() => {
      setToast((current) => (current && current.id === next.id ? null : current));
      timerRef.current = null;
    }, input.durationMs ?? 4000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastNotification
          key={toast.id}
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onClose={dismiss}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {
        if (typeof window !== 'undefined') {
          console.warn('useToast called outside ToastProvider — toast suppressed.');
        }
      },
    };
  }
  return ctx;
}
