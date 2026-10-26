/* Il panino a strati della sezione "Il nostro smash", disegnato a linea come il menu cartaceo.
   Modulo puro: lo usano sia la build (HTML statico, con 2 smash) sia il browser (x1 … x4).
   Gli strati si disegnano attorno a x = 0; i colori stanno nelle classi .ill-* del CSS. */

export const LARGHEZZA = 320;
export const ALTEZZA = 360;
export const VIEWBOX = `0 64 ${LARGHEZZA} 286`; // ritaglio sul panino: sopra si taglia, la palla cade da fuori
export const CX = 160;
export const BASE = 300; // y del fondo del panino, sopra la piastra
export const PIASTRA_Y = 308;
export const MAX_SMASH = 4;

// Numero pseudo-casuale ripetibile: i bordi frastagliati sono identici a ogni render.
const rnd = (seme) => {
  const x = Math.sin(seme * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const frastagliato = (seme, mezza, alt) => {
  // bordo superiore e inferiore irregolari, come una polpetta schiacciata sulla piastra
  const passi = 14;
  let su = '';
  let giu = '';
  for (let i = 0; i <= passi; i++) {
    const x = -mezza + (2 * mezza * i) / passi;
    const j = (rnd(seme + i) - 0.5) * 5;
    const bordo = i === 0 || i === passi ? 0 : j;
    su += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(1 + bordo).toFixed(1)}`;
    giu = `L${x.toFixed(1)} ${(alt - 1 - bordo * 0.6).toFixed(1)}${giu}`;
  }
  return `${su}${giu}Z`;
};

const crosta = (seme, mezza, alt) => {
  let d = '';
  for (let i = 0; i < 11; i++) {
    const x = -mezza + 14 + rnd(seme + i * 3) * (2 * mezza - 28);
    const y = 3 + rnd(seme + i * 5) * (alt - 8);
    d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(5 + rnd(seme + i) * 6).toFixed(1)} 0`;
  }
  return d;
};

export const STRATI = {
  'pan-basso': {
    alt: 28,
    svg: () => `<path class="ill-pane" d="M-100 0H100V10Q100 28 80 28H-80Q-100 28 -100 10Z"/>
<path class="ill-linea" d="M-70 22H70"/>`,
  },
  salsa: {
    alt: 6,
    svg: () => `<path class="ill-salsa" d="M-92 0Q-60 9-30 3T30 3T92 0V3Q60 11 30 7T-30 7T-92 3Z"/>`,
  },
  smash: {
    alt: 15,
    svg: (i) => `<path class="ill-carne" d="${frastagliato(i * 17, 112, 15)}"/>
<path class="ill-crosta" data-crosta d="${crosta(i * 31, 112, 15)}"/>`,
  },
  cheddar: {
    alt: 6,
    svg: (i) => {
      const goccia = i % 2 ? 54 : -46;
      const altra = i % 2 ? -34 : 62;
      return `<path class="ill-cheddar" d="M-102 0H102V5H${goccia + 10}q0 15-7 22-7-7-7-22H${altra + 8}q0 9-5 13-5-4-5-13H-102Z"/>`;
    },
  },
  bacon: {
    alt: 10,
    svg: () => `<path class="ill-bacon" d="M-106 4q14-8 28 0t28 0 28 0 28 0 28 0 28 0 28 0 28 0 28 0v6q-14 6-28 0t-28 0-28 0-28 0-28 0-28 0-28 0-28 0-28 0Z"/>
<path class="ill-linea ill-linea--fine" d="M-96 7q10-3 20 0t20 0 20 0 20 0 20 0 20 0 20 0"/>`,
  },
  uovo: {
    alt: 20,
    svg: () => `<path class="ill-albume" d="M-106 20Q-114 6-82 8Q-62-2-32 6Q0-4 40 4Q92-2 106 12Q114 20 92 20Z"/>
<ellipse class="ill-tuorlo" cx="-4" cy="4" rx="22" ry="15"/>
<path class="ill-riflesso" d="M-16-2q4-6 12-6"/>`,
  },
  'pan-alto': {
    alt: 52,
    svg: () => `<path class="ill-pane" d="M-100 52V36Q-100 0 0 0T100 36V52Z"/>
<path class="ill-linea" d="M-72 22Q-60 10-36 7"/>`,
  },
};

/** Elenco degli strati dal basso verso l'alto per `n` smash (1…4). Gli smash oltre `n` ci sono
 *  comunque, con visibile: false, così il browser li può accendere senza ricostruire l'SVG. */
export function ordine(n) {
  const out = [{ id: 'pan-basso', tipo: 'pan-basso', i: 0 }, { id: 'salsa', tipo: 'salsa', i: 0 }];
  for (let k = 1; k <= MAX_SMASH; k++) {
    out.push({ id: `smash-${k}`, tipo: 'smash', i: k, extra: k > 1 });
    out.push({ id: `cheddar-${k}`, tipo: 'cheddar', i: k, extra: k > 1 });
  }
  out.push({ id: 'bacon', tipo: 'bacon', i: 0 }, { id: 'uovo', tipo: 'uovo', i: 0 }, { id: 'pan-alto', tipo: 'pan-alto', i: 0 });
  return out.map((s) => ({ ...s, visibile: !s.extra || s.i <= n }));
}

/** Posizione y (parte alta) di ogni strato visibile per `n` smash, impilati dalla BASE verso l'alto. */
export function posizioni(n) {
  const out = {};
  let y = BASE;
  for (const s of ordine(n)) {
    if (!s.visibile) continue;
    y -= STRATI[s.tipo].alt;
    out[s.id] = y;
  }
  return out;
}

/** Markup degli strati (dentro l'SVG del palco). Ogni strato ha un <g> esterno posizionato e un
 *  <g data-strato> interno, che GSAP anima senza toccare la posizione. */
export function stratiSvg(n = 2) {
  const pos = posizioni(n);
  return ordine(n)
    .map((s) => {
      const y = pos[s.id] ?? BASE;
      const nascosto = s.visibile ? '' : ' style="display:none"';
      return `<g class="strato-pos" data-pos="${s.id}" transform="translate(${CX} ${y})"${nascosto}><g class="strato" data-strato="${s.id}">${STRATI[s.tipo].svg(s.i)}</g></g>`;
    })
    .join('\n');
}

/** Scena della piastra: palla di carne, spatola, vapore. */
export function piastraSvg() {
  return `<g data-piastra>
  <rect class="ill-piastra" x="14" y="${PIASTRA_Y}" width="292" height="14" rx="4"/>
  <path class="ill-linea ill-linea--chiara" d="M28 ${PIASTRA_Y + 5}H292"/>
  <g class="vapore" aria-hidden="true">
    <path class="ill-linea ill-linea--vapore" data-vapore d="M118 286q-8-12 0-22t0-20"/>
    <path class="ill-linea ill-linea--vapore" data-vapore d="M160 282q-8-12 0-22t0-24"/>
    <path class="ill-linea ill-linea--vapore" data-vapore d="M204 286q8-12 0-22t0-20"/>
  </g>
  <g transform="translate(${CX} ${PIASTRA_Y})"><circle class="ill-carne" data-palla cx="0" cy="-30" r="30"/></g>
  <g transform="translate(${CX} 0)"><g data-spatola><path class="ill-metallo" d="M-76 0H76V8H-76Z"/><path class="ill-linea" d="M0 0V-96"/><rect class="ill-manico" x="-9" y="-150" width="18" height="56" rx="8"/></g></g>
</g>`;
}
