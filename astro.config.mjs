import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";

const SITE = process.env.SITE ?? "https://ecoquimia.com.do";

export default defineConfig({
  site: SITE,
  adapter: vercel(),
  trailingSlash: "never",
  compressHTML: true,
  // Prefetch nativo (opcional)
  prefetch: { defaultStrategy: "hover" },
  integrations: [tailwind(), sitemap()],
  vite: {
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
    }
  }
});
