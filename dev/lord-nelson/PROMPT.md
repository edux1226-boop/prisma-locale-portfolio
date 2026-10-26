# Prompt per Claude Code: anteprima "Lord Nelson" (birreria e paninoteca, Scerne di Pineto)

> Incolla tutto quello che sta sotto la riga in una nuova sessione di Claude Code aperta
> su questo repository. Materiali di partenza: `dev/lord-nelson/foto/` (logo, 3 foto del
> locale, 2 pagine del menu). Non esiste ancora un dossier di ricerca sul locale.

---

## Ruolo e obiettivo

Sei un front-end designer/developer senior. Costruisci in questo repository
(`prisma-locale-portfolio`, sito di Prisma Locale) una **nuova anteprima riservata** per
**Lord Nelson**, birreria e paninoteca in **via Volturno 107, Scerne di Pineto (TE)**.

L'anteprima va mostrata ai titolari prima di un incarico: deve far dire "questo è il
nostro pub, ma raccontato come merita". Il sito deve far venire voglia di sedersi al
bancone: birra alla spina, panino grande, serata con gli amici.

Prima di scrivere codice:
1. Leggi `README.md` (sezione "Anteprime per i clienti") e studia come sono fatte
   `anteprime/borgo-spoltino/` e `anteprime/nagoya-sushi/` (struttura, `vite.config.js`,
   `netlify.toml`, filigrana, meta `anteprima-scadenza`, `noindex`).
2. Guarda tutte le immagini in `dev/lord-nelson/foto/`.
3. Proponimi in breve concept, mappa delle sezioni e scelte tecniche, poi procedi.

## Vincoli del repository (non negoziabili)

- Percorso pubblico: **`/anteprime/lord-nelson/`**, voce aggiunta in `vite.config.js`
  (multipagina) come le altre anteprime. Codice in `src/anteprime/lord-nelson/`
  (`sections/`, `animations/`, `styles/`, `data/`).
- `noindex, nofollow` nel meta **e** negli header Netlify; non linkata dal sito.
- Filigrana fissa **"DEMO · PRISMA LOCALE"**, discreta ma sempre visibile.
- Meta `anteprima-scadenza` a **31 dicembre 2026**: dopo quella data resta solo
  "Anteprima scaduta, contatta Prisma Locale" (riusa la logica esistente).
- Stack del repo: Vite, GSAP 3 (ScrollTrigger, SplitText), Lenis collegato al ticker
  GSAP. Three.js solo se davvero serve e solo su desktop con puntatore fine.
- Animazioni solo su `transform` e `opacity`. `prefers-reduced-motion` rispettato:
  niente Lenis, niente pin, contenuti completi e statici.
- Mobile-first. Obiettivo Lighthouse mobile ≥ 90 prestazioni, 100 accessibilità e
  best practice.
- Font self-hosted, ridotti al latino, in `public/`. Immagini AVIF + WebP con
  `width`/`height`, `loading="lazy"` sotto la piega.
- Aggiorna `README.md` con la scheda dell'anteprima, nello stesso stile delle altre.

## Regola sui colori: logo e locale sì, menu no

**I colori del sito vengono solo dal logo e dalle foto del locale.** Le due pagine del
menu (`menu-al-piatto.jpg`, `menu-i-big.jpg`) hanno fondo crema/giallo chiaro, una
grande curva verde acido e prezzi in rosso: **non c'entrano con l'ambiente e non vanno
riprese** (niente verde, niente giallo pastello, niente rosso dei prezzi, niente
impaginazione del menu). Dal menu prendi **solo i contenuti** (piatti, prezzi,
indirizzo, telefono).

## Identità visiva (rilevata dal logo e dalle foto)

**Logo** (`logo.jpg`): illustrazione a fumetto, linea nera spessa, dell'**ammiraglio
Nelson** con bicorno nero bordato d'oro e coccarda, giacca da ufficiale nera con
spalline e alamari dorati, che alza un **boccale di birra** schiumoso e tiene un
**hamburger**, con un cono di **patatine**. Sotto, la scritta **"LORD NELSON"** in un
lettering nero ornato, stile insegna ottocentesca / vintage (grazie marcate, curve
decorative su L e N), e la riga piccola **"BIRRERIA · PANINOTECA"**.
Non ridisegnare il personaggio: usa il file del logo così com'è (ripulito e scontornato
se serve) e lascia un commento `LOGO: sostituire con il vettoriale ufficiale`.

