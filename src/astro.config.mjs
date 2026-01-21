// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid', // Permite tener páginas estáticas Y server-side
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
});
