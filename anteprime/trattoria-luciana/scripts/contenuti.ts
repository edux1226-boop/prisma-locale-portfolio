/* Controlla i contenuti del CMS e dice cosa manca per andare online.

   Uso:   npm run contenuti            → elenco dei dati da confermare
          npm run contenuti -- --rigido  → esce con errore se ce ne sono
                                            (da usare prima di un deploy di produzione)

   La validazione è la stessa della build (content/schema.ts): un JSON
   malformato viene segnalato qui con il percorso esatto del campo. */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { SCHEMI, daConfermare, type NomeContenuto } from '../content/schema.ts';

const cartella = fileURLToPath(new URL('../content/', import.meta.url));
const rigido = process.argv.includes('--rigido');

let errori = 0;
let mancanti = 0;

for (const nome of Object.keys(SCHEMI) as NomeContenuto[]) {
  const dati = JSON.parse(await readFile(join(cartella, `${nome}.json`), 'utf8'));
  const r = SCHEMI[nome].safeParse(dati);
  if (!r.success) {
    errori += r.error.issues.length;
    console.error(`✗ content/${nome}.json`);
    for (const i of r.error.issues) console.error(`    ${i.path.join('.')}: ${i.message}`);
    continue;
  }
  const voci = daConfermare(nome, r.data);
  mancanti += voci.length;
  console.log(`${voci.length ? '·' : '✓'} ${nome}: ${voci.length ? `${voci.length} da confermare` : 'tutto confermato'}`);
  for (const v of voci) console.log(`    ${v.percorso}${v.nota ? `  — ${v.nota}` : ''}`);
}

console.log(`\n${mancanti} dati da confermare. In produzione restano fuori dal sito finché non passano a "confirmed".`);
if (errori) {
  console.error(`${errori} errori di validazione.`);
  process.exit(1);
}
if (rigido && mancanti) process.exit(2);
