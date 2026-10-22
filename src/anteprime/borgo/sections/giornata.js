import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

/* I momenti sono pannelli sticky: il successivo sale sopra il precedente,
   che intanto si scurisce e si avvicina, come una dissolvenza al nero.
   Una sola timeline per tutto il contenitore: ogni passaggio dura quanto un
   pannello, e dall'avanzamento si ricava il momento in scena. */
export function initGiornata() {
  const contenitore = document.querySelector('.momenti');
  const momenti = gsap.utils.toArray('[data-momento]');
  const ore = [...document.querySelectorAll('[data-orologio] li')];
  const orologio = document.querySelector('[data-orologio]');
  const n = momenti.length;

  const parti = momenti.map((momento) => {
    const ombra = document.createElement('div');
    ombra.className = 'momento__ombra';
    momento.append(ombra);
    const testo = momento.querySelector('.momento__testo').children;
    gsap.set(testo, { opacity: 0, y: 26 });
    return { img: momento.querySelector('[data-momento-img]'), testo, ombra };
  });

  // il testo di ogni momento entra una volta sola, quando il pannello arriva
  const entrati = new Set();
  const inScena = (i) => {
    ore.forEach((ora, j) => ora.classList.toggle('is-attivo', j === i));
    if (entrati.has(i)) return;
    entrati.add(i);
    gsap.to(parti[i].testo, { opacity: 1, y: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' });
  };

  const tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 } });
  for (let i = 1; i < n; i++) {
    tl.fromTo(parti[i].img, { scale: 1.16 }, { scale: 1 }, i - 1)
      .fromTo(parti[i - 1].ombra, { opacity: 0 }, { opacity: 0.75 }, i - 1)
      .fromTo(parti[i - 1].img, { scale: 1 }, { scale: 1.08, immediateRender: false }, i - 1);
  }
  ScrollTrigger.create({
    trigger: contenitore,
    start: 'top top',
    end: 'bottom bottom',
    animation: tl,
    scrub: true,
    onUpdate: (self) => inScena(Math.round(self.progress * (n - 1))),
  });

  // il primo momento entra prima che i pannelli comincino a sovrapporsi
  ScrollTrigger.create({
    trigger: contenitore,
    start: 'top 40%',
    end: 'bottom bottom',
    onEnter: () => inScena(0),
    onToggle: (self) => orologio?.classList.toggle('is-visibile', self.isActive),
  });
}
