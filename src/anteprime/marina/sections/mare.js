import { gsap, MQ } from '../../../js/core/motion.js';

/* Il mare, in sequenza: il titolo resta fermo mentre la lastra verticale
   cresce fino a coprire lo schermo (la notte, il mercato); poi la marea
   porta l'alba dal basso. Pinnata solo su schermi larghi. */
export function initMare(mm) {
  mm.add(MQ.desktop, () => {
    const palco = document.querySelector('[data-mare-palco]');
    const titolo = palco.querySelector('[data-mare-titolo]');
    const [q1, q2] = palco.querySelectorAll('[data-mare-quadro]');
    const conto = palco.querySelector('[data-mare-conto]');
    const f1 = q1.querySelector('.mare__frase');
    const f2 = q2.querySelector('.mare__frase');

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: palco,
        start: 'top top',
        end: '+=320%',
        pin: true,
        scrub: 1,
        onUpdate(self) { conto.textContent = self.progress > 0.62 ? '02' : '01'; },
      },
    });
    tl.to(q1, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo(q1.querySelector('img'), { scale: 1.45 }, { scale: 1.04, duration: 1.4, ease: 'power1.out' }, 0)
      .to(titolo, { opacity: 0, yPercent: -18, duration: 0.45 }, 1.05)
      .fromTo(f1, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 }, 1.3)
      .to(f1, { opacity: 0, y: -20, duration: 0.35 }, 2.15)
      .to(q2, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 2.1)
      .fromTo(q2.querySelector('img'), { scale: 1.25, yPercent: 6 }, { scale: 1, yPercent: 0, duration: 1.3 }, 2.1)
      .fromTo(f2, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45 }, 2.85)
      .to({}, { duration: 0.5 });

    return () => gsap.set([q1, q2, titolo, f1, f2], { clearProps: 'all' });
  });
}
