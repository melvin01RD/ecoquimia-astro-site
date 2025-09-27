// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel/serverless';
import { fileURLToPath } from 'node:url';

const SITE = process.env.SITE ?? 'https://ecoquimia.com.do';
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  site: SITE,
  output: 'hybrid',                // para que /cotizacion pueda prerender
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
  trailingSlash: 'never',
  compressHTML: true,

  
  prefetch: {
    // prefetchAll: true,          // (opcional) para prefetchear TODOS los links
    defaultStrategy: 'hover',      // hover | tap | viewport | load
  },

  integrations: [tailwind(), sitemap()],
  vite: {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  },
});
