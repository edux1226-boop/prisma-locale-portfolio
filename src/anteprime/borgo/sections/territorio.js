import { ScrollTrigger } from '../../../js/core/motion.js';

const PASSI = [0.12, 0.45, 0.76]; // dove comincia ciascun passo del racconto

function webglDisponibile() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/* Il plastico 3D solo dove ha senso: schermo largo, puntatore fine,
   movimento attivo, WebGL. Il modulo three.js si scarica quando la sezione
   si avvicina; fino ad allora (e altrove) resta l'immagine statica. */
export function initTerritorio({ desktop, fine }) {
  const sezione = document.querySelector('[data-territorio]');
  if (!desktop || !fine || !webglDisponibile()) return;
  sezione.classList.add('con-3d');

  const tela = sezione.querySelector('[data-territorio-tela]');
  const passi = [...sezione.querySelectorAll('[data-passo]')];
  const etichette = Object.fromEntries([...sezione.querySelectorAll('[data-etichetta]')].map((n) => [n.dataset.etichetta, n]));
  let plastico = null;
  let progresso = 0;

  const aggiorna = () => {
    plastico?.imposta(progresso);
    const passo = PASSI.findLastIndex((inizio) => progresso >= inizio);
    passi.forEach((li, i) => li.classList.toggle('is-attivo', i === passo));
    const tutte = passo < 0;
    etichette.sasso.classList.toggle('is-visibile', tutte || passo === 0);
    etichette.mare.classList.toggle('is-visibile', tutte || passo === 1);
    etichette.borgo.classList.toggle('is-visibile', tutte || passo >= 1);
  };

  ScrollTrigger.create({
    trigger: sezione,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) { progresso = self.progress; aggiorna(); },
  });
  aggiorna();

  const io = new IntersectionObserver(async ([voce]) => {
    if (!voce.isIntersecting) return;
    io.disconnect();
    const { createPlastico } = await import('../three/plastico.js');
    plastico = createPlastico(tela, { etichette, spostamento: 0.12, margineTesto: 0.4 });
    aggiorna();
    requestAnimationFrame(() => sezione.classList.add('is-3d-pronto'));
  }, { rootMargin: '120% 0px' });
  io.observe(sezione);
}
