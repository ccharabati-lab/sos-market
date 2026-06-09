'use client';

import { useEffect, useState } from 'react';
import AlertCard from './dashboard/AlertCard';
import { SkeletonLoader } from './ui/feedback';
import { shiftDemoDate } from './ui/utils';
import {
  fetchAlerts,
  humanizeAction,
  humanizeCategory,
  milevaToFrCategories,
  type CrisisAlert as MilevaAlert,
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
    lat: m.lat ?? undefined,
    lng: m.lng ?? undefined,
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

export default function DashboardClient({ suppliersByCategory, profile }: DashboardClientProps) {
  const [alerts, setAlerts] = useState<MilevaAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(false);

    fetchAlerts().then((nextAlerts) => {
      if (cancelled) return;

      if (nextAlerts.length > 0) {
        setAlerts(nextAlerts);
      } else {
        setAlerts(DEMO_CRISIS_ALERTS);
      }
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setAlerts(DEMO_CRISIS_ALERTS);
      setFetchError(true);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;

  const severityRank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  const sortBySeverity = (list: MilevaAlert[]) =>
    [...list].sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9));
  const localAlerts = sortBySeverity(alerts.filter((a) => a.regionLevel === 'local'));
  const globalAlerts = sortBySeverity(alerts.filter((a) => a.regionLevel !== 'local'));
  const firstAlertId = (localAlerts[0] ?? globalAlerts[0])?.id;

  const renderAlertCard = (crisis: MilevaAlert) => {
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
        defaultExpanded={alert.id === firstAlertId}
        originLat={originLat}
        originLng={originLng}
      />
    );
  };

  return (
    <div className="mx-auto w-full max-w-dashboard">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-display text-text-primary">
          Bonjour Olivier, voici vos prévisions
        </h1>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-text-secondary">
          Impossible de charger les alertes Mileva. Données de démonstration affichées.
        </div>
      )}

      <section id="alerts" className="scroll-mt-24">
        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-32" />
            <SkeletonLoader className="h-32" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {localAlerts.length > 0 && (
              <div>
                <p className="mb-3 text-sm lowercase text-text-muted">local</p>
                <div className="flex flex-col gap-4">
                  {localAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}
            {globalAlerts.length > 0 && (
              <div>
                <p className="mb-3 text-sm lowercase text-text-muted">global</p>
                <div className="flex flex-col gap-4">
                  {globalAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
