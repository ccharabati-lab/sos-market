export const alerts = [
  {
    id: 'c1',
    type: 'heatwave',
    severity: 'critical',
    icon: 'thermometer',
    title: 'Vague de chaleur prévue — Île-de-France (48h)',
    description: 'Détecté via Météo-France · Pic à 38 °C jeudi après-midi',
    affected_products: [
      { label: 'Eaux minérales', tone: 'red' },
      { label: 'Boissons fraîches', tone: 'red' },
      { label: 'Glaces & sorbets', tone: 'red' },
      { label: 'Produits laitiers', tone: 'amber' },
    ],
    map_hints: {
      labels: [
        { text: 'Gif-sur-Yvette', style: { bottom: 8, left: 8 } },
        { text: 'Orsay',          style: { top: 8,    right: 8 } },
        { text: 'Palaiseau',      style: { bottom: 8, right: 8 } },
      ],
      lines: [
        { x1: 120, y1: 100, x2: 225, y2: 62,  stroke: '#28a060', opacity: 0.5 },
        { x1: 120, y1: 100, x2: 60,  y2: 75,  stroke: '#28a060', opacity: 0.5 },
        { x1: 120, y1: 100, x2: 230, y2: 145, stroke: '#b45309', opacity: 0.4 },
      ],
    },
  },
  {
    id: 'c2',
    type: 'transport_strike',
    severity: 'warning',
    icon: 'truck',
    title: 'Grève des transporteurs routiers — préavis déposé (72h)',
    description: 'Source : CGT Transport · Impact estimé sur les approvisionnements nationaux',
    affected_products: [
      { label: 'Fruits & légumes',     tone: 'amber' },
      { label: 'Pain & viennoiseries', tone: 'amber' },
      { label: 'Épicerie sèche',       tone: 'neutral' },
    ],
    map_hints: {
      labels: [
        { text: 'Gif-sur-Yvette', style: { bottom: 8, left: 8 } },
        { text: 'Chevreuse',      style: { top: 8,    left: 8 } },
        { text: 'Les Ulis',       style: { top: 8,    right: 8 } },
      ],
      lines: [
        { x1: 120, y1: 100, x2: 55,  y2: 40,  stroke: '#28a060', opacity: 0.5 },
        { x1: 120, y1: 100, x2: 240, y2: 55,  stroke: '#28a060', opacity: 0.5 },
        { x1: 120, y1: 100, x2: 200, y2: 155, stroke: '#28a060', opacity: 0.4 },
      ],
    },
  },
];

export const suppliersByAlert = {
  c1: [
    {
      id: 's1',
      name: 'Brasserie Éco-Vallée',
      icon: 'factory',
      stock_detail: 'Eaux plats & pétillantes · 240 palettes',
      distance_km: 8.4,
      availability: 'Livraison dès demain',
      availability_tone: 'ok',
      pin: { top: '31%', left: '75%' },
    },
    {
      id: 's2',
      name: 'Cristaline Orsay',
      icon: 'droplets',
      stock_detail: 'Eau source 1.5L · 180 palettes',
      distance_km: 11.2,
      availability: 'Livraison J+1',
      availability_tone: 'ok',
      pin: { top: '37%', left: '20%' },
    },
    {
      id: 's3',
      name: 'Sodebo Palaiseau',
      icon: 'package',
      stock_detail: 'Jus de fruits frais · 60 cartons',
      distance_km: 14.7,
      availability: 'Stock limité',
      availability_tone: 'warn',
      pin: { top: '72%', left: '77%' },
    },
  ],
  c2: [
    {
      id: 's1',
      name: 'Ferme des Granges — Chevreuse',
      icon: 'wheat',
      stock_detail: 'Légumes de saison · Livraison directe',
      distance_km: 6.1,
      availability: 'Disponible demain',
      availability_tone: 'ok',
      pin: { top: '20%', left: '18%' },
    },
    {
      id: 's2',
      name: 'Maraîcher — Les Ulis',
      icon: 'leaf',
      stock_detail: 'Salades, tomates, courgettes · 40 caisses',
      distance_km: 9.3,
      availability: 'Disponible J+1',
      availability_tone: 'ok',
      pin: { top: '27%', left: '80%' },
    },
    {
      id: 's3',
      name: 'Boulangerie Sébastien — Palaiseau',
      icon: 'shopping-bag',
      stock_detail: 'Pain artisanal, viennoiseries',
      distance_km: 12.8,
      availability: "Dès aujourd'hui",
      availability_tone: 'ok',
      pin: { top: '77%', left: '67%' },
    },
  ],
};

