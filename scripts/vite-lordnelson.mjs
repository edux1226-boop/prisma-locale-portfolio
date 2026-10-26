/* Plugin Vite per l'anteprima Lord Nelson: genera dai file di src/anteprime/lord-nelson/data/
   il menu, la flotta dei Big, le schede, la mappa e il JSON-LD, così il contenuto vive in un solo posto.
   Funziona in `vite dev` (ricarica la pagina quando cambiano dati o render) e in `vite build`. */
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const radice = resolve(import.meta.dirname, '..');
const pagina = resolve(radice, 'anteprime/lord-nelson/index.html');
const modulo = '/src/anteprime/lord-nelson/render/pagina.js';
const sorgenti = resolve(radice, 'src/anteprime/lord-nelson') + sep;

export default function lordNelson() {
  return {
    name: 'lord-nelson-html',
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        if (resolve(ctx.filename || '') !== pagina) return html;
        const m = ctx.server
          ? await ctx.server.ssrLoadModule(modulo)
          : await import(pathToFileURL(resolve(radice, `.${modulo}`)).href);
        return m.renderPagina(html);
      },
    },
    handleHotUpdate({ file, server }) {
      const f = resolve(file);
      if (f.startsWith(sorgenti) && /[/\\](data|render)[/\\]/.test(f)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
