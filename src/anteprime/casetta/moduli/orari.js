/* Nella tabella degli orari si evidenzia il giorno di oggi. */
export function initOrari() {
  for (const corpo of document.querySelectorAll('[data-orari]')) {
    const riga = corpo.querySelector(`tr[data-giorno="${new Date().getDay()}"]`);
    if (!riga) continue;
    riga.classList.add('is-oggi');
    riga.setAttribute('aria-current', 'date');
    const th = riga.querySelector('th');
    th.insertAdjacentHTML('beforeend', ' <span class="orari__oggi">oggi</span>');
  }
}
