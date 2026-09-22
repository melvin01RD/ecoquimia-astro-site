import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { startPreview } from './helpers/vercel-preview.mjs';

const prefix = '/aprende-de-las-plagas';
const articles = ['cucarachas', 'roedores', 'termitas'];
const pages = ['/', '/servicios', '/nosotros', '/contacto', '/cotizacion', '/politicas'];
let preview;
before(async () => { preview = await startPreview(); });
after(async () => { await preview?.close(); });

async function request(path, expected, method = 'GET') {
  const response = await fetch(new URL(path, preview.origin), {
    method, redirect: 'manual', signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, expected, `${method} ${path}`);
  console.log(`${method} ${path} | expected=${expected} actual=${response.status} PASS`);
  return response;
}

test('TC01 - retired root returns a real 410', async () => {
  const response = await request(prefix, 410);
  assert.equal(response.headers.get('location'), null);
  assert.doesNotMatch(await response.text(), /Aprende de las plagas|<article|application\/ld\+json/i);
});

test('TC02 - retired articles return 410', async () => {
  for (const article of articles) await (await request(`${prefix}/${article}`, 410)).text();
});

test('TC03 - slash, query, unknown descendants and HEAD return 410', async () => {
  const paths = [
    `${prefix}/`, ...articles.map((article) => `${prefix}/${article}/`),
    `${prefix}?x=1`, `${prefix}/termitas?utm_source=test`,
    `${prefix}/termitas/?utm_source=test`, `${prefix}/inexistente`,
    `${prefix}/inexistente/otro/?x=1`,
  ];
  for (const path of paths) {
    await (await request(path, 410)).text();
    assert.equal(await (await request(path, 410, 'HEAD')).text(), '');
  }
  for (const path of [prefix, ...articles.map((article) => `${prefix}/${article}`)]) {
    await request(path, 410, 'HEAD');
  }
});

test('TC04 - sitemap index and every child exclude retired URLs and retain commercial pages', async () => {
  const pending = ['/sitemap-index.xml'];
  const visited = new Set();
  const pagePaths = new Set();
  while (pending.length) {
    const path = pending.pop();
    if (visited.has(path)) continue;
    visited.add(path);
    const xml = await (await request(path, 200)).text();
    assert.doesNotMatch(xml, /aprende-de-las-plagas/i);
    assert.match(xml, /<(sitemapindex|urlset)\b/);
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
    assert.ok(locations.length > 0, `Empty sitemap: ${path}`);
    for (const location of locations) {
      assert.equal(location.origin, 'https://fumigadoraecoquimia.com.do');
      if (xml.includes('<sitemapindex')) pending.push(location.pathname);
      else pagePaths.add(location.pathname.replace(/\/$/, '') || '/');
    }
  }
  assert.ok(visited.size >= 2);
  assert.deepEqual([...pagePaths].sort(), [...pages].sort());
});

test('TC05 - all main pages still return 200', async () => {
  for (const path of pages) {
    const html = await (await request(path, 200)).text();
    assert.match(html, /<h1\b/);
  }
});

test('TC06 - commercial services and images remain available', async () => {
  for (const path of ['/', '/servicios', '/cotizacion']) {
    const html = await (await request(path, 200)).text();
    for (const label of ['Desinsectación', 'Desratización', 'Tratamiento antitermitas']) {
      assert.ok(html.includes(label), `${path}: missing ${label}`);
    }
  }
  const html = await (await request('/servicios', 200)).text();
  for (const word of ['Cucarachas', 'roedores', 'Tratamiento de termitas']) assert.ok(html.includes(word));
  const sources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(sources.length >= 6);
  for (const source of new Set(sources)) {
    const response = await request(source, 200);
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
});

test('TC07 - current pages contain no retired links or editorial content', async () => {
  for (const path of [...pages, '/gracias']) {
    const html = await (await request(path, 200)).text();
    assert.doesNotMatch(html, /aprende-de-las-plagas|Aprende de las plagas/i);
    for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']*)["']/gi)) {
      const destination = new URL(match[1].replaceAll('&amp;', '&'), preview.origin);
      assert.ok(!destination.pathname.startsWith(prefix), `${path}: ${destination.href}`);
    }
    assert.match(html, /id="mobileMenu"/);
    assert.match(html, /class="nav-desktop\b/);
  }
});

test('Vercel build routes explicitly dispatch retired URLs to SSR', async () => {
  const { routes } = JSON.parse(await readFile('.vercel/output/config.json', 'utf8'));
  for (const path of [prefix, `${prefix}/`, `${prefix}/termitas`, `${prefix}/other/deep/`]) {
    const route = routes.find((entry) => entry.src && new RegExp(entry.src).test(path) && (entry.dest || entry.status));
    assert.equal(route?.dest, '_render', path);
    assert.equal(route.status, undefined, `Must not use Vercel's 404 fallback: ${path}`);
  }
});
