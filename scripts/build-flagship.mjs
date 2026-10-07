/* Compila i flagship (app Next.js autonome in flagship/) e li copia nella
   build del sito, dopo `vite build`. Ognuno ha le sue dipendenze e il suo
   package-lock: qui si installano se mancano.

   Uso:   node scripts/build-flagship.mjs        (lo chiama `npm run build`) */

import { cp, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const radice = fileURLToPath(new URL('../', import.meta.url));

const FLAGSHIP = [
  {
    cartella: 'flagship/trattoria-luciana',
    percorso: '/anteprime/trattoria-luciana',
    ambiente: { SITE_MODE: 'anteprima', SITE_URL: 'https://prismalocale.it/anteprime/trattoria-luciana' },
  },
];

const esiste = (p) => stat(p).then(() => true, () => false);
const npm = (args, cwd, env = {}) =>
  execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ...env },
  });

for (const f of FLAGSHIP) {
  const cartella = join(radice, f.cartella);
  console.log(`\n▸ ${f.cartella} → ${f.percorso}/`);
  if (!(await esiste(join(cartella, 'node_modules')))) npm(['ci', '--no-audit', '--no-fund'], cartella);
  npm(['run', 'build'], cartella, { BASE_PATH: f.percorso, ...f.ambiente });
  const dest = join(radice, 'dist', f.percorso);
  await rm(dest, { recursive: true, force: true });
  await cp(join(cartella, 'out'), dest, { recursive: true });
  console.log(`✓ ${f.cartella} copiato in dist${f.percorso}/`);
}
