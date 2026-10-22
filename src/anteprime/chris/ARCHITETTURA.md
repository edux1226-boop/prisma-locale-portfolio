# Chris Beauty — architettura

Sito a pagina unica per **Chris Beauty**, centro estetico. Obiettivo: farsi conoscere e
portare richieste di prenotazione. Pubblico principale: donne tra i 30 e i 40 anni, più
chi cerca la ricostruzione unghie.

Questo file è il piano di lavoro: chi implementa esegue un **passo** alla volta (sezione
"Piano di sviluppo") e spunta la casella quando il passo è verificato.

---

## 1. Regole che valgono per tutto il lavoro

1. **Niente invenzioni.** L'unico servizio noto è la **ricostruzione unghie**. Trattamenti,
   prezzi, promozioni, recensioni, risultati, indirizzo, città, orari, telefono, email,
   Instagram e disponibilità **non sono stati forniti**: restano segnaposto.
2. **Niente foto false.** Non ci sono foto di Chris Beauty nel progetto. Niente stock,
   niente immagini generate che sembrino foto. La galleria e l'hero usano **cornici
   segnaposto** dichiarate ("Foto da inserire: …").
3. **La prenotazione è una richiesta.** Mai "confermata", mai disponibilità in tempo reale,
   mai un orario garantito. Il messaggio di riuscita compare **solo** dopo una risposta
   positiva verificata del servizio di invio.
4. **Leggero.** Niente GSAP, Lenis o Three.js in questa pagina: CSS e poco JavaScript
   vanilla. Obiettivo: JS della pagina sotto 6 KB gzip, Lighthouse mobile ≥ 95 in tutte e
   quattro le voci (la SEO andrà a 100 quando si toglierà il `noindex`, vedi §2).
5. **Accessibile.** Contrasto AA (4.5:1 per il testo, 3:1 per i bordi dei campi), focus
   sempre visibile, tutto usabile da tastiera, `prefers-reduced-motion` rispettato.
6. **Codice come il resto del repo:** nomi e commenti in italiano, commenti brevi che
   spiegano il *perché*, stessa struttura delle altre anteprime.

## 2. Dove vive nel progetto

Il repository è il portfolio di Prisma Locale (Vite 8 multipagina, Netlify). I siti per i
clienti stanno in `anteprime/` (HTML) e `src/anteprime/<nome>/` (codice): Chris Beauty segue
lo stesso schema, così la build resta compatibile.

