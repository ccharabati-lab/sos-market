'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
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
} from 'lucide-react';
import { supabaseBrowser } from '../lib/supabase-browser';
import type { Listing, ListingType, Profile } from '../types';
import MapView, { type MapPin as MapPinDef } from './MapView';
import { useContactModal } from './ContactModalProvider';

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

const inputClass =
  'w-full bg-canvas border border-line rounded-lg px-3 py-2 text-[0.82rem] text-ink placeholder:text-muted focus:outline-none focus:border-green-bright focus:bg-paper transition-colors';

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

export default function ExchangeWorkspace({ userId, profile }: ExchangeWorkspaceProps) {
  const { open } = useContactModal() as { open: (supplier: string) => void };
  const [intent, setIntent] = useState<SearchIntent>('need');
  const [query, setQuery] = useState('eau');
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [listingType, setListingType] = useState<ListingType>('need');
  const [productCategory, setProductCategory] = useState('eau');
  const [productName, setProductName] = useState('Eaux minérales 1.5 L');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('palettes');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const matches = useMemo(
    () => buildMatches(rows, intent, query, profile, userId),
    [intent, profile, query, rows, userId],
  );

  const mapPins: MapPinDef[] = useMemo(
    () =>
      matches
        .filter((m) => m.profile.lat != null && m.profile.lng != null)
        .map((m) => ({
          id: m.id,
          lat: m.profile.lat as number,
          lng: m.profile.lng as number,
          type: m.type,
          label: m.profile.name,
        })),
    [matches],
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

    setRows((data ?? []) as unknown as ListingRow[]);
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
    setIntent(listingType === 'need' ? 'need' : 'offer');
    setQuery(productCategory);
    setNotes('');
    await loadListings();
    setSaving(false);
  }

  return (
    <section className="bg-paper border border-line rounded-xl p-5 mb-8">
      <div className="flex items-start justify-between gap-5 mb-5">
        <div>
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-green mb-1">
            Échanges réseau
          </div>
          <h2 className="text-[1.05rem] font-extrabold text-ink">
            Publier un besoin et trouver le stock disponible
          </h2>
        </div>
        <button
          type="button"
          onClick={loadListings}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-canvas text-ink-soft border border-line-strong rounded-lg px-3 py-2 text-[0.78rem] font-semibold hover:border-green-bright hover:bg-green-light hover:text-green disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5 items-start">
        <form onSubmit={onCreateListing} className="bg-canvas border border-line rounded-[10px] p-4">
          <div className="flex items-center gap-2 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-muted mb-4">
            <Plus size={14} />
            Nouveau signal
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setListingType('need')}
              className={`flex items-center justify-center gap-2 border rounded-lg py-2 text-[0.78rem] font-bold transition-colors ${
                listingType === 'need'
                  ? 'bg-red-light border-red-mid text-red'
                  : 'bg-paper border-line text-muted hover:border-line-strong'
              }`}
            >
              <TrendingDown size={14} />
              Besoin
            </button>
            <button
              type="button"
              onClick={() => setListingType('offer')}
              className={`flex items-center justify-center gap-2 border rounded-lg py-2 text-[0.78rem] font-bold transition-colors ${
                listingType === 'offer'
                  ? 'bg-green-light border-green-mid text-green'
                  : 'bg-paper border-line text-muted hover:border-line-strong'
              }`}
            >
              <TrendingUp size={14} />
              Surplus
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-semibold text-ink-soft">Catégorie</span>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-semibold text-ink-soft">Quantité</span>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 mt-3">
            <span className="text-[0.72rem] font-semibold text-ink-soft">Produit</span>
            <input
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-semibold text-ink-soft">Unité</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass}>
                {UNIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-semibold text-ink-soft">Fin dispo.</span>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 mt-3">
            <span className="text-[0.72rem] font-semibold text-ink-soft">Note</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="DLC courte, livraison possible, urgence..."
              className={`${inputClass} resize-none`}
            />
          </label>

          {saveError && (
            <div className="mt-3 flex items-start gap-2 text-[0.76rem] text-red">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {saveError}
            </div>
          )}

          {saveMessage && (
            <div className="mt-3 flex items-center gap-2 text-[0.76rem] text-green font-semibold">
              <Check size={14} />
              {saveMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-2.5 text-[0.84rem] font-bold cursor-pointer hover:bg-green-bright disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Publier et chercher les matchs
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="bg-canvas border border-line rounded-[10px] p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-3 items-end">
              <div className="flex bg-paper border border-line rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setIntent('need')}
                  className={`px-3 py-1.5 rounded-md text-[0.76rem] font-bold transition-colors ${
                    intent === 'need' ? 'bg-green-light text-green' : 'text-muted hover:text-ink-soft'
                  }`}
                >
                  Je cherche
                </button>
                <button
                  type="button"
                  onClick={() => setIntent('offer')}
                  className={`px-3 py-1.5 rounded-md text-[0.76rem] font-bold transition-colors ${
                    intent === 'offer' ? 'bg-green-light text-green' : 'text-muted hover:text-ink-soft'
                  }`}
                >
                  J&apos;ai un surplus
                </button>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-semibold text-ink-soft">Produit ou catégorie</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="eau, légumes, pain..."
                  className={inputClass}
                />
              </label>

              <button
                type="button"
                onClick={loadListings}
                disabled={loading}
                className="inline-flex h-[38px] items-center justify-center gap-2 bg-green text-white rounded-lg px-4 text-[0.8rem] font-bold hover:bg-green-bright disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                Matcher
              </button>
            </div>

            {searchError && (
              <div className="mt-3 flex items-start gap-2 text-[0.76rem] text-red">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {searchError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr] gap-4">
            <MapView
              origin={{ lat: profile?.lat ?? STORE_LAT, lng: profile?.lng ?? STORE_LNG }}
              pins={mapPins}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              className="w-full aspect-[16/12] rounded-[10px] overflow-hidden border border-line"
            />

            <div className="flex flex-col gap-2 min-h-[250px]">
              <div className="flex items-center justify-between">
                <div className="text-[0.76rem] font-bold uppercase tracking-[0.1em] text-muted">
                  {matches.length} match{matches.length > 1 ? 's' : ''}
                </div>
                <div className="text-[0.72rem] text-muted">
                  cible : {targetTypeFor(intent) === 'offer' ? 'surplus' : 'besoins'}
                </div>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-[0.8rem] text-muted py-4">
                  <Loader2 size={15} className="animate-spin" />
                  Recherche en cours...
                </div>
              )}

              {!loading && matches.length === 0 && (
                <div className="bg-paper border border-line rounded-lg p-4 text-[0.82rem] text-muted">
                  Aucun match trouvé. Essayez une catégorie plus large ou publiez le signal pour informer le réseau.
                </div>
              )}

              {!loading &&
                matches.map((match) => {
                  const active = selected?.id === match.id;
                  const quantityLabel = [match.quantity, match.unit].filter(Boolean).join(' ');
                  return (
                    <button
                      key={match.id}
                      type="button"
                      onClick={() => setSelectedId(match.id)}
                      className={`text-left bg-paper border rounded-lg p-3 transition-colors ${
                        active
                          ? 'border-green-bright bg-green-light'
                          : 'border-line hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            active ? 'bg-green-mid text-green' : 'bg-canvas-soft text-muted'
                          }`}
                        >
                          <Package size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[0.84rem] font-bold text-ink truncate">
                            {match.product_name}
                          </div>
                          <div className="text-[0.73rem] text-muted mt-0.5">
                            {match.profile.name} · {quantityLabel || 'quantité à confirmer'}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[0.7rem] text-muted">
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} />
                              {formatDistance(match.distance_km)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} />
                              {formatExpiry(match.expires_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

              {selected && (
                <button
                  type="button"
                  onClick={() => open(selected.profile.name)}
                  className="mt-auto w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-2.5 text-[0.84rem] font-bold cursor-pointer hover:bg-green-bright transition-colors"
                >
                  <Phone size={14} />
                  Contacter {selected.profile.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
