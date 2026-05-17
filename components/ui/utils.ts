export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const DEMO_DATE_OFFSET_MS = 7 * 24 * 60 * 60 * 1000;

export function shiftDemoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return undefined;
  return new Date(t + DEMO_DATE_OFFSET_MS).toISOString();
}
