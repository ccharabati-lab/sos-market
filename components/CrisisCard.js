'use client';

import { useState } from 'react';
import {
  Thermometer,
  Truck,
  ChevronDown,
  MapPin,
  Phone,
  Factory,
  Droplets,
  Package,
  Wheat,
  Leaf,
  ShoppingBag,
  Info,
  ListChecks,
  ExternalLink,
} from 'lucide-react';
import { useContactModal } from './ContactModalProvider';
import MiniMap from './MiniMap';

const severityIconMap = {
  thermometer: Thermometer,
  truck: Truck,
  info: Info,
};

const severityTone = {
  critical: { container: 'bg-red-light text-red', badge: 'bg-red-light text-red border-red-mid', label: 'Critique' },
  warning:  { container: 'bg-amber-light text-amber', badge: 'bg-amber-light text-amber border-amber-mid', label: 'Avertissement' },
  info:     { container: 'bg-canvas-soft text-muted', badge: 'bg-canvas-soft text-ink-soft border-line-strong', label: 'Information' },
};

const supplierIconMap = {
  factory: Factory,
  droplets: Droplets,
  package: Package,
  wheat: Wheat,
  leaf: Leaf,
  'shopping-bag': ShoppingBag,
};

const pillToneClass = {
  red:    'bg-red-light border-red-mid text-red',
  amber:  'bg-amber-light border-amber-mid text-amber',
  neutral:'bg-canvas-soft border-line-strong text-ink-soft',
};

