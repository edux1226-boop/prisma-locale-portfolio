/* Compone una pagina dell'anteprima: legge l'id della pagina da
   <html data-pagina="…">, sostituisce i segnaposto con i contenuti JSON
   e i commenti <!-- @blocco --> con l'HTML dei blocchi.

   Segnaposto nel testo:
     {{ percorso.nel.json }}   testo semplice (per attributi e titoli)
     {{md percorso}}           testo con *corsivo*, **grassetto**, link e [dc]
     {{p percorso}}            uno o più paragrafi <p>
     {{url id-pagina}}         indirizzo di una pagina del sito
   Abbreviazioni: t = testi, r = ristorante, s = sito. */
import { esc, md, paragrafi, prendi, senzaDc } from './utili.js';
import { comuni } from './blocchi/comuni.js';
import { home } from './blocchi/home.js';
import { menu } from './blocchi/menu.js';
import { pagine } from './blocchi/pagine.js';

const BLOCCHI = { ...comuni, ...home, ...menu, ...pagine };

export function contesto(dati, pagina) {
  const { sito } = dati;
  if (!sito.pagine[pagina]) throw new Error(`[casetta] pagina sconosciuta: "${pagina}"`);
  const anteprima = Boolean(sito.anteprima);
  const radice = anteprima
    ? `${sito.dominioAnteprima.replace(/\/$/, '')}${sito.base}`
    : `${sito.dominio.replace(/\/$/, '')}/`;
  return {
    dati,
    sito,
    r: dati.ristorante,
    t: dati.testi,
    menu: dati.menu,
    galleria: dati.galleria,
    recensioni: dati.recensioni,
    pagina,
    anteprima,
    base: sito.base,
    radice,
    dominio: radice.replace(/\/$/, ''),
    dominioImmagini: (anteprima ? sito.dominioAnteprima : sito.dominio).replace(/\/$/, ''),
    url: (id) => {
      if (!sito.pagine[id]) throw new Error(`[casetta] {{url ${id}}}: pagina sconosciuta`);
      return `${sito.base}${sito.pagine[id].percorso}`;
    },
    assoluto: (id) => `${radice}${sito.pagine[id].percorso}`,
  };
}

const ALIAS = { t: 'testi', r: 'ristorante', s: 'sito' };

function valore(ctx, percorso) {
  const [testa, ...resto] = percorso.split('.');
  const v = prendi(ctx.dati, [ALIAS[testa] ?? testa, ...resto].join('.'));
  if (v === undefined) throw new Error(`[casetta] {{${percorso}}} non esiste nei contenuti (pagina ${ctx.pagina})`);
  return v;
}

export function componi(html, dati) {
  const pagina = html.match(/<html[^>]*\sdata-pagina="([^"]+)"/)?.[1];
  if (!pagina) throw new Error('[casetta] manca data-pagina su <html>');
  const ctx = contesto(dati, pagina);

  const conTesti = html.replace(/\{\{\s*(?:(md|p|url)\s+)?([\w.-]+)\s*\}\}/g, (_, modo, percorso) => {
    if (modo === 'url') return ctx.url(percorso);
    const v = valore(ctx, percorso);
    if (modo === 'md') return md(v, ctx);
    if (modo === 'p') return paragrafi(v, ctx);
    return esc(senzaDc(v));
  });

  return conTesti.replace(/<!--\s*@([\w-]+)(?:\s+([^\s>-][^>]*?))?\s*-->/g, (_, nome, arg) => {
    const blocco = BLOCCHI[nome];
    if (!blocco) throw new Error(`[casetta] blocco sconosciuto: @${nome} (pagina ${pagina})`);
    return blocco(ctx, arg?.trim());
  });
}