- URL: `/anteprime/chris-beauty/`.
- Finché ci sono segnaposto: `<meta name="robots" content="noindex, nofollow">` (l'header
  Netlify `X-Robots-Tag` su `/anteprime/*` c'è già). Niente filigrana e niente scadenza:
  il sito deve poter andare online così com'è, una volta completati i dati.
- La cartella è autosufficiente: per spostarla su un dominio suo basta copiare
  `anteprime/chris-beauty/index.html`, `src/anteprime/chris/` e i font usati.

## 3. File

```
anteprime/chris-beauty/index.html        la pagina (tutti i contenuti, SEO, segnaposto)
src/anteprime/chris/
├── ARCHITETTURA.md                      questo file
├── main.js                              ingresso: importa CSS e avvia i moduli
├── testata.js                           header che si compatta, menu mobile su <dialog>
├── rivela.js                            comparsa discreta allo scorrimento (IntersectionObserver)
├── prenota.js                           modulo di prenotazione e stati dell'invio
└── styles/
    ├── tokens.css                       font, colori, scala tipografica, spaziature
    ├── base.css                         reset, tipografia, bottoni, focus, segnaposto, utilità
    ├── testata.css                      header, menu mobile, barra "Prenota" su smartphone
    ├── sezioni.css                      hero, trattamenti, galleria, recensioni
    └── prenota.css                      modulo, informazioni pratiche, footer
scripts/chris-beauty-prenotazioni.gs     Apps Script per il foglio Google della titolare
public/assets/fonts/instrument-serif*.woff2 + LICENSE-instrument-serif.txt
public/assets/img/chris/                 vuota per ora: qui andranno le foto vere
```

Da modificare: `vite.config.js` (nuovo ingresso `chris`), `README.md` (paragrafo nelle
"Anteprime per i clienti").

## 4. Direzione visiva: "Il banco"

Il sito è pensato come il **banco di lavoro di un'estetista appena riordinato**: superficie
bianca, oggetti allineati, ogni cosa al suo posto. Tutto è luminoso e quieto; il carattere
viene da **tre segni**, non da decorazioni.

1. **La fila di campioni.** Cinque cerchi pieni nei toni nude di uno smalto
   (`--campione-1…5`), allineati come boccette sul banco. Compaiono nell'hero, poi uno solo
   segna ogni sezione accanto al suo numero ("01 Trattamenti"). È l'unico elemento
   decorativo del sito. Nell'hero, al caricamento, si "posano" uno dopo l'altro
   (opacità + 6 px, 60 ms di sfasamento); con movimento ridotto sono già fermi.
2. **Il filo del banco.** Una linea sottile (`--filo`) divide le sezioni e incornicia le
   schede, come il bordo di un vassoio. Angoli quasi retti (`--raggio: 6px`), niente ombre
   pesanti: al massimo `--ombra` molto diffusa sulle schede.
3. **Titoli serif grandi su testo grottesco piccolo**, molto spazio intorno. Gerarchie
   chiare: numero di sezione → titolo → testo breve.

### Colori (`tokens.css`)

| Token | Valore | Uso |
|---|---|---|
| `--latte` | `#FBFAF8` | fondo pagina |
| `--bianco` | `#FFFFFF` | schede, modulo |
| `--porcellana` | `#F3EFEB` | fondo delle sezioni alterne, segnaposto foto |
| `--sabbia` | `#E3DBD2` | bordi, divisori marcati |
| `--inchiostro` | `#2A2623` | testo, bottone principale (fondo) |
| `--tenue` | `#6A615A` | testo secondario (≥ 5:1 su `--latte` e `--porcellana`) |
| `--cipria-testo` | `#8B5B4F` | link, numeri di sezione, dettagli testuali (≥ 5:1) |
| `--filo` | `rgb(42 38 35 / 0.14)` | linee sottili |
| `--campione-1…5` | `#F1E3DA` `#E6CBBE` `#D7AE9F` `#C08F80` `#9E6F62` | solo i campioni, mai testo |

Chi implementa **verifica i contrasti** con lo script del passo 6 e corregge i valori se
servono, senza cambiare il carattere della palette.

### Caratteri

- **Instrument Serif** (titoli, OFL) — elegante, ma leggibile già a 28 px. Un solo peso più
  il corsivo, ~25 KB l'uno in woff2 latino. Si scarica da Google Fonts (subset latin) in
  `public/assets/fonts/`. *Se il download non è possibile*, ripiegare su `Bodoni Moda`, già
  nel progetto, con `font-variation-settings: "opsz" 96`.
- **Hanken Grotesk** (testo, già nel progetto) — corpo 16–18 px, interlinea 1.6.
- Preload solo dei due woff2 usati sopra la piega.

### Scala e spazi

Come le altre anteprime: `clamp()` fluidi. `--t-xxl` per il nome nell'hero (max ~7.5rem),
`--t-xl` per i titoli di sezione (max ~4rem). Margine laterale `clamp(20px, 5vw, 96px)`,
sezioni distanziate `clamp(88px, 12vw, 180px)`. Larghezza massima del contenuto 1240 px,
del testo 62ch.

### Movimento

- Una sola regola: gli elementi con `[data-rivela]` passano da `opacity: 0;
  translateY(12px)` a fermi in 600 ms, una volta, quando entrano nello schermo.
- Header: si compatta (fondo pieno e filo) dopo 24 px di scroll. **Non** si nasconde.
- Hover delle schede: il filo diventa `--sabbia` e un campione si colora. Niente
  ingrandimenti.
- Solo `transform` e `opacity`. Lo stato iniziale nascosto vale solo con la classe `motion`
  su `<html>` (aggiunta da uno script inline se `prefers-reduced-motion` non è attivo):
  senza JavaScript o con movimento ridotto tutto è visibile da subito.
- `scroll-behavior: smooth` solo dentro `@media (prefers-reduced-motion: no-preference)`.

## 5. La pagina, sezione per sezione

Tutti i segnaposto hanno lo **stesso aspetto**: la classe `.segnaposto` (testo in
`--cipria-testo` su fondo `--porcellana`, bordo tratteggiato, piccola etichetta "Da
completare") e un commento HTML `<!-- DA COMPLETARE: … -->` sopra, così si trovano tutti
cercando `DA COMPLETARE`.

### `<head>`

- `lang="it"`, title "Chris Beauty · Centro estetico" (la città si aggiunge quando c'è),
  description concreta e senza promesse, Open Graph senza immagine finché non ci sono foto.
- JSON-LD `BeautySalon` con **solo** `name` e `url`; nel commento accanto, i campi da
  aggiungere quando arrivano (`address`, `telephone`, `openingHoursSpecification`,
  `sameAs` per Instagram).
- Favicon SVG inline: la "C" in Instrument Serif su `--latte`, oppure un campione.
- Script inline: aggiunge `js` e, se non c'è movimento ridotto, `motion` a `<html>`.

### 1. Testata — `<header class="testata">`

- Sinistra: "Chris Beauty" come testo (in Instrument Serif), link a `#inizio`. Commento:
  sostituire con il logo quando la titolare lo fornisce.
- Centro (≥ 64em): Trattamenti · Galleria · Recensioni · Contatti.
- Destra, **sempre visibili anche su smartphone**: icona Instagram (link con testo
  nascosto "Instagram di Chris Beauty") + bottone "Prenota" → `#prenota`.
- Sotto i 64em: bottone "Menu" che apre un `<dialog>` a tutto schermo (focus trap, Esc e
  ritorno del focus nativi), con i link grandi e il bottone Prenota. Il dialog si chiude
  quando si sceglie un link.
- **Barra Prenota su smartphone:** sotto i 48em, una barra fissa in basso con "Richiedi un
  appuntamento" compare dopo l'hero e sparisce quando la sezione `#prenota` è visibile
  (IntersectionObserver). `padding-bottom: env(safe-area-inset-bottom)`. Il footer ha
  spazio sufficiente per non finirci sotto.

### 2. Hero — `#inizio`

Due colonne su desktop (testo 6/12, cornice 5/12), una colonna su smartphone (cornice
sotto il testo, più bassa).

- Fila di campioni (§4).
- Occhiello: "Centro estetico · [città]" (città segnaposto).
- `<h1>`: "Chris Beauty".
- Testo (2 righe): "Ricostruzione unghie e [trattamenti principali da inserire], su
  appuntamento." Il resto è segnaposto.
- Due azioni: **Richiedi un appuntamento** (primario → `#prenota`) e **Vedi i
  trattamenti** (secondario → `#trattamenti`).
- Riga di richiamo: tre "pillole" ai trattamenti principali → ancore alle schede. La prima
  è "Ricostruzione unghie", le altre due segnaposto.
- Cornice 4:5 a destra: `.foto-segnaposto` con etichetta "Foto da inserire: la postazione
  di lavoro, luce naturale". Struttura pronta per `<picture>` (commento con l'esempio).

### 3. Trattamenti — `#trattamenti`

- Intestazione: "01" + campione + titolo "Trattamenti" + una riga introduttiva neutra.
- Griglia di schede (1 colonna → 2 a 40em → 3 a 64em). Ogni scheda è un `<article>`:
  titolo `<h3>`, descrizione breve, riga "Durata · Prezzo" e link "Richiedi questo
  trattamento" → `#prenota?trattamento=<valore>` (il JS preseleziona la voce del menu).
- Schede iniziali:
  1. **Ricostruzione unghie** — nome reale; descrizione, durata e prezzo segnaposto.
  2. **Trattamento da completare** ×3 — scheda interamente segnaposto ("Nome del
     trattamento", "Descrizione in una o due frasi", "Durata · Prezzo, se si vogliono
     mostrare").
- Commento sopra la griglia: come duplicare una scheda e ricordarsi di aggiungere la
  stessa voce al `<select>` del modulo.
- Nota sotto la griglia, segnaposto: "Specialità del centro: da indicare".

### 4. Galleria — `#galleria`

- Intestazione "02 · Galleria". Testo: "I lavori di Chris Beauty." + segnaposto.
- Griglia ordinata di **6 cornici** (2 colonne su smartphone, 3 su desktop), proporzioni
  miste fisse (4:5 e 1:1) per non dover ritagliare le foto vere: ogni cornice indica il
  soggetto suggerito ("Foto da inserire: ricostruzione unghie, dettaglio mani", "…: la
  sala", "…: l'ingresso", ecc.).
- Le cornici segnaposto non sono cliccabili. Commento con il markup per una foto vera
  (`<figure>` + `<img loading="lazy" width height alt>`): nessun visore/lightbox finché non
  ci sono foto; se servirà, si aggiungerà un `<dialog>` semplice.
- Sotto: link "Altri lavori su Instagram" (segnaposto Instagram).

### 5. Recensioni — `#recensioni`

- Un unico blocco segnaposto ben riconoscibile: "Recensioni da aggiungere: solo
  testimonianze reali, con il permesso delle clienti." Nessuna stella, nessun nome.
- Avvolto in un commento `<!-- RECENSIONI: inizio/fine -->`: se la titolare non ne ha, si
  elimina il blocco e la voce di menu (indicato nel commento).

### 6. Prenota — `#prenota`

Fondo `--porcellana`, modulo su scheda `--bianco`. A sinistra (desktop) il testo:

- Titolo: "Richiedi un appuntamento".
- Testo: "Compila il modulo: è una **richiesta**, non una prenotazione confermata. Chris
  Beauty ti ricontatta per confermare giorno e orario."
- Contatti alternativi (segnaposto telefono / WhatsApp).

Campi (tutti `required` tranne dove indicato, etichette visibili, `autocomplete` giusto):

| Campo | `name` | Tipo | Note |
|---|---|---|---|
| Nome | `nome` | `text`, `autocomplete="name"` | min 2 caratteri |
| Telefono o email | `recapito` | `text`, `autocomplete="tel"`, `inputmode` libero | accetta un telefono (≥ 6 cifre) **oppure** un'email; messaggio d'errore chiaro |
| Trattamento | `trattamento` | `select` | le stesse voci delle schede + "Altro / da decidere insieme" |
| Data preferita | `data` | `date` | `min` = oggi, impostato dal JS |
| Fascia oraria | `fascia` | `select` | "Mattina", "Pomeriggio", "Indifferente" — commento: da allineare agli orari reali |
| Privacy | `privacy` | `checkbox` | "Ho letto l'informativa privacy" → link a `#privacy` nel footer |
| Trappola | `sito-web` | `text` nascosto | campo honeypot, `tabindex="-1"`, `autocomplete="off"` |

- Errori: sotto ogni campo, collegati con `aria-describedby`, `aria-invalid` sul campo;
  all'invio il focus va al primo campo errato.
- Stato dell'invio: un unico `<p role="status" aria-live="polite">` sotto il bottone.
- `<noscript>`: "Per inviare la richiesta serve JavaScript. Puoi contattare il centro
  a: [contatti]".

### 7. Informazioni pratiche — `#contatti`

Tre blocchi in griglia, ognuno con il suo segnaposto e il commento `DA COMPLETARE`:

- **Dove siamo**: indirizzo (`<address>`), link "Apri in Maps" (commentato finché non c'è
  l'indirizzo). Niente mappa incorporata (peso e cookie di terze parti).
- **Orari**: `<dl>` giorno → orario, tutti segnaposto.
- **Contatti**: telefono (`tel:`), WhatsApp (`wa.me`), email (`mailto:`), tutti segnaposto.

### 8. Instagram e footer

- Fascia Instagram ben visibile prima del footer: icona grande, "Segui Chris Beauty su
  Instagram", nome account segnaposto `[account Instagram da inserire]`, bottone.
- Finché manca il link, **tutti** i link Instagram puntano a `#instagram` (questa fascia)
  e hanno la classe `.is-segnaposto`; nessun account inventato. Un solo commento elenca
  dove sostituire l'URL (testata, menu mobile, galleria, fascia, JSON-LD).
- Footer: nome, ripetizione compatta di contatti e Instagram, `#privacy` con "Informativa
  privacy: testo da fornire dalla titolare (titolare del trattamento, finalità, tempi di
  conservazione)", P. IVA segnaposto, "Sito realizzato da Prisma Locale".

## 9. Prenotazioni: come funziona l'invio

Il modulo ha due attributi, entrambi **vuoti** finché la titolare non li fornisce:

```html
<form data-prenota data-endpoint="" data-whatsapp="" novalidate>
```

`prenota.js` decide così:

1. **Validazione** propria (messaggi in italiano, come in Borgo Spoltino). Se ci sono
   errori, si ferma.
2. Campo trappola pieno → finge un invio riuscito senza inviare nulla (solo i bot lo
   riempiono).
3. **`data-endpoint` presente (Google Fogli):**
   `fetch(endpoint, { method: 'POST', body: new URLSearchParams(new FormData(form)) })`
   — richiesta "semplice" (form-urlencoded, nessun header personalizzato), quindi niente
   preflight CORS; Apps Script risponde con un JSON leggibile dopo il redirect. **Diverso
   dal modulo del portfolio**, che usa `no-cors` e non può sapere se l'invio è riuscito:
   qui serve la conferma vera.
   - Risposta `{ "ok": true }` → messaggio di riuscita (vedi sotto), modulo svuotato.
   - Qualsiasi altra cosa (errore di rete, HTTP ≠ 200, JSON non valido, `ok: false`) →
     messaggio d'errore con i contatti. Il modulo **non** si svuota.
   - Timeout di 15 s con `AbortController` → stesso messaggio d'errore.
4. **Nessun endpoint, ma `data-whatsapp` presente (modalità provvisoria):** il bottone
   apre WhatsApp con un messaggio già compilato con i dati del modulo. Il testo di stato
   dice chiaramente: "Si apre WhatsApp con la richiesta già scritta: **inviala da lì**.
   Finché non la invii, il centro non la riceve." Nessun messaggio di riuscita.
5. **Né endpoint né WhatsApp:** messaggio "Le richieste online non sono ancora attive.
   Per prenotare contatta il centro: [contatti]". I dati restano nel modulo.

Testi degli stati (i contatti sono quelli del footer; finché sono segnaposto, si vedono
come segnaposto):

- **In corso:** "Invio della richiesta…" (bottone disabilitato, `aria-busy`).
- **Riuscito:** "Richiesta ricevuta, grazie [nome]. Non è ancora un appuntamento
  confermato: Chris Beauty ti ricontatta per confermare giorno e orario. Per modificare o
  annullare la richiesta: [telefono / WhatsApp]."
- **Errore:** "La richiesta non è stata inviata. Riprova tra poco oppure contatta il
  centro: [contatti]."

Precompilazione: i link `#prenota?trattamento=…` sono gestiti con un listener sui click
che seleziona la voce e poi scorre alla sezione (l'hash resta `#prenota`).

### Apps Script — `scripts/chris-beauty-prenotazioni.gs`

Stesso schema di `scripts/google-sheets-modulo.gs`, con queste differenze:

- Colonne: `Ricevuta il`, `Nome`, `Recapito`, `Trattamento`, `Data preferita`,
  `Fascia oraria`, `Stato` (sempre "Da confermare": la titolare lo cambia a mano).
- Controlla di nuovo i campi lato server (presenti, lunghezze massime ~200 caratteri) e
  scarta l'honeypot.
- Neutralizza la formula injection: se un valore inizia con `= + - @`, lo prefissa con `'`.
- `LockService` per due invii contemporanei.
- Risponde sempre in JSON: `ContentService.createTextOutput(JSON.stringify({ ok }))
  .setMimeType(ContentService.MimeType.JSON)`.
- `EMAIL_NOTIFICA` e `ID_FOGLIO` vuoti in cima, da compilare **nel progetto Apps Script**,
  non nel repo.

Nessuna chiave o credenziale finisce nel codice pubblico: l'URL `/exec` dell'app web è
pubblico per natura (lo vede chiunque apra il sito) e non dà accesso al foglio.

Istruzioni per la titolare (vanno nel README):

1. Crea il foglio Google, **Estensioni → Apps Script**, incolla lo script, salva.
2. **Distribuisci → Nuova distribuzione → App web**: esegui come *te*, accesso *Chiunque*.
   Autorizza, copia l'URL che finisce con `/exec`.
3. Incolla l'URL in `data-endpoint` del modulo in `anteprime/chris-beauty/index.html`.
4. Prova un invio dal sito pubblicato e controlla che la riga compaia nel foglio.
5. Se modifichi lo script: **Gestisci distribuzioni → Modifica → Nuova versione** (l'URL
   resta lo stesso).

## 10. Piano di sviluppo

Ogni passo è pensato per un solo messaggio a Sonnet con impegno *medium*. Alla fine di
ogni passo: `npm run build` senza errori, controllo visivo a 375 px e 1440 px, commit.

- [x] **Passo 1 — Fondamenta.** Font Instrument Serif in `public/assets/fonts/` con
  licenza; `tokens.css`, `base.css` (reset, tipografia, bottoni, focus, `.segnaposto`,
  `.foto-segnaposto`, `.salta`, `.visually-hidden`); `index.html` con `<head>` completo
  (§5) e lo scheletro di tutte le sezioni con i loro `id`; `main.js` che importa i CSS;
  ingresso `chris` in `vite.config.js`.
- [x] **Passo 2 — Testata e hero.** Header, menu mobile `<dialog>`, barra Prenota su
  smartphone (`testata.js`, `testata.css`); hero completo con campioni e cornice.
- [x] **Passo 3 — Trattamenti, galleria, recensioni.** Contenuti e stili (`sezioni.css`),
  tutti i segnaposto con i commenti `DA COMPLETARE`.
- [x] **Passo 4 — Prenota, contatti, Instagram, footer.** Markup e stili (`prenota.css`),
  `prenota.js` con validazione, i tre comportamenti dell'invio e la precompilazione;
  `scripts/chris-beauty-prenotazioni.gs`.
- [x] **Passo 5 — Movimento.** `rivela.js`, campioni nell'hero, hover delle schede,
  `prefers-reduced-motion`. Controllo che senza JavaScript tutto sia visibile.
- [x] **Passo 6 — Verifiche e consegna.**
  - Playwright (Chromium in `/opt/pw-browsers`): screenshot a 375, 768 e 1440 px;
    navigazione completa da tastiera (Tab dall'inizio alla fine, menu mobile con Esc);
    modulo: errori, precompilazione, stato "non attivo" con endpoint vuoto, riuscita ed
    errore simulando l'endpoint con `page.route()` (`{ ok: true }`, 500, timeout).
    Il test simulato verifica la pagina, **non** l'integrazione Google.
  - Contrasti dei token calcolati con uno script.
  - Lighthouse mobile e desktop sulla build (`npm run preview`).
  - Paragrafo "Chris Beauty" nel README (anteprime + modulo → Google Fogli).
  - Riepilogo finale: file creati/modificati, segnaposto da completare, cosa serve per il
    foglio Google, verifiche fatte (e cosa non è stato possibile verificare).

## 11. Segnaposto da completare (per la titolare)

Logo · città e indirizzo · orari · telefono · WhatsApp · email · account Instagram ·
elenco trattamenti con descrizione, durata e prezzo (se vuole mostrarli) · descrizione e
prezzo della ricostruzione unghie · specialità del centro · foto della postazione, della
sala e dei lavori · recensioni reali autorizzate (facoltative) · fasce orarie del modulo ·
informativa privacy · partita IVA · URL dell'Apps Script (oppure numero WhatsApp per la
modalità provvisoria).
