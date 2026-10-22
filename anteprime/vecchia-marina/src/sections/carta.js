import { PESCATO, chiusoTuttoIlGiorno } from '../dati.js';

const giorno = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

/* Il prossimo giorno di apertura a partire da `data` (esclusa). */
function prossimaApertura(data) {
  const d = new Date(data);
  for (let i = 0; i < 7; i++) {
    d.setDate(d.getDate() + 1);
    if (!chiusoTuttoIlGiorno(d.getDay())) return d;
  }
  return null;
}

/* Il pescato del giorno, da dati.js. Nei giorni di chiusura la lavagna lo
   dice, e indica quando riapre il banco. */
function initPescato() {
  const box = document.querySelector('[data-pescato]');
  const lista = box.querySelector('[data-pescato-lista]');
  const data = PESCATO.aggiornato ? new Date(`${PESCATO.aggiornato}T08:00:00`) : new Date();
  const etichetta = box.querySelector('[data-pescato-data]');
  const nota = box.querySelector('[data-pescato-nota]');

  etichetta.textContent = giorno.format(data);
  nota.textContent = PESCATO.nota;
  if (!PESCATO.aggiornato && chiusoTuttoIlGiorno(data.getDay())) {
    const riapre = prossimaApertura(data);
    etichetta.textContent = `${giorno.format(data)} · riposo`;
    if (riapre) nota.textContent = `Oggi il ristorante è chiuso. Il banco riparte ${giorno.format(riapre)}.`;
  }

  lista.replaceChildren(...PESCATO.voci.map(({ nome, nota: n }) => {
    const li = document.createElement('li');
    const a = document.createElement('span');
    a.className = 'pescato__nome';
    a.textContent = nome;
    li.append(a);
    if (n) {
      const b = document.createElement('span');
      b.className = 'pescato__provenienza';
      b.textContent = n;
      li.append(b);
    }
    return li;
  }));
}

/* L'indice delle portate segna quella che si sta leggendo; su telefono
   scorre di lato per tenerla in vista. */
function initIndice() {
  const voci = [...document.querySelectorAll('.carta__indice a')];
  const sezioni = voci.map((v) => document.querySelector(v.getAttribute('href')));
  const osservatore = new IntersectionObserver((entrate) => {
    for (const e of entrate) {
      if (!e.isIntersecting) continue;
      const i = sezioni.indexOf(e.target);
      voci.forEach((v, k) => (k === i ? v.setAttribute('aria-current', 'true') : v.removeAttribute('aria-current')));
      const nav = voci[i].closest('.carta__indice');
      if (nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: voci[i].offsetLeft - (nav.clientWidth - voci[i].offsetWidth) / 2, behavior: 'smooth' });
      }
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  sezioni.forEach((s) => s && osservatore.observe(s));
}

export function initCarta() {
  initPescato();
  initIndice();
}
