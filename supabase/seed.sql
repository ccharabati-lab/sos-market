-- seed.sql — idempotent demo data for SOS-Market
-- Apply after 001_init.sql by pasting into the Supabase SQL editor.
-- Re-running is safe: every insert uses ON CONFLICT (id) DO NOTHING.

-- ─── profiles ────────────────────────────────────────────────────────
-- Hardcoded UUIDs so other seed rows can reference them deterministically.
-- profiles.id has no FK to auth.users (see 001_init.sql), so we don't need
-- real Supabase Auth users to exist for this seed to run.
insert into profiles (id, name, role, lat, lng, address, phone) values
  ('11111111-1111-1111-1111-111111111111',
   'Intermarché Gif-sur-Yvette', 'supermarket',
   48.6833, 2.1333,
   '3 rue de la Vallée, 91190 Gif-sur-Yvette',
   '+33 1 69 00 00 01'),

  ('22222222-2222-2222-2222-222222222222',
   'Intermarché Bourg-la-Reine', 'supermarket',
   48.7797, 2.3153,
   '12 av. du Général Leclerc, 92340 Bourg-la-Reine',
   '+33 1 46 00 00 02'),

  ('33333333-3333-3333-3333-333333333333',
   'Ferme des Granges — Chevreuse', 'producer',
   48.7058, 2.0314,
   'Route de Saint-Lambert, 78460 Chevreuse',
   '+33 1 30 00 00 03'),

  ('44444444-4444-4444-4444-444444444444',
   'Maraîcher Les Ulis', 'producer',
   48.6833, 2.1833,
   'Zone agricole, 91940 Les Ulis',
   '+33 1 69 00 00 04'),

  ('55555555-5555-5555-5555-555555555555',
   'Restaurant Universitaire CentraleSupélec', 'restaurant',
   48.7103, 2.1667,
   '8-10 rue Joliot-Curie, 91190 Gif-sur-Yvette',
   '+33 1 75 00 00 05')
on conflict (id) do nothing;

-- ─── listings ────────────────────────────────────────────────────────
insert into listings (
  id, owner_id, type, product_category, product_name,
  quantity, unit, available_from, expires_at, notes
) values
  -- Producer offers
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '33333333-3333-3333-3333-333333333333',
   'offer', 'légumes', 'Légumes de saison',
   80, 'caisses', current_date, current_date + interval '5 days',
   'Récolte du jour — livraison directe possible'),

  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '44444444-4444-4444-4444-444444444444',
   'offer', 'légumes', 'Tomates et courgettes',
   40, 'caisses', current_date, current_date + interval '3 days',
   'DLC courte — à écouler rapidement'),

  -- Supermarket offer
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '22222222-2222-2222-2222-222222222222',
   'offer', 'eau', 'Eaux minérales 1.5 L',
   30, 'palettes', current_date, current_date + interval '30 days',
   'Surplus suite à promo annulée'),

  -- Crisis-driven needs
  ('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111',
   'need', 'eau', 'Eaux minérales 1.5 L',
   20, 'palettes', current_date, current_date + interval '2 days',
   'Besoin urgent — vague de chaleur prévue'),

  ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '55555555-5555-5555-5555-555555555555',
   'need', 'légumes', 'Fruits et légumes frais',
   15, 'caisses', current_date, current_date + interval '4 days',
   'Pour service du midi semaine prochaine')
on conflict (id) do nothing;

-- ─── crisis_alerts ───────────────────────────────────────────────────
insert into crisis_alerts (
  id, title, severity, affected_categories, region,
  starts_at, ends_at, source
) values
  ('cccc1111-cccc-cccc-cccc-cccccccccccc',
   'Vague de chaleur prévue — pic à 38 °C',
   'critical',
   array['eau', 'boissons', 'produits laitiers', 'glaces'],
   'Île-de-France',
   now() + interval '1 day',
   now() + interval '4 days',
   'Météo-France'),

  ('cccc2222-cccc-cccc-cccc-cccccccccccc',
   'Grève des transporteurs routiers',
   'warning',
   array['fruits', 'légumes', 'pain'],
   'Île-de-France',
   now() + interval '3 days',
   now() + interval '6 days',
   'CGT Transport')
on conflict (id) do nothing;
