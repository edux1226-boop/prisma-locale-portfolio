import { SEDI, ORDINE_SEDI, SEDE_PREDEFINITA, DELIVEROO_ROSETO, linkIndicazioni, linkTel } from '../data/sedi.js';

/* Sede attiva: una sola scelta per tutto il sito (hero, bottoni, mappa, schede).
   Si ricorda in localStorage; l'accesso è sempre in try/catch perché può mancare o lanciare. */

const CHIAVE = 'morsi-sede';
const leggi = () => {
  try {
    const v = localStorage.getItem(CHIAVE);
    return SEDI[v] ? v : null;
  } catch {
    return null;
  }
};
const salva = (id) => {
  try {
    localStorage.setItem(CHIAVE, id);
  } catch {
    /* modalità privata o dati bloccati: la scelta vale solo per questa visita */
  }
};

const $$ = (sel) => [...document.querySelectorAll(sel)];

const TESTI = {
  etichetta: (s) => s.etichetta,
  nome: (s) => s.nome,
  via: (s) => s.via,
  'orari-breve': (s) => s.orari.breve,
  chiusura: (s) => s.chiusura,
};

function applica(id, { annuncia = false } = {}) {
  const s = SEDI[id];
  if (!s) return;
  document.documentElement.dataset.sede = id;

  for (const el of $$('[data-sede-campo]')) {
    const f = TESTI[el.dataset.sedeCampo];
    if (f) el.textContent = f(s);
  }

  // chip "da confermare" che dipendono dalla sede
  const dc = { via: s.viaDaConfermare, orari: s.orari.daConfermare, tel: s.telDaConfermare };
  for (const el of $$('[data-sede-dc]')) el.hidden = !dc[el.dataset.sedeDc];

  for (const a of $$('[data-sede-href="deliveroo"]')) a.href = s.deliveroo || DELIVEROO_ROSETO;
  for (const el of $$('[data-sede-deliveroo-nota]')) el.hidden = Boolean(s.deliveroo);
  for (const a of $$('[data-sede-href="indicazioni"]')) a.href = linkIndicazioni(s);
  const tel = linkTel(s);
  for (const a of $$('[data-sede-href="tel"]')) {
    if (tel) {
      a.href = tel;
      a.removeAttribute('aria-disabled');
    } else {
      a.removeAttribute('href'); // numero di Roseto da confermare: mai quello di Pineto
      a.setAttribute('aria-disabled', 'true');
    }
  }

  for (const b of $$('[data-sede-scegli]')) {
    const on = b.dataset.sedeScegli === id;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  }
  for (const el of $$('[data-scheda-sede]')) el.classList.toggle('is-attiva', el.dataset.schedaSede === id);
  for (const el of $$('[data-pin]')) el.classList.toggle('is-attiva', el.dataset.pin === id);

  if (annuncia) {
    const r = document.querySelector('[data-annuncio]');
    if (r) r.textContent = `Sede selezionata: ${s.nome}`;
  }
  document.dispatchEvent(new CustomEvent('sede:cambia', { detail: { id } }));
}

export function initSede() {
  const iniziale = leggi() || SEDE_PREDEFINITA;
  if (iniziale !== SEDE_PREDEFINITA) applica(iniziale);
  else document.documentElement.dataset.sede = iniziale;

  const gruppo = document.querySelector('[data-sede-selettore]');
  if (!gruppo) return;
  const scegli = (id, focus = false) => {
    salva(id);
    applica(id, { annuncia: true });
    if (focus) gruppo.querySelector(`[data-sede-scegli="${id}"]`)?.focus();
  };
  gruppo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sede-scegli]');
    if (b) scegli(b.dataset.sedeScegli);
  });
  gruppo.addEventListener('keydown', (e) => {
    const corrente = ORDINE_SEDI.indexOf(document.documentElement.dataset.sede);
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!passo) return;
    e.preventDefault();
    scegli(ORDINE_SEDI[(corrente + passo + ORDINE_SEDI.length) % ORDINE_SEDI.length], true);
  });
}
