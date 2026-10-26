import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/* Il movimento guidato dallo scroll (l'accensione del bancone e l'ingresso dell'hero sono in CSS,
   vedi hero.css). Si carica solo se prefers-reduced-motion non è "reduce".
   Lenis scorre in morbido, collegato al ticker di GSAP; le animazioni toccano solo transform e opacity. */

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export async function avviaMovimento() {
  const lenis = new Lenis({ lerp: 0.11, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // link interni: scroll morbido con l'offset dell'header
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const bersaglio = document.querySelector(a.getAttribute('href'));
    if (!bersaglio) return;
    e.preventDefault();
    lenis.scrollTo(bersaglio, { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--testata')) || 58) - 6, duration: 1.1 });
    history.replaceState(null, '', a.getAttribute('href'));
  });

  const [{ avviaSpillatura }, { avviaFlotta }, { rivela }] = await Promise.all([
    import('../animations/spillatura.js'),
    import('../animations/flotta.js'),
    import('../animations/rivela.js'),
  ]);
  rivela(gsap, ScrollTrigger);
  avviaSpillatura(gsap, ScrollTrigger);
  avviaFlotta(gsap, ScrollTrigger);

  // dopo font e immagini le misure cambiano: ricalcola i trigger
  const ricalcola = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) document.fonts.ready.then(ricalcola);
  window.addEventListener('load', ricalcola, { once: true });
}
