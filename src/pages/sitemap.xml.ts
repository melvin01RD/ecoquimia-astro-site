// Manual sitemap endpoint compatible with SSR
// Serves a single sitemap.xml for the production domain https://www.ecoquimia.com.do

export async function GET() {
  const base = 'https://www.ecoquimia.com.do';

  // Rutas públicas reales (no incluir páginas técnicas o de agradecimiento)
  const routes = [
    '/',
    '/nosotros',
    '/services',
    '/cotizacion',
    '/aprende-de-las-plagas',
    '/aprende-de-las-plagas/cucarachas',
    '/aprende-de-las-plagas/roedores',
    '/aprende-de-las-plagas/termitas',
    '/contact',
    '/politicas',
  ];

  const urls = routes
    .map((path) => {
      const loc = `${base}${path}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      // Prevent caching during testing; in production you may set a proper Cache-Control
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
