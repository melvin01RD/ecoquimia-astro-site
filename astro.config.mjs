// astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://fumigadoraecoquimia.com.do',

  output: 'server',

  adapter: vercel(),

  // 301 redirects for renamed routes
  redirects: {
    '/contact': { status: 301, destination: '/contacto' },
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      // Exclude legacy /services (redirected) and the thank-you page from the sitemap.
      filter: (page) =>
        !page.includes("/services/") && !page.includes("/gracias/"),
    }),
  ],
})
