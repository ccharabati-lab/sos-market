import type { CrisisAlert } from './mileva';

export const DEMO_CRISIS_ALERTS: CrisisAlert[] = [
  {
    id: 'demo_heatwave_2026_06',
    title: 'Vague de chaleur attendue · Île-de-France',
    description:
      "Pic de chaleur prévu sur 72h avec températures > 35°C. Forte demande attendue sur l'eau, les boissons fraîches et les glaces.",
    severity: 'critical',
    affectedCategories: ['eau', 'boissons', 'glaces', 'laitier_frais'],
    sources: [
      { name: 'Météo-France', url: 'https://meteofrance.com' },
      { name: 'SOS-Market démo', url: 'https://sos-market.vercel.app' },
    ],
    recommendedActions: [
      'augmentation_stock_securite',
      'reapprovisionnement_anticipe',
      'communication_client',
    ],
    confidence: 0.92,
    region: 'Île-de-France',
    regionLevel: 'local',
    detectedAt: '2026-05-13T07:00:00Z',
  },
  {
    id: 'demo_transport_strike',
    title: 'Préavis de grève transporteurs · A10/A6',
    description:
      'Mouvement social annoncé chez plusieurs transporteurs routiers. Risque de retards de livraison sur les axes Rungis → Sud Île-de-France.',
    severity: 'warning',
    affectedCategories: ['fruits_legumes', 'laitier_frais', 'epicerie_seche'],
    sources: [{ name: 'FNTR', url: 'https://www.fntr.fr' }],
    recommendedActions: ['securisation_transport', 'diversification_fournisseurs'],
    confidence: 0.74,
    region: 'Île-de-France',
    regionLevel: 'national',
    detectedAt: '2026-05-13T07:00:00Z',
  },
];
