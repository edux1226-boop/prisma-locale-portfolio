import { preparaPala, pixelPer, quandoCambiaLarghezza } from '../disegno.js';
import { ORDINE_GUSTI } from '../pala.js';

/* Componi la pala: uno, due o tre gusti. Ogni versione si disegna una volta
   sola e poi si riusa. I gusti illustrati sono generici: i nomi veri sono
   nel menu del locale. */
const ESITI = {
  1: 'Un gusto solo, da un capo all\'altro: per chi sa già cosa vuole.',
  2: 'Due gusti, metà e metà: la misura giusta per due.',
  3: 'Tre gusti su una pala: uno a testa, se siete in tre.',
};
const DESCRIZIONI = {
  1: 'Illustrazione provvisoria: una pala con un solo gusto.',
  2: 'Illustrazione provvisoria: una pala divisa in due gusti.',
  3: 'Illustrazione provvisoria: una pala divisa in tre gusti.',
};

export function initComponi() {
  const radice = document.querySelector('[data-componi]');
  const tela = radice.querySelector('[data-componi-tela]');
  const esito = radice.querySelector('[data-componi-esito]');
  const pronte = new Map();
  let richiesta = 0;

  const versione = (n) => {
    if (!pronte.has(n)) {
      const fuori = document.createElement('canvas');
      pronte.set(n, preparaPala(fuori, {
        larghezza: pixelPer(tela.getBoundingClientRect().width || 800, 1800),
        gusti: ORDINE_GUSTI.slice(0, n),
        seme: 20 + n,
      }));
    }
    return pronte.get(n);
  };

  const mostra = async (n) => {
    const mia = ++richiesta;
    tela.classList.add('is-cambio');
    const fonte = await versione(n);
    if (mia !== richiesta) return;
    tela.width = fonte.width;
    tela.height = fonte.height;
    tela.getContext('2d').drawImage(fonte, 0, 0);
    tela.setAttribute('aria-label', DESCRIZIONI[n]);
    requestAnimationFrame(() => tela.classList.remove('is-cambio'));
  };

  const scelta = () => Number(radice.querySelector('input[name="gusti"]:checked')?.value || 3);
  radice.addEventListener('change', () => {
    const n = scelta();
    esito.textContent = ESITI[n];
    mostra(n);
  });

  const io = new IntersectionObserver(([voce]) => {
    if (!voce.isIntersecting) return;
    io.disconnect();
    mostra(scelta());
  }, { rootMargin: '100% 0px' });
  io.observe(radice);

  quandoCambiaLarghezza(() => {
    pronte.clear();
    mostra(scelta());
  });
}
