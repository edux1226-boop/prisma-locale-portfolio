# Vecchia Marina

Anteprima riservata, in `/anteprime/vecchia-marina/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Ristorante di pesce sul lungomare di
Roseto, Bib Gourmand MICHELIN. Concept "La linea di galleggiamento": l'orizzonte
dell'Adriatico taglia il sito, sopra la linea il nome e sotto il suo riflesso. Editoriale,
quasi una rivista gastronomica stampata su carta da giornale di bordo.

- **Perché non somiglia alle altre anteprime**: niente sipario (Borgo), niente lama o
  diagonali (Nagoya), niente orologio della serata (Destino); niente modello 3D. Spectral
  ExtraLight e Archivo (stretto per le etichette) al posto di Bodoni, Shippori e Italiana;
  carta fredda, blu notte, petrolio, sabbia e pietra, il metallo è peltro e non ottone.
  Bottoni sottolineati invece che a riquadro; indice a tutto schermo con le voci sfalsate;
  lo "scandaglio" (la sagola con il piombo) al posto dell'orologio come indicatore di
  lettura; gallery a provini; carta nautica disegnata con gli scandagli al posto della mappa.
- **Sezioni**: hero (l'acqua, poi la linea, poi il nome e il riflesso increspato), intro,
  Bib Gourmand come firma tipografica, la storia (lastra ferma che si apre + la rotta in
  quattro punti), il mare (sequenza pinnata: la lastra cresce a tutto schermo, la notte del
  mercato, l'alba), lo specchio "In tavola", tre piatti impaginati come pagine di rivista
  (scorrimento laterale su telefono), la carta HTML con il pescato del giorno, Gennaro,
  l'esperienza in quattro frammenti, gallery, recensioni e rassegna stampa, prenotazione,
  contatti, piede; in fondo il biglietto di Prisma Locale per la famiglia (da togliere).
- **Codice** in `anteprime/vecchia-marina/src/`: `styles/` (il design system: token, base, un
  foglio per gruppo di sezioni), `sections/`, `animations/` (emersione dei titoli, marea
  delle immagini, deriva, scandaglio), `components/visore.js`, `three/specchio.js`.
  L'engineering è quello comune (`src/js/core/motion.js`: GSAP, ScrollTrigger, Lenis).
- **Lo specchio** è l'unico "3D": un pelo d'acqua vivo in WebGL puro (niente three.js,
  4,5 KB), lo stesso modello di mare delle immagini, solo desktop con puntatore fine,
  mezza risoluzione a 30 fps, fermo fuori schermo. Senza, resta l'immagine ferma identica.
- **Contenuti da aggiornare spesso** in `anteprime/vecchia-marina/src/dati.js`: pescato del giorno,
  orari e chiusure (riempiono anche la tendina del modulo e bloccano i turni chiusi),
  numeri delle recensioni. La carta è HTML nella pagina, con i segnaposto marcati
  `PLACEHOLDER` / `DA CONFERMARE` nei commenti.
- **Immagini provvisorie, di due tipi.**
  - *Studi di mare generati* da uno shader (`anteprime/vecchia-marina/dev/lastre.js`: superficie controluce,
    alba, notte con le lampare, mezzogiorno grigio, sera, risacca, battigia) per tutto ciò che
    va a tutto schermo: hero, sequenza del mare, specchio, panorami della gallery. Si
    rigenerano con `node anteprime/vecchia-marina/render.mjs` (dev server attivo, Playwright e ffmpeg)
    in `public/assets/img/marina/`, AVIF + WebP; l'immagine social è `marina-og.jpg`.
  - *Foto vere prese dal web* in `public/assets/img/marina/foto/`, ritagliate da screenshot
    delle ricerche (circa 600 px di lato: per questo stanno solo in riquadri piccoli o medi,
    mai a tutto schermo). Regola di trattamento: persone in bianco e nero, cibo e luoghi a
    colori appena raffreddati, grana leggera. Fonti: Lido Vannucchi (la foto in riva al mare,
    con la sua firma lasciata intatta), 50 Top Italy (Gennaro in cucina), TripAdvisor (la
    veranda), foto di clienti su Google (vongole, crudo, scampi, pesce e vongole, sala,
    servizio), una foto d'archivio di fonte da verificare. Ogni foto ha il credito visibile.
    **Non sono nostre**: prima di pubblicare il sito vero servono gli originali dal ristorante
    e, per la foto di Lido Vannucchi, il permesso del fotografo.
  - Ogni immagine ha un commento `FOTO:` con soggetto e proporzioni dello scatto da fare. Il
    primo e il terzo piatto (scampi all'arrabbiata, sogliole) restano tavole tipografiche:
    nessuna foto trovata li mostra davvero.
- **Fonti dei fatti** (da verificare con la famiglia prima di pubblicare): Guida MICHELIN
  (Bib Gourmand, Lungomare Trento 37, linguine agli scampi, crudo del giorno, sala
  informale a due passi dalla spiaggia), L'Espresso, giugno 2026 (la storia di Gennaro, il
  2000, la famiglia, il mercato all'alba dal martedì al venerdì), guide online (telefono,
  chiusure). Recensioni: 4,3 / 5 e 996 recensioni come valori di riferimento; nessuna
  recensione citata. I tre piatti forniti (scampi all'arrabbiata, guazzetto di vongole,
  sogliole) non hanno ingredienti né prezzi inventati.
- Caratteri: Spectral (200, 300 e corsivi) e Archivo variabile ridotto con fontTools
  (latino, pesi 300–700, larghezze 70–112,5%, 69 KB). Scadenza nel meta
  `anteprima-scadenza` (15 dicembre 2026).
- Lighthouse 12 (build, Chromium headless): mobile 95 / 100 / 100, desktop 100 / 100 / 100
  (prestazioni, accessibilità, best practice; la SEO è bassa di proposito per il noindex).
  Su telefono l'apertura è ridotta (il nome c'è subito) e le preparazioni girano in task brevi.
