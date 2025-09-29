// astro.config.mjs
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'        // <— adapter correcto
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://ecoquimia.com.do',         // o tu URL de vercel
  adapter: vercel(),                        // <— clave para Vercel
  integrations: [tailwind(), sitemap()],
  // Si quieres SSR por defecto (no obligatorio):
  // output: 'server',
})
