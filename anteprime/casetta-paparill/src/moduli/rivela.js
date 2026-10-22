/* Le carte sotto la piega entrano con una dissolvenza leggera quando si
   arriva a vederle. Quelle già visibili all'apertura non si toccano: il
   primo disegno resta immediato. Con il movimento ridotto non succede nulla.
   Le posizioni le dà la prima notizia dell'osservatore, non una misura
   chiesta all'avvio: così il browser non deve impaginare due volte. */
export function initRivela() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elementi = document.querySelectorAll('[data-rivela]');
  if (!elementi.length) return;

  const noti = new WeakSet();
  let nascosti = 0;
  const osservatore = new IntersectionObserver((voci) => {
    for (const v of voci) {
      const el = v.target;
      if (!noti.has(el)) {
        noti.add(el);
        // già in vista (o sopra) alla prima notizia: resta com'è
        if (v.boundingClientRect.top <= window.innerHeight) {
          osservatore.unobserve(el);
          continue;
        }
        document.documentElement.classList.add('rivela-pronta');
        el.style.transitionDelay = `${(nascosti++ % 3) * 70}ms`;
        el.classList.add('is-fuori');
        continue;
      }
      if (!v.isIntersecting) continue;
      el.classList.remove('is-fuori');
      osservatore.unobserve(el);
    }
  }, { rootMargin: '0px 0px -8% 0px' });

  elementi.forEach((el) => osservatore.observe(el));
}
