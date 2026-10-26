import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const leggi = (nome) => readFileSync(fileURLToPath(new URL(`../svg/${nome}.svg`, import.meta.url)), 'utf8').trim();

/** Aggiunge classi/attributi al tag <svg> radice di un file SVG. */
const su = (svg, attrs) => svg.replace('<svg ', `<svg ${attrs} `);
const senzaCommento = (svg) => svg.replace(/<!--[\s\S]*?-->\s*/, '');
const commento = (svg) => (svg.match(/<!--[\s\S]*?-->/) || [''])[0];

export const logo = (attrs = 'class="logo" aria-hidden="true" focusable="false"') => {
  const s = leggi('logo');
  return `${commento(s)}\n${su(senzaCommento(s), attrs)}`;
};

export const mascotte = (attrs = 'aria-hidden="true" focusable="false"') => {
  const s = leggi('mascotte');
  return `${commento(s)}\n${su(senzaCommento(s), attrs)}`;
};

/* Badge disegnati a mano, come sul menu cartaceo. */
export const badgeBest = `<svg class="badge badge--best" viewBox="0 0 100 58" role="img" aria-label="Best seller"><path d="M14 44q-12 0-12-10t12-12q-2-14 14-14 6-8 20-4 10-6 22 2 14-2 18 12 14 2 12 14t-12 12q-2 12-16 10-8 6-22 2-12 4-22-2-14 2-16-10Z"/><text x="50" y="26" text-anchor="middle">best</text><text x="50" y="40" text-anchor="middle">seller</text></svg>`;

export const badgeNew = `<svg class="badge badge--new" viewBox="0 0 80 80" role="img" aria-label="Novità"><path d="m40 2 7 14 14-8 1 16 16 1-8 14 14 7-14 7 8 14-16 1-1 16-14-8-7 14-7-14-14 8-1-16-16-1 8-14L2 40l14-7-8-14 16-1 1-16 14 8Z"/><text x="40" y="47" text-anchor="middle">new</text></svg>`;

export const iconaFoglia = `<svg class="foglia" viewBox="0 0 24 24" role="img" aria-label="Vegetariano"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z"/><path d="M5 19 14 10"/></svg>`;
