# CLAUDE.md — SOS-Market

> **Read this file first.** Every agent session, before writing any code, read this whole file and the relevant files in `/docs`. Do not skip.

---

## 1. What this project is

**SOS-Market** is a B2B web platform that helps supermarkets anticipate supply-chain crises (heatwaves, strikes, panic-buying, geopolitical events) and find alternative stock from nearby supermarkets, producers, and farmers — *before* shelves go empty or before they over-order and waste stock.

**Two halves to the product:**

1. **Crisis alerts** — AI-predicted disruption warnings (powered by Mileva, our predictive-AI partner). Tells the store manager: *"a heatwave is coming in 48h, expect a run on bottled water and ice cream."*
2. **Daily stock exchange** — a matching system that connects the store with nearby suppliers/producers/other stores who have what they need (or who can take their surplus).

**Target user:** the store manager of an Intermarché (or similar mid-size supermarket). Demo persona is **Olivier**, Intermarché Gif-sur-Yvette.

**Delivery context:** this is a student consulting/engineering project at CentraleSupélec × McGill. Final presentation is **June 12, 2026**. Deliverable is a working proof-of-concept (not a production product). Optimize for *demo-able and credible*, not *scalable*.

---

## 2. Team & ownership

- **Carlos** (me) — front-end (website) + back-end (model). Works directly with Claude/Claude Code.
- **Théa, Alix, Marie, Clémence** — data sourcing, market validation, consulting report, pitch deck.

External partners:
- **Sonia** — academic supervisor, connector to industry contacts.
- **Mileva** — provides the predictive-AI side. They expose an API; we consume it.
- **Intermarché manager (Bourg-la-Reine + Gif-sur-Yvette)** — field validation, market signal.

---

## 3. Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | **Next.js 14** | App Router. Not Pages Router. |
| Language | TypeScript / JavaScript | TS preferred for new files |
| Styling | **Tailwind CSS** | Use utility classes, not custom CSS files |
| Icons | **lucide-react** | Don't add other icon libraries |
| Database | **Supabase** | Postgres + Auth. Schema SQL is ready, not yet connected as of this writing |
| Deployment | **Vercel** | Auto-deploys from main. Live URL: `sos-market.vercel.app` |
| Predictive AI | **Mileva API** | Endpoint pending. Treat as external service we `fetch` from |
| Future | Domain `sos-market.fr` via OVH | Deferred. Free Vercel URL is fine for June 12 |

**Don't introduce new libraries without checking with me first.** Specifically: no Redux, no other CSS frameworks, no other icon sets, no ORMs other than Supabase's client.

---

## 4. Project structure

```
/.claude              ← Local Claude/Codex settings
  settings.local.json
/.vercel              ← Vercel project link metadata
  project.json
  README.txt
/app                  ← Next.js App Router routes and global styles
  /auth               ← Auth screens
    /signin           ← Sign-in route
      page.tsx
    /signup           ← Sign-up route and profile creation
      page.tsx
  /dashboard          ← Crisis alerts + supplier recommendations
    page.tsx
  /daily              ← Daily stock exchange / matching workspace
    page.js
  /network            ← Network map of active listings
    NetworkClient.tsx
    page.tsx
  /reports            ← Reports route placeholder
    page.tsx
  /settings           ← Account/settings route
    SettingsClient.tsx
    page.tsx
  globals.css         ← Tailwind/global CSS and design tokens
  layout.js           ← Root app layout
  page.js             ← Root redirect/entry page
/components           ← Shared UI and feature components
  ContactModal.js
  ContactModalProvider.js
  CrisisCard.js
  DashboardClient.tsx
  DeleteListingButton.tsx
  ExchangeWorkspace.tsx
  Header.js
  MapView.tsx
  MesSignaux.tsx
  MiniMap.js
  Providers.js
  Sidebar.js
  SignOutButton.tsx
  TabsBar.js
/docs                 ← Project context for agents (to be created)
/lib                  ← Supabase clients and query helpers
  queries.ts
  supabase-browser.ts
  supabase-server.ts
  supabase.js
  supabase.ts
/public               ← Static assets (currently empty)
/supabase             ← SQL schema and seed data for Supabase
  /migrations         ← Canonical migration SQL
    001_init.sql
  schema.sql          ← Older/alternate schema draft
  seed-demo-network.sql
  seed-extended.sql
  seed.sql
/types                ← Shared TypeScript database/domain types
  index.ts
.env.local            ← NOT committed. Supabase + Mapbox keys live here
.env.local.example    ← Public example env var names
CLAUDE.md             ← Agent operating context
README.md             ← Setup and project notes
next.config.js        ← Next.js config
package-lock.json     ← npm lockfile
package.json          ← Scripts and dependencies
postcss.config.js     ← PostCSS/Tailwind config
tailwind.config.js    ← Tailwind theme config
tsconfig.json         ← TypeScript config
```

