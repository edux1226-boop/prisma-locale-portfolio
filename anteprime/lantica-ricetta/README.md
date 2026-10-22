# L'Antica Ricetta

Anteprima riservata, in `/anteprime/lantica-ricetta/` (vedi [anteprime/README.md](../README.md) per protezione, scadenza e regole comuni).

Pizza in pala ad alta idratazione a
Roseto degli Abruzzi, concept "48 ore, una pala". Scuro come il forno, chiaro come la farina;
il rosso brace solo per le azioni. Young Serif e Hanken Grotesk.

- **Sezioni**: hero con la pala che esce dal forno, manifesto, le 48 ore dell'impasto
  (panetto in SVG che lievita mentre si scorre, pinnato su desktop), la pala percorsa da una
  camera gusto per gusto fino alla vista intera, menu con configuratore 1/2/3 gusti e
  listino, senza glutine, temi ricorrenti delle recensioni (nessuna citazione inventata),
  tre modi di ordinare (tavolo, asporto, Glovo/Deliveroo), orari con "aperto ora" all'ora
  di Roseto, barra fissa Chiama/Ordina/Indicazioni su mobile.
- **La pala è disegnata dal codice** (`anteprime/lantica-ricetta/src/pala.js`, canvas 2D con seme
  fisso), in un worker quando il browser lo consente. Banco di prova in `anteprime/lantica-ricetta/dev/pala.html`;
  immagine social con `node anteprime/lantica-ricetta/render.mjs` (dev server attivo, Playwright).
  Quando arrivano le foto vere, le tele `[data-hero-tela]`, `[data-pala-tela]` e
  `[data-componi-tela]` si sostituiscono con immagini.
- Dati da fonti pubbliche (sito del locale, schede online); quelli incerti sono marcati
  "da confermare" e raccolti nella nota finale. Scadenza nel meta `anteprima-scadenza`
  (15 dicembre 2026).
- Lighthouse (build, Chromium headless): mobile e desktop 100 / 100 / 100 (prestazioni,
  accessibilità, best practice).
