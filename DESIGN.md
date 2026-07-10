---
version: alpha
name: Modern Ledger
description: TenantTrack's design system — a rental invoicing and property management platform for Cambodia (USD/KHR dual currency).
colors:
  background: "#0E0D0B"
  surface: "#17150F"
  surface-raised: "#1F1C14"
  border: "#2A271D"
  foreground: "#F5F1E8"
  muted-foreground: "#9C9686"
  primary: "#C89B3C"
  on-primary: "#171502"
  primary-hover: "#B38A32"
  secondary: "#3E6B4F"
  on-secondary: "#F5F1E8"
  info: "#6C8CA6"
  on-info: "#0D1418"
  error: "#D9695A"
  on-error: "#1A0C09"
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.01em
  display-md:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.1
  headline-lg:
    fontFamily: Instrument Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.25
  headline-md:
    fontFamily: Instrument Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Instrument Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: Instrument Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.04em
  data-lg:
    fontFamily: IBM Plex Mono
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    fontFeature: "'tnum' 1"
  data-md:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
rounded:
  sm: 2px
  md: 4px
  lg: 6px
  xl: 10px
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 10px 20px
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 10px 20px
    height: 40px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
    height: 40px
  data-table-cell:
    textColor: "{colors.foreground}"
    typography: "{typography.data-md}"
  stat-card-value:
    textColor: "{colors.primary}"
    typography: "{typography.data-lg}"
  badge-paid:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  badge-overdue:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-error}"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  badge-info:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-info}"
    rounded: "{rounded.full}"
    padding: 2px 10px
    typography: "{typography.label-sm}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  caption:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label-sm}"
  popover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
---

## Overview

TenantTrack is a rental invoicing and property management platform for
Cambodia — properties, rooms, tenants, contracts, meter utility readings,
and dual-currency (USD/KHR) invoices, used by landlords and property
managers to run their business day to day.

The design direction is **Modern Ledger**: industrial precision with
restrained warmth, evoking an audited paper ledger rather than a generic
SaaS dashboard. The product should feel exact and accountable — every
number trustworthy, nothing improvised — while staying warm enough for
daily, informal use by an independent landlord rather than a dedicated
back-office team.

Two reference points shaped this direction: category-default property
management tools (e.g. TenantCloud) lean bright, rounded, and
interchangeable with every other SaaS marketing site; fintech products
that are judged on trust (e.g. Mercury) instead use a near-black canvas,
generous negative space, and exactly one confident accent color.
Modern Ledger follows the fintech-trust register, with a warm paper tone
in place of cold gray, and a brass accent in place of the default
blue/violet convention.

## Colors

The palette is warm near-black and near-white — like ledger paper under
low light — with a single brass accent reserved for the most important
action or figure on any screen.

