-- seed-demo-network.sql — 25 synthetic demo accounts for the map/network.
-- These are not real clients and do not impersonate real businesses.
-- Names, addresses, and contact data are intentionally synthetic.
-- Run after supabase/migrations/001_init.sql. Re-running is safe.

insert into profiles (id, name, role, lat, lng, address, phone) values
  ('90000001-0000-4000-8000-000000000001', 'Démo Maraîcher de Gif-sur-Yvette', 'producer', 48.6997, 2.1332, 'Secteur Gif-sur-Yvette, 91190', null),
  ('90000002-0000-4000-8000-000000000002', 'Démo Vergers de Bures', 'producer', 48.6960, 2.1625, 'Secteur Bures-sur-Yvette, 91440', null),
  ('90000003-0000-4000-8000-000000000003', 'Démo Serres des Ulis', 'producer', 48.6812, 2.1698, 'Secteur Les Ulis, 91940', null),
  ('90000004-0000-4000-8000-000000000004', 'Démo Ferme du Plateau de Saclay', 'producer', 48.7328, 2.1715, 'Secteur Saclay, 91400', null),
  ('90000005-0000-4000-8000-000000000005', 'Démo Primeur de Saint-Aubin', 'producer', 48.7137, 2.1419, 'Secteur Saint-Aubin, 91190', null),
  ('90000006-0000-4000-8000-000000000006', 'Démo Producteur de Villiers-le-Bâcle', 'producer', 48.7282, 2.1215, 'Secteur Villiers-le-Bâcle, 91190', null),
  ('90000007-0000-4000-8000-000000000007', 'Démo Ferme de Chevreuse', 'producer', 48.7068, 2.0387, 'Secteur Chevreuse, 78460', null),
  ('90000008-0000-4000-8000-000000000008', 'Démo Jardin de Saint-Rémy', 'producer', 48.7038, 2.0711, 'Secteur Saint-Rémy-lès-Chevreuse, 78470', null),
  ('90000009-0000-4000-8000-000000000009', 'Démo Maraîcher de Gometz', 'producer', 48.6789, 2.1289, 'Secteur Gometz-le-Châtel, 91940', null),
  ('9000000a-0000-4000-8000-00000000000a', 'Démo Ferme de Limours', 'producer', 48.6457, 2.0762, 'Secteur Limours, 91470', null),
  ('9000000b-0000-4000-8000-00000000000b', 'Démo Cultures de Janvry', 'producer', 48.6475, 2.1542, 'Secteur Janvry, 91640', null),
  ('9000000c-0000-4000-8000-00000000000c', 'Démo Producteur de Marcoussis', 'producer', 48.6414, 2.2292, 'Secteur Marcoussis, 91460', null),
  ('9000000d-0000-4000-8000-00000000000d', 'Démo Potager de Nozay', 'producer', 48.6597, 2.2413, 'Secteur Nozay, 91620', null),
  ('9000000e-0000-4000-8000-00000000000e', 'Démo Serres de Palaiseau', 'producer', 48.7141, 2.2464, 'Secteur Palaiseau, 91120', null),
  ('9000000f-0000-4000-8000-00000000000f', 'Démo Primeur d''Orsay', 'producer', 48.6992, 2.1875, 'Secteur Orsay, 91400', null),
  ('90000010-0000-4000-8000-000000000010', 'Démo Laiterie de Magny', 'producer', 48.7434, 2.0611, 'Secteur Magny-les-Hameaux, 78114', null),
  ('90000011-0000-4000-8000-000000000011', 'Démo Fromagerie de Châteaufort', 'producer', 48.7364, 2.0896, 'Secteur Châteaufort, 78117', null),
  ('90000012-0000-4000-8000-000000000012', 'Démo Apiculteur de Vauhallan', 'producer', 48.7322, 2.2035, 'Secteur Vauhallan, 91430', null),
  ('90000013-0000-4000-8000-000000000013', 'Démo Boulanger de Bièvres', 'producer', 48.7576, 2.2152, 'Secteur Bièvres, 91570', null),
  ('90000014-0000-4000-8000-000000000014', 'Démo Producteur d''Igny', 'producer', 48.7429, 2.2243, 'Secteur Igny, 91430', null),
  ('90000015-0000-4000-8000-000000000015', 'Démo Primeur de Massy', 'producer', 48.7308, 2.2760, 'Secteur Massy, 91300', null),
  ('90000016-0000-4000-8000-000000000016', 'Démo Halle Fraîche de Rungis', 'producer', 48.7488, 2.3520, 'Secteur Rungis, 94150', null),
  ('90000017-0000-4000-8000-000000000017', 'Démo Grossiste Fruits de Rungis', 'producer', 48.7552, 2.3491, 'Secteur Rungis MIN, 94150', null),
  ('90000018-0000-4000-8000-000000000018', 'Démo Atelier Légumes de Wissous', 'producer', 48.7311, 2.3264, 'Secteur Wissous, 91320', null),
  ('90000019-0000-4000-8000-000000000019', 'Démo Cuisine Anti-Gaspi Antony', 'restaurant', 48.7534, 2.2967, 'Secteur Antony, 92160', null)
