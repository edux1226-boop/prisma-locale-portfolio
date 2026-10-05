/* ==========================================================================
   VECCHIA MARINA — i contenuti che cambiano spesso.
   È l'unico file da toccare per il pescato del giorno, gli orari e i numeri
   delle recensioni. Tutto ciò che è marcato PLACEHOLDER o DA CONFERMARE
   va verificato con il ristorante prima della pubblicazione.
   ========================================================================== */

/* Recensioni: valori di riferimento forniti per la demo (TripAdvisor). */
export const RECENSIONI = {
  voto: 4.3,
  numero: 996,
  fonte: 'TripAdvisor',
  link: 'https://www.tripadvisor.it/Restaurant_Review-g194888-d2153818-Reviews-Vecchia_Marina-Roseto_Degli_Abruzzi_Province_of_Teramo_Abruzzo.html',
};

/* Il pescato del giorno. Nel sito definitivo si aggiorna dal telefono
   (un piccolo pannello o un foglio condiviso); qui è una lista d'esempio.
   PLACEHOLDER: le specie sono quelle dei piatti forniti, non il mercato di oggi. */
export const PESCATO = {
  aggiornato: null, // null = oggi; altrimenti una data, es. '2026-10-07'
  voci: [
    { nome: 'Scampi', nota: 'anche all\'arrabbiata' },
    { nome: 'Vongole', nota: 'in guazzetto' },
    { nome: 'Sogliole', nota: 'secondo il mercato' },
    { nome: 'Il crudo del giorno', nota: 'chiedete in sala' },
  ],
  nota: 'Il banco cambia ogni mattina: quello che non c\'è, oggi non si cucina.',
};

/* Orari e chiusure. DA CONFERMARE: l'unica fonte trovata online indica
   chiusura il lunedì, il martedì e il mercoledì a pranzo.
   `turni` riempie la tendina "Orario" del modulo di prenotazione;
   `chiusure` (0 = domenica … 6 = sabato) dice quali turni non ci sono. */
export const ORARI = {
  avvisi: [
    { titolo: 'Orari', testo: 'Pranzo e cena', conferma: true },
    { titolo: 'Giorni di chiusura', testo: 'Lunedì e martedì, mercoledì a pranzo', conferma: true },
    { titolo: 'Chiusure stagionali', testo: 'Comunicate qui e sui social', conferma: true },
    { titolo: 'Fermo pesca', testo: 'Eventuali chiusure saranno indicate qui', conferma: true },
  ],
  turni: {
    Pranzo: ['12:30', '13:00', '13:30', '14:00'],
    Cena: ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
  },
  chiusure: {
    1: ['Pranzo', 'Cena'],
    2: ['Pranzo', 'Cena'],
    3: ['Pranzo'],
  },
};

/* Il turno chiuso in un dato giorno della settimana? */
export const chiuso = (giorno, turno) => (ORARI.chiusure[giorno] ?? []).includes(turno);
export const chiusoTuttoIlGiorno = (giorno) => Object.keys(ORARI.turni).every((t) => chiuso(giorno, t));
