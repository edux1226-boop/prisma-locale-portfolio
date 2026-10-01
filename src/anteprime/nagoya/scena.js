import { gsap, ScrollTrigger, SplitText, whenIdle } from '../../js/core/motion.js';

/* Three.js r186 richiede WebGL 2. */
function haWebGL2() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

/* Regia della scena pinnata: tre frasi su un nigiri che si compone.
   Il 3D si carica dopo l'apertura; se manca WebGL, se la macchina è lenta o
   se il contesto si perde, resta un'immagine renderizzata dalla stessa scena. */
export function initScena({ leggero }) {
  const scena = document.querySelector('[data-scena]');
  const palco = scena.querySelector('[data-palco]');
  const tela = scena.querySelector('[data-tela]');
  const frasi = [...scena.querySelectorAll('[data-frase]')];
  const corsa = scena.querySelector('[data-corsa]');

  let nigiri = null;
  let progresso = 0;
  let chiusa = false;
  const usa3D = haWebGL2();
  if (usa3D) scena.classList.add('scena--3d');

  const mostraFoto = () => {
    nigiri?.dispose();
    nigiri = null;
    scena.classList.remove('scena--3d');
  };

  const righe = frasi.map((frase) => SplitText.create(frase, { type: 'lines', mask: 'lines', linesClass: 'riga' }).lines);
  const fasi = [
    [0.03, 0.36],
    [0.5, 0.76],
    [0.84, null],
  ];

  const regia = gsap.timeline({ defaults: { ease: 'none' } });
  righe.forEach((linee, i) => {
    const [entra, esce] = fasi[i];
    regia.fromTo(linee, { yPercent: 125 }, { yPercent: 0, duration: 0.08, stagger: 0.02, ease: 'power3.out' }, entra);
    if (esce !== null) regia.to(linee, { yPercent: -125, duration: 0.06, stagger: 0.015, ease: 'power2.in' }, esce);
  });
  regia.fromTo(corsa, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
  regia.set({}, {}, 1);

  ScrollTrigger.create({
    trigger: scena,
    start: 'top top',
    end: () => `+=${window.innerHeight * 2.6}`,
    pin: palco,
    scrub: 0.4,
    animation: regia,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      progresso = self.progress;
      nigiri?.setProgress(progresso);
    },
  });

  // Senza 3D c'è comunque profondità: l'immagine si avvicina piano.
  gsap.fromTo(scena.querySelector('.scena__foto img'), { scale: 1.12 }, {
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: scena, start: 'top top', end: () => `+=${window.innerHeight * 2.6}`, scrub: true },
  });

  function monta(createNigiri) {
    nigiri = createNigiri(tela, {
      grains: leggero ? 1100 : 2600,
      dpr: leggero ? 1.5 : 1.75,
      onReady() {
        if (chiusa) return;
        nigiri.setProgress(progresso);
        gsap.fromTo(tela, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
      },
      onFail: mostraFoto,
      onLost: mostraFoto,
      onRestored() {
        if (chiusa) return;
        scena.classList.add('scena--3d');
        monta(createNigiri);
      },
    });
  }

  function carica() {
    if (!usa3D || nigiri || chiusa) return;
    whenIdle(() => {
      import('./nigiri.js')
        .then(({ createNigiri }) => {
          if (!chiusa) monta(createNigiri);
        })
        .catch(mostraFoto);
    });
  }

  if (import.meta.hot) import.meta.hot.dispose(() => nigiri?.dispose());

  return {
    carica,
    chiudi() {
      chiusa = true;
      nigiri?.dispose();
    },
  };
}
