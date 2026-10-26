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
├── anteprime/                 demo riservate per potenziali clienti (noindex)
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
└── scripts/render-stills.mjs  rigenera immagini statiche, immagine social e icone
```

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # produzione in dist/
npm run preview    # anteprima della build
```

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
- **Morsi** (`/anteprime/morsi/`): smash burger, fried chicken e melt sandwich a Pineto e
  Roseto degli Abruzzi, concept "No fast food, ma quality food": il menu a quadretti che
  prende vita, acceso dal neon blu della sala. Il locale non ha un sito (vive su Instagram
  e Deliveroo). Archivo Expanded (titoli, il più vicino al grottesco largo del menu cartaceo)
  e Familjen Grotesk; blu `#0504FF` dal logo, inchiostro `#00408A` dal menu, arancio e
  giallo solo come accenti.
  - **Tre mosse firma**: il neon che si accende nell'hero (flicker in CSS, solo `opacity`);
    lo smash pinnato (la polpetta cade, la spatola la schiaccia, si forma la crosta, poi
    si impilano potato roll, salsa, smash, cheddar, bacon, uovo; a panino finito il
    selettore x1–x4 aggiunge smash); il morso, cioè semicerchi tagliati su foto e bottoni,
    e sulle card del menu un secondo morso più grande al passaggio del mouse.
  - **Sezioni**: hero con selettore sede sempre nell'header, il nostro smash, menu cartaceo
    in HTML con filtri a schede, piatto firma (Morsi Melt), la sala, recensioni d'esempio,
    "Dove siamo" con mappa SVG della costa e due schede, nota "cosa va confermato", footer.
  - **Sede**: Pineto / Roseto cambiano indirizzo, orari, telefono, link Deliveroo, schede e
    mappa in tutto il sito; la scelta resta in `localStorage` (con `try/catch`). Il numero
    di Roseto non ricade mai su quello di Pineto.
  - **Contenuto guidato dai dati**: `src/anteprime/morsi/data/` (`menu.js`, `sedi.js`,
    `recensioni.js`, `daConfermare.js`, `panino.js`) è l'unica fonte. Il plugin Vite
    `scripts/vite-morsi.mjs` genera da lì l'HTML (menu, sedi, recensioni, JSON-LD
    `Restaurant` con le due sedi, scena dello smash): la pagina esce completa, il JS aggiunge
    solo comportamento. I prezzi sono quelli indicativi di Deliveroo; dove manca il prezzo
    compare "—". Per aggiornare il menu basta modificare `data/menu.js`.
  - **Codice** in `src/anteprime/morsi/`: `core/` (sede, movimento), `sections/` (menu,
    nav mobile, selettore smash), `animations/` (smash, rivelazioni), `render/` (HTML dai
    dati), `svg/` (logo e mascotte), `styles/`.
  - **Movimento ridotto**: niente Lenis né pin, neon acceso e fermo, contenuti completi e
    statici; il selettore x1–x4 funziona comunque. Con JavaScript disattivato il menu mostra
    tutte le sezioni. Il JS di GSAP e Lenis si scarica solo se il movimento è attivo.
  - **Immagini**: le foto di riferimento (piccole, da telefono) sono in `dev/morsi/foto/`;
    `node scripts/render-morsi.mjs` (con `npm i --no-save sharp`) ricava AVIF + WebP in
    `public/assets/img/morsi/`: versione nativa `-m`, ingrandita con grana `-l`, e
    il duotono blu per il fondo dell'hero. Dove manca una foto (singoli panini, patatine,
    pollo, esterni) c'è un'illustrazione a linea `segnaposto-*.svg`, con commento `FOTO:`
    (soggetto e proporzioni); si sostituisce mettendo la foto con lo stesso nome e
    aggiornando il riferimento. Immagine social: `node scripts/render-morsi-og.mjs`
    (Playwright + sharp) da `dev/morsi/og.html`.
  - **Logo e mascotte**: ricostruiti come SVG da logo e menu cartaceo (`svg/logo.svg` ha il
    commento `LOGO: sostituire con il vettoriale ufficiale`). Il menu cartaceo e il logo sono
    materiale del locale: non vanno riusati fuori dall'anteprima.
  - Scadenza nel meta `anteprima-scadenza` (31 dicembre 2026), `noindex, nofollow` in meta e
    header Netlify, filigrana "DEMO · PRISMA LOCALE" sempre visibile.
  - Lighthouse (build di produzione, Chromium headless): mobile 95–97 / 100 / 100, desktop
    100 / 100 / 100 (prestazioni, accessibilità, best practice; la SEO è bassa di proposito
    per il noindex). LCP mobile 2,5–2,9 s, TBT 60 ms, CLS 0.
  - **Da confermare con i titolari** (nella pagina compare il chip "da confermare"):
    civico di Pineto (117 o 115), orari (sera 19:00–24:00, sabato fino all'1:00; anche il
    pranzo?), telefono di Roseto, quale scheda Deliveroo di Roseto è attiva e se c'è delivery
    da Pineto, prezzi (mancano quasi tutti), quantità "pz" di jalapeño pops, chicken pops e
    fried chicken, storia (anno di apertura, titolari: `[STORIA DA RACCOGLIERE CON I
    TITOLARI]`), logo vettoriale e font ufficiali, foto in alta risoluzione, recensioni vere
    al posto degli esempi, la media 4,5/5 di Pineto (una sola fonte), se il Morsi Melt è
    davvero "il più fotografato", partita IVA e ragione sociale.
- **Destino** (`/anteprime/destino/`): concept "Dalle 17 alle 3", un unico `index.html`
  autonomo (font e foto in base64, script da CDN: Three.js r128, GSAP 3.13, Lenis 1.1.13).
  Si modifica in `dev/destino/` (`index.src.html`, `destino.js`, `assets/`) e si rigenera con
  `node dev/destino/build.mjs`, che scrive `public/anteprime/destino/index.html`.

## Modulo contatti → Google Fogli

1. Crea un foglio Google, poi **Estensioni → Apps Script** (oppure un progetto indipendente: in quel caso scrivi l'ID del foglio in `ID_FOGLIO`) e incolla `scripts/google-sheets-modulo.gs`.
2. **Distribuisci → Nuova distribuzione → App web**: esegui come *te*, accesso *Chiunque*. Autorizza e copia l'URL `.../exec`.
3. Incolla l'URL in `data-endpoint` del `<form>` in `index.html` e pubblica.
4. Con `data-endpoint` vuoto il modulo usa Netlify Forms. Il foglio si scarica in Excel da File → Scarica.

## Progetti mostrati

Per ora nessun caso studio: quello di Saporito (demo non commissionata) è stato tolto dal sito.
Il primo caso studio vero si aggiunge quando il primo lavoro commissionato è chiuso.

---

© 2026 Prisma Locale. Codice pubblico a scopo di trasparenza; grafica, testi e identità
visiva non sono riutilizzabili senza autorizzazione.
