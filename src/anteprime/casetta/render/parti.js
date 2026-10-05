/* Pezzi di HTML riusati dai blocchi. */
import { esc, md, virgola, euro } from './utili.js';

export const ico = (nome, classe = 'ico') => `<svg class="${classe}" aria-hidden="true" focusable="false"><use href="#i-${nome}"/></svg>`;

export const nuovaScheda = (ctx) => `<span class="sr-only"> ${esc(ctx.t.comuni.nuovaScheda)}</span>`;
export const ESTERNO = 'target="_blank" rel="noopener"';

export const tel = (ctx, chi = 'telefono') => `tel:${ctx.r[chi].numero}`;
export const wa = (ctx, testo) => `https://wa.me/${ctx.r.whatsapp.numero}?text=${encodeURIComponent(testo)}`;

/* Stelle del voto: cinque sagome, riempite fino al voto con un ritaglio. */
let contaStelle = 0;
export function stelle(voto, { decorative = false, classe = 'stelle' } = {}) {
  const id = `stelle-${++contaStelle}`;
  const pieno = (Math.max(0, Math.min(5, voto)) / 5) * 120;
  const punte = [0, 1, 2, 3, 4].map((i) => `<use href="#i-stella" x="${i * 24}" width="22" height="22"/>`).join('');
  const ruolo = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${virgola(voto)} su 5 stelle"`;
  return `<svg class="${classe}" viewBox="0 0 118 22" ${ruolo} focusable="false"><defs><clipPath id="${id}"><rect width="${pieno}" height="22"/></clipPath></defs><g class="stelle__vuote">${punte}</g><g class="stelle__piene" clip-path="url(#${id})">${punte}</g></svg>`;
}

export function logo(ctx, { chiaro = false, decorativo = false } = {}) {
  const classe = `logo${chiaro ? ' logo--chiaro' : ''}`;
  const interno = `${ico('casetta', 'logo__casa')}<span class="logo__nome"><span class="logo__la">La Casetta</span><span class="logo__di">di Paparill</span></span>`;
  if (decorativo) return `<p class="${classe}" aria-hidden="true">${interno}</p>`;
  const corrente = ctx.pagina === 'home' ? ' aria-current="page"' : '';
  return `<a class="${classe}" href="${ctx.url('home')}"${corrente} aria-label="${esc(ctx.t.testata.home)}">${interno}</a>`;
}

export const corrente = (ctx, id) => (ctx.pagina === id ? ' aria-current="page"' : '');

export const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* Tutti i piatti del menu, per id. */
export function piattiPerId(ctx) {
  return new Map(ctx.menu.sezioni.flatMap((s) => s.piatti.map((p) => [p.id, p])));
}

/* Le foto della galleria, per file. */
export function fotoPerFile(ctx) {
  return new Map(ctx.galleria.categorie.flatMap((c) => c.foto.map((f) => [f.file, { ...f, categoria: c.id }])));
}

export function testoAlt(ctx, alt) {
  if (!alt || !ctx.anteprima) return alt ?? '';
  return `${ctx.t.comuni.illustrazione}: ${alt.charAt(0).toLowerCase()}${alt.slice(1)}`;
}

/* Allergeni usati davvero nel menu, nell'ordine del regolamento. */
export function allergeniUsati(ctx) {
  const usati = new Set(ctx.menu.sezioni.flatMap((s) => s.piatti.flatMap((p) => p.allergeni ?? [])));
  return Object.keys(ctx.menu.allergeni).filter((a) => usati.has(a));
}

const BREVI = { latte: 'Latte', solfiti: 'Solfiti' };
export const nomeAllergene = (ctx, a, breve = false) => (breve && BREVI[a]) || ctx.menu.allergeni[a] || a;

export function prezzo(v) {
  return `<span class="prezzo">${euro(v)}</span>`;
}

export { md, esc };
