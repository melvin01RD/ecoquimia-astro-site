// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel/serverless'

export default defineConfig({
  site: 'https://www.ecoquimia.com.do',

  output: 'server',

  adapter: vercel(),

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
})
