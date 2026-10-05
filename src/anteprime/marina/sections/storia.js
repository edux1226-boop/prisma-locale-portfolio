import { gsap, ScrollTrigger, MQ } from '../../../js/core/motion.js';

/* La storia: la lastra resta ferma e si apre mentre si legge; la rotta si
   traccia lungo il testo e ogni punto si accende quando la si raggiunge. */
export function initStoria(mm) {
  const sezione = document.querySelector('[data-storia]');
  const foto = sezione.querySelector('[data-storia-foto]');
  const img = foto.querySelector('img');
  const traccia = sezione.querySelector('[data-rotta-traccia]');
  const rotta = sezione.querySelector('[data-rotta]');

  mm.add(MQ.desktop, () => {
    gsap.timeline({
      scrollTrigger: { trigger: sezione, start: 'top 70%', end: 'bottom bottom', scrub: true },
      defaults: { ease: 'none' },
    })
      .fromTo(foto, { clipPath: 'inset(14% 22% 22% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55 })
      .fromTo(img, { scale: 1.3, yPercent: -4 }, { scale: 1.02, yPercent: 4, duration: 1 }, 0);
  });

  gsap.fromTo(traccia, { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: rotta, start: 'top 65%', end: 'bottom 65%', scrub: true },
  });

  for (const punto of rotta.querySelectorAll('[data-rotta-punto]')) {
    ScrollTrigger.create({
      trigger: punto,
      start: 'top 65%',
      onEnter: () => punto.classList.add('is-raggiunto'),
      onLeaveBack: () => punto.classList.remove('is-raggiunto'),
    });
    gsap.from(punto.children, {
      opacity: 0,
      y: 26,
      duration: 1.4,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: punto, start: 'top 85%', once: true },
    });
  }
}
