'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const baseButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all duration-180 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function PrimaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(baseButton, 'bg-green text-white shadow-level-1 hover:-translate-y-px hover:bg-[#0f4a32] hover:shadow-level-2', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(baseButton, 'border border-green bg-white text-green hover:-translate-y-px hover:border-green-dark hover:bg-[#f0f8f3] hover:text-green-dark', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(baseButton, 'bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary', className)}
      {...props}
    >
      {children}
    </button>
  );
}
