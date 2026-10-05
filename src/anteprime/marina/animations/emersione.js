import { gsap, ScrollTrigger, SplitText } from '../../../js/core/motion.js';

/* I titoli emergono riga per riga, come da sotto il pelo dell'acqua:
   lenti, senza rimbalzi. I testi piccoli salgono appena e si schiariscono.
   Le righe si dividono solo quando il titolo si avvicina allo schermo. */
export function initEmersione() {
  for (const el of document.querySelectorAll('[data-righe]')) {
    gsap.set(el, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 96%',
      once: true,
      onEnter() {
        const split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'riga',
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 112,
              duration: 1.7,
              stagger: 0.13,
              ease: 'expo.out',
              delay: 0.05,
            });
          },
        });
        el.dataset.diviso = split ? '1' : '';
      },
    });
  }

  for (const el of document.querySelectorAll('[data-sfuma]')) {
    gsap.from(el, {
      autoAlpha: 0,
      y: 22,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }
}
