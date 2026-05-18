# SOS-Market UI Redesign Audit Report

Audit date: 2026-05-18

Scope: diagnostic only. No application files were modified.

## 1. TypeScript Errors

Command run:

```bash
npx tsc --noEmit 2>&1 | tee /tmp/tsc-audit.log
```

Result: inconclusive. The command produced no output for 90 seconds and was killed per the audit instruction. `/tmp/tsc-audit.log` exists but contains 0 lines.

Total emitted error count: unknown. Total captured error lines: 0.

| File | Line | Error message | Severity |
| --- | ---: | --- | --- |
| n/a | n/a | `npx tsc --noEmit` hung for 90 seconds with no emitted diagnostics. | blocker |

Additional targeted probe:

```bash
npx tsc --noEmit --pretty false --skipLibCheck --jsx preserve --lib dom,dom.iterable,esnext --target ES2022 --module esnext --moduleResolution bundler --esModuleInterop --allowJs true components/dashboard/AlertCard.tsx components/DashboardClient.tsx
```

This targeted probe also hung for 60 seconds with no output and was killed. That means the local environment did not reproduce the reported Vercel TypeScript diagnostics, but it also did not prove the tree is type-clean.

Relevant type-coverage note: `tsconfig.json` has `"allowJs": true`, but its `include` only contains `**/*.ts` and `**/*.tsx`, not `**/*.js`. The legacy `.js` components are therefore a type-coverage gap in local `tsc` checks.

## 2. Architecture Inconsistencies

Files under `components/`, grouped by extension:

```text
.js
components/ContactModalProvider.js
components/Sidebar.js
components/Header.js
components/ContactModal.js
components/CrisisCard.js
components/Providers.js
components/TabsBar.js
components/MiniMap.js

.jsx
none

.ts
components/ui/utils.ts
components/ui/index.ts

.tsx
components/SignOutButton.tsx
components/ui/data-table.tsx
components/ui/toast-provider.tsx
components/ui/action-source.tsx
components/ui/tooltip.tsx
components/ui/buttons.tsx
components/ui/nav-item.tsx
components/ui/feedback.tsx
components/ui/badges.tsx
components/ui/modal.tsx
components/ui/forms.tsx
components/ui/stat-card.tsx
components/MesSignaux.tsx
components/DeleteListingButton.tsx
components/daily/DailyTabs.tsx
components/ExchangeWorkspace.tsx
components/dashboard/AlertCard.tsx
components/MapView.tsx
components/DashboardClient.tsx
```

`.js` file audit:

| JS file | Similar TSX exists? | Still imported? | Classification | Notes |
| --- | --- | --- | --- | --- |
| `components/ContactModalProvider.js` | No | Yes: `Providers.js`, `ContactModal.js`, `CrisisCard.js`, `AlertCard.tsx`, `ExchangeWorkspace.tsx` | type-coverage gap | TSX callers consume an untyped JS context. `ExchangeWorkspace.tsx:171` casts `useContactModal()` manually. |
| `components/Sidebar.js` | No | Yes: `Providers.js` | type-coverage gap | Passes typed-looking props into `NavItem.tsx`, but Sidebar props and nav item data are untyped. |
| `components/Header.js` | No | Yes: `Providers.js` | type-coverage gap | Consumes Mileva alert data in JS, so alert shape changes will not be checked by `tsc`. |
| `components/ContactModal.js` | `components/ui/modal.tsx` is a similar primitive | Yes: `Providers.js` | duplicate implementation | The app still uses legacy `ContactModal.js`; the new generic `Modal` primitive is unused. |
| `components/CrisisCard.js` | `components/dashboard/AlertCard.tsx` | No external imports found | dead code candidate | Legacy crisis card remains. It passes `mapHints={alert.map_hints}` to `MiniMap` at `components/CrisisCard.js:194`, but `MiniMap.js` ignores that prop. |
| `components/Providers.js` | No | Yes: `app/layout.js` | type-coverage gap | Root app shell remains JS; child props, layout callbacks, and provider composition are untyped. |
| `components/TabsBar.js` | `components/daily/DailyTabs.tsx` is a partial conceptual replacement | No imports found | dead code candidate | Old top tabs are not used after the sidebar redesign. |
| `components/MiniMap.js` | No | Yes: `AlertCard.tsx`, `CrisisCard.js` | type-coverage gap | Receives map props from TSX but has no typed contract. Does not accept or render `mapHints`. |

