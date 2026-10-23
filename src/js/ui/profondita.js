import { gsap, ScrollTrigger } from '../core/motion.js';

/* PROFONDITÀ — solo desktop con mouse.
   Le schede (metodo, lavori, ragioni, prezzi) entrano dal basso ruotando
   nello spazio, legate allo scroll, e poi seguono il mouse: si inclinano
   verso il puntatore e un riflesso di luce scorre sulla superficie. */
const CARDS = '.passo, .vetrina, .ragione, .pacchetto';
const PERSPECTIVE = 900;
const TILT = 7;

export function initProfondita(scope = document) {
  const cards = gsap.utils.toArray(scope.querySelectorAll(CARDS));
  const cleanups = [];

  for (const card of cards) {
    card.classList.add('tilt');
    const glare = document.createElement('span');
    glare.className = 'tilt__glare';
    glare.setAttribute('aria-hidden', 'true');
    card.append(glare);

    gsap.set(card, { transformPerspective: PERSPECTIVE, transformOrigin: '50% 100%' });
    gsap.from(card, {
      rotationX: 16,
      z: -80,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top 100%', end: 'top 62%', scrub: 0.6 },
    });

    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const lift = gsap.quickTo(card, 'z', { duration: 0.6, ease: 'power3.out' });

    const onMove = (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      rotY((x - 0.5) * 2 * TILT);
      rotX((0.5 - y) * 2 * TILT);
      lift(24);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    };
    const onEnter = () => gsap.set(card, { transformOrigin: '50% 50%' });
    const onLeave = () => {
      rotX(0);
      rotY(0);
      lift(0);
    };
    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      glare.remove();
      card.classList.remove('tilt');
      gsap.set(card, { clearProps: 'transform,transformPerspective,transformOrigin' });
    });
  }

  ScrollTrigger.refresh();
  return () => cleanups.forEach((fn) => fn());
}
