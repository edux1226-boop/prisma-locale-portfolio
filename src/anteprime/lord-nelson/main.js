import './styles/main.css';
import { initNavMobile } from './sections/navmobile.js';

/* Composizione: l'HTML è già completo (generato dai dati). Qui si aggiunge solo comportamento.
   GSAP e Lenis si caricano soltanto se il movimento è attivo (classe `motion` messa nell'head
   quando prefers-reduced-motion non è "reduce"). */

const radice = document.documentElement;

if (!radice.classList.contains('is-scaduta')) {
  const avviaMovimento = async () => (await import('./core/movimento.js')).avviaMovimento();

  const avvia = () => {
    initNavMobile();
    if (!radice.classList.contains('motion')) return;
    /* L'hero è tutto HTML e CSS: il movimento parte a pagina caricata, quando il browser è libero. */
    const quandoLibero = () => ('requestIdleCallback' in window ? requestIdleCallback(avviaMovimento, { timeout: 2000 }) : setTimeout(avviaMovimento, 400));
    if (document.readyState === 'complete') quandoLibero();
    else window.addEventListener('load', quandoLibero, { once: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia, { once: true });
  else avvia();
}
