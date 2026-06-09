'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeftRight,
  Check,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';
import type { Listing, ListingType, Profile } from '../types';
import { useContactModal } from './ContactModalProvider';
import { DailyTabButton, type DailyTab } from './daily/DailyTabs';
import { StatePill } from './ui/badges';
import { PrimaryButton } from './ui/buttons';
import {
  EmptyState,
  InlineError,
} from './ui/feedback';
import {
  FieldLabel,
  SearchInput,
  fieldClass,
} from './ui/forms';
import { useToast } from './ui/toast-provider';

type SearchIntent = 'need' | 'offer';

const QUALITY_LABELS = [
  'AB',
  'Eurofeuille',
  'Label Rouge',
  'AOP',
  'AOC',
  'IGP',
  'STG',
  'HVE',
  'Demeter',
] as const;

type QualityLabel = (typeof QUALITY_LABELS)[number];

type ListingRow = Listing & {
  profiles: Profile | null;
};

type MatchRow = Listing & {
  profile: Profile;
  distance_km: number;
  score: number;
};

interface ExchangeWorkspaceProps {
  userId: string;
  profile: Profile | null;
  initialListings?: Listing[];
  activeCount?: number;
}

const STORE_LAT = 48.6833;
const STORE_LNG = 2.1333;

const UNIT_OPTIONS = ['palettes', 'cartons', 'caisses', 'kg', 'unités'];

const inputClass = fieldClass;

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
    .trim();
}

function formatDistance(km: number) {
  if (!Number.isFinite(km)) return 'distance inconnue';
  return `${Math.round(km * 10) / 10} km`;
}

function formatExpiry(date: string | null) {
  if (!date) return 'disponibilité à confirmer';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(
    new Date(date),
  );
}

function listingInfoLine(listing: Listing) {
  const qty = [listing.quantity, listing.unit].filter(Boolean).join(' ');
  return [qty || 'quantité à confirmer', formatExpiry(listing.expires_at)].join(' · ');
}

function typeLabel(type: ListingType) {
  return type === 'offer' ? 'Surplus disponible' : 'Besoin signalé';
}

function targetTypeFor(intent: SearchIntent): ListingType {
  return intent === 'need' ? 'offer' : 'need';
}

function scoreRow(row: ListingRow, query: string) {
  const q = normalize(query);
  if (!q) return 0;

  const category = normalize(row.product_category);
  const product = normalize(row.product_name);
  const notes = normalize(row.notes ?? '');

  if (category === q) return 100;
  if (product === q) return 95;
  if (category.includes(q)) return 80;
  if (product.includes(q)) return 70;
  if (notes.includes(q)) return 35;
  return -1;
}

function buildMatches(rows: ListingRow[], intent: SearchIntent, query: string, profile: Profile | null, userId: string) {
  const originLat = profile?.lat ?? STORE_LAT;
  const originLng = profile?.lng ?? STORE_LNG;
  const targetType = targetTypeFor(intent);

  return rows
    .filter((row) => row.type === targetType && row.owner_id !== userId && row.profiles)
    .map((row) => {
      const score = scoreRow(row, query);
      if (score < 0) return null;

      const { profiles, ...listing } = row;
      return {
        ...listing,
        profile: profiles as Profile,
        distance_km: distanceKm(originLat, originLng, profiles?.lat ?? null, profiles?.lng ?? null),
        score,
      };
    })
    .filter((row): row is MatchRow => row !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.distance_km - b.distance_km;
    })
    .slice(0, 8);
}