**Locale** (`bancone-spine.jpg`, `bancone-isola.jpg`, `bancone-legno-bruciato.jpg`)
- **Bancone a isola** rivestito in **legno bruciato** (effetto shou sugi ban: venature
  scure, nero carbone, caramello e ambra), piano spesso in legno caldo.
- Pannelli frontali del bancone **retroilluminati color ambra/miele**, come pietra o
  onice illuminati da dentro: è l'immagine più forte del locale.
- **Spine cromate** in fila con le placchette colorate dei marchi, bicchieri capovolti
  su mensole di vetro, strisce LED calde sotto i ripiani.
- Pareti e soffitto **scuri** (nero/antracite), struttura sospesa sopra il bancone,
  sgabelli alti in metallo nero, pavimento chiaro lucido che riflette le luci.
- La sagoma di cartone con il logo appoggiata sul bancone: il personaggio "vive" nel
  locale, si può usare come presenza ricorrente.

**Palette** (stimata con contagocce sulle immagini, da ricampionare sui file originali)
| Token | Valore stimato | Da dove |
|---|---|---|
| `--carbone` | `#0B0A0C` | nero del logo, pareti e soffitto del locale |
| `--legno-bruciato` | `#2A1711` / `#3B271E` | bruno scuro del bancone e del logo |
| `--oro-nelson` | `#B99A4F` | bordi del bicorno, spalline, alamari |
| `--ambra-birra` | `#E2AC3E` | birra nel boccale, pannelli retroilluminati |
| `--caramello` | `#B56325` / `#946D44` | legno bruciato in luce, piano del bancone |
| `--schiuma` | `#F4EDDE` | schiuma della birra, carta, testo chiaro |
| `--cromo` | `#B2A997` → `#6C6A67` | spine e acciaio, solo in dettagli/sfumature |

Fondo prevalente **scuro** (carbone e legno), luce **ambra** come colore di marca,
**oro** per filetti, cornici e dettagli, **schiuma** per il testo. Verifica i contrasti
AA (ambra e oro su carbone: sì; oro come testo piccolo su schiuma: probabilmente no).

**Tipografia**
- Titoli: un display con il carattere del lettering del logo, vintage/vittoriano da
  insegna o etichetta di birra (es. *Rye*, *Ewert*, *Abril Fatface*, *Playfair Display
  SC*: scegli il più vicino al logo e motiva la scelta). Usalo con parsimonia.
- Sottotitoli/etichette: maiuscolo spaziato, come "BIRRERIA · PANINOTECA" (es. un
  grottesco condensato tipo *Oswald* o *Barlow Condensed*).
- Testi: un sans leggibile.

**Texture e dettagli**
- Venatura del legno bruciato come texture di fondo (leggera, compressa, o generata).
- Bagliore ambra "da retroilluminazione" su card e sezioni, filetti dorati, piccoli
  ornamenti nautici d'epoca (corda, ancora, bussola, stella dei gradi) disegnati a
  linea oro: **ornamenti, non clipart**, e senza copiare il personaggio del logo.

## Concept proposto: "Il bancone dell'ammiraglio"

Il sito è una **serata al bancone del Lord Nelson**: si entra nel buio del locale e la
luce ambra del bancone si accende. Il tono è conviviale e un po' ironico, con il
lessico da ammiraglio usato con leggerezza ("Ordini dall'ammiraglio", "Equipaggio",
"Alla spina, comandante"), senza esagerare.

Tre mosse firma, tutto il resto quieto:
1. **Il bancone che si accende** (hero): fondo nero, poi i pannelli si illuminano di
   ambra da sinistra a destra come nella foto, e compaiono il logo e il claim. CTA:
   **"Prenota un tavolo"** (WhatsApp) e **"Guarda il menu"**.
2. **La spillatura** (sezione pinnata): scrollando, un boccale si riempie di birra
   ambra e la schiuma sale; i livelli del boccale fanno da indice alle sezioni del menu.
   In SVG/CSS (maschere e `transform`), leggero.
3. **I Big come flotta**: i sei panini regionali (Americano, Campano, Norcino, Ligure,
   Piemontese, Veneto) presentati come una flotta su un binario orizzontale, ognuno
   con la sua "bandiera" regionale disegnata a linea oro.

