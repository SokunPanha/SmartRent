---
name: Aura Dark
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffc176'
  on-tertiary: '#472a00'
  tertiary-container: '#f1a02b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb960'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin: 24px
---

## Brand & Style
The design system focuses on a high-end, "Sleek Dark" aesthetic tailored for sophisticated management environments. The brand personality is calm, precise, and authoritative. It utilizes a refined **Minimalist** approach, stripping away unnecessary ornamentation to focus on data density and clarity. 

The emotional response is one of "focused control"—reducing cognitive load through deep background tones and sharp, readable content. Visual hierarchy is established through tonal layering rather than heavy shadows, creating a workspace that feels like a premium, dark-mode terminal.

## Colors
The palette is rooted in a deep charcoal base (`#0f172a`), creating a low-light foundation that minimizes eye strain. 

- **Primary:** A vibrant Sky Blue (`#38bdf8`) is used sparingly for active states, primary actions, and critical focus indicators.
- **Surface Strategy:** We use a stepped slate palette. The base background is the darkest, with containers and cards stepping up to a slightly lighter Slate-800 (`#1e293b`) to create subtle depth.
- **Typography Contrast:** Primary text uses Slate-50/100 for maximum legibility, while secondary information is pushed back using Slate-400 to maintain a clear information hierarchy.
- **Semantic Colors:** Success, Warning, and Error colors are saturated to ensure they "pop" against the dark background without being vibrating or illegible.

## Typography
This design system utilizes **Geist** for its core typography. Geist provides a technical, clean, and highly legible character that aligns with the management focus of the product. Its ink traps and geometric construction ensure clarity even at small sizes on dark screens.

For technical data, IDs, and metadata labels, **JetBrains Mono** is employed to provide a rhythmic, systematic feel that distinguishes static labels from dynamic content.

**Implementation Note:** Keep line heights generous (minimum 1.4x-1.5x) to prevent text from feeling cramped in a dark environment where "haloing" effects can occur for sensitive eyes.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy with a strict 4px baseline rhythm. This ensures that every element—from icon placement to margin—is mathematically consistent.

- **Desktop:** 12-column grid, 20px gutters, 24px side margins.
- **Tablet:** 8-column grid, 16px gutters, 16px side margins.
- **Mobile:** 4-column grid, 12px gutters, 12px side margins.

White space (or "dark space") is used intentionally to group related management modules. Avoid tight borders; use the `md` (16px) spacing unit as the standard padding for containers to allow the UI to breathe.

## Elevation & Depth
In this dark-mode system, we avoid heavy drop shadows which can look "muddy." Instead, we use **Tonal Layers** and **Subtle Outlines**:

1.  **Level 0 (Background):** `#0f172a` - The canvas.
2.  **Level 1 (Cards/Sidebar):** `#1e293b` - Surfaces that sit on the canvas.
3.  **Level 2 (Modals/Popovers):** `#334155` - Elevated components.

To define edges, use a **1px solid border** with low-opacity Slate-700 (`rgba(51, 65, 85, 0.5)`). For high-elevation elements like Modals, a very soft, large-radius shadow (`blur: 40px, opacity: 0.3`) with a slight blue tint can be used to separate the element from the layers below.

## Shapes
The shape language is **Soft** and professional. By using a 4px (0.25rem) base radius, we maintain a crisp, structured feel that looks modern without being overly playful or aggressive.

- **Standard Buttons/Inputs:** 4px radius.
- **Cards/Modules:** 8px (rounded-lg) radius.
- **Modals:** 12px (rounded-xl) radius.

Icons should follow a 2px stroke weight to match the refined weight of the Geist typeface.

## Components

### Buttons
- **Primary:** Solid `#38bdf8` with `#0f172a` text. No shadow, flat.
- **Secondary:** Transparent background with a Slate-700 border and Slate-100 text.
- **Ghost:** No border, Slate-400 text that shifts to Slate-100 on hover.

### Input Fields
- **Default State:** Background: `#1e293b`, Border: Slate-700, Text: Slate-100.
- **Focus State:** Border: `#38bdf8`, subtle outer glow (2px).
- **Placeholder:** Slate-500.

### Cards
- Surfaces use the Level 1 color (`#1e293b`). Borders are essential here to distinguish the card from the background. 
- Header areas within cards should have a subtle bottom-border separator.

### Chips & Status Indicators
- Use a "tinted-fill" approach: A success chip should have a 10% opacity green background with 100% opacity green text and border. This keeps the dark-mode aesthetic cohesive while clearly communicating status.

### Lists & Tables
- Alternate row striping is discouraged. Use thin Slate-800 dividers instead.
- Table headers should use the `label-sm` typography role (JetBrains Mono) for a technical appearance.