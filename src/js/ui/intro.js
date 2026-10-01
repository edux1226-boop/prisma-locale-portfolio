import { gsap } from '../core/motion.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Aspetta i caratteri (con un tetto), così le righe si rivelano già nel
   loro carattere definitivo e non saltano a metà animazione. */
export async function fontsReady(maxWait = 900) {
  if (!document.fonts) return;
  await Promise.race([document.fonts.ready, wait(maxWait)]);
}

/* L'unico caricamento orchestrato del sito: header, righe del titolo,
   testo, e infine la parola "colore." che prende lo spettro. */
export function playIntro() {
  const root = document.documentElement;
  const hero = document.querySelector('[data-hero]');
  const lines = hero ? hero.querySelectorAll('.line__in') : [];
  const headerBits = document.querySelectorAll('.site-header [data-intro]');
  const heroBits = hero ? hero.querySelectorAll('[data-intro]') : [];
  const base = hero?.querySelector('.colore__base');
  const spectrum = hero?.querySelector('.colore__spettro');
  const still = hero?.querySelector('[data-hero-still]');

  // y: 0 azzera la translateY del CSS di pre-caricamento, che GSAP
  // altrimenti leggerebbe e sommerebbe al suo yPercent.
  gsap.set(lines, { y: 0, yPercent: 105 });
  gsap.set([...headerBits, ...heroBits], { opacity: 0, y: 16 });
  if (base) gsap.set(base, { opacity: 1 });
  if (spectrum) gsap.set(spectrum, { opacity: 0 });
  root.classList.remove('is-loading');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (still) tl.fromTo(still, { scale: 1.07 }, { scale: 1, duration: 2.6 }, 0);
  tl.to(headerBits, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.05)
    .to(lines, { yPercent: 0, duration: 1.35, stagger: 0.11 }, 0.12)
    .to(heroBits, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.6);
  if (base && spectrum) {
    tl.to(base, { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, 1.05)
      .to(spectrum, { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 1.05);
  }
  return tl;
}

/* Movimento ridotto o ritorno da un cambio di preferenze: stato finale. */
export function skipIntro() {
  const root = document.documentElement;
  root.classList.remove('is-loading');
  gsap.set('.line__in, [data-intro], .colore__base, .colore__spettro, [data-hero-still]', {
    clearProps: 'opacity,transform,visibility',
  });
}
