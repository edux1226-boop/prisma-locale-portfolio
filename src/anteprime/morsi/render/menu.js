import { CATEGORIE, FORMULA, AGGIUNTE, NOTA_PREZZI, FORMATI } from '../data/menu.js';
import { esc, euro, dc } from './util.js';
import { badgeBest, badgeNew, iconaFoglia } from './svg.js';

const formati = (lista) =>
  lista?.length
    ? `<span class="formati" aria-label="Formati: ${lista.map((n) => `${n} smash`).join(', ')}">${lista
        .map((n) => `<span class="formati__x">${FORMATI[n]}</span>`)
        .join('')}</span>`
    : '';

const prezzo = (v) => {
  if (v.prezzo == null) return `<p class="voce__prezzo voce__prezzo--vuoto"><span aria-hidden="true">—</span><span class="sr-only">prezzo da confermare</span></p>`;
  return `<p class="voce__prezzo">${v.prezzoDa ? '<span class="voce__da">da</span> ' : ''}${euro(v.prezzo)}<span class="sr-only"> (indicativo)</span></p>`;
};

const voce = (v) => `<li class="voce${v.bestSeller ? ' voce--best' : ''}${v.firma ? ' voce--firma' : ''}">
  <div class="voce__corpo">
    <h4 class="voce__nome">${esc(v.nome)}${v.veggy ? ` ${iconaFoglia}` : ''}${v.formati ? ` ${formati(v.formati)}` : ''}</h4>
    <p class="voce__ing">${esc(v.ingredienti)}${v.pz ? ` <span class="voce__pz">(${esc(v.pz)})</span>` : ''}</p>
  </div>
  ${prezzo(v)}
  ${v.bestSeller ? badgeBest : ''}
</li>`;

const gruppo = (g, catTitolo) => {
  if (g.elenco) {
    return `<ul class="elenco" role="list">${g.elenco.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`;
  }
  const mostraTitolo = g.titolo && g.titolo.toLowerCase() !== catTitolo.toLowerCase();
  return `<div class="gruppo">
  ${g.formati || g.prezzoNota || mostraTitolo ? `<div class="gruppo__testa">
    ${mostraTitolo ? `<h4 class="gruppo__titolo">${esc(g.titolo)}</h4>` : '<span></span>'}
    ${formati(g.formati)}
  </div>` : ''}
  ${g.prezzoNota ? `<p class="gruppo__nota">${esc(g.prezzoNota)} ${dc()}</p>` : ''}
  <ul class="voci" role="list">${g.voci.map(voce).join('\n')}</ul>
</div>`;
};

const figura = (c) =>
  c.figura === 'foto-melt'
    ? `<figure class="pannello__figura pannello__figura--foto">
    <picture>
      <source type="image/avif" srcset="/assets/img/morsi/melt-m.avif 498w, /assets/img/morsi/melt-l.avif 996w" sizes="(min-width: 900px) 320px, 70vw">
      <img src="/assets/img/morsi/melt-m.webp" srcset="/assets/img/morsi/melt-m.webp 498w, /assets/img/morsi/melt-l.webp 996w" sizes="(min-width: 900px) 320px, 70vw" width="498" height="510" loading="lazy" decoding="async" alt="Il Morsi Melt: doppio smash, uovo fritto con il tuorlo che cola, bacon e cheddar fuso tra due fette di pane tostato, su carta con le faccine blu.">
    </picture>
  </figure>`
    : `<figure class="pannello__figura">
    <!-- FOTO: ${esc(c.titolo)}, 4:5. Segnaposto a linea: sostituire /assets/img/morsi/segnaposto-${c.figura}.svg con la foto vera. -->
    <img src="/assets/img/morsi/segnaposto-${c.figura}.svg" width="400" height="500" loading="lazy" decoding="async" alt="">
  </figure>`;

const pannello = (c, i) => `<section class="pannello${c.box ? ' pannello--box' : ''}" id="pan-${c.id}" role="tabpanel" aria-labelledby="sc-${c.id}" data-pannello="${c.id}"${i ? '' : ''}>
  ${figura(c)}
  <div class="pannello__corpo">
    <h3 class="pannello__titolo">${esc(c.titolo)}</h3>
    ${c.nuovo ? badgeNew : ''}
    ${c.gruppi.map((g) => gruppo(g, c.titolo)).join('\n')}
  </div>
</section>`;

export function menuHtml() {
  const schede = CATEGORIE.map(
    (c, i) =>
      `<button class="scheda" role="tab" id="sc-${c.id}" type="button" aria-controls="pan-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-scheda="${c.id}">${esc(c.scheda)}${c.nuovo ? ' <span class="scheda__new" aria-hidden="true">new</span>' : ''}</button>`,
  ).join('\n');
  return `<div class="menu__schede" role="tablist" aria-label="Sezioni del menu" data-schede>
${schede}
</div>
<div class="menu__pannelli" data-pannelli>
${CATEGORIE.map(pannello).join('\n')}
</div>
<div class="menu__box">
  <aside class="riquadro riquadro--formula" aria-labelledby="formula-titolo">
    <h3 id="formula-titolo" class="riquadro__titolo">${esc(FORMULA.titolo)}</h3>
    <p class="riquadro__grande">${esc(FORMULA.testo)}</p>
    <ul class="riquadro__extra" role="list">${FORMULA.extra.map((e) => `<li>+ ${esc(e)}</li>`).join('')}</ul>
    <p class="riquadro__nota">${esc(FORMULA.prezzoNota)} ${dc()}</p>
  </aside>
  <aside class="riquadro riquadro--aggiunte" aria-labelledby="aggiunte-titolo">
    <h3 id="aggiunte-titolo" class="riquadro__titolo">${esc(AGGIUNTE.titolo)}</h3>
    <ul class="riquadro__chip" role="list">${AGGIUNTE.voci.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
    <p class="riquadro__freccia"><svg viewBox="0 0 80 40" aria-hidden="true"><path d="M4 6c26-8 54 2 66 26M70 32l-14-2M70 32l-2-14"/></svg>${esc(AGGIUNTE.invito)}</p>
  </aside>
</div>
<p class="menu__nota" role="note">${esc(NOTA_PREZZI)} Ingredienti e voci dal menu cartaceo; le quantità poco leggibili sono segnate “da confermare”.</p>`;
}
