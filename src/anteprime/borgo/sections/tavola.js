import { gsap } from '../../../js/core/motion.js';

/* Le portate sono schede con i loro pannelli nel markup: clic, frecce della
   tastiera, e su desktop anche il passaggio del mouse. Il pannello nuovo
   arriva con una dissolvenza breve. */
function initPortate({ fine, movimento }) {
  const schede = [...document.querySelectorAll('[data-portata]')];
  const pannelli = [...document.querySelectorAll('[data-pannello]')];
  let attiva = 0;

  const scegli = (i, focus = false) => {
    if (i === attiva) return;
    const prima = pannelli[attiva];
    attiva = i;
    schede.forEach((s, j) => {
      s.setAttribute('aria-selected', String(j === i));
      s.tabIndex = j === i ? 0 : -1;
    });
    if (focus) schede[i].focus();
    gsap.killTweensOf(pannelli);
    const mostra = () => {
      pannelli.forEach((p, j) => { p.hidden = j !== i; });
      if (movimento) gsap.fromTo(pannelli[i], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    };
    if (!movimento || prima.hidden) { mostra(); return; }
    gsap.to(prima, { opacity: 0, y: -8, duration: 0.25, ease: 'power2.in', onComplete: () => { gsap.set(prima, { clearProps: 'opacity,transform' }); mostra(); } });
  };

  schede.forEach((s, i) => {
    s.addEventListener('click', () => scegli(i));
    if (fine) s.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') scegli(i); });
    s.addEventListener('keydown', (e) => {
      const passo = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (passo) { e.preventDefault(); scegli((attiva + passo + schede.length) % schede.length, true); }
      if (e.key === 'Home') { e.preventDefault(); scegli(0, true); }
      if (e.key === 'End') { e.preventDefault(); scegli(schede.length - 1, true); }
    });
  });
}

/* "Scopri il menu": una carta che entra da destra. */
function initCarta() {
  const carta = document.querySelector('[data-carta]');
  const apri = document.querySelector('[data-menu-portate-apri]');
  apri.addEventListener('click', () => carta.showModal());
  carta.querySelector('[data-carta-chiudi]').addEventListener('click', () => carta.close());
  carta.addEventListener('click', (e) => { if (e.target === carta) carta.close(); });
  // chi chiede i menu arriva al modulo con il messaggio già scritto
  carta.querySelector('[data-carta-contatti]').addEventListener('click', () => {
    const messaggio = document.querySelector('#f-messaggio');
    if (!messaggio.value) messaggio.value = 'Vorremmo ricevere i menu per il nostro evento.';
  });
}

export function initTavola(opzioni) {
  initPortate(opzioni);
  initCarta();
}
