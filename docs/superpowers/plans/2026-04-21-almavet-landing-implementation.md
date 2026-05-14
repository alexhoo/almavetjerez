# Almavet Jerez Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Astro + React + Tailwind v4 landing page for a veterinary clinic, matching the approved reference screenshot, with a Web3Forms-backed appointment request page, deployable to Vercel.

**Architecture:** Static Astro site (zero JS by default) with two hydrated React islands — `MobileNav` for the mobile menu toggle and `AppointmentForm` for the reservation form. A single `src/data/site.ts` module is the authoritative source of copy and contact data; all components read from it. Placeholder SVG images ship in `/public/images/` with fixed dimensions so the client can drop in real JPGs later without layout shifts.

**Tech Stack:** Astro 5.x, React 19, `@astrojs/react`, Tailwind CSS v4 (via `@tailwindcss/vite`), `@astrojs/sitemap`, Plus Jakarta Sans (Google Fonts), Web3Forms, Bun 1.2+, Node 20 LTS, TypeScript strict.

**Reference spec:** `docs/superpowers/specs/2026-04-21-almavet-landing-design.md`
**Reference screenshot:** `.context/attachments/Almavet Jerez Landing Page.jpg`

## TDD note for this plan

This is a static marketing site. The spec (§9.5) explicitly defers unit tests until the codebase grows testable logic. We therefore adapt TDD to **verification-driven development**: each task pairs a change with a concrete verification step (`bun run check`, `bun run build`, or browser inspection with explicit acceptance criteria). Each task ends with a commit. The discipline is preserved — every change has a check — only the shape differs.

---

## File structure (final target)

```
almavetjerez/
├── .bun-version
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore                    (already exists, extended)
├── .nvmrc
├── README.md                     (already exists, replaced)
├── astro.config.mjs
├── bun.lock                      (generated; committed)
├── docs/superpowers/
│   ├── plans/2026-04-21-almavet-landing-implementation.md   (this file)
│   └── specs/2026-04-21-almavet-landing-design.md
├── package.json
├── public/
│   ├── favicon.svg
│   ├── images/
│   │   ├── clinic-exterior.svg
│   │   ├── hero-vet.svg
│   │   └── pets-group.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── CtaBanner.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Icon.astro
│   │   ├── InfoCard.astro
│   │   ├── Location.astro
│   │   ├── PetCategories.astro
│   │   ├── PetCategoryChip.astro
│   │   ├── ServiceCard.astro
│   │   ├── Services.astro
│   │   └── react/
│   │       ├── AppointmentForm.tsx
│   │       └── MobileNav.tsx
│   ├── data/
│   │   └── site.ts
│   ├── env.d.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── gracias.astro
│   │   ├── index.astro
│   │   └── reservar.astro
│   └── styles/
│       └── global.css
└── tsconfig.json
```

Not yet existing on disk: everything except `.gitignore`, `README.md`, `docs/superpowers/specs/`, and `docs/superpowers/plans/`.

---

## Task 1: Initialize `package.json` and install dependencies

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `.bun-version`
- Generate: `bun.lock`, `node_modules/`

- [ ] **Step 1: Verify starting state**

Run: `ls -la`
Expected: `.git/`, `.gitignore`, `.context/`, `docs/`, `README.md` present. No `package.json`, no `node_modules/`.

- [ ] **Step 2: Create `package.json`**

Content:

```json
{
  "name": "almavetjerez",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "typecheck": "tsc --noEmit",
    "lint": "prettier --check ."
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.0",
    "typescript": "^5.6.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 3: Create `.nvmrc`**

Content:

```
20
```

- [ ] **Step 4: Create `.bun-version`**

Content:

```
1.2.0
```

- [ ] **Step 5: Install dependencies**

Run: `bun install`
Expected: "✓ Installed X packages" message, `bun.lock` file created, `node_modules/` populated. Exit code 0.

- [ ] **Step 6: Update `.gitignore`**

Read existing `.gitignore`. Append a new block at the end:

```
# Astro
.astro/

# Environment
.env
.env.local
```

Note: `node_modules/`, `dist/`, `build/`, `.env` entries may already exist from the original `.gitignore` — do not duplicate if so.

- [ ] **Step 7: Verify `bun.lock` is text format**

Run: `file bun.lock`
Expected: output contains "ASCII text" or "UTF-8 Unicode text". If it shows "data" (binary), Bun version is too old — upgrade Bun to 1.2+.

- [ ] **Step 8: Commit**

```bash
git add package.json bun.lock .nvmrc .bun-version .gitignore
git commit -m "chore: initialize Bun + Astro project scaffolding"
```

---

## Task 2: Create Astro and TypeScript configuration

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`

- [ ] **Step 1: Create `astro.config.mjs`**

Content:

```js
// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Update `site` to the real production URL before first prod deploy.
export default defineConfig({
  site: "https://almavetjerez.com",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 2: Create `tsconfig.json`**

Content:

```json
{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "~/*": ["src/*"]
    },
    "types": ["astro/client"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create `src/env.d.ts`**

Content:

```ts
/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_WEB3FORMS_KEY: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Verify type check passes on empty project**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints." (The "No pages found" note is normal at this stage.)

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs tsconfig.json src/env.d.ts
git commit -m "chore: configure Astro + React + Tailwind v4 + sitemap"
```

---

## Task 3: Set up Tailwind v4 with theme tokens

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

Content:

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

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}

/* Respect reduced-motion preference */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Print: hide the header sticky behavior */
@media print {
  .sticky {
    position: static;
  }
}
```

- [ ] **Step 2: Verify the configuration parses correctly**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints." (`astro check` runs without needing any pages; it will validate the config and CSS imports as components get added later.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Tailwind v4 global CSS with brand theme tokens"
```

---

## Task 4: Create the central data module `src/data/site.ts`

**Files:**
- Create: `src/data/site.ts`

- [ ] **Step 1: Create `src/data/site.ts`**

Content:

