---
name: Aura Management System — Pastel Console
source-of-truth: app/globals.css (tokens), components/ui/* (primitives)
colors:
  # Light
  canvas: '#F2F5F5'          # rounded content panel
  card: '#FFFFFF'
  card-border: '#ECEFF1'
  ink: '#1B1C20'
  muted-ink: '#80858F'
  border: '#E6EAED'
  primary: '#4F5BEF'          # indigo signature accent (default)
  primary-tint: '#EEF0FE'
  sidebar: '#1F2024'          # dark charcoal frame, both modes
  sidebar-active: '#FFFFFF'   # active nav = white pill
  destructive: '#E5484D'
  success: '#1F9D5C'
  warning: '#D9A21B'
  info: '#3478F6'
  # Dark
  dark-canvas: '#16171B'
  dark-card: '#1F2025'
  dark-sidebar: '#0E0F12'
  dark-primary: '#7C86F8'
tiles:                         # pastel metric tiles (light / dark)
  indigo: ['#D9DCFB', '#2A2E5C']
  green: ['#CDEBDA', '#1D3D2D']
  orange: ['#FAD9CB', '#4A2A1F']
  yellow: ['#F0EBC6', '#403A1E']
accents: [indigo (default), red/crimson, navy, amethyst]
typography:
  family: Geist
  page-title: 20px / 700
  section-title: 16px / 600, tracking-tight, normal case
  body: 14–16px / 400
  label: 12px / 500, muted, normal case
radius:
  control: 12px      # --radius (inputs, selects)
  button: 9999px     # pills
  card: 20px         # --radius-card
  modal: 24px        # --radius-modal
  panel: 28px        # --radius-panel (content panel inside the dark frame)
sizing:
  button: 44px (default), 40px (sm), 32px (xs)
  input / select: 44px
  header-icon-button: 40px
spacing:
  base: 4px grid (Tailwind)
  mobile-gutter: 16px
  desktop-gutter: 32px
  container-max: 1280px
---

## Brand & Style
**Pastel Console**: a soft, friendly, modern dashboard. A **dark charcoal frame** (the sidebar) wraps a **large rounded content panel** in a cool mint-gray. White, borderless cards float on the panel. Headline numbers sit on **pastel tiles** (indigo, mint, peach, butter). One **vivid indigo** accent drives actions and focus.

The feel is calm, airy and approachable. Use rounded shapes, generous padding and soft color fields rather than hard lines.

## Colors
- **Signature / Primary:** Indigo `#4F5BEF` (dark `#7C86F8`). Use it for primary buttons, focus rings, links, the active-state accent and the hero gradient. Users can switch the accent to Crimson, Navy or Amethyst with the palette picker; the rest of the theme stays the same.
- **Frame:** The sidebar is always dark charcoal (`#1F2024` light / `#0E0F12` dark). The active nav item is a **solid white pill with dark ink**. Hover is a subtle lighter charcoal.
- **Canvas & surfaces:** The content panel is `#F2F5F5`. Cards are white with a near-invisible border (`--card-border`) and a soft ambient shadow.
- **Pastel tiles:** For headline metrics only (dashboard KPIs). Use `.tile` (indigo), `.tile-green`, `.tile-orange`, `.tile-yellow`. Each tile has a diagonal pastel gradient, two faint arcs in the bottom-right corner, and a solid round icon chip (`.tile-icon`) in the tile's strong color with a white icon. Tile text uses `--tile-foreground` / `.tile-muted`.
- **Functional:** success green, warning amber (use darker `#94690A` text on light backgrounds for contrast), destructive red, info blue. Use them for status pills and alert chips, never as large fills.
- **Hero:** `.gradient-hero` is a vivid indigo gradient with soft arcs (follows the chosen accent). Reserve it for one band per page (dashboard header, statistics header) and the sidebar user card.

## Typography
**Geist** throughout.
- Section and card titles: semibold, normal case, `tracking-tight`.
- Labels and metadata: normal-case muted text, 12px or larger.
- **Do not** use monospace + ALL-CAPS + letter-spaced labels for UI chrome. Monospace is only for tabular numeric data (amounts, meter values, invoice numbers). Never uppercase or letter-space Khmer.

## Layout & Spacing
- Desktop: dark frame → rounded panel (`--radius-panel`, 12px inset from the frame) → sticky translucent header (no border) → content (max 1280px, 32px gutters).
- Mobile: no frame; content uses 16px gutters. Header controls collapse to icon-only (the language button shows just its icon).
- Make toolbars and card grids respond to **their container, not the viewport** (Tailwind `@container` + `@3xl:` / `@xl:` / `@4xl:`), because the sidebar takes 256px at tablet widths.
- Toolbars: title + filter chips on the left, search + primary action on the right; they stack below `@3xl`.

## Elevation & Depth
- Cards: `shadow-card` (very soft) plus `--card-border`. No heavy drop shadows.
- Primary buttons get a soft colored glow: `shadow-[0_6px_16px_-6px_var(--primary)]`.
- Modals: `--shadow-modal`, 24px radius.
- Hover: no Y-axis lift. Use a border tint or a single tonal step.

## Shapes
- **Buttons, badges, chips, tabs, nav items:** fully rounded pills.
- **Inputs / selects:** 12px radius (`--radius`).
- **Cards / tiles:** 20px. **Modals:** 24px. **Content panel:** 28px.
- Icon buttons and avatars are circles.

## Components
- **Buttons:** pill. Primary = indigo with a glow. Outline = white card pill with a soft shadow. Default height 44px with `px-5`. Small size is 40px. Never make text buttons smaller than 32px.
- **Inputs / selects:** 44px tall, `px-4`, white background, 1px input border. Focus = border turns primary + a soft ring.
- **Filter chips** ("Label: Value" selects in toolbars): 40px muted pill, `px-4`.
- **Tabs:** white pill track; the active tab is a dark (foreground) pill with light text.
- **Status badges:** tinted pill, normal case, no wrapping (`StatusBadge`).
- **Alerts (dashboard):** white card row with a tinted round icon, a muted label above a semibold title, and a tinted pill action on the right.
- **Data tables:** horizontal hairlines only, normal-case muted headers, generous row padding. Wide tables scroll inside their card (`.scroll-x-hint`), never the page.