export default function ExchangeWorkspace({
  userId,
  profile,
  initialListings = [],
  activeCount = initialListings.length,
}: ExchangeWorkspaceProps) {
  const { open } = useContactModal() as { open: (supplier: string) => void };
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DailyTab>('publish');
  const [intent, setIntent] = useState<SearchIntent>('need');
  const [query, setQuery] = useState('eau');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [myListingsLoading, setMyListingsLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'score' | 'freshness'>('score');

  const [listingType, setListingType] = useState<ListingType>('need');
  const [productCategory, setProductCategory] = useState('eau');
  const [productName, setProductName] = useState('Eaux minérales 1.5 L');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('palettes');
  const [expiresAt, setExpiresAt] = useState('');
  const [radiusKm, setRadiusKm] = useState('15');
  const [unlimitedDistance, setUnlimitedDistance] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<QualityLabel[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const matches = useMemo(
    () => {
      if (!currentUserId) return [];

      const built = buildMatches(rows, intent, query, profile, currentUserId);
      return [...built].sort((a, b) => {
        if (sortBy === 'distance') return a.distance_km - b.distance_km;
        if (sortBy === 'freshness') {
          const aTime = a.expires_at ? new Date(a.expires_at).getTime() : Number.POSITIVE_INFINITY;
          const bTime = b.expires_at ? new Date(b.expires_at).getTime() : Number.POSITIVE_INFINITY;
          return aTime - bTime;
        }
        return b.score - a.score;
      });
    },
    [currentUserId, intent, profile, query, rows, sortBy],
  );

  const selected = matches.find((match) => match.id === selectedId) ?? matches[0] ?? null;

  async function resolveSessionUserId() {
    const {
      data: { user: sessionUser },
      error,
    } = await supabaseBrowser.auth.getUser();

    if (error) {
      setSearchError(error.message);
    }

    return userId || sessionUser?.id || null;
  }

  async function loadListings(ownerId: string) {
    if (!ownerId) {
      setMyListingsLoading(true);
      return;
    }

    setLoading(true);
    setMyListingsLoading(true);
    setSearchError(null);

    const [networkListings, ownListings] = await Promise.all([
      supabaseBrowser
        .from('listings')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(80),
      supabaseBrowser
        .from('listings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false }),
    ]);

    if (networkListings.error || ownListings.error) {
      setSearchError(networkListings.error?.message ?? ownListings.error?.message ?? 'Chargement impossible.');
      setMyListingsLoading(false);
      setLoading(false);
      return;
    }

    const nextRows = (networkListings.data ?? []) as unknown as ListingRow[];
    setRows(nextRows);
    setMyListings((ownListings.data ?? []) as Listing[]);
    setMyListingsLoading(false);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function boot() {
      setSessionLoading(true);
      const resolvedUserId = await resolveSessionUserId();
      if (!active) return;

      if (!resolvedUserId) {
        setCurrentUserId(null);
        setMyListings([]);
        setSessionLoading(false);
        setMyListingsLoading(true);
        return;
      }

      setCurrentUserId(resolvedUserId);
      setSessionLoading(false);
      await loadListings(resolvedUserId);
    }

    void boot();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const nextUserId = userId || session?.user?.id || null;

      if (!nextUserId) {
        setCurrentUserId(null);
        setMyListings([]);
        setSessionLoading(false);
        setMyListingsLoading(true);
        return;
      }

      setCurrentUserId(nextUserId);
      setSessionLoading(false);
      void loadListings(nextUserId);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    setSelectedId(matches[0]?.id ?? null);
  }, [intent, query, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onCreateListing(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveMessage(null);

    if (!profile) {
      setSaveError('Votre profil organisation est manquant. Reconnectez-vous ou recréez le profil avant de publier.');
      return;
    }

    if (!currentUserId) {
      setSaveError('Session en cours de chargement. Réessayez dans un instant.');
      return;
    }

    setSaving(true);

    const parsedQuantity = quantity.trim() ? Number.parseInt(quantity, 10) : null;
    const { error } = await supabaseBrowser.from('listings').insert({
      owner_id: currentUserId,
      type: listingType,
      product_category: productCategory.trim(),
      product_name: productName.trim(),
      quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : null,
      unit: unit.trim() || null,
      expires_at: expiresAt || null,
      notes: notes.trim() || null,
      labels: selectedLabels,
      available_from: new Date().toISOString().slice(0, 10),
    });

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setSaveMessage(`${typeLabel(listingType)} publié.`);
    showToast({
      tone: 'success',
      title: 'Publication enregistrée',
      message: 'Visible par votre réseau dans la minute.',
    });
    setIntent(listingType === 'need' ? 'need' : 'offer');
    setQuery(productCategory);
    setNotes('');
    setSelectedLabels([]);
    await loadListings(currentUserId);
    setSaving(false);
  }

  const myNeeds = myListings.filter((listing) => listing.type === 'need');
  const myOffers = myListings.filter((listing) => listing.type === 'offer');
  const selectedDemand = myNeeds.find((listing) => listing.id === selectedDemandId) ?? myNeeds[0] ?? null;
  const panelMatches = matches.slice(0, 5);
  const myListingsPending = sessionLoading || myListingsLoading || !currentUserId;

  function selectDemand(listing: Listing) {
    setSelectedDemandId(listing.id);
    setIntent('need');
    setQuery(listing.product_category);
    setActiveTab('matches');
  }

  function handleDeleted(id: string) {
    // TODO: wire Supabase deletion after the demo; this v1 flow is state-only.
    setMyListings((current) => current.filter((listing) => listing.id !== id));
    setRows((current) => current.filter((listing) => listing.id !== id));
    showToast({
      tone: 'success',
      title: 'Publication supprimée',
    });
  }

  function toggleLabel(label: QualityLabel) {
    setSelectedLabels((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }

  function renderLabelChips(labels: string[] | null | undefined) {
    const visibleLabels = labels ?? [];
    if (visibleLabels.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {visibleLabels.map((label) => (
          <span
            key={label}
            className="inline-block max-w-36 truncate rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium leading-5 text-gray-600"
          >
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1280px]">
      <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-border-default bg-bg-subtle p-2" role="tablist" aria-label="Gestion des stocks">
        <DailyTabButton id="publish" active={activeTab === 'publish'} icon={Plus} label="Publier une demande" onClick={setActiveTab} />
        <DailyTabButton id="matches" active={activeTab === 'matches'} icon={ArrowLeftRight} label="Acheter" onClick={setActiveTab} />
      </div>

      {activeTab === 'publish' && (
        <div className="grid animate-fade-in gap-6 xl:grid-cols-[440px_1fr]">
          <form onSubmit={onCreateListing} className="rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
            <div className="mb-5">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-green">Nouveau signal</p>
              <h2 className="mt-1 text-h2 text-text-primary">Publier ce que vous cherchez ou proposez</h2>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border-default bg-bg-subtle p-1">
              <button
                type="button"
                onClick={() => {
                  setListingType('need');
                  setIntent('need');
                }}
                className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                  listingType === 'need' ? 'bg-white text-green shadow-level-1' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <TrendingUp size={16} aria-hidden="true" />
                J&apos;achète
              </button>
              <button
                type="button"
                onClick={() => {
                  setListingType('offer');
                  setIntent('offer');
                }}
                className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                  listingType === 'offer' ? 'bg-white text-critical shadow-level-1' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <TrendingDown size={16} aria-hidden="true" />
                Je vends
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <FieldLabel>Produit</FieldLabel>
                <input required list="daily-products" value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} />
                <datalist id="daily-products">
                  <option value="Eaux minérales 1.5 L" />
                  <option value="Lait demi-écrémé 1 L" />
                  <option value="Sorbets fruits rouges" />
                  <option value="Fruits et légumes bio" />
                </datalist>
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>Quantité</FieldLabel>
                <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" className={inputClass} />
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>Unité</FieldLabel>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}>
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <FieldLabel>Délai souhaité</FieldLabel>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} />
              </label>
            </div>

            <section className="mt-5 flex flex-col gap-2" aria-labelledby="quality-labels-heading">
              <FieldLabel>
                <span id="quality-labels-heading">Labels (optionnel)</span>
              </FieldLabel>
              <div className="flex flex-wrap gap-2">
                {QUALITY_LABELS.map((label) => {
                  const selected = selectedLabels.includes(label);

                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleLabel(label)}
                      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${
                        selected
                          ? 'border-[0.5px] border-text-primary bg-gray-100 text-text-primary'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-text-primary'
                      }`}
                    >
                      {selected && <Check size={12} aria-hidden="true" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mt-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>
                  Rayon de recherche : {unlimitedDistance ? 'illimité' : `${radiusKm} km`}
                </FieldLabel>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-secondary">
                  <input
                    type="checkbox"
                    checked={unlimitedDistance}
                    onChange={(e) => setUnlimitedDistance(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default accent-green"
                  />
                  Distance illimitée
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                disabled={unlimitedDistance}
                className="h-11 accent-green disabled:cursor-not-allowed disabled:opacity-45"
              />
            </div>

            {saveError && <InlineError>{saveError}</InlineError>}
            {saveMessage && (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green" role="status">
                <Check size={16} aria-hidden="true" />
                {saveMessage}
              </div>
            )}

            <PrimaryButton type="submit" disabled={saving} className="mt-5 w-full">
              {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              + Publier ma demande
            </PrimaryButton>
          </form>

          <section className="rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Mes publications actives</p>
                <h2 className="mt-1 text-h2 text-text-primary">Demandes et offres visibles par le réseau</h2>
              </div>
            </div>

            {myListingsPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border-default bg-bg-subtle p-6 text-sm font-semibold text-text-muted">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Chargement des publications...
              </div>
            ) : myListings.length === 0 ? (
              <EmptyState title="Aucune publication active" description="Publiez un besoin ou un surplus pour le rendre visible aux magasins et producteurs proches." />
            ) : (
              <div className="grid gap-3">
                {myListings.slice(0, 5).map((listing) => {
                  const isBuying = listing.type === 'need';
                  const Icon = isBuying ? TrendingUp : TrendingDown;
                  return (
                    <div key={listing.id} className="grid gap-3 rounded-xl border border-border-default bg-bg-subtle p-4 transition-all duration-180 hover:-translate-y-0.5 hover:bg-white hover:shadow-level-1 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isBuying ? 'bg-green-soft text-green' : 'bg-critical-bg text-critical'}`}>
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text-primary">{listing.product_name}</div>
                        <div className="mt-1 text-sm text-text-muted">{listingInfoLine(listing)}</div>
                        {renderLabelChips(listing.labels)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            isBuying
                              ? 'border-green/20 bg-green-soft text-green'
                              : 'border-critical/20 bg-critical-bg text-critical'
                          }`}
                        >
                          {isBuying ? "J'achète" : 'Je vends'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleted(listing.id)}
                          title="Retirer ce signal"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted hover:text-red hover:bg-red-light border border-transparent hover:border-red-mid disabled:opacity-60 transition-colors"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="grid animate-fade-in gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Vos demandes</p>
              </div>
              <StatePill>
                {myListingsPending
                  ? 'Chargement'
                  : `${myNeeds.length} demande${myNeeds.length > 1 ? 's' : ''}`}
              </StatePill>
            </div>

            {myListingsPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-border-default bg-bg-subtle p-6 text-sm font-semibold text-text-muted">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Chargement des demandes...
              </div>
            ) : myNeeds.length === 0 ? (
              <EmptyState title="Aucune demande publiée" description="Publiez d'abord une demande pour faire apparaître les correspondances du réseau." />
            ) : (
              <div className="grid gap-3">
                {myNeeds.map((listing) => {
                  const active = selectedDemand?.id === listing.id;
                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => selectDemand(listing)}
                      className={`cursor-pointer rounded-xl border p-4 text-left transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                        active ? 'border-green bg-green-soft shadow-level-1' : 'border-border-default bg-bg-subtle hover:bg-white hover:shadow-level-1'
                      }`}
                    >
                      <div className="font-semibold text-text-primary">{listing.product_name}</div>
                      <div className="mt-1 text-sm text-text-muted">{listingInfoLine(listing)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
            <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Offres correspondantes</p>
                <h2 className="mt-1 text-h2 text-text-primary">{panelMatches.length} correspondance{panelMatches.length > 1 ? 's' : ''} à contacter</h2>
              </div>
              <label className="flex min-w-[220px] flex-col gap-2">
                <FieldLabel>Trier par</FieldLabel>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={inputClass}>
                  <option value="score">Score de match</option>
                  <option value="distance">Distance</option>
                  <option value="freshness">Fraîcheur</option>
                </select>
              </label>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="flex flex-col gap-2">
                <FieldLabel>Produit ou catégorie</FieldLabel>
                <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} placeholder="eau, légumes, pain..." />
              </label>
              <PrimaryButton
                type="button"
                onClick={() => {
                  if (currentUserId) void loadListings(currentUserId);
                }}
                disabled={loading || !currentUserId}
              >
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
                Matcher
              </PrimaryButton>
            </div>

            {searchError && <InlineError>{searchError}</InlineError>}

            {panelMatches.length === 0 ? (
              <EmptyState title="Aucune correspondance pour l'instant" description="Essayez une catégorie plus large ou publiez le signal pour prévenir le réseau." />
            ) : (
              <div className="grid gap-3">
                {panelMatches.map((match) => {
                  const active = selected?.id === match.id;
                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => setSelectedId(match.id)}
                      className={`relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                        active ? 'border-green bg-green-soft shadow-level-1' : 'border-border-default bg-bg-subtle hover:bg-white hover:shadow-level-1'
                      }`}
                    >
                      {active && <span className="absolute -left-3 top-1/2 h-px w-3 bg-green" aria-hidden="true" />}
                      <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green">
                          <Package size={18} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text-primary">{match.product_name}</div>
                          <div className="mt-1 text-sm text-text-muted">{match.profile.name} · {listingInfoLine(match)}</div>
                          {renderLabelChips(match.labels)}
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                            <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{formatDistance(match.distance_km)}</span>
                            <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{formatExpiry(match.expires_at)}</span>
                            <span>Prix suggéré : à négocier</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <StatePill tone={match.score >= 80 ? 'success' : 'neutral'}>{match.score} % match</StatePill>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selected && (
              <PrimaryButton type="button" onClick={() => open(selected.profile.name)} className="mt-5 w-full">
                <Phone size={16} aria-hidden="true" />
                Contacter {selected.profile.name}
              </PrimaryButton>
            )}
          </section>
        </div>
      )}

    </section>
  );
}
