// Cerca chiavi API e credenziali nei file tracciati da git (e, con --storia, in tutti i commit).
// Uso: node scripts/scansione-segreti.mjs [--storia]
import { execFileSync } from 'node:child_process';

const MODELLI = {
  'Chiave Google API': /AIza[0-9A-Za-z_-]{35}/,
  'Chiave stile OpenAI/Anthropic': /\bsk-[A-Za-z0-9_-]{20,}/,
  'Token GitHub': /\bgh[pousr]_[A-Za-z0-9]{36,}/,
  'Chiave AWS': /\b(AKIA|ASIA)[0-9A-Z]{16}\b/,
  'Token Slack': /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
  'Chiave Stripe live': /\b[sr]k_live_[A-Za-z0-9]{16,}/,
  'Chiave privata': /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  'Assegnazione sospetta': /(api[_-]?key|secret|token|password)["']?\s*[:=]\s*["'][A-Za-z0-9_+/=-]{16,}["']/i,
};
const FILE_SENSIBILI = /(^|\/)(\.env(\..*)?|id_rsa|.*\.pem|.*\.p12|credentials\.json)$/;

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });
const rev = process.argv.includes('--storia') ? git('rev-list', '--all').split('\n').filter(Boolean) : ['HEAD'];
const trovati = new Set();

for (const r of rev) {
  for (const f of git('ls-tree', '-r', '--name-only', r).split('\n').filter(Boolean)) {
    if (FILE_SENSIBILI.test(f)) trovati.add(`${f}: file che non dovrebbe essere nel repository (${r.slice(0, 7)})`);
  }
  for (const [nome, re] of Object.entries(MODELLI)) {
    let out = '';
    try { out = git('grep', '-InE', '-e', re.source, ...(re.flags.includes('i') ? ['-i'] : []), r, '--', '.'); } catch (e) { if (e.status === 1) continue; throw e; }
    for (const riga of out.split('\n').filter(Boolean)) {
      const [, file, n] = riga.match(/^[^:]+:([^:]+):(\d+):/) || [];
      if (file && !/\.(webp|avif|png|jpe?g|woff2|lock)$|package-lock\.json$/.test(file)) {
        trovati.add(`${file}:${n} ${nome} (${r.slice(0, 7)})`);
      }
    }
  }
}

if (trovati.size) {
  console.error('Possibili segreti trovati:\n' + [...trovati].sort().join('\n'));
  process.exit(1);
}
console.log('Nessun segreto trovato.');
