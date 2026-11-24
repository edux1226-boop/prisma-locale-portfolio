/* Plugin Vite: a fine build scrive dist/_headers con la Content-Security-Policy
   delle pagine dello studio (home, privacy, grazie, inizia, 404).

   Lo script inline in <head> (quello che aggiunge le classi "js" e "motion")
   è autorizzato per hash SHA-256, calcolato sull'HTML finale: se lo script
   cambia, la policy si aggiorna da sola e non serve 'unsafe-inline' negli
   script. Gli stili inline restano ammessi perché il markup usa attributi
   style="…" (i raggi del metodo) e un <style> dentro <noscript>.

   Le anteprime in /anteprime/ non ricevono questa policy: sono pagine a sé,
   alcune caricano caratteri o librerie da altri domini.
   Gli altri header di sicurezza sono in netlify.toml.

   Ripreso dal branch claude/prisma-locale-security-audit-l7194l e ristretto
   alle pagine dello studio. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Il modulo invia a Google Fogli: lo script risponde con un reindirizzamento
// a script.googleusercontent.com, che connect-src controlla a sua volta.
const FORM_ENDPOINT = ['https://script.google.com', 'https://script.googleusercontent.com'];

const POLICY = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  // data: per la gif trasparente del <picture> dell'hero.
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", ...FORM_ENDPOINT],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  // Netlify Forms invia alla stessa origine (/grazie.html).
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': [],
};

// Pagina in dist → percorsi con cui Netlify la serve (URL "puliti" inclusi).
const PAGINE = {
  'index.html': ['/', '/index.html'],
  'privacy.html': ['/privacy', '/privacy.html'],
  'grazie.html': ['/grazie', '/grazie.html'],
  'inizia.html': ['/inizia', '/inizia.html'],
  '404.html': ['/404', '/404.html'],
};

function hashInline(html) {
  const hashes = [];
  for (const m of html.matchAll(/<script(?<attr>[^>]*)>(?<body>[\s\S]*?)<\/script>/g)) {
    const { attr, body } = m.groups;
    if (/\bsrc\s*=/.test(attr) || /type\s*=\s*["']application\/(ld\+)?json["']/.test(attr)) continue;
    hashes.push(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
  return hashes;
}

export function policyFor(html) {
  const dir = { ...POLICY, 'script-src': [...POLICY['script-src'], ...hashInline(html)] };
  return Object.entries(dir)
    .map(([k, v]) => [k, ...v].join(' '))
    .join('; ');
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
      const blocchi = Object.entries(PAGINE).flatMap(([pagina, percorsi]) => {
        const valore = policyFor(readFileSync(join(outDir, pagina), 'utf8'));
        return percorsi.map((p) => `${p}\n  Content-Security-Policy: ${valore}\n`);
      });
      writeFileSync(
        join(outDir, '_headers'),
        `# Generato da scripts/vite-csp.mjs a ogni build: non modificare a mano.\n\n${blocchi.join('\n')}`,
      );
    },
  };
}
