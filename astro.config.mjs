// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel"; // <- antes: "@astrojs/vercel/serverless"

export default defineConfig({
  site: "https://ecoquimia-astro-site.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [tailwind(), sitemap()],
});
