import { gsap } from '../../../js/core/motion.js';
import { RECENSIONI } from '../dati.js';

const virgola = (n, d) => n.toFixed(d).replace('.', ',');

/* I numeri delle recensioni vengono da dati.js; con il movimento contano
   da zero quando arrivano sullo schermo. */
export function initVoci({ movimento }) {
  const voto = document.querySelector('[data-voci-voto]');
  const numero = document.querySelector('[data-voci-numero]');
  const link = document.querySelector('[data-voci-link]');
  voto.textContent = virgola(RECENSIONI.voto, 1);
  numero.textContent = RECENSIONI.numero.toLocaleString('it-IT');
  link.href = RECENSIONI.link;
  document.querySelector('[data-voci-testo]').textContent = `Valutazione ${virgola(RECENSIONI.voto, 1)} su 5`;

  if (!movimento) return;
  const stato = { v: 0, n: 0 };
  gsap.to(stato, {
    v: RECENSIONI.voto,
    n: RECENSIONI.numero,
    duration: 2.4,
    ease: 'expo.out',
    scrollTrigger: { trigger: voto, start: 'top 85%', once: true },
    onUpdate() {
      voto.textContent = virgola(stato.v, 1);
      numero.textContent = Math.round(stato.n).toLocaleString('it-IT');
    },
  });
}
