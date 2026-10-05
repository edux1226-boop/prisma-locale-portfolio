import { gsap, lockScroll } from '../../../js/core/motion.js';

const PORTATE = [
  'Il benvenuto: piccoli assaggi da gustare in piedi, tra un brindisi e l\'altro.',
  'La pasta, fatta come si deve: il momento in cui la tavola si fa silenziosa.',
  'Carne o pesce, secondo il menu scelto insieme alla cucina.',
  'La torta, ma non solo: il finale merita la stessa cura dell\'inizio.',
  'Abbinamenti scelti portata per portata, per brindare fino a tardi.',
];

/* Le portate sono schede: clic, frecce della tastiera, e su desktop anche
   il passaggio del mouse. Il testo cambia con una dissolvenza breve. */
function initPortate({ fine, movimento }) {
  const schede = [...document.querySelectorAll('[data-portata]')];
  const pannello = document.querySelector('[data-portate-pannello]');
  const testo = pannello.querySelector('[data-portate-testo]');
  let attiva = 0;

  const scegli = (i, focus = false) => {
    if (i === attiva) return;
    attiva = i;
    schede.forEach((s, j) => {
      s.setAttribute('aria-selected', String(j === i));
      s.tabIndex = j === i ? 0 : -1;
    });
    pannello.setAttribute('aria-labelledby', schede[i].id);
    if (focus) schede[i].focus();
    if (!movimento) { testo.textContent = PORTATE[i]; return; }
    gsap.timeline()
      .to(testo, { opacity: 0, y: -8, duration: 0.25, ease: 'power2.in', overwrite: true })
      .add(() => { testo.textContent = PORTATE[i]; })
      .fromTo(testo, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', immediateRender: false });
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
  apri.addEventListener('click', () => { carta.showModal(); lockScroll(true); });
  carta.querySelector('[data-carta-chiudi]').addEventListener('click', () => carta.close());
  carta.addEventListener('click', (e) => { if (e.target === carta) carta.close(); });
  carta.addEventListener('close', () => lockScroll(false));
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
