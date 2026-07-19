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
The design system is rooted in **High-End Minimalism**, prioritizing clarity, precision, and a sense of architectural calm. Designed for a tenant management platform, the aesthetic moves away from cluttered dashboards toward a "gallery-like" experience where information is curated rather than dumped. 

The emotional response should be one of professional ease and premium reliability. By utilizing expansive whitespace and a restrained palette, the UI recedes to let the content—property data, tenant communications, and financial overviews—become the focal point. The style avoids "loud" UI patterns in favor of thin hairlines, subtle tonal shifts, and intentional typographic hierarchy.

## Colors
The palette is monochromatic and sophisticated, utilizing a foundation of "Paper White" and "Soft Slate." 

- **Primary:** Deep Navy (#0F172A) is reserved for primary actions, navigation headers, and critical focus states.
- **Neutrals:** A range of grays from Slate-50 to Slate-400 provides the structural framework. Charcoal is used for body text to reduce eye strain while maintaining high contrast.
- **Functional:** Success, warning, and error states should use desaturated versions of green and red to maintain the minimalist harmony.
- **Accents:** High-end finishes are achieved through the use of very subtle borders (#E2E8F0) rather than heavy background fills.

## Typography
This design system utilizes **Geist** for its technical precision and modernist roots. The typeface's geometric construction ensures legibility in data-heavy tables while appearing elegant in large display headers.

- **Scale:** A tight typographic scale is used to prevent visual noise. 
- **Rhythm:** Line heights are generous (1.6x for body) to enhance the "airy" feel.
- **Weight:** Use `Medium (500)` for subheaders and `SemiBold (600)` sparingly for primary headings to maintain a sophisticated, non-aggressive profile.
- **Labels:** Small labels use increased letter spacing and uppercase styling to differentiate metadata from primary content.

## Layout & Spacing
The layout follows a **Fluid Grid with Fixed Maxima**. On desktop, content is centered within a 1440px container to ensure readability on ultrawide monitors.

- **The 8px Rule:** All spacing (padding, margins, gap) must be a multiple of 8px. 
- **Whitespace as a Component:** Treat large gaps (48px+) not as empty space but as a structural tool to group related property modules.
- **Mobile Reflow:** On mobile devices, side margins shrink to 16px, and multi-column grid cards stack vertically. 
- **Grid:** A 12-column system is used for desktop layouts, typically using a 6-6 split for management dashboards or a 4-8 split for detail views.

## Elevation & Depth
In keeping with the minimalist high-end aesthetic, depth is communicated through **Low-Contrast Outlines** and **Ambient Shadows** rather than heavy fills.

- **Shadows:** Use a single, highly diffused shadow style for floating elements (modals, dropdowns): `0 20px 50px rgba(0,0,0, 0.04)`. It should feel like a soft glow of light rather than a dark shadow.
- **Tonal Layers:** The background is pure white (#FFFFFF). Cards or secondary sections use a subtle Slate-50 (#F8FAFC) background with a 1px border (#F1F5F9).
- **Interactive States:** On hover, elements should not move "up" (no Y-axis shift). Instead, the border color should subtly darken, or the background should shift by a single tonal step.

## Shapes
The shape language is **Soft and Precise**. 

A 4px (`rounded-sm`) radius is the standard for almost all UI elements including buttons, input fields, and cards. This small radius provides a hint of modern approachability while maintaining the structured, professional look of sharp corners. 

- **Large Elements:** Use `rounded-lg` (8px) for major containers or modals.
- **Circular Elements:** Reserved exclusively for user avatars or status indicators to provide a visual break from the rectilinear grid.

## Components
- **Buttons:** Primary buttons use the Deep Navy background with white text. Secondary buttons are "Ghost" style: no background, 1px light gray border, slate-900 text.
- **Inputs:** Fields are defined by a bottom-border only or a very light 4-sided border. Focus states should be a simple color change of the border to the primary navy—no heavy "glow" effects.
- **Cards:** Cards should have no shadow by default. They are defined by a 1px border (#F1F5F9). Padding inside cards is generous (minimum 24px).
- **Chips/Badges:** Small, rectangular badges with a subtle background (e.g., #F1F5F9) and Slate-700 text. Used for status indicators like "Lease Active" or "Payment Pending."
- **Lists:** Tenant and property lists use horizontal rules (hairlines) with significant vertical padding (16px - 20px) between rows to ensure the UI feels light and airy.
- **Data Tables:** Remove all vertical borders. Use only horizontal lines. Headers should be in the `label-md` typographic style.