import { gsap } from '../../../js/core/motion.js';

/* Ogni elemento con data-velocita scorre un po' più veloce o più lento della
   pagina: un decimo di differenza basta a dare profondità. */
export function initParallasse(scope = document) {
  for (const nodo of scope.querySelectorAll('[data-velocita]')) {
    const v = Number(nodo.dataset.velocita) || 0;
    gsap.fromTo(nodo, { yPercent: v * -100 }, {
      yPercent: v * 100,
      ease: 'none',
      scrollTrigger: { trigger: nodo, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}