- **Background (#0E0D0B) / Surface (#17150F):** Warm charcoal, not pure
  gray. Reads as leather/paper rather than "generic dark mode."
- **Foreground (#F5F1E8):** Warm off-white, like ledger paper — never
  pure white.
- **Primary (#C89B3C):** Deep brass/amber. The sole driver for
  interaction — primary buttons, active nav state, and the single most
  important figure on a screen (e.g. total due). Never used decoratively
  or as a background wash; a small, deliberately scarce color earns its
  weight.
- **Secondary (#3E6B4F):** Deep forest green, used exclusively for
  positive/settled financial states (paid invoices, positive balances).
- **Info (#6C8CA6):** A deliberately cool slate blue — the only
  non-warm color in the system, used for neutral informational states
  (e.g. "reading submitted," "contract renewed") so it reads as
  intentionally distinct from action and status colors.
- **Error (#D9695A):** Warm-shifted red for overdue invoices, failed
  actions, and destructive confirmations.

### Light Mode

The token set above defines the default (dark) theme. TenantTrack also
ships a light theme, toggled via `next-themes`; light mode inverts the
warm relationship rather than desaturating it: background becomes a warm
paper white (`#FAF7F0`), surface a slightly deeper cream (`#F2EDE1`),
foreground the same warm near-black as the dark background (`#171502`),
and `border`/`muted-foreground` lighten proportionally. `primary`,
`secondary`, `info`, and `error` stay fixed across both themes — the
brass accent must read identically whether the page is light or dark.

## Typography

Three families, each with one strict job — mixing them is only coherent
because each is scoped to a specific kind of content and never overlaps.

- **Display (Fraunces):** Reserved for report titles and the largest
  figure on a page (e.g. "Total Collected This Month"). A serif is
  unusual for an operations dashboard — that's deliberate. It gives
  ledger/certificate gravitas at large sizes. Never used below 24px and
  never used in tables or body copy, where a serif hurts legibility.
- **Body/UI (Instrument Sans):** All interface copy, navigation, form
  labels, and paragraph text. Clean and warm without being one of the
  overused default SaaS sans fonts.
- **Data (IBM Plex Mono, tabular figures):** Every dollar/riel amount
  and every meter reading, in tables and stat cards alike. Monospace
  digits mean columns of numbers actually align, the way they would on
  a real ledger or terminal — this is the most literal expression of
  "precise" in the whole system. Scoped strictly to numeric data; never
  used for prose.

## Layout

Grid-disciplined: strict column alignment, predictable spacing, no
asymmetry. Financial and tabular data punishes any layout that isn't
rigorously aligned, so Modern Ledger never trades precision for visual
flair at the layout level.

An 8px base spacing scale governs all dimensions, with a 4px half-step
reserved for micro-adjustments (icon-to-label gaps, badge padding). The
existing sidebar + content layout is kept — it's what the category
expects and what tabular/dashboard data needs. Max content width for
primary views is 1280px; forms and detail panels cap at 640px so long
lines of body text stay readable.

## Elevation & Depth

Depth comes from **tonal layering and hairline borders**, not shadows.
`surface` sits one step lighter than `background`, `surface-raised`
(dropdowns, popovers, modals) one step lighter again. Every raised
surface gets a single 1px border at `{colors.border}` — the visual
equivalent of a ruled line on ledger paper — rather than a drop shadow.
Shadows are reserved for true overlays (modals, toasts) only, kept soft
and minimal so they don't compete with the borders doing the real work.

## Shapes

**Architectural Sharpness.** Corners are tight (2–6px) across buttons,
inputs, and cards — a deliberate move away from the bubbly, rounded
defaults of typical SaaS UI. Tight corners read as engineered and exact,
reinforcing the ledger metaphor; anything above `rounded.xl` (10px)
should not appear except for fully circular elements like avatars and
status dots, which use `rounded.full`.

## Components

### Buttons

Primary buttons carry the brass fill and are reserved for the single
most important action in a given view (submit invoice, save reading).
Everything else — including "Cancel," secondary navigation actions, and
repeated row-level actions — uses the transparent/outline secondary
style so the brass accent never loses its scarcity value.

### Cards & Stat Displays

Dashboard stat cards pair a `label-sm` caption with a `stat-card-value`
figure in brass, set in the data (mono) typeface — this is the pattern
that should appear anywhere a single number needs to dominate a card
(total due, occupancy rate, this month's collections).

### Status Badges

`badge-paid` (secondary green), `badge-overdue` (error red), and
`badge-info` (info blue) are the only three semantic badge colors in the
system. Do not introduce a fourth semantic color for status without
updating this file first — the whole point of a restrained palette is
that every color the user sees has already been assigned a fixed
meaning.

### Tables

Meter readings, invoice line items, and rent rolls all use
`data-table-cell` for numeric columns so figures align on their decimal
point across rows, and `body-md` for text columns (tenant name, property,
notes).

## Do's and Don'ts

- Do reserve brass (`primary`) for exactly one action or figure per
  screen — if everything is brass, nothing is.
- Do use `data-md`/`data-lg` (mono, tabular figures) for every currency
  amount and meter reading, in both USD and KHR.
- Do keep corner radii at or below `rounded.xl` (10px) except for fully
  circular elements.
- Don't introduce a new semantic status color without adding it to the
  `colors` token set and this file first.
- Don't use Fraunces below 24px or in tables — it's a display face only.
- Don't add drop shadows to cards or table rows; use the
  `{colors.border}` hairline instead.
- Don't let `info` (the cool slate blue) drift warm — it's the one
  deliberately "off-palette" color and its coolness is what makes it
  read as neutral/informational rather than an action or status color.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-10 | Initial design system created (Modern Ledger) | Created via `/design-consultation`, replacing the stock shadcn grayscale theme. Anchored on the "trustworthy & precise" brief; researched against TenantCloud (category default) and Mercury (fintech-trust benchmark). |
| 2026-07-10 | Added `divider`, `caption`, `popover` components | Wired previously orphaned `border`, `muted-foreground`, `surface-raised` tokens into components so every color token is referenced somewhere. |
