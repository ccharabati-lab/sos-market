# SOS-Market — UI Requirements Document

**Version 1.0 · 17 May 2026**
**For: `ui-ux-pro-max` skill, Step 3 (Persistent Design System)**

---

## 1. Product Context

SOS-Market is a B2B crisis anticipation and coordination platform for French supermarket managers. The platform predicts supply chain disruptions (heatwaves, strikes, epidemics, geopolitical events) and helps managers act **before** the disruption hits — by mobilizing nearby local suppliers, producers, and partner stores.

**Primary user:** Store managers of Intermarché-type supermarkets, age 40–60, retail professionals, not tech-savvy. They use the platform on desktop at work, occasionally on tablet/mobile when on the floor.

**Decision stakes:** Each alert can affect inventory worth tens of thousands of euros. The UI must convey **trust, calm authority, and decisiveness** — never alarmism, never playfulness.

**Demo context:** Final presentation 12 June 2026 with a live proof-of-concept. The interface must impress a jury of professors and industry experts in under 5 minutes.

---

## 2. Aesthetic Direction

**Reference:** Stripe Dashboard — premium B2B SaaS. Polished, light, generous whitespace, restrained color, confident typography.

**Tone:** Modern · Dynamic · Trustworthy · Anticipatory (never reactive)

**Influences:** Stripe Dashboard, Linear (motion quality), Vercel Dashboard (information density)

**To avoid:** Dark mode, neon accents, purple/blue tech-bro gradients, generic AI aesthetic, emoji icons, playful illustrations, dense info-dumps.

---

## 3. Visual System

### 3.1 Color Palette

**Mode:** Light only (no dark mode for v1).

```
Background base    #FFFFFF  pure white
Background subtle  #F8F9F7  off-white for sections / panels
Background muted   #F1F3EF  hover states, expanded panels
Border default     #E5E7E2  card borders, dividers
Border emphasized  #CFD2CB  inputs, hover borders
Text primary       #1A1C18  near-black, never pure black
Text secondary     #4A4E45  body copy on background
Text muted         #6B7066  metadata, captions
Text disabled      #9AA095  inactive states

Primary green      #1E6B45  CTAs, active nav, brand
Primary green dark #14543A  hover state on primary
Primary green soft #E8F2EC  green-tinted backgrounds, badges

Severity critical  #C0312B  red — critical alerts only
Severity critical bg  #FDF2F1  light red panel background
Severity warning   #B45309  amber — warnings only
Severity warning bg   #FDF8EE  light amber panel background
Severity info      #1F6FB2  blue — informational, neutral
Severity info bg      #EEF4FA

Risk score gauge gradient: #1E6B45 → #B45309 → #C0312B (green → amber → red)
```

**Usage discipline:** Green is ONLY for brand/CTAs/active states. Red/amber are ONLY for severity. No decorative color.

### 3.2 Typography

Pair a distinctive display font with a refined body font. **Suggested pairing** (the skill should validate against its typography database):

- **Display / headings:** `Söhne` (or fallback: `Geist Sans`, `Inter Tight`)
- **Body / UI:** `Inter` *or* `Geist Sans` — clean, French-diacritic-friendly
- **Monospace (data, IDs, codes):** `JetBrains Mono` or `Geist Mono`

**Type scale:**
```
Display    32px / 40px / 700  H1 page titles
Heading 1  24px / 32px / 700  section headers
Heading 2  18px / 26px / 600  card titles
Body lg    16px / 24px / 400  default body
Body       14px / 22px / 400  UI default
Body sm    13px / 20px / 400  metadata
Caption    11px / 16px / 600 uppercase tracking 0.08em  labels, badges
```

All copy in **French**. Use proper French typography: « guillemets », non-breaking spaces before `:` `;` `!` `?`, French date format (`13 mai 2026`).

### 3.3 Motion (Medium — Level B)

