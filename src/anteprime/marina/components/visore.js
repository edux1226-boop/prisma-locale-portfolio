/* Visore a tutto schermo: <dialog> nativo (focus intrappolato, Esc per
   uscire), frecce da tastiera, scorrimento col dito, focus restituito. */
export function creaVisore(finestra, voci) {
  const img = finestra.querySelector('[data-visore-img]');
  const dida = finestra.querySelector('[data-visore-dida]');
  const conto = finestra.querySelector('[data-visore-conto]');
  let indice = 0;
  let origine = null;

  const mostra = (i) => {
    indice = (i + voci.length) % voci.length;
    const v = voci[indice];
    img.src = v.src;
    img.alt = v.alt;
    dida.textContent = v.dida;
    conto.textContent = `${String(indice + 1).padStart(2, '0')} / ${String(voci.length).padStart(2, '0')}`;
  };

  finestra.querySelector('[data-visore-prec]').addEventListener('click', () => mostra(indice - 1));
  finestra.querySelector('[data-visore-succ]').addEventListener('click', () => mostra(indice + 1));
  finestra.querySelector('[data-visore-chiudi]').addEventListener('click', () => finestra.close());
  finestra.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostra(indice - 1);
    if (e.key === 'ArrowRight') mostra(indice + 1);
  });
  finestra.addEventListener('close', () => {
    document.documentElement.classList.remove('menu-aperto');
    origine?.focus();
  });

  let x0 = null;
  finestra.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  finestra.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) mostra(indice + (dx < 0 ? 1 : -1));
  });

  return {
    apri(i, da) {
      origine = da;
      mostra(i);
      finestra.showModal();
      document.documentElement.classList.add('menu-aperto');
    },
  };
}
