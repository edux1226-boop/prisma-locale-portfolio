import { gsap, SplitText } from '../../js/core/motion.js';

/* Diagonale di un rettangolo w×h, dall'angolo in basso a sinistra a quello
   in alto a destra: lunghezza, angolo in gradi, direzione della lama (d) e
   normale verso la metà in basso a destra (n). */
function diagonale(w, h) {
  const len = Math.hypot(w, h);
  return {
    len,
    angle: (-Math.atan2(h, w) * 180) / Math.PI,
    d: { x: w / len, y: -h / len },
    n: { x: h / len, y: w / len },
  };
}

/* IL TITOLO AFFETTATO.
   "Nagoya" è scritto due volte, sovrapposto: una copia tiene solo la parte
   sopra la diagonale dell'hero, l'altra quella sotto. Allineate sembrano una
   parola sola; scorrendo, le due metà scivolano lungo il taglio. */
export function initHero() {
  const hero = document.querySelector('[data-hero]');
  const scatola = hero.querySelector('[data-fette]');
  const fette = [...hero.querySelectorAll('[data-fetta-titolo]')];
  const lama = hero.querySelector('[data-hero-lama]');
  let geo = diagonale(1, 1);

  function misura() {
    const W = hero.clientWidth;
    const H = hero.clientHeight;
    geo = diagonale(W, H);
    gsap.set(lama, { width: geo.len, rotation: geo.angle });

    const rh = hero.getBoundingClientRect();
    const rs = scatola.getBoundingClientRect();
    const L = rs.left - rh.left;
    const T = rs.top - rh.top;
    const w = rs.width;
    const h = rs.height;
    const linea = (x) => H - T - (H / W) * (x + L);
    const x0 = -w;
    const x1 = 2 * w;
    fette[0].style.clipPath = `polygon(${x0}px ${-h}px, ${x1}px ${-h}px, ${x1}px ${linea(x1)}px, ${x0}px ${linea(x0)}px)`;
    fette[1].style.clipPath = `polygon(${x0}px ${linea(x0)}px, ${x1}px ${linea(x1)}px, ${x1}px ${2 * h}px, ${x0}px ${2 * h}px)`;
  }

  misura();
  let attesa = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(attesa);
    attesa = requestAnimationFrame(misura);
  }).observe(hero);

  return {
    fette,
    misura,
    /* Le due metà scivolano lungo la lama mentre l'hero esce. */
    scivola() {
      const passo = () => hero.clientWidth * 0.04;
      const comune = { ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } };
      gsap.to(fette[0], { x: () => geo.d.x * passo(), y: () => geo.d.y * passo(), ...comune });
      gsap.to(fette[1], { x: () => -geo.d.x * passo(), y: () => -geo.d.y * passo(), ...comune, scrollTrigger: { ...comune.scrollTrigger } });
    },
  };
}

/* IL TAGLIO DI APERTURA — mossa firma n.1.
   Una lama salmone attraversa lo schermo in diagonale, le due metà del
   velo si separano scivolando lungo il taglio e sotto c'è il titolo, che
   entra lettera per lettera da lati alterni. */
export function playTaglio(hero, onDone) {
  const taglio = document.querySelector('[data-taglio]');
  const root = document.documentElement;
  taglio.style.animation = 'none';

  const lama = taglio.querySelector('[data-lama]');
  const [su, giu] = taglio.querySelectorAll('[data-meta]');
  const fili = taglio.querySelectorAll('[data-filo]');
  const W = window.innerWidth;
  const H = window.innerHeight;
  const g = diagonale(W, H);
  gsap.set([lama, ...fili], { width: g.len, rotation: g.angle });
  gsap.set(lama, { scaleX: 0 });

  const split = hero.fette.map((fetta) => SplitText.create(fetta, { type: 'chars', mask: 'chars', aria: 'none' }));
  const quante = split[0].chars.length;
  const lettere = split.flatMap((s) => s.chars);
  gsap.set(lettere, { yPercent: (i) => ((i % quante) % 2 ? -112 : 112) });
  const pezzi = document.querySelectorAll('[data-intro]');
  gsap.set(pezzi, { autoAlpha: 0, y: 14 });
  root.classList.remove('is-loading');

  // Distanza perché ogni metà esca del tutto: l'altezza del triangolo, e poco più.
  const via = (W * H) / g.len + 80;
  const scivola = g.len * 0.07;

  return gsap
    .timeline({
      onComplete() {
        taglio.remove();
        onDone?.();
      },
    })
    .to(lama, { scaleX: 1, duration: 0.62, ease: 'power4.inOut' }, 0.25)
    .addLabel('apri', '+=0.06')
    .set(taglio, { backgroundColor: 'transparent' }, 'apri')
    .to(su, { x: -g.n.x * via - g.d.x * scivola, y: -g.n.y * via - g.d.y * scivola, duration: 1.35, ease: 'expo.inOut' }, 'apri')
    .to(giu, { x: g.n.x * via + g.d.x * scivola, y: g.n.y * via + g.d.y * scivola, duration: 1.35, ease: 'expo.inOut' }, 'apri')
    .to(lama, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, 'apri+=0.55')
    .to(lettere, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: (i) => (i % quante) * 0.055 }, 'apri+=0.5')
    .to(pezzi, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 'apri+=0.9');
}
