/* Blocchi della pagina Menu: tutto in HTML, niente PDF da aprire. */
import { esc, md, euro, foto, grande } from '../utili.js';
import { ico, allergeniUsati, nomeAllergene, testoAlt, prezzo } from '../parti.js';
import { urlPdf } from './comuni.js';

const tutteLeSezioni = (ctx) => [...ctx.menu.sezioni, ctx.menu.degustazioni, ctx.menu.vini];

function indice(ctx) {
  const voci = tutteLeSezioni(ctx)
    .map((s) => `    <li><a class="indice__voce" href="#${s.id}" data-indice-voce="${s.id}">${esc(s.breve)}</a></li>`)
    .join('\n');
  return `<nav class="indice" aria-label="${esc(ctx.t.menuPagina.indice)}" data-indice>
  <ul class="indice__voci" role="list">
${voci}
  </ul>
</nav>`;
}

/* Gli interruttori compaiono solo con lo script (senza, non servirebbero). */
function filtri(ctx) {
  const t = ctx.t.menuPagina;
  return `<div class="filtri" data-filtri hidden>
  <p class="filtri__titolo" id="filtri-titolo">${esc(t.filtri)}</p>
  <div class="filtri__voci" role="group" aria-labelledby="filtri-titolo">
    <label class="interruttore">
      <input type="checkbox" role="switch" data-filtro="veg">
      <span class="interruttore__pista" aria-hidden="true"></span>
      ${ico('foglia')}<span>${esc(t.vegetariano)}</span>
    </label>
    <label class="interruttore">
      <input type="checkbox" role="switch" data-filtro="sg">
      <span class="interruttore__pista" aria-hidden="true"></span>
      ${ico('senza-glutine')}<span>${esc(t.senzaGlutine)}</span>
    </label>
  </div>
  <p class="filtri__conto" aria-live="polite" data-filtri-conto data-parola="${esc(t.conteggio)}"></p>
</div>`;
}

function legenda(ctx) {
  const voci = allergeniUsati(ctx)
    .map((a) => `    <li><svg class="ico" aria-hidden="true" focusable="false"><use href="#a-${a}"/></svg>${esc(nomeAllergene(ctx, a))}</li>`)
    .join('\n');
  return `<details class="legenda">
  <summary>${ico('info')}${esc(ctx.t.menuPagina.legenda)}</summary>
  <ul class="legenda__voci" role="list">
${voci}
  </ul>
</details>`;
}

function piatto(ctx, p) {
  const t = ctx.t.menuPagina;
  const tag = [
    p.consigliato && `<li class="tag tag--chef">${ico('chef')}${esc(t.consigliato)}</li>`,
    p.vegetariano && `<li class="tag tag--veg">${ico('foglia')}${esc(t.tagVegetariano)}</li>`,
    p.senzaGlutine && `<li class="tag tag--sg">${ico('senza-glutine')}${esc(t.tagSenzaGlutine)}</li>`,
    p.stagionale && `<li class="tag tag--stagione">${ico('stagione')}${esc(t.tagStagionale)}</li>`,
  ].filter(Boolean);
  const allergeni = (p.allergeni ?? []).map((a) => `<li class="allergene"><svg class="ico" aria-hidden="true" focusable="false"><use href="#a-${a}"/></svg>${esc(nomeAllergene(ctx, a, true))}</li>`);
  const fotoPiatto = p.foto
    ? `
    <button class="piatto__foto" type="button" data-lightbox="menu" data-grande="${grande(`piatti/${p.foto}`)}" data-dida="${esc(p.nome)}" data-alt="${esc(testoAlt(ctx, p.fotoAlt))}">
      ${foto(`piatti/${p.foto}`, { alt: p.fotoAlt, sizes: '(min-width: 48em) 240px, 160px', ctx })}
      <span class="piatto__zoom">${ico('ingrandisci')}</span>
    </button>`
    : '';
  return `  <li class="piatto${p.foto ? ' piatto--foto' : ''}${p.consigliato ? ' piatto--chef' : ''}" id="piatto-${p.id}" data-veg="${p.vegetariano ? 1 : 0}" data-sg="${p.senzaGlutine ? 1 : 0}">
    <div class="piatto__testo">
      <div class="piatto__riga">
        <h3 class="piatto__nome">${esc(p.nome)}</h3>
        <p class="piatto__prezzo"><span class="sr-only">Prezzo </span>${prezzo(p.prezzo)}</p>
      </div>
      <p class="piatto__desc">${md(p.descrizione, ctx)}</p>
      ${tag.length ? `<ul class="piatto__tag" role="list">${tag.join('')}</ul>` : ''}
      ${allergeni.length ? `<ul class="allergeni" role="list" aria-label="Allergeni">${allergeni.join('')}</ul>` : ''}
    </div>${fotoPiatto}
  </li>`;
}

