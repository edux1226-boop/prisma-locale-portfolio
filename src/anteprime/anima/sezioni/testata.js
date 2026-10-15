/* Testata: chiara appena l'apertura esce di scena; menu del telefono su <dialog>. */
export function initTestata() {
  const testata = document.querySelector('[data-testata]');
  const apertura = document.querySelector('[data-apertura]');
  let attesa = 0;
  const controlla = () => {
    attesa = 0;
    const fine = apertura.getBoundingClientRect().bottom;
    testata.classList.toggle('is-chiara', fine <= testata.offsetHeight);
  };
  window.addEventListener('scroll', () => { if (!attesa) attesa = requestAnimationFrame(controlla); }, { passive: true });
  window.addEventListener('resize', controlla);
  attesa = requestAnimationFrame(controlla);

  const menu = document.querySelector('[data-menu]');
  const apri = document.querySelector('[data-menu-apri]');
  if (!menu || typeof menu.showModal !== 'function') return;
  apri.addEventListener('click', () => {
    menu.showModal();
    apri.setAttribute('aria-expanded', 'true');
  });
  menu.addEventListener('close', () => apri.setAttribute('aria-expanded', 'false'));
  menu.querySelector('[data-menu-chiudi]').addEventListener('click', () => menu.close());
  // un link del menu porta alla sezione: il cassetto si chiude da solo
  for (const link of menu.querySelectorAll('a[href^="#"]')) link.addEventListener('click', () => menu.close());
  // clic sullo sfondo
  menu.addEventListener('click', (e) => { if (e.target === menu) menu.close(); });
}
