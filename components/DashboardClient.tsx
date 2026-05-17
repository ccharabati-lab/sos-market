'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  TriangleAlert,
  Store,
  MapPin,
  ExternalLink,
  Package,
  Route,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AlertCard from './dashboard/AlertCard';
import { SkeletonLoader } from './ui/feedback';
import { CountdownStatCard, GaugeStatCard, NumberStatCard } from './ui/stat-card';
import { shiftDemoDate } from './ui/utils';
import {
  fetchAlerts,
  fetchLocalSignals,
  fetchProductRisks,
  fetchScenarios,
  humanizeAction,
  humanizeCategory,
  milevaToFrCategories,
  type CrisisAlert as MilevaAlert,
  type LocalSignal,
  type ProductRisk,
  type Scenario,
} from '../lib/mileva';
import { DEMO_CRISIS_ALERTS } from '../lib/demo-data';
import type { MatchResult, Profile } from '../types';

interface DashboardClientProps {
  suppliersByCategory: Record<string, MatchResult[]>;
  profile: Profile | null;
}

const FALLBACK_LAT = 48.6833;
const FALLBACK_LNG = 2.1333;

const DEMO_CRISIS_SUPPLIERS = [
  {
    id: 'demo-crisis-rungis-halle',
    name: 'Démo Halle Fraîche de Rungis',
    role_label: 'Grossiste / Rungis',
    product_category: 'eau',
    stock_detail: 'Eaux minérales 1.5 L · 35 palettes',
    availability: "Disponible jusqu'au 02/06",
    availability_tone: 'ok' as const,
    lat: 48.7488,
    lng: 2.352,
  },
  {
    id: 'demo-crisis-rungis-grossiste',
    name: 'Démo Grossiste Fruits de Rungis',
    role_label: 'Grossiste / Rungis',
    product_category: 'glaces',
    stock_detail: 'Glaces fruits exotiques · 24 cartons',
    availability: 'DLC 19/05 · stock limité',
    availability_tone: 'warn' as const,
    lat: 48.7552,
    lng: 2.3491,
  },
  {
    id: 'demo-crisis-saclay',
    name: 'Démo Ferme du Plateau de Saclay',
    role_label: 'Producteur',
    product_category: 'produits laitiers',
    stock_detail: 'Lait demi-écrémé 1 L · 18 palettes',
    availability: 'DLC 20/05 · stock limité',
    availability_tone: 'warn' as const,
    lat: 48.7328,
    lng: 2.1715,
  },
  {
    id: 'demo-crisis-saint-aubin',
    name: 'Démo Primeur de Saint-Aubin',
    role_label: 'Producteur',
    product_category: 'glaces',
    stock_detail: 'Sorbets fruits rouges · 22 cartons',
    availability: 'DLC 18/05 · stock limité',
    availability_tone: 'warn' as const,
    lat: 48.7137,
    lng: 2.1419,
  },
  {
    id: 'demo-crisis-gif',
    name: 'Démo Maraîcher de Gif-sur-Yvette',
    role_label: 'Producteur',
    product_category: 'eau',
    stock_detail: 'Eaux minérales 1.5 L · 12 palettes',
    availability: "Disponible jusqu'au 31/05",
    availability_tone: 'ok' as const,
    lat: 48.6997,
    lng: 2.1332,
  },
  {
    id: 'demo-crisis-chevreuse',
    name: 'Démo Ferme de Chevreuse',
    role_label: 'Producteur',
    product_category: 'produits laitiers',
    stock_detail: 'Yaourts nature 4x125g · 34 cartons',
    availability: 'DLC 17/05 · stock limité',
    availability_tone: 'warn' as const,
    lat: 48.7068,
    lng: 2.0387,
  },
  {
    id: 'demo-crisis-wissous',
    name: 'Démo Atelier Légumes de Wissous',
    role_label: 'Producteur',
    product_category: 'eau',
    stock_detail: 'Eaux minérales 50 cl · 16 palettes',
    availability: "Disponible jusqu'au 02/06",
    availability_tone: 'ok' as const,
    lat: 48.7311,
    lng: 2.3264,
  },
  {
    id: 'demo-crisis-vauhallan',
    name: 'Démo Apiculteur de Vauhallan',
    role_label: 'Producteur',
    product_category: 'boissons',
    stock_detail: 'Eau aromatisée miel-citron · 18 cartons',
    availability: "Disponible jusqu'au 01/06",
    availability_tone: 'ok' as const,
    lat: 48.7322,
    lng: 2.2035,
  },
];

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
});

const fullDateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function severityIconFor(alert: MilevaAlert): 'thermometer' | 'truck' | 'info' {
  const t = `${alert.title} ${alert.description}`.toLowerCase();
  if (alert.severity === 'info') return 'info';
  if (t.includes('grève') || t.includes('transport') || t.includes('fret') || t.includes('logist')) return 'truck';
  return 'thermometer';
}

function categoryIconFor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('eau') || c.includes('boisson') || c.includes('beverage')) return 'droplets';
  if (c.includes('lait')) return 'droplets';
  if (c.includes('légume') || c.includes('fruit')) return 'leaf';
  if (c.includes('pain') || c.includes('viennois')) return 'shopping-bag';
  if (c.includes('céréale') || c.includes('cereal')) return 'wheat';
  return 'package';
}

function pillToneFor(severity: MilevaAlert['severity']): 'red' | 'amber' | 'neutral' {
  if (severity === 'critical') return 'red';
  if (severity === 'warning') return 'amber';
  return 'neutral';
}

function adaptAlert(c: MilevaAlert) {
  const tone = pillToneFor(c.severity);
  const detectedLabel = c.detectedAt
    ? fullDateFmt.format(new Date(c.detectedAt))
    : null;

  const descParts: string[] = [];
  if (c.region) descParts.push(c.region);
  if (c.regionLevel) descParts.push(humanizeRegionLevel(c.regionLevel));
  if (detectedLabel) descParts.push(`Détecté ${detectedLabel}`);

  return {
    id: c.id,
    severity: c.severity,
    title: c.title,
    description: descParts.join(' · '),
    full_description: c.description,
    icon: severityIconFor(c),
    confidence: c.confidence,
    affected_products: c.affectedCategories.map((slug) => ({
      label: humanizeCategory(slug),
      tone,
    })),
    recommended_actions: c.recommendedActions.map((slug) => ({
      key: slug,
      label: humanizeActionDisplay(slug),
    })),
    evidence: c.evidence,
    sources: c.sources,
    risk_global: c.riskGlobal,
    risk_specific: c.riskSpecific,
    matching_notes: c.matchingNotes,
    region: c.region,
    region_level: c.regionLevel,
    detected_at: c.detectedAt,
    start_time: shiftDemoDate(c.startTime) ?? c.startTime,
    attribution: detectedLabel
      ? `Source : Mileva AI · ${detectedLabel}`
      : 'Source : Mileva AI',
    map_hints: undefined as undefined,
  };
}

function humanizeActionDisplay(slug: string): string {
  const labels: Record<string, string> = {
    alerte_achats: 'Lancer une alerte achats',
    augmentation_stock_securite: 'Augmenter le stock de sécurité',
    securisation_transport: 'Sécuriser le transport',
    diversification_fournisseurs: 'Diversifier les fournisseurs',
    revue_prix: 'Revoir la stratégie prix',
  };
  return labels[slug] ?? humanizeAction(slug);
}

function humanizeRegionLevel(level: string): string {
  if (level === 'international') return 'International';
  if (level === 'national') return 'National';
  if (level === 'local') return 'Local';
  return level;
}