---

## 5. Design system (canonical)

**Light theme. Clean. Professional. Not playful.**

| Token | Value | Use |
|---|---|---|
| Background | `#ffffff` / `bg-white` | Page background |
| Background secondary | `bg-gray-50` | Cards, panels |
| Border | `border-gray-200` | All borders, default |
| Text primary | `text-gray-900` | Headings, body |
| Text muted | `text-gray-500` | Labels, secondary text |
| **Green (primary)** | `#1e6b45` | "Available", success, primary CTA |
| **Red (critical)** | `#c0312b` | Critical alerts, errors |
| **Amber (warning)** | `#b45309` | Warnings, partial stock |

**Typography:** system font stack (`-apple-system`, `Segoe UI`, sans-serif). No custom fonts loaded.

**Component conventions:**
- Rounded corners: `rounded-lg` for cards, `rounded-md` for buttons, `rounded-full` for pills/badges.
- Spacing: prefer Tailwind's `gap-*` and `p-*` over margins.
- Icons: always `lucide-react`, size 16-18px inline, 14px in buttons.
- Buttons: green CTA = `bg-[#1e6b45] text-white hover:bg-[#175739]`.

**Language:** UI is in **French**. All user-facing strings in French. Code comments and variable names in English.

---

## 6. Data model (current schema, see /supabase/migrations/001_init.sql for SQL)

Core entities — keep these names consistent everywhere:

- `profiles` — organizations using the platform: supermarkets, producers, restaurants (id, name, role, lat, lng, address, phone, created_at)
- `listings` — stock offers and needs owned by profiles (id, owner_id, type, product_category, product_name, quantity, unit, available_from, expires_at, notes, created_at)
- `crisis_alerts` — crisis alerts shown on the dashboard (id, title, severity, affected_categories, region, starts_at, ends_at, source, created_at)

**Important:** don't add tables without updating `/supabase/migrations/001_init.sql`, `/types/index.ts`, and relevant seed SQL in the same commit.

---

## 7. The Mileva integration (when it exists)

Mileva will expose a REST endpoint. Expected shape (subject to confirmation):

```
GET /alerts?region=ile-de-france&since=2026-06-01
```

Returns JSON like:
```json
{
  "alerts": [
    {
      "id": "alert_xyz",
      "type": "heatwave",
      "severity": "critical",
      "region": "ile-de-france",
      "affected_categories": ["bottled_water", "ice_cream", "dairy"],
      "starts_at": "2026-06-13T00:00:00Z",
      "ends_at": "2026-06-15T00:00:00Z",
      "confidence": 0.87,
      "source": "Meteo-France + cascade analysis"
    }
  ]
}
```

Wrap all Mileva calls in `/lib/mileva/client.ts`. **Never call the API directly from a component.** Cache responses in Supabase (`crises` table) on a schedule.

Until the API is live, use the hardcoded demo data in `/lib/mileva/demo-data.ts`. Don't delete the demo data when the API ships — keep it as a fallback for the June 12 demo in case the API misbehaves on stage.

---

## 8. Current state (update this section as we ship)

