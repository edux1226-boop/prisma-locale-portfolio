# Prisma Locale

Sito di **Prisma Locale**, studio digitale di Roseto degli Abruzzi: siti web, landing page,
branding e presenza locale per ristoranti, palestre, saloni, B&B e società sportive.

**Online:** [prismalocale.it](https://prismalocale.it)

---

## L'idea

Un prisma prende la luce bianca e la scompone nei colori. Prisma Locale prende un'attività
che online sembra uguale alle altre e ne tira fuori l'identità. Il sito resta quasi
acromatico (Notte, Calce) e lo spettro compare **solo dove nasce un'identità**: il fascio
nell'hero, la vetrina che diventa un sito, i lavori.

Tre mosse firma, tutto il resto quieto:

1. **Il prisma** (hero) — vetro fisico in Three.js (`MeshPhysicalMaterial` con
   `transmission` e `dispersion`) che rifrange un fascio di luce nello spettro.
   Segue il mouse, ruota e scivola con lo scroll.
2. **La vetrina grigia** (Prima e dopo) — sezione pinnata: insegna, vetrina, lavagna e
   foglio sulla porta di una pizzeria qualunque entrano nel prisma ed escono a colori,
   ricomponendo un sito vivo. Pizzeria Bianca è un esempio inventato.
3. **Titoli a maschera** — rivelazione riga per riga con SplitText.

## Stack

| | |
|---|---|
| Build | Vite 8 (multipagina) |
| 3D | Three.js r186, caricato solo su desktop |
| Movimento | GSAP 3.15 (ScrollTrigger, SplitText) + Lenis |
| Caratteri | Newsreader (display, ottica 72) e Schibsted Grotesk, self-hosted e ridotti al latino (~76 KB in tutto) |
| Hosting | Netlify (build `npm run build`, pubblica `dist/`), modulo su Netlify Forms |

Lenis è collegato al ticker di GSAP (`autoRaf: false`): un solo ciclo guida lo scroll,
che a sua volta aggiorna ScrollTrigger.

## Struttura

```
.
├── index.html                 home
├── progetti/saporito.html     caso studio (demo non commissionata)
├── anteprime/                 demo riservate per potenziali clienti (noindex)
├── flagship/                  app Next.js autonome, compilate dentro la build (vedi sotto)
├── privacy.html · grazie.html · 404.html
├── src/
│   ├── styles/                tokens.css · base.css · home.css · page.css
│   └── js/
│       ├── main.js            ingresso della home
│       ├── page.js            ingresso delle pagine interne
│       ├── core/motion.js     GSAP, ScrollTrigger, SplitText, Lenis
│       ├── hero.js            regia dell'hero: 3D o immagine statica
│       ├── prism/             scena Three.js e shader
│       ├── story.js           la vetrina grigia (timeline pinnata)
│       └── ui/                nav, intro, titoli, banco ottico, modulo
├── public/                    font, immagini, favicon, robots, sitemap
├── dev/                       pagine di servizio per generare le immagini (non pubblicate)
├── scripts/render-stills.mjs  rigenera immagini statiche, immagine social e icone
└── scripts/build-flagship.mjs compila i flagship e li copia in dist/ dopo `vite build`
```

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produzione in dist/ (Vite, poi i flagship Next.js)
npm run build:vite # solo il sito Vite
npm run preview    # anteprima della build
```

I flagship in `flagship/` hanno le proprie dipendenze e il proprio `package-lock.json`:
`scripts/build-flagship.mjs` le installa se mancano (`npm ci`), li compila con il base path
dell'anteprima e copia l'export statico in `dist/`. Per lavorarci:
`cd flagship/trattoria-luciana && npm install && npm run dev`.

Su Windows c'è anche `scripts/dev.cmd`.

### Immagini statiche del prisma

Su mobile, con movimento ridotto o se WebGL non è disponibile, l'hero mostra
un'immagine: è **la stessa scena Three.js**, renderizzata in anticipo con la stessa
composizione. Per rigenerarle (dopo aver toccato la scena):

```bash
npm run dev                              # in un terminale
node scripts/render-stills.mjs           # in un altro (richiede Playwright)
```

## Qualità

Misurato con Lighthouse 13 sulla build di produzione:

| Pagina | Performance | Accessibilità | Best practice | SEO |
|---|---|---|---|---|
| Home — mobile | 99 | 100 | 100 | 100 |
| Home — desktop | 100 | 100 | 100 | 100 |
| Caso Saporito — mobile | 99 | 100 | 100 | 100 |

Home mobile: FCP 1,4 s · LCP 2,1 s · TBT 30 ms · CLS 0.
Lighthouse gira senza GPU, quindi il punteggio desktop non misura il costo del 3D: per quello
la scena si regola da sola (vedi sotto).

- **Mobile-first**: niente Three.js sotto i 1024 px o con puntatore touch (il chunk da
  ~146 KB gzip non viene nemmeno scaricato).
- **Il 3D si adatta**: misura il frame rate; se scende abbassa risoluzione e trasmissione,
  se non basta passa all'immagine statica. Si ferma quando l'hero esce dallo schermo o la
  scheda è nascosta.
- **Pulizia**: `cancelAnimationFrame`, dispose di geometrie, materiali, texture, ambiente
  PMREM e renderer, gestione di `webglcontextlost` / `webglcontextrestored`.
- **`prefers-reduced-motion`**: niente Lenis, niente split, niente pin; il prima e il dopo
  restano affiancati e completi.
- **Solo `transform` e `opacity`** nelle animazioni CSS e GSAP.
- **Avvio leggero**: tutto ciò che sta sotto la piega si prepara in `requestIdleCallback`;
  i titoli si dividono solo quando si avvicinano allo schermo; `ScrollTrigger.refresh()`
  una volta, dopo caratteri e immagini.
- HTML semantico, skip link, menu mobile su `<dialog>` nativo, contrasti AA, SEO locale
  (dati strutturati `ProfessionalService`, area servita, Open Graph).

## Da completare

- **Partita IVA** nel footer (obbligatoria per i siti di attività in Italia).
- **Netlify Forms**: al primo deploy attivare le notifiche email del modulo "contatti".
- **Privacy**: il testo è aggiornato al modulo e ai caratteri self-hosted, ma va fatto
  rivedere a un consulente.

## Anteprime per i clienti

`anteprime/` contiene demo riservate da mostrare ai titolari prima di un incarico.
Non sono linkate dal sito, hanno `noindex, nofollow` (meta e header Netlify) e una
filigrana "DEMO · PRISMA LOCALE" anche dentro il canvas 3D.

- **Nagoya Sushi** (`/anteprime/nagoya-sushi/`): concept "Il taglio", scena Three.js
  pinnata (`src/anteprime/nagoya/`). La scadenza è il meta `anteprima-scadenza`
  nella pagina: dopo quella data resta solo "Anteprima scaduta, contatta Prisma Locale".
  La scadenza è lato client, quindi è un deterrente, non una protezione.
  Immagini statiche e immagine social: `node scripts/render-nagoya.mjs` con il dev server attivo.
- **Borgo Spoltino** (`/anteprime/borgo-spoltino/`): location per matrimoni a Mosciano
  Sant'Angelo, concept "Una giornata sul colle". Il sito segue la luce di un matrimonio,
  dal pomeriggio alla notte, sempre sullo stesso colle davanti al Gran Sasso.
  Bodoni Moda e Hanken Grotesk, avorio, pietra, verde d'ulivo e terra; l'ottone solo nei fili.
  - **Sezioni**: sipario d'apertura, hero a tre piani in parallasse, intro, plastico 3D del
    territorio (Gran Sasso → Adriatico → il colle, pinnato), "Il … borgo" (la finestra che
    si apre a tutto schermo), gli spazi su binario orizzontale, la giornata in cinque momenti
    sovrapposti (sticky), la tavola a schede, le occasioni con l'immagine che segue il
    mouse, gallery editoriale con visore, recensioni a rotazione, modulo, mappa disegnata.
  - **Codice** in `src/anteprime/borgo/`: `sections/` (una per sezione), `animations/`
    (rivelazioni, parallasse, cursore e magneti, apertura), `components/visore.js`,
    `three/plastico.js` (scaricato solo su desktop con puntatore fine, quando la sezione
    si avvicina), `styles/` (token, base e un foglio per gruppo di sezioni).
  - **Immagini provvisorie**: non sono foto ma tavole dipinte da uno shader
    (`dev/borgo/tavole.js`), più il plastico fotografato da `dev/borgo/plastico.html`.
    Si rigenerano con `node scripts/render-borgo.mjs` (dev server attivo, Playwright e
    ffmpeg) in `public/assets/img/borgo/`, AVIF + WebP. Per mettere le foto vere basta
    sostituire i file con lo stesso nome: nell'HTML ogni immagine ha un commento `FOTO:`
    con soggetto e proporzioni.
  - Testi d'esempio, recensioni, menu e contatti sono marcati "da confermare"; il modulo
    non invia nulla. Scadenza nel meta `anteprima-scadenza` (30 novembre 2026).
  - Lighthouse (build, Chromium headless): mobile 90 / 100 / 100, desktop 98 / 100 / 100
    (prestazioni, accessibilità, best practice; la SEO è bassa di proposito per il noindex).
- **Destino** (`/anteprime/destino/`): concept "Dalle 17 alle 3", un unico `index.html`
  autonomo (font e foto in base64, script da CDN: Three.js r128, GSAP 3.13, Lenis 1.1.13).
  Si modifica in `dev/destino/` (`index.src.html`, `destino.js`, `assets/`) e si rigenera con
  `node dev/destino/build.mjs`, che scrive `public/anteprime/destino/index.html`.
- **Trattoria Luciana** (`/anteprime/trattoria-luciana/`): concept "Dal mare, alla tavola",
  un digital flagship completo e non una semplice anteprima. App Next.js 16 + React 19 +
  TypeScript in `flagship/trattoria-luciana/` (documentazione nel suo README), export statico.
  - Homepage in undici scene (mare → Roseto → famiglia → pesca → cucina → tavola →
    prenotazione), pagine storia, menu, il mare, prenota, contatti, in italiano, inglese e
    tedesco con indirizzi tradotti.
  - Mare in WebGL (React Three Fiber) solo su desktop capaci, con fermo immagine renderizzato
    dallo stesso shader; tavole provvisorie dipinte da shader (`npm run tavole`), AVIF + WebP.
  - Contenuti in un CMS su Git (Decap) con stato per ogni dato: ciò che è `needs_confirmation`
    si vede segnato nell'anteprima e sparisce in produzione (`SITE_MODE=produzione`).
  - Il modulo invia una richiesta, mai una conferma; nell'anteprima non invia nulla.
    Scadenza in `lib/sito.ts` (15 dicembre 2026).

## Progetti mostrati

Saporito è una **demo non commissionata**: non è affiliata né approvata dall'attività,
il cui marchio appartiene ai legittimi proprietari. Il sito lo dichiara nella card dei
lavori, nel caso studio e nella privacy.

---

© 2026 Prisma Locale. Codice pubblico a scopo di trasparenza; grafica, testi e identità
visiva non sono riutilizzabili senza autorizzazione.
