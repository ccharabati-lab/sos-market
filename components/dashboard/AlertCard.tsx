'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ChevronDown,
  Droplets,
  Factory,
  Info,
  Leaf,
  MapPin,
  Package,
  PackageSearch,
  Phone,
  ShoppingBag,
  Thermometer,
  Truck,
  Wheat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MiniMap from '../MiniMap';
import { useContactModal } from '../ContactModalProvider';
import {
  ActionItem,
  SourceLink,
} from '../ui/action-source';
import {
  CategoryPill,
  SeverityBadge,
  severityMeta,
  type Severity,
} from '../ui/badges';
import { PrimaryButton, SecondaryButton } from '../ui/buttons';
import { useToast } from '../ui/toast-provider';
import { cn } from '../ui/utils';

const severityIconMap: Record<string, LucideIcon> = {
  thermometer: Thermometer,
  truck: Truck,
  info: Info,
};

const supplierIconMap: Record<string, LucideIcon> = {
  factory: Factory,
  droplets: Droplets,
  package: Package,
  wheat: Wheat,
  leaf: Leaf,
  'shopping-bag': ShoppingBag,
};

type AlertCategory = {
  label: string;
  tone: 'red' | 'amber' | 'neutral';
};

type AlertAction = {
  key: string;
  label: string;
};

type AlertSource = {
  name: string;
  url: string;
  type?: string;
  priority?: string;
};

type DashboardAlert = {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  full_description?: string;
  icon: string;
  confidence?: number;
  affected_products: AlertCategory[];
  recommended_actions?: AlertAction[];
  evidence?: string;
  sources?: AlertSource[];
  attribution?: string;
  risk_global?: string;
  risk_specific?: string;
  matching_notes?: string;
  region?: string;
  region_level?: string;
  detected_at?: string;
  start_time?: string;
};

export type DashboardSupplier = {
  id: string;
  name: string;
  icon: string;
  role_label?: string;
  stock_detail: string;
  distance_km: number;
  availability: string;
  availability_tone: 'ok' | 'warn';
  lat?: number;
  lng?: number;
};