export default function CrisisCard({ alert, suppliers, defaultExpanded = false, originLat, originLng }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id);
  const { open: openModal } = useContactModal();

  const SeverityIcon = severityIconMap[alert.icon] || Thermometer;
  const tone = severityTone[alert.severity] || severityTone.warning;
  const selected = suppliers.find((s) => s.id === selectedId) || suppliers[0];
  const confidencePct = typeof alert.confidence === 'number'
    ? Math.round(alert.confidence * 100)
    : null;
  const recommendedActions = alert.recommended_actions || [];
  const attribution = alert.attribution;
  const evidence = alert.evidence;
  const sources = alert.sources || [];

  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      className={`bg-paper border rounded-xl overflow-hidden cursor-pointer transition-[border-color,box-shadow] ${
        expanded
          ? 'border-line-strong shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
          : 'border-line hover:border-line-strong hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="py-[1.1rem] px-[1.35rem] flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center ${tone.container}`}
        >
          <SeverityIcon size={18} />
        </div>

        <div className="flex-1">
          <div className="text-[0.92rem] font-bold text-ink">{alert.title}</div>
          <div className="text-[0.75rem] text-muted mt-[0.15rem]">{alert.description}</div>
          <div className="flex gap-[0.4rem] flex-wrap mt-[0.55rem]">
            {alert.affected_products.map((p) => (
              <span
                key={p.label}
                className={`text-[0.69rem] font-semibold py-[0.18rem] px-[0.6rem] rounded-full border ${
                  pillToneClass[p.tone] || pillToneClass.neutral
                }`}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {confidencePct != null && (
            <span className="text-[0.66rem] font-semibold py-[0.2rem] px-[0.55rem] rounded-full border border-line-strong bg-canvas-soft text-ink-soft">
              {confidencePct}% confiance
            </span>
          )}
          <span
            className={`text-[0.68rem] font-bold uppercase tracking-[0.07em] py-[0.22rem] px-[0.65rem] rounded-full border ${tone.badge}`}
          >
            {tone.label}
          </span>
          <span
            className={`text-muted flex transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            <ChevronDown size={15} />
          </span>
        </div>
      </div>

      {expanded && (
        <div
          className="border-t border-line p-[1.35rem] bg-canvas"
          onClick={(e) => e.stopPropagation()}
        >
          {alert.full_description && (
            <p className="text-[0.83rem] text-ink-soft mb-[1.1rem] leading-[1.5]">
              {alert.full_description}
            </p>
          )}

          {(evidence || sources.length > 0) && (
            <div className="mb-[1.1rem] border border-line rounded-lg bg-paper p-[1rem]">
              <div className="flex items-center gap-2 text-[0.76rem] font-bold text-ink mb-[0.55rem]">
                <Info size={14} className="text-green" />
                Pourquoi Mileva le signale
              </div>
              {evidence && (
                <p className="text-[0.78rem] text-ink-soft leading-[1.5]">
                  {evidence}
                </p>
              )}
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-[0.75rem]">
                  {sources.slice(0, 4).map((s) => (
                    <a
                      key={`${s.name}-${s.url}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.68rem] font-semibold py-[0.22rem] px-[0.55rem] rounded-full border border-line-strong bg-canvas-soft text-ink-soft hover:border-green-mid hover:text-green"
                    >
                      {s.name}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {recommendedActions.length > 0 && (
            <details className="mb-[1.1rem] border border-line rounded-lg bg-paper" open>
              <summary className="cursor-pointer list-none flex items-center gap-2 px-[1rem] py-[0.7rem] text-[0.78rem] font-bold text-ink">
                <ListChecks size={14} className="text-green" />
                Actions recommandées
                <span className="ml-auto text-[0.7rem] text-muted font-normal">
                  {recommendedActions.length}
                </span>
              </summary>
              <ul className="px-[1rem] pb-[0.85rem] pt-[0.1rem] flex flex-col gap-[0.35rem]">
                {recommendedActions.map((a) => (
                  <li
                    key={a.key}
                    className="text-[0.78rem] text-ink-soft flex items-start gap-2"
                  >
                    <span className="text-green mt-[0.35rem] w-[5px] h-[5px] rounded-full bg-green flex-shrink-0" />
                    {a.label}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {suppliers.length > 0 && (
          <>
          <div className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-green mb-[1.1rem]">
            <MapPin size={13} />
            Stock disponible à proximité
          </div>

          <div className="grid grid-cols-[1.1fr_1fr] gap-6 items-start">
            <MiniMap
              suppliers={suppliers}
              mapHints={alert.map_hints}
              selectedId={selectedId}
              onSelect={setSelectedId}
              originLat={originLat}
              originLng={originLng}
            />

            <div className="flex flex-col gap-[0.55rem]">
              {suppliers.map((s) => {
                const SIcon = supplierIconMap[s.icon] || Package;
                const isSel = s.id === selectedId;
                return (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(s.id);
                    }}
                    className={`border rounded-[9px] py-[0.85rem] px-4 flex items-center gap-[0.85rem] transition-colors cursor-pointer ${
                      isSel
                        ? 'border-green-bright bg-green-light'
                        : 'border-line bg-paper hover:border-green-mid hover:bg-green-light'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        isSel ? 'bg-green-mid text-green' : 'bg-canvas-soft text-muted'
                      }`}
                    >
                      <SIcon size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-[0.85rem] font-bold text-ink">{s.name}</div>
                        {s.role_label && (
                          <span className="text-[0.61rem] font-bold uppercase tracking-[0.05em] text-green bg-green-light rounded px-1.5 py-0.5">
                            {s.role_label}
                          </span>
                        )}
                      </div>
                      <div className="text-[0.73rem] text-muted mt-[0.1rem]">
                        {s.stock_detail}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[0.75rem] font-bold text-green">
                        {s.distance_km} km
                      </div>
                      <div
                        className={`text-[0.7rem] mt-[0.1rem] ${
                          s.availability_tone === 'warn' ? 'text-amber' : 'text-muted'
                        }`}
                      >
                        {s.availability}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (selected) openModal(selected.name);
                }}
                className="mt-[0.75rem] w-full flex items-center justify-center gap-2 bg-green text-white border-none rounded-lg py-[0.6rem] text-[0.82rem] font-bold cursor-pointer hover:bg-green-bright transition-colors tracking-[0.01em]"
              >
                <Phone size={14} />
                Contacter le fournisseur sélectionné
              </button>
            </div>
          </div>
          </>
          )}

          {attribution && (
            <div className="mt-[1.1rem] pt-[0.85rem] border-t border-line text-[0.7rem] text-muted">
              {attribution}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
