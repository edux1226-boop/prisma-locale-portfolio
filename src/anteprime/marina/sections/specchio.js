import { ScrollTrigger } from '../../../js/core/motion.js';

/* "In tavola": la transizione tra il mare e la cucina. Su desktop con
   puntatore fine il pelo d'acqua si muove davvero (WebGL, scaricato solo
   quando la sezione si avvicina). Altrimenti resta l'immagine ferma:
   la sezione funziona uguale, il movimento è un di più. */
export function initSpecchio({ fine, desktop }) {
  const sezione = document.querySelector('[data-specchio]');
  const tela = sezione.querySelector('[data-specchio-tela]');
  if (!fine || !desktop) return;

  let specchio = null;
  let caricamento = null;
  const carica = () => {
    caricamento ??= import('../three/specchio.js').then(({ creaSpecchio }) => {
      try {
        specchio = creaSpecchio(tela);
      } catch {
        specchio = null;
      }
      if (specchio) requestAnimationFrame(() => tela.classList.add('is-viva'));
      return specchio;
    });
    return caricamento;
  };

  ScrollTrigger.create({
    trigger: sezione,
    start: 'top bottom+=600',
    end: 'bottom top',
    onToggle(self) {
      if (self.isActive) carica().then((s) => s?.avvia());
      else specchio?.ferma();
    },
  });
}
