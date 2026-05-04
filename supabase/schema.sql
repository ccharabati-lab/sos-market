-- SOS-Market — Supabase schema
-- Run this in the Supabase SQL editor (or psql) to create the tables.

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id                 uuid primary key, -- references auth.users(id)
  name               text not null,
  role               text,
  lat                double precision,
  lng                double precision,
  address            text,
  phone              text,
  created_at         timestamptz not null default now()
);

create table if not exists listings (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references profiles(id) on delete cascade,
  type               text not null check (type in ('offer', 'need')),
  product_category   text,
  product_name       text,
  quantity           numeric,
  unit               text,
  available_from     date,
  expires_at         date,
  notes              text,
  created_at         timestamptz not null default now()
);

create table if not exists alerts (
  id                 uuid primary key default gen_random_uuid(),
  type               text not null,
  severity           text not null check (severity in ('critical', 'warning')),
  title              text not null,
  description        text,
  affected_products  jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now()
);

create table if not exists suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text,
  distance_km   numeric(6,2),
  availability  text,
  stock_detail  text,
  lat           double precision,
  lng           double precision
);

create table if not exists contact_requests (
  id           uuid primary key default gen_random_uuid(),
  supplier_id  uuid references suppliers(id) on delete set null,
  store_id     text,
  status       text not null default 'pending' check (status in ('pending', 'sent', 'accepted', 'declined')),
  created_at   timestamptz not null default now()
);

create table if not exists stock_signals (
  id           uuid primary key default gen_random_uuid(),
  store_name   text not null,
  store_type   text,
  signal_type  text not null check (signal_type in ('surplus', 'shortage')),
  product      text not null,
  quantity     text,
  distance_km  numeric(6,2),
  lat          double precision,
  lng          double precision,
  created_at   timestamptz not null default now()
);

create index if not exists idx_alerts_created_at         on alerts (created_at desc);
create index if not exists idx_stock_signals_created_at  on stock_signals (created_at desc);
create index if not exists idx_contact_requests_status   on contact_requests (status);

-- ─── Row Level Security (RLS) ────────────────────────────────────────

alter table listings enable row level security;

-- Anyone can view listings
create policy "Listings are viewable by everyone" 
  on listings for select using (true);

-- Only owners can delete their own listings
create policy "Users can delete their own listings"
  on listings for delete
  using (auth.uid() = owner_id);