Type-coverage gaps involving TSX-style props:

- `components/CrisisCard.js:194` passes `mapHints={alert.map_hints}` into `MiniMap`.
- `components/MiniMap.js:6` destructures only `{ suppliers, selectedId, onSelect, originLat, originLng }`, so `mapHints` is ignored.
- `components/dashboard/AlertCard.tsx:88` still declares `map_hints?: unknown`, but `AlertCard` does not render or pass it.
- `components/DashboardClient.tsx:207` sets `map_hints: undefined as undefined`, which keeps the field alive without using it.

## 3. Missing or Unused Components

Section 7 inventory check:

| Requirement component | Exists? | File | Imported and used? | Status |
| --- | --- | --- | --- | --- |
| AlertCard | Yes | `components/dashboard/AlertCard.tsx` | Yes: `components/DashboardClient.tsx:15`, rendered at `components/DashboardClient.tsx:800` | built and used |
| StatCard | Partial | `components/ui/stat-card.tsx` | Yes: `NumberStatCard`, `GaugeStatCard`, `CountdownStatCard` imported at `components/DashboardClient.tsx:17` and rendered at lines 752, 759, 764, 770 | variants exist, but no single `StatCard` export |
| SeverityBadge | Yes | `components/ui/badges.tsx` | Yes: `components/dashboard/AlertCard.tsx:27`, rendered at line 228 | built and used |
| CategoryPill | Yes | `components/ui/badges.tsx` | Yes: `AlertCard.tsx` and `ExchangeWorkspace.tsx:623` | built and used |
| SourceLink | Yes | `components/ui/action-source.tsx` | Yes: `components/dashboard/AlertCard.tsx:282` | built and used |
| ActionItem | Yes | `components/ui/action-source.tsx` | Yes: `components/dashboard/AlertCard.tsx:305`, `:308` | built and used, optional checked state not currently exercised |
| PrimaryButton | Yes | `components/ui/buttons.tsx` | Yes: `AlertCard.tsx`, `ExchangeWorkspace.tsx` | built and used |
| SecondaryButton | Yes | `components/ui/buttons.tsx` | Yes: `AlertCard.tsx`, `ExchangeWorkspace.tsx` | built and used |
| GhostButton | Yes | `components/ui/buttons.tsx` | No imports/usages found | built but unused |
| Modal | Yes | `components/ui/modal.tsx` | No imports/usages found | built but unused; legacy `ContactModal.js` remains in use |
| Tooltip | Yes | `components/ui/tooltip.tsx` | Yes: through `components/ui/nav-item.tsx:46` | built and used indirectly |
| NavItem | Yes | `components/ui/nav-item.tsx` | Yes: `components/Sidebar.js:20`, rendered in Sidebar | built and used |
| StatusPill | Yes | `components/ui/badges.tsx` | Yes: `components/Header.js:7`, rendered at `components/Header.js:108` | built and used |
| SearchInput | Yes | `components/ui/forms.tsx` | Yes: `components/ExchangeWorkspace.tsx:536` | built and used |
| EmptyState | Yes | `components/ui/feedback.tsx` | Yes: multiple `ExchangeWorkspace.tsx` usages | built and used |
| Skeleton loader | Yes | `components/ui/feedback.tsx` | Yes: `components/DashboardClient.tsx:16`, rendered at lines 786-788 | built and used |
| Toast notification | Yes | `components/ui/feedback.tsx`, `components/ui/toast-provider.tsx` | Yes: `Providers.js`, `Sidebar.js`, `AlertCard.tsx`, `ExchangeWorkspace.tsx` | built and used, but `toast-provider.tsx` is not re-exported from `components/ui/index.ts` |
| DataTable | Yes | `components/ui/data-table.tsx` | No imports/usages found | built but unused |

Additional unused local components/helpers:

