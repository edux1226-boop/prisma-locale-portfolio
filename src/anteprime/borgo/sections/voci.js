import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

const DURATA = 7000;

/* Una recensione alla volta: entra, resta, lascia il posto alla successiva.
   Si ferma fuori schermo, con il puntatore sopra, col focus e con "Pausa". */
export function initVoci({ movimento }) {
  const sezione = document.querySelector('[data-voci]');
  const voci = [...sezione.querySelectorAll('[data-voce]')];
  const punti = [...sezione.querySelectorAll('.voci__punti li')];
  const pausa = sezione.querySelector('[data-voci-pausa]');
  const pausaTesto = sezione.querySelector('[data-voci-pausa-testo]');

  // il punteggio conta fino a 4,6 la prima volta che si vede
  const cifra = sezione.querySelector('[data-conta]');
  if (movimento && cifra) {
    const valore = { v: 0 };
    const fine = Number(cifra.dataset.conta);
    cifra.textContent = '0,0';
    gsap.to(valore, {
      v: fine, duration: 2.2, ease: 'expo.out',
      onUpdate: () => { cifra.textContent = valore.v.toFixed(1).replace('.', ','); },
      scrollTrigger: { trigger: cifra, start: 'top 85%', once: true },
    });
  }

  if (!movimento) {
    sezione.classList.add('is-statica');
    return;
  }

  let attiva = 0;
  let timer = 0;
  let inVista = false;
  let ferma = false;
  let sopra = false;   // puntatore sulla sezione
  let dentro = false;  // focus dentro la sezione

  const mostra = (i) => {
    voci[attiva].classList.remove('is-attiva');
    punti[attiva].classList.remove('is-attivo');
    attiva = i;
    voci[attiva].classList.add('is-attiva');
    void punti[attiva].offsetWidth; // riparte la barra
    punti[attiva].classList.add('is-attivo');
  };
  const programma = () => {
    clearTimeout(timer);
    const gira = inVista && !ferma && !sopra && !dentro;
    sezione.classList.toggle('is-pausa', !gira);
    if (gira) timer = setTimeout(() => { mostra((attiva + 1) % voci.length); programma(); }, DURATA);
  };

  punti[0].classList.add('is-attivo');
  ScrollTrigger.create({
    trigger: sezione, start: 'top 70%', end: 'bottom 30%',
    onToggle: (self) => { inVista = self.isActive; programma(); },
  });
  sezione.addEventListener('pointerenter', () => { sopra = true; programma(); });
  sezione.addEventListener('pointerleave', () => { sopra = false; programma(); });
  sezione.addEventListener('focusin', () => { dentro = true; programma(); });
  sezione.addEventListener('focusout', (e) => {
    dentro = sezione.contains(e.relatedTarget);
    programma();
  });
  pausa.addEventListener('click', () => {
    ferma = !ferma;
    pausa.setAttribute('aria-pressed', String(ferma));
    pausaTesto.textContent = ferma ? 'Riprendi' : 'Pausa';
    programma();
  });
}