```ts
export const site = {
  name: "Almavet Jerez",
  tagline: "Centro Veterinario",
  // TODO: confirm real phone number
  phone: "956 XX XX XX",
  // TODO: confirm real phone number (tel: href format, E.164)
  phoneTel: "+34956000000",
  // TODO: confirm real email address
  email: "info@almavetjerez.com",
  address: {
    street: "C/ Camarón de la Isla 2",
    zip: "11405",
    city: "Jerez de la Frontera",
    country: "España",
  },
  hours: [
    {
      days: "Lunes a Viernes",
      ranges: ["09:30 – 13:30", "17:30 – 20:30"],
    },
  ],
  social: {
    // TODO: confirm real Facebook URL
    facebook: "https://facebook.com/almavetjerez",
    // TODO: confirm real Instagram URL
    instagram: "https://instagram.com/almavetjerez",
  },
  nav: [
    { label: "Servicios", href: "#servicios" },
    { label: "Ubicación", href: "#ubicacion" },
    { label: "Contactos", href: "#ubicacion" },
  ],
  hero: {
    eyebrow: "Profesionales de confianza",
    titleLine1: "Cuidamos de los",
    titleLine2Prefix: "que ",
    titleLine2Accent: "más quieres",
    description:
      "En Almavet Jerez ofrecemos una atención veterinaria integral basada en el cuidado, la innovación y la excelencia clínica para tus mejores amigos.",
    primaryCta: { label: "Pedir Cita Online", href: "/reservar" },
    secondaryCta: { label: "Nuestros Servicios", href: "#servicios" },
    badge: { metric: "10+", label: "Años cuidando mascotas" },
    imagePath: "/images/hero-vet.svg",
    imageAlt: "Veterinaria abrazando a un perro labrador",
  },
  petCategoriesSection: {
    title: "Especialistas en cada miembro de la familia",
    description:
      "Desde los más pequeños hasta los más juguetones, nuestro equipo está preparado para brindar el mejor cuidado a perros, gatos, aves y exóticos.",
    imagePath: "/images/pets-group.svg",
    imageAlt: "Dos perros y un gato sentados juntos",
  },
  servicesSection: {
    eyebrow: "Especialidades",
    title: "Nuestros Servicios Médicos",
  },
  locationSection: {
    title: "Visítanos en Jerez",
    imagePath: "/images/clinic-exterior.svg",
    imageAlt: "Exterior de la clínica Almavet Jerez",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Almavet+Jerez+de+la+Frontera",
  },
  cta: {
    title: "¿Tu mascota necesita una revisión?",
    description:
      "No esperes a que surjan problemas. La prevención es la base de una vida larga y feliz. Reserva hoy mismo con nuestros especialistas.",
    primaryCta: { label: "Reservar Ahora", href: "/reservar" },
  },
  footer: {
    description:
      "Comprometidos con la salud y el bienestar animal en Jerez de la Frontera. Ofrecemos equipamiento tecnológico de vanguardia y un equipo humano con alma para el cuidado de tu mascota.",
    copyright: "© 2026 Centro Veterinario Almavet Jerez. Todos los derechos reservados.",
    tagline: "Cuidando de tu ♥ y de su lealtad.",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Servicios", href: "#servicios" },
      { label: "Contactos", href: "#ubicacion" },
      { label: "Política de Privacidad", href: "/politica-privacidad" },
    ],
  },
} as const;

export const services = [
  {
    id: "consultas",
    icon: "stethoscope",
    title: "Consultas",
    desc: "Atención personalizada y exhaustiva para el bienestar general de tu mascota.",
  },
  {
    id: "medicina-preventiva",
    icon: "shield-heart",
    title: "Medicina Preventiva",
    desc: "Planes de vacunación, desparasitación y chequeos de salud regulares.",
  },
  {
    id: "medicina-interna",
    icon: "activity",
    title: "Medicina Interna",
    desc: "Diagnóstico y tratamiento de patologías complejas de órganos internos.",
  },
  {
    id: "analisis-clinicos",
    icon: "flask",
    title: "Análisis Clínicos",
    desc: "Laboratorio propio para obtener resultados rápidos y precisos en minutos.",
  },
  {
    id: "diagnostico-imagen",
    icon: "scan",
    title: "Diagnóstico Imagen",
    desc: "Ecografía y radiología avanzada para un diagnóstico certero y temprano.",
  },
] as const;

export const petCategories = [
  { icon: "dog", label: "Caninos" },
  { icon: "cat", label: "Felinos" },
  { icon: "bird", label: "Aves" },
  { icon: "reptile", label: "Exóticos" },
] as const;

export type Service = (typeof services)[number];
export type PetCategory = (typeof petCategories)[number];
export type NavItem = (typeof site.nav)[number];
export type FooterLink = (typeof site.footer.links)[number];
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/data/site.ts
git commit -m "feat: add site.ts data module as single source of truth"
```

---

## Task 5: Create the `Icon.astro` component with all inline SVGs

**Files:**
- Create: `src/components/Icon.astro`

- [ ] **Step 1: Create `src/components/Icon.astro`**

Content:

```astro
---
interface Props {
  name: IconName;
  class?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export type IconName =
  | "stethoscope"
  | "shield-heart"
  | "activity"
  | "flask"
  | "scan"
  | "dog"
  | "cat"
  | "bird"
  | "reptile"
  | "map-pin"
  | "clock"
  | "phone"
  | "menu"
  | "x"
  | "mail"
  | "facebook"
  | "instagram"
  | "map"
  | "calendar-check"
  | "check-circle"
  | "paw"
  | "bullet";

const { name, class: className = "w-5 h-5", "aria-hidden": ariaHidden = "true" } = Astro.props;
---

{name === "stethoscope" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>
  </svg>
)}
{name === "shield-heart" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.79 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 15.5c-3-2-4.5-3.5-4.5-5.5a2 2 0 0 1 2-2c1 0 1.75.5 2.5 1.5.75-1 1.5-1.5 2.5-1.5a2 2 0 0 1 2 2c0 2-1.5 3.5-4.5 5.5z"/>
  </svg>
)}
{name === "activity" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.5.5 0 0 1-.96 0L9.24 3.18a.5.5 0 0 0-.96 0l-2.35 8.36A2 2 0 0 1 4 13H2"/>
  </svg>
)}
{name === "flask" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.58 16.5h12.85"/>
  </svg>
)}
{name === "scan" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>
  </svg>
)}
{name === "dog" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3.059c-.823.163-1.605.534-2.171 1.071-.582.556-.89 1.24-.753 1.94.114.592.442 1.121.87 1.532.433.416.97.73 1.554.91V21h6V10.586"/><path d="M19.5 3.059C21.423 2.679 23 3.782 23 5.172v1.086a2.75 2.75 0 0 1-2.75 2.75H19"/><path d="M15 9h1a1 1 0 0 1 1 1v2"/><circle cx="14.5" cy="13.5" r=".5"/>
  </svg>
)}
{name === "cat" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75"/>
  </svg>
)}
{name === "bird" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/>
  </svg>
)}
{name === "reptile" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M7 5c1.5-1 3-1 5-1s3.5 0 5 1"/>
  </svg>
)}
{name === "map-pin" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)}
{name === "clock" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)}
{name === "phone" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)}
{name === "menu" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
)}
{name === "x" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)}
{name === "mail" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)}
{name === "facebook" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)}
{name === "instagram" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)}
{name === "map" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>
  </svg>
)}
{name === "calendar-check" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>
  </svg>
)}
{name === "check-circle" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
)}
{name === "paw" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="5" cy="13" r="2"/><circle cx="19" cy="13" r="2"/><path d="M12 21c-4 0-5-3-5-5 0-2 1.5-4 5-4s5 2 5 4c0 2-1 5-5 5z"/>
  </svg>
)}
{name === "bullet" && (
  <svg class={className} aria-hidden={ariaHidden} viewBox="0 0 8 8" fill="currentColor">
    <circle cx="4" cy="4" r="4"/>
  </svg>
)}
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/Icon.astro
git commit -m "feat: add Icon component with inline SVG library"
```

---

## Task 6: Create `BaseLayout.astro`

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create `src/layouts/BaseLayout.astro`**

Content:

