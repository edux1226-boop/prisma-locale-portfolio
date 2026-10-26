/* Plugin Vite per l'anteprima Morsi: genera dai file di src/anteprime/morsi/data/ l'HTML di menu,
   sedi, recensioni, JSON-LD e scena dello smash, così il contenuto vive in un solo posto.
   Funziona in `vite dev` (ricarica la pagina quando cambiano dati o SVG) e in `vite build`. */
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const radice = resolve(import.meta.dirname, '..');
const pagina = resolve(radice, 'anteprime/morsi/index.html');
const modulo = '/src/anteprime/morsi/render/pagina.js';
const sorgenti = resolve(radice, 'src/anteprime/morsi') + sep;

export default function morsi() {
  return {
    name: 'morsi-html',
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
      if (f.startsWith(sorgenti) && /[/\\](data|render|svg)[/\\]/.test(f)) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
