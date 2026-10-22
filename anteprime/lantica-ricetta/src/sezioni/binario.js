import { gsap } from '/src/js/core/motion.js';
import { preparaPala, pixelPer, quandoCambiaLarghezza } from '../disegno.js';

/* La pala vista da vicino: la camera parte stretta sul primo gusto, la
   percorre gusto dopo gusto e alla fine si allarga sulla pala intera.
   Ogni tratto ha la sua didascalia. */
const CENTRI = [1 / 6, 1 / 2, 5 / 6];

export function initBinario({ movimento }) {
  const sezione = document.querySelector('[data-pala]');
  const finestra = sezione.querySelector('[data-pala-finestra]');
  const binario = sezione.querySelector('[data-pala-binario]');
  const tela = sezione.querySelector('[data-pala-tela]');
  const didascalie = [...sezione.querySelectorAll('[data-didascalia]')];

  if (movimento) sezione.classList.add('is-binario');

  // la tela ingrandita deve restare nitida: si disegna più larga del box
  const disegna = () => preparaPala(tela, {
    larghezza: pixelPer(binario.getBoundingClientRect().width * (movimento ? 1.8 : 1), 3600),
    seme: 11,
  });
  const io = new IntersectionObserver(([voce]) => {
    if (!voce.isIntersecting) return;
    io.disconnect();
    disegna();
  }, { rootMargin: '100% 0px' });
  io.observe(sezione);
  quandoCambiaLarghezza(disegna);

  if (!movimento) return;

  let attiva = -1;
  const mostra = (i) => {
    if (i === attiva) return;
    attiva = i;
    didascalie.forEach((d, k) => d.classList.toggle('is-attiva', k === i));
  };
  mostra(0);

  // ingrandimento: quanto basta a riempire la finestra in altezza, almeno 2.4
  const zoom = () => {
    const alto = binario.offsetHeight || 1;
    return gsap.utils.clamp(2.4, 3.6, finestra.clientHeight / alto);
  };
  const xPer = (centro) => () => {
    const w = binario.offsetWidth;
    const z = zoom();
    return gsap.utils.clamp(-(w * z - w), 0, -(centro * w * z - w / 2));
  };

  // la didascalia segue la timeline (che con lo scrub arriva in ritardo),
  // non la posizione dello scroll
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    onUpdate() {
      const t = tl.time();
      const i = t < tl.labels.secondo ? 0 : t < tl.labels.terzo ? 1 : t < tl.labels.intera ? 2 : 3;
      mostra(i);
    },
    scrollTrigger: {
      trigger: sezione,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });
  tl.fromTo(binario, { scale: zoom, x: xPer(CENTRI[0]) }, { scale: zoom, x: xPer(CENTRI[0]), duration: 0.4 })
    .addLabel('secondo', '+=0.15')
    .to(binario, { x: xPer(CENTRI[1]), duration: 1 }, 'secondo-=0.15')
    .addLabel('terzo', '+=0.15')
    .to(binario, { x: xPer(CENTRI[2]), duration: 1 }, 'terzo-=0.15')
    .addLabel('intera', '+=0.3')
    .to(binario, { scale: 1, x: 0, duration: 1.3, ease: 'power3.inOut' }, 'intera-=0.3')
    .to({}, { duration: 0.5 });
}
