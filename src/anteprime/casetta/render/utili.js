/* Aiuti per comporre l'HTML a partire dai contenuti JSON (lato Node, in build
   e nel dev server). Nessuna dipendenza: solo stringhe. */

export const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[c]));

/* [dc] o [dc:etichetta] in un testo = dato da confermare con il ristorante.
   Nell'anteprima diventa un'etichetta visibile, online sparisce. */
const DC = /\s*\[dc(?::([^\]]+))?\]/g;
export const senzaDc = (s) => String(s ?? '').replace(DC, '').trim();
export const haDc = (s) => /\[dc(?::[^\]]+)?\]/.test(String(s ?? ''));

export function etichettaDc(ctx, testo = 'da confermare') {
  return ctx.anteprima ? ` <span class="dc">${esc(testo)}</span>` : '';
}

/* Markdown minimo: *corsivo*, **grassetto**, [testo](link) e [dc]. */
export function md(s, ctx) {
  let h = esc(s);
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return h.replace(DC, (_, etichetta) => etichettaDc(ctx, etichetta));
}

export const paragrafi = (voce, ctx, classe = '') => [].concat(voce)
  .map((p) => `<p${classe ? ` class="${classe}"` : ''}>${md(p, ctx)}</p>`).join('\n');

export function prendi(dati, percorso) {
  let nodo = dati;
  for (const parte of percorso.split('.')) {
    if (nodo == null || !(parte in Object(nodo))) return undefined;
    nodo = nodo[parte];
  }
  return nodo;
}

export function euro(v) {
  if (v == null || v === '') return '';
  const cifra = typeof v === 'number'
    ? (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','))
    : String(v);
  return `€ ${cifra}`;
}

/* 4.5 → "4,5" */
export const virgola = (n) => String(n).replace('.', ',');

/* Ore e fasce ------------------------------------------------------------ */
export const fascia = ([da, a]) => `${da}–${a}`;
const minuti = (ora) => { const [h, m] = ora.split(':').map(Number); return h * 60 + m; };
export const ePranzo = ([da]) => minuti(da) < 16 * 60;

/* Raggruppa i giorni con gli stessi orari: "lun–mar, gio–sab". */
export function orariRaggruppati(giorni) {
  const gruppi = new Map();
  giorni.forEach((g, i) => {
    const chiave = JSON.stringify(g.fasce);
    if (!gruppi.has(chiave)) gruppi.set(chiave, { fasce: g.fasce, indici: [] });
    gruppi.get(chiave).indici.push(i);
  });
  return [...gruppi.values()].map(({ fasce, indici }) => {
    const tratti = [];
    for (const i of indici) {
      const ultimo = tratti.at(-1);
      if (ultimo && ultimo[1] === i - 1) ultimo[1] = i;
      else tratti.push([i, i]);
    }
    const nomi = tratti.map(([a, b]) => (a === b ? giorni[a].breve : `${giorni[a].breve}–${giorni[b].breve}`));
    return { giorni: nomi.join(', '), fasce, primo: indici[0] };
  }).sort((x, y) => (x.fasce.length === 0) - (y.fasce.length === 0) || x.primo - y.primo);
}

/* Orari delle prenotazioni: dall'apertura a un'ora prima della chiusura. */
export function slot([da, a], passo = 30) {
  const fine = minuti(a) - 60;
  const voci = [];
  for (let t = minuti(da); t <= fine; t += passo) {
    voci.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }
  return voci;
}

/* Immagini ---------------------------------------------------------------- */
const LARGHEZZE = [600, 1200];

/* <picture> AVIF + WebP per le immagini 4:3 in /assets/img/casetta/. */
export function foto(file, { alt = '', sizes = '100vw', classe = '', lazy = true, ctx, w = 1200, h = 900 } = {}) {
  const radice = `/assets/img/casetta/${file}`;
  const set = (ext) => LARGHEZZE.map((l) => `${radice}-${l}.${ext} ${l}w`).join(', ');
  const testoAlt = alt && ctx?.anteprima ? `${ctx.t.comuni.illustrazione}: ${alt.charAt(0).toLowerCase()}${alt.slice(1)}` : alt;
  return `<picture${classe ? ` class="${classe}"` : ''}>
  <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
  <img src="${radice}-600.webp" srcset="${set('webp')}" sizes="${sizes}" width="${w}" height="${h}"${lazy ? ' loading="lazy"' : ''} decoding="async" alt="${esc(testoAlt)}">
</picture>`;
}

export const grande = (file) => `/assets/img/casetta/${file}-1200`;
