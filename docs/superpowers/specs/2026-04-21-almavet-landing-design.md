# Almavet Jerez — Landing page design spec

**Date:** 2026-04-21
**Branch:** `alexhoo/landing-redesign`
**Status:** Approved design, pending implementation plan
**Reference:** `.context/attachments/Almavet Jerez Landing Page.jpg`

## 1. Overview

Build a production-ready marketing landing page for **Almavet Jerez**, a veterinary clinic in Jerez de la Frontera (Spain), matching the reference screenshot. The site consists of:

- A single-page scrolling landing at `/` with anchor navigation.
- A separate appointment request page at `/reservar`.
- A post-submit confirmation page at `/gracias`.

Copy, contact details, and service names are taken verbatim from the reference screenshot. Obvious placeholders (e.g., `956 XX XX XX` phone number) are kept visible and marked with `TODO` comments for the client to update. Imagery ships as SVG placeholders with fixed dimensions and filenames; final JPGs will be dropped in later by the client following the README.

The project is greenfield — no existing source code. The `.gitignore` and `README.md` placeholders in the repo root are the only pre-existing files.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Astro 5.x** | Static site generation, islands architecture |
| UI framework | **React 19.x** (via `@astrojs/react`) | Only for interactive islands (form, mobile nav) |
| Styling | **Tailwind CSS v4.x** | Latest major; configured via `@theme` in CSS, no JS config |
| Tailwind integration | `@tailwindcss/vite` | Official v4 plugin (not `@astrojs/tailwind`, which is v3-era) |
| Package manager / task runner | **Bun 1.2+** (text `bun.lock`) | Also used in CI |
| Node compatibility | **Node 20 LTS** (`.nvmrc`) | Required by Astro for the build runtime |
| Form backend | **Web3Forms** | Free tier, public access_key, honeypot anti-spam |
| Fonts | **Plus Jakarta Sans** (Google Fonts) | Single family, loaded with `font-display: swap` |
| Deploy target | **Vercel** (Hobby tier) | Auto-detects Astro + `bun.lock` |
| CI | GitHub Actions | Runs `bun install --frozen-lockfile && bun run check && bun run build` |

No CMS, no analytics, no cookie banner, no i18n — explicitly out of scope (see §10).

## 3. Architecture and file structure

```
almavetjerez/
├── astro.config.mjs               Integrates React + Tailwind Vite plugin
├── package.json
├── tsconfig.json                  extends "astro/tsconfigs/strictest"
├── .nvmrc                         Node 20 LTS
├── .bun-version                   Bun 1.2+
├── bun.lock                       text lockfile (committed)
├── .env.example                   documents PUBLIC_WEB3FORMS_KEY
├── README.md                      dev instructions + image replacement guide
├── public/
│   ├── images/                    replaceable SVG placeholders
│   │   ├── hero-vet.svg           → swap for hero-vet.jpg (1200×900, 4:3)
│   │   ├── pets-group.svg         → swap for pets-group.jpg (1200×900, 4:3)
│   │   └── clinic-exterior.svg    → swap for clinic-exterior.jpg (1200×900, 4:3)
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── layouts/
    │   └── BaseLayout.astro       <html>, <head>, fonts, meta, Header, Footer, global CSS
    ├── pages/
    │   ├── index.astro            landing composition: Hero, PetCategories, Services, Location, CtaBanner
    │   ├── reservar.astro         wraps <AppointmentForm client:load />
    │   └── gracias.astro          post-submit confirmation, noindex
    ├── components/
    │   ├── Header.astro           logo + desktop nav + "Pedir Cita" button + MobileNav island
    │   ├── Hero.astro
    │   ├── PetCategories.astro
    │   ├── Services.astro
    │   ├── Location.astro
    │   ├── CtaBanner.astro
    │   ├── Footer.astro
    │   ├── ServiceCard.astro
    │   ├── PetCategoryChip.astro
    │   ├── InfoCard.astro
    │   ├── Icon.astro             single source of inline SVGs, props { name, class }
    │   └── react/
    │       ├── MobileNav.tsx      hamburger toggle + slide-in panel
    │       └── AppointmentForm.tsx  /reservar form, submits to Web3Forms
    ├── data/
    │   └── site.ts                single source of truth for copy, services, contact, etc.
    └── styles/
        └── global.css             @import "tailwindcss" + @theme block
```

### Key decisions

