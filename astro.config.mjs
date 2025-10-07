// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://ecoquimia-astro-site.vercel.app',
  output: 'server',        // necesitas server para acciones/envío de formularios
  adapter: vercel(),       // <-- importantísimo: usa el adapter de Vercel
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
})
