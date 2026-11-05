// Solo desktop (hover + puntatore fine): cursore contestuale e bottoni magnetici. Solo transform.
export function initDesktop() {
  const cur = document.createElement('div');
  cur.className = 'cursor';
  cur.setAttribute('aria-hidden', 'true');
  document.body.append(cur);
  let x = 0, y = 0, raf = 0;
  const paint = () => { raf = 0; cur.style.transform = `translate(${x}px,${y}px)`; };
  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
    cur.classList.toggle('hot', !!(e.target as Element).closest?.('a,button,canvas'));
  }, { passive: true });

  document.querySelectorAll<HTMLElement>('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}
