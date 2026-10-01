/* Motore del movimento: GSAP + ScrollTrigger + SplitText, e Lenis collegato
   al ticker di GSAP. Un solo requestAnimationFrame guida lo scroll: quello
   di GSAP, che a ogni tick fa avanzare Lenis, che a sua volta aggiorna
   ScrollTrigger. Nessun'altra fonte di verità per la posizione. */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 1 });
// Il refresh dopo il "load" lo facciamo noi, una volta sola, quando sono
// pronti anche i caratteri (vedi refreshWhenAssetsLoad).
ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize' });

export { gsap, ScrollTrigger, SplitText };

export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 64em)',
  finePointer: '(hover: hover) and (pointer: fine)',
  storyRow: '(min-width: 48em) and (min-aspect-ratio: 1/1)',
};

export const prefersReducedMotion = () => window.matchMedia(MQ.reduce).matches;

let lenis = null;
const onTick = (time) => lenis?.raf(time * 1000);

export function startSmoothScroll() {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopSmoothScroll() {
  if (!lenis) return;
  gsap.ticker.remove(onTick);
  lenis.destroy();
  lenis = null;
  gsap.ticker.lagSmoothing(500, 33);
}

export function lockScroll(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/* Scorre fino a un elemento: con Lenis quando c'è, nativo altrimenti. */
export function scrollToTarget(target, onComplete) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.3, onComplete });
    return;
  }
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  onComplete?.();
}

/* ScrollTrigger misura il layout: lo rimisura una volta quando sono arrivati
   caratteri e immagini. Le immagini caricate dopo (lazy) hanno width e
   height nel markup, quindi non spostano nulla: si ricalcola solo se
   l'altezza del documento è davvero cambiata. */
export function refreshWhenAssetsLoad() {
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  Promise.all([document.fonts?.ready, loaded]).then(() => ScrollTrigger.refresh());

  let height = 0;
  let timer = 0;
  const check = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const next = document.documentElement.scrollHeight;
      if (height && next !== height) ScrollTrigger.refresh();
      height = next;
    }, 200);
  };
  ScrollTrigger.addEventListener('refresh', () => { height = document.documentElement.scrollHeight; });
  for (const img of document.querySelectorAll('img[loading="lazy"]')) {
    if (!img.complete) img.addEventListener('load', check, { once: true });
  }
}

/* Esegue un lavoro quando il browser è libero, senza allungare i task
   del primo caricamento. */
export function whenIdle(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(() => fn(), { timeout: 800 });
  else setTimeout(fn, 60);
}
