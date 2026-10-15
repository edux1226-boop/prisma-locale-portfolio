/* Plugin Vite: scrive il menu di Anima nell'HTML a partire da dati/carta.js.
   Nella pagina bastano due segnaposto:
     <!-- @carta-indice -->   l'indice delle sezioni (barra del menu)
     <!-- @carta -->          le sezioni con le voci
   Il risultato è HTML statico: niente JavaScript per leggere il menu. */

import { fileURLToPath, pathToFileURL } from 'node:url';

const DATI = fileURLToPath(new URL('../dati/carta.js', import.meta.url));
const PAGINA = 'anteprime/anima-concept/index.html';

const esc = (testo) =>
  String(testo)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const euro = (n) => n.toFixed(2).replace('.', ',');

const TAG = {
  veg: 'Vegetariana',
  abruzzo: 'Abruzzo',
  illusione: 'Illusionistico',
};

function prezzo(voce) {
  if (Array.isArray(voce.prezzo)) {
    const parti = voce.prezzo.map(
      (p) => `<span class="piatto__variante">${esc(p.etichetta)} <data value="${p.prezzo.toFixed(2)}">${euro(p.prezzo)}</data></span>`,
    );
    return `<p class="piatto__prezzo piatto__prezzo--varianti">${parti.join('')}</p>`;
  }
  return `<p class="piatto__prezzo"><data value="${voce.prezzo.toFixed(2)}">${euro(voce.prezzo)}</data></p>`;
}

function voce(v) {
  const tag = (v.tag || [])
    .map((t) => `<span class="tag tag--${t}">${TAG[t]}</span>`)
    .join('');
  const all = v.all?.length
    ? `<span class="piatto__all"><abbr title="Allergeni, codici del menu del locale">All.</abbr> ${v.all.join(' · ')}</span>`
    : '';
  const meta = tag || all ? `<p class="piatto__meta">${tag}${all}</p>` : '';
  const desc = v.desc ? `<p class="piatto__desc">${esc(v.desc)}</p>` : '';
  return `<li class="piatto${v.desc ? '' : ' piatto--breve'}">
        <h4 class="piatto__nome">${esc(v.nome)}</h4>
        ${prezzo(v)}
        ${desc}
        ${meta}
      </li>`;
}

function sezione(s) {
  const classi = ['carta__sezione'];
  if (s.scura) classi.push('carta__sezione--scura', 'scuro');
  if (s.voci.every((v) => !v.desc)) classi.push('carta__sezione--fitta');
  return `
  <section class="${classi.join(' ')}" id="menu-${s.id}" aria-labelledby="menu-${s.id}-titolo" data-carta-sezione>
    <header class="carta__testa">
      <h3 class="carta__titolo" id="menu-${s.id}-titolo">${esc(s.titolo)}</h3>
      <p class="carta__intro">${esc(s.intro)}</p>
      <p class="carta__conta">${s.voci.length} ${s.voci.length === 1 ? 'voce' : 'voci'}</p>
    </header>
    <ul class="carta__voci" role="list">
      ${s.voci.map(voce).join('\n      ')}
    </ul>
  </section>`;
}

function bere(b) {
  const righe = b.gruppi
    .map(
      (g) => `<li class="piatto">
        <h4 class="piatto__nome">${esc(g.nome)}</h4>
        <p class="piatto__prezzo">${esc(g.prezzo)}</p>
        <p class="piatto__desc">${esc(g.esempi)}</p>
      </li>`,
    )
    .join('\n      ');
  return `
  <section class="carta__sezione" id="menu-${b.id}" aria-labelledby="menu-${b.id}-titolo" data-carta-sezione>
    <header class="carta__testa">
      <h3 class="carta__titolo" id="menu-${b.id}-titolo">${esc(b.titolo)}</h3>
      <p class="carta__intro">${esc(b.intro)}</p>
      <p class="carta__conta">Prezzi indicativi</p>
    </header>
    <ul class="carta__voci" role="list">
      ${righe}
    </ul>
  </section>`;
}

async function leggiDati() {
  // Import fresco a ogni richiesta: in sviluppo il menu si aggiorna senza riavviare.
  return import(`${pathToFileURL(DATI).href}?v=${Date.now()}`);
}

export function cartaAnima() {
  return {
    name: 'carta-anima',
    configureServer(server) {
      server.watcher.add(DATI);
      server.watcher.on('change', (file) => {
        if (file === DATI) server.ws.send({ type: 'full-reload' });
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        if (!ctx.filename.replaceAll('\\', '/').endsWith(PAGINA)) return html;
        const { SEZIONI, BERE, FONTE } = await leggiDati();
        const tutte = [...SEZIONI, BERE];
        const indice = tutte
          .map((s) => `<li><a href="#menu-${s.id}" data-carta-link>${esc(s.breve)}</a></li>`)
          .join('\n        ');
        return html
          .replace('<!-- @carta-indice -->', indice)
          .replace('<!-- @carta -->', SEZIONI.map(sezione).join('\n') + bere(BERE))
          .replaceAll('<!-- @carta-data -->', esc(FONTE.data))
          .replaceAll('@carta-pdf', esc(FONTE.pdf));
      },
    },
  };
}