```astro
---
import "~/styles/global.css";
import { site } from "~/data/site";

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  noindex?: boolean;
  canonicalPath?: string;
}

const {
  title,
  description,
  ogImage = "/images/hero-vet.svg",
  noindex = false,
  canonicalPath,
} = Astro.props;

const siteUrl = Astro.site?.toString().replace(/\/$/, "") ?? "";
const canonical = canonicalPath ? `${siteUrl}${canonicalPath}` : Astro.url.href;
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex" />}

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={`${siteUrl}${ogImage}`} />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:locale" content="es_ES" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <slot name="head" />
  </head>
  <body class="bg-white text-brand-navy font-sans antialiased">
    <slot name="header" />
    <main id="main-content">
      <slot />
    </main>
    <slot name="footer" />
  </body>
</html>
```

**Note:** `Header` and `Footer` are injected via named slots rather than rendered here directly. This keeps `BaseLayout` reusable for edge cases (e.g., a full-bleed landing page without header). Pages will pass them explicitly — adds 2 lines per page but removes a hidden dependency.

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add BaseLayout with SEO tags, fonts, and slots"
```

---

## Task 7: Create `MobileNav.tsx` React island

**Files:**
- Create: `src/components/react/MobileNav.tsx`

- [ ] **Step 1: Create `src/components/react/MobileNav.tsx`**

Content:

```tsx
import { useEffect, useRef, useState } from "react";

interface MobileNavProps {
  nav: ReadonlyArray<{ readonly label: string; readonly href: string }>;
  ctaLabel: string;
  ctaHref: string;
}

