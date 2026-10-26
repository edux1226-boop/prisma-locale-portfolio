import { ancora, bussola, boccale, spina, bandiera, mappa } from './svg.js';
import { MENU, BIG, BIG_PREZZO, CONTATTI, prenota } from '../data/menu.js';
import { SPINE } from '../data/birre.js';
import { SERATE } from '../data/serate.js';
import { DA_CONFERMARE } from '../data/daConfermare.js';
import { esc, euro, dc } from './util.js';
import { jsonLd } from './jsonld.js';

/* Ogni segnaposto <!--@nome--> dell'index.html viene sostituito con l'HTML generato dai dati.
   L'HTML esce completo dalla build: il JavaScript aggiunge solo comportamento. */

const alPiatto = () => {
  const cat = MENU.find((c) => c.id === 'al-piatto');
  return `<ul class="piatti" role="list">${cat.voci
    .map(
      (v) => `<li class="piatto"><div class="piatto__testa"><h3>${esc(v.nome)}</h3><span class="piatto__fila" aria-hidden="true"></span><span class="piatto__prezzo">${euro(v.prezzo)}</span></div><p>${esc(v.dettaglio)}${v.daConfermare ? ` ${dc(v.daConfermare)}` : ''}</p></li>`,
    )
    .join('\n')}</ul>`;
};

const segnapostoMenu = () =>
  MENU.filter((c) => c.daCompletare)
    .map(
      (c) => `<li class="segnaposto" id="${c.id}"><h3>${esc(c.titolo)}</h3><p>${dc('sezione da completare con il menu completo')}</p></li>`,
    )
    .join('\n');

/* Il boccale fa da indice: ogni livello è un link alla sezione del menu. */
const indiceBoccale = () =>
  `<ol class="livelli" role="list" data-livelli>${MENU.map(
    (c, i) =>
      `<li class="livello" data-livello="${i}"><a href="${c.vedi ?? (c.id === 'al-piatto' ? '#menu' : `#${c.id}`)}"><span class="livello__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="livello__nome">${esc(c.titolo)}</span>${c.nota ? `<span class="livello__nota">${esc(c.nota)}</span>` : c.daCompletare ? `<span class="livello__nota">da completare</span>` : ''}</a></li>`,
  ).join('\n')}</ol>`;

const spineHtml = () =>
  `<ul class="spine" role="list">${SPINE.map(
    (s) =>
      `<li class="spina-scheda">${spina(s.colore, s.n)}<p class="spina-scheda__n">Spina ${s.n}</p><h3>Birra alla spina ${s.n}</h3><p>${dc('marca e stile da confermare')}</p></li>`,
  ).join('\n')}</ul>`;

const bigHtml = () =>
  `<ol class="flotta" role="list" data-flotta>${BIG.map(
    (b, i) => `<li class="nave" data-nave>
      ${bandiera(b.id)}
      <div class="nave__corpo">
        <p class="nave__num">N° ${i + 1}</p>
        <h3>${esc(b.nome)}</h3>
        <p class="nave__regione">${esc(b.regione)}</p>
        <p class="nave__ing">${dc('ingredienti da confermare')}</p>
        <p class="nave__prezzo">${euro(BIG_PREZZO)}</p>
      </div>
    </li>`,
  ).join('\n')}</ol>`;

const serateHtml = () =>
  `<ul class="serate" role="list">${SERATE.map(
    (s) => `<li class="serata"><h3>${esc(s.titolo)}</h3><p>${esc(s.testo)}</p><p>${dc('da confermare')}</p></li>`,
  ).join('\n')}</ul>`;

const doveHtml = () => `<div class="dove__griglia">
  <div class="mappa">${mappa()}<p class="mappa__nota">Mappa schematica, non in scala.</p></div>
  <div class="scheda-dove">
    <address>
      <strong>Lord Nelson</strong><br>
      ${esc(CONTATTI.via)}<br>
      ${esc(CONTATTI.cap)} ${esc(CONTATTI.citta)} (${esc(CONTATTI.provincia)}) ${dc('CAP da verificare')}
    </address>
    <p class="scheda-dove__tel">Info e prenotazioni: <a href="${CONTATTI.telHref}">${esc(CONTATTI.tel)}</a>, anche WhatsApp.</p>
    <p class="scheda-dove__orari"><strong>Orari</strong> ${dc('orari e giorno di chiusura da confermare')}</p>
    <div class="azioni">
      <a class="btn btn--pieno" href="${prenota()}" rel="noopener">Prenota su WhatsApp</a>
      <a class="btn btn--linea" href="${CONTATTI.telHref}">Chiama</a>
      <a class="btn btn--linea" href="${CONTATTI.mappe}" target="_blank" rel="noopener">Indicazioni<span class="sr-only"> (si apre in una nuova scheda)</span></a>
    </div>
  </div>
</div>`;

const daConfermareHtml = () =>
  `<ol class="confermare__lista" role="list">${DA_CONFERMARE.map(
    (v, i) =>
      `<li><span class="confermare__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(v.titolo)}</h3><p>${esc(v.testo)}</p></div></li>`,
  ).join('\n')}</ol>`;

const BLOCCHI = {
  'ancora': () => ancora('class="orn orn--ancora"'),
  'bussola': () => bussola('class="orn orn--bussola"'),
  'bussola-grande': () => bussola('class="orn orn--grande"'),
  'boccale': boccale,
  'indice-boccale': indiceBoccale,
  'al-piatto': alPiatto,
  'segnaposto-menu': segnapostoMenu,
  'spine': spineHtml,
  'big': bigHtml,
  'serate': serateHtml,
  'dove': doveHtml,
  'da-confermare': daConfermareHtml,
  'json-ld': jsonLd,
};

export function renderPagina(html) {
  return html.replace(/<!--@([a-z-]+)-->/g, (_, nome) => {
    if (!BLOCCHI[nome]) throw new Error(`Lord Nelson: blocco sconosciuto "${nome}"`);
    return BLOCCHI[nome]();
  });
}