function formatDate(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function timeStatus(value?: string) {
  if (!value) return 'fenêtre à confirmer';
  const target = new Date(value);
  const diff = target.getTime() - Date.now();
  const absHours = Math.abs(diff) / 36e5;
  const days = Math.floor(absHours / 24);
  const hours = Math.round(absHours % 24);

  if (diff >= 0) {
    if (days > 0) return `dans ${days} j ${hours} h`;
    return `dans ${Math.max(1, Math.round(absHours))} h`;
  }

  if (days > 0) return `signal actif depuis ${days} j`;
  return `signal actif depuis ${Math.max(1, Math.round(absHours))} h`;
}

function sourceMeta(alert: DashboardAlert) {
  const source = alert.sources?.[0]?.name ?? 'Mileva';
  const pieces = [`Détecté via ${source}`];
  if (alert.region) pieces.push(alert.region);
  return pieces.join(' · ');
}

export default function AlertCard({
  alert,
  suppliers,
  defaultExpanded = false,
  originLat,
  originLng,
}: {
  alert: DashboardAlert;
  suppliers: DashboardSupplier[];
  defaultExpanded?: boolean;
  originLat: number;
  originLng: number;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id);
  const [handled, setHandled] = useState(false);
  const suppliersRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { open: openModal } = useContactModal();
  const { showToast } = useToast();

  function markAsHandled() {
    setHandled(true);
    showToast({
      tone: 'success',
      title: 'Alerte marquée comme gérée',
      message: alert.title,
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const SeverityIcon = severityIconMap[alert.icon] || Thermometer;
  const severity = severityMeta[alert.severity] || severityMeta.warning;
  const confidencePct = typeof alert.confidence === 'number' ? Math.round(alert.confidence * 100) : null;
  const selected = suppliers.find((supplier) => supplier.id === selectedId) || suppliers[0];
  const visibleCategories = alert.affected_products.slice(0, 4);
  const hiddenCategoryCount = Math.max(alert.affected_products.length - visibleCategories.length, 0);
  const detectedDate = formatDate(alert.detected_at);
  const startDate = formatDate(alert.start_time);

  function scrollToSuppliers() {
    setExpanded(true);
    requestAnimationFrame(() => {
      suppliersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-level-1 transition-all duration-180 ease-out hover:-translate-y-0.5 hover:shadow-level-2',
        severity.borderClass,
        alert.severity === 'critical' && 'animate-critical-pulse motion-reduce:animate-none',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 p-5 text-left transition-all duration-180 hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
      >
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', severity.panelClass)}>
          <SeverityIcon size={21} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-[26px] text-text-primary">{alert.title}</h3>
          <p className="mt-1 text-sm leading-5 text-text-muted">{sourceMeta(alert)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {confidencePct != null && (
              <span className="rounded-full border border-border-default bg-bg-subtle px-2.5 py-1 text-xs font-semibold text-text-secondary">
                {confidencePct} % confiance
              </span>
            )}
            {visibleCategories.map((category) => (
              <CategoryPill key={category.label}>{category.label}</CategoryPill>
            ))}
            {hiddenCategoryCount > 0 && <CategoryPill>+{hiddenCategoryCount} autres</CategoryPill>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <SeverityBadge severity={alert.severity} />
          <span className="text-sm font-semibold text-text-secondary">{timeStatus(alert.start_time)}</span>
          <ChevronDown className={cn('text-text-muted transition-transform duration-180', expanded && 'rotate-180')} size={18} aria-hidden="true" />
        </div>
      </button>

      {expanded && (
        <div id={panelId} className="animate-fade-in border-t border-border-default bg-bg-subtle p-5">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-xl border border-border-default bg-white p-5">
              <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Détails & sources</div>
              {alert.full_description && (
                <p className="mt-3 text-sm leading-6 text-text-secondary">{alert.full_description}</p>
              )}
              {alert.evidence && (
                <div className="mt-4 rounded-xl border border-border-default bg-bg-subtle p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <Info size={16} className="text-green" aria-hidden="true" />
                    Pourquoi Mileva le signale
                  </div>
                  <p className="text-sm leading-6 text-text-secondary">{alert.evidence}</p>
                </div>
              )}

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-bg-subtle p-3">
                  <div className="text-caption uppercase tracking-[0.08em] text-text-muted">Région</div>
                  <div className="mt-1 font-semibold text-text-primary">{alert.region || 'Non précisée'}</div>
                </div>
                <div className="rounded-lg bg-bg-subtle p-3">
                  <div className="text-caption uppercase tracking-[0.08em] text-text-muted">Détection</div>
                  <div className="mt-1 font-semibold text-text-primary">{detectedDate || 'Date inconnue'}</div>
                </div>
                <div className="rounded-lg bg-bg-subtle p-3">
                  <div className="text-caption uppercase tracking-[0.08em] text-text-muted">Risque Mileva</div>
                  <div className="mt-1 font-semibold text-text-primary">{[alert.risk_global, alert.risk_specific].filter(Boolean).join(' · ') || 'Non codé'}</div>
                </div>
                <div className="rounded-lg bg-bg-subtle p-3">
                  <div className="text-caption uppercase tracking-[0.08em] text-text-muted">Début estimé</div>
                  <div className="mt-1 font-semibold text-text-primary">{startDate || 'À confirmer'}</div>
                </div>
              </div>

              {alert.matching_notes && (
                <p className="mt-4 rounded-lg border border-border-default bg-white p-3 text-sm leading-6 text-text-secondary">
                  {alert.matching_notes}
                </p>
              )}

              <div className="mt-5">
                <div className="mb-3 text-sm font-semibold text-text-primary">Sources</div>
                <div className="grid gap-2">
                  {(alert.sources ?? []).length > 0 ? (
                    alert.sources?.map((source) => (
                      <SourceLink key={`${source.name}-${source.url}`} name={source.name} url={source.url} type={source.type} />
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">Aucune source externe fournie.</p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 text-sm font-semibold text-text-primary">Catégories impactées</div>
                <div className="flex flex-wrap gap-2">
                  {alert.affected_products.map((category) => (
                    <CategoryPill key={category.label}>{category.label}</CategoryPill>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border-default bg-white p-5">
              <div className="text-caption font-semibold uppercase tracking-[0.08em] text-text-muted">Actions recommandées</div>
              <ul className="mt-3 grid gap-2">
                {(alert.recommended_actions ?? []).length > 0 ? (
                  alert.recommended_actions?.map((action) => (
                    <ActionItem key={action.key}>{action.label}</ActionItem>
                  ))
                ) : (
                  <ActionItem>Aucune action spécifique fournie par Mileva.</ActionItem>
                )}
              </ul>

              <div className="mt-4 grid gap-2">
                <PrimaryButton type="button" onClick={scrollToSuppliers} disabled={suppliers.length === 0}>
                  <PackageSearch size={16} aria-hidden="true" />
                  Voir les fournisseurs disponibles
                </PrimaryButton>
                <SecondaryButton type="button" onClick={markAsHandled} disabled={handled}>
                  {handled ? 'Alerte gérée' : 'Marquer comme géré'}
                </SecondaryButton>
              </div>
            </section>
          </div>

          {suppliers.length > 0 && (
            <section ref={suppliersRef} className="mt-5 rounded-xl border border-border-default bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.08em] text-green">
                <MapPin size={15} aria-hidden="true" />
                Stock disponible à proximité
              </div>
              <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
                <MiniMap
                  suppliers={suppliers}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  originLat={originLat}
                  originLng={originLng}
                />

                <div className="flex flex-col gap-2">
                  {suppliers.map((supplier) => {
                    const SupplierIcon = supplierIconMap[supplier.icon] || Package;
                    const active = supplier.id === selectedId;
                    return (
                      <button
                        key={supplier.id}
                        type="button"
                        onClick={() => setSelectedId(supplier.id)}
                        className={cn(
                          'grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border p-3 text-left transition-all duration-180 hover:-translate-y-0.5 hover:shadow-level-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2',
                          active ? 'border-green bg-green-soft' : 'border-border-default bg-white hover:border-border-emphasized',
                        )}
                      >
                        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', active ? 'bg-white text-green' : 'bg-bg-muted text-text-muted')}>
                          <SupplierIcon size={16} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-text-primary">{supplier.name}</span>
                            {supplier.role_label && (
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-green">
                                {supplier.role_label}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-text-muted">{supplier.stock_detail}</span>
                        </span>
                        <span className="text-right text-sm">
                          <span className="block font-semibold text-green">{supplier.distance_km} km</span>
                          <span className={cn('block text-xs', supplier.availability_tone === 'warn' ? 'text-warning' : 'text-text-muted')}>
                            {supplier.availability}
                          </span>
                        </span>
                      </button>
                    );
                  })}

                  <PrimaryButton type="button" className="mt-2" onClick={() => selected && openModal(selected.name)}>
                    <Phone size={16} aria-hidden="true" />
                    Contacter le fournisseur sélectionné
                  </PrimaryButton>
                </div>
              </div>
            </section>
          )}

          {alert.attribution && (
            <div className="mt-4 text-right font-mono text-xs text-text-muted">{alert.attribution}</div>
          )}
        </div>
      )}
    </article>
  );
}
