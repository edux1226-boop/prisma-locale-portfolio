// Scansione statica di dist/: segreti, source map, file di sistema, EXIF, script/stili inline, risorse di terzi.
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const csp = await readFile(new URL("../dist/_headers", import.meta.url), "utf8");
const SECRETS = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token'],
  [/sk-[A-Za-z0-9]{32,}/, 'API key (sk-)'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key'],
  [/(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/i, 'credenziale hard-coded'],
];

export async function scanDist() {
  const findings = [];
  const files = await walk(root);
  for (const f of files) {
    const rel = f.slice(root.length).replace(/\\/g, '/');
    const ext = extname(f);
    if (ext === '.map') findings.push(`source map pubblica: ${rel}`);
    if (/(^|\/)\.(git|env|DS_Store)/.test(rel) || /\.(bak|orig|swp|log)$/.test(rel)) findings.push(`file di sistema/backup: ${rel}`);
    if (rel === '/package.json' || rel === '/package-lock.json') findings.push(`manifest pubblicato: ${rel}`);
    const buf = await readFile(f);
    if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext) && (buf.includes(Buffer.from('Exif\0\0')) || buf.includes(Buffer.from('<x:xmpmeta')))) findings.push(`metadati EXIF/XMP in ${rel}`);
    if (['.html', '.js', '.css', '.txt', '.xml', '.svg'].includes(ext)) {
      const text = buf.toString('utf8');
      for (const [re, name] of SECRETS) if (re.test(text)) findings.push(`${name} in ${rel}`);
      if (/sourceMappingURL=/.test(text)) findings.push(`riferimento a source map in ${rel}`);
      if (ext === '.html') {
        if (/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/.test(text)) findings.push(`script inline in ${rel}`);
        for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
          const h = "'sha256-" + createHash('sha256').update(m[1]).digest('base64') + "'";
          if (!csp.includes(h)) findings.push(`<style> inline senza hash nella CSP: ${rel}`);
        }
        if (/\sstyle="/.test(text)) findings.push(`attributo style inline in ${rel}`);
        if (/\son[a-z]+="/.test(text)) findings.push(`handler inline in ${rel}`);
        if (/<(?:script|img|iframe)[^>]+src="https?:\/\/|<link[^>]+rel="(?:stylesheet|preload|modulepreload|prefetch|preconnect)"[^>]+href="https?:\/\//.test(text)) findings.push(`risorsa di terzi in ${rel}`);
        if (/<!--(?!\s*-->)/.test(text)) findings.push(`commento HTML in ${rel}`);
      }
    }
  }
  return { files: files.length, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { files, findings } = await scanDist();
  console.log(`dist: ${files} file scansionati`);
  if (findings.length) { console.error(findings.map((f) => ' - ' + f).join('\n')); process.exit(1); }
  console.log('nessun finding');
}
