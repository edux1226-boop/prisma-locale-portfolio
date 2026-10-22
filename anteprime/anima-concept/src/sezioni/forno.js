/* Regia del panetto 3D. Il canvas è fisso dietro l'apertura e gli impasti;
   la sezione "Il nome", in mezzo, ci passa sopra come una tenda.
   La tappa (0 panetto → 6 senza glutine) segue la posizione dei pannelli
   degli impasti rispetto al centro dello schermo.

   Solo su desktop con puntatore fine, movimento consentito e WebGL 2.
   Altrove, o se qualcosa va storto, restano i fotogrammi della stessa scena. */

const MQ_3D = '(min-width: 64em) and (hover: hover) and (pointer: fine)';
const root = document.documentElement;

function haWebGL2() {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

export function puoUsare3D() {
  if (!root.classList.contains('motion')) return false;
  if (!window.matchMedia(MQ_3D).matches) return false;
  if (navigator.connection?.saveData) return false;
  return haWebGL2();
}

export function initForno() {
  const host = document.querySelector('[data-forno]');
  const apertura = document.querySelector('[data-apertura]');
  const impasti = document.querySelector('[data-impasti]');
  const pannelli = [...impasti.querySelectorAll('[data-tappa]')];
  let scena = null;
  let chiusa = false;
  const vista = { apertura: false, impasti: false };

  const ripiego = () => {
    scena?.dispose();
    scena = null;
    root.classList.remove('con-3d', 'ha-forno');
  };

  /* La tappa: interpolata fra i centri dei pannelli. */
  function tappaCorrente() {
    const cy = window.innerHeight / 2;
    const centri = pannelli.map((p) => {
      const r = p.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    if (cy <= centri[0]) return 0;
    for (let i = 0; i < centri.length - 1; i++) {
      if (cy <= centri[i + 1]) {
        const t = (cy - centri[i]) / (centri[i + 1] - centri[i]);
        return Number(pannelli[i].dataset.tappa) + t * (Number(pannelli[i + 1].dataset.tappa) - Number(pannelli[i].dataset.tappa));
      }
    }
    return Number(pannelli[pannelli.length - 1].dataset.tappa);
  }

  let richiesta = 0;
  function aggiorna() {
    richiesta = 0;
    if (!scena) return;
    if (vista.impasti && !vista.apertura) {
      scena.setTappa(tappaCorrente());
      scena.setAria(0.35);
    } else {
      scena.setTappa(0);
      scena.setAria(1);
    }
  }
  const pianifica = () => {
    if (!richiesta) richiesta = requestAnimationFrame(aggiorna);
  };

  const osserva = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (v.target === apertura) vista.apertura = v.isIntersecting;
      if (v.target === impasti) vista.impasti = v.isIntersecting;
    }
    scena?.setAttiva(vista.apertura || vista.impasti);
    pianifica();
  });

  function monta(createImpasto) {
    root.classList.add('ha-forno');
    scena = createImpasto(host, {
      dpr: 1.75,
      onReady() {
        if (chiusa) return;
        root.classList.add('con-3d');
        scena.setInquadratura(0.7);
        osserva.observe(apertura);
        osserva.observe(impasti);
        aggiorna();
      },
      onFail: ripiego,
      onLost: ripiego,
    });
  }

  window.addEventListener('scroll', pianifica, { passive: true });
  window.addEventListener('resize', pianifica);
  window.addEventListener('pointermove', (e) => {
    scena?.setPuntatore((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  const carica = () => {
    import('../three/impasto.js')
      .then(({ createImpasto }) => {
        if (!chiusa) monta(createImpasto);
      })
      .catch(ripiego);
  };
  // dopo il primo disegno della pagina: l'apertura si vede subito con il suo fotogramma
  if ('requestIdleCallback' in window) requestIdleCallback(carica, { timeout: 1500 });
  else setTimeout(carica, 300);

  // se la finestra diventa stretta o il puntatore cambia, si torna alle immagini
  window.matchMedia(MQ_3D).addEventListener('change', (e) => {
    if (!e.matches) {
      chiusa = true;
      ripiego();
    }
  });

  if (import.meta.hot) import.meta.hot.dispose(() => scena?.dispose());
}
