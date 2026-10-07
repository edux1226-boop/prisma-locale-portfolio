# Trattoria Luciana — Dal mare, alla tavola

Digital flagship per **Trattoria Luciana**, trattoria di pesce della famiglia Ruggieri sul
Lungomare Trieste 60 a Roseto degli Abruzzi. Oggi vive come **anteprima riservata** su
`prismalocale.it/anteprime/trattoria-luciana/`; la stessa base diventa il sito di produzione
sul dominio del ristorante cambiando due variabili d'ambiente.

> «Sembra un film sul mare, ma posso prenotare un tavolo in dieci secondi.»

---

## Il concept

Una sola traiettoria narrativa, guidata dallo scroll:

```
MARE → ROSETO → FAMIGLIA → PESCA → CUCINA → TAVOLA → PRENOTAZIONE
```

La homepage è una sequenza di undici scene numerate come in una rivista gastronomica
(`Scena 01 — Il mare` … `Scena 11 — La tavola`). Il fondo passa dal blu del mare alla sabbia,
all'avorio della tavola, e torna al blu della notte per la prenotazione.

| Scena | Cosa succede | Movimento |
|---|---|---|
| 01 Il mare | La superficie dell'Adriatico, il nome che emerge piano | WebGL (desktop) o fermo immagine; la superficie si avvicina scorrendo |
| 02 Una storia di famiglia | Il blu dell'immersione diventa il fondo di una frase | righe che salgono |
| 03 Il territorio | Il blu si apre dall'orizzonte su Roseto; Roseto, Adriatico, Abruzzo | maschera + palco fermo (desktop) |
| 04 La famiglia | Lo stesso luogo, allora (seppia) e oggi | dissolvenza |
| 05 Dal pescato alla tavola | Quattro passaggi, quattro immagini | maschere in sequenza (desktop) |
| 06 Il menu | Assaggio dal CMS | — |
| 07 Il pranzo di Luciana | Il cartoncino del menu del giorno, dal CMS | — |
| 08 Atmosfera | Sala, pergola, mare | brezza, ombra delle foglie |
| 09 La voce degli ospiti | Solo recensioni verificate | — |
| 10 Dove siamo | Mappa disegnata del lungomare | — |
| 11 La tavola | Prenota il tuo tavolo: telefono, WhatsApp, richiesta online | — |

Pagine: `/storia`, `/menu`, `/il-mare`, `/prenota`, `/contatti`, in italiano, inglese e tedesco
con indirizzi tradotti (`/en/the-sea/`, `/de/das-meer/`, …).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript, **export statico** |
| Contenuti | JSON in `content/`, validati con zod (`content/schema.ts`), modificabili da Decap CMS |
| Movimento | GSAP 3.15 (ScrollTrigger, SplitText) + Lenis |
| 3D | three.js + React Three Fiber, solo per il mare, caricati dinamicamente |
| Caratteri | Instrument Serif (titoli, numerazioni, momenti) e Instrument Sans (navigazione, menu, prezzi, moduli), self-hosted con `next/font/local` |
| Stili | CSS con token (`styles/tokens.css`) e CSS Modules per componente |

La regola dell'architettura è **HTML first, motion second, WebGL third**: ogni pagina è HTML
statico completo; il movimento si aggiunge sopra; il WebGL solo dove il dispositivo lo regge.
Se il WebGL non parte, resta il fermo immagine renderizzato dallo **stesso shader**.

## Struttura

```
.
├── app/
│   ├── (it)/…                 italiano alla radice (/, /storia/, …) — root layout lang="it"
│   ├── [lingua]/…             /en/…, /de/… con slug tradotti — root layout per lingua
│   ├── sitemap.ts, robots.ts
├── components/
│   ├── home/                  le undici scene dell'homepage + nota per il ristorante
│   ├── pagine/                storia, menu, il mare, prenota, contatti
│   ├── struttura/             radice HTML, testata, piede, barra "Prenota", anteprima, JSON-LD
│   ├── regia/                 tutto il movimento (GSAP, ScrollTrigger, SplitText, Lenis)
│   ├── mare/                  shader dell'acqua, scena R3F, rilevamento capacità
│   ├── prenota/               modulo di richiesta di prenotazione
│   └── ui/                    foto (art direction), disegni a filo, mappa, orari, prezzi…
├── content/                   i dati del CMS + schema zod
├── i18n/                      testi dell'interfaccia in it, en, de
├── lib/                       rotte, accesso ai contenuti, SEO, recapiti, formati
├── cms/                       configurazione e pagina di Decap CMS
├── public/media/              immagini (AVIF + WebP) e immagine social
├── scripts/
│   ├── contenuti.ts           elenco dei dati da confermare
│   ├── dopo-build.ts          pubblica il CMS su /admin/ in produzione
│   └── tavole/                generatore delle immagini provvisorie
└── styles/                    token, base
```

## Comandi

```bash
npm install
npm run dev          # http://localhost:3000 (senza base path)
npm run build        # export statico in out/ (+ CMS in produzione)
npm run contenuti    # cosa manca da confermare; --rigido esce con errore se manca qualcosa
npm run typecheck
npm run tavole       # rigenera le immagini provvisorie (Playwright + ffmpeg)
```

Dalla radice del repository `npm run build` compila il portfolio e poi questo progetto
(`scripts/build-flagship.mjs`), copiando `out/` in `dist/anteprime/trattoria-luciana/`.

### Variabili d'ambiente della build

