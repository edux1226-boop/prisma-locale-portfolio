import type { NextConfig } from 'next';

/* Export statico: il sito è HTML puro su CDN, senza server.
   - BASE_PATH:  sottocartella di pubblicazione (l'anteprima vive su
                 prismalocale.it/anteprime/trattoria-luciana); vuoto in sviluppo
                 e sul dominio del ristorante.
   - SITE_MODE:  "anteprima" (predefinito) mostra i dati da confermare con il loro
                 segno; "produzione" li toglie dalla pagina. Vedi lib/sito.ts.
   - SITE_URL:   origine pubblica per canonical, hreflang e sitemap (altrimenti
                 il dominio confermato nel CMS).
   - IMAGE_CDN:  "netlify" per servire le foto caricate dal CMS ridimensionate. */
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const modalita = process.env.SITE_MODE === 'produzione' ? 'produzione' : 'anteprima';

const config: NextConfig = {
  output: 'export',
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  agentRules: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_MODE: modalita,
    NEXT_PUBLIC_IMAGE_CDN: process.env.IMAGE_CDN ?? '',
  },
  // il repository ha un altro package-lock nella radice: la radice è questa cartella
  turbopack: { root: process.cwd() },
};

export default config;
