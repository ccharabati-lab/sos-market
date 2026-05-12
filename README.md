# SOS-Market

Crisis-anticipation platform that connects supermarkets, producers, and
restaurants in Île-de-France so they can exchange stock during heatwaves,
strikes, and other supply shocks.

Stack: Next.js 14 (App Router) · Supabase · Tailwind · lucide-react.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # if you don't already have one
# fill in the two NEXT_PUBLIC_SUPABASE_* values
npm run dev
```

The app boots at <http://localhost:3000> and redirects to `/dashboard`.

## Database setup

Schema and seed live in plain SQL — no Supabase CLI required.

1. Open the Supabase dashboard for your project → **SQL editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/001_init.sql` and click
   **Run**. This creates the three tables (`profiles`, `listings`,
   `crisis_alerts`), their indexes, and Row-Level-Security policies.
3. In a new query, paste `supabase/seed.sql` and click **Run**. This inserts
   five demo profiles (Paris-Saclay area), five listings (3 offers + 2 needs),
   and two crisis alerts. The seed is idempotent (`on conflict (id) do nothing`),
   so re-running it is safe.
4. Optional map demo data: paste `supabase/seed-demo-network.sql` into a new
   query and click **Run**. This adds 25 synthetic demo accounts around
   Gif-sur-Yvette, Paris-Saclay, Chevreuse, Massy, and Rungis, each with one
   local offer plus one crisis-ready offer (`eau`, `boissons`,
   `produits laitiers`, `glaces`, or `pain`) so they appear on the network map,
   crisis dashboard, and daily market matcher. These are explicitly fake records
   and are not real clients or real businesses.

### Verifying

```sql
select count(*) from profiles;       -- 5
select count(*) from listings;       -- 5
select count(*) from crisis_alerts;  -- 2
```

After running the optional network seed:

```sql
select count(*) from profiles where name like 'Démo%';          -- 25
select count(*) from listings where notes like 'Compte démo%';  -- 50
```

## File layout

```
app/                           App Router routes
  dashboard/                   crisis tab
  daily/                       daily-stock tab
components/                    UI building blocks
data/demo.js                   hardcoded demo data (used until queries are wired up)
lib/
  supabase.ts                  typed Supabase client
  queries.ts                   getMatchingSuppliers, getActiveCrises
types/index.ts                 Profile, Listing, CrisisAlert, MatchResult, Database
supabase/
  migrations/001_init.sql      schema + RLS policies
  seed.sql                     idempotent demo data
  seed-demo-network.sql        optional 25-account synthetic map seed
```

## Notes on the schema

- `profiles.id` is intended to match `auth.users(id)`, but the migration does
  not add the FK so seed data can populate without first creating real
  authenticated users. When wiring up Supabase Auth, add the FK and a signup
  trigger.
- Crisis alerts are read-only for end users; only the service role can
  insert/update/delete them. RLS for `profiles` and `listings` is permissive
  on read and owner-scoped on write.
- Distance is computed in JavaScript (haversine) inside `getMatchingSuppliers`,
  so PostGIS is not required.
