'use client';

import { useEffect, useState } from 'react';
import {
  TriangleAlert,
  X,
  Store,
  MapPin,
  ExternalLink,
  Package,
  Route,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CrisisCard from './CrisisCard';
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
      label: humanizeAction(slug),
    })),
    evidence: c.evidence,
    sources: c.sources,
    attribution: detectedLabel
      ? `Source : Mileva AI · ${detectedLabel}`
      : 'Source : Mileva AI',
    map_hints: undefined as undefined,
  };
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
  const products = (signal.impacted_products ?? [])
    .map((p) => p.product)
    .slice(0, 3);
  return (
    <div className="bg-paper border border-line rounded-xl p-4 flex flex-col gap-2 h-full">
      <div className="flex items-start gap-2">
        <MapPin size={14} className="text-green flex-shrink-0 mt-[0.2rem]" />
        <div className="text-[0.82rem] font-bold text-ink leading-snug">
          {signal.title}
        </div>
      </div>
      {products.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span
              key={p}
              className="text-[0.66rem] font-semibold py-[0.15rem] px-[0.5rem] rounded-full border border-line-strong bg-canvas-soft text-ink-soft"
            >
              {p}
            </span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between text-[0.7rem] text-muted pt-1">
        <span>{signal.source_name ?? 'Source inconnue'}</span>
        {signal.source_url && (
          <a
            href={signal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green hover:underline"
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

function ProductRiskCard({ risk }: { risk: ProductRisk }) {
  const tone = riskTone(risk.riskScore);
  return (
    <div className="bg-paper border border-line rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.88rem] font-extrabold text-ink">
            {humanizeCategory(risk.productSlug)}
          </div>
          <div className="text-[0.72rem] text-muted mt-1">
            {risk.products.slice(0, 3).join(' · ')}
          </div>
        </div>
        <span className={`text-[0.68rem] font-bold rounded-full border px-2 py-1 ${toneClasses(tone)}`}>
          {risk.riskScore}/100
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[0.72rem]">
        <div className="bg-canvas-soft rounded-lg px-2.5 py-2">
          <div className="text-muted font-semibold">Horizon</div>
          <div className="text-ink-soft font-bold">{humanizeHorizon(risk.timeHorizon)}</div>
        </div>
        <div className="bg-canvas-soft rounded-lg px-2.5 py-2">
          <div className="text-muted font-semibold">Confiance</div>
          <div className="text-ink-soft font-bold">{risk.confidence}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {risk.impactType.map((impact) => (
          <span
            key={impact}
            className="text-[0.66rem] font-semibold py-[0.15rem] px-[0.5rem] rounded-full border border-line-strong bg-canvas-soft text-ink-soft"
          >
            {humanizeImpact(impact)}
          </span>
        ))}
      </div>

      <ul className="mt-auto flex flex-col gap-1.5">
        {risk.recommendedActions.slice(0, 2).map((action) => (
          <li key={action} className="text-[0.73rem] text-ink-soft flex gap-2 leading-snug">
            <span className="mt-[0.35rem] w-[5px] h-[5px] rounded-full bg-green flex-shrink-0" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <div className="bg-paper border border-line rounded-xl p-4 flex flex-col gap-3 h-full">
      <div className="flex items-start gap-2">
        <Route size={15} className="text-amber flex-shrink-0 mt-[0.2rem]" />
        <div>
          <div className="text-[0.86rem] font-extrabold text-ink leading-snug">
            {scenario.title}
          </div>
          <div className="text-[0.7rem] text-muted mt-1">
            Probabilité {scenario.probability} · Sévérité {scenario.severity} · {humanizeHorizon(scenario.timeHorizon)}
          </div>
        </div>
      </div>

      <p className="text-[0.76rem] text-ink-soft leading-[1.5]">
        {scenario.supplyChainPathway}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {scenario.affectedProducts.slice(0, 5).map((slug) => (
          <span
            key={slug}
            className="text-[0.66rem] font-semibold py-[0.15rem] px-[0.5rem] rounded-full border border-line-strong bg-canvas-soft text-ink-soft"
          >
            {humanizeCategory(slug)}
          </span>
        ))}
      </div>

      <div className="mt-auto border-t border-line pt-3">
        <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-green mb-2">
          <ShieldCheck size={13} />
          À surveiller
        </div>
        <div className="text-[0.72rem] text-ink-soft">
          {scenario.earlyWarningIndicators.slice(0, 2).join(' · ')}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ suppliersByCategory, profile }: DashboardClientProps) {
  const [bannerOpen, setBannerOpen] = useState(true);
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
  const totalSuppliers = new Set(
    Object.values(suppliersByCategory).flat().map((s) => s.owner_id || s.id),
  ).size;

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;

  const alertWord = alerts.length === 1 ? 'alerte détectée' : 'alertes détectées';
  const displayName = profile?.name ?? 'votre organisation';
  const topProductRisks = [...productRisks]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);
  const topScenarios = scenarios.slice(0, 2);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Bonjour {displayName}, voici votre bilan du jour
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          {loading ? 'Chargement des alertes Mileva…' : `${alerts.length} ${alertWord} dans les 48 prochaines heures`}{' '}
          · Dernière mise à jour à l&apos;instant
        </p>
      </div>

      {fetchError && (
        <div className="bg-amber-light border border-amber-mid rounded-[10px] py-[0.8rem] px-[1.1rem] text-[0.8rem] text-ink-soft mb-5">
          Impossible de charger les alertes Mileva. Données de démonstration affichées.
        </div>
      )}

      {bannerOpen && firstCritical && (
        <div className="bg-red-light border border-red-mid rounded-[10px] py-[0.9rem] px-[1.15rem] flex items-center gap-[0.9rem] mb-7">
          <TriangleAlert size={16} className="text-red flex-shrink-0" />
          <div className="flex-1 text-[0.84rem] text-ink-soft">
            <strong className="text-red font-bold">Alerte critique :</strong>{' '}
            {firstCritical.title}. Consultez les recommandations ci-dessous.
          </div>
          <button
            onClick={() => setBannerOpen(false)}
            className="text-muted cursor-pointer flex-shrink-0 w-[26px] h-[26px] flex items-center justify-center rounded-md hover:bg-red-mid transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard Icon={TriangleAlert} tone="red"   label="Alertes actives"          value={loading ? '…' : String(alerts.length)} />
        <StatCard Icon={Store}         tone="green" label="Fournisseurs disponibles" value={String(totalSuppliers)} />
        <StatCard Icon={Package}       tone="amber" label="Produits à surveiller"    value={loading ? '…' : String(productRisks.length)} />
      </div>

      <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
        Alertes en cours — cliquez pour trouver du stock
      </p>

      <div className="flex flex-col gap-[0.85rem]">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
              <CrisisCard
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

      {!loading && topProductRisks.length > 0 && (
        <div className="mt-10">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
            Produits à surveiller en rayon — vue acheteur Mileva
          </p>
          <div className="grid grid-cols-3 gap-4">
            {topProductRisks.map((risk) => (
              <ProductRiskCard key={risk.productSlug} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {!loading && topScenarios.length > 0 && (
        <div className="mt-10">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
            Scénarios à anticiper — prospective Mileva
          </p>
          <div className="grid grid-cols-2 gap-4">
            {topScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </div>
      )}

      {!loading && signals.length > 0 && (
        <div className="mt-10">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
            Signaux locaux — axe Bourg-la-Reine → Orléans
          </p>
          <div className="grid grid-cols-3 gap-4">
            {signals.slice(0, 3).map((s, i) => (
              <LocalSignalCard key={`${s.title}-${i}`} signal={s} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
