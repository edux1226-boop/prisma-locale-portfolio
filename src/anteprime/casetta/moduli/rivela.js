/* Le carte sotto la piega entrano con una dissolvenza leggera quando si
   arriva a vederle. Quelle già visibili all'apertura non si toccano: il
   primo disegno resta immediato. Con il movimento ridotto non succede nulla. */
export function initRivela() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elementi = [...document.querySelectorAll('[data-rivela]')]
    .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
  if (!elementi.length) return;

  document.documentElement.classList.add('rivela-pronta');
  const osservatore = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (!v.isIntersecting) continue;
      v.target.classList.remove('is-fuori');
      osservatore.unobserve(v.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });

  elementi.forEach((el, i) => {
    el.classList.add('is-fuori');
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    osservatore.observe(el);
  });
}
