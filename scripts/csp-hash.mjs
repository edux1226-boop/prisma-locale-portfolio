// Dopo la build: calcola gli hash SHA-256 degli <style> inline e li aggiunge a style-src in dist/_headers.
// Resta vietato 'unsafe-inline': un CSS diverso da quello compilato viene bloccato.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ');
const hashes = new Set();
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) for (const m of readFileSync(p, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) hashes.add("'sha256-" + createHash('sha256').update(m[1]).digest('base64') + "'");
  }
})(dist);
const file = join(dist, '_headers');
const src = readFileSync(file, 'utf8');
writeFileSync(file, src.replace("style-src 'self'", `style-src 'self' ${[...hashes].join(' ')}`));
console.log(`CSP: ${hashes.size} hash di stile inline aggiunti`);

// Configurazione equivalente per Vercel (che non legge _headers): dist/vercel.json
const headers = [];
let block = null;
for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) { block = { source: line.trim().replace(/\*$/, '(.*)'), headers: [] }; headers.push(block); continue; }
  const i = line.indexOf(':');
  block.headers.push({ key: line.slice(0, i).trim(), value: line.slice(i + 1).trim() });
}
writeFileSync(join(dist, 'vercel.json'), JSON.stringify({ trailingSlash: true, cleanUrls: false, headers }, null, 2));
console.log('vercel.json scritto');
