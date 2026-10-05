/* Plugin Vite dell'anteprima "La Casetta di Paparill".

   1. Compone le pagine in anteprime/casetta-paparill/ dai contenuti JSON:
      l'HTML pubblicato è statico (menu compreso), i testi stanno nei file.
   2. Nella build mette il CSS direttamente nella pagina: niente richieste
      che bloccano il primo disegno (il foglio è piccolo, ~10 kB compresso).

   Nel dev server una modifica a un file JSON ricarica la pagina. */
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { componi } from './componi.js';

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
