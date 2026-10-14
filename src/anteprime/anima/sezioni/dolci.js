/* Nulla è ciò che sembra: il bottone rivela di cosa è fatto il dolce. */
export function initDolci() {
  for (const dolce of document.querySelectorAll('[data-illusione]')) {
    const bottone = dolce.querySelector('[data-illusione-bottone]');
    const chiuso = bottone.querySelector('[data-testo-chiuso]');
    const aperto = bottone.querySelector('[data-testo-aperto]');
    bottone.addEventListener('click', () => {
      const ora = bottone.getAttribute('aria-expanded') !== 'true';
      bottone.setAttribute('aria-expanded', String(ora));
      dolce.classList.toggle('is-aperta', ora);
      chiuso.hidden = ora;
      aperto.hidden = !ora;
    });
  }
}
