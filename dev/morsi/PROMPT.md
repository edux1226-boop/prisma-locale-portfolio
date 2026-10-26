# Prompt per Claude Code: anteprima "Morsi" (smash burger, Pineto e Roseto)

> Incolla tutto quello che sta sotto la riga in una nuova sessione di Claude Code aperta
> su questo repository. Materiali di partenza: `dev/morsi/dossier.md` (ricerca sul locale)
> e `dev/morsi/foto/` (5 foto fornite dal cliente).

---

## Ruolo e obiettivo

Sei un front-end designer/developer senior. Costruisci in questo repository
(`prisma-locale-portfolio`, sito di Prisma Locale) una **nuova anteprima riservata** per
**Morsi**, hamburgeria di smash burger, fried chicken e melt sandwich con due sedi sulla
costa teramana: **Pineto** (sede storica) e **Roseto degli Abruzzi** (nuova sede).

L'anteprima va mostrata ai titolari prima di un incarico: deve far dire "questo è il
nostro locale, ma meglio di come lo raccontiamo oggi". Il locale **non ha un sito**:
oggi vive su Instagram (@morsi_burger, ~4,8k follower) e Deliveroo.

Prima di scrivere codice:
1. Leggi `README.md` (sezione "Anteprime per i clienti") e studia come sono fatte
   `anteprime/borgo-spoltino/` e `anteprime/nagoya-sushi/` (struttura, `vite.config.js`,
   `netlify.toml`, filigrana, meta `anteprima-scadenza`, `noindex`).
2. Leggi `dev/morsi/dossier.md` per intero. Rispetta i suoi livelli di affidabilità:
   ciò che è ⚠️ o 🟡 va marcato "da confermare" nel sito.
3. Guarda le 5 foto in `dev/morsi/foto/`.
4. Proponimi in breve concept, mappa delle sezioni e scelte tecniche, poi procedi.

## Vincoli del repository (non negoziabili)

- Percorso pubblico: **`/anteprime/morsi/`**, voce aggiunta in `vite.config.js`
  (multipagina) come le altre anteprime. Codice in `src/anteprime/morsi/`
  (`sections/`, `animations/`, `styles/` come per Borgo).
- `noindex, nofollow` nel meta **e** negli header Netlify; non linkata dal sito.
- Filigrana fissa **"DEMO · PRISMA LOCALE"**, discreta ma sempre visibile.
- Meta `anteprima-scadenza` a **31 dicembre 2026**: dopo quella data resta solo
  "Anteprima scaduta, contatta Prisma Locale" (riusa la logica esistente).
- Stack del repo: Vite, GSAP 3 (ScrollTrigger, SplitText), Lenis collegato al ticker
  GSAP. Three.js solo se davvero serve e solo su desktop con puntatore fine.
- Animazioni solo su `transform` e `opacity`. `prefers-reduced-motion` rispettato:
  niente Lenis, niente pin, contenuti completi e statici.
- Mobile-first (il pubblico è giovane e arriva quasi tutto da Instagram su telefono).
  Obiettivo Lighthouse mobile ≥ 90 prestazioni, 100 accessibilità e best practice.
- Font self-hosted, ridotti al latino, in `public/`. Immagini AVIF + WebP con
  `width`/`height`, `loading="lazy"` sotto la piega.
- Aggiorna `README.md` con la scheda dell'anteprima, nello stesso stile delle altre.

## Identità visiva (rilevata dalle foto, non inventata)

Il dossier non aveva visto immagini; le foto ora chiariscono l'identità. Usala fedelmente.

**Logo** (`logo-su-blu.webp`): wordmark bianco "MORSI" in lettere grasse e morbide,
con la **O trasformata in una faccina sorridente con cappellino** e la S finale
"ondulata". Non ridisegnarlo a mano: ricostruiscilo come SVG pulito il più fedele
possibile e **lascia un commento `LOGO: sostituire con il vettoriale ufficiale`**.