### Done
- Next.js 14 scaffolded, App Router, Tailwind, lucide-react
- Two routes: `/dashboard` and `/daily`
- Demo UI with hardcoded data (heatwave alert, truck strike alert, mock suppliers)
- Deployed to Vercel at `sos-market.vercel.app`
- Light theme design system applied

### In progress / next
1. **Fix bug:** modal stuck open on page load (`/dashboard`). Reproduce, trace, fix.
2. **Connect Supabase:** create project, run schema SQL from `/docs/schema.md`, add env vars to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
3. **Add Sentry** (free Developer plan): `npx @sentry/wizard@latest -i nextjs`
4. **Stock matching algorithm** — rule-based weighted scoring (not ML), in `/lib/matching/`. Inputs: store location, crisis, supplier inventory. Output: ranked list of matches. Weights to be decided; start with: distance 50%, availability 30%, freshness 20%.
5. **Integrate Mileva API** when ready — replace `/lib/mileva/demo-data.ts` reads with `/lib/mileva/client.ts` fetches.

### Deferred (don't work on these for June 12 unless asked)
- Custom domain `sos-market.fr`
- Authentication / multi-store accounts (demo is single-store as Olivier)
- Payment / subscription flow (€6k/store/year is in the pitch, not in the product)
- Mobile native app
- Real-time chat between users
- Multi-language (UI stays French only)

---

## 9. How to work with me (Carlos) — agent behavior rules

1. **One terminal command at a time.** When you need me to run something, give me one command. Wait for the output before suggesting the next.
2. **Concrete over explanatory.** Don't explain the plan in 5 paragraphs. Show me the diff or the command.
3. **Diagnose env issues with the simplest fix first.** Permissions, paths, missing packages — give me the one-line fix, not a 20-step debug.
4. **When the user asks for X, do X first.** If you think there's a better approach, mention it briefly after delivering X — don't refuse to deliver X and propose an alternative instead.
5. **Don't invent tables, columns, or API fields.** If something isn't in this file or in `/docs`, ask before adding it.
6. **Preserve French in UI strings.** Code in English, UI in French. Don't "fix" French to English.
7. **Demo over polish.** The goal on June 12 is a 5-minute live demo that doesn't crash. Reject scope creep that doesn't make the demo better.

---

## 10. Demo script (what June 12 needs to show)

The demo runs ~5 minutes. The flow:

1. Open `sos-market.vercel.app/dashboard` as Olivier (Intermarché Gif-sur-Yvette).
2. A **critical heatwave alert** is visible at the top, flagged by Mileva.
3. Olivier clicks into it. He sees affected categories (water, ice cream, dairy) and a list of **nearby suppliers with available stock**, ranked by distance + availability.
4. Olivier selects one — "Brasserie Éco-Vallée, 8.4 km, livraison J+1." Clicks "Contacter."
5. A modal appears: call / email / message + "Envoyer une demande de devis." Confirmation: *"Demande envoyée. Brasserie Éco-Vallée a été notifié."*
6. Optionally: navigate to `/daily` to show the surplus side — Olivier has too much of something else, sees who nearby wants it.

**Anything that doesn't directly serve this script is out of scope until after June 12.**

---

## 11. Decision log (append-only — see /docs/decisions.md for the full version)

- **2026-04:** Chose rule-based weighted scoring over ML for matching. Reason: ~20h vs 60-80h to build, transparent/auditable for the consulting framing, no training data needed.
- **2026-04:** Chose Next.js + Vercel + Supabase over custom backend. Reason: zero-ops, free tier covers demo, fast for a 4-person student team.
- **2026-04:** UI is French-only. Reason: target users are French supermarket managers; multilingual is post-MVP.
- **2026-05:** Domain deferred — sticking with `sos-market.vercel.app` for June 12.
- **2026-05:** Treating Mileva as an external API we consume, not a model we host. Reason: partnership boundary, and they'll handle compute.

---

*Last updated: May 14, 2026 — Carlos*
