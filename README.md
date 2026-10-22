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
├── netlify/edge-functions/    protezione delle anteprime lato server (scadenza, codice, header)
├── test/                      test dell'Edge Function (npm test)
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

### Protezione lato server

Netlify non esegue PHP: i controlli sul server li fa una **Edge Function**,
`netlify/edge-functions/anteprime.js`, che gira prima della pagina su ogni richiesta
sotto `/anteprime/`. Usa solo API web standard e si prova con `npm test`
(`test/anteprime.test.mjs`, Netlify simulato).

1. **Scadenza.** Legge il meta `anteprima-scadenza` della pagina: dopo quella data
   risponde `410` con "Anteprima scaduta" e la pagina non viene più inviata. Lo script
   nella pagina resta, ma non è più l'unica difesa. Una pagina senza meta non scade.
2. **Codice nel link** (facoltativo, per anteprima). Si attiva con la variabile
   d'ambiente `ANTEPRIMA_CODICI` su Netlify (*Project configuration → Environment
   variables*, con l'ambito delle funzioni), un JSON come
   `{"anima-concept": "un-codice-lungo-e-casuale"}` (almeno 12 caratteri; per
   generarne uno: `node -e "console.log(crypto.randomBytes(18).toString('base64url'))"`).
   Al titolare si manda `…/anteprime/anima-concept/?k=<codice>`: il codice giusto lascia
   un cookie `HttpOnly` con la sua impronta SHA-256 (mai il codice) per 60 giorni e
   reindirizza all'indirizzo pulito; senza codice o cookie si vede "Anteprima riservata"
   (`403`). Senza variabile, o senza voce per quell'anteprima, la pagina resta aperta a
   chi ha il link. Una variabile scritta male invece chiude: JSON non valido → tutte le
   anteprime `503`, codice più corto di 12 caratteri → quell'anteprima `503`.
   - La variabile va impostata per **tutti i contesti** (Production, Deploy Previews,
     Branch deploys): un contesto senza variabile non chiede il codice.
   - Dopo averla cambiata serve un nuovo deploy (*Deploys → Trigger deploy*): fino ad
     allora vale il codice vecchio. Cambiando il codice, i cookie vecchi smettono di valere.
   - Ogni deploy resta raggiungibile al suo indirizzo permanente
     (`<id>--prismalocale.netlify.app`) con la funzione di quel momento: i deploy fatti
     prima della protezione vanno cancellati da Netlify se l'anteprima deve restare chiusa.
3. **Header di sicurezza** su tutte le anteprime: niente cache condivisa
   (`private, no-store`), HSTS, `Cross-Origin-Opener-Policy`, niente inclusione in altri
   siti. Sulle anteprime elencate nella costante `CSP` (oggi solo `anima-concept`) anche
   una Content-Security-Policy stretta, con un nonce nuovo a ogni richiesta per gli script
   in linea: niente risorse esterne, niente stili in linea. Prima di aggiungere
   un'anteprima alla lista va provata con la policy attiva.

Prima di ogni controllo l'indirizzo si riporta alla forma canonica (`anima%2Dconcept`,
barre doppie, cartella senza barra finale → `308`); un nome non valido è `404`, un
metodo diverso da GET/HEAD è `405`. L'origine si legge sempre per intero (niente Range
né richieste condizionali), così la scadenza vale anche per HEAD e richieste parziali.

**Limiti.** Le immagini e gli script stanno in `/assets/` e restano pubblici a chi ne
conosce l'indirizzo. Soprattutto, **il repository è pubblico**: il sorgente di ogni
anteprima (testi, menu, contatti) si legge su GitHub senza codice e senza scadenza.
La funzione ferma chi passa dal sito, non chi va a leggere il codice. Per una
riservatezza vera il repository va reso privato (Netlify continua a pubblicare
attraverso la sua app GitHub) o le anteprime vanno spostate in un repository privato.

