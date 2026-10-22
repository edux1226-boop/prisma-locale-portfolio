/* ==========================================================================
   IL MOTORE — la parte cinematografica della regia, solo su desktop.

   Caricato dinamicamente da Regia.tsx quando lo schermo è largo: sui telefoni
   GSAP, ScrollTrigger, SplitText e Lenis non vengono nemmeno scaricati.

     acqua        → l'apertura: la superficie si avvicina (pin + WebGL)
     maschera     → il territorio: il blu si apre su Roseto
     maschera     → la cucina: il mare diventa cucina, poi tavola
     righe        → i titoli salgono riga per riga
     parallasse   → profondità tra i piani (solo puntatore fine)
     tinte        → il fondo di ogni scena sfuma dal tono della precedente
   ========================================================================== */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { impostaLenis } from './scorrimento';
import { statoMare } from '@/components/mare/stato';

gsap.registerPlugin(ScrollTrigger, SplitText);

const FINE = '(pointer: fine)';

function altezzaTestata() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--testata-h')) || 76;
}

/* --------------------------------------------------------- scorrimento */
/** Lo scorrimento morbido, una volta sola per tutta la visita. */
export function avviaScorrimento(): () => void {
  if (!window.matchMedia(FINE).matches) return () => {};
  const lenis = new Lenis({ autoRaf: false, lerp: 0.11, anchors: { offset: -altezzaTestata() } });
  const tic = (t: number) => lenis.raf(t * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tic);
  gsap.ticker.lagSmoothing(0);
  impostaLenis(lenis);
  return () => { gsap.ticker.remove(tic); lenis.destroy(); impostaLenis(null); };
}

/* ---------------------------------------------------------------- righe */
const TITOLO = 'h1, h2, h3, h4, h5, h6';

function righe(ambito: ParentNode) {
  const divisi: SplitText[] = [];
  ambito.querySelectorAll<HTMLElement>('[data-righe]').forEach((el) => {
    const split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'riga',
      autoSplit: true,
      // aria-label solo sui titoli: su uno span non è ammesso, e dividere in
      // righe non spezza le parole, quindi il testo resta leggibile così com'è
      aria: el.matches(TITOLO) ? 'auto' : 'none',
      onSplit(self) {
        el.classList.add('is-diviso', 'is-visto');
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
    divisi.push(split);
  });
  return () => divisi.forEach((s) => s.revert());
}

/* ------------------------------------------------------------- traccia */
function tracce(ambito: ParentNode) {
  ambito.querySelectorAll<SVGSVGElement>('[data-traccia]').forEach((svg) => {
    svg.querySelectorAll<SVGPathElement>('path').forEach((p) => {
      const l = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: svg, start: 'top 85%', end: 'top 35%', scrub: 1 },
      });
    });
  });
}

/* ------------------------------------------------------- 01 · il mare */
function apertura(ambito: ParentNode) {
  const hero = ambito.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const mare = hero.querySelector('[data-hero-mare]');
  const contenuto = hero.querySelectorAll('[data-hero-contenuto], [data-hero-piede]');
  const immersione = hero.querySelector('[data-hero-immersione]');
  statoMare.avvicina = 0;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', pin: true, scrub: 0.6 },
  });
  tl.to(statoMare, { avvicina: 1, duration: 1 }, 0)
    .to(mare, { scale: 1.22, yPercent: 4, duration: 1 }, 0)
    .to(contenuto, { opacity: 0, y: -70, duration: 0.45 }, 0)
    .to(immersione, { opacity: 1, duration: 0.42 }, 0.58);
}

