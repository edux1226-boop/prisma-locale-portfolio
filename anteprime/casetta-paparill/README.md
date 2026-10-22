# La Casetta di Paparill

Anteprima riservata, in `/anteprime/casetta-paparill/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Sito completo per il ristorante
di cucina abruzzese e teramana in Via Salara a Roseto (pasta fatta in casa, arrosticini,
carne alla brace). Niente effetti: è un sito che deve far prenotare. Playfair Display e
Inter, blu notte, oro, e il corallo solo sulle azioni.

- **Pagine**: home, menu (in HTML, filtri vegetariano e senza glutine, allergeni del
  Reg. UE 1169/2011, consigli dello chef, menu degustazione, vini, PDF), galleria a schede
  con visore, prenota (TheFork, telefono, messaggio WhatsApp già scritto, modulo per i
  gruppi oltre 10), chi siamo, contatti (mappa Google caricata solo su richiesta), eventi
  privati, lavora con noi, 404.
- **Contenuti in JSON** (`anteprime/casetta-paparill/src/contenuti/`): testi, prezzi, orari e link
  stanno lì, non nell'HTML. Un plugin Vite (`anteprime/casetta-paparill/src/render/`) compone le
  pagine in build e nel dev server: HTML statico, CSS dentro la pagina, nessun JavaScript
  per il contenuto. Vedi sotto.
- **Conversioni**: su mobile una barra fissa Chiama / WhatsApp / Prenota; "Prenota" apre la
  scelta del canale; popup d'uscita solo su desktop, una volta per sessione; titolo
  dell'hero in test A/B (quattro varianti in `testi.json`, `?titolo=b` per forzarne una).
  Gli eventi GA4 sono descritti in `moduli/analisi.js`: Analytics parte solo con un ID in
  `sito.json` e dopo il consenso ai cookie.
- **SEO**: title e description per pagina, JSON-LD (`Restaurant` con gli orari, `Menu` con i
  piatti, breadcrumb, `WebSite`), manifest PWA e icone; sitemap e robots pronti per il
  dominio vero in `anteprime/casetta-paparill/static/`. Niente `aggregateRating`: Google non
  lo mostra per recensioni raccolte su altri siti.
- **Immagini provvisorie**: non sono foto ma illustrazioni dipinte su canvas
  (`anteprime/casetta-paparill/dev/`), AVIF + WebP a 600 e 1200 px (hero 1280/2048, hero verticale 750/1080).
  Si rigenerano con `node anteprime/casetta-paparill/render.mjs` (dev server attivo, Playwright e
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

## Modificare i testi e andare online

| File in `src/contenuti/` | Cosa contiene |
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
`<!-- @nome argomenti -->` scritti in `src/render/blocchi/` (`t` = testi, `r` = ristorante,
`s` = sito). Un percorso o un blocco inesistente ferma la build e dice quale e in che pagina.
Un CMS headless può scrivere questi stessi JSON.

Messa online, sul dominio del ristorante e come progetto a sé:

1. Portare nel nuovo progetto le pagine di `anteprime/casetta-paparill/` (alla radice),
   `anteprime/casetta-paparill/src/`, `anteprime/casetta-paparill/dev/`, `anteprime/casetta-paparill/render.mjs`, i font di
   `public/assets/fonts/`, le immagini `public/assets/img/casetta*` e, in `public/`, i file
   di `anteprime/casetta-paparill/static/` (sitemap, robots, manifest, icone, PDF). Gli
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
6. Rifare il menu in PDF (`node anteprime/casetta-paparill/render.mjs pdf`) e controllare `sitemap.xml`.
7. Redirect 301 dalle pagine del sito attuale (ristorantepaparill.it) alle nuove, poi
   Search Console e scheda Google Business Profile con il nuovo indirizzo del sito. Tra le
   pagine indicizzate oggi: `/primi-piatti/`, `/secondi-piatti/`, `/dessert/` e
   `/lista-dei-vini/` → `/menu/`; `/il-locale/` → `/galleria/`; `/chi-siamo/` e `/contatti/`
   restano uguali. Le ricette (`/ricetta-la-gallotta/`, `/ricetta-agnello-allabruzzese/`)
   portano visite da Google: meglio tenerle che reindirizzarle.
