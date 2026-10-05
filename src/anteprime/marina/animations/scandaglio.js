import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

/* Lo scandaglio: un piombo scende lungo la sagola mentre si legge, e accanto
   compare il nome della sezione. Sulle sezioni scure diventa chiaro. */
export function initScandaglio() {
  const nav = document.querySelector('[data-scandaglio]');
  if (!nav || getComputedStyle(nav).display === 'none') return;
  const piombo = nav.querySelector('[data-scandaglio-piombo]');
  const voce = nav.querySelector('[data-scandaglio-voce]');
  const sagola = nav.querySelector('.scandaglio__sagola');

  const muovi = gsap.quickSetter(piombo, 'y', 'px');
  ScrollTrigger.create({
    trigger: '#intro',
    start: 'top bottom',
    endTrigger: 'body',
    end: 'bottom bottom',
    onUpdate(self) { muovi(self.progress * (sagola.offsetHeight - 12)); },
    onToggle(self) { nav.classList.toggle('is-visibile', self.isActive); },
  });

  for (const sezione of document.querySelectorAll('[data-sezione]')) {
    const scura = ['mare', 'galleria', 'prenota'].some((c) => sezione.classList.contains(c));
    ScrollTrigger.create({
      trigger: sezione,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle(self) {
        if (!self.isActive) return;
        voce.textContent = sezione.dataset.sezione;
        nav.classList.toggle('is-chiaro', scura);
      },
    });
  }
}
