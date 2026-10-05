import { gsap } from '../../../js/core/motion.js';

/* I tre piani scorrono a velocità diverse: il cielo quasi fermo, il colle a
   metà, il primo piano più veloce. Con il mouse si spostano di pochi pixel. */
export function initHero({ fine }) {
  const hero = document.querySelector('[data-hero]');
  const piani = gsap.utils.toArray('[data-piano]');
  const testo = hero.querySelector('[data-hero-testo]');

  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to(piani[0], { yPercent: 6, ease: 'none' }, 0)
    .to(piani[1], { yPercent: 13, ease: 'none' }, 0)
    .to(piani[2], { yPercent: 24, scale: 1.06, ease: 'none' }, 0)
    .to(testo, { yPercent: -30, ease: 'none' }, 0)
    .to(testo, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 0);

  if (!fine) return;
  const sposta = piani.map((piano) => ({
    x: gsap.quickTo(piano, 'x', { duration: 1.6, ease: 'power3.out' }),
    y: gsap.quickTo(piano, 'y', { duration: 1.6, ease: 'power3.out' }),
  }));
  const ampiezza = [6, 14, 26];
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    sposta.forEach((s, i) => { s.x(-nx * ampiezza[i]); s.y(-ny * ampiezza[i] * 0.4); });
  });
}
