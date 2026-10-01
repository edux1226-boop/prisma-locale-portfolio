import { gsap, ScrollTrigger } from './core/motion.js';

/* Regia dell'hero: decide tra prisma 3D e immagine statica, collega lo
   scroll alla scena e gestisce i casi in cui il 3D non può restare
   (contesto WebGL perso, macchina troppo lenta). */
export function initHero({ use3D }) {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return () => {};
  const host = hero.querySelector('[data-prism-host]');
  const still = hero.querySelector('[data-hero-still]');

  let prism = null;
  let disposed = false;
  let progress = 0;

  const scroll = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      progress = self.progress;
      prism?.setScroll(progress);
    },
  });
  const parallax = gsap.to(still, {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  const showStill = () => {
    if (disposed) return;
    hero.classList.add('hero--still');
    gsap.to(host, { opacity: 0, duration: 0.6 });
  };

  if (use3D) {
    const mount = (createPrism) => {
      prism = createPrism(host, {
        onReady() {
          if (disposed) return;
          prism.setScroll(progress);
          gsap.to(host, { opacity: 1, duration: 1.6, ease: 'power2.out' });
          prism.intro();
        },
        onFail() {
          prism?.dispose();
          prism = null;
          showStill();
        },
        onLost() {
          showStill();
        },
        onRestored() {
          prism?.dispose();
          prism = null;
          if (disposed) return;
          hero.classList.remove('hero--still');
          mount(createPrism);
        },
      });
    };

    import('./prism/prism.js')
      .then(({ createPrism }) => {
        if (!disposed) mount(createPrism);
      })
      .catch(showStill);
  }

  if (import.meta.hot) import.meta.hot.dispose(() => prism?.dispose());

  return () => {
    disposed = true;
    prism?.dispose();
    prism = null;
    hero.classList.remove('hero--still');
    gsap.set(host, { clearProps: 'opacity' });
    scroll.kill();
    parallax.scrollTrigger?.kill();
    parallax.kill();
  };
}
