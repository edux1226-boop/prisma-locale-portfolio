import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

/* I momenti sono pannelli sticky: il successivo sale sopra il precedente,
   che intanto si scurisce e si avvicina, come una dissolvenza al nero.
   Gli elementi sticky non si misurano bene da soli: le posizioni si
   calcolano dal contenitore, dove ogni pannello occupa un'altezza intera. */
export function initGiornata() {
  const contenitore = document.querySelector('.momenti');
  const momenti = gsap.utils.toArray('[data-momento]');
  const orologio = document.querySelector('[data-orologio]');
  const ore = orologio ? [...orologio.children] : [];
  const h = () => momenti[0].offsetHeight;
  const da = (n, dove) => () => `top+=${n * h()} ${dove}`;

  momenti.forEach((momento, i) => {
    const img = momento.querySelector('[data-momento-img]');
    const testo = momento.querySelector('.momento__testo');
    const ombra = document.createElement('div');
    ombra.className = 'momento__ombra';
    momento.append(ombra);

    // entrando, l'immagine si assesta e il testo arriva per ultimo
    if (i > 0) {
      gsap.fromTo(img, { scale: 1.16 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: contenitore, start: da(i, 'bottom'), end: da(i, 'top'), scrub: true, invalidateOnRefresh: true },
      });
    }
    gsap.from(testo.children, {
      opacity: 0, y: 26, duration: 1.4, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: contenitore, start: da(i, '40%'), once: true, invalidateOnRefresh: true },
    });

    if (i < momenti.length - 1) {
      gsap.timeline({ scrollTrigger: { trigger: contenitore, start: da(i + 1, 'bottom'), end: da(i + 1, 'top'), scrub: true, invalidateOnRefresh: true } })
        .to(ombra, { opacity: 0.75, ease: 'none' }, 0)
        .to(img, { scale: 1.08, ease: 'none', immediateRender: false }, 0);
    }

    ScrollTrigger.create({
      trigger: contenitore,
      start: da(i, 'center'),
      end: da(i + 1, 'center'),
      invalidateOnRefresh: true,
      onToggle(self) {
        if (self.isActive) ore.forEach((ora, j) => ora.classList.toggle('is-attivo', j === i));
      },
    });
  });

  if (orologio) {
    ScrollTrigger.create({
      trigger: contenitore,
      start: 'top center',
      end: 'bottom bottom',
      onToggle: (self) => orologio.classList.toggle('is-visibile', self.isActive),
    });
  }
}
