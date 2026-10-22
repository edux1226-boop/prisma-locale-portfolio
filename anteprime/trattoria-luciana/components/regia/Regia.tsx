'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/* ==========================================================================
   LA REGIA — tutto il movimento del sito, in due livelli.

   Le sezioni sono HTML statico (server components): qui si aggiunge il
   movimento leggendo i loro attributi data-*.

   1. Leggero, ovunque (questo file, nessuna libreria): le comparse con
      IntersectionObserver e transizioni CSS, la dissolvenza tra allora e
      oggi, le animazioni CSS sospese quando la loro scena è fuori schermo.
   2. Cinematografico, solo su desktop (motore.ts, caricato dinamicamente):
      GSAP, ScrollTrigger, SplitText e Lenis per l'immersione nel mare, le
      maschere del territorio e della cucina, le righe dei titoli, la
      parallasse e le transizioni cromatiche tra le scene.

   Senza html.motion (movimento ridotto, JS lento) non fa nulla: il sito
   è già completo.
   ========================================================================== */

if (typeof window !== 'undefined') {
  (window as Window & { __regia?: boolean }).__regia = true;
}

const DESKTOP = '(min-width: 64em)';
type Motore = typeof import('./motore');
let motore: Promise<Motore> | null = null;

/* -------------------------------------------- comparse (tutti i dispositivi) */
function comparse(ambito: ParentNode, anche: string) {
  const el = [...ambito.querySelectorAll<HTMLElement>(`[data-rivela]${anche}`)];
  const io = new IntersectionObserver((voci) => {
    // chi entra insieme entra in sequenza
    voci.filter((v) => v.isIntersecting).forEach((v, i) => {
      const t = v.target as HTMLElement;
      t.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
      t.classList.add('is-visto');
      io.unobserve(t);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  el.forEach((e) => io.observe(e));
  return () => io.disconnect();
}

/* ------------------------------------------ 04 · allora diventa oggi */
function dissolvenze(ambito: ParentNode) {
  const io = new IntersectionObserver((voci) => {
    voci.forEach((v) => { if (v.isIntersecting) { v.target.setAttribute('data-oggi', ''); io.unobserve(v.target); } });
  }, { threshold: 0.55 });
  ambito.querySelectorAll('[data-dissolvenza]').forEach((f) => io.observe(f));
  return () => io.disconnect();
}

/* ------------------- le animazioni CSS si fermano quando la scena non si vede */
function sospensioni(ambito: ParentNode) {
  const io = new IntersectionObserver((voci) => {
    voci.forEach((v) => v.target.toggleAttribute('data-fuori', !v.isIntersecting));
  });
  ambito.querySelectorAll(':scope > *').forEach((s) => io.observe(s));
  return () => io.disconnect();
}

/* ------------------------------------------- indice del menu: dove sono */
function indiceMenu(ambito: ParentNode) {
  const indice = ambito.querySelector('[data-indice-menu]');
  if (!indice) return () => {};
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

  // lo scorrimento morbido: una volta sola, solo su desktop
  useEffect(() => {
    const r = document.documentElement;
    if (!r.classList.contains('motion') || !window.matchMedia(DESKTOP).matches) return;
    let fine: (() => void) | null = null;
    let annullato = false;
    motore ??= import('./motore');
    motore.then((m) => { if (!annullato) fine = m.avviaScorrimento(); }).catch(() => {});
    return () => { annullato = true; fine?.(); };
  }, []);

  // le scene: si ricostruiscono a ogni pagina
  useEffect(() => {
    const r = document.documentElement;
    const main = document.querySelector<HTMLElement>('main');
    if (!main) return;
    const pulizie: (() => void)[] = [indiceMenu(main)];
    if (!r.classList.contains('motion')) return () => pulizie.forEach((f) => f());

    pulizie.push(dissolvenze(main), sospensioni(main));
    const mq = window.matchMedia(DESKTOP);
    let annullato = false;
    let scene: (() => void) | null = null;
    let leggere: (() => void) | null = null;

    // sui telefoni i titoli compaiono come il resto; su desktop li divide il motore
    const avvia = () => {
      scene?.(); scene = null;
      leggere?.(); leggere = null;
      if (!mq.matches) {
        leggere = comparse(main, ', [data-righe]');
        return;
      }
      leggere = comparse(main, '');
      motore ??= import('./motore');
      motore
        .then((m) => { if (!annullato && mq.matches) scene = m.avviaScene(main); })
        .catch(() => { if (!annullato) { leggere?.(); leggere = comparse(main, ', [data-righe]'); } });
    };
    avvia();
    mq.addEventListener('change', avvia);

    return () => {
      annullato = true;
      mq.removeEventListener('change', avvia);
      scene?.();
      leggere?.();
      pulizie.forEach((f) => f());
    };
  }, [pathname]);

  return null;
}
