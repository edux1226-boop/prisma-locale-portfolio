// Server statico locale che replica public/_headers (Cloudflare Pages / Netlify). Solo per test.
// Niente directory listing, niente dotfile (tranne /.well-known/), 404 generico, nessun header che riveli lo stack.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.png': 'image/png' };

export async function parseHeaders() {
  const raw = await readFile(new URL('../dist/_headers', import.meta.url), 'utf8');
  const rules = []; let cur = null;
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); continue; }
    const i = line.indexOf(':'); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return rules;
}
const matches = (p, path) => (p.endsWith('*') ? path.startsWith(p.slice(0, -1)) : path === p);

export function start() {
  return new Promise(async (ok) => {
    const rules = await parseHeaders();
    const srv = createServer(async (req, res) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = normalize(join(root, path));
      const bad = !file.startsWith(root) || /\/\.(?!well-known)/.test(path) || path.endsWith('.map') || path === '/_headers' || path === '/vercel.json';
      let status = 200, body;
      try {
        if (bad) throw new Error('blocked');
        let s = await stat(file).catch(() => null);
        if (s?.isDirectory()) { if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }); return res.end(); } file = join(file, 'index.html'); s = await stat(file).catch(() => null); }
        if (!s) throw new Error('nf');
        body = await readFile(file);
      } catch {
        status = 404; file = join(root, '404.html'); body = await readFile(file).catch(() => 'Not found');
      }
      const h = { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' };
      for (const r of rules) if (matches(r.pattern, path)) Object.assign(h, r.headers);
      if (status === 404) h['Cache-Control'] = 'no-store';
      res.writeHead(status, h); res.end(req.method === 'HEAD' ? undefined : body);
    });
    srv.listen(Number(process.env.PORT ?? 4321), '127.0.0.1', () => ok(srv));
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) start().then(() => console.log(`http://127.0.0.1:${process.env.PORT ?? 4321}`));
