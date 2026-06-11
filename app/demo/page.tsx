import DashboardClient from '../../components/DashboardClient';

export const dynamic = 'force-dynamic';

// Public, read-only demo entry point — no auth check, no Supabase.
// Renders the same alerts dashboard from static/Mileva-fallback data.
export default function DemoPage() {
  return <DashboardClient />;
}
