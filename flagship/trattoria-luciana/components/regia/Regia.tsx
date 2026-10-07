'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { impostaLenis } from './scorrimento';
import { statoMare } from '@/components/mare/stato';

/* ==========================================================================
   LA REGIA — tutto il movimento del sito, in un solo posto.

   Le sezioni sono HTML statico (server components): qui si aggiunge il
   movimento leggendo i loro attributi data-*. Ogni movimento ha una funzione:

     acqua          → l'apertura: la superficie si avvicina (pin + WebGL)
     maschera       → il territorio: il blu si apre su Roseto
     dissolvenza    → la famiglia: allora diventa oggi
     maschera       → la cucina: il mare diventa cucina, poi tavola
     righe          → i titoli accompagnano la narrazione
     parallasse     → profondità tra i piani (solo puntatore fine)
     tinte          → il fondo passa da mare a terra a tavola (solo desktop)

   Senza html.motion (movimento ridotto, JS lento) non fa nulla: il sito
   è già completo. I pin esistono solo su desktop.
   ========================================================================== */

if (typeof window !== 'undefined') {
  (window as Window & { __regia?: boolean }).__regia = true;
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const DESKTOP = '(min-width: 64em)';
const FINE = '(pointer: fine)';

function altezzaTestata() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--testata-h')) || 76;
}

