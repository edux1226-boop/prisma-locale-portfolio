/**
 * Parallax leggerissimo sulla composizione della hero.
 * Solo puntatore fine, solo se l'utente non ha chiesto meno movimento.
 * Scrive due custom property e lascia il lavoro alla CSS: nessun layout thrash.
 */

export function initParallax() {
  const stage = document.querySelector('[data-parallax]');
  if (!stage) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  let frame = null;

  const onMove = (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const rect = stage.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      stage.style.setProperty('--px', clamp(x).toFixed(3));
      stage.style.setProperty('--py', clamp(y).toFixed(3));
    });
  };

  const clamp = (v) => Math.max(-1, Math.min(1, v));

  window.addEventListener('mousemove', onMove, { passive: true });

  window.addEventListener(
    'mouseleave',
    () => {
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    },
    { passive: true }
  );
}
