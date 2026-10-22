import { gsap } from '../../../js/core/motion.js';

/* Bib Gourmand: una firma. Le due parole arrivano dai lati e si fermano
   a distanza; sotto, un filo si traccia. Niente altro. */
export function initBib() {
  const titolo = document.querySelector('[data-bib]');
  const [prima, seconda] = titolo.querySelectorAll('[data-bib-parola]');
  const filo = document.querySelector('[data-bib-filo]');
  gsap.timeline({
    scrollTrigger: { trigger: titolo, start: 'top 80%', end: 'center 45%', scrub: 1.2 },
    defaults: { ease: 'none' },
  })
    .fromTo(prima, { xPercent: -40, opacity: 0 }, { xPercent: 0, opacity: 1 }, 0)
    .fromTo(seconda, { xPercent: 22, opacity: 0 }, { xPercent: 0, opacity: 1 }, 0)
    .fromTo(filo, { scaleX: 0 }, { scaleX: 1 }, 0.3);
}
