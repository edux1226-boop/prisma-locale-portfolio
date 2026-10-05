import { ORARI, chiuso, chiusoTuttoIlGiorno } from '../dati.js';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nomiGiorni = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const giornoDi = (valore) => new Date(`${valore}T12:00:00`).getDay();

/* "Prima di venire": orari e chiusure da dati.js. */
function initAvvisi() {
  const lista = document.querySelector('[data-avvisi]');
  lista.replaceChildren(...ORARI.avvisi.map(({ titolo, testo, conferma }) => {
    const riga = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = titolo;
    const dd = document.createElement('dd');
    dd.textContent = testo;
    if (conferma) {
      const dc = document.createElement('span');
      dc.className = 'dc';
      dc.textContent = 'da confermare';
      dd.append(dc);
    }
    riga.append(dt, dd);
    return riga;
  }));
}

/* Il modulo: controlli in italiano, accessibili, nessun invio nella demo.
   Una richiesta, non una conferma: il ristorante richiama. */
export function initPrenota() {
  initAvvisi();
  const modulo = document.querySelector('[data-modulo]');
  const data = modulo.querySelector('[data-data]');
  const orari = modulo.querySelector('[data-orari]');
  const grazie = modulo.querySelector('[data-modulo-grazie]');
  const msgData = document.getElementById('e-data');
  const msgOra = document.getElementById('e-ora');
  const testoData = msgData.textContent;
  const testoOra = msgOra.textContent;

  data.min = iso(new Date());
  const vuota = new Option('—', '', true, true);
  vuota.disabled = true;
  orari.append(vuota);
  for (const [turno, ore] of Object.entries(ORARI.turni)) {
    const gruppo = document.createElement('optgroup');
    gruppo.label = turno;
    gruppo.dataset.turno = turno;
    ore.forEach((o) => gruppo.append(new Option(o, `${turno} ${o}`)));
    orari.append(gruppo);
  }

  // scelta la data, i turni chiusi quel giorno non si possono scegliere
  const aggiornaTurni = () => {
    const g = data.value ? giornoDi(data.value) : -1;
    for (const gruppo of orari.querySelectorAll('optgroup')) gruppo.disabled = g >= 0 && chiuso(g, gruppo.dataset.turno);
    if (orari.selectedOptions[0]?.parentElement.disabled) orari.value = '';
  };
  data.addEventListener('change', aggiornaTurni);

  const campo = (el) => el.closest('.campo');
  const errore = (el, si) => {
    campo(el).classList.toggle('is-errato', si);
    el.setAttribute('aria-invalid', si ? 'true' : 'false');
  };

  const verifica = (el) => {
    let male = false;
    if (el === data) {
      const g = data.value ? giornoDi(data.value) : -1;
      const riposo = g >= 0 && chiusoTuttoIlGiorno(g);
      male = !data.value || data.value < data.min || riposo;
      msgData.textContent = riposo ? `Di ${nomiGiorni[g]} il ristorante è chiuso.` : testoData;
    } else if (el === orari) {
      const turno = orari.value.split(' ')[0];
      const g = data.value ? giornoDi(data.value) : -1;
      const riposo = g >= 0 && turno && chiuso(g, turno);
      male = !orari.value || riposo;
      msgOra.textContent = riposo ? `Di ${nomiGiorni[g]} a ${turno.toLowerCase()} il ristorante è chiuso.` : testoOra;
    } else if (el.type === 'email') {
      male = el.value.trim() !== '' && !el.validity.valid;
    } else if (el.type === 'tel') {
      male = el.value.replace(/\D/g, '').length < 6;
    } else if (el.required) {
      male = !el.value.trim();
    }
    errore(el, male);
    return !male;
  };

  const controllati = [...modulo.querySelectorAll('input[required], select[required], input[type="email"]')];
  controllati.forEach((el) => {
    el.addEventListener('blur', () => { if (el.value) verifica(el); });
    el.addEventListener('change', () => { if (campo(el).classList.contains('is-errato') || el === data) verifica(el); });
  });

  modulo.addEventListener('submit', (e) => {
    e.preventDefault();
    const sbagliati = controllati.filter((el) => !verifica(el));
    if (sbagliati.length) {
      sbagliati[0].focus();
      return;
    }
    const nome = modulo.querySelector('#f-nome').value.trim().split(/\s+/)[0];
    modulo.querySelector('[data-modulo-nome]').textContent = nome;
    modulo.classList.add('is-inviato');
    grazie.focus();
  });
}
