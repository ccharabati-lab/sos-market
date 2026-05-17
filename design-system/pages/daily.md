# Daily Stock Page Override

Applies to `/daily`. This file overrides `design-system/MASTER.md` where specific.

## Layout

- Three-tab stock management interface.
- Default tab: `Publier une demande`.
- Other tabs: `Correspondances`, `Carte du réseau`.
- Tabs become horizontally scrollable on mobile.

## Tab 1: Publier une demande

- Top toggle: `Je cherche` / `Je propose`.
- Fields: catégorie, produit, quantité, unité, délai souhaité, rayon de recherche, notes.
- Primary CTA: `Publier ma demande`.
- Below form: `Mes publications actives` with status pills and edit/delete actions.

## Tab 2: Correspondances

- Two-column board.
- Left: `Vos demandes`.
- Right: `Offres correspondantes`.
- Selecting a demand highlights matching offers.
- Match cards include supplier, distance, quantity, suggested price, match score, and contact CTA.
- Sort options: distance, match score, freshness.

## Tab 3: Carte du réseau

- Full-width map.
- Filter chips: `Toutes`, `Demandes`, `Offres`, `Mon magasin uniquement`, and category filters.
- Distinct current-store pin.
- Selecting a pin reveals detail and contact CTA.
