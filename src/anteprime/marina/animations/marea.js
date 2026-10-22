import { gsap } from '../../../js/core/motion.js';

/* Le immagini arrivano come la marea: il livello sale dal basso e la foto,
   dentro, si posa piano dalla sua scala più ampia. */
export function initMarea() {
  for (const figura of document.querySelectorAll('[data-marea]')) {
    const img = figura.querySelector('img');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: figura, start: 'top 88%', once: true },
      defaults: { duration: 1.9, ease: 'expo.inOut' },
    });
    tl.fromTo(figura, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
      .fromTo(img, { scale: 1.28 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0.15);
  }
}
