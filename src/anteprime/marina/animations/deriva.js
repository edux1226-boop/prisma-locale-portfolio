import { gsap, MQ } from '../../../js/core/motion.js';

/* Deriva: ogni provino della gallery scorre a una velocità sua, come
   oggetti che galleggiano a distanze diverse. Solo su schermi larghi. */
export function initDeriva() {
  if (!window.matchMedia(MQ.desktop).matches) return;
  for (const el of document.querySelectorAll('[data-deriva]')) {
    const v = Number(el.dataset.deriva) || 0;
    gsap.fromTo(el, { yPercent: v * 100 }, {
      yPercent: v * -100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}
