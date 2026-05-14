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
