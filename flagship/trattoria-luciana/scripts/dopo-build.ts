/* Dopo `next build`: in produzione pubblica il CMS su /admin/.
   Nell'anteprima no: l'anteprima vive nel sito di Prisma Locale. */

import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const radice = fileURLToPath(new URL('../', import.meta.url));
if (process.env.SITE_MODE !== 'produzione') process.exit(0);

const admin = join(radice, 'out', 'admin');
await mkdir(admin, { recursive: true });
await cp(join(radice, 'cms', 'config.yml'), join(admin, 'config.yml'));
const pagina = await readFile(join(radice, 'cms', 'index.html'), 'utf8');
await writeFile(join(admin, 'index.html'), pagina);
console.log('✓ CMS pubblicato in out/admin/');
