export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmt = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const euro = (n) => `${fmt.format(n)} €`;

/** Chip "da confermare", visibile e riconoscibile. */
export const dc = (testo = 'da confermare', attr = '') =>
  `<span class="dc"${attr ? ` ${attr}` : ''}>${esc(testo)}</span>`;
