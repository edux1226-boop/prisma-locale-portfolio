/* Indice del menu: segue la sezione che si sta leggendo. */
export function initCarta() {
  const indice = document.querySelector('[data-carta-indice]');
  if (!indice) return;
  const link = new Map([...indice.querySelectorAll('[data-carta-link]')].map((a) => [a.hash.slice(1), a]));
  let attivo = null;
  const segna = (id) => {
    const a = link.get(id);
    if (!a || a === attivo) return;
    attivo?.removeAttribute('aria-current');
    a.setAttribute('aria-current', 'true');
    attivo = a;
    // su telefono l'indice scorre di lato: la voce attiva resta in vista
    if (indice.scrollWidth > indice.clientWidth) {
      const x = a.offsetLeft - indice.clientWidth / 2 + a.offsetWidth / 2;
      indice.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
    }
  };
  const io = new IntersectionObserver((voci) => {
    for (const v of voci) if (v.isIntersecting) segna(v.target.id);
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('[data-carta-sezione]').forEach((s) => io.observe(s));
}