export default function MobileNav({ nav, ctaLabel, ctaHref }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      firstLinkRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setIsOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-brand-navy hover:bg-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        {isOpen ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-brand-navy/40 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-200 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Cerrar menú"
              className="inline-flex items-center justify-center w-10 h-10 rounded-md text-brand-navy hover:bg-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
            {nav.map((item, idx) => (
              <a
                key={item.href}
                ref={idx === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-3 rounded-md text-lg font-medium text-brand-navy hover:bg-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <a
              href={ctaHref}
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-6 py-3 rounded-full bg-brand-blue text-white font-semibold hover:bg-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/react/MobileNav.tsx
git commit -m "feat: add MobileNav React island with focus management"
```

---

## Task 8: Create `Header.astro`

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: Create `src/components/Header.astro`**

Content:

```astro
---
import { site } from "~/data/site";
import Icon from "~/components/Icon.astro";
import MobileNav from "~/components/react/MobileNav.tsx";
---
<header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/60">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 shrink-0" aria-label={`${site.name}, ir al inicio`}>
      <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue text-white">
        <Icon name="paw" class="w-5 h-5" />
      </span>
      <span class="flex flex-col leading-tight">
        <span class="font-extrabold text-brand-navy tracking-tight">
          ALMAVET <span class="text-brand-blue">JEREZ</span>
        </span>
        <span class="text-[10px] uppercase tracking-widest text-brand-slate">
          {site.tagline}
        </span>
      </span>
    </a>

    <nav aria-label="Navegación principal" class="hidden md:flex items-center gap-8">
      {site.nav.map((item) => (
        <a
          href={item.href}
          class="text-sm font-medium text-brand-slate hover:text-brand-navy transition-colors"
        >
          {item.label}
        </a>
      ))}
      <a
        href="/reservar"
        class="px-5 py-2 rounded-full bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
      >
        Pedir Cita
      </a>
    </nav>

    <MobileNav
      client:load
      nav={site.nav}
      ctaLabel="Pedir Cita"
      ctaHref="/reservar"
    />
  </div>
</header>
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add Header with sticky nav and mobile island"
```

---

## Task 9: Create placeholder SVG images

**Files:**
- Create: `public/favicon.svg`
- Create: `public/images/hero-vet.svg`
- Create: `public/images/pets-group.svg`
- Create: `public/images/clinic-exterior.svg`

- [ ] **Step 1: Create `public/favicon.svg`**

Content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#2b7fff"/>
  <g fill="#ffffff">
    <circle cx="10" cy="11" r="2.5"/>
    <circle cx="22" cy="11" r="2.5"/>
    <circle cx="7" cy="17" r="2.5"/>
    <circle cx="25" cy="17" r="2.5"/>
    <path d="M16 26c-5 0-6.5-3.5-6.5-6 0-2.5 2-4.5 6.5-4.5s6.5 2 6.5 4.5c0 2.5-1.5 6-6.5 6z"/>
  </g>
</svg>
```

- [ ] **Step 2: Create `public/images/hero-vet.svg`**

Content (explicit 1200×900 ratio, visibly a placeholder):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Placeholder — veterinaria con labrador">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eaf2ff"/>
      <stop offset="1" stop-color="#c7b3e0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g1)"/>
  <g fill="#0f1d3a" font-family="system-ui, sans-serif" text-anchor="middle">
    <text x="600" y="430" font-size="56" font-weight="700">PLACEHOLDER</text>
    <text x="600" y="490" font-size="32" font-weight="500" opacity="0.7">/images/hero-vet.jpg</text>
    <text x="600" y="540" font-size="22" opacity="0.55">Replace with 1200×900 JPG — veterinaria + perro</text>
  </g>
</svg>
```

- [ ] **Step 3: Create `public/images/pets-group.svg`**

Content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Placeholder — grupo de mascotas">
  <defs>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eaf2ff"/>
      <stop offset="1" stop-color="#2b7fff" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g2)"/>
  <g fill="#0f1d3a" font-family="system-ui, sans-serif" text-anchor="middle">
    <text x="600" y="430" font-size="56" font-weight="700">PLACEHOLDER</text>
    <text x="600" y="490" font-size="32" font-weight="500" opacity="0.7">/images/pets-group.jpg</text>
    <text x="600" y="540" font-size="22" opacity="0.55">Replace with 1200×900 JPG — dos perros + un gato</text>
  </g>
</svg>
```

- [ ] **Step 4: Create `public/images/clinic-exterior.svg`**

Content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Placeholder — exterior de la clínica">
  <defs>
    <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c7b3e0"/>
      <stop offset="1" stop-color="#eaf2ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#g3)"/>
  <g fill="#0f1d3a" font-family="system-ui, sans-serif" text-anchor="middle">
    <text x="600" y="430" font-size="56" font-weight="700">PLACEHOLDER</text>
    <text x="600" y="490" font-size="32" font-weight="500" opacity="0.7">/images/clinic-exterior.jpg</text>
    <text x="600" y="540" font-size="22" opacity="0.55">Replace with 1200×900 JPG — fachada o mapa clínica</text>
  </g>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add public/favicon.svg public/images/
git commit -m "feat: add SVG placeholder images with explicit 1200x900 contracts"
```

---

## Task 10: Create `Hero.astro`

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

Content:

```astro
---
import { site } from "~/data/site";
import Icon from "~/components/Icon.astro";

const { hero } = site;
---
<section class="bg-brand-sky">
  <div class="max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
    <div>
      <p class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue mb-6">
        <Icon name="bullet" class="w-2 h-2" />
        {hero.eyebrow}
      </p>
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy leading-[1.05] tracking-tight">
        {hero.titleLine1}
        <br />
        {hero.titleLine2Prefix}
        <span class="relative inline-block text-brand-blue">
          {hero.titleLine2Accent}
          <svg
            class="absolute -bottom-2 left-0 w-full text-brand-blue/40"
            viewBox="0 0 200 10"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path d="M2 8 Q 100 -2 198 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </span>
      </h1>
      <p class="mt-6 text-base md:text-lg text-brand-slate max-w-lg">
        {hero.description}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href={hero.primaryCta.href}
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white font-semibold hover:bg-brand-blue transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
        >
          <Icon name="calendar-check" class="w-5 h-5" />
          {hero.primaryCta.label}
        </a>
        <a
          href={hero.secondaryCta.href}
          class="inline-flex items-center px-6 py-3 rounded-xl bg-white text-brand-navy font-semibold border border-slate-200 hover:border-brand-navy transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
        >
          {hero.secondaryCta.label}
        </a>
      </div>
    </div>

    <div class="relative">
      <div class="rounded-3xl overflow-hidden shadow-xl bg-white">
        <img
          src={hero.imagePath}
          alt={hero.imageAlt}
          width="1200"
          height="900"
          class="w-full h-full object-cover aspect-[4/3]"
        />
      </div>
      <div class="absolute -bottom-6 -left-6 bg-brand-lavender rounded-2xl px-6 py-4 shadow-lg">
        <div class="text-3xl font-extrabold text-brand-navy leading-none">
          {hero.badge.metric}
        </div>
        <div class="text-xs font-medium text-brand-navy mt-1 max-w-[8rem] leading-tight">
          {hero.badge.label}
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero section with headline, badge, and CTAs"
```

---

## Task 11: Create `PetCategoryChip.astro` and `PetCategories.astro`

**Files:**
- Create: `src/components/PetCategoryChip.astro`
- Create: `src/components/PetCategories.astro`

- [ ] **Step 1: Create `src/components/PetCategoryChip.astro`**

Content:

```astro
---
import Icon, { type IconName } from "~/components/Icon.astro";

interface Props {
  icon: IconName;
  label: string;
}

const { icon, label } = Astro.props;
---
<div class="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-slate-200/60">
  <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-sky text-brand-blue">
    <Icon name={icon} class="w-4 h-4" />
  </span>
  <span class="text-sm font-medium text-brand-navy">{label}</span>
</div>
```

- [ ] **Step 2: Create `src/components/PetCategories.astro`**

Content:

```astro
---
import { site, petCategories } from "~/data/site";
import PetCategoryChip from "~/components/PetCategoryChip.astro";

const section = site.petCategoriesSection;
---
<section class="bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
    <div class="order-2 lg:order-1">
      <h2 class="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
        {section.title}
      </h2>
      <p class="mt-4 text-base text-brand-slate max-w-lg">
        {section.description}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        {petCategories.map((cat) => (
          <PetCategoryChip icon={cat.icon} label={cat.label} />
        ))}
      </div>
    </div>
    <div class="order-1 lg:order-2">
      <div class="rounded-3xl overflow-hidden shadow-lg">
        <img
          src={section.imagePath}
          alt={section.imageAlt}
          width="1200"
          height="900"
          class="w-full h-full object-cover aspect-[4/3]"
        />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 4: Commit**

```bash
git add src/components/PetCategoryChip.astro src/components/PetCategories.astro
git commit -m "feat: add PetCategories section with category chips"
```

---

## Task 12: Create `ServiceCard.astro` and `Services.astro`

**Files:**
- Create: `src/components/ServiceCard.astro`
- Create: `src/components/Services.astro`

- [ ] **Step 1: Create `src/components/ServiceCard.astro`**

Content:

```astro
---
import Icon, { type IconName } from "~/components/Icon.astro";

interface Props {
  icon: IconName;
  title: string;
  desc: string;
}

const { icon, title, desc } = Astro.props;
---
<article class="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
  <span class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-sky text-brand-blue">
    <Icon name={icon} class="w-6 h-6" />
  </span>
  <h3 class="text-base font-semibold text-brand-navy">{title}</h3>
  <p class="text-sm text-brand-slate leading-relaxed">{desc}</p>
</article>
```

- [ ] **Step 2: Create `src/components/Services.astro`**

Content:

```astro
---
import { site, services } from "~/data/site";
import ServiceCard from "~/components/ServiceCard.astro";
import Icon from "~/components/Icon.astro";

const section = site.servicesSection;
---
<section id="servicios" aria-labelledby="servicios-title" class="bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20 md:py-28">
    <div class="text-center mb-12">
      <p class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue">
        <Icon name="bullet" class="w-2 h-2" />
        {section.eyebrow}
      </p>
      <h2 id="servicios-title" class="mt-3 text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
        {section.title}
      </h2>
      <div class="mt-4 mx-auto w-16 h-1 rounded-full bg-brand-blue"></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {services.map((s) => (
        <ServiceCard icon={s.icon} title={s.title} desc={s.desc} />
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 4: Commit**

```bash
git add src/components/ServiceCard.astro src/components/Services.astro
git commit -m "feat: add Services section with 5 medical service cards"
```

---

## Task 13: Create `InfoCard.astro` and `Location.astro`

**Files:**
- Create: `src/components/InfoCard.astro`
- Create: `src/components/Location.astro`

- [ ] **Step 1: Create `src/components/InfoCard.astro`**

Content:

```astro
---
import Icon, { type IconName } from "~/components/Icon.astro";

interface Props {
  icon: IconName;
  title: string;
}

const { icon, title } = Astro.props;
---
<div class="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
  <span class="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-sky text-brand-blue">
    <Icon name={icon} class="w-5 h-5" />
  </span>
  <div class="min-w-0">
    <div class="text-sm font-semibold text-brand-navy mb-1">{title}</div>
    <div class="text-sm text-brand-slate leading-relaxed">
      <slot />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create `src/components/Location.astro`**

Content:

```astro
---
import { site } from "~/data/site";
import InfoCard from "~/components/InfoCard.astro";
import Icon from "~/components/Icon.astro";

const section = site.locationSection;
const { address, hours, phone, phoneTel, email } = site;
---
<section id="ubicacion" aria-labelledby="ubicacion-title" class="bg-brand-sky/40">
  <div class="max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
    <div>
      <h2 id="ubicacion-title" class="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight mb-8">
        {section.title}
      </h2>
      <div class="flex flex-col gap-4">
        <InfoCard icon="map-pin" title="Nuestra Clínica">
          {address.street}<br />
          {address.zip} {address.city}
        </InfoCard>
        <InfoCard icon="clock" title="Horario de Atención">
          {hours.map((h) => (
            <div>
              <span class="font-medium text-brand-navy">{h.days}:</span>{" "}
              {h.ranges.join(" y ")}
            </div>
          ))}
        </InfoCard>
        <InfoCard icon="phone" title="Contacto Directo">
          <a href={`tel:${phoneTel}`} class="text-brand-blue hover:underline">
            {phone}
          </a>
          <br />
          <a href={`mailto:${email}`} class="text-brand-blue hover:underline">
            {email}
          </a>
        </InfoCard>
      </div>
    </div>
    <div class="relative">
      <div class="rounded-3xl overflow-hidden shadow-lg">
        <img
          src={section.imagePath}
          alt={section.imageAlt}
          width="1200"
          height="900"
          class="w-full h-full object-cover aspect-[4/3]"
        />
      </div>
      <div class="absolute bottom-6 right-6 left-6 md:left-auto md:max-w-sm bg-white rounded-2xl p-5 shadow-xl">
        <div class="flex items-start gap-3">
          <span class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-sky text-brand-blue">
            <Icon name="map" class="w-5 h-5" />
          </span>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-brand-navy mb-1">
              ¿Cómo llegar?
            </div>
            <p class="text-xs text-brand-slate mb-3">
              Te esperamos con los brazos abiertos en nuestra clínica en Jerez.
            </p>
            <a
              href={section.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue-600 transition-colors"
            >
              <Icon name="map-pin" class="w-3.5 h-3.5" />
              Ver en Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 4: Commit**

```bash
git add src/components/InfoCard.astro src/components/Location.astro
git commit -m "feat: add Location section with InfoCards and map overlay"
```

---

## Task 14: Create `CtaBanner.astro`

**Files:**
- Create: `src/components/CtaBanner.astro`

- [ ] **Step 1: Create `src/components/CtaBanner.astro`**

Content:

```astro
---
import { site } from "~/data/site";

const { cta, phone, phoneTel } = site;
---
<section aria-label="Llamada a la acción" class="relative overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-600">
  <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" aria-hidden="true"></div>
  <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" aria-hidden="true"></div>
  <div class="relative max-w-3xl mx-auto px-6 py-16 md:py-20 text-center">
    <h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
      {cta.title}
    </h2>
    <p class="mt-4 text-base md:text-lg text-white/90 max-w-xl mx-auto">
      {cta.description}
    </p>
    <div class="mt-8 flex flex-wrap gap-4 justify-center items-center">
      <a
        href={cta.primaryCta.href}
        class="inline-flex items-center px-6 py-3 rounded-xl bg-white text-brand-navy font-semibold hover:bg-brand-sky transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-blue"
      >
        {cta.primaryCta.label}
      </a>
      <a
        href={`tel:${phoneTel}`}
        class="inline-flex items-center gap-2 text-white font-semibold hover:underline"
      >
        <span class="opacity-80">Llamar:</span> {phone}
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/CtaBanner.astro
git commit -m "feat: add CtaBanner with gradient background and dual CTAs"
```

---

## Task 15: Create `Footer.astro`

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

Content:

```astro
---
import { site } from "~/data/site";
import Icon from "~/components/Icon.astro";

const { name, tagline, footer, phone, phoneTel, email, social } = site;
---
<footer role="contentinfo" class="bg-brand-navy text-white">
  <div class="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
    <div>
      <div class="flex items-center gap-2 mb-4">
        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue">
          <Icon name="paw" class="w-5 h-5 text-white" />
        </span>
        <span class="flex flex-col leading-tight">
          <span class="font-extrabold tracking-tight">
            ALMAVET <span class="text-brand-lavender">JEREZ</span>
          </span>
          <span class="text-[10px] uppercase tracking-widest text-white/60">
            {tagline}
          </span>
        </span>
      </div>
      <p class="text-sm text-white/70 leading-relaxed">
        {footer.description}
      </p>
    </div>

    <nav aria-label="Enlaces rápidos">
      <h3 class="text-sm font-semibold mb-4">Enlaces Rápidos</h3>
      <ul class="flex flex-col gap-2">
        {footer.links.map((link) => (
          <li>
            <a
              href={link.href}
              class="text-sm text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div>
      <h3 class="text-sm font-semibold mb-4">Contacto</h3>
      <ul class="flex flex-col gap-2">
        <li class="flex items-center gap-2 text-sm text-white/70">
          <Icon name="phone" class="w-4 h-4" />
          <a href={`tel:${phoneTel}`} class="hover:text-white transition-colors">
            {phone}
          </a>
        </li>
        <li class="flex items-center gap-2 text-sm text-white/70">
          <Icon name="mail" class="w-4 h-4" />
          <a href={`mailto:${email}`} class="hover:text-white transition-colors">
            {email}
          </a>
        </li>
      </ul>
      <div class="mt-5 flex gap-3">
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Icon name="facebook" class="w-4 h-4" />
        </a>
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Icon name="instagram" class="w-4 h-4" />
        </a>
      </div>
    </div>
  </div>
  <div class="border-t border-white/10">
    <div class="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/60">
      <p>{footer.copyright}</p>
      <p class="inline-flex items-center gap-1">
        {footer.tagline}
      </p>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer with 3 columns and social links"
```

---

## Task 16: Compose landing at `src/pages/index.astro` and run dev server

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

Content:

```astro
---
import BaseLayout from "~/layouts/BaseLayout.astro";
import Header from "~/components/Header.astro";
import Footer from "~/components/Footer.astro";
import Hero from "~/components/Hero.astro";
import PetCategories from "~/components/PetCategories.astro";
import Services from "~/components/Services.astro";
import Location from "~/components/Location.astro";
import CtaBanner from "~/components/CtaBanner.astro";
import { site } from "~/data/site";

const description =
  "Almavet Jerez: centro veterinario en Jerez de la Frontera. Consultas, medicina preventiva, análisis clínicos y diagnóstico por imagen para perros, gatos, aves y exóticos.";
const title = `${site.name} · Centro Veterinario en Jerez de la Frontera`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VeterinaryCare",
  name: site.name,
  description,
  telephone: site.phoneTel,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.zip,
    addressLocality: site.address.city,
    addressCountry: site.address.country,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:30",
      closes: "13:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "17:30",
      closes: "20:30",
    },
  ],
};
---
<BaseLayout title={title} description={description} canonicalPath="/">
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </Fragment>
  <Header slot="header" />
  <Hero />
  <PetCategories />
  <Services />
  <Location />
  <CtaBanner />
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Start the dev server**

Run: `bun run dev`
Expected: Astro prints a local URL (typically `http://localhost:4321`). Keep it running in a separate terminal.

- [ ] **Step 4: Manual verification in browser**

Open `http://localhost:4321/` in a browser. Verify:

- [ ] Header is sticky at top, logo + 3 nav links + "Pedir Cita" pill visible.
- [ ] Hero shows 2-line title with blue "más quieres" underlined, CTAs, lavender badge overlapping the image.
- [ ] PetCategories shows 4 chips and a placeholder image on the right.
- [ ] Services shows 5 cards in a row on desktop.
- [ ] Location shows 3 InfoCards on the left, placeholder image with "¿Cómo llegar?" card overlaid on the right.
- [ ] CtaBanner shows blue gradient with white CTA and tel: link.
- [ ] Footer shows 3 columns on navy background.
- [ ] No horizontal scroll.
- [ ] Resize to 375px viewport: MobileNav hamburger appears, 5-card grid collapses, no overflow.
- [ ] Click hamburger: mobile panel slides in, clicking a link or backdrop closes it, Escape closes it.

If anything fails, stop and fix before committing.

- [ ] **Step 5: Stop dev server and build**

Stop the dev server (Ctrl+C). Run: `bun run build`
Expected: build completes with no errors, `dist/` directory created. Look for ✓ in the output.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: compose landing page with all sections and JSON-LD"
```

---

## Task 17: Create `AppointmentForm.tsx` React island

**Files:**
- Create: `src/components/react/AppointmentForm.tsx`

- [ ] **Step 1: Create `src/components/react/AppointmentForm.tsx`**

Content:

```tsx
import { useState, type FormEvent } from "react";

interface Service {
  readonly id: string;
  readonly title: string;
}

interface AppointmentFormProps {
  accessKey: string;
  redirectUrl: string;
  services: ReadonlyArray<Service>;
}

type FormStatus = "idle" | "submitting" | "error";

export default function AppointmentForm({
  accessKey,
  redirectUrl,
  services,
}: AppointmentFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (res.ok && data?.success !== false) {
        window.location.href = redirectUrl;
        return;
      }
      setStatus("error");
      setErrorMsg("Hubo un problema al enviar tu solicitud. Inténtalo de nuevo o llámanos.");
    } catch {
      setStatus("error");
      setErrorMsg("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  const todayIso = new Date().toISOString().split("T")[0];
  const submitting = status === "submitting";

  return (
    <form
      action="https://api.web3forms.com/submit"
      method="POST"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      noValidate={false}
    >
      {/* Hidden fields for Web3Forms */}
      <input type="hidden" name="access_key" value={accessKey} />
      <input type="hidden" name="from_name" value="Almavet Jerez Reservas" />
      <input type="hidden" name="subject" value="Nueva solicitud de cita" />
      <input type="hidden" name="redirect" value={redirectUrl} />
      {/* Honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {errorMsg && (
        <div role="alert" aria-live="polite" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {errorMsg}
        </div>
      )}

      <Field id="name" label="Nombre completo" required>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          autoComplete="name"
          placeholder="María García"
          aria-required="true"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="phone" label="Teléfono" required>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9\s+]{9,}"
            autoComplete="tel"
            placeholder="612 34 56 78"
            aria-required="true"
            className={inputClass}
          />
        </Field>
        <Field id="email" label="Email" required>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="maria@ejemplo.com"
            aria-required="true"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="pet_name" label="Nombre de la mascota" required>
          <input
            id="pet_name"
            name="pet_name"
            type="text"
            required
            placeholder="Luna"
            aria-required="true"
            className={inputClass}
          />
        </Field>
        <Field id="pet_type" label="Tipo de mascota" required>
          <select
            id="pet_type"
            name="pet_type"
            required
            defaultValue=""
            aria-required="true"
            className={inputClass}
          >
            <option value="" disabled>Selecciona…</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="ave">Ave</option>
            <option value="otro">Otro / Exótico</option>
          </select>
        </Field>
      </div>

      <Field id="service" label="Servicio de interés" required>
        <select
          id="service"
          name="service"
          required
          defaultValue=""
          aria-required="true"
          className={inputClass}
        >
          <option value="" disabled>Selecciona un servicio…</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
          <option value="otro">Otro / No estoy seguro</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field id="preferred_date" label="Fecha preferida" required>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            required
            min={todayIso}
            aria-required="true"
            className={inputClass}
          />
        </Field>
        <Field id="preferred_time" label="Franja horaria" required>
          <select
            id="preferred_time"
            name="preferred_time"
            required
            defaultValue=""
            aria-required="true"
            className={inputClass}
          >
            <option value="" disabled>Selecciona…</option>
            <option value="manana">Mañana (9:30–13:30)</option>
            <option value="tarde">Tarde (17:30–20:30)</option>
            <option value="sin_preferencia">Sin preferencia</option>
          </select>
        </Field>
      </div>

      <Field id="message" label="Motivo de la consulta (opcional)">
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={500}
          placeholder="Describe brevemente el motivo de la visita…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {submitting && (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
            <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
        {submitting ? "Enviando…" : "Solicitar cita"}
      </button>

      <p className="text-xs text-brand-slate">
        Al enviar aceptas que contactemos contigo para confirmar la cita.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-brand-navy">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

- [ ] **Step 3: Commit**

```bash
git add src/components/react/AppointmentForm.tsx
git commit -m "feat: add AppointmentForm React island with Web3Forms integration"
```

---

## Task 18: Create `reservar.astro` and `gracias.astro` pages

**Files:**
- Create: `src/pages/reservar.astro`
- Create: `src/pages/gracias.astro`
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

Content:

```dotenv
# Get a free access_key at https://web3forms.com/
PUBLIC_WEB3FORMS_KEY=your_web3forms_access_key_here

# Absolute origin, no trailing slash.
# Dev:  http://localhost:4321
# Prod: https://almavetjerez.com
PUBLIC_SITE_URL=http://localhost:4321
```

- [ ] **Step 2: Create `src/pages/reservar.astro`**

Content:

```astro
---
import BaseLayout from "~/layouts/BaseLayout.astro";
import Header from "~/components/Header.astro";
import Footer from "~/components/Footer.astro";
import AppointmentForm from "~/components/react/AppointmentForm.tsx";
import { site, services } from "~/data/site";

const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY ?? "";
const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? "http://localhost:4321";
const redirectUrl = `${siteUrl}/gracias`;

const serviceOptions = services.map((s) => ({ id: s.id, title: s.title }));

const title = `Reservar cita · ${site.name}`;
const description =
  "Solicita tu cita veterinaria en Almavet Jerez. Te contactamos en menos de 24h para confirmar fecha y hora.";
---
<BaseLayout title={title} description={description} canonicalPath="/reservar">
  <Header slot="header" />
  <section class="max-w-2xl mx-auto px-6 py-20">
    <h1 class="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
      Reserva tu cita
    </h1>
    <p class="mt-3 text-base text-brand-slate">
      Déjanos tus datos y el motivo de la visita. Te contactaremos en menos de 24h para confirmar fecha y hora.
    </p>
    <div class="mt-10">
      <AppointmentForm
        client:load
        accessKey={accessKey}
        redirectUrl={redirectUrl}
        services={serviceOptions}
      />
    </div>
  </section>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/gracias.astro`**

Content:

```astro
---
import BaseLayout from "~/layouts/BaseLayout.astro";
import Header from "~/components/Header.astro";
import Footer from "~/components/Footer.astro";
import Icon from "~/components/Icon.astro";
import { site } from "~/data/site";

const title = `¡Solicitud recibida! · ${site.name}`;
const description =
  "Tu solicitud de cita ha sido recibida. Te contactaremos en menos de 24h.";
---
<BaseLayout
  title={title}
  description={description}
  canonicalPath="/gracias"
  noindex={true}
>
  <Header slot="header" />
  <section class="max-w-xl mx-auto px-6 py-24 text-center">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
      <Icon name="check-circle" class="w-8 h-8" />
    </div>
    <h1 class="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
      ¡Solicitud recibida!
    </h1>
    <p class="mt-4 text-base text-brand-slate">
      Hemos recibido tu solicitud de cita. Te contactaremos en menos de 24 horas al teléfono que nos has dejado para confirmar fecha y hora.
    </p>
    <a
      href="/"
      class="mt-8 inline-flex items-center px-6 py-3 rounded-xl bg-brand-blue text-white font-semibold hover:bg-brand-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
    >
      Volver al inicio
    </a>
  </section>
  <Footer slot="footer" />
</BaseLayout>
```

- [ ] **Step 4: Create a local `.env` so dev server can resolve the variables**

Copy `.env.example` to `.env` (this file is gitignored):

Run: `cp .env.example .env`

Edit `.env` to set `PUBLIC_WEB3FORMS_KEY` to a real or fake value (for dev, any non-empty string works for the build — the form only actually submits on click).

- [ ] **Step 5: Verify type check and build**

Run: `bun run check`
Expected: "0 errors, 0 warnings, 0 hints."

Run: `bun run build`
Expected: build succeeds, `dist/reservar/index.html` and `dist/gracias/index.html` exist.

Run: `ls dist/`
Expected: directory listing includes `reservar/`, `gracias/`, `index.html`, `sitemap-index.xml`, `sitemap-0.xml`.

- [ ] **Step 6: Manual browser verification**

Start the dev server if not running: `bun run dev`

Navigate to `http://localhost:4321/reservar`. Verify:
- [ ] Form renders with all 9 fields + hidden honeypot.
- [ ] Submitting with empty required fields shows native validation messages.
- [ ] All labels are associated with their inputs (click a label focuses the field).
- [ ] Tab order is logical.
- [ ] "Solicitar cita" button has visible focus ring.

Navigate to `http://localhost:4321/gracias`. Verify:
- [ ] Green check icon, title, paragraph, "Volver al inicio" button.
- [ ] View source: `<meta name="robots" content="noindex">` is present in `<head>`.

- [ ] **Step 7: Commit**

```bash
git add .env.example src/pages/reservar.astro src/pages/gracias.astro
git commit -m "feat: add /reservar form page and /gracias confirmation page"
```

---

## Task 19: Add `robots.txt` and verify sitemap generation

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create `public/robots.txt`**

Content:

```
User-agent: *
Allow: /
Disallow: /gracias

Sitemap: https://almavetjerez.com/sitemap-index.xml
```

Note: the `Sitemap:` line hard-codes the production domain. When the final domain changes, update this file.

- [ ] **Step 2: Rebuild and verify sitemap output**

Run: `bun run build`
Expected: build succeeds.

Run: `ls dist/*.xml`
Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml` both present.

- [ ] **Step 3: Inspect sitemap content**

Run: `cat dist/sitemap-0.xml`
Expected: contains entries for `/` and `/reservar`. The `/gracias` URL may appear here — that's fine since `robots.txt` disallows it and the page has `noindex` as a belt-and-braces measure.

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt with sitemap reference"
```

---

## Task 20: Write README with dev and deploy instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` with full content**

Content:

````markdown
# Almavet Jerez — Sitio web

Landing page y sistema de solicitud de cita para la clínica veterinaria **Almavet Jerez** (Jerez de la Frontera).

## Stack

- [Astro 5](https://astro.build/) — static site generator con arquitectura de islas.
- [React 19](https://react.dev/) — para las dos islas interactivas (MobileNav, AppointmentForm).
- [Tailwind CSS v4](https://tailwindcss.com/) — configurado vía `@theme` en `src/styles/global.css`.
- [Web3Forms](https://web3forms.com/) — backend gratuito del formulario de cita.
- [Bun](https://bun.sh/) — package manager y task runner.
- Deploy: [Vercel](https://vercel.com/).

## Requisitos

- Node.js 20 LTS (ver `.nvmrc`).
- Bun 1.2+ (ver `.bun-version`).

## Instalación

```bash
bun install
cp .env.example .env
# Editar .env y configurar PUBLIC_WEB3FORMS_KEY (obtener en https://web3forms.com/)
```

## Comandos

| Comando | Acción |
|---|---|
| `bun run dev` | Servidor de desarrollo en http://localhost:4321 |
| `bun run build` | Construir sitio estático en `dist/` |
| `bun run preview` | Servir `dist/` localmente (verificación pre-deploy) |
| `bun run check` | Typecheck + diagnostics de Astro |
| `bun run typecheck` | Sólo typecheck TypeScript |
| `bun run lint` | Verificar formato con Prettier |

## Variables de entorno

| Variable | Valor de ejemplo | Propósito |
|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | `abc123…` | access_key de Web3Forms (pública por diseño). |
| `PUBLIC_SITE_URL` | `https://almavetjerez.com` | Origen absoluto usado para construir el `redirect` del formulario. |

Ambas deben configurarse en el dashboard de Vercel para los entornos **Production** y **Preview**.

## Reemplazar las imágenes placeholder

Las imágenes iniciales son SVG generados con el texto "PLACEHOLDER" visible, dimensiones fijas 1200×900 (ratio 4:3). Para reemplazarlas por fotos reales:

| Archivo actual | Reemplazar por | Descripción |
|---|---|---|
| `public/images/hero-vet.svg` | `public/images/hero-vet.jpg` | Veterinaria con un perro (hero) |
| `public/images/pets-group.svg` | `public/images/pets-group.jpg` | Grupo de mascotas (sección especialidades) |
| `public/images/clinic-exterior.svg` | `public/images/clinic-exterior.jpg` | Exterior/fachada (sección ubicación) |

**Importante:**
1. Mantener el mismo nombre de archivo pero con extensión `.jpg`.
2. Respetar el ratio 4:3 (ejemplo: 1200×900, 1600×1200, 2000×1500).
3. Actualizar las referencias `imagePath` en `src/data/site.ts` de `.svg` a `.jpg`.
4. Borrar los SVGs reemplazados.

## Editar el contenido

Todo el texto y datos de contacto viven en un único archivo: **`src/data/site.ts`**.

Busca los comentarios `TODO:` para identificar placeholders que deben actualizarse antes del lanzamiento (teléfono real, email, URLs de redes sociales, etc.).

## Deploy en Vercel

1. Conectar el repositorio en el dashboard de Vercel.
2. Framework preset: **Astro** (auto-detectado).
3. Build command: `bun run build` (o el por defecto).
4. Output directory: `dist`.
5. Configurar las variables de entorno listadas arriba.
6. Deploy.

Los preview deploys por rama/PR se crean automáticamente.

## Estructura del proyecto

```
src/
├── components/         Componentes .astro estáticos + carpeta react/ para islas
├── data/site.ts        Fuente única de verdad para el contenido
├── layouts/            BaseLayout.astro (meta tags, fonts, slots)
├── pages/              index.astro (landing), reservar.astro, gracias.astro
└── styles/global.css   Tailwind v4 + @theme tokens
public/
├── favicon.svg
├── images/             Placeholders SVG (reemplazar por JPGs)
└── robots.txt
```

## Licencia

Uso interno de Almavet Jerez. Todos los derechos reservados.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README with stack, setup, env, and deploy guide"
```

---

## Task 21: Add GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

Content:

```yaml
name: CI

on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    name: Typecheck and build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run check

      - name: Build
        env:
          PUBLIC_WEB3FORMS_KEY: ci-placeholder-key
          PUBLIC_SITE_URL: https://almavetjerez.com
        run: bun run build
```

Note: `PUBLIC_WEB3FORMS_KEY` in CI is a stub — the build doesn't actually submit anything; the value only needs to be a non-empty string so the form renders.

- [ ] **Step 2: Verify locally that the same commands pass**

Run: `bun run check && bun run build`
Expected: both succeed, exit code 0.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for typecheck and build"
```

---

## Task 22: Final verification pass

This task has no code — it's the pre-deploy walkthrough. Every checkbox must pass.

**Files:** None (verification only).

- [ ] **Step 1: Clean build from scratch**

Run:
```bash
rm -rf dist .astro node_modules
bun install --frozen-lockfile
bun run check
bun run build
```
Expected: all steps succeed, exit code 0.

- [ ] **Step 2: Preview the production build**

Run: `bun run preview`
Expected: server starts, typically on `http://localhost:4321`.

- [ ] **Step 3: Desktop viewport verification (1440×900)**

Open the preview URL in a browser sized to approximately 1440×900. Put the reference screenshot (`.context/attachments/Almavet Jerez Landing Page.jpg`) beside it. Verify paridad por sección:

- [ ] **Header:** Logo "ALMAVET JEREZ" + tagline, 3 nav links, blue "Pedir Cita" pill button.
- [ ] **Hero:** Two-line headline with the word "más quieres" in blue with an underline curve; eyebrow with bullet; two CTAs; lavender badge "10+" floating on the hero image.
- [ ] **PetCategories:** Title on the left, 4 chips (Caninos / Felinos / Aves / Exóticos) with icons, image on the right.
- [ ] **Services:** Centered eyebrow "● ESPECIALIDADES", title + blue underline divider, 5 cards in a row with icons.
- [ ] **Location:** 3 InfoCards on the left (Nuestra Clínica / Horario / Contacto Directo), map image on the right with an overlaid white card "¿Cómo llegar?" with "Ver en Google Maps" button.
- [ ] **CtaBanner:** Blue gradient section with white title, description, white "Reservar Ahora" button, and "Llamar: ..." link.
- [ ] **Footer:** Navy background, 3 columns (brand / Enlaces Rápidos / Contacto), bottom bar with copyright and tagline.

- [ ] **Step 4: Tablet viewport (768×1024)**

Resize to 768×1024. Verify:
- [ ] No horizontal scroll anywhere.
- [ ] Services grid collapses from 5 to 2–3 columns.
- [ ] Hero, PetCategories, and Location stay as 2-column on lg, may stack or tighten.
- [ ] Mobile hamburger does NOT appear yet (breakpoint is `md` = 768px, so right at the edge hamburger may or may not show — both acceptable).

- [ ] **Step 5: Mobile viewport (375×667)**

Resize to 375×667. Verify:
- [ ] Hamburger menu is visible in the Header; desktop nav is hidden.
- [ ] All sections stack to single column.
- [ ] Services cards stack to 1 column.
- [ ] Hero image appears above the headline (or below, depending on `lg:` breakpoint) with no overflow.
- [ ] Text is legible, no elements clipped.
- [ ] Click the hamburger: panel slides in from right with backdrop.
- [ ] Click a nav link: panel closes and page scrolls to the section.
- [ ] Click the backdrop: panel closes.
- [ ] Press Escape with panel open: panel closes.

- [ ] **Step 6: Anchor navigation**

On desktop, click each nav link. Verify:
- [ ] `Servicios` scrolls smoothly to the services section.
- [ ] `Ubicación` scrolls to the location section.
- [ ] `Contactos` scrolls to the location section (same as Ubicación by design).

- [ ] **Step 7: End-to-end form flow**

- [ ] Click "Pedir Cita" in the header. Land on `/reservar`.
- [ ] Submit the form with empty required fields — native browser validation stops submission.
- [ ] Fill all required fields with valid data.
- [ ] Submit. (If `PUBLIC_WEB3FORMS_KEY` is a real key, you land on `/gracias`. If it's a stub, you see the red error banner — that's expected and acceptable for this smoke test.)
- [ ] Visit `/gracias` directly. Verify the success UI and that view-source shows `<meta name="robots" content="noindex">`.

- [ ] **Step 8: No-JavaScript smoke test**

In DevTools, disable JavaScript (Settings → Debugger → Disable JavaScript or equivalent). Reload `/`. Verify:
- [ ] All static sections render correctly.
- [ ] Mobile hamburger shows but doesn't toggle (expected — React island is dead without JS).
- [ ] On `/reservar`, the form still renders. Submitting should POST to Web3Forms directly via native form action.

Re-enable JavaScript.

- [ ] **Step 9: Lighthouse audit**

Open DevTools → Lighthouse → Analyze page load (mobile preset). Verify:
- [ ] Performance ≥ 95
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95

If any score is below 95, investigate the reported issues before committing the "ready" tag.

- [ ] **Step 10: Accessibility spot check**

- [ ] Tab through the page using only the keyboard. Verify every interactive element has a visible focus ring.
- [ ] Use a screen reader quick scan (VoiceOver on macOS: `Cmd+F5`). Landmarks (header, main, footer, navs, sections) should all be announced with labels.

- [ ] **Step 11: Verify all TODO comments are tracked**

Run: `grep -rn "TODO:" src/ | grep -v node_modules`
Expected: a small list of intentional TODO markers in `src/data/site.ts`. These correspond to placeholders the client needs to update (phone, email, social URLs).

- [ ] **Step 12: Git tree is clean**

Run: `git status`
Expected: "nothing to commit, working tree clean" (modulo `.env` and `dist/` which are gitignored).

- [ ] **Step 13: Final commit marker (optional)**

If everything above passes, create a tag-style commit documenting readiness:

```bash
git commit --allow-empty -m "chore: landing page ready for client review and deploy"
```

---

## Self-review checklist (for plan author before handoff)

**Spec coverage:**

| Spec section | Plan task(s) |
|---|---|
| §2 Stack | T1 (deps), T2 (configs) |
| §3 Architecture & files | T1–T21 (every file created) |
| §4 Design tokens | T3 (`global.css`) |
| §5 `site.ts` data | T4 |
| §6 Components | T5 (Icon), T6 (BaseLayout), T7 (MobileNav), T8 (Header), T10 (Hero), T11 (PetCategories), T12 (Services), T13 (Location), T14 (CtaBanner), T15 (Footer), T16 (index composition) |
| §7 Form + Web3Forms + /gracias | T17 (form), T18 (pages + .env.example) |
| §8 SEO baseline | T6 (meta in BaseLayout), T16 (JSON-LD), T19 (robots.txt + sitemap) |
| §9.1 Scripts | T1 |
| §9.3 CI | T21 |
| §9.2 Pre-merge gates | T22 |
| §9.4 Vercel deploy | T20 (README), deploy happens outside this plan |
| §11 Open TODOs | Marked inline in `site.ts` (T4) |

**Intentional non-coverage:**
- §10 Out-of-scope items (analytics, i18n, blog, CMS, etc.) have no tasks — correct per spec.
- §9.5 Unit tests — deliberately excluded per spec.
