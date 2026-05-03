'use client';

import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, MapPin } from 'lucide-react';
import MapView, { type MapPin as PinDef } from '../../components/MapView';
import type { Listing, Profile } from '../../types';

const FALLBACK_LAT = 48.6833;
const FALLBACK_LNG = 2.1333;

interface NetworkClientProps {
  profile: Profile | null;
  rows: Array<Listing & { profiles: Profile }>;
}

const ROLE_LABEL: Record<string, string> = {
  supermarket: 'Supermarché',
  producer: 'Producteur',
  restaurant: 'Restaurant',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function NetworkClient({ profile, rows }: NetworkClientProps) {
  const [filter, setFilter] = useState<'all' | 'offer' | 'need'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.type === filter)),
    [rows, filter],
  );

  const originLat = profile?.lat ?? FALLBACK_LAT;
  const originLng = profile?.lng ?? FALLBACK_LNG;

  const pins: PinDef[] = useMemo(
    () =>
      visible
        .filter((r) => r.profiles.lat != null && r.profiles.lng != null)
        .map((r) => ({
          id: r.id,
          lat: r.profiles.lat as number,
          lng: r.profiles.lng as number,
          type: r.type,
          label: `${r.profiles.name} · ${r.product_name}`,
        })),
    [visible],
  );

  const offerCount = rows.filter((r) => r.type === 'offer').length;
  const needCount = rows.filter((r) => r.type === 'need').length;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[1.3rem] font-extrabold text-ink">Carte réseau</h1>
        <p className="text-[0.83rem] text-muted mt-1">
          {rows.length} annonce{rows.length > 1 ? 's' : ''} actives autour de vous —{' '}
          {offerCount} offre{offerCount > 1 ? 's' : ''}, {needCount} demande
          {needCount > 1 ? 's' : ''}.
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} label={`Tout (${rows.length})`} />
        <FilterTab
          active={filter === 'offer'}
          onClick={() => setFilter('offer')}
          label={`Offres (${offerCount})`}
        />
        <FilterTab
          active={filter === 'need'}
          onClick={() => setFilter('need')}
          label={`Demandes (${needCount})`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
        <div className="bg-paper border border-line rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-green" />
              <span className="text-[0.78rem] font-bold text-ink">Vue carte</span>
            </div>
            <div className="flex gap-3 text-[0.7rem] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-light border border-green-bright" />
                Offre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-light border border-red" />
                Demande
              </span>
            </div>
          </div>

          <MapView
            origin={{ lat: originLat, lng: originLng }}
            pins={pins}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="w-full h-[calc(100vh-260px)] min-h-[520px] rounded-[10px] overflow-hidden border border-line-strong"
          />
        </div>

        <div className="flex flex-col gap-2 xl:max-h-[calc(100vh-260px)] xl:overflow-y-auto xl:pr-1">
          <div className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted px-1 mb-1">
            {visible.length} annonce{visible.length > 1 ? 's' : ''}
          </div>
          {visible.length === 0 ? (
            <div className="bg-paper border border-line rounded-xl p-8 text-center text-muted text-[0.85rem]">
              Aucune annonce dans cette catégorie.
            </div>
          ) : (
            visible.map((row) => (
              <ListingRow
                key={row.id}
                row={row}
                selected={selectedId === row.id}
                onClick={() => setSelectedId(row.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function FilterTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-[0.78rem] font-semibold transition-colors ${
        active
          ? 'bg-ink text-white'
          : 'bg-paper border border-line text-ink-soft hover:bg-canvas-soft'
      }`}
    >
      {label}
    </button>
  );
}

function ListingRow({
  row,
  selected,
  onClick,
}: {
  row: Listing & { profiles: Profile };
  selected: boolean;
  onClick: () => void;
}) {
  const isOffer = row.type === 'offer';
  const qty = row.quantity != null ? `${row.quantity}${row.unit ? ` ${row.unit}` : ''}` : null;

  return (
    <button
      onClick={onClick}
      className={`bg-paper border rounded-xl p-3.5 flex items-center gap-3 text-left transition-colors ${
        selected ? 'border-ink-soft' : 'border-line hover:border-line-strong'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center ${
          isOffer ? 'bg-green-light text-green' : 'bg-amber-light text-amber'
        }`}
      >
        {isOffer ? <ArrowUpFromLine size={15} /> : <ArrowDownToLine size={15} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[0.88rem] font-bold text-ink truncate">{row.product_name}</span>
          <span
            className={`text-[0.62rem] font-bold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded ${
              isOffer ? 'bg-green-light text-green' : 'bg-amber-light text-amber'
            }`}
          >
            {isOffer ? 'Offre' : 'Besoin'}
          </span>
        </div>
        <div className="text-[0.76rem] text-muted truncate">
          {row.profiles.name} ·{' '}
          {ROLE_LABEL[row.profiles.role as string] ?? row.profiles.role}
          {row.profiles.address ? ` · ${row.profiles.address}` : ''}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        {qty && <div className="text-[0.82rem] font-bold text-ink">{qty}</div>}
        <div className="text-[0.7rem] text-muted">
          {isOffer ? 'Jusqu’au' : 'Pour le'} {formatDate(isOffer ? row.expires_at : row.available_from)}
        </div>
      </div>
    </button>
  );
}
