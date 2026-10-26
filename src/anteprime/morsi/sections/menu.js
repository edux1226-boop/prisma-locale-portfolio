/* Filtri a schede del menu (tablist accessibile). Senza JavaScript tutte le sezioni restano visibili. */
export function initMenu() {
  const lista = document.querySelector('[data-schede]');
  if (!lista) return;
  const schede = [...lista.querySelectorAll('[role="tab"]')];
  const pannelli = [...document.querySelectorAll('[data-pannello]')];

  const mostra = (id, { focus = false, scorri = false } = {}) => {
    for (const s of schede) {
      const on = s.dataset.scheda === id;
      s.setAttribute('aria-selected', String(on));
      s.tabIndex = on ? 0 : -1;
      if (on) {
        if (focus) s.focus();
        if (scorri) s.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
    }
    for (const p of pannelli) p.hidden = p.dataset.pannello !== id;
  };

  mostra(schede[0].dataset.scheda);

  lista.addEventListener('click', (e) => {
    const s = e.target.closest('[role="tab"]');
    if (s) mostra(s.dataset.scheda, { scorri: true });
  });
  lista.addEventListener('keydown', (e) => {
    const i = schede.indexOf(document.activeElement);
    if (i < 0) return;
    const prossimo = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: schede.length - 1 }[e.key];
    if (prossimo === undefined) return;
    e.preventDefault();
    mostra(schede[(prossimo + schede.length) % schede.length].dataset.scheda, { focus: true, scorri: true });
  });
}