1. **`BaseLayout` renders `Header` and `Footer`** so every page (landing, `/reservar`, `/gracias`) gets them consistently. Page-specific content (`index.astro`, `reservar.astro`) only composes the middle sections.
2. **React islands live in `src/components/react/`** — a visible separation between static Astro components and hydrated React components, to discourage casual conversion.
3. **`Icon.astro` is the sole source of inline SVGs** — one component, switch over `name` prop, SVGs use `currentColor`. Inline SVG over icon fonts or `<img>` for color inheritance and zero extra requests.
4. **Content is centralized in `src/data/site.ts`** with `as const` for strong typing. Components import `site` (or granular exports like `services`, `petCategories`, `hours`). Avoids duplicating the phone number and email across three-plus components.
5. **Strict TypeScript** via `astro/tsconfigs/strictest`.

## 4. Design tokens (Tailwind v4)

All tokens declared in `src/styles/global.css` via a single `@theme` block. No `tailwind.config.js`.

### 4.1 Palette

| Token | Value | Primary use |
|---|---|---|
| `--color-brand-navy` | `#0f1d3a` | Headings, "ALMAVET" wordmark, footer bg, dark buttons |
| `--color-brand-blue` | `#2b7fff` | CTAs, links, service icons, underlines |
| `--color-brand-blue-600` | `#1e6fe8` | Hover state for `brand-blue` |
| `--color-brand-lavender` | `#c7b3e0` | "+10 años" badge |
| `--color-brand-sky` | `#eaf2ff` | Hero background, specialties section bg, icon squares |
| `--color-brand-slate` | `#5b6b85` | Body text on light backgrounds, secondary text |

Tailwind's default neutrals (white, gray-50…900, red-500 for form errors) are kept as-is.

Gradients (CTA banner) are composed from utilities (`bg-gradient-to-br from-brand-blue to-brand-blue-600`), not stored as tokens.

### 4.2 Typography

- Family: **Plus Jakarta Sans** via Google Fonts, loaded with `font-display: swap`.
- `--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;` — overrides Tailwind's default `font-sans`.
- Scale uses Tailwind defaults:

| Size | Typical use |
|---|---|
| `text-5xl` / `text-6xl` bold | Hero headline |
| `text-3xl` / `text-4xl` bold | Section titles |
| `text-xl` semibold | Card titles |
| `text-base` | Body copy |
| `text-sm` | Microcopy, chip labels |
| `text-xs uppercase tracking-widest` | Eyebrows |

### 4.3 Radii

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `8px` | Chips, small badges |
| `--radius-md` | `12px` | Buttons, inputs, icon squares |
| `--radius-lg` | `16px` | Service cards, InfoCards |
| `--radius-xl` | `24px` | Hero image container, CTA banner |
| `--radius-full` | `9999px` | Header "Pedir Cita" pill button |

### 4.4 Shadows

Tailwind defaults only: `shadow-sm` (cards at rest), `shadow-md` (cards over images), `shadow-xl` (card hover).

### 4.5 Layout

- Container: `max-w-6xl mx-auto px-6` (≈1152px max + 24px horizontal padding).
- Section vertical rhythm: `py-20 md:py-28` for major sections, `py-16` for compact ones.
- Services grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-5`.
- Pet categories: `grid-cols-2 md:grid-cols-4`.

### 4.6 `global.css` preview

```css
@import "tailwindcss";

