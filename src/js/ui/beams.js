import { gsap } from '../core/motion.js';

/* Il banco ottico del metodo: il fascio entra, attraversa il prisma,
   esce in sette raggi. Disegnato dallo scroll, solo con scaleX. */
export function initBench() {
  const bench = document.querySelector('[data-bench]');
  if (!bench) return;
  const beam = bench.querySelector('[data-bench-beam]');
  const prism = bench.querySelector('[data-bench-prism]');
  const rays = bench.querySelectorAll('[data-bench-rays] i');

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: bench, start: 'top 85%', end: 'top 35%', scrub: 0.6 },
  })
    .fromTo(beam, { scaleX: 0 }, { scaleX: 1, duration: 1 })
    .fromTo(prism, { opacity: 0.25, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.3 }, 0.78)
    .fromTo(rays, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.035, ease: 'power2.out' }, 0.98);
}