- **Nagoya Sushi** (`/anteprime/nagoya-sushi/`): concept "Il taglio", scena Three.js
  pinnata (`src/anteprime/nagoya/`). La scadenza è il meta `anteprima-scadenza`
  nella pagina: dopo quella data resta solo "Anteprima scaduta, contatta Prisma Locale".
  La fa rispettare anche il server (vedi "Protezione lato server").
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
    si avvicina; disegna solo quando cambiano scroll, mouse o misura, l'ombra si calcola
    una volta), `styles/` (token, base e un foglio per gruppo di sezioni). Le finestre
    (`<dialog>`) bloccano la pagina con una sola regola CSS (`html:has(dialog:modal)`) e
    hanno `data-lenis-prevent`, così dentro si scorre.
  - **Immagini provvisorie**: non sono foto ma tavole dipinte da uno shader
    (`dev/borgo/tavole.js`), più il plastico fotografato da `dev/borgo/plastico.html`.
    Si rigenerano con `node scripts/render-borgo.mjs` (dev server attivo, Playwright e
    ffmpeg) in `public/assets/img/borgo/`, AVIF + WebP (AVIF con trasparenza per i piani
    dell'hero); ogni proporzione si disegna una volta e le misure minori si scalano. Per mettere le foto vere basta
    sostituire i file con lo stesso nome: nell'HTML ogni immagine ha un commento `FOTO:`
    con soggetto e proporzioni.
  - Testi d'esempio, recensioni, menu e contatti sono marcati "da confermare"; il modulo
    non invia nulla. Scadenza nel meta `anteprima-scadenza` (30 novembre 2026).
  - Lighthouse (build, Chromium headless): mobile 93 / 100 / 100, desktop 98 / 100 / 100
    (prestazioni, accessibilità, best practice; la SEO è bassa di proposito per il noindex).
- **Destino** (`/anteprime/destino/`): concept "Dalle 17 alle 3", un unico `index.html`
  autonomo (font e foto in base64, script da CDN: Three.js r128, GSAP 3.13, Lenis 1.1.13).
  Si modifica in `dev/destino/` (`index.src.html`, `destino.js`, `assets/`) e si rigenera con
  `node dev/destino/build.mjs`, che scrive `public/anteprime/destino/index.html`.
- **Anima Concept Pizza** (`/anteprime/anima-concept/`): pizzeria multi-impasto in via
  Nazionale Nord a Roseto, concept "Un panetto, sei forme". Il nome viene dai 21 grammi
  dell'anima (Anima ha aperto il 21 novembre 2019); la promessa è che non c'è una pizza
  della casa, ma una pasta che diventa sei pizze diverse.
  - **Mossa firma**: un panetto 3D (`src/anteprime/anima/three/impasto.js`) fisso dietro
    l'apertura e gli impasti. Scorrendo diventa tonda, romana scrocchiarella, padellino nel
    tegamino, pala sul tagliere (metà rossa e metà bianca, i "due gusti") e teglia, poi torna
    panetto per il senza glutine. È una sola sfera deformata nello shader: profilo della
    pizza × pianta a superellisse, normali per differenze finite, condimento e leopardatura
    nel fragment. Solo desktop con puntatore fine, movimento consentito e WebGL 2; il chunk
    di three.js si scarica solo lì. Se il frame rate non regge, torna alle immagini.
  - **Direzione**: i materiali del banco. Semola `#F1E7C8`, bruciatura `#26170F` (il bruno
    delle macchie del cornicione), pomodoro `#C42A1C` solo per le azioni, basilico `#2E5B35`
    per le voci vegetariane. Fraunces ridotta (opsz 72, assi peso e SOFT, 58 KB) per i titoli,
    "gonfia" come pasta; Manrope (22 KB) per il testo. Il titolo dell'apertura lievita lettera
    per lettera (CSS, `@property --soft` da 0 a 100): è l'unico movimento non richiesto.
    Niente GSAP né Lenis in questa pagina.
  - **Menu**: un solo file, `src/anteprime/anima/dati/carta.js` (dal menu PDF del 16/12/2025
    e da TheFork). Il plugin `src/anteprime/anima/build/carta.js` lo scrive come HTML statico
    nella pagina (segnaposto `<!-- @carta -->`), quindi è leggibile senza JavaScript e
    indicizzabile in produzione. I codici allergeni sono quelli del menu del locale: la
    legenda va ricopiata dal PDF, non ricostruita.
  - **Immagini**: non sono foto. Sono fotogrammi della stessa scena 3D, usati su telefono,
    con movimento ridotto e come ripiego: `node scripts/render-anima.mjs` (dev server attivo,
    Playwright e ffmpeg) li rigenera in `public/assets/img/anima/`, AVIF + WebP, più
    `anima-og.jpg`. Pagina di servizio: `dev/anima/impasto.html?tappa=1&w=1200&h=900`.
  - **Dati**: ciò che non è verificato porta il segno "da confermare" (orari, lunedì,
    parcheggio, la quota del 70% sulla romana, la data di apertura, i riconoscimenti,
    Instagram). Nessuna recensione citata: solo i voti di TheFork e Tripadvisor con la data.
    JSON-LD `Restaurant` senza orari. La nota per il locale elenca cosa manca.
    Scadenza nel meta `anteprima-scadenza` (15 dicembre 2026).
  - Lighthouse 12 (build, Chromium headless, 14/10/2026): mobile 100 / 100 / 100
    (FCP 1,0 s, LCP 1,7 s, TBT 0 ms, CLS 0,002), desktop 100 / 100 / 100; un'esecuzione
    precedente ha dato 97 su mobile. SEO bassa di proposito per il noindex.
    axe-core 4.10: nessuna violazione WCAG 2.1 AA su desktop e telefono.

## Progetti mostrati

Saporito è una **demo non commissionata**: non è affiliata né approvata dall'attività,
il cui marchio appartiene ai legittimi proprietari. Il sito lo dichiara nella card dei
lavori, nel caso studio e nella privacy.

---

© 2026 Prisma Locale. Codice pubblico a scopo di trasparenza; grafica, testi e identità
visiva non sono riutilizzabili senza autorizzazione.