**Always-on:**
- Fade-ins on mount (150–250ms, ease-out)
- Smooth card expansion (height transitions, 200ms ease-out)
- Hover lifts on interactive cards (`translateY(-2px)`, subtle shadow)
- Smooth tab transitions (slide + fade, 180ms)

**Severity-driven:**
- Animated severity pulse on **critical** alert cards: soft red glow that breathes (2s loop). No animation on warning/info.
- Animated number counters on stat cards (count up from 0 on page load, 800ms ease-out)
- Risk score gauge animates from 0 to value on load (1s, ease-out)
- Countdown timer on "Fenêtre d'anticipation" stat card ticks down live

**Restraint:** No scroll-triggered confetti, no parallax, no continuous animations outside critical alerts. The interface should feel **alert but composed**.

### 3.4 Spacing & Layout Grid

- **Base unit:** 4px
- **Container:** max-width 1280px, side padding 32px desktop / 16px mobile
- **Card padding:** 24px default, 32px for hero cards
- **Card border-radius:** 12px default, 16px for hero/feature cards
- **Vertical rhythm:** sections separated by 48px, cards by 16px

### 3.5 Elevation

```
Shadow level 1 (resting cards):    0 1px 2px rgba(26,28,24,.04), 0 1px 1px rgba(26,28,24,.06)
Shadow level 2 (hover state):      0 4px 12px rgba(26,28,24,.06), 0 2px 4px rgba(26,28,24,.08)
Shadow level 3 (modals, popovers): 0 16px 40px rgba(26,28,24,.12), 0 4px 12px rgba(26,28,24,.08)
```

Shadows on white backgrounds only. Never use shadow as decoration — always for hierarchy.

---

## 4. Brand & Logo

### 4.1 Direction

**Concept:** A protective mark — shield or target — that conveys anticipation, vigilance, and safety. The logo should communicate "we see threats before they hit you."

**Two options for the skill to generate:**

**Option A — Shield-mark wordmark:**
A geometric shield silhouette (rounded, modern, not medieval) containing either a subtle radar pulse or an upward chevron, placed left of the wordmark "SOS-Market". The shield uses primary green; the wordmark uses near-black.

**Option B — Target/radar wordmark:**
The "O" in "SOS" becomes a concentric radar circle (3 rings, fading outward, suggesting a pulse). Wordmark only — no separate mark needed. The radar ring uses primary green.

### 4.2 Logo specs

- Primary lockup: horizontal (mark + wordmark side by side)
- Stacked version for narrow contexts
- Monogram for favicon (16×16, 32×32) and sidebar collapsed state
- Minimum size: 24px height for the mark, 80px width for the lockup
- Clearspace: equal to the height of the mark on all sides

### 4.3 Tagline

Below the wordmark in marketing contexts (NOT in-app): **"Anticiper, ne plus subir."**

---

## 5. Navigation

### 5.1 Sidebar (Collapsible — Level C)

**Default state:** Expanded, 240px wide, icons + labels.
**Collapsed state:** 68px wide, icons only, labels on hover tooltip.
**Persistence:** Remember user preference in localStorage.

**Top section (logo):**
- Logo lockup when expanded
- Monogram only when collapsed

**Nav items (in order):**
1. **Tableau de bord** — `layout-dashboard` icon — `/dashboard`
2. **Alertes** — `bell` icon — `/dashboard` (anchor scroll to alerts) — shows badge count of active critical alerts
3. **Stock quotidien** — `package` icon — `/daily`
4. **Carte réseau** — `map` icon — `/network` (placeholder for now)
5. **Rapports** — `bar-chart-2` icon — `/reports` (placeholder for now)

**Bottom section:**
- **Paramètres** — `settings` icon — `/settings` (placeholder)
- User avatar with store initials (e.g., "GY" for Gif-sur-Yvette). Click opens a popover with: store name, manager name, "Changer de magasin", "Se déconnecter".

