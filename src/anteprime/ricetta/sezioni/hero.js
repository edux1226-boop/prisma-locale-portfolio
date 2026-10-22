import { gsap } from '../../../js/core/motion.js';
import { preparaPala, pixelPer, quandoCambiaLarghezza } from '../disegno.js';

/* La pala esce dal forno: scivola da sinistra mentre il titolo sale.
   Scorrendo, si allontana e ruota appena, come portata via verso il tavolo. */
export async function initHero({ movimento }) {
  const figura = document.querySelector('[data-hero-pala]');
  const muovi = figura.querySelector('[data-hero-muovi]');
  const tela = figura.querySelector('[data-hero-tela]');
  const disegna = () => preparaPala(tela, {
    larghezza: pixelPer(figura.getBoundingClientRect().width, window.innerWidth < 1024 ? 1800 : 2600),
    conTavola: true,
    seme: 7,
  });

  if (!movimento) {
    await disegna();
    quandoCambiaLarghezza(disegna);
    return;
  }

  const righe = gsap.utils.toArray('[data-hero-riga] > span');
  const entra = gsap.utils.toArray('[data-hero-entra]');
  gsap.set(righe, { y: 0, yPercent: 110 });
  gsap.set(entra, { opacity: 0, y: 16 });
  gsap.set(muovi, { opacity: 0 });
  document.documentElement.classList.remove('is-intro');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to(righe, { y: 0, yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.1)
    .to(entra, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, clearProps: 'transform' }, 0.45);

  // la pala entra appena è disegnata, ma non prima che il titolo sia partito
  const inizio = performance.now();
  try {
    await disegna();
  } catch {
    /* tela vuota: la pagina resta comunque usabile */
  }
  quandoCambiaLarghezza(disegna);
  const passati = (performance.now() - inizio) / 1000;
  gsap.fromTo(muovi,
    { opacity: 0, xPercent: -55, rotation: 3 },
    { opacity: 1, xPercent: 0, rotation: 0, duration: 2, ease: 'expo.out', delay: Math.max(0, 0.35 - passati) });

  gsap.to(tela, {
    yPercent: 10,
    xPercent: 6,
    rotation: 3,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
  });

  // vapore e brace si fermano quando l'hero esce dallo schermo
  const hero = document.querySelector('[data-hero]');
  new IntersectionObserver(([voce]) => hero.classList.toggle('is-fuori', !voce.isIntersecting)).observe(hero);
}
