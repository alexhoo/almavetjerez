# Almavet Jerez — Centro Veterinario

Landing page for Almavet Jerez veterinary clinic in Jerez de la Frontera, Spain.

**Stack:** Astro 5 · React 19 · Tailwind CSS v4 · Bun · Vercel

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- Node.js ≥ 20 (for Astro's build runtime)

## Development

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:4321)
bun run dev

# Type-check
bun run check

# Build for production
bun run build

# Preview the production build
bun run preview
```

## Environment variables

Copy `.env.example` to `.env` and fill in values before running locally.

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | [Resend](https://resend.com) API key with "Sending access". Server-only secret (no `PUBLIC_` prefix). |
| `CONTACT_TO_EMAIL` | Inbox that receives appointment requests. Defaults to `info@almavetjerez.com`. |
| `CONTACT_FROM_EMAIL` | Sender, on a domain verified in Resend. Defaults to `Almavet Jerez Reservas <citas@almavetjerez.com>`. |

The appointment form posts to `/api/cita` (`src/pages/api/cita.ts`), which validates the data and sends the email through Resend. It is the only server-rendered route; the rest of the site is static.

## Replacing placeholder images

Three placeholder SVGs are in `public/images/`. Replace them with real photos:

| File | Replace with | Dimensions |
|---|---|---|
| `public/images/hero-vet.svg` | `public/images/hero-vet.jpg` | 1200 × 900 px (4:3) |
| `public/images/pets-group.svg` | `public/images/pets-group.jpg` | 1200 × 900 px (4:3) |
| `public/images/clinic-exterior.svg` | `public/images/clinic-exterior.jpg` | 1200 × 900 px (4:3) |

After replacing, update the `imagePath` values in `src/data/site.ts` to use the `.jpg` extension.

## Updating content

All site copy, contact details, and service descriptions live in one file:

```
src/data/site.ts
```

Fields marked `// TODO: confirm` need to be updated with real data before going live:
- Phone number (`site.phone`, `site.phoneTel`)
- Email address (`site.email`)
- Social URLs (`site.social.facebook`, `site.social.instagram`)

## Project structure

```
src/
├── components/          Static Astro components (sections, cards, icons)
│   └── react/           React islands (MobileNav, AppointmentForm)
├── data/site.ts         Single source of truth for all content
├── layouts/             BaseLayout with SEO, fonts, Header, Footer
├── pages/               Astro routes: index, reservar, gracias
├── styles/global.css    Tailwind v4 @theme tokens
└── types/icons.ts       Shared TypeScript types
public/
├── favicon.svg
├── robots.txt
└── images/              Placeholder SVGs (replace with real JPGs)
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Framework preset: **Astro** (auto-detected)
4. Set environment variables in Vercel dashboard (Production): `RESEND_API_KEY` and, optionally, `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL`
5. Deploy — Vercel will auto-detect `bun.lock` and use Bun as the package manager
