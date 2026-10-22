# Borgo Spoltino

Anteprima riservata, in `/anteprime/borgo-spoltino/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Location per matrimoni a Mosciano
Sant'Angelo, concept "Una giornata sul colle". Il sito segue la luce di un matrimonio,
dal pomeriggio alla notte, sempre sullo stesso colle davanti al Gran Sasso.
Bodoni Moda e Hanken Grotesk, avorio, pietra, verde d'ulivo e terra; l'ottone solo nei fili.

- **Sezioni**: sipario d'apertura, hero a tre piani in parallasse, intro, plastico 3D del
  territorio (Gran Sasso → Adriatico → il colle, pinnato), "Il … borgo" (la finestra che
  si apre a tutto schermo), gli spazi su binario orizzontale, la giornata in cinque momenti
  sovrapposti (sticky), la tavola a schede, le occasioni con l'immagine che segue il
  mouse, gallery editoriale con visore, recensioni a rotazione, modulo, mappa disegnata.
- **Codice** in `anteprime/borgo-spoltino/src/`: `sections/` (una per sezione), `animations/`
  (rivelazioni, parallasse, cursore e magneti, apertura), `components/visore.js`,
  `three/plastico.js` (scaricato solo su desktop con puntatore fine, quando la sezione
  si avvicina; disegna solo quando cambiano scroll, mouse o misura, l'ombra si calcola
  una volta), `styles/` (token, base e un foglio per gruppo di sezioni). Le finestre
  (`<dialog>`) bloccano la pagina con una sola regola CSS (`html:has(dialog:modal)`) e
  hanno `data-lenis-prevent`, così dentro si scorre.
- **Immagini provvisorie**: non sono foto ma tavole dipinte da uno shader
  (`anteprime/borgo-spoltino/dev/tavole.js`), più il plastico fotografato da `anteprime/borgo-spoltino/dev/plastico.html`.
  Si rigenerano con `node anteprime/borgo-spoltino/render.mjs` (dev server attivo, Playwright e
  ffmpeg) in `public/assets/img/borgo/`, AVIF + WebP (AVIF con trasparenza per i piani
  dell'hero); ogni proporzione si disegna una volta e le misure minori si scalano. Per mettere le foto vere basta
  sostituire i file con lo stesso nome: nell'HTML ogni immagine ha un commento `FOTO:`
  con soggetto e proporzioni.
- Testi d'esempio, recensioni, menu e contatti sono marcati "da confermare"; il modulo
  non invia nulla. Scadenza nel meta `anteprima-scadenza` (30 novembre 2026).
- Lighthouse (build, Chromium headless): mobile 93 / 100 / 100, desktop 98 / 100 / 100
  (prestazioni, accessibilità, best practice; la SEO è bassa di proposito per il noindex).
