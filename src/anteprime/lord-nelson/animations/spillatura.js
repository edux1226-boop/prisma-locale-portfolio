/* La spillatura: scorrendo, il boccale si riempie e la schiuma sale. Il gruppo della birra si
   muove solo in `transform` (unità del viewBox). I livelli del menu si accendono uno alla volta. */
const VUOTO = 240; // gruppo spostato in basso: birra e schiuma fuori dal vetro
const SOGLIE = [0.14, 0.34, 0.54, 0.74, 0.92];

export function avviaSpillatura(gsap, ScrollTrigger) {
  const sez = document.querySelector('[data-spilla]');
  const pin = sez?.querySelector('[data-spilla-pin]');
  const birra = sez?.querySelector('[data-birra]');
  const livelli = [...(sez?.querySelectorAll('[data-livello]') ?? [])];
  if (!sez || !pin || !birra) return;

  const stato = { p: 0 };
  const applica = () => {
    gsap.set(birra, { y: VUOTO * (1 - stato.p) });
    livelli.forEach((el, i) => el.classList.toggle('is-attivo', stato.p >= (SOGLIE[i] ?? 1)));
  };
  applica();

  gsap.to(stato, {
    p: 1, ease: 'none', onUpdate: applica,
    scrollTrigger: { trigger: sez, start: 'top top', end: '+=110%', pin, scrub: 0.4 },
  });
}
