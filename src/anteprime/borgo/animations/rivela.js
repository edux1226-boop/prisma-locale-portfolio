import { gsap, ScrollTrigger, SplitText } from '../../../js/core/motion.js';

/* Il vocabolario del movimento, uguale in tutta la pagina:
   - [data-righe]   il testo sale riga per riga da dietro una maschera;
   - [data-sfuma]   opacità e pochi pixel, niente di più;
   - [data-maschera] l'immagine si scopre dal basso e si assesta.
   Tutto lento, tutto una volta sola. */

const LENTO = 1.5;

function dividi(nodo) {
  SplitText.create(nodo, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'riga',
    aria: 'none', // il testo resta intero nel DOM: niente aria-label sui generici
    autoSplit: true,
    onSplit(self) {
      gsap.set(nodo, { opacity: 1 });
      return gsap.from(self.lines, {
        yPercent: 115,
        duration: LENTO,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: nodo, start: 'top 88%', once: true },
      });
    },
  });
}

/* Lo split costa layout: ogni testo si divide solo quando si avvicina. */
function initRighe() {
  const nodi = [...document.querySelectorAll('[data-righe]')];
  gsap.set(nodi, { opacity: 0 });
  const io = new IntersectionObserver((voci) => {
    for (const voce of voci) {
      if (!voce.isIntersecting) continue;
      io.unobserve(voce.target);
      dividi(voce.target);
    }
  }, { rootMargin: '0px 0px 50% 0px' });
  nodi.forEach((n) => io.observe(n));
}

function initSfumature() {
  const nodi = gsap.utils.toArray('[data-sfuma]');
  gsap.set(nodi, { opacity: 0, y: 24 });
  ScrollTrigger.batch(nodi, {
    start: 'top 90%',
    once: true,
    onEnter: (gruppo) => gsap.to(gruppo, { opacity: 1, y: 0, duration: 1.3, stagger: 0.1, overwrite: true }),
  });
}

function initMaschere() {
  for (const cornice of document.querySelectorAll('[data-maschera]')) {
    const img = cornice.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: cornice, start: 'top 84%', once: true } })
      .fromTo(cornice, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.2);
  }
}

export function initRivelazioni() {
  initRighe();
  initSfumature();
  initMaschere();
}