function sezione(ctx, s) {
  return `<section class="menu-sezione" id="${s.id}" aria-labelledby="${s.id}-titolo" data-sezione>
  <header class="menu-sezione__testa">
    <h2 class="menu-sezione__titolo" id="${s.id}-titolo">${md(s.titolo, ctx)}</h2>
    <p>${md(s.intro, ctx)}</p>
  </header>
  <ul class="piatti" role="list">
${s.piatti.map((p) => piatto(ctx, p)).join('\n')}
  </ul>
  <p class="menu-sezione__vuota" data-vuota hidden>${esc(ctx.t.menuPagina.nessuno)}</p>
</section>`;
}

function degustazioni(ctx) {
  const d = ctx.menu.degustazioni;
  const t = ctx.t.menuPagina;
  const carte = d.menu.map((m) => `  <article class="degustazione" aria-labelledby="deg-${m.id}">
    <header class="degustazione__testa">
      <p class="degustazione__portate">${m.portate} ${esc(t.degustazionePortate)}</p>
      <h3 class="degustazione__nome" id="deg-${m.id}">${esc(m.nome)}</h3>
      <p class="degustazione__prezzo">${prezzo(m.prezzo)} <span>a persona</span></p>
    </header>
    <p class="degustazione__desc">${md(m.descrizione, ctx)}</p>
    <ol class="degustazione__piatti" role="list">
${m.piatti.map((nome) => `      <li>${esc(nome)}</li>`).join('\n')}
    </ol>
    <a class="btn btn--secondario" href="${ctx.url('prenota')}" data-prenota="degustazione">${esc(t.degustazionePrenota)}</a>
  </article>`).join('\n');
  return `<section class="menu-sezione menu-sezione--degustazione" id="${d.id}" aria-labelledby="${d.id}-titolo" data-sezione data-sezione-fissa>
  <header class="menu-sezione__testa">
    <h2 class="menu-sezione__titolo" id="${d.id}-titolo">${md(d.titolo, ctx)}</h2>
    <p>${md(d.intro, ctx)}</p>
  </header>
  <div class="degustazioni">
${carte}
  </div>
</section>`;
}

function vini(ctx) {
  const v = ctx.menu.vini;
  const voci = v.voci.map((x) => `    <li class="vino">
      <div class="vino__riga"><h3 class="vino__nome">${esc(x.nome)}</h3><p class="vino__prezzo">${esc(euro(x.prezzo))}</p></div>
      <p class="vino__desc">${md(x.descrizione, ctx)}</p>
    </li>`).join('\n');
  return `<section class="menu-sezione menu-sezione--vini" id="${v.id}" aria-labelledby="${v.id}-titolo" data-sezione data-sezione-fissa>
  <header class="menu-sezione__testa">
    <h2 class="menu-sezione__titolo" id="${v.id}-titolo">${md(v.titolo, ctx)}</h2>
    <p>${md(v.intro, ctx)}</p>
  </header>
  <ul class="vini" role="list">
${voci}
  </ul>
  <p class="vini__nota">${ico('info')}${md(v.nota, ctx)}</p>
</section>`;
}

function sezioni(ctx) {
  return [...ctx.menu.sezioni.map((s) => sezione(ctx, s)), degustazioni(ctx), vini(ctx)].join('\n\n');
}

function note(ctx) {
  const t = ctx.t.menuPagina;
  return `<aside class="menu-note" aria-labelledby="note-titolo">
  <h2 class="menu-note__titolo" id="note-titolo">${esc(t.noteTitolo)}</h2>
  <ul role="list">
${ctx.menu.note.map((n) => `    <li>${md(n, ctx)}</li>`).join('\n')}
  </ul>
</aside>`;
}

function pdf(ctx) {
  return `<a class="btn btn--secondario" href="${urlPdf(ctx)}" download data-traccia="menu_pdf" data-posizione="menu">${ico('scarica')}${esc(ctx.t.menuPagina.pdf)}</a>`;
}

export const menu = {
  'menu-indice': indice,
  'menu-filtri': filtri,
  'menu-legenda': legenda,
  'menu-sezioni': sezioni,
  'menu-note': note,
  'menu-pdf': pdf,
};
