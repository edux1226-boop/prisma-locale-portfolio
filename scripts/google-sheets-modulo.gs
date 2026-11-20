/* Riceve gli invii del modulo contatti e li scrive su questo foglio Google.
   Istruzioni nel README, sezione "Modulo contatti → Google Fogli".

   L'indirizzo di questo script è pubblico (sta nell'HTML), quindi ogni controllo
   va fatto qui: il browser non basta. Dopo ogni modifica: Distribuisci →
   Gestisci distribuzioni → Modifica → Nuova versione. */

const ID_FOGLIO = ''; // l'ID nell'URL del foglio: docs.google.com/spreadsheets/d/<ID>/edit
const EMAIL_NOTIFICA = 'info@prismalocale.it'; // lascia '' per non ricevere email
const INTESTAZIONI = ['Data', 'Nome', 'Attività', 'Contatto', 'Servizi', 'Messaggio', 'Privacy'];

const MAX_INVII = 20;          // invii accettati...
const FINESTRA_SECONDI = 600;  // ...ogni 10 minuti (tutto il sito, non per persona)
const MIN_MILLISECONDI = 3000; // un umano non invia prima di 3 secondi dal caricamento
const MAX_MILLISECONDI = 6 * 60 * 60 * 1000; // pagina aperta da più di 6 ore: scartato
const SERVIZI_AMMESSI = ['Sito web', 'Landing page', 'Branding', 'Presenza locale', 'Automazioni', 'Non lo so ancora'];

// Toglie a capo e caratteri di controllo, taglia la lunghezza e impedisce che
// Fogli interpreti il testo come formula (valori che iniziano con = + - @).
function pulisci(valore, max) {
  const testo = String(valore || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(testo) ? "'" + testo : testo;
}

function doPost(e) {
  const p = e.parameter || {};

  // Campo trappola per i bot.
  if (p['azienda-web']) return risposta('ok');

  // Tempo di compilazione: il campo "t" lo scrive il browser al caricamento.
  const t = Number(p.t);
  const trascorso = Date.now() - t;
  if (!t || trascorso < MIN_MILLISECONDI || trascorso > MAX_MILLISECONDI) return risposta('ok');

  // Campi obbligatori e consenso: stesse regole dell'HTML, ma verificate qui.
  const nome = pulisci(p.nome, 80);
  const contatto = pulisci(p.contatto, 120);
  if (!nome || !contatto || p.privacy !== 'accettata') return risposta('ok');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Limite di frequenza condiviso: oltre la soglia l'invio viene scartato in silenzio.
    const cache = CacheService.getScriptCache();
    const fatti = Number(cache.get('invii') || 0);
    if (fatti >= MAX_INVII) return risposta('ok');
    cache.put('invii', String(fatti + 1), FINESTRA_SECONDI);

    const foglio = (ID_FOGLIO ? SpreadsheetApp.openById(ID_FOGLIO) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
    if (foglio.getLastRow() === 0) {
      foglio.appendRow(INTESTAZIONI);
      foglio.setFrozenRows(1);
    }

    const servizi = (e.parameters.servizi || []).filter((s) => SERVIZI_AMMESSI.indexOf(s) !== -1).join(', ');
    const riga = [new Date(), nome, pulisci(p.attivita, 80), contatto, servizi, pulisci(p.messaggio, 1000), 'accettata'];
    foglio.appendRow(riga);

    if (EMAIL_NOTIFICA) {
      MailApp.sendEmail(
        EMAIL_NOTIFICA,
        'Nuovo messaggio dal sito: ' + nome.slice(0, 60),
        INTESTAZIONI.map((titolo, i) => titolo + ': ' + riga[i]).join('\n')
      );
    }
  } finally {
    lock.releaseLock();
  }
  return risposta('ok');
}

function risposta(testo) {
  return ContentService.createTextOutput(testo);
}
