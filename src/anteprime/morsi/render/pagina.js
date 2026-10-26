import { logo, mascotte } from './svg.js';
import { menuHtml } from './menu.js';
import { selettoreHtml, stripSedeHtml, azioniSedeHtml, doveHtml } from './sede.js';
import { recensioniHtml } from './recensioni.js';
import { daConfermareHtml } from './daConfermare.js';
import { jsonLd } from './jsonld.js';
import { smashPalcoHtml } from './smash.js';

/* Ogni segnaposto <!--@nome--> dell'index.html viene sostituito con l'HTML generato dai dati.
   L'HTML esce completo dalla build: il JavaScript aggiunge solo comportamento. */
const BLOCCHI = {
  'logo': () => logo('class="logo" aria-hidden="true" focusable="false"'),
  'logo-piccolo': () => logo('class="logo logo--piccolo" aria-hidden="true" focusable="false"'),
  'mascotte': () => mascotte('class="mascotte mascotte--ciao" aria-hidden="true" focusable="false"'),
  'mascotte-footer': () => mascotte('class="mascotte mascotte--footer" aria-hidden="true" focusable="false"'),
  'mascotte-vuota': () => mascotte('class="mascotte mascotte--scaduta" aria-hidden="true" focusable="false"'),
  'selettore-sede': selettoreHtml,
  'strip-sede': stripSedeHtml,
  'azioni-sede': () => azioniSedeHtml('azioni--hero'),
  'smash-palco': smashPalcoHtml,
  'menu': menuHtml,
  'dove': doveHtml,
  'recensioni': recensioniHtml,
  'da-confermare': daConfermareHtml,
  'json-ld': jsonLd,
};

export function renderPagina(html) {
  return html.replace(/<!--@([a-z-]+)-->/g, (_, nome) => {
    if (!BLOCCHI[nome]) throw new Error(`Morsi: blocco sconosciuto "${nome}"`);
    return BLOCCHI[nome]();
  });
}
