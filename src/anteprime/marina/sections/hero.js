import { gsap } from '../../../js/core/motion.js';

/* L'apertura: prima l'acqua, scura, che si schiarisce piano. Poi la linea
   dell'orizzonte si traccia dal centro. Poi il nome sale sopra la linea e
   sotto, in ritardo, compare il suo riflesso. Per ultimi i dettagli. */
export function playAlba(fatto) {
  const root = document.documentElement;
  const acqua = document.querySelector('[data-hero-acqua]');
  const linea = document.querySelector('[data-hero-linea]');
  const nome = document.querySelectorAll('[data-hero-nome] > span');
  const riflesso = document.querySelectorAll('[data-hero-riflesso] > span');
  const entra = document.querySelectorAll('[data-hero-entra]');
  const testata = document.querySelector('[data-testata]');

  const tl = gsap.timeline({
    onComplete() {
      root.classList.remove('is-alba');
      gsap.set([acqua, linea, nome, riflesso, entra, testata], { clearProps: 'all' });
      fatto?.();
    },
  });
  tl.fromTo(acqua, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 3.2, ease: 'power2.out' })
    .fromTo(linea, { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: 'expo.inOut' }, 0.5)
    .fromTo(nome, { yPercent: 105 }, { yPercent: 0, duration: 1.9, stagger: 0.14, ease: 'expo.out' }, 1.35)
    .fromTo(riflesso, { opacity: 0 }, { opacity: 1, duration: 2.4, stagger: 0.14, ease: 'power2.out' }, 1.9)
    .fromTo(entra, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.08, ease: 'power3.out' }, 2.2)
    .fromTo(testata, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 2.3);
}

/* Scorrendo, l'acqua resta indietro e il nome affonda appena. */
export function initHeroScroll() {
  const hero = document.querySelector('[data-hero]');
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('[data-hero-acqua]', { yPercent: 16, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__titolo', { yPercent: 22, ease: 'none', scrollTrigger: st });
  gsap.to('[data-hero-riflesso]', { yPercent: -10, opacity: 0, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__piede, .hero__luogo, .hero__coordinate', { opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '40% top' } });
}