/* --------------------------------------------------- 03 · il territorio */
function territorio(ambito: ParentNode) {
  const sez = ambito.querySelector<HTMLElement>('[data-territorio]');
  if (!sez) return;
  sez.classList.add('is-palco');
  const palco = sez.querySelector('[data-territorio-palco]');
  const finestra = sez.querySelector('[data-territorio-finestra]');
  const immagine = sez.querySelector('[data-territorio-immagine]');
  // il contenitore e non i figli: i figli hanno le loro comparse CSS
  const testa = sez.querySelector('[data-territorio-testa]');
  const voci = gsap.utils.toArray<HTMLElement>(sez.querySelectorAll('[data-territorio-voce]'));
  gsap.set(voci, { opacity: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: palco, start: 'top top', end: `+=${120 + voci.length * 110}%`, pin: true, scrub: 0.8 },
  });
  // il blu si apre dalla linea dell'orizzonte
  tl.fromTo(finestra, { clipPath: 'inset(47% 8% 47% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0)
    .fromTo(immagine, { scale: 1.3 }, { scale: 1.06, duration: 1.4, ease: 'power2.out' }, 0)
    .from(testa, { opacity: 0, y: 30, duration: 0.5 }, 0.7);
  // tre parole, tre luoghi; l'inquadratura si sposta per ognuno
  const fuochi = [{ yPercent: 0, scale: 1.06 }, { yPercent: -3, scale: 1.12 }, { yPercent: 3, scale: 1.1 }];
  voci.forEach((v, i) => {
    const t = 1.4 + i * 1.1;
    tl.to(v, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, t);
    tl.to(immagine, { ...fuochi[i % fuochi.length], duration: 1, ease: 'power1.inOut' }, t - 0.2);
    if (i < voci.length - 1) tl.to(v, { opacity: 0, y: -24, duration: 0.35, ease: 'power2.in' }, t + 0.75);
  });
  tl.to({}, { duration: 0.4 });
  return () => sez.classList.remove('is-palco');
}

/* --------------------------------------------- 05 · dal pescato alla tavola */
function cucina(ambito: ParentNode) {
  const sez = ambito.querySelector<HTMLElement>('[data-cucina]');
  if (!sez) return;
  sez.classList.add('is-palco');
  const palco = sez.querySelector('[data-cucina-palco]');
  const foto = gsap.utils.toArray<HTMLElement>(sez.querySelectorAll('[data-cucina-foto]'));
  const testi = gsap.utils.toArray<HTMLElement>(sez.querySelectorAll('[data-cucina-testo]'));
  const progresso = sez.querySelector('[data-cucina-progresso]');
  gsap.set(foto.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set(testi.slice(1), { opacity: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: palco,
      start: () => `top ${altezzaTestata() + 24}`,
      end: `+=${foto.length * 85}%`,
      pin: true,
      scrub: 0.8,
    },
  });
  tl.to(progresso, { scaleX: 1, duration: foto.length }, 0);
  for (let i = 1; i < foto.length; i++) {
    const t = i - 0.5;
    tl.to(foto[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.inOut' }, t)
      .fromTo(foto[i].firstElementChild, { scale: 1.18 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, t)
      .to(testi[i - 1], { opacity: 0, y: -30, duration: 0.25 }, t)
      .to(testi[i], { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t + 0.3);
  }
  return () => sez.classList.remove('is-palco');
}

/* ---------------------------------------------------------- parallasse */
function parallasse(ambito: ParentNode) {
  if (!window.matchMedia(FINE).matches) return;
  ambito.querySelectorAll<HTMLElement>('[data-parallasse]').forEach((el) => {
    const v = parseFloat(el.dataset.parallasse ?? '0.1');
    gsap.fromTo(el, { yPercent: -v * 50 }, {
      yPercent: v * 50,
      ease: 'none',
      scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* --------------------------------------------- transizioni cromatiche */
/* Ogni scena tiene il suo fondo (contrasti sempre giusti, anche per chi
   arriva da un'ancora o misura la pagina ferma); mentre entra, il fondo
   sfuma dal tono della scena precedente al proprio. Il colore cambia nel
   margine sopra le parole: quando arriva il testo, il fondo è già il suo. */
const PAROLE = 'h1, h2, h3, h4, p, li, dt, dd, blockquote, figcaption, a, button, label, td, th';

function primoTesto(sez: HTMLElement) {
  const t = sez.querySelector(PAROLE);
  if (!t) return 0;
  return Math.min(t.getBoundingClientRect().top - sez.getBoundingClientRect().top, window.innerHeight * 0.4);
}

function tinte(ambito: ParentNode) {
  // le scene di primo livello (anche se un pin le ha avvolte), poi il piede
  const sezioni = [...ambito.querySelectorAll<HTMLElement>('[data-tono]')].filter((el) => !el.parentElement?.closest('[data-tono]'));
  const piede = document.querySelector<HTMLElement>('footer[data-tono]');
  if (piede) sezioni.push(piede);
  const r = getComputedStyle(document.documentElement);
  const colore = (el: HTMLElement) => r.getPropertyValue(`--${el.dataset.tono}`).trim();
  sezioni.forEach((sez, i) => {
    if (i === 0) return;
    const da = colore(sezioni[i - 1]);
    const a = colore(sez);
    // senza margine sopra il testo la sfumatura passerebbe sotto le parole;
    // una scena già in vista all'apertura della pagina ha subito il suo tono
    const inVista = sez.getBoundingClientRect().top + window.scrollY < window.innerHeight;
    if (!da || !a || da === a || inVista || primoTesto(sez) < 48) return;
    gsap.fromTo(sez, { backgroundColor: da }, {
      backgroundColor: a,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: sez, start: 'top bottom', end: () => `top+=${primoTesto(sez)} bottom`, scrub: true },
    });
  });
}

/** Le scene di una pagina. Restituisce la pulizia (cambio di pagina, resize oltre il desktop). */
export function avviaScene(main: HTMLElement): () => void {
  const pulizie: (() => void)[] = [];
  const ctx = gsap.context(() => {
    // prima i pin (aggiungono spazio di scorrimento), poi tutto ciò che si
    // misura sulla pagina: così le posizioni tengono conto dei pin
    apertura(main);
    const t = territorio(main);
    const c = cucina(main);
    if (t) pulizie.push(t);
    if (c) pulizie.push(c);
    tinte(main);
    parallasse(main);
    tracce(main);
    pulizie.push(righe(main));
  });

  let attesa = 0;
  const aggiorna = () => { cancelAnimationFrame(attesa); attesa = requestAnimationFrame(() => ScrollTrigger.refresh()); };
  document.fonts?.ready.then(aggiorna);
  if (document.readyState === 'complete') aggiorna();
  else window.addEventListener('load', aggiorna, { once: true });

  return () => {
    cancelAnimationFrame(attesa);
    window.removeEventListener('load', aggiorna);
    pulizie.forEach((f) => f());
    ctx.revert();
    statoMare.avvicina = 0;
  };
}
