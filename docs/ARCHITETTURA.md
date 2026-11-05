# Architettura

## Stack e perché
- **Astro 7 + TypeScript**, output statico: il sito è soprattutto contenuto, zero JS per default.
- **Contenuti in file dati** (`src/data/site.ts`, `src/data/menu.ts`) validati con **Zod** in build. Nessun CMS con login: meno superficie d'attacco. Per modifiche autonome del proprietario: file su repository con pull request, oppure un CMS headless con SSO.
- **Hosting statico su CDN** (consigliato Cloudflare Pages: legge `public/_headers`, HTTP/3, Brotli). Nessuna funzione serverless.
- **Ordini e pagamenti** restano sul flusso ufficiale esterno: il sito non tratta carte né account.

## Mappa pagine
`/` · `/menu/` · `/la-braceria/` · `/il-locale/` · `/ordina/` · `/dove-siamo/` · `/allergeni/` · `/privacy/` · `/404`. «News e promozioni» non incluse (opzionale, solo se il locale le aggiorna).

## Struttura
```
src/
  data/        site.ts, menu.ts (fonte unica dei contenuti)
  layouts/     Base.astro (head, SEO, header, footer, barra azioni)
  components/  Hero.astro, Todo.astro
  pages/       una per rotta + sitemap.xml.ts
  scripts/     main.ts (preferenza movimento, chip menu, mappa), desktop.ts
  styles/      global.css, hero.css
  assets/      immagini (WebP in build, metadati rimossi)
public/        _headers, robots.txt, favicon, .well-known/security.txt
scripts/       serve-dist.mjs (server di test con gli header), scan-dist.mjs
tests/         security.test.mjs
```

## Scelte da sapere
- **Nessuno script o stile inline**: CSP `default-src 'none'`, `script-src 'self'`, `style-src 'self'`. JSON-LD è un blocco dati, non eseguito.
- **Hero:** foto intatta con animazioni CSS. Una prima versione scomponeva la foto in strati con WebGL (Three.js); è stata abbandonata perché da una sola foto a 400 px non rendeva in modo credibile. Il codice non è più nel repository.
- **Segnaposto dati:** i valori da confermare stanno in `docs/DATI_DA_CONFERMARE.md`; `PUBLIC_SHOW_TODO=1` li mostra nell'anteprima.
- **JSON-LD:** orari e `acceptsReservations` omessi finché non confermati.
- **PWA/offline:** non inclusa (opzionale; rischio di prezzi vecchi senza data).
