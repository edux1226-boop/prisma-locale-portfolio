import { gsap } from '../core/motion.js';

/* Il filo delle automazioni: quando entra nello schermo la linea si disegna
   da sinistra e i tre nodi si accendono uno dopo l'altro. Una volta sola,
   solo transform e opacità. Con movimento ridotto non viene chiamato e il
   filo resta disegnato (stato del CSS). */
export function initFilo() {
  const filo = document.querySelector('[data-filo]');
  if (!filo) return;
  const linea = filo.querySelector('[data-filo-linea]');
  const nodi = filo.querySelectorAll('[data-filo-nodo]');

  gsap.timeline({ scrollTrigger: { trigger: filo, start: 'top 85%', once: true } })
    .fromTo(linea, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' })
    .fromTo(nodi, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.35 }, 0.25);
}
