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
- **La Casetta di Paparill** (`/anteprime/casetta-paparill/`): sito completo per il ristorante
  di cucina abruzzese e teramana in Via Salara a Roseto (pasta fatta in casa, arrosticini,
  carne alla brace). Niente effetti: è un sito che deve far prenotare. Playfair Display e
  Inter, blu notte, oro, e il corallo solo sulle azioni.
  - **Pagine**: home, menu (in HTML, filtri vegetariano e senza glutine, allergeni del
    Reg. UE 1169/2011, consigli dello chef, menu degustazione, vini, PDF), galleria a schede
    con visore, prenota (TheFork, telefono, messaggio WhatsApp già scritto, modulo per i
    gruppi oltre 10), chi siamo, contatti (mappa Google caricata solo su richiesta), eventi
    privati, lavora con noi, 404.
  - **Contenuti in JSON** (`src/anteprime/casetta/contenuti/`): testi, prezzi, orari e link
    stanno lì, non nell'HTML. Un plugin Vite (`src/anteprime/casetta/render/`) compone le
    pagine in build e nel dev server: HTML statico, CSS dentro la pagina, nessun JavaScript
    per il contenuto. Vedi sotto.
  - **Conversioni**: su mobile una barra fissa Chiama / WhatsApp / Prenota; "Prenota" apre la
    scelta del canale; popup d'uscita solo su desktop, una volta per sessione; titolo
    dell'hero in test A/B (quattro varianti in `testi.json`, `?titolo=b` per forzarne una).
    Gli eventi GA4 sono descritti in `moduli/analisi.js`: Analytics parte solo con un ID in
    `sito.json` e dopo il consenso ai cookie.
  - **SEO**: title e description per pagina, JSON-LD (`Restaurant` con gli orari, `Menu` con i
    piatti, breadcrumb, `WebSite`), manifest PWA e icone; sitemap e robots pronti per il
    dominio vero in `public/anteprime/casetta-paparill/`. Niente `aggregateRating`: Google non
    lo mostra per recensioni raccolte su altri siti.
  - **Immagini provvisorie**: non sono foto ma illustrazioni dipinte su canvas
    (`dev/casetta/`), AVIF + WebP a 600 e 1200 px (hero 1280/2048, hero verticale 750/1080).
    Si rigenerano con `node scripts/render-casetta.mjs` (dev server attivo, Playwright e
    ffmpeg), che rifà anche icone e menu in PDF. Ogni immagine nell'HTML ha un commento `FOTO:`
    con soggetto e proporzioni; nell'anteprima l'alt comincia con "Illustrazione provvisoria".
  - **Da confermare**: i dati verificati (indirizzo, telefoni, email, titolare, voto e numero
    di recensioni TripAdvisor) sono in `ristorante.json`, con le fonti in `_fonti`. Il resto
    (orari, piatti e prezzi, storia, team, WhatsApp) è segnato `[dc]` e nell'anteprima mostra
    l'etichetta "da confermare". Le recensioni sono d'esempio e i moduli non inviano nulla.
    Scadenza nel meta `anteprima-scadenza`, da `sito.json` (30 novembre 2026).
  - Lighthouse 12 (build, mobile, Chromium headless): prestazioni 99–100, accessibilità 100,
    best practice 100 su tutte le pagine; home FCP 1,1 s · LCP 1,8 s · TBT 0 ms · CLS 0. La
    SEO è bassa di proposito per il noindex.

### La Casetta di Paparill: modificare i testi e andare online

| File in `contenuti/` | Cosa contiene |
|---|---|
| `sito.json` | pagine e voci di menu, dominio, base degli indirizzi, anteprima e scadenza, ID GA4 |
| `ristorante.json` | nome, indirizzo, telefoni, WhatsApp, email, orari, link TheFork, TripAdvisor, Google e social |
| `menu.json` | sezioni e piatti (prezzo, allergeni, vegetariano, senza glutine, foto, consigliato), degustazioni, vini, note |
| `testi.json` | tutti gli altri testi, title e description di ogni pagina, varianti del titolo |
| `galleria.json` | foto della home e delle tre categorie, con didascalia e testo alternativo |
| `recensioni.json` | recensioni mostrate in home (oggi d'esempio: `"esempio": true`) |

Nei testi si possono usare `*corsivo*`, `**grassetto**`, `[testo](link)` e `[dc]` (o
`[dc:etichetta]`) per un dato da confermare: nell'anteprima diventa un'etichetta visibile,
online sparisce. Gli orari si scrivono una volta sola, in `ristorante.json`: da lì escono la
tabella, il piede, il JSON-LD, le ore proposte per WhatsApp e il giorno di chiusura.

Le pagine in `anteprime/casetta-paparill/` prendono i contenuti con `{{ t.percorso }}`
(testo), `{{md …}}`, `{{p …}}` (paragrafi), `{{url id-pagina}}` e i blocchi
`<!-- @nome argomenti -->` scritti in `render/blocchi/` (`t` = testi, `r` = ristorante,
`s` = sito). Un percorso o un blocco inesistente ferma la build e dice quale e in che pagina.
Un CMS headless può scrivere questi stessi JSON.

Messa online, sul dominio del ristorante e come progetto a sé:

1. Portare nel nuovo progetto le pagine di `anteprime/casetta-paparill/` (alla radice),
   `src/anteprime/casetta/`, `dev/casetta/`, `scripts/render-casetta.mjs`, i font di
   `public/assets/fonts/`, le immagini `public/assets/img/casetta*` e, in `public/`, i file
   di `public/anteprime/casetta-paparill/` (sitemap, robots, manifest, icone, PDF). Gli
   ingressi di Vite sono la lista `CASETTA` di `vite.config.js`.
2. In `sito.json`: `"anteprima": false`, `"base": "/"`, il dominio definitivo e l'ID GA4.
   Spariscono filigrana, avvisi, etichette, nota ai titolari e noindex; arrivano canonical,
   `og:url`, banner dei cookie e invio dei moduli a Netlify Forms (`eventi` e `candidature`:
   attivare le notifiche email). Le recensioni d'esempio online non vengono mai mostrate.
3. Confermare con il ristorante ogni `[dc]` e ogni `daConfermare`: la build li elenca
   finché ce ne sono. In `ristorante.json` aggiungere link e widget TheFork (`thefork.url`,
   `thefork.widget`), il widget TripAdvisor se serve, Instagram, ragione sociale e partita IVA.
4. Foto vere al posto delle illustrazioni, con gli stessi nomi e le stesse misure
   (AVIF + WebP); recensioni vere, con il permesso degli autori, o il widget TripAdvisor.
5. Scrivere le pagine `privacy/` e `cookie/`, già linkate nel piede.
6. Rifare il menu in PDF (`node scripts/render-casetta.mjs pdf`) e controllare `sitemap.xml`.
7. Redirect 301 dalle pagine del sito attuale (ristorantepaparill.it) alle nuove, poi
   Search Console e scheda Google Business Profile con il nuovo indirizzo del sito.

## Progetti mostrati

Saporito è una **demo non commissionata**: non è affiliata né approvata dall'attività,
il cui marchio appartiene ai legittimi proprietari. Il sito lo dichiara nella card dei
lavori, nel caso studio e nella privacy.

---

© 2026 Prisma Locale. Codice pubblico a scopo di trasparenza; grafica, testi e identità
visiva non sono riutilizzabili senza autorizzazione.
