import { SplitText } from 'gsap/SplitText';

/* Apparizioni sobrie: titoli a righe (SplitText) e blocchi che salgono. Solo transform e opacity. */

const BLOCCHI = [
  '.locale__testo > *', '.cornice--isola', '.cornice--legno', '.spine-sez__testa > *', '.spina-scheda', '.menu__testa', '.menu__cat', '.menu__altre',
  '.serate-sez__testa > *:not(h2)', '.serata', '.dove__testa > *:not(h2)', '.mappa', '.scheda-dove', '.confermare__intro', '.confermare__lista li', '.piede__alto', '.piede__link',
].join(',');

export function rivela(gsap, ScrollTrigger) {
  gsap.registerPlugin(SplitText);

  const titoli = [...document.querySelectorAll('h2')].filter((h) => !h.closest('.spilla') && !h.closest('.big'));
  for (const h of titoli) {
    SplitText.create(h, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108, duration: 0.85, ease: 'power4.out', stagger: 0.09,
          scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        }),
    });
  }

  const blocchi = gsap.utils.toArray(BLOCCHI);
  gsap.set(blocchi, { opacity: 0, y: 26 });
  ScrollTrigger.batch(blocchi, {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09, clearProps: 'transform,opacity' }),
  });
}
