-- seed-extended.sql — adds listings to the 5 user-signed-up profiles.
-- Idempotent: re-running is safe (ON CONFLICT (id) DO NOTHING).
-- Run after the 5 fake accounts have been created via the live signup form.
-- Paste into Supabase Studio → SQL Editor → Run.

with p as (
  select id, name from profiles
  where name in (
    'Carrefour Market Orsay',
    'Intermarché Massy',
    'Monoprix Sceaux',
    'Ferme des Trois Chênes',
    'Bistrot du Marché'
  )
)
insert into listings (
  id, owner_id, type, product_category, product_name,
  quantity, unit, available_from, expires_at, notes
) values
  -- ─── Carrefour Market Orsay (supermarket) ─────────────────────────
  ('dddd0001-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Carrefour Market Orsay'),
   'offer', 'eau', 'Eaux minérales 1.5 L',
   18, 'palettes', current_date, current_date + interval '14 days',
   'Surplus suite à promo annulée'),
  ('dddd0002-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Carrefour Market Orsay'),
   'offer', 'produits laitiers', 'Yaourts nature 4x125g',
   25, 'cartons', current_date, current_date + interval '4 days',
   'DLC courte — à écouler rapidement'),
  ('dddd0003-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Carrefour Market Orsay'),
   'need', 'pain', 'Pain de mie',
   10, 'caisses', current_date, current_date + interval '3 days',
   'Rupture fournisseur, besoin urgent'),

  -- ─── Intermarché Massy (supermarket) ──────────────────────────────
  ('dddd0004-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Intermarché Massy'),
   'offer', 'fruits', 'Pommes Gala',
   12, 'cartons', current_date, current_date + interval '6 days',
   'Stock en excédent semaine 22'),
  ('dddd0005-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Intermarché Massy'),
   'need', 'eau', 'Eaux minérales 50 cl',
   15, 'palettes', current_date, current_date + interval '2 days',
   'Pic de demande prévu — vague de chaleur'),
  ('dddd0006-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Intermarché Massy'),
   'offer', 'épicerie', 'Conserves de tomates 400g',
   40, 'cartons', current_date, current_date + interval '60 days',
   'Surstock fin de référencement'),

  -- ─── Monoprix Sceaux (supermarket) ────────────────────────────────
  ('dddd0007-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Monoprix Sceaux'),
   'offer', 'boissons', 'Jus d''orange pressé 1L',
   20, 'cartons', current_date, current_date + interval '5 days',
   'Promo non vendue, livraison possible'),
  ('dddd0008-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Monoprix Sceaux'),
   'need', 'légumes', 'Salade fraîche',
   8, 'caisses', current_date, current_date + interval '2 days',
   'Réassort manquant cette semaine'),
  ('dddd0009-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Monoprix Sceaux'),
   'need', 'produits laitiers', 'Lait demi-écrémé 1L',
   12, 'palettes', current_date, current_date + interval '5 days',
   'Volume habituel insuffisant'),

  -- ─── Ferme des Trois Chênes (producer) ────────────────────────────
  ('dddd000a-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Ferme des Trois Chênes'),
   'offer', 'légumes', 'Courgettes',
   60, 'kg', current_date, current_date + interval '4 days',
   'Récolte du jour, livraison directe'),
  ('dddd000b-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Ferme des Trois Chênes'),
   'offer', 'fruits', 'Fraises de saison',
   25, 'caisses', current_date, current_date + interval '3 days',
   'DLC courte, prix négociable'),
  ('dddd000c-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Ferme des Trois Chênes'),
   'offer', 'légumes', 'Salade verte',
   80, 'unités', current_date, current_date + interval '2 days',
   'À récupérer cette semaine'),

  -- ─── Bistrot du Marché (restaurant) ───────────────────────────────
  ('dddd000d-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Bistrot du Marché'),
   'need', 'fruits', 'Citrons jaunes',
   20, 'kg', current_date, current_date + interval '3 days',
   'Service week-end'),
  ('dddd000e-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Bistrot du Marché'),
   'need', 'légumes', 'Tomates anciennes',
   15, 'kg', current_date, current_date + interval '4 days',
   'Carte estivale — qualité primeur'),
  ('dddd000f-dddd-dddd-dddd-dddddddddddd',
   (select id from p where name = 'Bistrot du Marché'),
   'offer', 'pain', 'Pain de campagne (fin de service)',
   8, 'unités', current_date, current_date + interval '1 days',
   'À récupérer en fin de journée')
on conflict (id) do nothing;