on conflict (id) do nothing;

insert into listings (
  id, owner_id, type, product_category, product_name,
  quantity, unit, available_from, expires_at, notes
) values
  ('91000001-0000-4000-8000-000000000001', '90000001-0000-4000-8000-000000000001', 'offer', 'légumes', 'Courgettes et salades', 36, 'caisses', current_date, current_date + interval '4 days', 'Compte démo — récolte simulée autour de Gif-sur-Yvette'),
  ('91000002-0000-4000-8000-000000000002', '90000002-0000-4000-8000-000000000002', 'offer', 'fruits', 'Pommes et poires', 28, 'caisses', current_date, current_date + interval '7 days', 'Compte démo — disponibilité fictive pour test réseau'),
  ('91000003-0000-4000-8000-000000000003', '90000003-0000-4000-8000-000000000003', 'offer', 'légumes', 'Tomates et concombres', 42, 'caisses', current_date, current_date + interval '3 days', 'Compte démo — stock fictif DLC courte'),
  ('91000004-0000-4000-8000-000000000004', '90000004-0000-4000-8000-000000000004', 'offer', 'légumes', 'Pommes de terre', 55, 'sacs', current_date, current_date + interval '12 days', 'Compte démo — offre synthétique plateau de Saclay'),
  ('91000005-0000-4000-8000-000000000005', '90000005-0000-4000-8000-000000000005', 'offer', 'fruits', 'Fraises de saison', 18, 'caisses', current_date, current_date + interval '2 days', 'Compte démo — produit fragile pour simulation'),
  ('91000006-0000-4000-8000-000000000006', '90000006-0000-4000-8000-000000000006', 'offer', 'légumes', 'Carottes bottes', 32, 'caisses', current_date, current_date + interval '5 days', 'Compte démo — producteur fictif'),
  ('91000007-0000-4000-8000-000000000007', '90000007-0000-4000-8000-000000000007', 'offer', 'produits laitiers', 'Yaourts fermiers', 24, 'cartons', current_date, current_date + interval '4 days', 'Compte démo — produits laitiers simulés'),
  ('91000008-0000-4000-8000-000000000008', '90000008-0000-4000-8000-000000000008', 'offer', 'légumes', 'Épinards et blettes', 20, 'caisses', current_date, current_date + interval '3 days', 'Compte démo — disponibilité fictive vallée de Chevreuse'),
  ('91000009-0000-4000-8000-000000000009', '90000009-0000-4000-8000-000000000009', 'offer', 'légumes', 'Poireaux', 30, 'caisses', current_date, current_date + interval '6 days', 'Compte démo — offre synthétique'),
  ('9100000a-0000-4000-8000-00000000000a', '9000000a-0000-4000-8000-00000000000a', 'offer', 'épicerie', 'Lentilles vertes', 16, 'sacs', current_date, current_date + interval '30 days', 'Compte démo — stock sec fictif'),
  ('9100000b-0000-4000-8000-00000000000b', '9000000b-0000-4000-8000-00000000000b', 'offer', 'fruits', 'Rhubarbe', 12, 'caisses', current_date, current_date + interval '3 days', 'Compte démo — disponibilité fictive'),
  ('9100000c-0000-4000-8000-00000000000c', '9000000c-0000-4000-8000-00000000000c', 'offer', 'légumes', 'Aubergines', 22, 'caisses', current_date, current_date + interval '5 days', 'Compte démo — simulation maraîchère'),
  ('9100000d-0000-4000-8000-00000000000d', '9000000d-0000-4000-8000-00000000000d', 'offer', 'légumes', 'Betteraves', 26, 'caisses', current_date, current_date + interval '8 days', 'Compte démo — producteur fictif'),
  ('9100000e-0000-4000-8000-00000000000e', '9000000e-0000-4000-8000-00000000000e', 'offer', 'légumes', 'Herbes fraîches', 14, 'bacs', current_date, current_date + interval '2 days', 'Compte démo — offre synthétique Palaiseau'),
  ('9100000f-0000-4000-8000-00000000000f', '9000000f-0000-4000-8000-00000000000f', 'offer', 'fruits', 'Poires conférence', 24, 'caisses', current_date, current_date + interval '6 days', 'Compte démo — primeur fictif'),
  ('91000010-0000-4000-8000-000000000010', '90000010-0000-4000-8000-000000000010', 'offer', 'produits laitiers', 'Lait entier local', 35, 'cartons', current_date, current_date + interval '5 days', 'Compte démo — laiterie synthétique'),
  ('91000011-0000-4000-8000-000000000011', '90000011-0000-4000-8000-000000000011', 'offer', 'produits laitiers', 'Fromage frais', 19, 'cartons', current_date, current_date + interval '4 days', 'Compte démo — fromagerie fictive'),
  ('91000012-0000-4000-8000-000000000012', '90000012-0000-4000-8000-000000000012', 'offer', 'épicerie', 'Miel toutes fleurs', 80, 'pots', current_date, current_date + interval '90 days', 'Compte démo — apiculteur fictif'),
  ('91000013-0000-4000-8000-000000000013', '90000013-0000-4000-8000-000000000013', 'offer', 'pain', 'Pain de campagne', 45, 'unités', current_date, current_date + interval '1 days', 'Compte démo — surplus boulangerie fictif'),
  ('91000014-0000-4000-8000-000000000014', '90000014-0000-4000-8000-000000000014', 'offer', 'légumes', 'Champignons de Paris', 18, 'plateaux', current_date, current_date + interval '4 days', 'Compte démo — offre synthétique'),
  ('91000015-0000-4000-8000-000000000015', '90000015-0000-4000-8000-000000000015', 'offer', 'fruits', 'Agrumes assortis', 30, 'caisses', current_date, current_date + interval '7 days', 'Compte démo — primeur fictif Massy'),
  ('91000016-0000-4000-8000-000000000016', '90000016-0000-4000-8000-000000000016', 'offer', 'légumes', 'Légumes de marché assortis', 70, 'caisses', current_date, current_date + interval '3 days', 'Compte démo — simulation secteur Rungis'),
  ('91000017-0000-4000-8000-000000000017', '90000017-0000-4000-8000-000000000017', 'offer', 'fruits', 'Bananes et fruits exotiques', 48, 'caisses', current_date, current_date + interval '5 days', 'Compte démo — grossiste fictif secteur Rungis'),
  ('91000018-0000-4000-8000-000000000018', '90000018-0000-4000-8000-000000000018', 'offer', 'légumes', 'Oignons et échalotes', 44, 'sacs', current_date, current_date + interval '14 days', 'Compte démo — atelier fictif Wissous'),
  ('91000019-0000-4000-8000-000000000019', '90000019-0000-4000-8000-000000000019', 'offer', 'pain', 'Paniers repas invendus', 25, 'paniers', current_date, current_date + interval '1 days', 'Compte démo — restaurant fictif pour test anti-gaspi')
