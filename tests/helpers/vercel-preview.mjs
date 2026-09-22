import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Local HTTP preview of the generated static files and actual Vercel SSR handler.
// This is not an emulator of Vercel's CDN or domain configuration.
export async function startPreview(port = 0) {
  const output = resolve('.vercel/output');
  const staticRoot = resolve(output, 'static');
  const deployment = JSON.parse(await readFile(resolve(output, 'config.json'), 'utf8'));
  const functionRoot = resolve(output, 'functions/_render.func');
  const functionConfig = JSON.parse(await readFile(resolve(functionRoot, '.vc-config.json'), 'utf8'));
  const { default: handler } = await import(pathToFileURL(resolve(functionRoot, functionConfig.handler)).href);
  const contentTypes = { '.html': 'text/html; charset=utf-8', '.xml': 'application/xml', '.css': 'text/css', '.js': 'text/javascript' };

  const server = createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(staticRoot, `.${pathname}`);
      const relativePath = relative(staticRoot, file);
      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        res.writeHead(400).end();
        return;
      }
      for (const candidate of [file, resolve(file, 'index.html')]) {
        const info = await stat(candidate).catch((error) => {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null;
          throw error;
        });
        if (info?.isFile()) {
          res.writeHead(200, { 'Content-Type': contentTypes[extname(candidate)] ?? 'application/octet-stream' });
          res.end(req.method === 'HEAD' ? undefined : await readFile(candidate));
          return;
        }
      }
      const route = deployment.routes.find((entry) => entry.src && new RegExp(entry.src).test(pathname) && (entry.dest || entry.status));
      if (route?.dest === '_render' && !route.status) {
        await handler(req, res);
        return;
      }
      if (route?.headers?.Location) {
        res.writeHead(route.status, route.headers).end();
        return;
      }
      res.writeHead(404).end();
    } catch (error) {
      console.error(error);
      res.writeHead(500).end();
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolveListen);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose())),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const preview = await startPreview(Number(process.env.PORT ?? 4322));
  console.log(`Build preview: ${preview.origin}`);
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => { await preview.close(); });
  }
}
