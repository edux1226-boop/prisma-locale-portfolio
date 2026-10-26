import { RECENSIONI_ESEMPIO, VALUTAZIONE } from '../data/recensioni.js';
import { esc, dc } from './util.js';

export function recensioniHtml() {
  return `<div class="voto">
  <p class="voto__cifra"><span class="sr-only">Valutazione ${esc(VALUTAZIONE.voto)} su ${esc(VALUTAZIONE.su)}. </span><span aria-hidden="true">${esc(VALUTAZIONE.voto)}<small>/${esc(VALUTAZIONE.su)}</small></span></p>
  <p class="voto__testo">${esc(VALUTAZIONE.testo)} ${dc(VALUTAZIONE.daConfermare)}</p>
</div>
<ul class="citazioni" role="list">
${RECENSIONI_ESEMPIO.map(
    (r, i) => `<li class="citazione citazione--${i + 1}"><figure>
    <blockquote><p>«${esc(r.testo)}»</p></blockquote>
    <figcaption><span class="citazione__tema">${esc(r.tema)}</span> ${dc('esempio, da sostituire con recensioni reali')}</figcaption>
  </figure></li>`,
  ).join('\n')}
</ul>`;
}
