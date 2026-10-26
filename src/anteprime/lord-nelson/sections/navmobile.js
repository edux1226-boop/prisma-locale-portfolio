/* Navigazione da telefono: un dialog a tutto schermo. */
export function initNavMobile() {
  const dialog = document.querySelector('[data-navmob]');
  const apri = document.querySelector('[data-menu-apri]');
  if (!dialog || !apri || typeof dialog.showModal !== 'function') return;
  const chiudi = () => dialog.close();
  apri.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-menu-chiudi]')?.addEventListener('click', chiudi);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('a')) chiudi();
  });
  // oltre i 900 px il dialog non serve più
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => m.matches && dialog.open && dialog.close());
}
