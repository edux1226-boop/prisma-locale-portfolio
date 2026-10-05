/* Prenotazione su WhatsApp: persone, giorno e ora compongono il messaggio
   ("Ciao, vorrei prenotare un tavolo per 4 persone sabato 12 ottobre alle
   20:30.") e il link wa.me. Gli orari proposti sono quelli del giorno scelto;
   il giorno di chiusura viene segnalato e il link si spegne. */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function initWhatsapp() {
  const modulo = document.querySelector('[data-wa]');
  if (!modulo) return;
  const persone = modulo.querySelector('[data-wa-persone]');
  const data = modulo.querySelector('[data-wa-data]');
  const ora = modulo.querySelector('[data-wa-ora]');
  const avviso = modulo.querySelector('[data-wa-avviso]');
  const testo = modulo.querySelector('[data-wa-testo]');
  const link = modulo.querySelector('[data-wa-link]');
  const orari = JSON.parse(modulo.dataset.orari);
  const { modello, modelloVuoto, chiuso, piu, numero } = modulo.dataset;

  const oggi = new Date();
  data.min = iso(oggi);
  data.max = iso(new Date(oggi.getFullYear(), oggi.getMonth() + 3, oggi.getDate()));

  const proponiOre = (ore) => {
    const scelta = ora.value;
    ora.replaceChildren(new Option('—', ''), ...ore.map((o) => new Option(o, o)));
    if (ore.includes(scelta)) ora.value = scelta;
    ora.disabled = ore.length === 0;
  };

  let spento = false;
  const aggiorna = () => {
    const n = Number(persone.value);
    const chi = n > 10 ? 'più di 10 persone' : `${n} ${n === 1 ? 'persona' : 'persone'}`;
    const problemi = [];
    let messaggio;
    spento = false;
    if (data.value) {
      const giorno = new Date(`${data.value}T12:00`);
      const regole = orari[(giorno.getDay() + 6) % 7];
      proponiOre(regole.ore);
      if (!regole.ore.length) {
        problemi.push(chiuso.replace('{giorno}', regole.nome));
        spento = true;
      }
      const quando = giorno.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      messaggio = modello.replace('{persone}', chi).replace('{data}', quando);
      messaggio = ora.value ? messaggio.replace('{ora}', ora.value) : messaggio.replace(/\s*alle \{ora\}/, '');
    } else {
      proponiOre([...new Set(orari.flatMap((g) => g.ore))].sort());
      messaggio = modelloVuoto.replace('{persone}', chi);
    }
    if (n > 10) problemi.push(piu);
    avviso.textContent = problemi.join(' ');
    testo.textContent = messaggio;
    link.href = `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`;
    link.classList.toggle('is-spento', spento);
    if (spento) link.setAttribute('aria-disabled', 'true');
    else link.removeAttribute('aria-disabled');
  };

  link.addEventListener('click', (e) => { if (spento) e.preventDefault(); });
  modulo.addEventListener('change', aggiorna);
  modulo.addEventListener('input', aggiorna);
  modulo.addEventListener('submit', (e) => e.preventDefault());
  aggiorna();
}
