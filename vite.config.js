import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { cartaAnima } from './src/anteprime/anima/build/carta.js';

const root = import.meta.dirname;

export default defineConfig({
  appType: 'mpa',
  plugins: [cartaAnima()],
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
        anima: resolve(root, 'anteprime/anima-concept/index.html'),
      },
    },
  },
});
