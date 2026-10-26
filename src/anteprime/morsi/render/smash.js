import { VIEWBOX, piastraSvg, stratiSvg } from '../data/panino.js';

/** Il palco dello smash: SVG con la piastra e tutti gli strati del panino (x2 di partenza). */
export const smashPalcoHtml = () => `<svg class="palco" viewBox="${VIEWBOX}" role="img" aria-labelledby="palco-desc" data-palco>
  <desc id="palco-desc">Illustrazione a linea di uno smash burger che si costruisce: la polpetta viene schiacciata sulla piastra, poi si impilano potato roll, salsa Morsi, smash, cheddar, bacon, uovo e pane.</desc>
  ${piastraSvg()}
  ${stratiSvg(2)}
</svg>`;