/* ---------------------------------------------------------------- righe */
function righe(ambito: ParentNode) {
  const divisi: SplitText[] = [];
  ambito.querySelectorAll<HTMLElement>('[data-righe]').forEach((el) => {
    const split = SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'riga',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-diviso');
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

/* -------------------------------------------------------------- rivela */
function rivela(ambito: ParentNode) {
  const el = gsap.utils.toArray<HTMLElement>(ambito.querySelectorAll('[data-rivela]'));
  ScrollTrigger.batch(el, {
    start: 'top 90%',
    once: true,
    onEnter: (lotto) =>
      gsap.to(lotto, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
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
function apertura(ambito: ParentNode, mm: gsap.MatchMedia) {
  const hero = ambito.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const mare = hero.querySelector('[data-hero-mare]');
  const contenuto = hero.querySelectorAll('[data-hero-contenuto], [data-hero-piede]');
  const immersione = hero.querySelector('[data-hero-immersione]');

  mm.add(DESKTOP, () => {
    statoMare.avvicina = 0;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', pin: true, scrub: 0.6 },
    });
    tl.to(statoMare, { avvicina: 1, duration: 1 }, 0)
      .to(mare, { scale: 1.22, yPercent: 4, duration: 1 }, 0)
      .to(contenuto, { opacity: 0, y: -70, duration: 0.45 }, 0)
      .to(immersione, { opacity: 1, duration: 0.42 }, 0.58);
    return () => { statoMare.avvicina = 0; };
  });

  mm.add(`not all and ${DESKTOP}`, () => {
    gsap.to(contenuto, {
      yPercent: -18,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
}

/* --------------------------------------------------- 03 · il territorio */
function territorio(ambito: ParentNode, mm: gsap.MatchMedia) {
  const sez = ambito.querySelector<HTMLElement>('[data-territorio]');
  if (!sez) return;
  mm.add(DESKTOP, () => {
    sez.classList.add('is-palco');
    const palco = sez.querySelector('[data-territorio-palco]');
    const finestra = sez.querySelector('[data-territorio-finestra]');
    const immagine = sez.querySelector('[data-territorio-immagine]');
    const testa = sez.querySelectorAll('[data-territorio-palco] > div:nth-child(2) > *');
    const voci = gsap.utils.toArray<HTMLElement>(sez.querySelectorAll('[data-territorio-voce]'));
    gsap.set(voci, { opacity: 0, y: 40 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: palco, start: 'top top', end: `+=${120 + voci.length * 110}%`, pin: true, scrub: 0.8 },
    });
    // il blu si apre dalla linea dell'orizzonte
    tl.fromTo(finestra, { clipPath: 'inset(47% 8% 47% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power2.inOut' }, 0)
      .fromTo(immagine, { scale: 1.3 }, { scale: 1.06, duration: 1.4, ease: 'power2.out' }, 0)
      .from(testa, { opacity: 0, y: 30, stagger: 0.1, duration: 0.5 }, 0.7);
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
  });
}

/* --------------------------------------------- 04 · allora e oggi */
function dissolvenze(ambito: ParentNode) {
  ambito.querySelectorAll<HTMLElement>('[data-dissolvenza]').forEach((fig) => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: fig, start: 'top 65%', end: 'bottom 45%', scrub: true },
    });
    tl.to(fig.querySelector('[data-dissolvenza-allora]'), { opacity: 0, duration: 1 }, 0)
      .to(fig.querySelector('[data-dissolvenza-allora-testo]'), { opacity: 0.35, duration: 1 }, 0)
      .to(fig.querySelector('[data-dissolvenza-oggi-testo]'), { opacity: 1, duration: 1 }, 0);
  });
}

/* --------------------------------------------- 05 · dal pescato alla tavola */
function cucina(ambito: ParentNode, mm: gsap.MatchMedia) {
  const sez = ambito.querySelector<HTMLElement>('[data-cucina]');
  if (!sez) return;
  mm.add(DESKTOP, () => {
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
  });
}

/* ---------------------------------------------------------- parallasse */
function parallasse(ambito: ParentNode, mm: gsap.MatchMedia) {
  mm.add(`${DESKTOP} and ${FINE}`, () => {
    ambito.querySelectorAll<HTMLElement>('[data-parallasse]').forEach((el) => {
      const v = parseFloat(el.dataset.parallasse ?? '0.1');
      gsap.fromTo(el, { yPercent: -v * 50 }, {
        yPercent: v * 50,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });
}

/* --------------------------------------------- transizioni cromatiche */
function tinte(mm: gsap.MatchMedia) {
  mm.add(DESKTOP, () => {
    const sezioni = gsap.utils.toArray<HTMLElement>('main [data-tono], footer[data-tono]');
    if (sezioni.length < 2) return;
    const r = document.documentElement;
    const colore = (el: HTMLElement) => getComputedStyle(r).getPropertyValue(`--${el.dataset.tono}`).trim();
    const fondale = document.createElement('div');
    fondale.className = 'fondale';
    fondale.setAttribute('aria-hidden', 'true');
    document.body.prepend(fondale);
    fondale.style.backgroundColor = colore(sezioni[0]);
    r.classList.add('tinte');
    sezioni.forEach((sez, i) => {
      if (i === 0) return;
      const da = colore(sezioni[i - 1]);
      const a = colore(sez);
      if (da === a) return;
      gsap.fromTo(fondale, { backgroundColor: da }, {
        backgroundColor: a,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: sez, start: 'top 70%', end: 'top 30%', scrub: true },
      });
    });
    return () => { r.classList.remove('tinte'); fondale.remove(); };
  });
}

/* ------------------------------------------- indice del menu: dove sono */
function indiceMenu(ambito: ParentNode) {
  const indice = ambito.querySelector('[data-indice-menu]');
  if (!indice) return;
  const link = [...indice.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const io = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (!v.isIntersecting) return;
      link.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${v.target.id}`)));
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  link.forEach((a) => { const t = document.getElementById(a.hash.slice(1)); if (t) io.observe(t); });
  return () => io.disconnect();
}

export function Regia() {
  const pathname = usePathname();

  // lo scorrimento morbido: una volta sola, solo con puntatore fine
  useEffect(() => {
    const r = document.documentElement;
    if (!r.classList.contains('motion') || !window.matchMedia(FINE).matches) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.11, anchors: { offset: -altezzaTestata() } });
    const tic = (t: number) => lenis.raf(t * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tic);
    gsap.ticker.lagSmoothing(0);
    impostaLenis(lenis);
    return () => { gsap.ticker.remove(tic); lenis.destroy(); impostaLenis(null); };
  }, []);

  // le scene: si ricostruiscono a ogni pagina
  useEffect(() => {
    const r = document.documentElement;
    const main = document.querySelector('main');
    if (!main) return;
    const pulizie: (() => void)[] = [];
    const fine = indiceMenu(main);
    if (fine) pulizie.push(fine);
    if (!r.classList.contains('motion')) return () => pulizie.forEach((f) => f());

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // prima i pin (aggiungono spazio di scorrimento), poi tutto ciò che si
      // misura sulla pagina: così le posizioni tengono conto dei pin
      apertura(main, mm);
      territorio(main, mm);
      cucina(main, mm);
      tinte(mm);
      dissolvenze(main);
      parallasse(main, mm);
      tracce(main);
      pulizie.push(righe(document));
      rivela(document);
    });

    let attesa = 0;
    const aggiorna = () => { cancelAnimationFrame(attesa); attesa = requestAnimationFrame(() => ScrollTrigger.refresh()); };
    document.fonts?.ready.then(aggiorna);
    window.addEventListener('load', aggiorna, { once: true });

    return () => {
      cancelAnimationFrame(attesa);
      window.removeEventListener('load', aggiorna);
      pulizie.forEach((f) => f());
      mm.revert();
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