function availabilityFor(m: MatchResult): {
  availability: string;
  availability_tone: 'ok' | 'warn';
} {
  if (!m.expires_at) {
    return { availability: 'Disponibilité à confirmer', availability_tone: 'ok' };
  }
  const expires = new Date(m.expires_at);
  const daysLeft = Math.ceil(
    (expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const fmt = dateFmt.format(expires);
  if (daysLeft <= 4) {
    return { availability: `DLC ${fmt} · stock limité`, availability_tone: 'warn' };
  }
  return { availability: `Disponible jusqu'au ${fmt}`, availability_tone: 'ok' };
}

function adaptSupplier(m: MatchResult) {
  const qtyParts: string[] = [];
  if (m.quantity != null) qtyParts.push(String(m.quantity));
  if (m.unit) qtyParts.push(m.unit);
  const stockDetail = qtyParts.length
    ? `${m.product_name} · ${qtyParts.join(' ')}`
    : m.product_name;
  const { availability, availability_tone } = availabilityFor(m);

  return {
    id: m.id,
    name: m.name,
    icon: categoryIconFor(m.product_category),
    role_label: roleLabelFor(m),
    stock_detail: stockDetail,
    distance_km: Math.round(m.distance_km * 10) / 10,
    availability,
    availability_tone,
    lat: m.lat,
    lng: m.lng,
  };
}

type AdaptedSupplier = ReturnType<typeof adaptSupplier>;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceKm(originLat: number, originLng: number, lat: number, lng: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat - originLat);
  const dLng = toRad(lng - originLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originLat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function withDemoSupplierFallback(
  crisis: MilevaAlert,
  suppliers: AdaptedSupplier[],
  originLat: number,
  originLng: number,
): AdaptedSupplier[] {
  const producerishCount = suppliers.filter(
    (s) => s.role_label === 'Grossiste / Rungis' || s.role_label === 'Producteur',
  ).length;

  if (producerishCount >= 5) return suppliers.slice(0, 8);

  const frCategories = new Set(
    crisis.affectedCategories.flatMap((slug) => milevaToFrCategories(slug)),
  );
  const seenNames = new Set(suppliers.map((s) => s.name.toLowerCase()));
  const demoSuppliers = DEMO_CRISIS_SUPPLIERS
    .filter((s) => frCategories.has(s.product_category))
    .filter((s) => !seenNames.has(s.name.toLowerCase()))
    .map((s) => ({
      id: s.id,
      name: s.name,
      icon: categoryIconFor(s.product_category),
      role_label: s.role_label,
      stock_detail: s.stock_detail,
      distance_km: Math.round(distanceKm(originLat, originLng, s.lat, s.lng) * 10) / 10,
      availability: s.availability,
      availability_tone: s.availability_tone,
      lat: s.lat,
      lng: s.lng,
    }));

  return [...demoSuppliers, ...suppliers].slice(0, 8);
}

function roleLabelFor(m: MatchResult): string {
  const name = m.name.toLowerCase();
  const address = (m.address ?? '').toLowerCase();
  if (
    name.includes('rungis') ||
    name.includes('grossiste') ||
    name.includes('halle') ||
    address.includes('rungis')
  ) {
    return 'Grossiste / Rungis';
  }
  if (m.role === 'producer') return 'Producteur';
  if (m.role === 'restaurant') return 'Restaurant';
  return 'Supermarché';
}

interface StatCardProps {
  Icon: LucideIcon;
  tone: 'red' | 'green' | 'amber';
  label: string;
  value: string;
}

function StatCard({ Icon, tone, label, value }: StatCardProps) {
  const iconTone = {
    red:   'bg-red-light text-red',
    green: 'bg-green-light text-green',
    amber: 'bg-amber-light text-amber',
  }[tone];
  const valueTone = {
    red:   'text-red',
    green: 'text-green',
    amber: 'text-amber',
  }[tone];
  return (
    <div className="bg-paper border border-line rounded-xl py-[1.1rem] px-[1.3rem] flex items-center gap-4">
      <div className={`w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center ${iconTone}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-[0.72rem] text-muted font-semibold uppercase tracking-[0.06em]">
          {label}
        </div>
        <div className={`text-[1.55rem] font-extrabold leading-[1.1] mt-[0.1rem] ${valueTone}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function suppliersForCrisis(
  crisis: MilevaAlert,
  suppliersByCategory: Record<string, MatchResult[]>,
): MatchResult[] {
  const byOwner = new Map<string, MatchResult>();

  const frCategories = crisis.affectedCategories.flatMap((slug) =>
    milevaToFrCategories(slug),
  );

  for (const cat of frCategories) {
    for (const s of suppliersByCategory[cat] ?? []) {
      const ownerKey = s.owner_id || s.id;
      const current = byOwner.get(ownerKey);
      if (!current || compareSupplierPriority(s, current) < 0) {
        byOwner.set(ownerKey, s);
      }
    }
  }

  return [...byOwner.values()]
    .sort(compareSupplierPriority)
    .slice(0, 8);
}

function compareSupplierPriority(a: MatchResult, b: MatchResult): number {
  const priorityDiff = supplierPriority(a) - supplierPriority(b);
  if (priorityDiff !== 0) return priorityDiff;
  return a.distance_km - b.distance_km;
}

function supplierPriority(m: MatchResult): number {
  const label = roleLabelFor(m);
  if (label === 'Grossiste / Rungis') return 0;
  if (label === 'Producteur') return 1;
  if (label === 'Restaurant') return 2;
  return 3;
}

function SkeletonCard() {
  return (
    <div className="bg-paper border border-line rounded-xl py-[1.1rem] px-[1.35rem] flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-[10px] bg-canvas-soft flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-2/3 rounded bg-canvas-soft" />
        <div className="h-2.5 w-1/2 rounded bg-canvas-soft" />
        <div className="flex gap-2 mt-1">
          <div className="h-4 w-16 rounded-full bg-canvas-soft" />
          <div className="h-4 w-20 rounded-full bg-canvas-soft" />
          <div className="h-4 w-14 rounded-full bg-canvas-soft" />
        </div>
      </div>
      <div className="h-5 w-20 rounded-full bg-canvas-soft flex-shrink-0" />
    </div>
  );
}

function LocalSignalCard({ signal }: { signal: LocalSignal }) {
  const richSignal = signal as LocalSignal & {
    impact_pathway?: string;
    impact_level?: string;
    time_to_retail_effect?: string;
    reliability?: string;
    why_kept?: string;
  };
  const products = (signal.impacted_products ?? [])
    .map((p) => p.product);
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-white p-4 shadow-level-1">
      <div className="flex items-start gap-2">
        <MapPin size={15} className="mt-1 flex-shrink-0 text-green" aria-hidden="true" />
        <div>
          <div className="text-sm font-semibold leading-snug text-text-primary">{signal.title}</div>
          <div className="mt-1 text-xs text-text-muted">{signal.zone ?? 'Zone locale'} · {signal.category ?? 'signal local'}</div>
        </div>
      </div>
      {products.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary"
            >
              {p}
            </span>
          ))}
        </div>
      )}
      {richSignal.impact_pathway && (
        <p className="text-sm leading-5 text-text-secondary">{richSignal.impact_pathway}</p>
      )}
      <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
        {richSignal.impact_level && <span>Niveau : {richSignal.impact_level}</span>}
        {richSignal.reliability && <span>Fiabilité : {richSignal.reliability}</span>}
        {richSignal.time_to_retail_effect && <span>Effet rayon : {richSignal.time_to_retail_effect}</span>}
        {signal.date_publication && <span>Date : {dateFmt.format(new Date(signal.date_publication))}</span>}
      </div>
      {richSignal.why_kept && (
        <p className="rounded-lg bg-bg-subtle p-3 text-xs leading-5 text-text-muted">{richSignal.why_kept}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-text-muted">
        <span>{signal.source_name ?? 'Source inconnue'}</span>
        {signal.source_url && (
          <a
            href={signal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-8 items-center gap-1 rounded-md px-2 text-green transition-all duration-180 hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
          >
            Lire <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

function humanizeHorizon(value: string): string {
  const labels: Record<string, string> = {
    court_terme: 'Court terme',
    moyen_terme: 'Moyen terme',
    long_terme: 'Long terme',
    '1_3_mois': '1 à 3 mois',
  };
  return labels[value] ?? value.replace(/_/g, ' ');
}

function humanizeImpact(value: string): string {
  const labels: Record<string, string> = {
    prix: 'Prix',
    delai: 'Délais',
    disponibilite: 'Disponibilité',
    qualite: 'Qualité',
  };
  return labels[value] ?? value.replace(/_/g, ' ');
}

function riskTone(score: number): 'red' | 'amber' | 'green' {
  if (score >= 65) return 'red';
  if (score >= 45) return 'amber';
  return 'green';
}

function toneClasses(tone: 'red' | 'amber' | 'green'): string {
  return {
    red: 'bg-red-light text-red border-red-mid',
    amber: 'bg-amber-light text-amber border-amber-mid',
    green: 'bg-green-light text-green border-green-mid',
  }[tone];
}

function computeRiskScore(alerts: MilevaAlert[]): number {
  if (alerts.length === 0) return 0;
  const weights: Record<MilevaAlert['severity'], number> = {
    critical: 100,
    warning: 62,
    info: 28,
  };
  const total = alerts.reduce(
    (sum, alert) => sum + weights[alert.severity] * Math.max(alert.confidence || 0.4, 0.4),
    0,
  );
  return Math.min(100, Math.round(total / alerts.length));
}

function riskLabel(score: number): string {
  if (score >= 70) return 'Risque élevé';
  if (score >= 45) return 'Risque modéré';
  return 'Risque maîtrisé';
}

function nearestCriticalDate(alerts: MilevaAlert[]): Date | null {
  const candidates = alerts
    .filter((alert) => alert.severity === 'critical')
    .map((alert) => shiftDemoDate(alert.startTime) ?? shiftDemoDate(alert.detectedAt))
    .filter(Boolean)
    .map((value) => new Date(value as string))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (candidates.length === 0) return null;

  const now = Date.now();
  const future = candidates
    .filter((d) => d.getTime() >= now)
    .sort((a, b) => a.getTime() - b.getTime());
  if (future.length > 0) return future[0];

  return candidates.sort(
    (a, b) => Math.abs(a.getTime() - now) - Math.abs(b.getTime() - now),
  )[0];
}

function ProductRiskCard({ risk }: { risk: ProductRisk }) {
  const tone = riskTone(risk.riskScore);
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-white p-4 shadow-level-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-text-primary">
            {humanizeCategory(risk.productSlug)}
          </div>
          <div className="mt-1 text-sm text-text-muted">
            {risk.products.join(' · ') || risk.productFamily}
          </div>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${toneClasses(tone)}`}>
          {risk.riskScore}/100
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-bg-subtle px-2.5 py-2">
          <div className="font-semibold text-text-muted">Horizon</div>
          <div className="font-bold text-text-secondary">{humanizeHorizon(risk.timeHorizon)}</div>
        </div>
        <div className="rounded-lg bg-bg-subtle px-2.5 py-2">
          <div className="font-semibold text-text-muted">Confiance</div>
          <div className="font-bold text-text-secondary">{risk.confidence}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[...risk.impactType, ...risk.geographies].map((impact) => (
          <span
            key={impact}
            className="rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {humanizeImpact(impact)}
          </span>
        ))}
      </div>

      <ul className="mt-auto flex flex-col gap-1.5">
        {risk.recommendedActions.map((action) => (
          <li key={action} className="flex gap-2 text-sm leading-snug text-text-secondary">
            <span className="mt-[0.45rem] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-green" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border-default bg-white p-4 shadow-level-1">
      <div className="flex items-start gap-2">
        <Route size={16} className="mt-1 flex-shrink-0 text-warning" aria-hidden="true" />
        <div>
          <div className="font-semibold leading-snug text-text-primary">
            {scenario.title}
          </div>
          <div className="mt-1 text-xs text-text-muted">
            Probabilité {scenario.probability} · Sévérité {scenario.severity} · {humanizeHorizon(scenario.timeHorizon)}
          </div>
        </div>
      </div>

      <p className="text-sm leading-6 text-text-secondary">
        {scenario.supplyChainPathway}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {scenario.affectedProducts.slice(0, 5).map((slug) => (
          <span
            key={slug}
            className="rounded-full border border-border-default bg-bg-subtle px-2 py-0.5 text-xs font-semibold text-text-secondary"
          >
            {humanizeCategory(slug)}
          </span>
        ))}
      </div>

      <div className="mt-auto border-t border-border-default pt-3">
        <div className="mb-2 flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-green">
          <ShieldCheck size={13} />
          À surveiller
        </div>
        <div className="text-sm text-text-secondary">
          {scenario.earlyWarningIndicators.join(' · ')}
        </div>
        {scenario.retailerActions.length > 0 && (
          <ul className="mt-3 grid gap-1.5">
            {scenario.retailerActions.map((action) => (
              <li key={action} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-[0.45rem] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-green" />
                {action}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function DashboardClient({ suppliersByCategory, profile }: DashboardClientProps) {
  const [alerts, setAlerts] = useState<MilevaAlert[]>([]);
  const [signals, setSignals] = useState<LocalSignal[]>([]);
  const [productRisks, setProductRisks] = useState<ProductRisk[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    Promise.allSettled([
      fetchAlerts(),
      fetchLocalSignals(),
      fetchProductRisks(),
      fetchScenarios(),
    ]).then(([alertsRes, signalsRes, productsRes, scenariosRes]) => {
      if (cancelled) return;

      if (alertsRes.status === 'fulfilled' && alertsRes.value.length > 0) {
        setAlerts(alertsRes.value);
      } else {
        setAlerts(DEMO_CRISIS_ALERTS);
        if (alertsRes.status === 'rejected') setFetchError(true);
      }

      if (signalsRes.status === 'fulfilled') {
        setSignals(signalsRes.value);
      } else {
        setSignals([]);
      }

      setProductRisks(productsRes.status === 'fulfilled' ? productsRes.value : []);
      setScenarios(scenariosRes.status === 'fulfilled' ? scenariosRes.value : []);

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const firstCritical = alerts.find((c) => c.severity === 'critical');
  const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;
  const warningCount = alerts.filter((alert) => alert.severity === 'warning').length;
  const riskScore = computeRiskScore(alerts);
  const nearestCritical = nearestCriticalDate(alerts);
  const totalSuppliers = new Set(
    Object.values(suppliersByCategory).flat().map((s) => s.owner_id || s.id),
  ).size;

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;

  const alertWord = alerts.length === 1 ? 'alerte active' : 'alertes actives';
  const topProductRisks = [...productRisks]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);
  const topScenarios = scenarios.slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-dashboard">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-display text-text-primary">
          Bonjour Pierre, voici votre situation aujourd&apos;hui
        </h1>
        <p className="mt-2 text-body-lg text-text-muted">
          {loading
            ? 'Chargement des alertes Mileva…'
            : `Dernière mise à jour il y a 4 min · ${alerts.length} ${alertWord} sur les prochaines 48 h`}
        </p>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-text-secondary">
          Impossible de charger les alertes Mileva. Données de démonstration affichées.
        </div>
      )}

      <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NumberStatCard
          icon={TriangleAlert}
          tone="critical"
          label="Alertes actives"
          value={loading ? 0 : alerts.length}
          subLabel={`${criticalCount} critique${criticalCount > 1 ? 's' : ''} · ${warningCount} avertissement${warningCount > 1 ? 's' : ''}`}
        />
        <GaugeStatCard
          score={loading ? 0 : riskScore}
          label={riskLabel(riskScore)}
          note="Agrégé à partir de la sévérité et de la confiance Mileva."
        />
        <CountdownStatCard
          icon={Clock}
          label="Fenêtre d'anticipation"
          targetTime={nearestCritical}
          subLabel={firstCritical ? firstCritical.title : 'Aucune alerte critique active'}
        />
        <NumberStatCard
          icon={Store}
          tone="green"
          label="Fournisseurs mobilisables"
          value={totalSuppliers}
          subLabel="dans un rayon de 15 km"
        />
      </div>

      <section id="alerts" className="scroll-mt-24">
        <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
          Alertes en cours
        </p>
      <div className="flex flex-col gap-4">
        {loading ? (
          <>
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-32" />
          </>
        ) : (
          alerts.map((crisis, i) => {
            const alert = adaptAlert(crisis);
            const adaptedSuppliers = withDemoSupplierFallback(
              crisis,
              suppliersForCrisis(crisis, suppliersByCategory).map(adaptSupplier),
              originLat,
              originLng,
            );
            return (
              <AlertCard
                key={alert.id}
                alert={alert}
                suppliers={adaptedSuppliers}
                defaultExpanded={i === 0}
                originLat={originLat}
                originLng={originLng}
              />
            );
          })
        )}
      </div>
      </section>

      {!loading && topProductRisks.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
            Produits à surveiller en rayon — vue acheteur Mileva
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {topProductRisks.map((risk) => (
              <ProductRiskCard key={risk.productSlug} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {!loading && topScenarios.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
            Scénarios à anticiper — prospective Mileva
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {topScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </div>
      )}

      {!loading && signals.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
            Signaux locaux — axe Paris-Saclay
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {signals.slice(0, 3).map((s, i) => (
              <LocalSignalCard key={`${s.title}-${i}`} signal={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
