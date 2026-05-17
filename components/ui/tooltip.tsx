'use client';

import type { ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 z-[80] ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-text-primary px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-level-2 transition-opacity delay-200 duration-180 group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
        <span className="absolute right-full top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-text-primary" aria-hidden="true" />
      </span>
    </span>
  );
}
