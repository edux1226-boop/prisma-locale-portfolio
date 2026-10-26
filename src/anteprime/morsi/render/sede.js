import { SEDI, ORDINE_SEDI, SEDE_PREDEFINITA, indirizzoCompleto, linkIndicazioni, linkTel, DELIVEROO_ROSETO } from '../data/sedi.js';
import { esc, dc } from './util.js';

/** Selettore Pineto / Roseto: radiogroup, sempre nell'header. Lo stato lo gestisce core/sede.js. */
export function selettoreHtml() {
  return `<div class="sede-sel" role="radiogroup" aria-label="Scegli la sede" data-sede-selettore>
${ORDINE_SEDI.map((id) => {
    const s = SEDI[id];
    const att = id === SEDE_PREDEFINITA;
    return `<button class="sede-sel__voce" type="button" role="radio" aria-checked="${att}" tabindex="${att ? 0 : -1}" data-sede-scegli="${id}"><span class="sede-sel__nome">${esc(id === 'roseto' ? 'Roseto' : 'Pineto')}</span></button>`;
  }).join('\n')}
</div>`;
}

/* Campi che cambiano con la sede: data-sede-campo="…" (testo), data-sede-dc="…" (chip), data-sede-href="…" (link). */
const campo = (nome, valore, tag = 'span', cls = '') =>
  `<${tag}${cls ? ` class="${cls}"` : ''} data-sede-campo="${nome}">${esc(valore)}</${tag}>`;

export function stripSedeHtml() {
  const s = SEDI[SEDE_PREDEFINITA];
  const tel = linkTel(s);
  return `<div class="strip" data-sede-strip>
  <p class="strip__riga"><span class="strip__etichetta">${campo('etichetta', s.etichetta)}</span> ${campo('nome', s.nome, 'strong')}</p>
  <p class="strip__riga strip__riga--dettaglio">${campo('via', s.via)} ${dc('da confermare', `data-sede-dc="via"${s.viaDaConfermare ? '' : ' hidden'}`)}</p>
  <p class="strip__riga strip__riga--dettaglio">${campo('orari-breve', s.orari.breve)} ${dc('da confermare', 'data-sede-dc="orari"')} · ${campo('chiusura', s.chiusura)}</p>
  <p class="strip__riga strip__link">
    <a href="${esc(tel || '#')}" ${tel ? '' : 'aria-disabled="true" '}data-sede-href="tel">Chiama<span data-sede-dc="tel"${s.telDaConfermare ? '' : ' hidden'}> (numero da confermare)</span></a>
    <span aria-hidden="true">·</span>
    <a href="${esc(linkIndicazioni(s))}" target="_blank" rel="noopener" data-sede-href="indicazioni">Indicazioni<span class="sr-only"> (si apre in una nuova scheda)</span></a>
  </p>
</div>`;
}

/** Bottoni del hero: Deliveroo (della sede scelta, o di Roseto se la sede non ha delivery) e "Vieni da noi". */
export function azioniSedeHtml(cls = '') {
  const s = SEDI[SEDE_PREDEFINITA];
  return `<div class="azioni${cls ? ` ${cls}` : ''}" data-sede-azioni>
  <a class="btn btn--pieno" href="${esc(s.deliveroo || DELIVEROO_ROSETO)}" target="_blank" rel="noopener" data-sede-href="deliveroo">Ordina su Deliveroo<span class="sr-only"> (si apre in una nuova scheda)</span></a>
  <a class="btn btn--linea" href="#dove">Vieni da noi</a>
</div>
<p class="azioni__nota" data-sede-deliveroo-nota${s.deliveroo ? ' hidden' : ''}>Da Pineto non risulta il delivery: l’ordine parte da Roseto. ${dc()}</p>`;
}

/* ------------------------------------------------------------------ "Dove siamo" ---- */

