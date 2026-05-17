# SOS-Market Design System

> Global source of truth for the SOS-Market redesign. Page overrides in
> `design-system/pages/` override this master file where specified.

## Generator Cross-Check

The `ui-ux-pro-max` generator was run with `--design-system --persist -p "SOS-Market"`.
It suggested glassmorphism, a navy/blue palette, and Plus Jakarta Sans. Those values
conflict with sections 2, 3.1, and 3.2 of `docs/sos-market-ui-requirements.md`, so
the exact requirements below override the generated recommendations.

## Product Tone

- Modern B2B SaaS, Stripe-dashboard inspired.
- Light mode only.
- Calm authority, decisive hierarchy, no alarmism.
- No purple/blue gradients, dark mode, decorative color, emoji icons, or playful illustration.

## Color Tokens

| Role | Hex | CSS variable |
| --- | --- | --- |
| Background base | `#FFFFFF` | `--color-bg-base` |
| Background subtle | `#F8F9F7` | `--color-bg-subtle` |
| Background muted | `#F1F3EF` | `--color-bg-muted` |
| Border default | `#E5E7E2` | `--color-border-default` |
| Border emphasized | `#CFD2CB` | `--color-border-emphasized` |
| Text primary | `#1A1C18` | `--color-text-primary` |
| Text secondary | `#4A4E45` | `--color-text-secondary` |
| Text muted | `#6B7066` | `--color-text-muted` |
| Text disabled | `#9AA095` | `--color-text-disabled` |
| Primary green | `#1E6B45` | `--color-primary-green` |
| Primary green dark | `#14543A` | `--color-primary-green-dark` |
| Primary green soft | `#E8F2EC` | `--color-primary-green-soft` |
| Severity critical | `#C0312B` | `--color-critical` |
| Severity critical bg | `#FDF2F1` | `--color-critical-bg` |
| Severity warning | `#B45309` | `--color-warning` |
| Severity warning bg | `#FDF8EE` | `--color-warning-bg` |
| Severity info | `#1F6FB2` | `--color-info` |
| Severity info bg | `#EEF4FA` | `--color-info-bg` |

Green is only for brand, CTAs, and active states. Red and amber are only for severity.
Blue is only for informational states.

## Typography

- Display/headings: `Geist Sans`, `Inter Tight`, `Inter`, system fallback.
- Body/UI: `Inter`, `Geist Sans`, system fallback.
- Monospace: `JetBrains Mono`, `Geist Mono`, `SFMono-Regular`, monospace.
- Display: 32px / 40px / 700.
- Heading 1: 24px / 32px / 700.
- Heading 2: 18px / 26px / 600.
- Body large: 16px / 24px / 400.
- Body: 14px / 22px / 400.
- Body small: 13px / 20px / 400.
- Caption: 11px / 16px / 600 uppercase, tracking `0.08em`.
- UI copy is French with French date formatting and proper spacing.

## Motion

Medium motion only:

- Fade-ins on mount, 150-250ms ease-out.
- Card hover lift: `translateY(-2px)` with level-2 shadow.
- Card expansion: smooth 200ms ease-out.
- Tab transitions: slide + fade, 180ms.
- Critical alert cards only: soft 2s red pulse.
- Stat numbers count up over 800ms.
- Risk gauge animates from 0 to value over 1s.
- Countdown timers update live and use `aria-live="polite"`.
- `prefers-reduced-motion` disables non-essential motion.

## Layout

- Container max width: 1280px global, 960px for dashboard content.
- Desktop side padding: 32px. Mobile side padding: 16px.
- Card padding: 24px default, 32px for hero cards.
- Radius: 12px default, 16px for hero cards.
- Sections: 48px vertical gap.
- Card gap: 16px.

## Elevation

- Level 1: `0 1px 2px rgba(26,28,24,.04), 0 1px 1px rgba(26,28,24,.06)`.
- Level 2: `0 4px 12px rgba(26,28,24,.06), 0 2px 4px rgba(26,28,24,.08)`.
- Level 3: `0 16px 40px rgba(26,28,24,.12), 0 4px 12px rgba(26,28,24,.08)`.

## Navigation

- Sidebar expanded width: 240px. Collapsed width: 68px.
- Store preference in `localStorage`.
- Mobile uses top menu behavior instead of a fixed wide sidebar.
- Header is sticky, 60px high, white, with bottom border.
- Status pill always pairs animated green dot with text.

## Accessibility

- WCAG AA contrast is required.
- Focus rings: visible 2px green ring with 2px offset on all focusable controls.
- Severity always has icon + text, never color alone.
- Keyboard: Tab through cards, Enter/Space expands cards, Esc collapses expanded panels/modals.
- Icons used for meaning must have text or `aria-label`.
- All form fields need labels.
- Reduced motion support is mandatory.