### 5.2 Top header

- Background: white, bottom border `#E5E7E2`, height 60px, sticky.
- Left: Store name in bold (`Intermarché — Gif-sur-Yvette`), manager + address in muted sub-line.
- Right:
  - Status pill: animated green dot + "Surveillance active" (always shown when connected to Mileva data)
  - Current date in French long format (`mercredi 13 mai 2026`)
  - Notification bell icon with badge count (opens dropdown of recent alerts)

---

## 6. Page-by-Page Specification

### 6.1 `/dashboard` — Alerts Hub (Primary page)

**Layout:** Single column, max-width 960px, centered.

**Section order top to bottom:**

#### Greeting block
- H1: `Bonjour Pierre, voici votre situation aujourd'hui`
- Subline (muted): `Dernière mise à jour il y a 4 min · 2 alertes actives sur les prochaines 48 h`

#### Stat cards row (4 cards, equal width, grid)

**Card 1 — Alertes actives**
- Icon: `triangle-alert` in red-tinted square
- Big number: animated count-up (e.g., `2`)
- Sub-label: `1 critique · 1 avertissement` (color-coded mini-badges)
- Left border accent: 3px solid red

**Card 2 — Niveau de risque global** ⭐ hero card
- Circular gauge ring (120px), animated fill on load, gradient green→amber→red
- Big number in center: score 0–100 (e.g., `74`)
- Label below: `Risque élevé` (color matches zone of gauge)
- Calculation note: aggregated from active alert severity × confidence
- Left border accent: 3px solid amber (matches current score zone)

**Card 3 — Fenêtre d'anticipation**
- Icon: `clock` in amber-tinted square
- Live countdown to nearest critical alert: `47h 23min`
- Thin progress bar below, draining as time passes
- Sub-label: `Vague de chaleur — jeudi 14h`
- Left border accent: 3px solid amber

**Card 4 — Fournisseurs mobilisables**
- Icon: `store` in green-tinted square
- Big number: animated count-up (e.g., `7`)
- Sub-label: `dans un rayon de 15 km`
- Left border accent: 3px solid green

#### Alerts feed (the hero — takes the rest of the page)

Section heading: `Alertes en cours` (uppercase, tracking, muted)

Each alert card contains:

**Collapsed state:**
- Left: severity icon in colored tinted square (thermometer for heat, truck for strikes, virus for epidemic, etc. — match icon to risk category)
- Middle:
  - Title (H2)
  - Meta line: `Détecté via [source] · [region]`
  - Confidence badge: `86 % confiance` (small pill)
  - Affected categories as pills (max 4 visible, "+3 autres" if more)
- Right:
  - Severity badge (Critique / Avertissement / Information)
  - Time to event countdown (e.g., `dans 47h`)
  - Chevron-down to expand

**Critical cards:** soft red border, breathing pulse glow.
**Warning cards:** soft amber border, no pulse.
**Info cards:** soft blue border, no pulse.

**Expanded state (click anywhere on the card):**

Two-column layout inside the expanded panel:

*Left column — Détails & sources*
- Full description paragraph
- "Sources" subsection: list of source items (Mileva sources array), each with name, type pill (`institution`/`presse`), and external-link icon
- "Catégories impactées" subsection: full list of affected_categories as pills
- Detection time + region info

*Right column — Actions recommandées*
- List of recommended_actions, each as a translated human-readable label with a small icon
  - `alerte_achats` → "Lancer une alerte achats"
  - `augmentation_stock_securite` → "Augmenter le stock de sécurité"
  - `securisation_transport` → "Sécuriser le transport"
  - `diversification_fournisseurs` → "Diversifier les fournisseurs"
  - `revue_prix` → "Revoir la stratégie prix"
- Primary CTA button (full width): `Voir les fournisseurs disponibles` → smooth scroll-into-view or modal showing the stock-matching map (from the prototype)
- Secondary CTA: `Marquer comme géré` (ghost button)

