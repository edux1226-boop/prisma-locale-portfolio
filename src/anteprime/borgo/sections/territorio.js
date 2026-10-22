import { ScrollTrigger, whenIdle } from '../../../js/core/motion.js';

function webglDisponibile() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/* Il plastico 3D solo dove ha senso: schermo largo, puntatore fine,
   movimento attivo, WebGL. Il modulo three.js si scarica quando la sezione
   si avvicina; altrove resta l'immagine statica dello stesso plastico.
   I passi del racconto corrispondono alle inquadrature del plastico (la
   prima è la vista d'insieme); ogni passo dice quali etichette mostrare. */
export function initTerritorio({ desktop, fine }) {
  const sezione = document.querySelector('[data-territorio]');
  if (!desktop || !fine || !webglDisponibile()) return;
  sezione.classList.add('con-3d');

  const tela = sezione.querySelector('[data-territorio-tela]');
  const passi = [...sezione.querySelectorAll('[data-passo]')];
  const etichette = Object.fromEntries([...sezione.querySelectorAll('[data-etichetta]')].map((n) => [n.dataset.etichetta, n]));
  const perPasso = passi.map((li) => li.dataset.etichette.split(' '));
  let plastico = null;
  let progresso = 0;

  const aggiorna = () => {
    plastico?.imposta(progresso);
    const passo = Math.round(progresso * passi.length) - 1; // -1: la vista d'insieme
    passi.forEach((li, i) => li.classList.toggle('is-attivo', i === passo));
    // le etichette le posiziona il plastico: prima che esista restano nascoste
    if (!plastico) return;
    for (const [nome, nodo] of Object.entries(etichette)) {
      nodo.classList.toggle('is-visibile', passo < 0 || perPasso[passo].includes(nome));
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: sezione,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) { progresso = self.progress; aggiorna(); },
  });
  aggiorna();

  const io = new IntersectionObserver(([voce]) => {
    if (!voce.isIntersecting) return;
    io.disconnect();
    import('../three/plastico.js')
      .then(({ createPlastico }) => new Promise((pronto) => whenIdle(() => {
        pronto(createPlastico(tela, { etichette, spostamento: 0.12, colonna: sezione.querySelector('.territorio__testo') }));
      })))
      .then((creato) => {
        plastico = creato;
        aggiorna();
        requestAnimationFrame(() => sezione.classList.add('is-3d-pronto'));
      })
      .catch(() => {
        // three.js non è arrivato: si torna all'immagine statica, senza pin
        trigger.kill();
        sezione.classList.remove('con-3d');
        ScrollTrigger.refresh();
      });
  }, { rootMargin: '120% 0px' });
  io.observe(sezione);
}
