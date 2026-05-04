'use client';

import { useState } from 'react';
import { TrendingDown, TrendingUp, Clock, Package } from 'lucide-react';
import type { Listing } from '../types';
import DeleteListingButton from './DeleteListingButton';

interface MesSignauxProps {
  listings: Listing[];
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });

function formatExpiry(date: string | null) {
  if (!date) return 'date à confirmer';
  return `jusqu'au ${dateFmt.format(new Date(date))}`;
}

function quantityLabel(listing: Listing) {
  const parts: string[] = [];
  if (listing.quantity != null) parts.push(String(listing.quantity));
  if (listing.unit) parts.push(listing.unit);
  return parts.join(' ');
}

function SignalRow({
  listing,
  onDeleted,
}: {
  listing: Listing;
  onDeleted: (id: string) => void;
}) {
  const isOffer = listing.type === 'offer';
  const Icon = isOffer ? TrendingUp : TrendingDown;
  const qty = quantityLabel(listing);

  return (
    <div className="flex items-start gap-3 bg-paper border border-line rounded-lg p-3">
      <div
        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isOffer ? 'bg-green-light text-green' : 'bg-red-light text-red'
        }`}
      >
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.84rem] font-bold text-ink truncate">
          {listing.product_name}
        </div>
        <div className="text-[0.72rem] text-muted mt-0.5 truncate">
          {listing.product_category}
          {qty ? ` · ${qty}` : ''}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="inline-flex items-center gap-1 text-[0.7rem] text-muted">
          <Clock size={11} />
          {formatExpiry(listing.expires_at)}
        </div>
        <DeleteListingButton
          listingId={listing.id}
          productName={listing.product_name}
          onDeleted={() => onDeleted(listing.id)}
        />
      </div>
    </div>
  );
}

export default function MesSignaux({ listings }: MesSignauxProps) {
  const [items, setItems] = useState(listings);
  const handleDeleted = (id: string) => setItems((cur) => cur.filter((l) => l.id !== id));

  const offers = items.filter((l) => l.type === 'offer');
  const needs = items.filter((l) => l.type === 'need');

  return (
    <section className="bg-paper border border-line rounded-xl p-5">
      <div className="flex items-start justify-between gap-5 mb-5">
        <div>
          <div className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-green mb-1">
            Mes signaux actifs
          </div>
          <h2 className="text-[1.05rem] font-extrabold text-ink">
            Vos surplus et besoins publiés
          </h2>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-green-light text-green text-[0.74rem] font-bold rounded-md px-2.5 py-1">
            <TrendingUp size={12} />
            {offers.length} surplus
          </span>
          <span className="inline-flex items-center gap-1.5 bg-red-light text-red text-[0.74rem] font-bold rounded-md px-2.5 py-1">
            <TrendingDown size={12} />
            {needs.length} besoin{needs.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-canvas-soft border border-dashed border-line rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-paper border border-line flex items-center justify-center mb-3 text-muted">
            <Package size={18} />
          </div>
          <div className="text-[0.84rem] font-semibold text-ink mb-1">
            Aucun signal actif
          </div>
          <div className="text-[0.78rem] text-muted max-w-sm">
            Publiez un besoin ou un surplus dans la section ci-dessus pour qu&apos;il
            apparaisse ici et soit visible par votre réseau.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted">
              Surplus à proposer
            </div>
            {offers.length === 0 ? (
              <div className="text-[0.78rem] text-muted bg-canvas-soft border border-line rounded-lg p-3">
                Aucun surplus publié pour le moment.
              </div>
            ) : (
              offers.map((l) => (
                <SignalRow key={l.id} listing={l} onDeleted={handleDeleted} />
              ))
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted">
              Besoins en cours
            </div>
            {needs.length === 0 ? (
              <div className="text-[0.78rem] text-muted bg-canvas-soft border border-line rounded-lg p-3">
                Aucun besoin signalé pour le moment.
              </div>
            ) : (
              needs.map((l) => (
                <SignalRow key={l.id} listing={l} onDeleted={handleDeleted} />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
