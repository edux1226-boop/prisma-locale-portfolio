/* "Aperti ora": l'ora di Roseto, non quella del telefono di chi guarda.
   Orari dichiarati dal locale: tutte le sere 19–23. Il lunedì è incerto
   (alcune schede lo danno chiuso), quindi il lunedì non promettiamo nulla. */
const APRE = 19 * 60;
const CHIUDE = 23 * 60;

function oraDiRoseto() {
  const parti = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const v = Object.fromEntries(parti.map((p) => [p.type, p.value]));
  const giorno = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(v.weekday);
  return { giorno, minuti: Number(v.hour) * 60 + Number(v.minute) };
}

function stato() {
  const { giorno, minuti } = oraDiRoseto();
  if (giorno === 1) {
    return { aperto: false, breve: 'Lunedì: chiama per conferma', esteso: `Oggi è lunedì: l'apertura è da confermare, meglio una telefonata.`, giorno };
  }
  if (minuti >= APRE && minuti < CHIUDE) {
    const manca = CHIUDE - minuti;
    const coda = manca <= 45 ? `, chiude tra ${manca} minuti` : ' fino alle 23:00';
    return { aperto: true, breve: `Aperti ora${coda}`, esteso: `Aperti ora${coda}.`, giorno };
  }
  if (minuti < APRE) {
    return { aperto: false, breve: 'Stasera dalle 19:00', esteso: 'Chiuso ora. Stasera si accende il forno alle 19:00.', giorno };
  }
  const domani = (giorno + 1) % 7;
  const quando = domani === 1 ? 'Domani è lunedì: apertura da confermare.' : 'Domani dalle 19:00.';
  return { aperto: false, breve: 'Chiuso · domani dalle 19:00', esteso: `Chiuso per stasera. ${quando}`, giorno };
}

export function initOrari() {
  const breve = document.querySelector('[data-stato]');
  const esteso = document.querySelector('[data-stato-esteso]');
  const righe = document.querySelectorAll('[data-orari] tr');
  const aggiorna = () => {
    const s = stato();
    breve.textContent = s.breve;
    breve.classList.toggle('is-aperto', s.aperto);
    esteso.textContent = s.esteso;
    esteso.classList.toggle('is-aperto', s.aperto);
    righe.forEach((r) => r.classList.toggle('is-oggi', Number(r.dataset.giorno) === s.giorno));
  };
  aggiorna();
  setInterval(aggiorna, 60_000);
}
