import { CX, PIASTRA_Y, posizioni } from '../data/panino.js';
import { creaPila, collegaSelettore } from '../sections/smash.js';

/* Mossa firma 2: lo smash. La sezione si pinna e lo scroll guida la scena:
   1) la palla di carne cade sulla piastra e la spatola la schiaccia (crosta);
   2) lo smash sale e sotto si impilano potato roll e salsa Morsi;
   3) cheddar, bacon, uovo e il pane sopra. A panino finito il selettore x1…x4 si accende.
   Solo transform e opacity. Con movimento ridotto non si arriva qui (vedi sections/smash.js). */

const $ = (sel, r = document) => r.querySelector(sel);
const $$ = (sel, r = document) => [...r.querySelectorAll(sel)];

export function avviaSmash(gsap, ScrollTrigger) {
  const sezione = $('[data-smash]');
  const pin = $('[data-smash-pin]');
  const palco = $('[data-palco]');
  if (!sezione || !pin || !palco) return;

  const pila = creaPila({ gsap });
  const str = (id) => pila.livelli[id].strato;
  const SPESSORE_DISCO = 15;
  const quota = (id) => posizioni(1)[id]; // dove sta lo strato a pila base (1 smash)

  // ---- stato iniziale: la pila è vuota, la scena è sulla piastra ----
  pila.imposta(1, { soloBase: true });
  for (const L of Object.values(pila.livelli)) gsap.set(L.strato, { opacity: 0, y: -130 });
  const crosta1 = $('[data-crosta]', str('smash-1'));
  gsap.set($$('[data-crosta]', palco), { opacity: 0 });

  const palla = $('[data-palla]');
  const spatola = $('[data-spatola]');
  const piastra = $('[data-piastra]');
  const vapori = $$('[data-vapore]');
  gsap.set(palla, { transformOrigin: '50% 100%', y: -170, opacity: 0, scaleX: 1, scaleY: 1 });
  gsap.set(spatola, { y: 150, opacity: 0 });
  gsap.set(vapori, { opacity: 0, y: 0 });

  // lo smash numero 1 nasce sulla piastra (sotto) e poi sale al suo posto
  const sulla = PIASTRA_Y - SPESSORE_DISCO - quota('smash-1');
  const sopra = -90;

  const punti = $$('[data-punto]');
  const attiva = (i) => punti.forEach((p, k) => p.classList.toggle('is-attivo', k === i));

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  // 1. la palla cade
  tl.to(palla, { y: 0, opacity: 1, duration: 1, ease: 'power2.in' }, 0)
    .to(vapori, { opacity: 0.55, duration: 0.6, stagger: 0.12 }, 0.7)
  // 2. la spatola scende e schiaccia
    .to(spatola, { y: 240, opacity: 1, duration: 0.7, ease: 'power2.out' }, 1)
    .to(spatola, { y: 285.6, duration: 0.8 }, 1.7)
    .to(palla, { scaleY: 0.24, scaleX: 3.7, duration: 0.8 }, 1.7)
    .to(vapori, { y: -8, duration: 0.8 }, 1.7)
  // 3. la palla diventa lo smash con la crosta
    .set(palla, { opacity: 0 }, 2.5)
    .set(str('smash-1'), { opacity: 1, y: sulla }, 2.5)
    .to($$('[data-crosta]', str('smash-1')), { opacity: 1, duration: 1.1 }, 2.5)
    .to(vapori, { opacity: 0.8, y: -22, duration: 1, stagger: 0.1 }, 2.5)
  // 4. spatola e piastra escono, lo smash sale
    .to(spatola, { y: 150, opacity: 0, duration: 0.7, ease: 'power2.in' }, 3.7)
    .to(str('smash-1'), { y: sopra, duration: 0.7, ease: 'power2.inOut' }, 3.9)
    .to([piastra], { opacity: 0, duration: 0.7 }, 4.1)
  // 5. si costruisce dal basso: potato roll, salsa, smash, cheddar, bacon, uovo, pane
    .to(str('pan-basso'), { y: 0, opacity: 1, duration: 0.9, ease: 'bounce.out' }, 4.4)
    .to(str('salsa'), { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 5.5)
    .to(str('smash-1'), { y: 0, duration: 0.6, ease: 'power2.in' }, 6)
    .to(str('cheddar-1'), { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 6.6)
    .to(str('bacon'), { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, 7.2)
    .to(str('uovo'), { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 7.75)
    .to(str('pan-alto'), { y: 0, opacity: 1, duration: 0.8, ease: 'bounce.out' }, 8.4)
    .to({}, { duration: 0.8 }, 9.2);

  const selettore = collegaSelettore((n) => pila.imposta(n, { animato: true }));
  selettore.imposta(2);
  selettore.abilita(false);
  let completo = false;
  const stato = $('[data-smash-stato]');

  const lunghezza = () => (window.innerWidth < 900 ? '+=300%' : '+=340%');
  ScrollTrigger.create({
    trigger: sezione,
    start: 'top top',
    end: lunghezza,
    pin,
    pinSpacing: true,
    anticipatePin: 1,
    scrub: 0.6,
    animation: tl,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const t = self.progress * tl.duration();
      attiva(t < 4.4 ? 0 : t < 5.5 ? 1 : 2);
      const fatto = self.progress >= 0.965;
      if (fatto !== completo) {
        completo = fatto;
        selettore.abilita(fatto);
        const n = Number(document.querySelector('[data-smash-sel] [aria-checked="true"]')?.dataset.x) || 2;
        pila.imposta(fatto ? n : 1, { animato: true, soloBase: !fatto });
        if (stato && !fatto) stato.textContent = 'Scorri per costruire il panino';
        else if (stato) stato.textContent = `Panino con ${n} smash`;
      }
    },
  });
  if (stato) stato.textContent = 'Scorri per costruire il panino';
}
