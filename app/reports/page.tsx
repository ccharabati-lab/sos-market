import {
  BarChart3,
  Calendar,
  FileText,
  Map,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const reports: Array<{
  title: string;
  description: string;
  date: string;
  Icon: LucideIcon;
}> = [
  {
    title: 'Synthèse hebdomadaire des alertes',
    description: 'Vue consolidée des signaux critiques, avertissements et actions menées.',
    date: '19 mai 2026',
    Icon: FileText,
  },
  {
    title: 'Performance des échanges locaux',
    description: 'Suivi des publications, mises en relation et fournisseurs mobilisables.',
    date: '17 mai 2026',
    Icon: TrendingUp,
  },
  {
    title: 'Cartographie des risques par catégorie',
    description: 'Lecture territoriale des familles de produits les plus exposées.',
    date: '13 mai 2026',
    Icon: Map,
  },
  {
    title: 'Historique des disruptions évitées',
    description: 'Estimation des ruptures anticipées grâce aux alertes et au réseau local.',
    date: '30 avril 2026',
    Icon: ShieldCheck,
  },
  {
    title: 'Tendances des prix négociés',
    description: 'Analyse des écarts observés entre offres, demandes et prix de marché.',
    date: '24 avril 2026',
    Icon: BarChart3,
  },
  {
    title: 'Rapport mensuel — mai 2026',
    description: 'Bilan mensuel des risques, catégories touchées et recommandations.',
    date: '1 juin 2026',
    Icon: Calendar,
  },
];

export default function ReportsPage() {
  return (
    <section className="mx-auto w-full max-w-[1280px]">
      <div className="mb-8">
        <h1 className="font-display text-display text-text-primary">Vos prévisions</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          Le point du jour
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map(({ title, description, date, Icon }) => (
          <article
            key={title}
            aria-disabled="true"
            className="cursor-not-allowed rounded-xl border border-border-default bg-white p-5 opacity-70 shadow-level-1"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-light text-amber">
                <Icon size={19} aria-hidden="true" />
              </div>
              <span className="rounded-full border border-amber-mid bg-amber-light px-2.5 py-1 text-caption font-semibold uppercase tracking-[0.08em] text-amber">
                Bientôt disponible
              </span>
            </div>

            <h2 className="text-h2 text-text-primary">{title}</h2>
            <p className="mt-2 text-body text-text-muted">{description}</p>
            <p className="mt-5 text-body-sm font-semibold text-text-secondary">{date}</p>
          </article>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-body text-text-muted">
        Les rapports détaillés seront disponibles dans la prochaine version.
      </p>
    </section>
  );
}
