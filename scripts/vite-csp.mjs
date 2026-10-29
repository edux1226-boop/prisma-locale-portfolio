/* Plugin Vite: a fine build scrive dist/_headers con una Content-Security-Policy per pagina.
   Gli script inline (il piccolo avvio che aggiunge la classe "js") sono autorizzati per hash
   SHA-256 calcolato sul HTML finale, così la policy non resta indietro se lo script cambia e
   non serve 'unsafe-inline' negli script. Gli altri header di sicurezza sono in netlify.toml. */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const FORM_ENDPOINT = ['https://script.google.com', 'https://script.googleusercontent.com'];

// Policy comune a tutte le pagine; le eccezioni sono elencate sotto per percorso.
const BASE = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  // Gli stili inline sono presenti negli attributi style="…" e nelle animazioni: 'unsafe-inline'
  // vale solo per gli stili, non per gli script.
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", ...FORM_ENDPOINT],
  'media-src': ["'self'"],
  'manifest-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': [],
};

// Anteprime che caricano risorse esterne (non incluse nel bundle di Vite).
const ECCEZIONI = {
  'anteprime/retroscena/index.html': {
    'style-src': ['https://fonts.googleapis.com'],
    'font-src': ['https://fonts.gstatic.com'],
    'frame-src': ['https://www.google.com'],
  },
  'anteprime/destino/index.html': {
    'script-src': ['https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
    'font-src': ['data:'], // i font sono incorporati nel foglio di stile
  },
};

function htmlIn(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? htmlIn(p) : e.name.endsWith('.html') ? [p] : [];
  });
}

function hashInline(html) {
  const hash = [];
  for (const m of html.matchAll(/<script(?<attr>[^>]*)>(?<body>[\s\S]*?)<\/script>/g)) {
    const { attr, body } = m.groups;
    if (/\bsrc\s*=/.test(attr) || /type\s*=\s*["']application\/(ld\+)?json["']/.test(attr)) continue;
    hash.push(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  return hash;
}

function policy(pagina, html) {
  const extra = ECCEZIONI[pagina] || {};
  const dir = { ...BASE };
  for (const [k, v] of Object.entries(extra)) dir[k] = [...(dir[k] || []), ...v];
  dir['script-src'] = [...dir['script-src'], ...hashInline(html)];
  return Object.entries(dir)
    .map(([k, v]) => [k, ...v].join(' '))
    .join('; ');
}

// Percorsi con cui Netlify può servire la pagina (URL "puliti" inclusi).
function percorsi(pagina) {
  if (pagina === 'index.html') return ['/', '/index.html'];
  if (pagina.endsWith('/index.html')) {
    const d = '/' + pagina.slice(0, -'/index.html'.length);
    return [d, d + '/', d + '/index.html'];
  }
  return ['/' + pagina, '/' + pagina.replace(/\.html$/, '')];
}

export default function csp() {
  let outDir;
  return {
    name: 'csp-headers',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      // _headers vuole una regola per percorso: la stessa policy si ripete per ogni variante.
      const blocchi = htmlIn(outDir).sort().flatMap((file) => {
        const pagina = relative(outDir, file).split(sep).join('/');
        const valore = policy(pagina, readFileSync(file, 'utf8'));
        return percorsi(pagina).map((percorso) => `${percorso}\n  Content-Security-Policy: ${valore}\n`);
      });
      writeFileSync(join(outDir, '_headers'), `# Generato da scripts/vite-csp.mjs: non modificare a mano.\n\n${blocchi.join('\n')}`);
    },
  };
}
