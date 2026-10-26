import { DA_CONFERMARE } from '../data/daConfermare.js';
import { esc } from './util.js';

export const daConfermareHtml = () =>
  `<ol class="confermare__lista" role="list">${DA_CONFERMARE.map(
    (v, i) => `<li><span class="confermare__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(v.titolo)}</h3><p>${esc(v.testo)}</p></div></li>`,
  ).join('\n')}</ol>`;
