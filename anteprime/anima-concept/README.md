# Anima Concept Pizza

Anteprima riservata, in `/anteprime/anima-concept/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Pizzeria multi-impasto in via
Nazionale Nord a Roseto, concept "Un panetto, sei forme". Il nome viene dai 21 grammi
dell'anima (Anima ha aperto il 21 novembre 2019); la promessa è che non c'è una pizza
della casa, ma una pasta che diventa sei pizze diverse.

- **Mossa firma**: un panetto 3D (`anteprime/anima-concept/src/three/impasto.js`) fisso dietro
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
- **Menu**: un solo file, `anteprime/anima-concept/src/dati/carta.js` (dal menu PDF del 16/12/2025
  e da TheFork). Il plugin `anteprime/anima-concept/src/build/carta.js` lo scrive come HTML statico
  nella pagina (segnaposto `<!-- @carta -->`), quindi è leggibile senza JavaScript e
  indicizzabile in produzione. I codici allergeni sono quelli del menu del locale: la
  legenda va ricopiata dal PDF, non ricostruita.
- **Immagini**: non sono foto. Sono fotogrammi della stessa scena 3D, usati su telefono,
  con movimento ridotto e come ripiego: `node anteprime/anima-concept/render.mjs` (dev server attivo,
  Playwright e ffmpeg) li rigenera in `public/assets/img/anima/`, AVIF + WebP, più
  `anima-og.jpg`. Pagina di servizio: `anteprime/anima-concept/dev/impasto.html?tappa=1&w=1200&h=900`.
- **Dati**: ciò che non è verificato porta il segno "da confermare" (orari, lunedì,
  parcheggio, la quota del 70% sulla romana, la data di apertura, i riconoscimenti,
  Instagram). Nessuna recensione citata: solo i voti di TheFork e Tripadvisor con la data.
  JSON-LD `Restaurant` senza orari. La nota per il locale elenca cosa manca.
  Scadenza nel meta `anteprima-scadenza` (15 dicembre 2026).
- Lighthouse 12 (build, Chromium headless, 14/10/2026): mobile 100 / 100 / 100
  (FCP 1,0 s, LCP 1,7 s, TBT 0 ms, CLS 0,002), desktop 100 / 100 / 100; un'esecuzione
  precedente ha dato 97 su mobile. SEO bassa di proposito per il noindex.
  axe-core 4.10: nessuna violazione WCAG 2.1 AA su desktop e telefono.
