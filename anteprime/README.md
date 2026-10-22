# Anteprime per i clienti

Demo riservate da mostrare ai titolari prima di un incarico. Non sono linkate dal sito,
hanno `noindex, nofollow` (meta e header Netlify) e una filigrana "DEMO · PRISMA LOCALE".
Ognuna sta in una cartella a sé, con tutto ciò che la riguarda; i font, le immagini e il
codice di movimento condiviso restano fuori (`public/assets/`, `src/js/`).

## Le demo

| Cartella | Indirizzo | Cos'è | Scadenza |
|---|---|---|---|
| [`anima-concept/`](anima-concept/README.md) | `/anteprime/anima-concept/` | Pizzeria multi-impasto, "Un panetto, sei forme" (Three.js) | 15 dic 2026 |
| [`borgo-spoltino/`](borgo-spoltino/README.md) | `/anteprime/borgo-spoltino/` | Location per matrimoni, "Una giornata sul colle" (Three.js) | 30 nov 2026 |
| [`nagoya-sushi/`](nagoya-sushi/README.md) | `/anteprime/nagoya-sushi/` | Sushi, "Il taglio" (Three.js) | 31 ott 2026 |
| [`vecchia-marina/`](vecchia-marina/README.md) | `/anteprime/vecchia-marina/` | Ristorante di pesce, "La linea di galleggiamento" | 15 dic 2026 |
| [`lantica-ricetta/`](lantica-ricetta/README.md) | `/anteprime/lantica-ricetta/` | Pizza in pala, "48 ore, una pala" | 15 dic 2026 |
| [`casetta-paparill/`](casetta-paparill/README.md) | `/anteprime/casetta-paparill/` | Sito completo di più pagine, cucina abruzzese | 30 nov 2026 |
| [`trattoria-luciana/`](trattoria-luciana/README.md) | `/anteprime/trattoria-luciana/` | Flagship Next.js, "Dal mare, alla tavola" | 15 dic 2026 (nella pagina, non sul server) |
| [`destino/`](destino/README.md) | `/anteprime/destino/` | Concept "Dalle 17 alle 3", pagina autonoma | nessuna |
| [`motorsport/`](motorsport/README.md) | `/anteprime/motorsport/` | One-page per gomme e ricambi da corsa | nessuna |
| [`buco-nero/`](buco-nero/README.md) | `/anteprime/buco-nero/` | Esperimento Canvas 2D (Gargantua) | nessuna |

Fuori da `anteprime/` resta `progetti/saporito.html`, il caso studio mostrato sul sito.

## Com'è fatta una cartella

```
anteprime/<nome>/
├── index.html     la pagina (le demo con più pagine hanno una cartella per pagina)
├── src/           sorgenti: JS, CSS, dati, plugin di build
├── dev/           pagine di servizio per generare immagini e anteprime social (non pubblicate)
├── render.mjs     rigenera le immagini: dev server attivo + Playwright (+ ffmpeg)
├── static/        file pubblicati alla lettera nella radice della demo (manifest, robots, PDF…)
└── README.md      cosa fa, come si modifica, cosa resta da confermare
```

Non tutte le demo hanno tutte le voci. Due eccezioni:

- **`destino/`** è una pagina già completa (font e foto incorporati): `src/` + `build.mjs`
  la rigenerano in `index.html`, che Vite pubblica **tale e quale** (elenco `LETTERALI` in
  `vite.config.js`: passare da Vite comprimerebbe il CSS e toglierebbe le licenze dei font).
- **`trattoria-luciana/`** è un'app Next.js a sé, con il suo `package.json`. Non passa da
  Vite: `scripts/build-flagship.mjs` la compila dopo `vite build` e ne copia l'export statico
  in `dist/anteprime/trattoria-luciana/`.

## Lavorare su una demo

```bash
npm install
npm run dev                 # http://localhost:5173/anteprime/<nome>/
node anteprime/<nome>/render.mjs    # rigenera le immagini (con il dev server attivo)
```

- Gli ingressi HTML di Vite sono elencati in `vite.config.js`. Una nuova demo con una sola
  pagina ha bisogno di una riga lì.
- Il contenuto di `static/` viene servito dal dev server e copiato in `dist/` dal plugin
  `staticiDelleDemo` (sempre in `vite.config.js`).
- Il codice di movimento condiviso è `src/js/core/motion.js` (GSAP, ScrollTrigger, Lenis);
  le demo lo importano con un percorso assoluto dalla radice (`/src/js/core/motion.js`).

### Aggiungere una demo

1. Creare `anteprime/<nome>/index.html` (nome in minuscolo, cifre e trattini) con
   `<meta name="robots" content="noindex, nofollow">` e `<meta name="anteprima-scadenza" content="2026-12-31T23:59:59+01:00">`.
2. Aggiungere l'ingresso in `vite.config.js`.
3. Mettere font e immagini in `public/assets/` (le demo non hanno una cartella `assets` propria).
4. Segnare "da confermare" ogni dato non verificato e descriverlo nel README della cartella.

## Protezione lato server

Netlify non esegue PHP: i controlli sul server li fa una **Edge Function**,
`netlify/edge-functions/anteprime.js`, che gira prima della pagina su ogni richiesta
sotto `/anteprime/`. Usa solo API web standard e si prova con `npm test`
(`test/anteprime.test.mjs`, Netlify simulato).

1. **Scadenza.** Legge il meta `anteprima-scadenza` della pagina: dopo quella data
   risponde `410` con "Anteprima scaduta" e la pagina non viene più inviata. Lo script
   nella pagina resta, ma non è più l'unica difesa. **Una pagina senza meta non scade**:
   è il caso di `destino`, `motorsport`, `buco-nero` e `trattoria-luciana` (quest'ultima
   controlla la data solo nel browser, da `lib/sito.ts`).
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
   (`private, no-store`) per le pagine, HSTS, `Cross-Origin-Opener-Policy`, niente
   inclusione in altri siti. Script, font e immagini di un'anteprima senza codice tengono
   invece la cache che dichiara l'origine (`netlify.toml`: `immutable` per `_next/static`).
   Sulle anteprime elencate nella costante `CSP` (oggi solo `anima-concept`) anche
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
