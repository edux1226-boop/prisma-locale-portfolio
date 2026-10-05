import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

/* "Il ... borgo": l'immagine parte come una finestra stretta tra due parole
   e si apre fino a riempire lo schermo, mentre le parole si allontanano. */
function initApertura(mm) {
  const apertura = document.querySelector('[data-apertura]');
  const finestra = apertura.querySelector('[data-apertura-finestra]');
  const img = apertura.querySelector('[data-apertura-img]');
  const sx = apertura.querySelector('[data-apertura-parola="sx"]');
  const dx = apertura.querySelector('[data-apertura-parola="dx"]');
  const didascalia = apertura.querySelector('[data-apertura-didascalia]');

  const crea = (iniziale) => {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: apertura, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    })
      .fromTo(finestra, { clipPath: iniziale }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62, ease: 'power2.inOut' }, 0.08)
      .fromTo(img, { scale: 1.32 }, { scale: 1, duration: 0.8 }, 0.08)
      .to(sx, { xPercent: -70, opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.1)
      .to(dx, { xPercent: 70, opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.1)
      .fromTo(didascalia, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.18 }, 0.74)
      .to({}, { duration: 0.1 });
  };
  mm.add('(min-width: 48em)', () => crea('inset(18% 36.5% 18% 36.5%)'));
  mm.add('(max-width: 47.99em)', () => crea('inset(24% 22% 24% 22%)'));
}

/* Gli spazi scorrono di lato su desktop: un binario pinnato. */
function initBinario(mm) {
  const spazi = document.querySelector('[data-spazi]');
  const binario = spazi.querySelector('[data-spazi-binario]');

  mm.add('(min-width: 64em)', () => {
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
  initApertura(mm);
  initBinario(mm);
}