**Palette**
| Token | Valore | Dove si vede |
|---|---|---|
| `--morsi-blu` | `#0504FF` (campionato dal logo) | sfondo del logo, neon, colore di marca pieno |
| `--inchiostro` | `#00408A` (campionato dal menu) | testi e linee del menu cartaceo |
| `--carta` | `#FFFFFF` / bianco leggermente caldo | fondo del menu, carta del panino |
| `--arancio-sedia` | ~`#F26B21` (da ricampionare con luce neutra) | sedie Tolix arancioni in sala |
| `--blu-notte` | ~`#1B1F5C` | sedie Tolix blu scuro, tavoli |
| `--tuorlo` | giallo-arancio del tuorlo/cheddar, solo come accento caldo | foto del Morsi Melt |

Il blu elettrico domina; arancio e giallo sono accenti piccoli (prezzi, badge, hover).
Verifica i contrasti AA: il testo bianco su `#0504FF` passa, il blu su bianco anche.

**Linguaggio grafico** (`menu-cartaceo.webp`)
- **Carta a quadretti blu** (griglia di linee sottili) in testa e in fondo al menu.
- Titoli in **grottesco nero, maiuscolo, largo** ("SMASH BURGERS", "MELT SANDWICHES").
- Riquadri a **bordo tratteggiato con angoli arrotondati** per i box speciali.
- Badge disegnati a mano ("best seller" a nuvoletta, esplosione "new" sui Melt).
- Indicatori **x1 / x2 / x3 / x4** sottolineati, per il numero di smash.
- Freccia disegnata "Fame extralarge? Aggiungi smash burger extra".
- **Mascotte**: omino a linea blu con la testa-faccina del logo e cappellino, che
  saluta col pollice e tiene un panino. Usala come personaggio ricorrente (stato vuoto,
  footer, 404 dell'anteprima, piccole reazioni), disegnata come SVG a linea.
- La carta su cui è fotografato il panino (`morsi-melt.webp`) ha **faccine blu
  stampate**: è il packaging. Riprendila come pattern di sfondo leggero.

**Locale** (`interno-sala.webp`, `insegna-neon.webp`)
- Sala con pareti bianche e **luce blu ambientale**, insegna al **neon blu**, rete
  metallica nera a parete, lampade industriali a cupola, tavolini bianchi, sedie Tolix
  arancioni e blu, parquet, camicie hawaiane con il logo in vetrina a parete
  (merchandising).
- Lo slogan sul neon è il claim del brand: **"NO FAST FOOD MA QUALITY FOOD"**.
  Usalo testualmente (è loro, non va riscritto).

**Tipografia**: un grottesco display molto pesante e largo per i titoli (es. *Archivo
Black*/*Archivo Expanded*, *Dela Gothic One* o simile: scegli quello più vicino al menu
e motiva la scelta), un sans pulito per i testi (es. *Familjen Grotesk*, *Schibsted
Grotesk*). Niente serif.

## Concept proposto: "No fast food, ma quality food"

Il sito è il **menu a quadretti che prende vita**, acceso dal **neon blu** della sala.
Il tono è quello di Instagram: diretto, ironico, inglese da burger joint americano
dentro un italiano colloquiale abruzzese ("Fame extralarge?").

Tre mosse firma, tutto il resto pulito:
1. **Il neon che si accende** (hero): il logo e lo slogan "NO FAST FOOD MA QUALITY
   FOOD" si accendono come un tubo al neon (flicker breve, alone blu in CSS con
   `filter`/`opacity`, niente WebGL obbligatorio), sopra la foto del Morsi Melt in
   primissimo piano. CTA: **"Ordina su Deliveroo"** e **"Vieni da noi"**.
2. **Lo smash** (sezione pinnata): scrollando, una polpetta viene schiacciata sulla
   piastra e la crosta si forma; poi gli strati si impilano (potato roll, smash,
   cheddar che cola, bacon, uovo, salsa Morsi). Gli indicatori x1 → x4 del menu
   aggiungono smash al panino. Realizzalo in SVG/CSS illustrato nello stile a linea
   del menu (non fotorealistico), oppure in Three.js stilizzato se resta leggero.
3. **Il morso** come segno grafico: un taglio a semicerchio "morsicato" su bordi di
   card, foto e pulsanti; al passaggio del mouse le card del menu prendono un morso.

## Sezioni

1. **Hero neon** — logo, claim, foto Morsi Melt, due CTA, selettore sede in alto.
2. **Selettore sede Pineto / Roseto** — sempre raggiungibile (anche nella nav mobile):
   cambia indirizzo, telefono, orari, mappa e link Deliveroo in tutto il sito.
   Ricorda la scelta in `localStorage` (con `try/catch`).
3. **Il nostro smash** — la sezione pinnata dello smash + 3 punti: smash vero con la
   crosta, potato roll, **salsa Morsi** (ricetta segreta, "solo da Morsi").
4. **Menu** — riproduci il menu cartaceo in HTML vero, a carta a quadretti, con filtri a
   schede: Smash Burgers (Basic x1/x2, Special x2/x3), Veggy, Chicken Sandwiches,
   Melt Sandwiches (box tratteggiato + badge "new"), Sides, Fries, Desserts, Drinks.
   Box "Tutti i panini anche in formula menu: panino + patatine + bevanda" e
   "Aggiunte extra". Badge "best seller" su Cheese Bacon, Oklahoma, Chicken Salad,
   Patty Melt (come nel menu cartaceo). Icona foglia sul Veggy.
5. **Piatto firma: il Morsi Melt** — grande foto, ingredienti, "il più fotografato".
6. **La sala** — foto interni e neon, testo breve sull'atmosfera; le camicie con il
   logo come accenno al merch.
7. **Dicono di noi** — 3–4 recensioni brevi che riprendono i temi reali del dossier
   (personale gentile, servizio veloce, "vero smash burger", Onion e Chicken Bacon,
   patatine cheddar e bacon), **scritte come esempi e marcate "esempio, da sostituire
   con recensioni reali"**. Mostra la media 4,5/5 di Pineto solo con la nota "da
   confermare".
8. **Dove siamo** — due schede affiancate con mappa disegnata (SVG della costa
   Pineto–Roseto, non un iframe pesante), indirizzo, telefono, orari, "martedì chiuso",
   pulsanti Chiama / Indicazioni / Deliveroo.
9. **Footer** — Instagram, Facebook, mascotte che saluta, claim, filigrana demo,
   segnaposto Partita IVA.

## Contenuti: cosa è certo e cosa no

**Menu** (dal menu cartaceo; i prezzi nella foto non sono leggibili).
Usa i prezzi Deliveroo del dossier **solo come indicativi**, con una nota visibile
"Prezzi indicativi, da confermare" e tienili in un unico file dati
(`src/anteprime/morsi/data/menu.js`) facile da aggiornare. Dove manca il prezzo,
mostra "—" e non inventarlo.

| Sezione | Voci e ingredienti |
|---|---|
| Basic Smash (x1 / x2) | **Cheesy**: smash burger, cheddar, ketchup, maionese · **Cheese Bacon** ⭐: smash burger, cheddar, cetriolo, cipolla, bacon, salsa Morsi |
| Special Smash (x2 / x3) | **Old school**: doppio smash, cheddar, senape al miele artigianale, ketchup, cetrioli · **Oklahoma** ⭐: doppio smash, cheddar, cipolla stufata, senape al miele artigianale, ketchup · **Classic**: doppio smash, cheddar, pomodoro, cipolla, insalata, ketchup, maionese |
| Veggy Burger (x1 / x2) | **Veggy** 🌿: veggy burger, cheddar, cipolla, insalata, ketchup |
| Chicken Sandwiches | **Chicken simply**: pollo fritto, cheddar, cetrioli, salsa Morsi · **Chicken salad** ⭐: pollo fritto, coleslaw di insalata, cipolla e cetriolo, maionese, grana |
| Melt Sandwiches (new) | **Chicken melt**: pollo fritto, doppio cheddar, cipolla stufata, insalata, maionese giapponese, grana · **Patty melt** ⭐: doppio smash, triplo cheddar, bacon, cipolla stufata, maionese giapponese · **Morsi melt**: doppio smash, cipolla, bacon, uovo fritto, doppio cheddar, cetriolo, salsa Morsi · **Shoku supreme**: 4 smash burger, 4 cheddar, cetriolo, salsa Morsi |
| Formula menu | panino + patatine + bevanda; extra cheddar patatine, extra cheddar e bacon patatine, extra grana e pepe patatine |
| Aggiunte extra | salse, vegetali, proteine, jalapeño, formaggi, salse speciali (monodose), salse XL, bacon |
| Sides | **Tequeños**: formaggio fritto venezuelano (2 pz) · **Jalapeño pops**: crocchette di jalapeño e cheddar · **Chicken pops**: pop corn di pollo fritto · **Fried chicken**: fusi di pollo fritto, serviti con patatine e salsa bbq |
| Fries | **Classic fries** · **Cheesy pepper**: grana e pepe · **Cheddar e bacon**: salsa cheddar, bacon · **Jalapeño cheese**: polvere di peperoncino, salsa cheddar, jalapeño · **Chopped cheese fries**: smash burger chopped, cipolla, salsa cheddar, salsa Morsi |
| Desserts | **Nutella sandwich**: pane e Nutella |
| Drinks | acqua, bevande in lattina analcoliche, Coca-Cola / Sprite / Fanta in vetro, birra, birre speciali |

Le quantità tra parentesi tonde nel menu cartaceo sono poco leggibili: dove non sei
sicuro scrivi "(pz da confermare)". La voce "Onion" è su Deliveroo ma non nel menu
cartaceo: **non metterla** nel menu, citala al massimo in una recensione d'esempio.

**Dati delle sedi**
| | Pineto (sede storica) | Roseto degli Abruzzi (nuova sede) |
|---|---|---|
| Indirizzo | Via Gabriele D'Annunzio **117**, 64025 Pineto (TE) — civico ufficiale da Instagram; altre fonti dicono 115: marca "da confermare" | Via G. Di Giorgio 5/7, 64026 Roseto degli Abruzzi (TE), in centro |
| Telefono | 328 783 7652 | da confermare (non usare quello di Pineto) |
| Orari | sera, circa 19:00–24:00, sabato fino all'1:00 — **da confermare** | come Pineto, **da confermare** |
| Chiusura | martedì | martedì |
| Delivery | — (non risulta) | Deliveroo: `https://deliveroo.it/it/menu/roseto-degli-abruzzi/roseto-degli-abruzzi/morsi-roseto` (da confermare quale delle due schede è attiva) |

Social: Instagram `https://www.instagram.com/morsi_burger/`, Facebook
`https://www.facebook.com/p/Morsi-Burger-61552469562181/`.

**Non usare mai** "Via Thaulero 7" (è di un altro locale) e non confondere Morsi con
"12 Morsi" di Napoli/Caserta o altri omonimi. Non inventare anno di apertura, titolari
o storia: dove servirebbero, lascia un segnaposto evidente
`[STORIA DA RACCOGLIERE CON I TITOLARI]`.

## Immagini

Le 5 foto in `dev/morsi/foto/` sono piccole (circa 300–500 px di lato, da telefono):
- usale dove l'ingombro è contenuto (card, sala, sede); per l'hero applica un
  trattamento che ne nasconda la risoluzione (duotono blu, grana, maschera a morso,
  dimensione massima ragionevole) invece di ingrandirle sgranate;
- ricavane AVIF + WebP in `public/assets/img/morsi/`;
- dove manca una foto (singoli panini, patatine, pollo, esterno delle sedi) usa
  **illustrazioni a linea blu nello stile del menu**, non stock e non immagini generate
  fotorealistiche; ogni segnaposto ha un commento `FOTO:` con soggetto e proporzioni,
  come in Borgo Spoltino, così si sostituisce con lo stesso nome file.
- Il menu cartaceo e il logo sono materiale del locale: niente riuso fuori dall'anteprima.

## SEO e dati strutturati (pronti per quando sarà pubblico)

Anche se l'anteprima è `noindex`, prepara il JSON-LD `Restaurant` con due
`location`/`department` (una per sede), `servesCuisine` "Smash burger, Fried chicken",
`priceRange` "€€", orari come `OpeningHoursSpecification` con commento "da confermare",
Open Graph con un'immagine social generata (logo su blu + panino).

## Consegna

- Build pulita (`npm run build`) e verifica nel browser (Playwright è già installato):
  screenshot mobile 390 px e desktop 1440 px di ogni sezione, controllo
  `prefers-reduced-motion`, nessun errore in console.
- Lighthouse su build di produzione, riporta i numeri nel README.
- Elenco finale di tutto ciò che è "da confermare" con i titolari: civico di Pineto,
  orari, telefono di Roseto, scheda Deliveroo attiva, prezzi, storia, logo vettoriale,
  font ufficiali, foto in alta risoluzione.
- Commit chiari, sul branch di lavoro della sessione.
