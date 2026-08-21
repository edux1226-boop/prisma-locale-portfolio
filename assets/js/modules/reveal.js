/**
 * Scroll reveal.
 * Ogni elemento con [data-reveal] entra una sola volta.
 * [data-reveal-stagger] su un contenitore ritarda i figli in sequenza.
 * I titoli con [data-reveal-lines] si scoprono riga per riga.
 */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-lines]');
  if (!targets.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  // Stagger: assegna un ritardo progressivo ai figli diretti marcati.
  document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
    const step = Number(group.dataset.revealStagger) || 70;
    group.querySelectorAll(':scope > [data-reveal]').forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${i * step}ms`);
    });
  });

  // Le righe dei titoli vengono avvolte per poter scorrere sotto una maschera.
  document.querySelectorAll('[data-reveal-lines]').forEach((el) => {
    el.querySelectorAll('.line-mask').forEach((mask, i) => {
      const inner = mask.querySelector('.line-inner');
      if (inner) inner.style.setProperty('--line-delay', `${i * 90}ms`);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => io.observe(el));
}
