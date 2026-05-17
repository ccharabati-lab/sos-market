'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './utils';

export const fieldClass =
  'min-h-11 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm text-text-primary transition-all duration-180 ease-out placeholder:text-text-disabled focus:border-green focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-bg-muted disabled:text-text-disabled';

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm font-semibold text-text-secondary">{children}</span>;
}

export function SearchInput({
  value,
  onClear,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  value?: string;
  onClear?: () => void;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      <input value={value} className={cn(fieldClass, 'pl-9 pr-9')} {...props} />
      {value && onClear && (
        <button type="button" onClick={onClear} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-all duration-180 hover:bg-bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2" aria-label="Effacer la recherche">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
