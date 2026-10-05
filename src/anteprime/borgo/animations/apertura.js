import { gsap } from '../../../js/core/motion.js';

/* L'apertura: il nome compare nel buio, un filo d'ottone si tende, il
   sipario si apre sul colle e i tre piani si assestano a velocità diverse.
   Circa tre secondi; un gesto qualsiasi la accelera. */
export function playApertura(fine) {
  const sipario = document.querySelector('[data-sipario]');
  const meta = sipario.querySelectorAll('[data-sipario-meta]');
  const nome = sipario.querySelectorAll('[data-sipario-nome] span');
  const filo = sipario.querySelector('[data-sipario-filo]');
  const piani = gsap.utils.toArray('[data-piano]');
  const righe = gsap.utils.toArray('[data-hero-riga] > span');
  const entra = gsap.utils.toArray('[data-hero-entra], [data-testata]');

  gsap.set(righe, { yPercent: 110 });
  gsap.set(entra, { opacity: 0, y: 16 });
  gsap.set(piani, { scale: (i) => 1.12 + i * 0.06, yPercent: (i) => i * 2.5 });

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete() {
      sipario.remove();
      document.documentElement.classList.remove('is-apertura');
      gsap.set([...righe, ...entra], { clearProps: 'transform,opacity' });
      fine();
    },
  });
  tl.from(nome, { opacity: 0, yPercent: 40, duration: 1.1, stagger: 0.12 }, 0.1)
    .to(filo, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0.2)
    .to([nome, filo], { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.1)
    .to(meta[0], { yPercent: -101, duration: 1.5, ease: 'expo.inOut' }, 1.3)
    .to(meta[1], { yPercent: 101, duration: 1.5, ease: 'expo.inOut' }, 1.3)
    .to(piani, { scale: 1, yPercent: 0, duration: 2.6, stagger: 0.12 }, 1.45)
    .to(righe, { yPercent: 0, duration: 1.5, stagger: 0.12 }, 1.85)
    .to(entra, { opacity: 1, y: 0, duration: 1.3, stagger: 0.08 }, 2.15);

  const accelera = () => {
    tl.timeScale(3.5);
    for (const ev of ['wheel', 'keydown', 'pointerdown', 'touchstart']) window.removeEventListener(ev, accelera);
  };
  for (const ev of ['wheel', 'keydown', 'pointerdown', 'touchstart']) window.addEventListener(ev, accelera, { passive: true });
}
