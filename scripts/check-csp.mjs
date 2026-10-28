/* Controlla che la Content-Security-Policy di netlify.toml sia coerente con le pagine in dist/.
   La policy non ammette script inline, a parte quelli elencati per hash: se si cambia uno
   script inline (o se ne aggiunge uno) senza aggiornare l'hash, la pagina in produzione
   smetterebbe di funzionare. Qui lo si scopre in build, non online.

   Uso: node scripts/check-csp.mjs          controlla (esce con errore se qualcosa non torna)
        node scripts/check-csp.mjs --stampa stampa gli hash da incollare in script-src */

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const radice = new URL('..', import.meta.url).pathname;
const dist = join(radice, 'dist');

const cammina = (cartella) =>
  readdirSync(cartella).flatMap((nome) => {
    const percorso = join(cartella, nome);
    if (statSync(percorso).isDirectory()) return cammina(percorso);
    return percorso.endsWith('.html') ? [percorso] : [];
  });

const toml = readFileSync(join(radice, 'netlify.toml'), 'utf8');
const trovata = toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/);
if (!trovata && !process.argv.includes('--stampa')) {
  console.error('✗ Content-Security-Policy non trovata in netlify.toml');
  process.exit(1);
}
const policy = trovata?.[1] ?? '';
const scriptSrc = (policy.match(/script-src([^;]*)/) || [, ''])[1];

const problemi = [];
const hash = new Set();

for (const file of cammina(dist)) {
  const html = readFileSync(file, 'utf8');
  const nome = file.slice(dist.length);

  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attributi, corpo] = m;
    const src = attributi.match(/\bsrc="([^"]+)"/)?.[1];
    if (src) {
      if (/^(https?:)?\/\//.test(src)) problemi.push(`${nome}: script esterno non ammesso (${src})`);
      continue;
    }
    if (/type="application\/ld\+json"/.test(attributi)) continue; // dati, non codice
    const h = `'sha256-${createHash('sha256').update(corpo).digest('base64')}'`;
    hash.add(h);
    if (!scriptSrc.includes(h)) problemi.push(`${nome}: script inline senza hash in script-src (${h})`);
  }

  if (/\son[a-z]+\s*=\s*["']/i.test(html.replace(/<svg[\s\S]*?<\/svg>/g, ''))) {
    problemi.push(`${nome}: gestore di evento inline (onclick, …) bloccato dalla CSP`);
  }
}

if (process.argv.includes('--stampa')) {
  console.log([...hash].sort().join(' '));
  process.exit(0);
}

// Hash in policy che nessuna pagina usa più: vanno tolti, ogni hash in più è un varco in più.
for (const h of scriptSrc.match(/'sha256-[^']+'/g) || []) {
  if (!hash.has(h)) problemi.push(`netlify.toml: hash non più usato da nessuna pagina (${h})`);
}

if (problemi.length) {
  console.error('✗ CSP non coerente con le pagine:\n  ' + problemi.join('\n  '));
  console.error('\n  Per ottenere gli hash giusti: node scripts/check-csp.mjs --stampa');
  process.exit(1);
}
console.log(`✓ CSP coerente: ${hash.size} script inline ammessi per hash, nessuno script esterno.`);
