/* Le tre categorie della galleria diventano schede (ARIA tabs): frecce,
   Home, Fine. Senza script restano tre sezioni una sotto l'altra.
   La scheda scelta finisce nell'indirizzo (#sala, #cucina). */
export function initSchede() {
  const galleria = document.querySelector('[data-galleria]');
  const lista = galleria?.querySelector('[data-schede]');
  if (!lista) return;
  const schede = [...lista.querySelectorAll('[role="tab"]')];
  const pannelli = schede.map((s) => document.getElementById(s.getAttribute('aria-controls')));
  lista.hidden = false;
  galleria.classList.add('is-schede');
  pannelli.forEach((p, i) => {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', schede[i].id);
    p.tabIndex = 0;
  });

  const attiva = (i, { focus = false, indirizzo = true } = {}) => {
    schede.forEach((s, k) => {
      const scelta = k === i;
      s.setAttribute('aria-selected', String(scelta));
      s.tabIndex = scelta ? 0 : -1;
      pannelli[k].hidden = !scelta;
    });
    if (focus) schede[i].focus();
    if (indirizzo) history.replaceState(null, '', `#${schede[i].dataset.scheda}`);
  };

  lista.addEventListener('click', (e) => {
    const s = e.target.closest('[role="tab"]');
    if (s) attiva(schede.indexOf(s));
  });
  lista.addEventListener('keydown', (e) => {
    const i = schede.indexOf(document.activeElement);
    if (i < 0) return;
    const vai = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: schede.length - 1 }[e.key];
    if (vai === undefined) return;
    e.preventDefault();
    attiva((vai + schede.length) % schede.length, { focus: true });
  });

  const daIndirizzo = schede.findIndex((s) => `#${s.dataset.scheda}` === location.hash);
  attiva(Math.max(0, daIndirizzo), { indirizzo: false });
}