**Footer of each card:**
- `Source : Mileva AI · 13 mai 2026` (right-aligned, muted, mono font)

#### Local signals strip (bottom of page)

Section heading: `Signaux locaux — axe Paris-Saclay`
Three compact horizontal cards (smaller, less prominent) showing local supply chain watch data from the second Mileva file. Each card: small icon, title, 1-line description, affected products.

### 6.2 `/daily` — Daily Stock Management

**Three-tab interface in this order:**

#### Tab 1: `Publier une demande` (default landing)

A clean form-first interface — the manager publishes what they need or what surplus they have.

- Toggle at top: `Je cherche` / `Je propose`
- Form fields:
  - Catégorie (dropdown)
  - Produit (autocomplete)
  - Quantité + unité
  - Délai souhaité (datepicker)
  - Rayon de recherche (slider, 5–30 km, default 15)
  - Notes (optional textarea)
- Primary CTA: `Publier ma demande`
- Below: "Mes publications actives" — list of 3–5 cards showing this store's open requests/offers, each with status pill (`En recherche`, `Match trouvé`, `Confirmé`) and edit/delete actions.

#### Tab 2: `Correspondances` (matches)

A two-column board view — once you've published, this is where matches surface.

- Left column header: `Vos demandes` (your store's needs)
- Right column header: `Offres correspondantes` (matching offers from the network)
- Each demande card on the left, when clicked, highlights the 1–3 matching offers on the right with a connecting line/animation.
- Match cards include: supplier name, distance, available quantity, suggested price, match score (algorithm output), "Contacter" CTA.
- Sort options: distance, match score, freshness.

#### Tab 3: `Carte du réseau`

Full-width interactive map of the Paris-Saclay region (placeholder OK — Leaflet / MapLibre / Mapbox to be decided).

- Pins for every active offer/request within the radius
- Filter chips above the map: `Toutes`, `Demandes`, `Offres`, `Mon magasin uniquement`, category filters
- Click pin → side panel slides in from right with full detail and contact CTA
- "Vous êtes ici" pin for the current store, visually distinct

---

## 7. Component Inventory (must be designed by the skill)

Reusable components needed across pages:

1. **AlertCard** (collapsed + expanded states, 3 severity variants)
2. **StatCard** (4 variants: number, gauge ring, countdown, count)
3. **SeverityBadge** (critical / warning / info)
4. **CategoryPill** (default + clickable filter variant)
5. **SourceLink** (with type pill and external icon)
6. **ActionItem** (icon + label + optional check state)
7. **PrimaryButton** (solid green, white text)
8. **SecondaryButton** (ghost, green border)
9. **GhostButton** (text-only with hover background)
10. **Modal** (centered, backdrop blur, max-width 480px default)
11. **Tooltip** (dark, white text, arrow, 200ms delay)
12. **NavItem** (expanded + collapsed states, active indicator)
13. **StatusPill** (animated dot + label)
14. **SearchInput** (with leading icon, clear button)
15. **EmptyState** (illustration + title + description + CTA)
16. **Skeleton loader** (matches card geometry)
17. **Toast notification** (success / error / info, top-right, auto-dismiss)
18. **DataTable** (for future reports page — column sort, row hover)

---

## 8. Interaction & Micro-detail Requirements

- **Cursor:** `pointer` on every clickable element (alert cards, stat cards, nav items, all buttons).
- **Focus rings:** Visible 2px green ring with 2px offset on every keyboard-focusable element. Never `outline: none` without replacement.
- **Transitions:** All hover/active state changes use `transition: all 180ms ease-out`. No instant snaps.
- **Empty states:** Every list/feed must have a designed empty state, not blank space.
- **Loading states:** Use skeleton loaders matching final geometry. No spinners except for inline button loading.
- **Error states:** Inline error messages, never alert() popups. Errors show in red text below the field or in a toast.
- **No emoji icons** anywhere. Always use lucide-react SVG icons.
- **Smooth scroll** for in-page anchor navigation.

---

## 9. Accessibility Requirements (CRITICAL — per skill's priority 1)

- All text meets WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- All interactive elements have visible focus states
- All icons used for meaning have `aria-label` or accompanying text
- All form inputs have associated `<label>` elements
- Severity is NEVER conveyed by color alone — always paired with icon + text label ("Critique", "Avertissement")
- Keyboard navigation works for all flows: Tab through cards, Enter to expand, Esc to collapse modal
- Animated severity pulse can be disabled by users with `prefers-reduced-motion`
- Live countdown timers update via `aria-live="polite"`

---

## 10. Responsive Behavior

**Primary target:** Desktop 1280px+. The demo will run on a desktop browser.

**Tablet (768–1279px):**
- Sidebar auto-collapses to icon-only
- Stat cards row stays 4-wide until 1024px, then becomes 2×2 grid
- Alert card expanded view stacks two columns into one

**Mobile (<768px):**
- Sidebar becomes a top hamburger menu
- Stat cards stack vertically (1 column)
- Daily Stock tabs become a horizontal scroll
- All touch targets minimum 44×44 px

---

## 11. Technical Constraints

- **Stack:** Next.js 14 (App Router), Tailwind CSS, lucide-react
- **State:** React hooks (useState, useEffect) — no external state library
- **Data:** Static JSON fetch from `/public/data/global_supply_risks/` and `/public/data/supply_chain_watch/` (Mileva integration already wired in `lib/mileva.ts`)
- **No new dependencies** without checking with Carlos first. Acceptable additions if essential: `framer-motion` (for medium-motion animations), `clsx` or `cn` utility.
- **No browser storage (localStorage/sessionStorage) inside artifacts** — but real app code can use localStorage (e.g., for sidebar collapsed preference).
- All design tokens defined as Tailwind theme extensions OR CSS variables in a single `globals.css` — single source of truth.
- Component files organized in `components/ui/` (primitives) and `components/dashboard/`, `components/daily/` (page-specific).

---

## 12. Out of Scope for v1 (do NOT design)

- Dark mode
- User account creation / signup flow
- Multi-store switching (just stub the popover)
- Settings page interior
- Reports page interior
- Real-time WebSocket updates (data is static for demo)
- Mobile push notifications

---

## 13. Definition of Done

The redesign is complete when:

- [ ] All four stat cards render with animated values from real Mileva data
- [ ] Alerts feed renders all alerts from `global_supply_risk_alerts_20260513.json` with correct severity styling
- [ ] Critical alerts pulse; warning/info do not
- [ ] Expanding an alert card reveals the two-column detail panel with all Mileva fields rendered
- [ ] Daily Stock page has all three tabs functional (forms can be stubbed where backend isn't ready)
- [ ] Logo is finalized and exported as SVG (primary, monogram, favicon)
- [ ] `design-system/MASTER.md` persisted with full design system
- [ ] `npm run build` passes with no errors or warnings
- [ ] Lighthouse accessibility score ≥ 95 on `/dashboard`
- [ ] Demo run-through works end to end in under 3 minutes on a 1440px desktop browser

---

## 14. Process Note for the skill

After receiving this document:

1. Run `--design-system --persist -p "SOS-Market"` to scaffold `design-system/MASTER.md` using the Stripe-influenced direction.
2. Generate page-specific override files under `design-system/pages/`:
   - `dashboard.md` — Alerts hub specifics
   - `daily.md` — three-tab stock management
3. Apply the system to existing routes. **Do NOT touch `lib/mileva.ts` or any data-layer code** — only the visual layer.
4. Run `npm run build` at the end. If it fails, fix the errors yourself before reporting back.
5. Deliver a summary listing every file changed and any decisions made that diverged from this doc.
