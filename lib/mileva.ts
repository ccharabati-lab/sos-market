// TODO: replace fetch URL with live Mileva API endpoint when available

export type MilevaSeverity = 'critical' | 'warning' | 'info';

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  severity: MilevaSeverity;
  affectedCategories: string[];
  sources: { name: string; url: string; type?: string; priority?: string }[];
  recommendedActions: string[];
  confidence: number;
  region: string;
  regionLevel: string;
  detectedAt: string;
  evidence?: string;
  matchingNotes?: string;
  riskGlobal?: string;
  riskSpecific?: string;
  startTime?: string;
}

export interface ProductRisk {
  productFamily: string;
  productSlug: string;
  products: string[];
  riskLevel: string;
  riskScore: number;
  geographies: string[];
  impactType: string[];
  timeHorizon: string;
  confidence: string;
  recommendedActions: string[];
}

export interface Scenario {
  id: string;
  title: string;
  probability: string;
  severity: string;
  timeHorizon: string;
  affectedProducts: string[];
  supplyChainPathway: string;
  earlyWarningIndicators: string[];
  retailerActions: string[];
}

export interface LocalSignal {
  title: string;
  date_publication?: string;
  source_name?: string;
  source_url?: string;
  zone?: string;
  category?: string;
  impacted_products?: { product: string }[];
}

interface RawMilevaAlert {
  alert_id: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  region?: { name?: string; level?: string };
  affected_categories?: string[];
  sources?: { name?: string; url?: string; type?: string; priority?: string }[];
  recommended_actions?: string[];
  detected_at: string;
  risk_global?: string;
  risk_specific?: string;
  start_time?: string;
  raw_payload?: {
    evidence?: string;
    matching_notes?: string;
  };
}

interface RawAlertsFile {
  alerts?: RawMilevaAlert[];
}

interface RawProductRisk {
  product_family: string;
  product_slug: string;
  products?: string[];
  risk_level: string;
  risk_score: number;
  geographies?: string[];
  impact_type?: string[];
  time_horizon: string;
  confidence: string;
  recommended_actions?: string[];
}

interface RawProductsFile {
  products?: RawProductRisk[];
}

interface RawScenario {
  scenario_id: string;
  title: string;
  probability: string;
  severity: string;
  time_horizon: string;
  affected_products?: string[];
  supply_chain_pathway: string;
  early_warning_indicators?: string[];
  retailer_actions?: string[];
}

interface RawScenariosFile {
  scenarios?: RawScenario[];
}

interface RawSignalsFile {
  items?: LocalSignal[];
}

const ALERTS_URL = '/data/global_supply_risks/global_supply_risk_alerts_20260513.json';
const PRODUCTS_URL = '/data/global_supply_risks/global_supply_risk_products_20260513.json';
const SCENARIOS_URL = '/data/global_supply_risks/global_supply_risk_scenarios_20260513.json';
const SIGNALS_URL = '/data/supply_chain_watch/supply_chain_agri_watch_20260513_070814.json';

function normalizeSeverity(raw: string): MilevaSeverity {
  if (raw === 'critical' || raw === 'warning' || raw === 'info') return raw;
  return 'info';
}

export function normalizeMilevaAlert(raw: RawMilevaAlert): CrisisAlert {
  return {
    id: raw.alert_id,
    title: raw.title,
    description: raw.description,
    severity: normalizeSeverity(raw.severity),
    affectedCategories: raw.affected_categories ?? [],
    sources: (raw.sources ?? [])
      .filter((s): s is { name: string; url: string; type?: string; priority?: string } =>
        Boolean(s?.name && s?.url),
      )
      .map((s) => ({ name: s.name, url: s.url, type: s.type, priority: s.priority })),
    recommendedActions: raw.recommended_actions ?? [],
    confidence: raw.confidence ?? 0,
    region: raw.region?.name ?? '',
    regionLevel: raw.region?.level ?? '',
    detectedAt: raw.detected_at,
    evidence: raw.raw_payload?.evidence,
    matchingNotes: raw.raw_payload?.matching_notes,
    riskGlobal: raw.risk_global,
    riskSpecific: raw.risk_specific,
    startTime: raw.start_time,
  };
}

