import { gsap, ScrollTrigger, MQ } from '../../../js/core/motion.js';

/* "Il ... borgo": l'immagine parte come una finestra stretta tra due parole
   e si apre fino a riempire lo schermo, mentre le parole si allontanano.
   Le misure della finestra sono in CSS: qui si anima solo --apri. */
function initApertura() {
  const apertura = document.querySelector('[data-apertura]');
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: apertura, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  })
    .to(apertura, { '--apri': 1, duration: 0.62, ease: 'power2.inOut' }, 0.08)
    .to('[data-apertura-img]', { scale: 1, duration: 0.8 }, 0.08)
    .to('[data-apertura-parola="sx"]', { xPercent: -70, opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.1)
    .to('[data-apertura-parola="dx"]', { xPercent: 70, opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.1)
    .fromTo('[data-apertura-didascalia]', { y: 30 }, { opacity: 1, y: 0, duration: 0.18 }, 0.74)
    .to({}, { duration: 0.1 });
}

/* Gli spazi scorrono di lato su desktop: un binario pinnato. */
function initBinario(mm) {
  const spazi = document.querySelector('[data-spazi]');
  const binario = spazi.querySelector('[data-spazi-binario]');

  mm.add(MQ.desktop, () => {
    spazi.classList.add('is-orizzontale');
    const distanza = () => binario.scrollWidth - window.innerWidth;
    const misura = () => spazi.style.setProperty('--binario-h', `${distanza() + window.innerHeight}px`);
    misura();
    ScrollTrigger.addEventListener('refreshInit', misura);

    const tween = gsap.to(binario, {
      x: () => -distanza(),
      ease: 'none',
      scrollTrigger: { trigger: spazi, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true },
    });
    // dentro il binario le immagini scorrono un poco contro il movimento
    for (const img of spazi.querySelectorAll('.spazio__foto img')) {
      gsap.fromTo(img, { xPercent: -6, scale: 1.12 }, {
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img.closest('.spazio'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
      });
    }
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', misura);
      spazi.classList.remove('is-orizzontale');
      spazi.style.removeProperty('--binario-h');
    };
  });
}

export function initLocation(mm) {
  initApertura();
  initBinario(mm);
}
