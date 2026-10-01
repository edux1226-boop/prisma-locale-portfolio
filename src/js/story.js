import { gsap } from './core/motion.js';

/* PRIMA E DOPO — la vetrina grigia.
   Ogni pezzo del negozio (insegna, vetrina, lavagna, foglio sulla porta)
   scivola nel prisma, sparisce, e ne esce a colori nel suo posto del sito.
   Un'unica timeline legata allo scroll, pinnata per tutta la durata. */

/* Centro di un elemento nel sistema del palco. offsetLeft/offsetTop
   ignorano le trasformazioni: la misura resta giusta anche a metà
   animazione, quando ScrollTrigger ricalcola. */
function centerIn(stage, el) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node = el;
  while (node && node !== stage) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y };
}

export function initStory({ vertical }) {
  const root = document.querySelector('[data-story]');
  if (!root) return null;

  const pin = root.querySelector('[data-story-pin]');
  const stage = root.querySelector('[data-story-stage]');
  const prism = root.querySelector('[data-story-prism]');
  const flash = root.querySelector('[data-story-flash]');
  const live = root.querySelector('[data-story-live]');
  const progress = root.querySelector('[data-story-progress]');
  const pieces = gsap.utils.toArray(root.querySelectorAll('[data-piece]'));
  const slots = gsap.utils.toArray(root.querySelectorAll('[data-slot]'));
  const steps = gsap.utils.toArray(root.querySelectorAll('.story__step'));
  const before = root.querySelector('.story__side--prima');
  const after = root.querySelector('.story__side--dopo');

  root.classList.add('is-animated');

  /* Tutte le distanze si leggono in un colpo solo (una sola misura del
     layout) e le tween le prendono dalla cache: niente reflow a catena
     quando ScrollTrigger ricalcola. */
  const cache = new Map();
  const measure = () => {
    const target = centerIn(stage, prism);
    for (const el of [...pieces, ...slots]) {
      const c = centerIn(stage, el);
      cache.set(el, { x: target.x - c.x, y: target.y - c.y });
    }
  };
  measure();
  const offset = (el, axis) => () => cache.get(el)[axis];
  const flashOff = vertical ? { scaleY: 0, opacity: 0 } : { scaleX: 0, opacity: 0 };
  const flashOn = vertical ? { scaleY: 1, opacity: 1 } : { scaleX: 1, opacity: 1 };

  gsap.set(steps, { opacity: 0 });
  gsap.set(steps[0], { opacity: 1 });
  gsap.set(root.querySelectorAll('.site__skel'), { opacity: 1 });
  gsap.set(root.querySelectorAll('.site__piece'), { opacity: 0 });
  gsap.set(live, { opacity: 0 });
  gsap.set(flash, flashOff);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      pin,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (vertical ? 4 : 4.6))}`,
      scrub: 0.7,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      onRefreshInit: measure,
    },
  });

  const HOLD = 0.6;
  const STEP = 1.1;

  pieces.forEach((piece, i) => {
    const slot = slots[i];
    const color = slot.querySelector('.site__piece');
    const skeleton = slot.querySelector('.site__skel');
    const at = HOLD + i * STEP;

    tl.to(piece, { x: offset(piece, 'x'), y: offset(piece, 'y'), scale: 0.16, ease: 'power2.in', duration: 0.55 }, at)
      .to(piece, { opacity: 0, duration: 0.1 }, at + 0.46)
      .to(flash, { ...flashOn, duration: 0.14, ease: 'power2.out' }, at + 0.5)
      .to(flash, { opacity: 0, duration: 0.32 }, at + 0.64)
      .fromTo(
        color,
        { x: offset(slot, 'x'), y: offset(slot, 'y'), scale: 0.16, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, ease: 'power3.out', duration: 0.62, immediateRender: false },
        at + 0.52,
      )
      .to(skeleton, { opacity: 0, duration: 0.2 }, at + 0.86)
      .to(steps[i], { opacity: 0, y: -12, duration: 0.16 }, at + 0.04)
      .fromTo(steps[i + 1], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, immediateRender: false }, at + 0.24);
  });

  const end = HOLD + pieces.length * STEP;
  tl.to(before, { opacity: 0.2, scale: 0.94, duration: 0.6, ease: 'power2.inOut' }, end)
    .to(prism, { opacity: 0.3, duration: 0.5 }, end)
    .to(after, { scale: 1.04, duration: 0.7, ease: 'power2.inOut' }, end)
    .to(live, { opacity: 1, duration: 0.3 }, end + 0.35)
    .to(steps[pieces.length], { opacity: 0, y: -12, duration: 0.16 }, end + 0.04)
    .fromTo(steps[pieces.length + 1], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, immediateRender: false }, end + 0.24)
    .to({}, { duration: 0.7 });

  tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0);

  return () => root.classList.remove('is-animated');
}
