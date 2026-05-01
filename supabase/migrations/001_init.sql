-- 001_init.sql — SOS-Market initial schema
-- Apply by pasting the whole file into the Supabase SQL editor and running.

create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────
-- profiles.id is intended to match auth.users(id). The FK is intentionally
-- omitted so seed.sql can populate profiles without first seeding auth.users.
-- When wiring up Supabase Auth in production, add the FK and a signup
-- trigger that auto-inserts a profile row:
--   alter table profiles
--     add constraint profiles_id_fkey
--     foreign key (id) references auth.users(id) on delete cascade;
create table profiles (
  id          uuid        primary key,
  name        text        not null,
  role        text        not null check (role in ('supermarket', 'producer', 'restaurant')),
  lat         double precision,
  lng         double precision,
  address     text,
  phone       text,
  created_at  timestamptz not null default now()
);

-- ─── listings ────────────────────────────────────────────────────────
create table listings (
  id                uuid        primary key default gen_random_uuid(),
  owner_id          uuid        not null references profiles(id) on delete cascade,
  type              text        not null check (type in ('offer', 'need')),
  product_category  text        not null,
  product_name      text        not null,
  quantity          integer,
  unit              text,
  available_from    date,
  expires_at        date,
  notes             text,
  created_at        timestamptz not null default now()
);

create index listings_owner_id_idx          on listings (owner_id);
create index listings_product_category_idx  on listings (product_category);
create index listings_type_idx              on listings (type);

-- ─── crisis_alerts ───────────────────────────────────────────────────
create table crisis_alerts (
  id                   uuid        primary key default gen_random_uuid(),
  title                text        not null,
  severity             text        not null check (severity in ('critical', 'warning')),
  affected_categories  text[]      not null default '{}',
  region               text,
  starts_at            timestamptz,
  ends_at              timestamptz,
  source               text,
  created_at           timestamptz not null default now()
);

create index crisis_alerts_starts_at_idx  on crisis_alerts (starts_at);
create index crisis_alerts_severity_idx   on crisis_alerts (severity);

-- ─── Row Level Security ──────────────────────────────────────────────
alter table profiles       enable row level security;
alter table listings       enable row level security;
alter table crisis_alerts  enable row level security;

-- profiles: any authenticated user can read; only the row owner can write.
create policy "profiles_select_authenticated"
  on profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_self"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_self"
  on profiles for delete
  to authenticated
  using (id = auth.uid());

-- listings: any authenticated user can read; only the owner can write.
create policy "listings_select_authenticated"
  on listings for select
  to authenticated
  using (true);

create policy "listings_insert_owner"
  on listings for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "listings_update_owner"
  on listings for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "listings_delete_owner"
  on listings for delete
  to authenticated
  using (owner_id = auth.uid());

-- crisis_alerts: any authenticated user can read; writes are service-role only.
create policy "crisis_alerts_select_authenticated"
  on crisis_alerts for select
  to authenticated
  using (true);
