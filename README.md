# Prisma Locale

Sito di presentazione di **Prisma Locale**, studio di presenza digitale per attività
locali di Pescara e dell'Abruzzo: siti web, social media, identità visiva.

**Online:** [prismalocale.it](https://prismalocale.it)

---

## Impostazione tecnica

Sito statico in HTML, CSS e JavaScript nativo. **Nessuna dipendenza a runtime,
nessun passaggio di build**: la cartella si pubblica così com'è.

La scelta è deliberata. Per un sito di presentazione di poche pagine, un framework
aggiungerebbe peso e manutenzione senza restituire nulla al visitatore. Il risultato
è un primo caricamento sotto il megabyte, comprese tutte le immagini.

| | |
|---|---|
| Peso totale | ~0,9 MB |
| Dipendenze | nessuna |
| Build | nessuna |
| JavaScript | 5 moduli ES, ~6 KB non compressi |
| Immagini | WebP, dimensionate per breakpoint |

## Struttura

```
.
├── index.html              homepage
├── privacy.html            informativa privacy e cookie
├── progetti/
│   └── saporito.html       case study
├── assets/
│   ├── css/
│   │   ├── tokens.css      design system: colore, tipografia, spazio, movimento
│   │   ├── base.css        reset, layout, bottoni, card, mockup
│   │   ├── sections.css    sezioni della homepage, prisma 3D, tilt
│   │   └── case.css        pagina case study
│   ├── js/
│   │   ├── main.js         entry point (modulo ES)
│   │   └── modules/
│   │       ├── reveal.js   comparsa al rientro in viewport
│   │       ├── nav.js      navigazione, menu mobile, link attivo
│   │       ├── parallax.js parallasse 3D della hero
│   │       └── tilt.js     inclinazione 3D al passaggio del puntatore
│   └── img/                screenshot in WebP, favicon SVG
├── robots.txt
├── sitemap.xml
└── netlify.toml            directory di pubblicazione, header, cache
```

## Design system

Ogni valore cromatico passa da `assets/css/tokens.css`, ed è derivato dal logo.

| Token | Valore | Origine |
|---|---|---|
| `--ink` | `#070C18` | fondo del marchio |
| `--paper` | `#F3F6FB` | bianco freddo coordinato |
| `--accent` | `#2563EB` | blu del lettering |
| `--accent-deep` | `#1740B5` | blu profondo del pin |
| `--mint` | `#14C9A0` | verde della tagline |
| `--spectrum` | blu profondo → blu → azzurro → menta | rifrazione, la firma visiva |

Modificando questi valori cambia l'intera identità cromatica: si propagano a bottoni,
linee, superfici scure, prisma 3D e aloni.

## Movimento

Le animazioni sono costruite su `transform` e `opacity`, quindi restano sulla GPU e
non provocano reflow. Il JavaScript scrive solo variabili CSS; le trasformazioni le
calcola il foglio di stile.

Ogni effetto è condizionato a `prefers-reduced-motion`, e quelli basati sul puntatore
anche a `(hover: hover) and (pointer: fine)`: su touch e per chi ha ridotto le
animazioni di sistema, il sito è statico e completo.

## Sviluppo locale

```bash
npx serve -l 4321
```

Poi apri `http://localhost:4321`. Su Windows è disponibile anche `scripts/dev.cmd`.

## Pubblicazione

Deploy continuo su **Netlify** dal branch `main`.

- **Build command:** nessuno
- **Publish directory:** `.` (radice)

La configurazione è in `netlify.toml`, versionata insieme al sito: definisce la
directory di pubblicazione, gli header di sicurezza e la cache lunga sulle immagini.

## Progetti mostrati

I lavori nella sezione Progetti — Saporito, Frida Fitness, Pizzeria Annarè — sono
**concept dimostrativi**, non incarichi commissionati. Non sono affiliati né approvati
dalle attività citate, i cui marchi appartengono ai rispettivi proprietari.

Il sito lo dichiara apertamente in quattro punti: l'etichetta *Concept* su ogni card,
la nota sotto il case study in evidenza, la chiusura della sezione Progetti e la
pagina del case study. È una scelta di trasparenza, non una formalità: un portfolio
che finge commesse inesistenti non regge la prima domanda di un cliente.

---

© 2026 Prisma Locale. Tutti i diritti riservati.
Il codice è pubblico a scopo di trasparenza e consultazione; grafica, testi e
identità visiva non sono riutilizzabili senza autorizzazione.
