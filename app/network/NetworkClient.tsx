'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import MapView, { type MapPin as PinDef } from '../../components/MapView';
import { useContactModal } from '../../components/ContactModalProvider';
import type { Listing, ListingType, Profile } from '../../types';

const FALLBACK_LAT = 48.6833;
const FALLBACK_LNG = 2.1333;

type FilterMode = 'all' | 'available' | 'wanted';

type SolutionAlert = {
  id: string;
  title: string;
  affectedCategories: string[];
};

type NetworkRow = Listing & {
  profiles: Profile;
  distance_km: number;
};

interface NetworkClientProps {
  profile: Profile | null;
  rows: Array<Listing & { profiles: Profile }>;
  solutionAlert?: SolutionAlert | null;
}

const ROLE_LABEL: Record<string, string> = {
  supermarket: 'Supermarché',
  producer: 'Producteur',
  restaurant: 'Restaurant',
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  eau: ['eaux', 'eaux minerales', 'hydratation', 'bonbonnes'],
  boissons: ['boisson', 'boissons fraiches', 'jus', 'limonade', 'smoothie', 'the glace'],
  glaces: ['glace', 'sorbets', 'sorbet', 'froid negatif'],
  laitier_frais: ['produits laitiers', 'laitier', 'lait', 'yaourt', 'yaourts', 'fromage', 'creme'],
  produits_laitiers: ['produits laitiers', 'laitier', 'lait', 'yaourt', 'fromage', 'creme'],
  fruits_legumes: ['fruits', 'legumes', 'fruits et legumes', 'primeur'],
  epicerie_seche: ['epicerie', 'epicerie seche', 'lentilles', 'sec'],
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function distanceKm(originLat: number, originLng: number, lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return Number.POSITIVE_INFINITY;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat - originLat);
  const dLng = toRad(lng - originLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(originLat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .trim();
}

function normalizedKey(value: string) {
  return normalize(value).replace(/\s+/g, '_');
}

function formatDistance(km: number) {
  if (!Number.isFinite(km)) return 'distance inconnue';
  return `${Math.round(km * 10) / 10} km`;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'date à confirmer';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function quantityLabel(row: Listing) {
  return [row.quantity, row.unit].filter(Boolean).join(' ') || 'quantité à confirmer';
}

function intentForType(type: ListingType): 'buy' | 'sell' {
  return type === 'offer' ? 'buy' : 'sell';
}

function intentLabel(type: ListingType) {
  return type === 'offer' ? 'Disponible' : 'Recherché';
}

function dateLabel(row: Listing) {
  return row.type === 'offer'
    ? `Disponible jusqu'au ${formatDate(row.expires_at)}`
    : `Recherché pour le ${formatDate(row.available_from)}`;
}

function termsForAlert(alert: SolutionAlert | null | undefined) {
  if (!alert) return [];

  return Array.from(
    new Set(
      alert.affectedCategories.flatMap((category) => {
        const key = normalizedKey(category);
        return [category, key, ...(CATEGORY_ALIASES[key] ?? [])].map(normalize);
      }),
    ),
  ).filter(Boolean);
}

function solvesAlert(row: Listing, terms: string[]) {
  if (row.type !== 'offer' || terms.length === 0) return false;

  const haystack = normalize(
    [row.product_category, row.product_name, row.notes ?? ''].filter(Boolean).join(' '),
  );

  return terms.some((term) => haystack.includes(term));
}

export default function NetworkClient({ profile, rows, solutionAlert = null }: NetworkClientProps) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { open } = useContactModal() as { open: (supplier: string) => void };

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;
  const solutionMode = Boolean(solutionAlert);
  const alertTerms = useMemo(() => termsForAlert(solutionAlert), [solutionAlert]);

  const rankedRows = useMemo<NetworkRow[]>(
    () =>
      rows
        .filter((row) => row.profiles)
        .map((row) => ({
          ...row,
          distance_km: distanceKm(originLat, originLng, row.profiles.lat, row.profiles.lng),
        }))
        .sort((a, b) => a.distance_km - b.distance_km),
    [originLat, originLng, rows],
  );

  const visible = useMemo(() => {
    if (solutionMode) {
      return rankedRows.filter(
        (row) => row.owner_id !== profile?.id && solvesAlert(row, alertTerms),
      );
    }

    if (filter === 'available') return rankedRows.filter((row) => row.type === 'offer');
    if (filter === 'wanted') return rankedRows.filter((row) => row.type === 'need');
    return rankedRows;
  }, [alertTerms, filter, profile?.id, rankedRows, solutionMode]);

  const selected = visible.find((row) => row.id === selectedId) ?? visible[0] ?? null;
  const selectedForMap = selected?.id ?? null;

  const pins: PinDef[] = useMemo(
    () =>
      visible
        .filter((r) => r.profiles.lat != null && r.profiles.lng != null)
        .map((r) => ({
          id: r.id,
          lat: r.profiles.lat as number,
          lng: r.profiles.lng as number,
          type: r.type,
          intent: intentForType(r.type),
          label: `${r.profiles.name} · ${r.product_name}`,
        })),
    [visible],
  );

  const availableCount = rankedRows.filter((r) => r.type === 'offer').length;
  const wantedCount = rankedRows.filter((r) => r.type === 'need').length;

  function contact(row: NetworkRow) {
    open(row.profiles.name);
  }

  return (
    <section className="mx-auto w-full max-w-[1280px]">
      {solutionMode && solutionAlert ? (
        <div className="mb-5 rounded-xl border border-green/25 bg-green-soft p-4 shadow-level-1 md:flex md:items-center md:justify-between md:gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.08em] text-green">
              Mode solution
            </p>
            <h1 className="mt-1 text-h1 text-text-primary">
              Solutions pour&nbsp;: {solutionAlert.title}
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-green/25 bg-white px-4 text-sm font-semibold text-green transition-colors hover:bg-bg-subtle md:mt-0"
          >
            Retour aux Alertes
          </Link>
        </div>
      ) : (
        <div className="mb-7">
          <h1 className="text-h1 text-text-primary">Carte réseau</h1>
          <p className="mt-1 text-body-sm text-text-muted">
            {rankedRows.length} annonce{rankedRows.length > 1 ? 's' : ''} active
            {rankedRows.length > 1 ? 's' : ''} autour de vous · {availableCount} disponible
            {availableCount > 1 ? 's' : ''}, {wantedCount} recherché
            {wantedCount > 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {!solutionMode && (
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tout" />
          <FilterChip active={filter === 'available'} onClick={() => setFilter('available')} label="Disponible" tone="buy" />
          <FilterChip active={filter === 'wanted'} onClick={() => setFilter('wanted')} label="Recherché" tone="sell" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col rounded-xl border border-border-default bg-white p-3 shadow-level-1">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-green" aria-hidden="true" />
              <span className="text-body-sm font-semibold text-text-primary">
                {solutionMode ? 'Carte des solutions' : 'Vue carte'}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-text-muted">
              <LegendDot tone="buy" label="Disponible" />
              <LegendDot tone="sell" label="Recherché" />
            </div>
          </div>

          <MapView
            origin={{ lat: originLat, lng: originLng }}
            pins={pins}
            selectedId={selectedForMap}
            onSelect={setSelectedId}
            className="h-[calc(100vh-260px)] min-h-[520px] w-full overflow-hidden rounded-[10px] border border-border-emphasized"
          />
        </div>

        <aside className="flex flex-col gap-3 xl:max-h-[calc(100vh-260px)] xl:overflow-y-auto xl:pr-1">
          <div className="rounded-xl border border-border-default bg-white p-4 shadow-level-1">
            <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
              Détail sélectionné
            </div>

            {selected ? (
              <SelectedListing row={selected} onContact={() => contact(selected)} />
            ) : (
              <p className="mt-3 text-sm leading-6 text-text-muted">
                {solutionMode
                  ? 'Aucune solution disponible pour cette alerte avec les stocks visibles.'
                  : 'Sélectionnez une annonce sur la carte ou dans la liste.'}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border-default bg-white p-4 shadow-level-1">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">
                {solutionMode ? 'Solutions visibles' : 'Annonces visibles'}
              </div>
              <span className="rounded-full border border-border-default bg-bg-subtle px-2.5 py-1 text-xs font-semibold text-text-secondary">
                {visible.length}
              </span>
            </div>

            {visible.length === 0 ? (
              <div className="rounded-lg border border-border-default bg-bg-subtle p-6 text-center text-sm text-text-muted">
                {solutionMode
                  ? 'Aucun fournisseur ne correspond aux produits impactés.'
                  : 'Aucune annonce dans cette catégorie.'}
              </div>
            ) : (
              <div className="grid gap-3">
                {visible.map((row) => (
                  <ListingCard
                    key={row.id}
                    row={row}
                    selected={selectedForMap === row.id}
                    onSelect={() => setSelectedId(row.id)}
                    onContact={() => contact(row)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tone = 'neutral',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: 'neutral' | 'buy' | 'sell';
}) {
  const activeClass =
    tone === 'sell'
      ? 'border-critical bg-critical-bg text-critical'
      : tone === 'buy'
        ? 'border-green bg-green-soft text-green'
        : 'border-text-primary bg-text-primary text-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition-colors ${
        active
          ? activeClass
          : 'border-border-default bg-white text-text-secondary hover:border-border-emphasized hover:bg-bg-subtle'
      }`}
    >
      {label}
    </button>
  );
}

function LegendDot({ tone, label }: { tone: 'buy' | 'sell'; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full border ${
          tone === 'buy' ? 'border-green bg-green-soft' : 'border-critical bg-critical-bg'
        }`}
      />
      {label}
    </span>
  );
}

function IntentPill({ type }: { type: ListingType }) {
  const intent = intentForType(type);

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        intent === 'buy'
          ? 'border-green/25 bg-green-soft text-green'
          : 'border-critical/25 bg-critical-bg text-critical'
      }`}
    >
      {intentLabel(type)}
    </span>
  );
}

function SelectedListing({ row, onContact }: { row: NetworkRow; onContact: () => void }) {
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-h2 text-text-primary">{row.product_name}</h2>
          <p className="mt-1 text-sm text-text-muted">{row.profiles.name}</p>
        </div>
        <IntentPill type={row.type} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <DetailLine label="Distance" value={formatDistance(row.distance_km)} />
        <DetailLine label="Quantité" value={quantityLabel(row)} />
        <DetailLine label="Disponibilité" value={dateLabel(row)} />
        <DetailLine label="Profil" value={ROLE_LABEL[row.profiles.role] ?? row.profiles.role} />
        {row.profiles.address && <DetailLine label="Adresse" value={row.profiles.address} />}
      </dl>

      <button
        type="button"
        onClick={onContact}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-green px-4 text-sm font-bold text-white transition-colors hover:bg-green-dark"
      >
        Contacter
      </button>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 rounded-lg bg-bg-subtle px-3 py-2">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function ListingCard({
  row,
  selected,
  onSelect,
  onContact,
}: {
  row: NetworkRow;
  selected: boolean;
  onSelect: () => void;
  onContact: () => void;
}) {
  const intent = intentForType(row.type);

  return (
    <article
      className={`rounded-xl border bg-white p-3 transition-all duration-180 ${
        selected ? 'border-green shadow-level-1' : 'border-border-default hover:border-border-emphasized'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="grid w-full cursor-pointer grid-cols-[auto_1fr] gap-3 text-left focus-visible:outline-none"
      >
        <span
          className={`mt-1 h-4 w-4 rounded-full border-2 ${
            intent === 'buy' ? 'border-green bg-green-soft' : 'border-critical bg-critical-bg'
          }`}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-text-primary">{row.product_name}</span>
            <IntentPill type={row.type} />
          </span>
          <span className="mt-1 block truncate text-sm text-text-muted">{row.profiles.name}</span>
          <span className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
            <span>{formatDistance(row.distance_km)}</span>
            <span>{quantityLabel(row)}</span>
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onContact}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-green/25 bg-green-soft px-4 text-sm font-bold text-green transition-colors hover:border-green hover:bg-white"
      >
        Contacter
      </button>
    </article>
  );
}
