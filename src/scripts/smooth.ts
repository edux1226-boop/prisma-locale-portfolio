// Scroll fluido (Lenis) solo con mouse/trackpad. Le animazioni a scroll in CSS restano sincronizzate perche' lo scroll e' quello nativo.
import Lenis from 'lenis';

export function initSmooth() {
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -56 } });
  const loop = (t: number) => { lenis.raf(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  // I dialog hanno il loro scroll: Lenis si ferma finche' sono aperti.
  const mo = new MutationObserver(() => (document.querySelector('dialog[open]') ? lenis.stop() : lenis.start()));
  document.querySelectorAll('dialog').forEach((d) => mo.observe(d, { attributes: true, attributeFilter: ['open'] }));
}
