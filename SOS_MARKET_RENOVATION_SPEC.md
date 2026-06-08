# SOS-Market — UI Renovation Spec

**Version 2.0 · 8 June 2026**
**Source of truth for the pre-demo redesign. Read this fully before coding.**
**Demo: 12 June 2026.** Golden rule: this doc is the scope. No new ideas mid-build until post-demo.

---

## 0. How to build (read first)

**Sequence everything W → S → C. One phase at a time. Stop and report at each phase boundary. Browser-QA between phases.**

- `[W]` = wording only (change a string). Near-zero risk. Ship first.
- `[S]` = structure/layout (move, remove, restyle existing components). Moderate.
- `[C]` = new code (new components/logic/routing). Heaviest. Do last, with the most runway.

**Hard guardrails (apply to every change):**

1. Work on a **feature branch** and let **Vercel build a preview** before any merge to `main`. Never push redesign work straight to `main`.
2. Before removing **any** prop, export, or component, **grep the whole repo for every consumer** and update them in the same change. (A removed-but-still-consumed prop already broke a Vercel build once.)
3. **Do not touch the data layer** — `lib/mileva.ts`, `lib/queries.ts`, `lib/supabase.ts`, the Supabase schema, or any `*.sql`. This is a visual/flow renovation only.
4. **No new dependencies** without explicit approval. `framer-motion`, `clsx`/`cn` already allowed if needed.
5. UI strings in **French** (use « guillemets », non-breaking space before `: ; ! ?`). Code in **English**.
6. Local `npx tsc --noEmit` hangs on this machine — rely on the **Vercel build** for type-checking.
7. Keep all design tokens in the single source (`globals.css` / Tailwind theme). Do not redefine colors inline per component.

**Design tokens — unchanged, do not edit:** light theme only. Green `#1E6B45` (brand/CTA/active), green-soft `#E8F2EC`. Severity: critical `#C0312B` / bg `#FDF2F1`, warning `#B45309` / bg `#FDF8EE`, info `#1F6FB2` / bg `#EEF4FA`. Text primary `#1A1C18`, secondary `#4A4E45`, muted `#6B7066`. Border `#E5E7E2`. Card radius 12px.

**Color discipline:** green = brand/CTA/active only. Red/amber = severity only — **EXCEPT** inside the Stock quotidien module (`/daily` and the buy/sell coding on the map), where buy = green and sell = red is allowed by design. Nowhere else.

**No emoji anywhere.** Icons = lucide-react SVG, and only where this doc says to keep them (§1.3).

---

## 1. Global changes `[W]` / `[S]`

### 1.1 Persona swap (demo consistency) `[W]`
Replace the demo persona **Pierre Martin → Olivier** everywhere in code and content.
- Run: `grep -rin "pierre" --include=*.ts --include=*.tsx --include=*.js --include=*.jsx --include=*.json --include=*.md .`
- Replace `Pierre Martin` → `Olivier`, `Pierre` → `Olivier`.
- Store stays **Intermarché — Gif-sur-Yvette** (unchanged).
- Surname for Olivier is intentionally omitted; use "Olivier" alone.

### 1.2 Navigation `[S]`
Left sidebar, collapsible (240px ↔ 68px), in this exact order:

| # | Label | lucide icon | Route | Notes |
|---|-------|------|-------|-------|
| 1 | Alertes | `bell` | `/dashboard` | **landing page** after login |
| 2 | Stock quotidien | `package` | `/daily` | |
| 3 | Carte réseau | `map` | `/network` | |
| 4 | Prévisions | `newspaper` | `/reports` | |

Bottom: **Paramètres** (`settings`) + user avatar popover (store name, manager, « Changer de magasin », « Se déconnecter »).

- **Remove the « Tableau de bord » nav item entirely.** Keep the `/dashboard` route under the hood (cheap, avoids a routing rebuild), just relabel it « Alertes » and make it the post-login landing.
- Top header unchanged: store name + manager sub-line (left), status dot « Surveillance active » + notification bell (right).

### 1.3 Icon cull `[S]`
**Keep:** the 4 nav icons + Paramètres; header notification bell + status dot; the search magnifier on `/daily`; map pins on `/network`; toast + empty-state icons.
**Remove everywhere they currently appear:** all icons *inside* alert cards (severity/category icon, chevron, clock, source external-link, recommended-action icons, CTA arrow); the up/down quantity stepper arrows on `/daily`; the « Actualiser » control; any up/down arrow icons on `/network`.

