import { gsap } from '/src/js/core/motion.js';

/* Le 48 ore: un panetto che cresce e si riempie d'aria mentre scorre il
   tempo, poi passa in forno e prende colore. Tutto da un solo numero, p. */
const CX = 200;
const BASE = 250;
const BOLLE = 46;

function generatore(seme) {
  let s = seme;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const caso = generatore(48);
const fasi = [caso() * 6.28, caso() * 6.28, caso() * 6.28];
const bolle = Array.from({ length: BOLLE }, () => {
  const a = caso() * Math.PI * 2;
  const d = Math.sqrt(caso());
  return { u: Math.cos(a) * d, v: Math.sin(a) * d, r: 3 + caso() * 11, inizio: caso() * 0.75 };
});

const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const morbido = (t) => t * t * (3 - 2 * t);

function misure(t) {
  const rx = 118 + 42 * t;
  const ry = 52 + 58 * t;
  return { rx, ry, cy: BASE - ry * 0.42 };
}

/* La sagoma: un'ellisse schiacciata sotto, con il bordo appena mosso,
   chiusa con curve di Catmull-Rom. */
function sagoma(t) {
  const { rx, ry, cy } = misure(t);
  const n = 40;
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ondula = 1 + 0.035 * Math.sin(3 * a + fasi[0]) + 0.025 * Math.sin(5 * a + fasi[1]) + 0.02 * Math.sin(7 * a + fasi[2] + t * 2);
    const s = Math.sin(a);
    const y = s > 0 ? cy + Math.min(s * ry * 0.5, ry * 0.42) : cy + s * ry * ondula;
    p.push([CX + Math.cos(a) * rx * ondula, y]);
  }
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

export function initOre({ movimento }) {
  const sezione = document.querySelector('[data-ore]');
  const svg = sezione.querySelector('[data-impasto]');
  const forma = svg.querySelector('[data-impasto-forma]');
  const cotto = svg.querySelector('[data-impasto-cotto]');
  const clip = svg.querySelector('[data-impasto-clip]');
  const ombra = svg.querySelector('[data-impasto-ombra]');
  const gruppo = svg.querySelector('[data-impasto-bolle]');
  const cifra = sezione.querySelector('[data-ore-cifra]');
  const passi = [...sezione.querySelectorAll('[data-passo]')];

  const ns = 'http://www.w3.org/2000/svg';
  const cerchi = bolle.map(() => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('class', 'impasto__bolla');
    gruppo.append(c);
    return c;
  });

  let ultimo = -1;
  const aggiorna = (p) => {
    const t = morbido(limita(p / 0.68));
    const forno = limita((p - 0.8) / 0.16);
    const { rx, ry, cy } = misure(t);
    const d = sagoma(t);
    forma.setAttribute('d', d);
    cotto.setAttribute('d', d);
    clip.setAttribute('d', d);
    cotto.style.opacity = forno;
    ombra.setAttribute('rx', (rx * 1.02).toFixed(1));
    bolle.forEach((b, i) => {
      const k = morbido(limita((t - b.inizio) / 0.3));
      const c = cerchi[i];
      c.setAttribute('cx', (CX + b.u * rx * 0.82).toFixed(1));
      c.setAttribute('cy', (cy + Math.min(b.v * ry * 0.85, ry * 0.3)).toFixed(1));
      c.setAttribute('r', (b.r * k * (0.7 + t * 0.5)).toFixed(2));
      c.style.opacity = 1 - forno * 0.4;
    });
    const ore = Math.round(limita((p - 0.08) / 0.55) * 48);
    cifra.textContent = String(ore).padStart(2, '0');
    const attivo = p < 0.2 ? 0 : p < 0.62 ? 1 : p < 0.8 ? 2 : 3;
    if (attivo !== ultimo) {
      passi.forEach((passo, i) => passo.classList.toggle('is-attivo', i === attivo));
      ultimo = attivo;
    }
  };

  if (!movimento) {
    aggiorna(1);
    return;
  }

  aggiorna(0);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 64em) and (min-height: 40em)', () => {
    sezione.classList.add('is-pinnato');
    // un proxy morbido: lo scrub smussa il movimento della rotella
    const stato = { p: 0 };
    const tween = gsap.to(stato, {
      p: 1,
      ease: 'none',
      onUpdate: () => aggiorna(stato.p),
      scrollTrigger: { trigger: sezione, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      sezione.classList.remove('is-pinnato');
    };
  });
  mm.add('(max-width: 63.99em), (max-height: 39.99em)', () => {
    // senza pin: le 48 ore passano da sole quando l'impasto entra in vista
    const stato = { p: 0 };
    aggiorna(0);
    const tween = gsap.to(stato, {
      p: 1,
      duration: 4.2,
      ease: 'power1.inOut',
      onUpdate: () => aggiorna(stato.p),
      scrollTrigger: { trigger: svg, start: 'top 75%', once: true },
    });
    return () => tween.kill();
  });
}
