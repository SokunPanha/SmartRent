---
version: alpha
name: Tidal
description: TenantTrack's design system — a rental invoicing and property management platform for Cambodia (USD/KHR dual currency).
colors:
  background: "#0A2540"
  surface: "#FFFFFF"
  surface-raised: "#F3F7F9"
  border: "#D7E3E8"
  foreground: "#F2F6F8"
  on-surface: "#10283A"
  muted-foreground: "#5C7480"
  primary: "#0E7C90"
  on-primary: "#FFFFFF"
  primary-hover: "#0B6577"
  secondary: "#06AED4"
  on-secondary: "#06222E"
  info: "#06AED4"
  on-info: "#06222E"
  success: "#1C8C5B"
  on-success: "#FFFFFF"
  error: "#D9483D"
  on-error: "#FFFFFF"
typography:
  display-lg:
    fontFamily: Baloo 2
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.01em
  display-md:
    fontFamily: Baloo 2
    fontSize: 32px
    fontWeight: 700
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
  sm: 4px
  md: 8px
  lg: 12px
  xl: 20px
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
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
    height: 40px
  data-table-cell:
    textColor: "{colors.on-surface}"
    typography: "{typography.data-md}"
  stat-card-value:
    textColor: "{colors.on-surface}"
    typography: "{typography.data-lg}"
  gradient-hero:
    backgroundImage: "radial-gradient(magenta glow) + linear-gradient(teal to {colors.background})"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 20px
  badge-paid:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-success}"
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
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 12px
---

## Overview

TenantTrack is a rental invoicing and property management platform for
Cambodia — properties, rooms, tenants, contracts, meter utility readings,
and dual-currency (USD/KHR) invoices, used by landlords and property
managers to run their business day to day.

The design direction is **Tidal**: a Cambodian mobile-banking register —
teal-to-navy gradients, crisp white cards, and a small set of saturated
action colors — replacing the previous **Summer Breeze** (yellow/coral/beige,
warm-and-approachable) direction. The brief came directly from a screenshot
of ABA Mobile, Cambodia's dominant banking app: landlords and tenants already
trust that visual language for moving money, so TenantTrack's own
rent-collection and invoicing flows borrow it deliberately rather than
inventing a new one. The bar for legibility of financial data is unchanged —
dual-currency figures and meter readings still have to be exact — but the
register shifts from "sunny afternoon" to "your banking app," which is a
better fit for a product whose core job is literally moving USD/KHR between
tenant and landlord.

