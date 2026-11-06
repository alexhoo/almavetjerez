// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Update `site` to the real production URL before first prod deploy.
export default defineConfig({
  site: "https://almavetjerez.com",
  // Pages are static; only routes with `prerender = false` (src/pages/api) run
  // as Vercel functions.
  adapter: vercel(),
  // Astro's CSRF check (`security.checkOrigin`) compares the browser's `Origin`
  // header with `Astro.url.origin`. Inside a Vercel function the socket is plain
  // HTTP, so Astro only rebuilds the public URL from `X-Forwarded-*` headers if
  // the host is listed here. Without it, POST /api/cita fails with
  // "403 Cross-site POST form submissions are forbidden".
  security: {
    allowedDomains: [
      { protocol: "https", hostname: "almavetjerez.com" },
      { protocol: "https", hostname: "www.almavetjerez.com" },
    ],
  },
  integrations: [react(), sitemap()],
  // Server-only secrets (never bundled into client JS). Optional so that the
  // build doesn't fail without them; the endpoint reports a clear error instead.
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
