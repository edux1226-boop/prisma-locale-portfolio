import { gsap, ScrollTrigger } from '../../../js/core/motion.js';

/* Una recensione alla volta: entra, resta, lascia il posto alla successiva.
   Il ritmo è la barra sotto le frasi (7 s in CSS): quando finisce si passa
   alla prossima. Si ferma fuori schermo, sotto il puntatore, col focus e
   con "Pausa", semplicemente mettendo in pausa la barra. */
export function initVoci({ movimento }) {
  const sezione = document.querySelector('[data-voci]');
  if (!movimento) {
    sezione.classList.add('is-statica');
    return;
  }
  const voci = [...sezione.querySelectorAll('[data-voce]')];
  const punti = [...sezione.querySelectorAll('.voci__punti li')];
  const pausa = sezione.querySelector('[data-voci-pausa]');
  const pausaTesto = sezione.querySelector('[data-voci-pausa-testo]');

  // il punteggio conta fino a 4,6 la prima volta che si vede
  const cifra = sezione.querySelector('[data-conta]');
  const valore = { v: 0 };
  cifra.textContent = '0,0';
  gsap.to(valore, {
    v: Number(cifra.dataset.conta), duration: 2.2, ease: 'expo.out',
    onUpdate: () => { cifra.textContent = valore.v.toFixed(1).replace('.', ','); },
    scrollTrigger: { trigger: cifra, start: 'top 85%', once: true },
  });

  let attiva = 0;
  let inVista = false;
  let ferma = false;
  let sopra = false;   // puntatore sulla sezione
  let dentro = false;  // focus dentro la sezione

  const aggiorna = () => sezione.classList.toggle('is-pausa', !inVista || ferma || sopra || dentro);
  const mostra = (i) => {
    voci[attiva].classList.remove('is-attiva');
    punti[attiva].classList.remove('is-attivo');
    attiva = i;
    voci[attiva].classList.add('is-attiva');
    punti[attiva].classList.add('is-attivo');
  };

  punti.forEach((punto) => punto.addEventListener('animationend', () => mostra((attiva + 1) % voci.length)));
  punti[0].classList.add('is-attivo');
  aggiorna();

  ScrollTrigger.create({
    trigger: sezione, start: 'top 70%', end: 'bottom 30%',
    onToggle: (self) => { inVista = self.isActive; aggiorna(); },
  });
  sezione.addEventListener('pointerenter', () => { sopra = true; aggiorna(); });
  sezione.addEventListener('pointerleave', () => { sopra = false; aggiorna(); });
  sezione.addEventListener('focusin', () => { dentro = true; aggiorna(); });
  sezione.addEventListener('focusout', (e) => { dentro = sezione.contains(e.relatedTarget); aggiorna(); });
  pausa.addEventListener('click', () => {
    ferma = !ferma;
    pausa.setAttribute('aria-pressed', String(ferma));
    pausaTesto.textContent = ferma ? 'Riprendi' : 'Pausa';
    aggiorna();
  });
}
