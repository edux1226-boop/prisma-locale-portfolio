import { gsap, ScrollTrigger, SplitText } from '../core/motion.js';

/* Titoli: maschera riga per riga.
   Lo split costa layout, quindi non si fa tutto al caricamento: ogni titolo
   viene diviso solo quando si avvicina allo schermo. SplitText poi rifà lo
   split se cambiano larghezza o caratteri (autoSplit) e conserva
   l'avanzamento dell'animazione restituita da onSplit. */
function splitTitle(title) {
  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit(self) {
      gsap.set(title, { opacity: 1 });
      return gsap.from(self.lines, {
        yPercent: 112,
        duration: 1.25,
        stagger: 0.09,
        ease: 'expo.out',
        scrollTrigger: { trigger: title, start: 'top 88%', once: true },
      });
    },
  });
}

export function initTitleReveals(scope = document, context = null) {
  const titles = [...scope.querySelectorAll('[data-split]')];
  if (!titles.length) return () => {};
  gsap.set(titles, { opacity: 0 });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // Dentro il contesto di matchMedia, così viene smontato con il resto.
        if (context) context.add(() => splitTitle(entry.target));
        else splitTitle(entry.target);
      }
    },
    { rootMargin: '0px 0px 60% 0px' },
  );
  titles.forEach((title) => observer.observe(title));
  return () => observer.disconnect();
}

/* Tutto il resto entra in silenzio: solo opacità e un piccolo spostamento.
   Si usa l'opacità e non la visibilità, così il contenuto resta leggibile
   dai lettori di schermo anche prima di essere raggiunto. */
export function initFades(scope = document) {
  const items = gsap.utils.toArray(scope.querySelectorAll('[data-fade]'));
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: 30 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.15, stagger: 0.08, overwrite: true }),
  });
}

/* Senza movimento: nessuno split, nessuno stato nascosto. */
export function showEverything() {
  gsap.set('[data-split], [data-fade], [data-intro]', { clearProps: 'opacity,transform,visibility' });
}
