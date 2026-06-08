# Dashboard Page Override

Applies to `/dashboard`. This file overrides `design-system/MASTER.md` where specific.

## Layout

- Single-column content centered at max-width 960px.
- Section order: greeting, four stat cards, alerts feed, local signals strip.
- Alerts feed is the visual hero of the page.

## Required Blocks

- H1: `Bonjour Olivier, voici votre situation aujourd'hui`.
- Subline: `Dernière mise à jour il y a 4 min · 2 alertes actives sur les prochaines 48 h`.
- Four equal stat cards:
  - Alertes actives.
  - Niveau de risque global with animated circular gauge.
  - Fenêtre d'anticipation with live countdown and draining progress bar.
  - Fournisseurs mobilisables.
- Alerts feed heading: `Alertes en cours`.
- Local signals heading: `Signaux locaux — axe Paris-Saclay`.

## Alert Cards

- Collapsed cards show severity icon, title, source/region meta, confidence, categories, severity badge, countdown, and chevron.
- Critical cards have red border and a reduced-motion-safe pulse.
- Expanded panels use two columns:
  - Details and sources.
  - Recommended actions and supplier CTA.
- All Mileva fields available in the current normalized alert shape must stay visible: description, evidence, sources, affected categories, region, detected date, confidence, recommended actions, risk codes, and attribution.

## Data

- Do not touch `lib/mileva.ts`.
- Use the existing static JSON fetching already wired through `DashboardClient.tsx`.
- Product risks and scenarios remain visible below alerts because they expose additional Mileva buyer/prospective fields.