const mappa = () => {
  const luogo = (x, y, nome, cls = '') => `<g class="mappa__luogo ${cls}"><circle cx="${x}" cy="${y}" r="3.5"/><text x="${x - 10}" y="${y + 4}" text-anchor="end">${nome}</text></g>`;
  const pin = (s) => `<g class="mappa__pin${s.id === SEDE_PREDEFINITA ? ' is-attiva' : ''}" data-pin="${s.id}" transform="translate(${s.mappa.x} ${s.mappa.y})">
    <circle class="mappa__onda" r="16"/>
    <path class="mappa__goccia" d="M0 8C-12-6-10-24 0-24S12-6 0 8Z" transform="translate(0 -2)"/>
    <circle class="mappa__punto" cx="0" cy="-14" r="3.5"/>
    <text class="mappa__nome" x="-14" y="-8" text-anchor="end">${s.id === 'roseto' ? 'Roseto' : 'Pineto'}</text>
  </g>`;
  return `<figure class="mappa">
  <svg viewBox="0 0 400 520" role="img" aria-labelledby="mappa-desc">
    <desc id="mappa-desc">Schema della costa teramana. Dal nord: Giulianova, Roseto degli Abruzzi, la foce del Vomano, Pineto e Silvi. A est il mare Adriatico, a ovest l’autostrada A14 e le colline.</desc>
    <defs><pattern id="mappa-onde" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M0 5q3.5-4 7 0t7 0" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/></pattern></defs>
    <path d="M338 0C330 90 344 130 326 190S352 290 336 360 352 460 340 520H400V0Z" fill="url(#mappa-onde)"/>
    <path class="mappa__costa" d="M338 0C330 90 344 130 326 190S352 290 336 360 352 460 340 520"/>
    <path class="mappa__fiume" d="M0 236C70 230 130 252 190 244S290 236 328 244"/>
    <text class="mappa__sigla" x="52" y="226">Vomano</text>
    <path class="mappa__strada" d="M252 0C246 100 262 180 244 250S268 380 252 520"/>
    <text class="mappa__sigla" x="226" y="96" text-anchor="end">A14</text>
    <path class="mappa__curve" d="M30 90q40-30 90-14M20 140q50-34 110-14M30 400q50-40 120-20M24 460q50-30 100-10"/>
    ${luogo(318, 44, 'Giulianova')}
    ${luogo(320, 462, 'Silvi')}
    <text class="mappa__mare" x="392" y="300" transform="rotate(90 392 300)" text-anchor="middle">Mare Adriatico</text>
    ${ORDINE_SEDI.map((id) => pin(SEDI[id])).join('\n')}
    <g class="mappa__nord" transform="translate(40 470)"><path d="M0 22V-8M-5-2 0-9 5-2" /><text x="-4" y="40">N</text></g>
  </svg>
  <figcaption>Schema non in scala. Roseto è a nord della foce del Vomano, Pineto a sud.</figcaption>
</figure>`;
};

const scheda = (s) => {
  const tel = linkTel(s);
  const deliv = s.deliveroo || DELIVEROO_ROSETO;
  return `<article class="sede-scheda${s.id === SEDE_PREDEFINITA ? ' is-attiva' : ''}" id="sede-${s.id}" data-scheda-sede="${s.id}" aria-labelledby="sede-${s.id}-titolo">
  <figure class="sede-scheda__foto">
    <!-- FOTO: esterno della sede di ${esc(s.nome)}, 4:5. Segnaposto: sostituire /assets/img/morsi/segnaposto-esterno-${s.id}.svg con la foto vera. -->
    <img src="/assets/img/morsi/segnaposto-esterno-${s.id}.svg" width="400" height="500" loading="lazy" decoding="async" alt="Illustrazione provvisoria della facciata del locale di ${esc(s.nome)}.">
  </figure>
  <div class="sede-scheda__corpo">
    <p class="sede-scheda__etichetta">${esc(s.etichetta)}</p>
    <h3 id="sede-${s.id}-titolo" class="sede-scheda__titolo">${esc(s.nome)}</h3>
    <address class="sede-scheda__indirizzo">${esc(s.via)}<br>${esc(`${s.cap} ${s.citta} (${s.provincia})`)}
      ${s.viaDaConfermare ? `<br>${dc('civico da confermare')} <span class="sede-scheda__nota">${esc(s.viaNota)}</span>` : s.viaNota ? `<br><span class="sede-scheda__nota">${esc(s.viaNota)}</span>` : ''}</address>
    <dl class="sede-scheda__dati">
      <div><dt>Telefono</dt><dd>${s.tel ? esc(s.tel) : dc('numero da confermare')}</dd></div>
      <div><dt>Orari</dt><dd>${esc(s.orari.testo)} ${dc()}</dd></div>
      <div><dt>Chiusura</dt><dd>${esc(s.chiusura)}</dd></div>
      <div><dt>Delivery</dt><dd>${s.deliveroo ? `Deliveroo ${s.deliverooDaConfermare ? dc('scheda da confermare') : ''}` : `Non risulta ${dc()}`}</dd></div>
    </dl>
    <div class="azioni azioni--scheda">
      ${tel ? `<a class="btn btn--pieno" href="${esc(tel)}">Chiama<span class="sr-only"> ${esc(s.nome)}</span></a>` : `<span class="btn btn--pieno btn--spento" aria-disabled="true">Chiama · da confermare</span>`}
      <a class="btn btn--linea" href="${esc(linkIndicazioni(s))}" target="_blank" rel="noopener">Indicazioni<span class="sr-only"> per ${esc(s.nome)} (si apre in una nuova scheda)</span></a>
      ${s.deliveroo ? `<a class="btn btn--linea" href="${esc(deliv)}" target="_blank" rel="noopener">Deliveroo<span class="sr-only"> (si apre in una nuova scheda)</span></a>` : `<span class="btn btn--linea btn--spento" aria-disabled="true">Deliveroo · non risulta</span>`}
    </div>
  </div>
</article>`;
};

export function doveHtml() {
  return `<div class="dove__griglia">
  ${mappa()}
  <div class="dove__schede">
  ${ORDINE_SEDI.map((id) => scheda(SEDI[id])).join('\n')}
  </div>
</div>`;
}