function normalizeProductRisk(raw: RawProductRisk): ProductRisk {
  return {
    productFamily: raw.product_family,
    productSlug: raw.product_slug,
    products: raw.products ?? [],
    riskLevel: raw.risk_level,
    riskScore: raw.risk_score ?? 0,
    geographies: raw.geographies ?? [],
    impactType: raw.impact_type ?? [],
    timeHorizon: raw.time_horizon,
    confidence: raw.confidence,
    recommendedActions: raw.recommended_actions ?? [],
  };
}

function normalizeScenario(raw: RawScenario): Scenario {
  return {
    id: raw.scenario_id,
    title: raw.title,
    probability: raw.probability,
    severity: raw.severity,
    timeHorizon: raw.time_horizon,
    affectedProducts: raw.affected_products ?? [],
    supplyChainPathway: raw.supply_chain_pathway,
    earlyWarningIndicators: raw.early_warning_indicators ?? [],
    retailerActions: raw.retailer_actions ?? [],
  };
}

export async function fetchAlerts(): Promise<CrisisAlert[]> {
  const res = await fetch(ALERTS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Mileva alerts fetch failed: ${res.status}`);
  const json = (await res.json()) as RawAlertsFile;
  return (json.alerts ?? []).map(normalizeMilevaAlert);
}

export async function fetchLocalSignals(): Promise<LocalSignal[]> {
  const res = await fetch(SIGNALS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Mileva local signals fetch failed: ${res.status}`);
  const json = (await res.json()) as RawSignalsFile;
  return json.items ?? [];
}

export async function fetchProductRisks(): Promise<ProductRisk[]> {
  const res = await fetch(PRODUCTS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Mileva product risks fetch failed: ${res.status}`);
  const json = (await res.json()) as RawProductsFile;
  return (json.products ?? []).map(normalizeProductRisk);
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(SCENARIOS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Mileva scenarios fetch failed: ${res.status}`);
  const json = (await res.json()) as RawScenariosFile;
  return (json.scenarios ?? []).map(normalizeScenario);
}

const ACTION_LABELS: Record<string, string> = {
  alerte_achats: 'Alerter le service achats',
  augmentation_stock_securite: 'Augmenter le stock de sécurité',
  securisation_transport: 'Sécuriser le transport',
  diversification_fournisseurs: 'Diversifier les fournisseurs',
  revue_prix: 'Réviser les prix',
  renegociation_contrats: 'Renégocier les contrats',
  gel_promotions: 'Geler les promotions',
  reapprovisionnement_anticipe: 'Réapprovisionner par anticipation',
  rationnement: 'Mettre en place un rationnement',
  communication_client: 'Communiquer auprès des clients',
  surveillance_renforcee: 'Renforcer la surveillance',
};

export function humanizeAction(slug: string): string {
  if (ACTION_LABELS[slug]) return ACTION_LABELS[slug];
  const spaced = slug.replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Mapping from Mileva category slugs to the French category names used in
 * Supabase listings. One slug may map to several Supabase categories.
 */
const MILEVA_TO_FR_CATEGORIES: Record<string, string[]> = {
  eau: ['eau'],
  boissons: ['boissons', 'eau'],
  glaces: ['glaces'],
  laitier_frais: ['produits laitiers'],
  fruits_legumes: ['fruits', 'légumes'],
  fruits_exotiques: ['fruits'],
  epicerie_seche: ['épicerie'],
  cafe_the_chocolat: ['épicerie'],
  bazar_saisonnier: ['épicerie'],
  petfood: ['épicerie'],
  hygiene_papier: ['épicerie'],
  surgeles: ['glaces'],
  pain: ['pain'],
};

export function milevaToFrCategories(slug: string): string[] {
  return MILEVA_TO_FR_CATEGORIES[slug] ?? [];
}

export const COMMON_FR_CATEGORIES = Array.from(
  new Set(Object.values(MILEVA_TO_FR_CATEGORIES).flat()),
);

const CATEGORY_LABELS: Record<string, string> = {
  fruits_exotiques: 'Fruits exotiques',
  cafe_the_chocolat: 'Café · thé · chocolat',
  epicerie_seche: 'Épicerie sèche',
  bazar_saisonnier: 'Bazar saisonnier',
  petfood: 'Petfood',
  hygiene_papier: 'Hygiène · papier',
  surgeles: 'Surgelés',
  glaces: 'Glaces',
  laitier_frais: 'Produits laitiers frais',
  fruits_legumes: 'Fruits et légumes',
  boissons: 'Boissons',
  eau: 'Eau',
  pain: 'Pain et viennoiserie',
};

export function humanizeCategory(slug: string): string {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  const spaced = slug.replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
