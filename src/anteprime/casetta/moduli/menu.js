import { traccia } from './analisi.js';

/* Filtri "solo vegetariani" e "solo senza glutine": nascondono i piatti che
   non vanno bene e lo dicono a voce (aria-live). Lo stato finisce
   nell'indirizzo (?veg=1&sg=1), così un link filtrato si può condividere. */
function initFiltri() {
  const box = document.querySelector('[data-filtri]');
  if (!box) return;
  box.hidden = false;
  const caselle = [...box.querySelectorAll('[data-filtro]')];
  const conto = box.querySelector('[data-filtri-conto]');
  const piatti = [...document.querySelectorAll('.piatto')];
  const sezioni = [...document.querySelectorAll('[data-sezione]')];
  const voci = new Map([...document.querySelectorAll('[data-indice-voce]')].map((v) => [v.dataset.indiceVoce, v]));

  const parametri = new URLSearchParams(location.search);
  for (const c of caselle) c.checked = parametri.get(c.dataset.filtro) === '1';

  const applica = (daUtente) => {
    const attivi = caselle.filter((c) => c.checked).map((c) => c.dataset.filtro);
    let visibili = 0;
    for (const p of piatti) {
      const ok = attivi.every((f) => p.dataset[f] === '1');
      p.hidden = !ok;
      if (ok) visibili += 1;
    }
    for (const s of sezioni) {
      let vuota;
      if ('sezioneFissa' in s.dataset) {
        // degustazioni e vini non sono piatti singoli: spariscono con i filtri
        s.hidden = attivi.length > 0;
        vuota = s.hidden;
      } else {
        vuota = !s.querySelector('.piatto:not([hidden])');
        s.querySelector('[data-vuota]').hidden = !vuota;
      }
      voci.get(s.id)?.classList.toggle('is-spenta', vuota);
    }
    conto.textContent = attivi.length ? `${visibili} ${conto.dataset.parola}` : '';

    if (daUtente) {
      const url = new URL(location.href);
      for (const c of caselle) {
        if (c.checked) url.searchParams.set(c.dataset.filtro, '1');
        else url.searchParams.delete(c.dataset.filtro);
      }
      history.replaceState(null, '', url);
      traccia('menu_filtro', { filtri: attivi.join(',') || 'nessuno' });
    }
  };
  box.addEventListener('change', () => applica(true));
  applica(false);
}

/* L'indice resta in vista e segna la sezione che si sta leggendo. */
function initIndice() {
  const indice = document.querySelector('[data-indice]');
  if (!indice || !('IntersectionObserver' in window)) return;
  const binario = indice.querySelector('ul');
  const voci = new Map([...indice.querySelectorAll('[data-indice-voce]')].map((v) => [v.dataset.indiceVoce, v]));
  let corrente = null;

  const segna = (id) => {
    if (id === corrente) return;
    corrente = id;
    for (const [chiave, v] of voci) {
      if (chiave === id) v.setAttribute('aria-current', 'true');
      else v.removeAttribute('aria-current');
    }
    const v = voci.get(id);
    const sinistra = v ? v.offsetLeft - (binario.clientWidth - v.offsetWidth) / 2 : 0;
    binario.scrollTo({ left: sinistra, behavior: 'smooth' });
  };

  const visibili = new Set();
  const primaSezione = document.querySelector('[data-sezione]');
  const osservatore = new IntersectionObserver((righe) => {
    for (const r of righe) {
      if (r.isIntersecting) visibili.add(r.target.id);
      else visibili.delete(r.target.id);
    }
    const prima = [...voci.keys()].find((id) => visibili.has(id));
    if (prima) segna(prima);
    else if (window.scrollY < primaSezione.offsetTop) segna(null);
  }, { rootMargin: '-35% 0px -55% 0px' });
  for (const s of document.querySelectorAll('[data-sezione]')) osservatore.observe(s);
}

export function initMenu() {
  initFiltri();
  initIndice();
  traccia('menu_visualizzato');
}
