/* Piccoli aiuti per i <dialog> nativi: chiusura cliccando fuori dal foglio,
   blocco dello scorrimento della pagina sotto, ritorno del focus. */

const radice = document.documentElement;
let aperti = 0;

export function apri(dialogo, origine = document.activeElement) {
  if (dialogo.open) return;
  dialogo.__origine = origine;
  dialogo.showModal();
  aperti += 1;
  radice.classList.add('dialogo-aperto');
}

export function prepara(dialogo, { chiudiFuori = true } = {}) {
  if (chiudiFuori) {
    // il clic sullo sfondo arriva al <dialog> stesso, non al foglio
    dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
  }
  dialogo.addEventListener('close', () => {
    aperti = Math.max(0, aperti - 1);
    if (!aperti) radice.classList.remove('dialogo-aperto');
    const origine = dialogo.__origine;
    if (origine && document.contains(origine)) origine.focus({ preventScroll: true });
  });
}

export const qualcunoAperto = () => Boolean(document.querySelector('dialog[open]'));