@theme {
  --color-brand-navy: #0f1d3a;
  --color-brand-blue: #2b7fff;
  --color-brand-blue-600: #1e6fe8;
  --color-brand-lavender: #c7b3e0;
  --color-brand-sky: #eaf2ff;
  --color-brand-slate: #5b6b85;

  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

## 5. Data layer — `src/data/site.ts`

Single source of truth. Tipado con `as const` para autocompletado y type safety al consumir desde componentes (`.astro` y `.tsx`).

```ts
export const site = {
  name: "Almavet Jerez",
  tagline: "Centro Veterinario",
  phone: "956 XX XX XX",                       // TODO: confirmar número real
  phoneTel: "+34956000000",                    // TODO: formato tel: para href
  email: "info@almavetjerez.com",              // TODO: confirmar dirección real
  address: {
    street: "C/ Camarón de la Isla 2",
    zip: "11405",
    city: "Jerez de la Frontera",
  },
  hours: [
    { days: "Lunes a Viernes", ranges: ["09:30 – 13:30", "17:30 – 20:30"] },
  ],
  social: {
    facebook: "https://facebook.com/almavetjerez",    // TODO: confirmar URL real
    instagram: "https://instagram.com/almavetjerez",  // TODO: confirmar URL real
  },
  nav: [
    { label: "Servicios", href: "#servicios" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Contactos", href: "#ubicacion" },  // same section — Location holds contact info
  ],
  hero: {
    eyebrow: "Profesionales de confianza",
    title: "Cuidamos de los",
    titleAccent: "que más quieres",
    description: "En Almavet Jerez ofrecemos una atención veterinaria integral basada en el cuidado, la innovación y la excelencia clínica para tus mejores amigos.",
    primaryCta: { label: "Pedir Cita Online", href: "/reservar" },
    secondaryCta: { label: "Nuestros Servicios", href: "#servicios" },
    badge: { metric: "10+", label: "Años cuidando mascotas" },
  },
} as const;

export const services = [
  { id: "consultas", icon: "stethoscope", title: "Consultas",
    desc: "Atención personalizada y exhaustiva para el bienestar general de tu mascota." },
  { id: "medicina-preventiva", icon: "shield-heart", title: "Medicina Preventiva",
    desc: "Planes de vacunación, desparasitación y chequeos de salud regulares." },
  { id: "medicina-interna", icon: "activity", title: "Medicina Interna",
    desc: "Diagnóstico y tratamiento de patologías complejas de órganos internos." },
  { id: "analisis-clinicos", icon: "flask", title: "Análisis Clínicos",
    desc: "Laboratorio propio para obtener resultados rápidos y precisos en minutos." },
  { id: "diagnostico-imagen", icon: "scan", title: "Diagnóstico Imagen",
    desc: "Ecografía y radiología avanzada para un diagnóstico certero y temprano." },
] as const;

export const petCategories = [
  { icon: "dog", label: "Caninos" },
  { icon: "cat", label: "Felinos" },
  { icon: "bird", label: "Aves" },
  { icon: "reptile", label: "Exóticos" },
] as const;

export type Service = (typeof services)[number];
export type PetCategory = (typeof petCategories)[number];
```

Descriptions above are placeholders reasonable for a vet clinic; client can tighten during review.

## 6. Component breakdown

### 6.1 `BaseLayout.astro`
- `<html lang="es">`, `<head>` with meta tags, canonical, OG tags, fonts preload, global CSS import.
- Props: `{ title, description, ogImage?, noindex? }`.
- Renders `<Header />`, slot for page content, `<Footer />`.

### 6.2 `Header.astro`
- `<header>` sticky (`sticky top-0 z-50 bg-white/95 backdrop-blur`).
- Desktop: logo on left (wordmark + tagline), nav on right (anchor links + "Pedir Cita" pill button linking to `/reservar`).
- Mobile (<md): collapses to hamburger trigger that mounts `<MobileNav client:load />`.
- `<nav aria-label="Navegación principal">`.

### 6.3 `MobileNav.tsx` (React island)
- `useState<boolean>` for open/closed.
- Slide-in panel (`translate-x-full` → `translate-x-0` via Tailwind `transition-transform`).
- A11y: `aria-expanded`, `aria-controls`, focus trap on open, `Escape` closes.
- Hydration: `client:load` (immediate interactivity).

### 6.4 `Hero.astro`
- 2-col grid on desktop, stacked on mobile.
- Left: eyebrow (with bullet), `<h1>` split across two lines with `<span class="text-brand-blue">` highlight on "más quieres", description paragraph, two CTAs (primary + outline secondary).
- Right: image (`/public/images/hero-vet.svg`) in `rounded-3xl overflow-hidden` container, with absolute lavender badge `-bottom-6 -left-6` displaying "10+" and "Años cuidando mascotas".

### 6.5 `PetCategories.astro`
- 2-col grid. Left: title ("Especialistas en cada miembro de la familia") + subtitle + 4 chips rendered via `PetCategoryChip.astro`. Right: `pets-group.svg` placeholder in rounded container.
- Chips use `PetCategoryChip.astro` with props `{ icon, label }`.

### 6.6 `Services.astro` + `ServiceCard.astro`
- `<section id="servicios" aria-labelledby="servicios-title">`.
- Centered eyebrow "● ESPECIALIDADES", `<h2>` "Nuestros Servicios Médicos", decorative underline SVG.
- Grid of 5 `ServiceCard` components rendered from `services` array.
- `ServiceCard.astro` props: `{ icon, title, desc }`. Structure: icon in `brand-sky` square, bold title, muted description, card with `rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow`.

### 6.7 `Location.astro` + `InfoCard.astro`
- `<section id="ubicacion" aria-labelledby="ubicacion-title">`.
- 2-col grid. Left: title "Visítanos en Jerez" + 3 `InfoCard`s (Nuestra Clínica, Horario de Atención, Contacto Directo). Right: map image with overlaid white card "¿Cómo llegar?" + "Ver en Google Maps" button linking to `https://maps.google.com/?q=<encoded address>`.
- `InfoCard.astro` props: `{ icon, title }` + default slot for content.

### 6.8 `CtaBanner.astro`
- Full-width section with gradient background (`bg-gradient-to-br from-brand-blue to-brand-blue-600`).
- `<h2>¿Tu mascota necesita una revisión?</h2>`, subtitle, "Reservar Ahora" white button → `/reservar`, "Llamar: [phone]" link → `tel:`.
- Decorative blurred glow (`absolute bg-white/10 blur-3xl`) behind text.

### 6.9 `Footer.astro`
- `<footer role="contentinfo">`, `bg-brand-navy text-white`.
- 3-col grid: brand block (logo + description), "Enlaces Rápidos", "Contacto" (phone, email, social icons).
- Bottom bar: copyright "© 2026 Centro Veterinario Almavet Jerez. Todos los derechos reservados." + tagline.

### 6.10 `Icon.astro`
- Props: `{ name: IconName, class?: string }`.
- Inline SVG map keyed by `name`.
- Required icons: `dog`, `cat`, `bird`, `reptile`, `stethoscope`, `shield-heart`, `activity`, `flask`, `scan`, `map-pin`, `clock`, `phone`, `chevron-down`, `menu`, `x`, `mail`, `facebook`, `instagram`, `map`, `calendar-check`, `check-circle`.
- SVGs respect `currentColor` for CSS-driven coloring.
- Source: hand-crafted or from Lucide (MIT-licensed, hand-tuned SVG data copied inline).

## 7. `/reservar` page and Web3Forms integration

### 7.1 Pages

**`reservar.astro`:**
- Wrapped in `BaseLayout` with page-specific title/description.
- `<section class="max-w-2xl mx-auto py-20 px-6">` with `<h1>Reserva tu cita</h1>`, intro paragraph, and `<AppointmentForm client:load />`.

**`gracias.astro`:**
- Wrapped in `BaseLayout` with `noindex: true`.
- Centered success state: check-circle icon, `<h1>¡Solicitud recibida!</h1>`, explanatory paragraph, "Volver al inicio" button → `/`.

### 7.2 `AppointmentForm.tsx`

Fields (in order):

| Name | Type | Required | Notes |
|---|---|---|---|
| `name` | text | yes | minLength 2 |
| `phone` | tel | yes | `pattern="[0-9\\s+]{9,}"` |
| `email` | email | yes | HTML type validation |
| `pet_name` | text | yes | |
| `pet_type` | select | yes | Options: Perro, Gato, Ave, Otro |
| `service` | select | yes | Options: 5 services + "Otro / No estoy seguro" |
| `preferred_date` | date | yes | `min={today}` |
| `preferred_time` | select | yes | Options: Mañana (9:30–13:30), Tarde (17:30–20:30), Sin preferencia |
| `message` | textarea | no | maxLength 500 |

Hidden fields:

| Name | Value |
|---|---|
| `access_key` | `import.meta.env.PUBLIC_WEB3FORMS_KEY` |
| `from_name` | "Almavet Jerez Reservas" |
| `subject` | "Nueva solicitud de cita" |
| `redirect` | `` `${import.meta.env.PUBLIC_SITE_URL}/gracias` `` — absolute URL required by Web3Forms |
| `botcheck` | Empty honeypot (`display:none`) |

### 7.3 Submit flow

- `<form action="https://api.web3forms.com/submit" method="POST">` — real native fallback.
- `onSubmit`: `preventDefault`, `fetch` with FormData, on success `window.location.href = "/gracias"`, on failure show inline error.
- States: `"idle"` | `"submitting"` | `"error"`. No `"success"` state in-component (redirect exits).
- Button reflects state: enabled + "Solicitar cita" → disabled + spinner + "Enviando…" → enabled + error banner above form.

### 7.4 Graceful degradation without JS
Because `<form>` has real `action` and `method`, disabling JS still submits to Web3Forms, which honors the `redirect` field server-side. The React handler is pure enhancement.

### 7.5 Accessibility

- Explicit `<label htmlFor>` for each input.
- `aria-required="true"` on required fields.
- `aria-invalid` toggled on native validation failure.
- Error banner in `<div role="alert" aria-live="polite">`.
- Visible focus states via Tailwind `focus:ring-2 focus:ring-brand-blue`.

### 7.6 Configuration

Two environment variables, both prefixed `PUBLIC_` so Astro exposes them to the client bundle:

| Variable | Example value | Purpose |
|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | `abc123…` | Web3Forms access_key (public by design). |
| `PUBLIC_SITE_URL` | `https://almavetjerez.com` (prod) / `http://localhost:4321` (dev) | Absolute origin used to build the `redirect` URL for Web3Forms. |

- `.env` gitignored; `.env.example` committed documenting both variables with safe defaults.
- README describes obtaining a Web3Forms key from web3forms.com.
- Both variables set in the Vercel dashboard for production and preview environments.

### 7.7 Explicit non-goals for the form

No Zod, no React Hook Form, no file upload, no custom date picker, no CAPTCHA (honeypot + Web3Forms rate limiting suffices initially), no multi-step wizard, no async service list.

## 8. SEO baseline

Included from day one (not deferred):

- Per-page `<title>` and `<meta name="description">`.
- Open Graph tags in `BaseLayout` with sensible defaults; overridable via props.
- Canonical URL tag.
- JSON-LD schema.org `VeterinaryCare` block on `/` (name, address, phone, opening hours).
- `robots.txt` in `/public` allowing everything except `/gracias`.
- `sitemap.xml` auto-generated via `@astrojs/sitemap` integration.
- `<meta name="robots" content="noindex">` on `/gracias`.

## 9. Verification and deploy

### 9.1 `package.json` scripts

```jsonc
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "typecheck": "tsc --noEmit",
    "lint": "prettier --check ."
  }
}
```

All run via `bun run <script>`.

### 9.2 Pre-merge gates

1. `bun run check` → zero errors, zero warnings.
2. `bun run build` → successful, no Tailwind warnings about unknown classes.
3. `bun run preview` → manual inspection:
   - Desktop 1440×900 parity with reference screenshot.
   - Tablet 768×1024 — grid responds (5-col services → 2-col, etc.).
   - Mobile 375×667 — MobileNav functional, no horizontal overflow.
4. End-to-end clickthrough: Header `Pedir Cita` → `/reservar` → fill form → submit → `/gracias`.
5. No-JS smoke test: disable JS, reload `/`, everything renders; `/reservar` form still submits via native POST.
6. Lighthouse (from DevTools): Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO ≥95.

### 9.3 CI — GitHub Actions

Single workflow on push to any branch:

```yaml
- uses: oven-sh/setup-bun@v1
  with: { bun-version: latest }
- run: bun install --frozen-lockfile
- run: bun run check
- run: bun run build
```

### 9.4 Deploy — Vercel

- Target: **Vercel Hobby tier**.
- No `@astrojs/vercel` adapter — site is pure static, `dist/` served as static files.
- Framework preset: Astro (auto-detected).
- Build command: `bun run build` (default works; explicit for clarity).
- Output directory: `dist` (default).
- Install command: auto-detected via `bun.lock` (Vercel runs `bun install` if lockfile present).
- Environment variables (set in dashboard):
  - `PUBLIC_WEB3FORMS_KEY`
  - `PUBLIC_SITE_URL` (production URL, or Vercel-provided URL until custom domain is attached)
- Preview deploys per branch automatically.
- Final domain: client to provide (likely `almavetjerez.com` or `.es`) — post-launch, out of initial scope.

### 9.5 Tests

- No unit tests initially. Vitest + Testing Library to be added only when `AppointmentForm` grows conditional logic or the data layer gets computed transforms.

## 10. Out of scope (explicit)

The following are **not** part of this spec and should be separate specs when/if needed:

- Analytics (GA, Plausible, Fathom).
- Cookie banner.
- Blog, news, or case studies section.
- CMS integration.
- Multilanguage (i18n).
- PWA / service worker.
- Booking calendar with live slot selection (currently contact-form-only; could be replaced by Cal.com later).
- Custom domain configuration.
- Real brand photos (SVG placeholders ship now; JPGs dropped in by client later).

## 11. Open TODOs tracked in code

These show up as `TODO:` comments in the final output:

- Real phone number (currently `956 XX XX XX`).
- Real email address (currently `info@almavetjerez.com`).
- Real address (currently `C/ Camarón de la Isla 2, 11405, Jerez de la Frontera`).
- Real opening hours (currently `L-V 09:30-13:30, 17:30-20:30`).
- Real social URLs (Facebook, Instagram).
- Final copy tuning per section.
- Final service descriptions (currently reasonable-placeholder).
- Replace SVG placeholder images with real JPGs respecting dimensions in README.
- Web3Forms access_key (via `.env` or Vercel env var).
