import { cpSync, createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { defineConfig } from 'vite';
import { cartaAnima } from './anteprime/anima-concept/src/build/carta.js';
import { casetta } from './anteprime/casetta-paparill/src/render/plugin.js';

const root = import.meta.dirname;
const ANTEPRIME = resolve(root, 'anteprime');

/* Ogni demo può avere una cartella static/ con file da pubblicare alla lettera
   nella radice del proprio indirizzo (icone, manifest, robots, sitemap, PDF).
   In sviluppo la pagina /anteprime/<nome>/<file> la serve da lì se non esiste. */
const TIPI = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.ico': 'image/x-icon',
};
// Pagine già complete e autonome (font e immagini incorporati): si pubblicano tali e quali,
// senza passare da Vite, che comprimerebbe il CSS e toglierebbe i commenti con le licenze.
const LETTERALI = ['destino'];
const conStatici = () => readdirSync(ANTEPRIME, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(resolve(ANTEPRIME, d.name, 'static')))
  .map((d) => d.name);

function staticiDelleDemo() {
  let uscita;
  return {
    name: 'anteprime-statici',
    configResolved(config) { uscita = resolve(config.root, config.build.outDir); },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = /^\/anteprime\/([a-z0-9-]+)\/([^?#]+)/.exec(req.url || '');
        if (!m) return next();
        const cartella = resolve(ANTEPRIME, m[1], 'static');
        const file = resolve(cartella, decodeURIComponent(m[2]));
        if (!file.startsWith(cartella + sep) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader('Content-Type', TIPI[extname(file)] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      for (const nome of conStatici()) {
        cpSync(resolve(ANTEPRIME, nome, 'static'), resolve(uscita, 'anteprime', nome), { recursive: true });
      }
      for (const nome of LETTERALI) {
        cpSync(resolve(ANTEPRIME, nome, 'index.html'), resolve(uscita, 'anteprime', nome, 'index.html'));
      }
    },
  };
}

// Anteprima "La Casetta di Paparill": un sito di più pagine, composto dai
// contenuti JSON in anteprime/casetta-paparill/src/contenuti/.
const CASETTA = ['', 'menu', 'galleria', 'prenota', 'chi-siamo', 'contatti', 'eventi-privati', 'lavora-con-noi'];
const casettaInput = {
  ...Object.fromEntries(CASETTA.map((pagina) => [
    `casetta${pagina ? `-${pagina}` : ''}`,
    resolve(root, 'anteprime/casetta-paparill', pagina, 'index.html'),
  ])),
  'casetta-404': resolve(root, 'anteprime/casetta-paparill/404.html'),
};

export default defineConfig({
  appType: 'mpa',
  plugins: [cartaAnima(), casetta({ root }), staticiDelleDemo()],
  // anteprime/trattoria-luciana è un'app Next.js autonoma, con la sua build (scripts/build-flagship.mjs)
  server: { watch: { ignored: ['**/anteprime/trattoria-luciana/**'] } },
  build: {
    target: 'es2022',
    // three.js (~146 kB gzip) vive in un chunk a parte, caricato solo su desktop.
    chunkSizeWarningLimit: 650,
    rolldownOptions: {
      input: {
        home: resolve(root, 'index.html'),
        saporito: resolve(root, 'progetti/saporito.html'),
        privacy: resolve(root, 'privacy.html'),
        grazie: resolve(root, 'grazie.html'),
        notFound: resolve(root, '404.html'),
        nagoya: resolve(root, 'anteprime/nagoya-sushi/index.html'),
        borgo: resolve(root, 'anteprime/borgo-spoltino/index.html'),
        motorsport: resolve(root, 'anteprime/motorsport/index.html'),
        bucoNero: resolve(root, 'anteprime/buco-nero/index.html'),
        anima: resolve(root, 'anteprime/anima-concept/index.html'),
        marina: resolve(root, 'anteprime/vecchia-marina/index.html'),
        ricetta: resolve(root, 'anteprime/lantica-ricetta/index.html'),
        ...casettaInput,
      },
    },
  },
});