## Sezioni

1. **Hero** — bancone che si accende, logo, claim, due CTA.
2. **Il locale** — le tre foto del bancone, testo breve sull'atmosfera (legno bruciato,
   luce ambra, spine). `[STORIA DA RACCOGLIERE CON I TITOLARI]`.
3. **Alla spina** — spine e birre. Le marche non sono leggibili dalle foto: usa schede
   segnaposto "Birra alla spina 1–5, marca e stile da confermare" e non inventare nomi.
4. **Menu** — dati in un unico file `src/anteprime/lord-nelson/data/menu.js`:
   "Al piatto" e "I Big" (sotto), più segnaposto "Panini", "Fritti", "Bevande"
   marcati "sezione da completare con il menu completo".
5. **I Big** — la flotta dei sei panini (vedi mossa firma 3).
6. **Serate ed eventi** — sezione segnaposto (partite, musica, serate a tema) marcata
   "da confermare": nessun evento inventato come reale.
7. **Dove siamo e prenota** — indirizzo, mappa disegnata (SVG, niente iframe pesante),
   pulsanti Chiama / WhatsApp / Indicazioni, orari "da confermare".
8. **Footer** — logo, social "da confermare", filigrana demo, segnaposto Partita IVA.

## Contenuti certi (dal menu fornito)

**Al piatto**
| Piatto | Prezzo |
|---|---|
| Hamburger con patate o insalata | € 8,50 |
| Würstel con patate o insalata | € 8,50 |
| Cotoletta di pollo con patate o insalata | € 8,50 |
| Cheese-bacon burger con patate o insalata | € 10,00 |
| Lord Nelson | € 8,50 |

**I Big** — tutti a **€ 13,00**: Americano, Campano, Norcino, Ligure, Piemontese, Veneto.
Gli ingredienti non sono nel menu fornito: mostra "ingredienti da confermare" e non
inventarli (puoi solo suggerire, come nota interna, che il nome richiama la regione).
Anche il "Lord Nelson" al piatto non ha descrizione: segnalo come piatto della casa,
ingredienti da confermare.

**Contatti**
- Indirizzo: via Volturno 107, 64025 Scerne di Pineto (TE) (CAP da verificare).
- Info e prenotazioni: **348 822 6928**, anche WhatsApp
  (`tel:+393488226928`, `https://wa.me/393488226928`).

**Non disponibile, da confermare con i titolari:** orari e giorno di chiusura, sito e
profili social ufficiali, elenco birre alla spina e in bottiglia, menu completo,
storia, eventi, servizi (asporto, consegna, prenotazione online), foto dei piatti e
dell'esterno.

## Immagini

- Le foto del locale sono piccole (circa 250–260 px di lato): usale dove l'ingombro è
  contenuto; nell'hero preferisci la luce ambra ricostruita in CSS/SVG o un
  trattamento (sfocatura, grana, vignettatura scura) invece di ingrandirle sgranate.
- Ricavane AVIF + WebP in `public/assets/img/lord-nelson/`.
- Dove manca una foto (panini, birre, esterno, serate) usa segnaposto a tinta carbone
  con filetto oro e un commento `FOTO:` con soggetto e proporzioni, come in Borgo
  Spoltino, così si sostituisce con lo stesso nome file. Niente stock, niente immagini
  generate fotorealistiche spacciate per il locale.
- Logo e foto sono materiale del locale: niente riuso fuori dall'anteprima.

## SEO e dati strutturati (pronti per quando sarà pubblico)

Anche se l'anteprima è `noindex`, prepara il JSON-LD `BarOrPub` (con
`servesCuisine` "Panini, Hamburger, Birra"), indirizzo, telefono, `priceRange` "€€",
orari come `OpeningHoursSpecification` con commento "da confermare", Open Graph con
un'immagine social generata (logo su carbone con bagliore ambra).

## Consegna

- Build pulita (`npm run build`) e verifica nel browser (Playwright è già installato):
  screenshot mobile 390 px e desktop 1440 px di ogni sezione, controllo
  `prefers-reduced-motion`, nessun errore in console.
- Lighthouse su build di produzione, riporta i numeri nel README.
- Elenco finale di tutto ciò che è "da confermare" con i titolari.
- Commit chiari, sul branch di lavoro della sessione.
