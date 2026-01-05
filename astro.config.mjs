// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://www.ecoquimia.com.do',

  output: 'server',

  adapter: vercel(),

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
})
