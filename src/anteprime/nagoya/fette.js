import { gsap } from '../../js/core/motion.js';

/* MENU A FETTE — mossa firma n.3.
   Desktop: la sezione si ferma e le categorie scorrono in orizzontale come
   fette sul tagliere; su ognuna passa la lama (il bordo salmone del velo)
   e la scopre con un taglio diagonale. Telefono e movimento ridotto:
   scorrimento orizzontale nativo, a scatti, con il contatore. */
export function initFette() {
  const menu = document.querySelector('[data-menu]');
  const binario = menu.querySelector('[data-binario]');
  const lista = menu.querySelector('[data-fette-lista]');
  const fette = [...menu.querySelectorAll('[data-fetta]')];
  const numero = menu.querySelector('[data-fetta-num]');

  const contatore = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) numero.textContent = String(fette.indexOf(entry.target) + 1);
      }
    },
    { root: lista, threshold: 0.6 },
  );
  fette.forEach((fetta) => contatore.observe(fetta));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 64em) and (prefers-reduced-motion: no-preference)', () => {
    const distanza = () => Math.max(0, binario.scrollWidth - window.innerWidth);
    const corsa = gsap.to(binario, {
      x: () => -distanza(),
      ease: 'none',
      scrollTrigger: {
        trigger: menu,
        start: 'top top',
        end: () => `+=${distanza()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    fette.forEach((fetta) => {
      const velo = fetta.querySelector('[data-velo]');
      const contenuto = fetta.querySelector('[data-fetta-contenuto]');
      // Le fette già in vista quando la sezione si ferma si tagliano mentre arriva.
      const giaInVista = fetta.getBoundingClientRect().left - binario.getBoundingClientRect().left < window.innerWidth * 0.85;
      gsap.fromTo(velo, { xPercent: 0 }, {
        xPercent: 101,
        ease: 'power2.inOut',
        scrollTrigger: giaInVista
          ? { trigger: menu, start: 'top 70%', end: 'top 5%', scrub: 0.6 }
          : { trigger: fetta, containerAnimation: corsa, start: 'left 88%', end: 'left 40%', scrub: 0.6 },
      });
      gsap.fromTo(contenuto, { xPercent: 12 }, {
        xPercent: -4,
        ease: 'none',
        scrollTrigger: giaInVista
          ? { trigger: menu, start: 'top bottom', end: () => `top+=${distanza()} top`, scrub: true }
          : { trigger: fetta, containerAnimation: corsa, start: 'left right', end: 'right left', scrub: true },
      });
    });
  });
}