Where Summer Breeze deliberately avoided a dark canvas (that was the
previous-previous system, Modern Ledger's near-black), Tidal brings dark back
— but as a teal-tinted navy rather than near-black, and with white content
cards floating on it rather than dark cards on dark. This isn't a return to
Modern Ledger's austere brass-on-black; it's borrowing the specific "white
card afloat on a colorful gradient" pattern that reads as *banking app*, not
*audited ledger*.

## Colors

The palette is teal (brand), bright cyan (info), green (success/positive),
red (error/urgent), and white cards on a deep navy canvas — five saturated
roles instead of Summer Breeze's four, because Tidal's reference material
(ABA's "Receive Money" vs. "Send Money" vs. neutral iconography) actually
needs a real green distinct from its info color, not a shared blue standing
in for both.

- **Background (#0A2540):** Deep teal-navy — the page canvas everywhere
  outside of cards. Not a hairline-dark-mode gray; it's saturated enough to
  read as "brand," the way ABA's own screens use a colored canvas instead of
  neutral gray behind their white balance cards.
- **Surface (#FFFFFF) / on-surface (#10283A):** Every card, table, input, and
  popover is a crisp white surface with dark navy-slate text — this is where
  all the dense tabular financial data actually lives, and it stays as
  legible as a plain light-mode app even though the page around it is dark.
  `foreground` (#F2F6F8, near-white) is reserved for text sitting *directly*
  on the navy background (hero headings, page titles outside a card) — don't
  use it inside a card, use `on-surface` there instead.
- **Primary (#0E7C90):** Deep teal. Buttons, active nav state, brand
  accents — the interactive color, same scarcity discipline as before (one
  primary action per view).
- **Secondary / Info (#06AED4):** Bright cyan for informational badges and
  accents — e.g. "scheduled," neutral status pills.
- **Success (#1C8C5B) — new token:** Green for paid invoices, positive
  balances, and "money received," mirroring ABA's green receive-money
  affordance. This resolves a real constraint from Summer Breeze, which had
  no green and had to collapse "paid" onto the same sky-blue as "info" (a
  documented ambiguity in that system). Tidal doesn't have that problem:
  `success` and `info` are genuinely different hues now, so a paid badge and
  an info badge next to each other are distinguishable by color alone, not
  just by label.
- **Error (#D9483D):** Red for overdue invoices, failed actions, and
  destructive confirmations — the "send money" urgency color in the
  reference material.

### Gradient Hero

Tidal introduces one new component, `gradient-hero` (a `.gradient-hero`
utility class in `app/globals.css`): a teal-to-navy diagonal gradient with a
soft magenta glow in the upper-left, direct from the reference screenshot's
hero band behind its balance card. This is used sparingly — only on the
dashboard's summary header and the mobile statistics title bar — never as a
page-wide or scrollable background. Text inside a `gradient-hero` container
uses white/`foreground`, not `on-surface`.

### Day / Night

Tidal ships two theme variants via `next-themes`, but the relationship
flips from Summer Breeze: **dark ("Tidal Night") is now the default**,
matching the reference material directly — deep navy background, white
cards. Toggling to light ("Tidal Day") swaps only the neutrals: background
lightens to a pale teal-tinted off-white (`#EFF6F7`) instead of navy, muted
tones lighten to match, but cards stay white and `primary`/`secondary`/
`success`/`error` stay fixed across both — the brand accents don't
desaturate at all switching modes, same discipline the previous system used.
Printing (invoices/receipts) always forces the light neutrals regardless of
active theme, since paper has no "dark mode."

## Typography

Three families, each with one strict job.

- **Display (Baloo 2):** Reserved for report titles and the largest figure
  on a page (e.g. "Total Collected This Month"). A rounded, friendly
  display face replaces the previous serif (Fraunces) — Summer Breeze
  wants headlines that feel warm and a little playful, not certificated.
  Never used below 24px and never used in tables or body copy, where a
  display face hurts legibility.
- **Body/UI (Instrument Sans):** All interface copy, navigation, form
  labels, and paragraph text. Unchanged from the previous system — already
  warm and friendly without competing with the new display face.
- **Data (IBM Plex Mono, tabular figures):** Every dollar/riel amount and
  every meter reading, in tables and stat cards alike. Monospace digits
  mean columns of numbers actually align. Unchanged — precision in the
  numbers is non-negotiable even as the surrounding shell gets friendlier.

## Layout

Grid-disciplined: strict column alignment, predictable spacing, no
asymmetry. Financial and tabular data punishes any layout that isn't
rigorously aligned, so Tidal never trades precision for visual flair at the
layout level — this constraint carries over unchanged through every color
direction the system has had.

An 8px base spacing scale governs all dimensions, with a 4px half-step
reserved for micro-adjustments (icon-to-label gaps, badge padding). The
existing sidebar + content layout is kept. Max content width for primary
views is 1280px; forms and detail panels cap at 640px so long lines of
body text stay readable.

## Elevation & Depth

Depth comes from **soft shadows**, not hairline borders. `surface` (cards)
get a soft drop shadow instead of a `{colors.border}` hairline — cards read
as lifted white panels floating on the navy canvas, the way a banking app's
balance card sits above its background, rather than ruled off from it.
Borders are kept only where they carry information (table cell dividers,
input field outlines), using `{colors.border}`. Modals and toasts get a
slightly stronger shadow than cards to establish they're a true overlay.

## Shapes

**Soft & Approachable.** Corners are rounded (4–20px) across buttons,
inputs, and cards — carried over unchanged from Summer Breeze, and it still
fits Tidal on its own terms: the ABA Mobile reference material this system
is built from uses generously rounded cards and pill-shaped badges, not
sharp edges. Fully circular elements (avatars, status dots) continue to use
`rounded.full`.

## Components

### Buttons

Primary buttons carry the teal fill and are reserved for the single most
important action in a given view (submit invoice, save reading). Everything
else — including "Cancel," secondary navigation actions, and repeated
row-level actions — uses the transparent/outline secondary style so teal
doesn't lose its scarcity value.

### Cards & Stat Displays

Dashboard stat cards pair a `label-sm` caption with a `stat-card-value`
figure in the data (mono) typeface — this is the pattern that should
appear anywhere a single number needs to dominate a card (total due,
occupancy rate, this month's collections). `stat-card-value` doesn't force a
brand accent color onto the figure itself; it uses `on-surface` (dark
navy-slate on the white card) and lets the surrounding card/label carry the
brand color instead.

### Status Badges

`badge-paid` is green (`success`), `badge-info` is bright cyan (`info`),
`badge-overdue` is red (`error`) — three distinct hues, unlike Summer
Breeze where paid and info had to share one color for lack of a green.
These are the only three semantic badge treatments in the system. Do not
introduce a fourth semantic color for status without updating this file
first.

### Tables

Meter readings, invoice line items, and rent rolls all use
`data-table-cell` for numeric columns so figures align on their decimal
point across rows, and `body-md` for text columns (tenant name, property,
notes).

## Do's and Don'ts

- Do reserve `primary` (teal) for exactly one action or figure per screen —
  if everything is teal, nothing is.
- Do use `data-md`/`data-lg` (mono, tabular figures) for every currency
  amount and meter reading, in both USD and KHR.
- Do keep corner radii at or below `rounded.xl` (20px) except for fully
  circular elements.
- Do use `on-surface` for text inside any white card/popover/input, and
  `foreground` only for text sitting directly on the navy `background` or a
  `gradient-hero` band — mixing the two up is the most likely legibility bug
  in this theme.
- Do reserve `gradient-hero` for the dashboard header and mobile statistics
  title bar — never apply it to a scrollable list/table surface.
- Don't introduce a new semantic status color without adding it to the
  `colors` token set and this file first.
- Don't use Baloo 2 below 24px or in tables — it's a display face only.
- Don't add hairline borders back to cards as a substitute for shadow —
  use `{colors.surface}` + shadow, borders are reserved for information-
  bearing dividers (table cells, inputs).

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-10 | Initial design system created (Modern Ledger) | Created via `/design-consultation`, replacing the stock shadcn grayscale theme. Anchored on the "trustworthy & precise" brief; researched against TenantCloud (category default) and Mercury (fintech-trust benchmark). |
| 2026-07-10 | Added `divider`, `caption`, `popover` components | Wired previously orphaned `border`, `muted-foreground`, `surface-raised` tokens into components so every color token is referenced somewhere. |
| 2026-07-11 | Full rebrand to Summer Breeze | User supplied a 4-color palette (yellow/coral/sky blue/beige) and asked for a full rebrand rather than a color-only swap. Default theme flips from dark to light; dark mode becomes a "night" variant instead of the previous default. `secondary`/`info` collapse onto one shared sky blue since the new palette has no green for "paid/positive." Corners loosen (4–20px) and elevation moves from hairline borders to soft shadows to match a friendlier register. Display typeface changes from Fraunces (serif) to Baloo 2 (rounded sans); body and data typefaces unchanged. |
| 2026-07-11 | Full rebrand to Tidal | User supplied an ABA Mobile (Cambodian banking app) screenshot and asked for a full rebrand matching its teal/navy/red/green language, including gradients. Default theme flips back to dark ("Tidal Night") since the reference material is inherently a dark/gradient canvas; light becomes the "Tidal Day" alt. New `success` (green) token added, decoupling "paid" from `info` for the first time — resolves the ambiguity Summer Breeze had documented as a known trade-off. New `on-surface` token added and wired into `card`/`input-field`/`data-table-cell`/`stat-card-value`/`popover`, since background (navy) and surface (white) are no longer close enough in value to share one `foreground` color the way Summer Breeze's background/surface could. New `gradient-hero` component (teal→navy diagonal gradient + magenta glow) added for the dashboard header and mobile statistics title bar only — the one deliberately non-flat surface in the system. Typography, layout, shape, and elevation principles (Baloo 2/Instrument Sans/IBM Plex Mono, 8px grid, 4–20px corners, soft shadows) are unchanged — this is a color-and-gradient rebrand, not a full aesthetic overhaul. |
</content>
