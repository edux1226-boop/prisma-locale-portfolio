/* Comparsa discreta allo scorrimento: opacità e 12 px, una volta sola.
   Lo stato "nascosto" esiste solo dopo che questo script è partito (classe
   .rivela su <html>): se il JavaScript manca o fallisce, tutto resta visibile. */
export function initRivela() {
  const root = document.documentElement;
  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) return;

  const nodi = [...document.querySelectorAll('[data-rivela]')];
  // sfasamento tra fratelli (schede, foto, blocchi), al massimo 5 passi
  const contatori = new Map();
  for (const nodo of nodi) {
    const n = contatori.get(nodo.parentElement) ?? 0;
    nodo.style.setProperty('--i', Math.min(n, 5));
    contatori.set(nodo.parentElement, n + 1);
  }

  const io = new IntersectionObserver((voci) => {
    for (const voce of voci) {
      if (!voce.isIntersecting) continue;
      voce.target.classList.add('is-visibile');
      io.unobserve(voce.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });

  root.classList.add('rivela');
  for (const nodo of nodi) io.observe(nodo);
}
