/**
 * Tilt 3D al passaggio del mouse.
 * Il JS scrive solo quattro custom property (--rx, --ry, --mx, --my):
 * la trasformazione la applica la CSS, così resta tutto sulla GPU.
 *
 * Uso: <article data-tilt data-tilt-max="6"> … </article>
 * Attivo solo con puntatore fine e senza "riduci movimento".
 */

export function initTilt() {
  const nodes = document.querySelectorAll('[data-tilt]');
  if (!nodes.length) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  nodes.forEach((node) => {
    const max = Number(node.dataset.tiltMax) || 6;
    let frame = null;
    let rect = null;

    const measure = () => { rect = node.getBoundingClientRect(); };

    const onEnter = () => {
      measure();
      node.classList.add('is-tilting');
    };

    const onMove = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (!rect) measure();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        node.style.setProperty('--ry', `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
        node.style.setProperty('--rx', `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
        node.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        node.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      });
    };

    const onLeave = () => {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      node.classList.remove('is-tilting');
      // Il ritorno a zero è animato dalla transition della card.
      node.style.setProperty('--rx', '0deg');
      node.style.setProperty('--ry', '0deg');
    };

    node.addEventListener('pointerenter', onEnter);
    node.addEventListener('pointermove', onMove, { passive: true });
    node.addEventListener('pointerleave', onLeave);
  });
}
