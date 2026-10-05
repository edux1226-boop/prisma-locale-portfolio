import { gsap } from '../../../js/core/motion.js';

/* Il cursore resta quello del sistema. Sopra ciò che si apre compare un
   cerchio con un'etichetta ("Apri"): un invito, non un effetto. */
export function initCursore() {
  const cerchio = document.querySelector('[data-cursore]');
  const testo = document.querySelector('[data-cursore-testo]');
  if (!cerchio) return;
  const x = gsap.quickTo(cerchio, 'x', { duration: 0.55, ease: 'power3.out' });
  const y = gsap.quickTo(cerchio, 'y', { duration: 0.55, ease: 'power3.out' });
  let attivo = null;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x(e.clientX);
    y(e.clientY);
    const bersaglio = e.target.closest?.('[data-cursore-etichetta]') ?? null;
    if (bersaglio === attivo) return;
    attivo = bersaglio;
    if (bersaglio) {
      testo.textContent = bersaglio.dataset.cursoreEtichetta;
      cerchio.classList.add('is-visibile', 'is-grande');
      gsap.to(cerchio, { scale: 1, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
    } else {
      cerchio.classList.remove('is-grande');
      gsap.to(cerchio, { scale: 0.08, duration: 0.5, ease: 'expo.out', overwrite: 'auto', onComplete: () => cerchio.classList.remove('is-visibile') });
    }
  }, { passive: true });
  // pointerleave non arriva al document: l'uscita dalla finestra è un mouseout senza destinazione
  window.addEventListener('mouseout', (e) => {
    if (e.relatedTarget) return;
    attivo = null;
    cerchio.classList.remove('is-visibile', 'is-grande');
    gsap.set(cerchio, { scale: 0.08 });
  });
}

/* I pulsanti principali si lasciano attirare di qualche pixel. */
export function initMagneti() {
  for (const nodo of document.querySelectorAll('[data-magnete]')) {
    const x = gsap.quickTo(nodo, 'x', { duration: 0.8, ease: 'expo.out' });
    const y = gsap.quickTo(nodo, 'y', { duration: 0.8, ease: 'expo.out' });
    nodo.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = nodo.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.22);
      y((e.clientY - r.top - r.height / 2) * 0.3);
    });
    nodo.addEventListener('pointerleave', () => { x(0); y(0); });
  }
}
