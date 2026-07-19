---
name: Aura Management System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is **Refined & Premium** — a warm evolution of high-end minimalism. It prioritizes clarity, precision, and architectural calm, but replaces cold monochrome with **warm neutrals and a single restrained emerald signature accent**. Designed for a tenant management platform, the aesthetic curates information rather than dumping it, on a soft ivory canvas with clean white cards.

The emotional response should be one of professional ease and premium reliability. Expansive whitespace, warm paper tones, and a restrained palette let the content — property data, tenant communications, financial overviews — become the focal point. The style avoids "loud" UI patterns in favor of thin hairlines, subtle tonal shifts, soft ambient depth, and intentional typographic hierarchy.

## Colors
The palette is **warm neutral with one emerald signature accent** — a foundation of "Warm Ivory" and "Soft Stone," not cold slate.

- **Signature / Primary:** Deep Emerald (`#12694E`, brighter `#34B189` in dark) is the single accent. Reserved for primary actions, active navigation, focus rings, links, and positive emphasis. Use it sparingly — one confident accent, never a rainbow.
- **Canvas & surfaces:** Warm ivory canvas (`#FAF9F7`) with clean white cards (`#FFFFFF`) that lift off it. Warm charcoal ink (`#1F1D1B`) for body text — never pure black.
- **Neutrals:** Warm grays (`#7A736B` muted, `#E8E3DC` borders) provide the structural framework. Warm, not cool slate.
- **Functional:** Success (emerald family), warning (gold), and error (`#BE3B31` warm red) stay desaturated to preserve calm. Info blue (`#2C6E8F`) is reserved for utility data like water meters.
- **Accents:** Finishes come from very subtle warm borders and faint emerald tints (`#ECF3EF`) rather than heavy fills.

## Typography
This design system uses **Geist** for its geometric precision — legible in data-heavy tables, elegant in large headers.

- **Scale:** A comfortable, modern scale. Body text is **16px minimum**; avoid sub-12px type in the chrome. Larger, more confident sizing reads modern — cramped micro-text reads dated.
- **Rhythm:** Line heights are generous (1.6x for body) to enhance the airy feel.
- **Weight:** Use `Medium (500)` for subheaders and `SemiBold (600)` sparingly for primary headings — sophisticated, non-aggressive.
- **Labels:** Metadata labels are **normal-case Geist** in a muted warm gray. Do **not** use monospace or ALL-CAPS letter-spaced labels for UI chrome — that "technical terminal" styling reads dated. (Monospace is fine only for genuinely numeric/tabular figures where digit alignment matters. Never apply uppercase or letter-spacing to Khmer text.)

## Layout & Spacing
The layout follows a **Fluid Grid with Fixed Maxima**. On desktop, content is centered within a 1440px container to ensure readability on ultrawide monitors.

- **The 8px Rule:** All spacing (padding, margins, gap) must be a multiple of 8px. 
- **Whitespace as a Component:** Treat large gaps (48px+) not as empty space but as a structural tool to group related property modules.
- **Mobile Reflow:** On mobile devices, side margins shrink to 16px, and multi-column grid cards stack vertically. 
- **Grid:** A 12-column system is used for desktop layouts, typically using a 6-6 split for management dashboards or a 4-8 split for detail views.

## Elevation & Depth
Depth is communicated through **warm hairline outlines** and **soft ambient shadows** — subtle, never heavy.

- **Card shadow:** Cards carry a soft ambient shadow (`--shadow-card`: `0 1px 2px / 0 2px 8px` at very low opacity) that lifts white cards off the warm ivory canvas. It should read as a gentle sense of depth, not a drop shadow.
- **Modal shadow:** Floating elements (modals, dropdowns) use a single diffused shadow (`--shadow-modal`): a soft glow of light, not a dark shadow.
- **Tonal Layers:** The canvas is warm ivory (`#FAF9F7`). Cards are white (`#FFFFFF`) with a 1px warm border (`#E8E3DC`) plus the ambient card shadow.
- **Interactive States:** On hover, elements should not move "up" (no Y-axis shift). Instead, the border darkens toward emerald or the background shifts by a single tonal step.

## Shapes
The shape language is **Soft and Modern** — a graduated radius scale, not flat corners.

- **Controls** (buttons, inputs, chips): `10px` (`--radius`).
- **Cards:** `12px` (`--radius-card`).
- **Modals / large containers:** `16px` (`--radius-modal`).
- **Circular Elements:** Reserved for avatars and status dots, for a visual break from the rectilinear grid.

## Components
- **Buttons:** Primary buttons use the Emerald background with white text. Secondary buttons are "Ghost" style: no background, 1px warm border, charcoal text. 10px radius.
- **Inputs:** A light 4-sided warm border. Focus states are a simple border color change to emerald plus the emerald ring — no heavy "glow."
- **Cards:** White, 12px radius, 1px warm border, and the soft `--shadow-card` ambient shadow. Padding inside cards is generous (minimum 24px).
- **Chips/Badges:** Small rounded badges with a subtle tinted background and normal-case label. Used for status like "Lease Active" or "Payment Pending." No ALL-CAPS letter-spacing.
- **Lists:** Tenant and property lists use hairlines with generous vertical padding (16px–20px) between rows to keep the UI light and airy.
- **Data Tables:** Remove all vertical borders. Use only horizontal hairlines. Headers use a muted normal-case label, not uppercase monospace.