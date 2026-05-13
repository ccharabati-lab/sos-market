'use client';

import { useState } from 'react';
import { TriangleAlert, X, Store, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CrisisCard from './CrisisCard';
import type { CrisisAlert, MatchResult, Profile } from '../types';

interface DashboardClientProps {
  crises: CrisisAlert[];
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

function severityIconFor(title: string): 'thermometer' | 'truck' {
  const t = title.toLowerCase();
  if (t.includes('grève') || t.includes('transport')) return 'truck';
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

function adaptAlert(c: CrisisAlert) {
  const tone: 'red' | 'amber' = c.severity === 'critical' ? 'red' : 'amber';
  const startsAtLabel = c.starts_at ? dateFmt.format(new Date(c.starts_at)) : null;

  const descParts: string[] = [];
  if (c.source) descParts.push(`Source : ${c.source}`);
  if (c.region) descParts.push(c.region);
  if (startsAtLabel) descParts.push(`Démarrage ${startsAtLabel}`);

  return {
    id: c.id,
    severity: c.severity,
    title: c.title,
    description: descParts.join(' · '),
    icon: severityIconFor(c.title),
    affected_products: c.affected_categories.map((label) => ({ label, tone })),
    map_hints: undefined,
  };
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
  crisis: CrisisAlert,
  suppliers: AdaptedSupplier[],
  originLat: number,
  originLng: number,
): AdaptedSupplier[] {
  const producerishCount = suppliers.filter(
    (s) => s.role_label === 'Grossiste / Rungis' || s.role_label === 'Producteur',
  ).length;

  if (producerishCount >= 5) return suppliers.slice(0, 8);

  const crisisCategories = new Set(crisis.affected_categories);
  const seenNames = new Set(suppliers.map((s) => s.name.toLowerCase()));
  const demoSuppliers = DEMO_CRISIS_SUPPLIERS
    .filter((s) => crisisCategories.has(s.product_category))
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
  crisis: CrisisAlert,
  suppliersByCategory: Record<string, MatchResult[]>,
): MatchResult[] {
  const byOwner = new Map<string, MatchResult>();

  for (const cat of crisis.affected_categories) {
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

export default function DashboardClient({ crises, suppliersByCategory, profile }: DashboardClientProps) {
  const [bannerOpen, setBannerOpen] = useState(true);

  const firstCritical = crises.find((c) => c.severity === 'critical');
  const totalSuppliers = new Set(
    Object.values(suppliersByCategory).flat().map((s) => s.owner_id || s.id),
  ).size;

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;

  const alertWord = crises.length === 1 ? 'alerte détectée' : 'alertes détectées';
  const displayName = profile?.name ?? 'votre organisation';

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">
          Bonjour {displayName}, voici votre bilan du jour
        </h1>
        <p className="text-[0.83rem] text-muted mt-1">
          {crises.length} {alertWord} dans les 48 prochaines heures · Dernière mise à jour à l&apos;instant
        </p>
      </div>

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
        <StatCard Icon={TriangleAlert} tone="red"   label="Alertes actives"          value={String(crises.length)} />
        <StatCard Icon={Store}         tone="green" label="Fournisseurs disponibles" value={String(totalSuppliers)} />
        <StatCard Icon={Clock}         tone="amber" label="Délai moyen livraison"    value="J+1" />
      </div>

      <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted mb-4">
        Alertes en cours — cliquez pour trouver du stock
      </p>

      <div className="flex flex-col gap-[0.85rem]">
        {crises.map((crisis, i) => {
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
        })}
      </div>
    </>
  );
}
