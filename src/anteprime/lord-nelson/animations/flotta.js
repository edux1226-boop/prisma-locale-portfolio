/* I Big come flotta: la sezione si pinna e il binario scorre di lato. Se tutte le navi stanno nella
   larghezza della pagina non si pinna nulla. Con il movimento attivo il binario non ha scroll
   nativo, quindi le navi restano raggiungibili anche da tastiera grazie al focus (vedi sotto). */
export function avviaFlotta(gsap, ScrollTrigger) {
  const sez = document.querySelector('[data-big]');
  const pin = sez?.querySelector('[data-big-pin]');
  const pista = sez?.querySelector('[data-big-pista]');
  const flotta = sez?.querySelector('[data-flotta]');
  if (!sez || !pin || !pista || !flotta) return;

  const distanza = () => Math.max(0, flotta.scrollWidth + parseFloat(getComputedStyle(pista).paddingInline) * 2 - pista.clientWidth);
  if (distanza() <= 0) return;

  pista.classList.add('is-pinnato');
  gsap.to(flotta, {
    x: () => -distanza(), ease: 'none',
    scrollTrigger: { trigger: sez, start: 'top top', end: () => `+=${distanza()}`, pin, scrub: 0.4, invalidateOnRefresh: true },
  });
}