export const stockStatus = [
  { name: 'Œufs (calibre M)', percent: 18, tone: 'red',    tag: 'Pénurie', tagTone: 'low' },
  { name: 'Farine T55',       percent: 92, tone: 'excess', tag: 'Excès',   tagTone: 'excess' },
  { name: "Huile d'olive",    percent: 35, tone: 'amber',  tag: 'Faible',  tagTone: 'warn' },
  { name: 'Yaourts nature',   percent: 68, tone: 'green',  tag: 'Normal',  tagTone: 'ok' },
  { name: "Jus d'orange 1L",  percent: 85, tone: 'excess', tag: 'Excès',   tagTone: 'excess' },
];

export const networkSignals = [
  {
    id: 'n1',
    store_name: 'Carrefour — Orsay',
    signal_type: 'surplus',
    detail: 'Surplus : Œufs calibre M · 80 plateaux disponibles',
    distance_km: 7.2,
    time_label: 'il y a 8 min',
    pin: { top: '27%', left: '80%' },
  },
  {
    id: 'n2',
    store_name: 'Leclerc — Saclay',
    signal_type: 'shortage',
    detail: 'Besoin : Farine T55 · cherche 30 cartons',
    distance_km: 4.5,
    time_label: 'il y a 23 min',
    pin: { top: '23%', left: '27%' },
  },
  {
    id: 'n3',
    store_name: 'Ferme Beauce — Limours',
    signal_type: 'surplus',
    detail: 'Surplus : Tomates cerises · 15 caisses · DLC 4 jours',
    distance_km: 18.1,
    time_label: 'il y a 1h',
    pin: { top: '70%', left: '22%' },
  },
  {
    id: 'n4',
    store_name: 'Resto U — CentraleSupélec',
    signal_type: 'shortage',
    detail: "Besoin : Jus d'orange · cherche 20 cartons pour lundi",
    distance_km: 2.8,
    time_label: 'il y a 2h',
    pin: { top: '73%', left: '63%' },
  },
  {
    id: 'n5',
    store_name: 'Producteur local',
    signal_type: 'surplus',
    detail: 'Surplus : Fromages affinés · 25 plateaux',
    distance_km: 11.4,
    time_label: 'il y a 35 min',
    pin: { top: '55%', left: '72%' },
    feed_hidden: true,
  },
];

export const networkMapHints = {
  labels: [
    { text: 'Gif-sur-Yvette', style: { bottom: 10, left: 10 } },
    { text: 'Orsay',          style: { top: 10,    right: 10 } },
    { text: 'Chevreuse',      style: { top: 10,    left: 10 } },
    { text: 'Palaiseau',      style: { bottom: 10, right: 10 } },
  ],
  lines: [
    { x1: 270, y1: 150, x2: 480, y2: 80,  stroke: '#3b82f6', opacity: 0.4 },
    { x1: 270, y1: 150, x2: 130, y2: 210, stroke: '#3b82f6', opacity: 0.4 },
    { x1: 270, y1: 150, x2: 380, y2: 220, stroke: '#dc2626', opacity: 0.4 },
    { x1: 270, y1: 150, x2: 160, y2: 70,  stroke: '#dc2626', opacity: 0.4 },
    { x1: 270, y1: 150, x2: 430, y2: 165, stroke: '#3b82f6', opacity: 0.4 },
  ],
};
