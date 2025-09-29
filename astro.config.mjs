// astro.config.mjs
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel' 

export default {
  site: 'https://ecoquimia-astro-site.vercel.app',
  output: 'server',
  integrations: [tailwind(), sitemap()],
}
