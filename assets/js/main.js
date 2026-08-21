import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initParallax } from './modules/parallax.js';
import { initTilt } from './modules/tilt.js';

/* Marca il documento: senza JS il contenuto resta visibile e leggibile. */
document.documentElement.classList.add('js');

const start = () => {
  initNav();
  initReveal();
  initParallax();
  initTilt();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