on conflict (id) do nothing;

-- Extra crisis-ready stock so the demo accounts appear in the dashboard
-- during heatwave and transport-strike alerts.
insert into listings (
  id, owner_id, type, product_category, product_name,
  quantity, unit, available_from, expires_at, notes
) values
  ('92000001-0000-4000-8000-000000000001', '90000001-0000-4000-8000-000000000001', 'offer', 'eau', 'Eaux minérales 1.5 L', 12, 'palettes', current_date, current_date + interval '18 days', 'Compte démo — stock crise chaleur autour de Gif-sur-Yvette'),
  ('92000002-0000-4000-8000-000000000002', '90000002-0000-4000-8000-000000000002', 'offer', 'boissons', 'Jus de pomme local 1 L', 30, 'cartons', current_date, current_date + interval '9 days', 'Compte démo — boissons disponibles pour pic de demande'),
  ('92000003-0000-4000-8000-000000000003', '90000003-0000-4000-8000-000000000003', 'offer', 'eau', 'Eaux minérales 50 cl', 8, 'palettes', current_date, current_date + interval '14 days', 'Compte démo — stock hydratation fictif'),
  ('92000004-0000-4000-8000-000000000004', '90000004-0000-4000-8000-000000000004', 'offer', 'produits laitiers', 'Lait demi-écrémé 1 L', 18, 'palettes', current_date, current_date + interval '6 days', 'Compte démo — stock frais pour crise chaleur'),
  ('92000005-0000-4000-8000-000000000005', '90000005-0000-4000-8000-000000000005', 'offer', 'glaces', 'Sorbets fruits rouges', 22, 'cartons', current_date, current_date + interval '5 days', 'Compte démo — glaces fictives pour forte chaleur'),
  ('92000006-0000-4000-8000-000000000006', '90000006-0000-4000-8000-000000000006', 'offer', 'eau', 'Bonbonnes eau 5 L', 70, 'unités', current_date, current_date + interval '21 days', 'Compte démo — stock eau grand format'),
  ('92000007-0000-4000-8000-000000000007', '90000007-0000-4000-8000-000000000007', 'offer', 'produits laitiers', 'Yaourts nature 4x125g', 34, 'cartons', current_date, current_date + interval '4 days', 'Compte démo — DLC courte, stock limité'),
  ('92000008-0000-4000-8000-000000000008', '90000008-0000-4000-8000-000000000008', 'offer', 'boissons', 'Limonade artisanale', 24, 'cartons', current_date, current_date + interval '12 days', 'Compte démo — boissons fraîches fictives'),
  ('92000009-0000-4000-8000-000000000009', '90000009-0000-4000-8000-000000000009', 'offer', 'eau', 'Eaux pétillantes 1 L', 10, 'palettes', current_date, current_date + interval '16 days', 'Compte démo — réserve eau fictive'),
  ('9200000a-0000-4000-8000-00000000000a', '9000000a-0000-4000-8000-00000000000a', 'offer', 'boissons', 'Thés glacés pêche', 20, 'cartons', current_date, current_date + interval '20 days', 'Compte démo — offre boisson crise chaleur'),
  ('9200000b-0000-4000-8000-00000000000b', '9000000b-0000-4000-8000-00000000000b', 'offer', 'glaces', 'Glaces bâtonnets assorties', 16, 'cartons', current_date, current_date + interval '7 days', 'Compte démo — froid négatif disponible'),
  ('9200000c-0000-4000-8000-00000000000c', '9000000c-0000-4000-8000-00000000000c', 'offer', 'eau', 'Eaux minérales 1 L', 9, 'palettes', current_date, current_date + interval '15 days', 'Compte démo — hydratation fictive'),
  ('9200000d-0000-4000-8000-00000000000d', '9000000d-0000-4000-8000-00000000000d', 'offer', 'produits laitiers', 'Fromage blanc 1 kg', 18, 'cartons', current_date, current_date + interval '5 days', 'Compte démo — produit frais à écouler'),
  ('9200000e-0000-4000-8000-00000000000e', '9000000e-0000-4000-8000-00000000000e', 'offer', 'boissons', 'Smoothies légumes-fruits', 14, 'cartons', current_date, current_date + interval '3 days', 'Compte démo — stock frais boisson'),
  ('9200000f-0000-4000-8000-00000000000f', '9000000f-0000-4000-8000-00000000000f', 'offer', 'glaces', 'Bacs glace vanille', 12, 'cartons', current_date, current_date + interval '6 days', 'Compte démo — stock froid fictif'),
  ('92000010-0000-4000-8000-000000000010', '90000010-0000-4000-8000-000000000010', 'offer', 'produits laitiers', 'Lait entier local', 22, 'cartons', current_date, current_date + interval '5 days', 'Compte démo — laiterie synthétique crise chaleur'),
  ('92000011-0000-4000-8000-000000000011', '90000011-0000-4000-8000-000000000011', 'offer', 'produits laitiers', 'Crème fraîche', 15, 'cartons', current_date, current_date + interval '4 days', 'Compte démo — stock frais fictif'),
  ('92000012-0000-4000-8000-000000000012', '90000012-0000-4000-8000-000000000012', 'offer', 'boissons', 'Eau aromatisée miel-citron', 18, 'cartons', current_date, current_date + interval '18 days', 'Compte démo — boissons fictives'),
  ('92000013-0000-4000-8000-000000000013', '90000013-0000-4000-8000-000000000013', 'offer', 'pain', 'Pain de mie', 28, 'caisses', current_date, current_date + interval '3 days', 'Compte démo — stock utile en cas de grève transport'),
  ('92000014-0000-4000-8000-000000000014', '90000014-0000-4000-8000-000000000014', 'offer', 'eau', 'Eaux minérales 1.5 L', 11, 'palettes', current_date, current_date + interval '17 days', 'Compte démo — réserve eau fictive'),
  ('92000015-0000-4000-8000-000000000015', '90000015-0000-4000-8000-000000000015', 'offer', 'boissons', 'Jus orange 1 L', 26, 'cartons', current_date, current_date + interval '8 days', 'Compte démo — primeur fictif avec boissons'),
  ('92000016-0000-4000-8000-000000000016', '90000016-0000-4000-8000-000000000016', 'offer', 'eau', 'Eaux minérales 1.5 L', 35, 'palettes', current_date, current_date + interval '20 days', 'Compte démo — stock secteur Rungis'),
  ('92000017-0000-4000-8000-000000000017', '90000017-0000-4000-8000-000000000017', 'offer', 'glaces', 'Glaces fruits exotiques', 24, 'cartons', current_date, current_date + interval '6 days', 'Compte démo — grossiste fictif secteur Rungis'),
  ('92000018-0000-4000-8000-000000000018', '90000018-0000-4000-8000-000000000018', 'offer', 'eau', 'Eaux minérales 50 cl', 16, 'palettes', current_date, current_date + interval '19 days', 'Compte démo — stock hydratation Wissous'),
  ('92000019-0000-4000-8000-000000000019', '90000019-0000-4000-8000-000000000019', 'offer', 'boissons', 'Paniers boissons fraîches', 20, 'paniers', current_date, current_date + interval '2 days', 'Compte démo — restaurant fictif, stock immédiat')
on conflict (id) do nothing;
