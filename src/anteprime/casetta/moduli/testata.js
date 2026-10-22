import { apri, prepara } from './dialoghi.js';

/* La testata: un filo e un'ombra appena la pagina scorre; su mobile il
   menu a tutto schermo su <dialog>. */
export function initTestata() {
  const testata = document.querySelector('[data-testata]');
  const menu = document.querySelector('[data-menu-mobile]');
  const bottone = document.querySelector('[data-menu-apri]');
  if (!testata) return;

  let atteso = false;
  const aggiorna = () => {
    atteso = false;
    testata.classList.toggle('is-staccata', window.scrollY > 8);
  };
  window.addEventListener('scroll', () => {
    if (!atteso) { atteso = true; requestAnimationFrame(aggiorna); }
  }, { passive: true });
  requestAnimationFrame(aggiorna);

  if (!menu || !bottone) return;
  prepara(menu, { chiudiFuori: false });
  bottone.addEventListener('click', () => {
    apri(menu, bottone);
    bottone.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('[data-menu-chiudi]').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => bottone.setAttribute('aria-expanded', 'false'));
  // un link verso un'ancora della stessa pagina chiude il menu
  menu.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) menu.close(); });
  // passando a desktop il menu mobile non ha più senso
  window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => { if (e.matches && menu.open) menu.close(); });
}
