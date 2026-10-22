# Destino

Anteprima riservata, in `/anteprime/destino/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Concept "Dalle 17 alle 3", un unico `index.html`
autonomo (font e foto in base64, script da CDN: Three.js r128, GSAP 3.13, Lenis 1.1.13).
Si modifica in `anteprime/destino/src/` (`index.src.html`, `destino.js`, `assets/`) e si rigenera con
`node anteprime/destino/build.mjs`, che scrive `anteprime/destino/index.html`.
