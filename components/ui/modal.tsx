'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-text-primary/25 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className={cn('w-full max-w-[480px] animate-fade-in rounded-2xl border border-border-default bg-white p-6 shadow-level-3', className)} onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-md text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2" aria-label="Fermer">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