---

## 2. Page: Alertes — `/dashboard` (home)

The front door. Greeting → two severity-sorted stacks of minimal alert cards → each card solves in one click.

### 2.1 Remove
- **All four stat widgets** (Alertes actives / Niveau de risque global / Fenêtre d'anticipation / Fournisseurs mobilisables) — gone.
- The old « Signaux locaux » strip at the bottom — **content moves to Prévisions** (§5), do not delete the data wiring, relocate it.
- The old expanded two-column detail panel — replaced by the small dropdown below.

### 2.2 Layout (top to bottom)
1. **Greeting** `[W]`: H1 « Bonjour Olivier, voici vos prévisions » — no subline.
2. **Section « local »** `[S]` — small, lowercase, muted label. Alert cards for local-scope alerts.
3. **Section « global »** `[S]` — same treatment. Alert cards for global-scope alerts.

Within each section, sort by **severity** (critical → warning → info).

### 2.3 Alert card — collapsed
- **Severity-driven appearance, made clearly visible against the page** (this is a deliberate brightening vs. the old subtle border):
  - Card background = the severity tint (`#FDF2F1` critical / `#FDF8EE` warning / `#EEF4FA` info)
  - Card border = **2px solid** the full severity color (`#C0312B` / `#B45309` / `#1F6FB2`)
  - Severity is determined by the alert's severity field **only** — independent of local/global grouping.
- **Contents:** title (H2) + one short meta line (e.g. « Île-de-France · impact dans 47 h »). 
- **Remove:** the « Critique/Avertissement » text pill, the « XX % confiance » badge, and all in-card icons.
- **Right side:** one green button « Solution ».
- Whole card (except the Solution button) is clickable to expand the dropdown.

### 2.4 Alert card — dropdown (small, on click)
Opens a compact panel (not the old heavy two-column layout):
- **Left:** label « Détails & sources » + a brief description and the source names inline.
- **Right:** ghost button « Plus d'infos » → navigates to **Prévisions** (§5), deep-linked to this alert's entry.

### 2.5 The « Solution » button — the core flow `[C]`
« Solution » → navigates to **Carte réseau in *solution mode*** (§4.2), **filtered to this alert** — showing only the suppliers that solve this specific crisis (matched on the alert's affected products), centered on the store. The manager then picks a product/supplier → « Contacter ».

Flow in one line: **alert → filtered map (solutions only) → pick → Contacter → done.**

---

## 3. Page: Stock quotidien — `/daily`

### 3.1 Remove `[W]`/`[S]`
- Intro blurb « Gestion des stocks… » and subtext « en temps réel » — deleted (no page-intro text block).
- The old **Tab 3 « Carte du réseau »** — removed from this page (it lives in the nav as `/network` now).
- The **Notes** field — removed.
- The **Catégorie** dropdown — removed (keep Produit only); also remove the now-unused category-filter dependency (grep consumers first).
- Quantity **up/down stepper arrows** and the « Actualiser » control — removed.

### 3.2 Tabs `[W]`/`[S]`
Two tabs only:
1. **« Publier une demande »** (default landing)
2. **« Acheter »**  *(buy-only here; selling is done via the « Je vends » toggle in tab 1)*

Buy/sell color coding applies in this module only: **buy = green, sell = red** (render sell-red as a soft outline/tint, never a large filled red block).

### 3.3 Tab 1 — « Publier une demande »
Two columns.

**Left — form** (header « Publier une demande »):
- Toggle **« J'achète »** (green when active) / **« Je vends »** (red/soft when active)
- **Produit** — autocomplete (only field; no Catégorie)
- **Quantité** + **Unité** (unit dropdown)
- **Délai souhaité** — datepicker
- **Rayon** — slider **0–100 km** (default 15) + a **« Distance illimitée »** toggle that disables the slider when on
- Primary CTA « + Publier ma demande » (green)

**Right — « Mes publications »:**
- List of this store's open listings. Status pills « En recherche » / « Match trouvé » / « Confirmé ». Edit/delete per item.
- Remove the words « à approvisionner ».

### 3.4 Tab 2 — « Acheter »
Two columns.

**Left — « Mes publications »** (same list as above).
**Right — « Acheter un produit »:**
- Search field « Rechercher un produit » (with magnifier icon).
- List of product cards: product name, supplier, distance, quantity, price — each with an **« acheter »** button (soft red outline).

---

## 4. Page: Carte réseau — `/network`

Keep the existing map shape; restyle to the new language. Same component serves **two modes**.

### 4.1 Full mode (entered via the nav)
The whole network.
- **Filter chips:** « Tout » / « J'achète » / « Je vends ». **Remove the « Mon magasin » chip.**
- **Map** (Mapbox GL JS): pins coded **J'achète vs Je vends** by color (buy = green, sell = red). Pins clearly sized.
- **Side list stays** — a persistent panel listing the visible pins (product, supplier, distance, buy/sell), coded the same way. **Buttons noticeably bigger** than before.
- **Remove** any up/down arrow icons.
- Click a pin or list item → detail → **« Contacter »** (writes `contact_requests`).

### 4.2 Solution mode (entered via an alert's « Solution » button) `[C]`
Same page, **filtered to a single crisis**: show **only the suppliers that solve that alert** (matched on the alert's affected products), centered on the store. Do **not** show the full network in this mode.
- A header/banner: « Solutions pour : [titre de l'alerte] » with a way back to Alertes.
- The matching/ranking uses the existing rule-based weighting (distance 50 % / availability 30 % / freshness 20 %, Haversine).
- Then: see solutions → « Contacter » → buy.

Implementation hint: add a filter prop / route param to the existing network view (e.g. `/network?alert=<id>` or a `solutionFor` prop) so one component covers both modes.

---

## 5. Page: Prévisions — `/reports`

A self-explanatory, digestible read that brings the manager up to speed — built from the per-alert explanations plus the recycled « Signaux locaux » content.

- **Header:** « Vos prévisions » + sub-line « Le point du jour ». (No reading-time label.)
- **One entry per alert**, in severity order:
  - small severity pill, title (H2)
  - **« Ce qui se passe »** — what's happening
  - **« Pourquoi »** — why
  - **« Sources »** — source names + date
- **Deep-link:** « Plus d'infos » on an alert (§2.4) navigates here and scrolls/anchors to that alert's entry (e.g. `/reports#alert-<id>`).
- Recycle the old « Signaux locaux — axe Paris-Saclay » data into a section here rather than on Alertes.

---

## 6. Known issue to verify

The **modal-stuck-open bug on `/dashboard`** was the standing #1 bug. The alert-card redesign removes the old expanded panel and its contact modal, so this bug may be **obsoleted** by the renovation — **confirm it can no longer be triggered** after the Alertes rebuild. If a contact modal still exists anywhere (e.g. legacy `ContactModal.js`), ensure Esc / backdrop-click closes it.

---

## 7. Out of scope (post-demo — do NOT build now)

JS→TSX migration of `ContactModalProvider.js` / `MiniMap.js` / `ContactModal.js`; product autocomplete upgrade; custom datepicker; accessibility audit; Stripe; OVH custom domain; dark mode; multi-store switching; settings interior.

---

## 8. Definition of done

- [ ] No occurrence of "Pierre" anywhere in code or content; greeting reads « Bonjour Olivier, voici vos prévisions ».
- [ ] Nav = 4 tabs (Alertes / Stock quotidien / Carte réseau / Prévisions) + Paramètres; no « Tableau de bord »; `/dashboard` is the landing.
- [ ] Alertes: no stat widgets; local + global stacks; minimal severity-colored cards (bright, no pill/confidence/icons); dropdown with « Détails & sources » + « Plus d'infos ».
- [ ] « Solution » opens Carte réseau filtered to that alert (solutions only).
- [ ] Stock: 2 tabs (« Publier une demande » / « Acheter »); J'achète/Je vends toggle; Produit-only; rayon 0–100 + « Distance illimitée »; no Notes / Catégorie / intro blurb / stepper arrows / Actualiser; « Mes publications » without « à approvisionner ».
- [ ] Carte réseau: chips « Tout / J'achète / Je vends » (no « Mon magasin »); buy/sell pin coding; side list with bigger buttons; « Contacter » works; solution mode filters to one crisis.
- [ ] Prévisions: per-alert read (« Ce qui se passe / Pourquoi / Sources »), deep-linked from « Plus d'infos »; signaux locaux recycled here.
- [ ] `npm run build` passes on a Vercel **preview** deploy.
- [ ] Full demo run-through works end to end in under 3 minutes.
