# Lagom Design — Design System

Production design system for the Lagom Design corporate website. This document defines the visual language, tokens, utilities, and rules that govern every page.

---

## Brand Philosophy

Lagom Design communicates through restraint. The visual direction draws from Scandinavian minimalism and luxury editorial design — the kind of aesthetic found in premium branding agencies, interior design studios, and architecture practices.

Every layout should feel calm, considered, and spacious. Content breathes. Typography leads. Color is muted and intentional. Nothing competes for attention.

**The site should never feel like a startup landing page.** No loud gradients, no overcrowded sections, no decorative clutter.

---

## Color Palette

All colors are defined as CSS custom properties in `src/styles/global.css`. Never introduce colors outside this palette.

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#3F493D` | Headings, body text, borders, footer background, primary buttons |
| `--color-accent` | `#CBE4B8` | Accent sections, image placeholders, highlight backgrounds |
| `--color-paper` | `#FFFCEB` | Page background, surface color, inverted text on dark surfaces |

### Semantic Tokens

| Token | Derivation | Usage |
|---|---|---|
| `--background` | Paper | Page background |
| `--surface` | Paper | Cards, panels |
| `--text-primary` | Primary | Headings, body copy |
| `--text-secondary` | Primary at 65% opacity | Supporting text, captions |
| `--border` | `rgba(63, 73, 61, 0.18)` | Card borders, input borders |
| `--divider-color` | `rgba(63, 73, 61, 0.18)` | Section dividers, header/footer rules |

---

## Typography

### Fonts

| Role | Font | CSS Variable | Weights |
|---|---|---|---|
| Headings | Montserrat | `--font-montserrat` | 400, 500 |
| Body | Lora | `--font-lora` | 400, 500 (italic available) |

Fonts are loaded via `next/font/local` in `src/lib/fonts.ts` and applied globally through the root layout.

### Type Styles

| Class | Size | Weight | Letter-spacing | Line-height | Notes |
|---|---|---|---|---|---|
| `.heading-section` | 64px | 400 | 0.08em | 1.1 | Montserrat, uppercase |
| `.heading-service` | 36px | 500 | 0.08em | 1.1 | Montserrat, uppercase |
| `.body` | 18px | 400 | — | 1.55 | Lora |
| `.text-small` | 16px | 400 | — | 1.55 | Default body size |

### Rules

- Section and service headings are always uppercase with 0.08em letter-spacing.
- Body copy uses 18px; default page text uses 16px via `.text-small`.
- Maximum paragraph width is 42rem for comfortable reading.
- Use italic Lora sparingly for quotes and editorial emphasis.

---

## Spacing Scale

Only these spacing values may be used. No other spacing values unless absolutely necessary (document exceptions in layout tokens).

| Token | Value |
|---|---|
| `--space-4` | 4px |
| `--space-8` | 8px |
| `--space-12` | 12px |
| `--space-16` | 16px |
| `--space-24` | 24px |
| `--space-32` | 32px |
| `--space-48` | 48px |
| `--space-72` | 72px |
| `--space-96` | 96px |
| `--space-112` | 112px |
| `--space-144` | 144px |

### Layout Exceptions (specified, not on scale)

| Token | Value | Usage |
|---|---|---|
| `--section-spacing-sm` | 80px | Small section padding |
| `--hero-bottom-spacing` | 160px | Hero bottom spacing |
| `--container-padding` (mobile) | 20px | Mobile horizontal padding |
| `--grid-gap-column` | 60px | Desktop grid column gap |
| `--grid-gap-row` | 56px | Desktop grid row gap |
| `--button-height` | 64px | Button height |

---

## Layout

### Container

`.container` — max-width `1440px`, centered.

| Breakpoint | Horizontal padding |
|---|---|
| Desktop (default) | 48px (`--space-48`) |
| Tablet (≤992px) | 32px (`--space-32`) |
| Mobile (≤768px) | 20px |

### Section Rhythm

| Class | Padding (block) |
|---|---|
| `.section-lg` | 144px |
| `.section-md` | 112px |
| `.section-sm` | 80px |

### Section Flow Spacing

| Class | Value | Usage |
|---|---|---|
| `.spacing-hero-bottom` | 160px | Hero bottom spacing |
| `.spacing-heading-content` | 72px | Heading to content |
| `.spacing-grid-cta` | 72px | Grid to CTA |
| `.spacing-paragraph-button` | 48px | Paragraph to button |

Do not add custom padding to individual sections. Use these global utilities.

### Grid

`.grid` — responsive column layout.

| Breakpoint | Columns | Gap |
|---|---|---|
| Desktop | 3 | 60px column / 56px row |
| Tablet (≤992px) | 2 | Same gaps (reduced at ≤1440px) |
| Mobile (≤768px) | 1 | Same gaps |

---

## Buttons

Global `.button` class in `global.css`:

| Property | Value |
|---|---|
| Width | 360px (100% on mobile) |
| Height | 64px |
| Radius | 999px (pill) |
| Shadow | None |
| Border | None |
| Hover | Smooth opacity transition |

Variants: `.button-primary`, `.button-accent`.

---

## Icons

`.icon` — default display size 56px.

Source assets: `imagesfromdrive/Home Page/Icons_ 150 x 150px/` (150×150px PNGs).

Rules:
- Maintain original SVG stroke/fill.
- Never recolor icons via CSS.

---

## Images

`.image` / `.image-cover` utilities:

