'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './utils';

function useAnimatedNumber(value: number, duration = 800) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return display;
}

export function NumberStatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  tone = 'green',
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  subLabel: string;
  tone?: 'critical' | 'warning' | 'green';
}) {
  const display = useAnimatedNumber(value);
  const toneClass = {
    critical: 'border-l-critical text-critical bg-critical-bg',
    warning: 'border-l-warning text-warning bg-warning-bg',
    green: 'border-l-green text-green bg-green-soft',
  }[tone];

  return (
    <article className={cn('animate-fade-in rounded-xl border border-border-default border-l-[3px] bg-white p-5 shadow-level-1 transition-all duration-180 hover:-translate-y-0.5 hover:shadow-level-2', tone === 'critical' ? 'border-l-critical' : tone === 'warning' ? 'border-l-warning' : 'border-l-green')}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" aria-hidden="true">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneClass)}>
          <Icon size={18} />
        </span>
      </div>
      <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-bold leading-none text-text-primary tabular-nums">{display}</div>
      <div className="mt-2 text-sm leading-5 text-text-muted">{subLabel}</div>
    </article>
  );
}

export function GaugeStatCard({
  score,
  label,
  note,
}: {
  score: number;
  label: string;
  note: string;
}) {
  const display = useAnimatedNumber(score, 1000);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;
  const tone = score >= 70 ? 'text-critical border-l-critical' : score >= 45 ? 'text-warning border-l-warning' : 'text-green border-l-green';

  return (
    <article className={cn('animate-fade-in rounded-xl border border-border-default border-l-[3px] bg-white p-5 shadow-level-1 transition-all duration-180 hover:-translate-y-0.5 hover:shadow-level-2', tone)}>
      <div className="flex items-center gap-4">
        <div className="relative h-[120px] w-[120px]" aria-label={`Niveau de risque ${display} sur 100`}>
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F3EF" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
            />
            <defs>
              <linearGradient id="riskGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#1E6B45" />
                <stop offset="52%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#C0312B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary tabular-nums">{display}</span>
            <span className="text-xs font-semibold text-text-muted">/100</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Niveau de risque global</div>
          <div className={cn('mt-2 text-xl font-bold', tone)}>{label}</div>
          <p className="mt-2 text-sm leading-5 text-text-muted">{note}</p>
        </div>
      </div>
    </article>
  );
}

export function CountdownStatCard({
  icon: Icon,
  label,
  targetTime,
  subLabel,
}: {
  icon: LucideIcon;
  label: string;
  targetTime: Date | null;
  subLabel: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const { text, progress } = useMemo(() => {
    if (!targetTime) return { text: 'À confirmer', progress: 0.35 };
    const rawDiff = targetTime.getTime() - now;
    const diff = Math.max(rawDiff, 0);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const windowMinutes = 48 * 60;
    if (rawDiff < 0) {
      const elapsedMinutes = Math.floor(Math.abs(rawDiff) / 60000);
      const elapsedHours = Math.floor(elapsedMinutes / 60);
      const elapsedDays = Math.floor(elapsedHours / 24);
      return {
        text: elapsedDays > 0 ? `depuis ${elapsedDays} j` : `depuis ${Math.max(1, elapsedHours)} h`,
        progress: 0.08,
      };
    }
    return {
      text: `${hours}h ${mins.toString().padStart(2, '0')}min`,
      progress: Math.max(0.08, Math.min(minutes / windowMinutes, 1)),
    };
  }, [now, targetTime]);

  return (
    <article className="animate-fade-in rounded-xl border border-border-default border-l-[3px] border-l-warning bg-white p-5 shadow-level-1 transition-all duration-180 hover:-translate-y-0.5 hover:shadow-level-2">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold leading-none text-text-primary tabular-nums" aria-live="polite">{text}</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg-muted">
        <div className="h-full rounded-full bg-warning transition-all duration-300 motion-reduce:transition-none" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-2 text-sm leading-5 text-text-muted">{subLabel}</div>
    </article>
  );
}
