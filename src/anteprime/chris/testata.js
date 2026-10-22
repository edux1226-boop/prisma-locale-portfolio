/* Testata: si compatta dopo poco scroll, menu mobile su <dialog> nativo
   (focus trap, Esc e ritorno del focus li gestisce il browser) e barra
   "Richiedi un appuntamento" fissa su smartphone. */
export function initTestata() {
  const testata = document.querySelector('[data-testata]');
  const menu = document.querySelector('[data-menu]');
  const apri = document.querySelector('[data-menu-apri]');
  const barra = document.querySelector('[data-barra]');

  const aggiorna = () => testata.classList.toggle('is-solida', window.scrollY > 24);
  aggiorna();
  window.addEventListener('scroll', aggiorna, { passive: true });

  if (menu && apri) {
    apri.addEventListener('click', () => {
      menu.showModal();
      apri.setAttribute('aria-expanded', 'true');
    });
    menu.addEventListener('close', () => apri.setAttribute('aria-expanded', 'false'));
    // click sullo sfondo (fuori dal pannello) o su un link: chiude
    menu.addEventListener('click', (e) => {
      if (e.target === menu || e.target.closest('a, [data-menu-chiudi]')) menu.close();
    });
    // se la finestra diventa larga il menu non serve più
    window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => {
      if (e.matches && menu.open) menu.close();
    });
  }

  // La barra compare quando l'hero è uscito dallo schermo e sparisce
  // quando il modulo è visibile.
  const hero = document.querySelector('#inizio');
  const modulo = document.querySelector('#prenota');
  if (barra && hero && modulo && 'IntersectionObserver' in window) {
    const stato = { hero: true, modulo: false };
    const mostra = () => barra.classList.toggle('is-visibile', !stato.hero && !stato.modulo);
    const osserva = (nodo, chiave) =>
      new IntersectionObserver(([voce]) => { stato[chiave] = voce.isIntersecting; mostra(); }).observe(nodo);
    osserva(hero, 'hero');
    osserva(modulo, 'modulo');
  }
}
