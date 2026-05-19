'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Clock,
  Loader2,
  Map,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';
import type { Listing, ListingType, Profile } from '../types';
import MapView, { type MapPin as MapPinDef } from './MapView';
import { useContactModal } from './ContactModalProvider';
import { DailyTabButton, type DailyTab } from './daily/DailyTabs';
import {
  CategoryPill,
  StatePill,
} from './ui/badges';
import { PrimaryButton, SecondaryButton } from './ui/buttons';
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

const CATEGORY_OPTIONS = [
  'eau',
  'boissons',
  'légumes',
  'fruits',
  'pain',
  'produits laitiers',
  'céréales',
  'épicerie',
];

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
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'score' | 'freshness'>('score');
  const [mapFilter, setMapFilter] = useState<'all' | 'need' | 'offer' | 'mine'>('all');

  const [listingType, setListingType] = useState<ListingType>('need');
  const [productCategory, setProductCategory] = useState('eau');
  const [productName, setProductName] = useState('Eaux minérales 1.5 L');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('palettes');
  const [expiresAt, setExpiresAt] = useState('');
  const [radiusKm, setRadiusKm] = useState('15');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const matches = useMemo(
    () => {
      const built = buildMatches(rows, intent, query, profile, userId);
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
    [intent, profile, query, rows, sortBy, userId],
  );

  const mapPins: MapPinDef[] = useMemo(
    () =>
      matches
        .filter((m) => mapFilter === 'all' || mapFilter === m.type || (mapFilter === 'mine' && m.owner_id === userId))
        .filter((m) => m.profile.lat != null && m.profile.lng != null)
        .map((m) => ({
          id: m.id,
          lat: m.profile.lat as number,
          lng: m.profile.lng as number,
          type: m.type,
          label: m.profile.name,
        })),
    [mapFilter, matches, userId],
  );

  const selected = matches.find((match) => match.id === selectedId) ?? matches[0] ?? null;

  async function loadListings() {
    setLoading(true);
    setSearchError(null);

    const { data, error } = await supabaseBrowser
      .from('listings')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) {
      setSearchError(error.message);
      setLoading(false);
      return;
    }

    const nextRows = (data ?? []) as unknown as ListingRow[];
    setRows(nextRows);
    setMyListings(nextRows.filter((row) => row.owner_id === userId));
    setLoading(false);
  }

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    setSaving(true);

    const parsedQuantity = quantity.trim() ? Number.parseInt(quantity, 10) : null;
    const { error } = await supabaseBrowser.from('listings').insert({
      owner_id: userId,
      type: listingType,
      product_category: productCategory.trim(),
      product_name: productName.trim(),
      quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : null,
      unit: unit.trim() || null,
      expires_at: expiresAt || null,
      notes: notes.trim() || null,
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
    await loadListings();
    setSaving(false);
  }

  const myNeeds = myListings.filter((listing) => listing.type === 'need');
  const myOffers = myListings.filter((listing) => listing.type === 'offer');
  const selectedDemand = myNeeds.find((listing) => listing.id === selectedDemandId) ?? myNeeds[0] ?? null;
  const panelMatches = matches.slice(0, 5);

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

  return (
    <section className="mx-auto w-full max-w-[1280px]">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-display text-text-primary">Gestion des stocks quotidienne</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          {activeCount === 0
            ? 'Publiez vos surplus et besoins pour que le réseau les voie en temps réel.'
            : `${activeCount} publication${activeCount > 1 ? 's' : ''} active${activeCount > 1 ? 's' : ''} dans votre réseau · Mis à jour à l'instant`}
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-border-default bg-bg-subtle p-2" role="tablist" aria-label="Gestion des stocks">
        <DailyTabButton id="publish" active={activeTab === 'publish'} icon={Plus} label="Publier une demande" onClick={setActiveTab} />
        <DailyTabButton id="matches" active={activeTab === 'matches'} icon={ArrowLeftRight} label="Correspondances" onClick={setActiveTab} />
        <DailyTabButton id="map" active={activeTab === 'map'} icon={Map} label="Carte du réseau" onClick={setActiveTab} />
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
                  listingType === 'need' ? 'bg-white text-critical shadow-level-1' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <TrendingDown size={16} aria-hidden="true" />
                Je cherche
              </button>
              <button
                type="button"
                onClick={() => {
                  setListingType('offer');
                  setIntent('offer');
                }}
                className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                  listingType === 'offer' ? 'bg-white text-green shadow-level-1' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <TrendingUp size={16} aria-hidden="true" />
                Je propose
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <FieldLabel>Catégorie</FieldLabel>
                <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className={inputClass}>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

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

              <label className="flex flex-col gap-2">
                <FieldLabel>Rayon de recherche : {radiusKm} km</FieldLabel>
                <input type="range" min="5" max="30" step="5" value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className="h-11 accent-green" />
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-2">
              <FieldLabel>Notes</FieldLabel>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="DLC courte, livraison possible, urgence..." className={`${inputClass} resize-none`} />
            </label>

            {saveError && <InlineError>{saveError}</InlineError>}
            {saveMessage && (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green" role="status">
                <Check size={16} aria-hidden="true" />
                {saveMessage}
              </div>
            )}

            <PrimaryButton type="submit" disabled={saving} className="mt-5 w-full">
              {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
              Publier ma demande
            </PrimaryButton>
          </form>

          <section className="rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Mes publications actives</p>
                <h2 className="mt-1 text-h2 text-text-primary">Demandes et offres visibles par le réseau</h2>
              </div>
              <SecondaryButton type="button" onClick={loadListings} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
                Actualiser
              </SecondaryButton>
            </div>

            {myListings.length === 0 ? (
              <EmptyState title="Aucune publication active" description="Publiez un besoin ou un surplus pour le rendre visible aux magasins et producteurs proches." />
            ) : (
              <div className="grid gap-3">
                {myListings.slice(0, 5).map((listing) => {
                  const isOffer = listing.type === 'offer';
                  const Icon = isOffer ? TrendingUp : TrendingDown;
                  const qty = [listing.quantity, listing.unit].filter(Boolean).join(' ');
                  return (
                    <div key={listing.id} className="grid gap-3 rounded-xl border border-border-default bg-bg-subtle p-4 transition-all duration-180 hover:-translate-y-0.5 hover:bg-white hover:shadow-level-1 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOffer ? 'bg-green-soft text-green' : 'bg-critical-bg text-critical'}`}>
                        <Icon size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text-primary">{listing.product_name}</div>
                        <div className="mt-1 text-sm text-text-muted">{listing.product_category}{qty ? ` · ${qty}` : ''} · {formatExpiry(listing.expires_at)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatePill tone={isOffer ? 'success' : 'warning'}>{isOffer ? 'En proposition' : 'En recherche'}</StatePill>
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
                <h2 className="mt-1 text-h2 text-text-primary">À approvisionner</h2>
              </div>
              <StatePill>{myNeeds.length} demande{myNeeds.length > 1 ? 's' : ''}</StatePill>
            </div>

            {myNeeds.length === 0 ? (
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
                      <div className="mt-1 text-sm text-text-muted">{listing.product_category} · {[listing.quantity, listing.unit].filter(Boolean).join(' ') || 'quantité à confirmer'}</div>
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
              <PrimaryButton type="button" onClick={loadListings} disabled={loading}>
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
                  const quantityLabel = [match.quantity, match.unit].filter(Boolean).join(' ');
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
                          <div className="mt-1 text-sm text-text-muted">{match.profile.name} · {quantityLabel || 'quantité à confirmer'}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                            <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{formatDistance(match.distance_km)}</span>
                            <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden="true" />{formatExpiry(match.expires_at)}</span>
                            <span>Prix suggéré : à négocier</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <StatePill tone={match.score >= 80 ? 'success' : 'neutral'}>{match.score} % match</StatePill>
                          <span className="text-sm font-semibold text-green">Contacter</span>
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

      {activeTab === 'map' && (
        <div className="animate-fade-in rounded-2xl border border-border-default bg-white p-6 shadow-level-1">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Carte du réseau</p>
              <h2 className="mt-1 text-h2 text-text-primary">Paris-Saclay et fournisseurs disponibles</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'Toutes'],
                ['need', 'Demandes'],
                ['offer', 'Offres'],
                ['mine', 'Mon magasin uniquement'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMapFilter(value as typeof mapFilter)}
                  className={`min-h-9 cursor-pointer rounded-full border px-3 text-sm font-semibold transition-all duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                    mapFilter === value ? 'border-green bg-green-soft text-green' : 'border-border-default bg-bg-subtle text-text-muted hover:bg-bg-muted hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
              {CATEGORY_OPTIONS.slice(0, 4).map((category) => (
                <CategoryPill key={category} clickable>{category}</CategoryPill>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
            <MapView
              origin={{ lat: profile?.lat ?? STORE_LAT, lng: profile?.lng ?? STORE_LNG }}
              pins={mapPins}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              className="w-full min-h-[520px] overflow-hidden rounded-2xl border border-border-default"
            />

            <aside className="rounded-2xl border border-border-default bg-bg-subtle p-5">
              {selected ? (
                <div>
                  <StatePill tone="success">Vous êtes ici : Intermarché Gif</StatePill>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{selected.profile.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{selected.product_name} · {[selected.quantity, selected.unit].filter(Boolean).join(' ') || 'quantité à confirmer'}</p>
                  <div className="mt-4 grid gap-2 text-sm text-text-secondary">
                    <span>Distance : {formatDistance(selected.distance_km)}</span>
                    <span>Disponibilité : {formatExpiry(selected.expires_at)}</span>
                    <span>Score : {selected.score} %</span>
                  </div>
                  <PrimaryButton type="button" onClick={() => open(selected.profile.name)} className="mt-5 w-full">
                    <Phone size={16} aria-hidden="true" />
                    Contacter
                  </PrimaryButton>
                </div>
              ) : (
                <EmptyState title="Aucun point sélectionné" description="Cliquez sur une offre ou une demande de la carte pour afficher le détail." />
              )}
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}
