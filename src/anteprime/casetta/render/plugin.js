/* Plugin Vite dell'anteprima "La Casetta di Paparill".

   1. Compone le pagine in anteprime/casetta-paparill/ dai contenuti JSON:
      l'HTML pubblicato è statico (menu compreso), i testi stanno nei file.
   2. Nella build mette il CSS direttamente nella pagina: niente richieste
      che bloccano il primo disegno (il foglio è piccolo, ~10 kB compresso).

   Nel dev server una modifica a un file JSON ricarica la pagina.
   Con "anteprima": false la build elenca i dati ancora segnati [dc] o
   daConfermare: online l'etichetta sparisce, il dato no. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { componi } from './componi.js';
import { haDc } from './utili.js';

function daConfermare(dati) {
  const trovati = [];
  const visita = (v, percorso) => {
    if (typeof v === 'string') {
      if (haDc(v)) trovati.push(percorso);
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => visita(x, `${percorso}.${i}`));
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        // _fonti, _leggimi: note per chi modifica; testi.anteprima: solo nell'anteprima
        if (k.startsWith('_') || `${percorso}.${k}` === 'testi.anteprima') continue;
        if (k === 'daConfermare') { if (x) trovati.push(percorso); continue; }
        visita(x, percorso ? `${percorso}.${k}` : k);
      }
    }
  };
  visita(dati, '');
  return trovati;
}

export function casetta({ root }) {
  const contenuti = resolve(root, 'src/anteprime/casetta/contenuti');
  const pagine = resolve(root, 'anteprime/casetta-paparill');
  const nostra = (file) => Boolean(file) && resolve(file).startsWith(pagine + sep);

  const leggi = () => Object.fromEntries(readdirSync(contenuti)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f.slice(0, -5), JSON.parse(readFileSync(join(contenuti, f), 'utf8'))]));

  return [
    {
      name: 'casetta:contenuti',
      buildStart() {
        const dati = leggi();
        if (dati.sito.anteprima) return;
        const resti = daConfermare(dati);
        if (resti.length) this.warn(`[casetta] ${resti.length} dati ancora da confermare:\n  ${resti.join('\n  ')}`);
        if (dati.recensioni.esempio) this.warn('[casetta] recensioni.json è d\'esempio: online le recensioni non vengono mostrate');
        const tf = dati.ristorante.thefork;
        if (!tf.url && !tf.widget) this.warn('[casetta] TheFork: mancano link e widget (ristorante.json → thefork)');
      },
      configureServer(server) {
        server.watcher.add(contenuti);
        server.watcher.on('change', (file) => {
          if (resolve(file).startsWith(contenuti + sep)) server.ws.send({ type: 'full-reload' });
        });
      },
      transformIndexHtml: {
        order: 'pre',
        handler(html, ctx) {
          return nostra(ctx.filename) ? componi(html, leggi()) : html;
        },
      },
    },
    {
      name: 'casetta:css-in-pagina',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          if (!nostra(ctx.filename) || !ctx.bundle) return html;
          return html.replace(/<link rel="stylesheet"(?: crossorigin)? href="\/(assets\/[^"]+\.css)">/g, (tag, file) => {
            const foglio = ctx.bundle[file];
            return foglio && foglio.type === 'asset' ? `<style>${foglio.source}</style>` : tag;
          });
        },
      },
    },
  ];
}