| File | Line | Item | Status |
| --- | ---: | --- | --- |
| `components/DashboardClient.tsx` | 337 | `StatCardProps` | unused local legacy type |
| `components/DashboardClient.tsx` | 344 | `function StatCard(...)` | unused local legacy component |
| `components/DashboardClient.tsx` | 411 | `function SkeletonCard()` | unused local legacy component |

## 4. Dead Code

`map_hints` references:

| File | Line | Reference |
| --- | ---: | --- |
| `components/dashboard/AlertCard.tsx` | 88 | `map_hints?: unknown;` |
| `components/DashboardClient.tsx` | 207 | `map_hints: undefined as undefined,` |
| `components/CrisisCard.js` | 194 | `mapHints={alert.map_hints}` |

`mapHints` references:

| File | Line | Reference |
| --- | ---: | --- |
| `components/CrisisCard.js` | 194 | `mapHints={alert.map_hints}` |

Unused imports:

| File | Finding |
| --- | --- |
| `components/dashboard/AlertCard.tsx` | No unused imports found by manual static review. |
| `components/DashboardClient.tsx` | No unused imports found by manual static review. There are unused local functions/types, listed above, but not unused imports. |

TODO/FIXME comments:

| Scope | Finding |
| --- | --- |
| New TSX files under `components/` | No `TODO` or `FIXME` comments found. |
| Other repo files | `lib/mileva.ts:1` has `// TODO: replace fetch URL with live Mileva API endpoint when available`, which is pre-existing integration context and not part of the TSX redesign. |

Dead code candidates:

- `components/CrisisCard.js`: not imported by app code; superseded by `components/dashboard/AlertCard.tsx`.
- `components/TabsBar.js`: not imported by app code; superseded by sidebar/header navigation and daily tabs.
- `components/DashboardClient.tsx:344` `StatCard` and `components/DashboardClient.tsx:411` `SkeletonCard`: local legacy helpers not used.
- `components/ui/modal.tsx`, `components/ui/data-table.tsx`, `GhostButton` in `components/ui/buttons.tsx`: built primitives not currently integrated.

## 5. Sentry Status

| Check | Result | Notes |
| --- | --- | --- |
| `next.config.js` wraps with `withSentryConfig` | Yes, conditionally | `next.config.js:15` imports `withSentryConfig`; `next.config.js:17` wraps `nextConfig` only when `SENTRY_AUTH_TOKEN` is set. |
| `sentry.client.config.ts` present | No | This file is absent. Current setup uses `instrumentation-client.ts`, which is normal for recent Sentry Next.js wizard output. |
| Client DSN uses env var | Yes | `instrumentation-client.ts:8` uses `process.env.NEXT_PUBLIC_SENTRY_DSN`. |
| `sentry.server.config.ts` present and env-based | Yes | `sentry.server.config.ts:13` uses `process.env.NEXT_PUBLIC_SENTRY_DSN`. |
| `sentry.edge.config.ts` present and env-based | Yes | `sentry.edge.config.ts:14` uses `process.env.NEXT_PUBLIC_SENTRY_DSN`. |
| Sentry likely cause of AlertCard TypeScript failure | Unlikely | Sentry files use env-based DSN and are not coupled to `components/dashboard/AlertCard.tsx`. |

Sentry caveats:

- `next.config.js` only enables Sentry wrapping when `SENTRY_AUTH_TOKEN` is present. Local builds without that token will not exercise the Sentry webpack plugin path.
- `app/api/sentry-example-api/route.ts` intentionally throws when visited. It should not cause a build-time TypeScript failure, but it is demo/test surface area that should be removed or hidden before production demos if not needed.

## 6. Outstanding Requirements TODOs

From `docs/UI_REDESIGN_HANDOFF.md`, with current audit status:

| Requirements section | Handoff TODO | Audit status |
| --- | --- | --- |
| 5.1 | Mobile hamburger navigation not implemented. | Appears implemented in `Header.js` and `Sidebar.js`, but not browser-verified. |
| 5.1 | User avatar popover not implemented. | Appears implemented in `Sidebar.js`, but not browser-verified. |
| 5.2 | Notification bell dropdown not implemented. | Appears implemented in `Header.js`, but not browser-verified. |
| 6.1 | Dashboard browser verification not done. | Still true. No browser QA evidence found. |
| 6.1 | Stat card gauge/countdown work partial. | Still needs visual QA. Code exists in `components/ui/stat-card.tsx`. |
| 6.1 | Stock-matching CTA not rebuilt as polished modal/map flow. | Still true. Expanded-card supplier flow remains. |
| 6.1 | Mileva static dates may render as past dates. | Partially mitigated by `shiftDemoDate`, but still needs demo validation. |
| 6.2 | Daily stock workspace partial. | Still true. Three tabs exist, but not fully verified. |
| 6.2 | Product autocomplete is only `datalist`. | Still true. |
| 6.2 | Date selection uses native date input. | Still true. |
| 6.2 | Radius slider not wired to filtering. | Still true. `radiusKm` is form state only. |
| 6.2 | Correspondances connecting line/animation incomplete. | Still true. Only a small active line marker exists. |
| 6.2 | Suggested price placeholder. | Still true. UI shows `Prix suggere : a negocier`. |
| 6.2 | Map category chips visual only. | Still true. Category pills in map tab have no click handler/state. |
| 6.2 | Map side panel needs richer details. | Still true. Basic selected match panel exists. |
| 7 | Component inventory partially integrated. | Still true. `Modal`, `DataTable`, `GhostButton` unused. |
| 8 | Toast feedback not wired globally. | Mostly addressed. `ToastProvider` is mounted in `Providers.js`, and `useToast` is used in Sidebar, AlertCard, and ExchangeWorkspace. |
| 9 | Accessibility not audited. | Still true. No axe/Lighthouse/browser keyboard audit found. |
| 10 | Mobile responsiveness incomplete. | Partially addressed in code, but still unverified. |
| 13 | Definition of Done not met. | Still true. Build/type check not proven green; Lighthouse and demo flow not verified. |

## 7. Recommended Fix Order

1. Reproduce the real Vercel TypeScript failure locally or capture the exact Vercel log.
   - Effort: 20-45 min.
   - Reason: local `tsc` hangs with an empty log, so fixing from the current local output would be guesswork.
   - Suggested diagnostic sequence: clear generated artifacts, ensure Node 20, run `npm run build`, and compare with Vercel's exact TypeScript diagnostics.

2. Fix the dashboard TypeScript boundary first.
   - Effort: 30-60 min once errors are visible.
   - Focus files: `components/dashboard/AlertCard.tsx`, `components/DashboardClient.tsx`, `components/MiniMap.js`.
   - Likely cleanup: remove or properly type `map_hints`, align `DashboardAlert` with `adaptAlert()`, and decide whether map hints are real UI data or dead leftover data.

3. Convert the JS bridge components used by TSX to TSX, or add explicit typed wrappers.
   - Effort: 1-2 hours.
   - Priority files: `components/MiniMap.js`, `components/ContactModalProvider.js`, `components/ContactModal.js`.
   - Reason: these are imported by TSX files and currently erase useful type information.

4. Remove or quarantine dead legacy components.
   - Effort: 20-40 min.
   - Candidates: `components/CrisisCard.js`, `components/TabsBar.js`, local `StatCard` and `SkeletonCard` in `components/DashboardClient.tsx`.
   - Reason: reduces confusion while chasing build failures.

5. Finish component inventory integration only after build is green.
   - Effort: 1-2 hours.
   - Items: decide whether to use `Modal`, `DataTable`, `GhostButton`, and re-export `ToastProvider` from `components/ui/index.ts` if the index is meant to be canonical.

6. Complete the Daily page TODOs.
   - Effort: 2-4 hours.
   - Items: radius filtering, clickable category map filters, better side panel, richer autocomplete/date UX, and match connecting-line animation.

7. Final verification pass.
   - Effort: 1-2 hours.
   - Run `npm run build`, browser-check `/dashboard` and `/daily`, verify keyboard navigation and reduced motion, then run Lighthouse accessibility on `/dashboard`.