| Variabile | Anteprima | Produzione |
|---|---|---|
| `SITE_MODE` | `anteprima` (predefinito) | `produzione` |
| `BASE_PATH` | `/anteprime/trattoria-luciana` | vuoto |
| `SITE_URL` | `https://prismalocale.it/anteprime/trattoria-luciana` | il dominio (o il `dominio` confermato nel CMS) |
| `IMAGE_CDN` | — | `netlify` per ridimensionare le foto caricate dal CMS |

## Contenuti e stato di conferma

Tutto ciò che il ristorante gestisce sta in `content/`: `restaurant`, `opening-hours`, `menu`,
`lunch-menu`, `story`, `reviews`, `media`, `pescato`. Ogni dato che può essere sbagliato porta
il suo stato:

```json
"telefono": { "value": null, "status": "needs_confirmation", "nota": "…" }
```

- **anteprima** — il dato compare con il segno *da confermare*; un dato vuoto mostra il suo posto.
- **produzione** — il dato non esiste: niente testo, niente metadati, niente JSON-LD. Una sezione
  senza dati confermati (il pranzo, le recensioni, gli orari) sparisce.

I componenti non decidono nulla: chiedono il dato a `leggi()` / `visibile()` di
`lib/contenuti.ts`. I testi fissi dell'interfaccia (`i18n/`) non contengono fatti da verificare:
anni, orari, prezzi e nomi stanno solo nel CMS. Le recensioni d'esempio sono marcate `esempio` e
lo schema impedisce di confermarle.

`npm run contenuti` elenca i dati in attesa (oggi 132) e valida i JSON con lo stesso schema
della build: un contenuto malformato ferma la pubblicazione.

### Il CMS

Decap CMS (`cms/config.yml`) lavora su Git: ogni salvataggio è un commit sui file di `content/`,
la build li valida e ripubblica. In produzione è su `/admin/`; si attiva su Netlify con
Identity (solo su invito) e Git Gateway. Le foto caricate dal CMS vanno in
`public/media/caricate/` e, con `IMAGE_CDN=netlify`, sono servite in AVIF/WebP alle misure
giuste dall'Image CDN di Netlify.

## Immagini

Le immagini attuali **non sono fotografie**: sono tavole dipinte da shader nella palette del
sito, sempre lo stesso mare a ore diverse (l'alba sulla costa con il Gran Sasso, la paranza
controluce, il mezzogiorno, il lungomare all'ora blu, la luna, la luce della pergola). Dove serve
una foto che solo il ristorante può dare (famiglia, cucina, piatti, archivio) c'è una **tavola di
regia**: un disegno a filo e, in anteprima, le indicazioni per lo scatto (soggetto, luce, formato).

- `npm run tavole` le rigenera dalle voci di `content/media.json` (stesse misure, AVIF + WebP).
- Il fermo immagine dell'apertura è un fotogramma dello shader WebGL (`components/mare/acqua.ts`).
- Per mettere le foto vere: caricarle dal CMS (voce → *Fotografia*, stato *Confermato*) oppure
  sostituire i file in `public/media/` con lo stesso nome.

## Prenotazione

La CTA è sempre **Prenota il tuo tavolo**, con tre strade: telefono, WhatsApp (solo dopo la
conferma del numero) e richiesta online. Su telefono la barra in basso la tiene a un tocco.

Il modulo (`Nome · Telefono · Email · Data · Ora · Persone · Allergie/intolleranze · Note`)
**non simula mai una conferma**: dopo l'invio dice che il tavolo sarà confermato dal ristorante.
In produzione invia a Netlify Forms (form `prenotazione`, con honeypot); in anteprima controlla i
dati e non invia nulla. Se il ristorante usa un sistema di prenotazione (`prenotazione.motore`
confermato), la richiesta online porta lì.

## Qualità

- **Accessibilità**: axe-core senza violazioni su tutte le pagine (it/en/de, desktop e mobile);
  skip link, menu mobile su `<dialog>`, riepilogo errori del modulo con fuoco gestito, contrasti
  AA misurati nei token (vedi `styles/tokens.css`).
- **Movimento ridotto e senza JavaScript**: niente Lenis, niente pin, niente WebGL; tutto il
  contenuto resta visibile. Se la regia non parte entro 4 secondi, il movimento si spegne da solo.
- **WebGL**: solo con schermo grande, puntatore fine, almeno 4 core e 4 GB, scheda grafica vera
  (non rasterizzatori software), niente risparmio dati. Misura il frame rate: abbassa la
  risoluzione, poi rinuncia e lascia il fermo immagine. Si ferma fuori schermo.
  Per le verifiche: `?webgl=forza` o `?webgl=no`.
- **SEO**: metadati per pagina e lingua, canonical, hreflang con `x-default`, sitemap con
  alternative, JSON-LD `Restaurant` con i soli dati confermati. L'anteprima è `noindex`.

## Prima di andare in produzione

1. Confermare i dati nel CMS (`npm run contenuti -- --rigido` deve passare, o quasi).
2. Pagine **privacy** e **cookie** e ragione sociale/partita IVA: obbligatorie, oggi assenti.
3. Fotografie vere, o confermare le illustrazioni che si vogliono tenere.
4. Revisione dei testi inglesi e tedeschi da parte di un madrelingua.
5. Build con `SITE_MODE=produzione`, `SITE_URL=https://<dominio>`, `IMAGE_CDN=netlify`;
   su Netlify attivare Identity + Git Gateway per il CMS e le notifiche del form `prenotazione`.

---

Progetto di [Prisma Locale](https://prismalocale.it). Il nome Trattoria Luciana appartiene ai
legittimi proprietari; l'anteprima non è commissionata. Caratteri Instrument Serif e Instrument
Sans con licenza SIL OFL (`assets/fonts/`).