| Property | Value |
|---|---|
| Border-radius | 8px |
| Object-fit | cover |
| Shadow | None |
| Width | Responsive (100%) |

---

## Dividers

`.divider` — 1px line, `rgba(63, 73, 61, 0.18)`.

Use sparingly between major sections.

---

## Responsive Breakpoints

Use only these breakpoints. No arbitrary media queries.

| Name | Max-width | Typical use |
|---|---|---|
| Desktop cap | 1440px | Grid gap reduction |
| Laptop | 1200px | Section heading scale-down |
| Tablet | 992px | 2-column grid, container padding 32px |
| Mobile | 768px | 1-column grid, container padding 20px, full-width buttons |
| Small Mobile | 480px | Further type scale-down |

---

## Responsive Rules

1. Never hardcode spacing inside components — consume spacing variables.
2. Every page must use the same section rhythm utilities.
3. No inline styles.
4. No duplicated CSS — use global utilities first, CSS Modules for component-specific layout only.

---

## Client Asset Library

Source folder: `imagesfromdrive/` (project root). Copy assets into `public/` when implementing pages.

### Root Files

| File | Type | Notes |
|---|---|---|
| `About us.jpg` | JPG | Full About Us page design mockup (~33 MB) |
| `Color Palette.docx` | DOCX | Brand color reference document |

### `Logo/`

| File | Type | Dimensions | Usage |
|---|---|---|---|
| `Lagom Design Logo.svg` | SVG | Vector | Primary logo — header, favicon source |
| `LOGO.png` | PNG | Raster | Logo fallback |

### `Home Page/`

| File / Folder | Type | Dimensions | Usage |
|---|---|---|---|
| `Arrow.svg` | SVG | Vector | Directional arrow icon |
| `Footer.jpg` | JPG | — | Footer background image |
| `Banner_ 1750 x 851px/` | JPG ×5 | 1750×851 | Hero / wide banner options (`1.jpg`–`5.jpg`) |
| `Banners_ 1200 x 628px/` | JPG ×5 | 1200×628 | Social / OG banner options (`1.jpg`–`5.jpg`) |
| `Banners_ 1680 x 1050px/` | JPG ×5 | 1680×1050 | Landscape banner options (`1.jpg`–`5.jpg`) |
| `Icons_ 150 x 150px/` | PNG ×6 | 150×150 source, display at 56px | Service icons (see below) |
| `Philosophy /` | PNG ×6 | — | Brand philosophy section images (`P1.png`–`P6.png`) |
| `Portrait_ 900 x 1200px/` | JPG ×2 | 900×1200 | Portrait photography (`P1.jpg`, `P2.jpg`) |
| `Square images_ 1024 x 1024px/` | JPG ×6 | 1024×1024 | Square portfolio/section images (`S1.jpg`–`S6.jpg`) |

#### Service Icons (`Icons_ 150 x 150px/`)

| File | Service |
|---|---|
| `Branding.png` | Branding |
| `Brand-Applications.png` | Brand Applications |
| `Packaging.png` | Packaging |
| `Illustration.png` | Illustration |
| `Web-design.png` | Web Design |
| `Social-media.png` | Social Media |

### `Services/`

| File | Type | Notes |
|---|---|---|
| `Services.jpg` | JPG | Full Services page design mockup (~53 MB) |

### `Client Work Pages/`

#### `Sunita Shekhawat/`

| File | Type | Notes |
|---|---|---|
| `Sunita Shekhawat Work Page.pdf` | PDF | Full work page layout reference |
| `Sunita-Shekhawat-Work-Page1.jpg` – `Work-Page18.jpg` | JPG ×18 | Exported work page screens |

### `Montserrat Font/`

Full Montserrat family in OTF format (Thin through Black, including italics). Used for headings.

### `Lora Font/`

Lora in TTF format: Regular, Italic, Bold, BoldItalic. Used for body copy.

---

## File Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout, fonts, metadata
│   └── ...
├── components/
│   ├── layout/           # Header, Footer, Navigation, SiteLayout
│   └── sections/         # Page sections
├── content/              # Site config, navigation data
├── lib/                  # Fonts, utilities
└── styles/
    └── global.css        # Tokens, reset, utilities
public/
└── assets/               # Copied client assets
imagesfromdrive/          # Original client asset delivery (reference)
docs/
└── Design-System.md      # This document
```

---

## Accessibility

### Contrast

- Primary text (`#3F493D`) on paper background (`#FFFCEB`) exceeds WCAG AA.
- Paper text on primary dark footer background meets contrast requirements.
- Secondary text uses 65% opacity — supporting content only.

### Keyboard Navigation

- All interactive elements are focusable.
- `:focus-visible` outline: 2px solid primary, 3px offset.

### Semantic HTML

- Use `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`, `<figure>`, `<blockquote>`.
- One `<h1>` per page, descending heading order.
- `.sr-only` utility for visually hidden accessible labels.

### Images

- Always provide descriptive `alt` text.
- Decorative images use `alt=""`.
- Specify `width` and `height` to prevent layout shift.

---

## Adding a New Page

1. Create `src/app/[route]/page.tsx` with page metadata.
2. Compose from section components using global utility classes.
3. Use `.container`, section rhythm, and spacing utilities — never ad-hoc padding.
4. Add CSS Module only for component-specific styles that cannot be expressed globally.
5. Add the route to `src/content/site.ts` navigation if needed.
