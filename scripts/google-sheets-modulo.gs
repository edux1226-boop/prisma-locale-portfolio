/* Riceve gli invii del modulo contatti e li scrive su questo foglio Google.
   Istruzioni nel README, sezione "Modulo contatti → Google Fogli".
   L'endpoint è pubblico per forza: per questo i dati vengono ricontrollati qui,
   senza fidarsi del browser. */

const ID_FOGLIO = ''; // l'ID nell'URL del foglio: docs.google.com/spreadsheets/d/<ID>/edit
const EMAIL_NOTIFICA = 'info@prismalocale.it'; // lascia '' per non ricevere email
const INTESTAZIONI = ['Data', 'Nome', 'Attività', 'Contatto', 'Servizi', 'Messaggio', 'Privacy'];
const SERVIZI_AMMESSI = ['Sito web', 'Landing page', 'Branding', 'Presenza locale', 'Non lo so ancora'];
const LIMITI = { nome: 100, attivita: 100, contatto: 120, messaggio: 2000 };
const MAX_INVII_ORA = 20; // tetto globale: l'endpoint non vede l'IP di chi scrive

function doPost(e) {
  const p = e.parameter || {};
  if (p['azienda-web']) return risposta('ok'); // campo trappola per i bot

  const nome = pulisci(p.nome, LIMITI.nome);
  const contatto = pulisci(p.contatto, LIMITI.contatto);
  if (!nome || !contatto || p.privacy !== 'accettata') return risposta('errore');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contatto) && !/^\+?[0-9 ()./-]{6,25}$/.test(contatto)) return risposta('errore');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return risposta('errore');
  try {
    if (!entroIlTetto()) return risposta('errore');

    const foglio = (ID_FOGLIO ? SpreadsheetApp.openById(ID_FOGLIO) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
    if (foglio.getLastRow() === 0) {
      foglio.appendRow(INTESTAZIONI);
      foglio.setFrozenRows(1);
    }

    const servizi = (e.parameters.servizi || []).filter((s) => SERVIZI_AMMESSI.indexOf(s) !== -1).join(', ');
    const riga = [
      new Date(),
      nome,
      pulisci(p.attivita, LIMITI.attivita),
      contatto,
      servizi,
      pulisci(p.messaggio, LIMITI.messaggio),
      p.privacy,
    ].map((v, i) => (i === 0 ? v : neutralizza(v)));
    foglio.appendRow(riga);

    if (EMAIL_NOTIFICA) {
      MailApp.sendEmail(
        EMAIL_NOTIFICA,
        'Nuovo messaggio dal sito: ' + nome.replace(/[\r\n]+/g, ' ').slice(0, 60),
        INTESTAZIONI.map((titolo, i) => titolo + ': ' + riga[i]).join('\n')
      );
    }
  } finally {
    lock.releaseLock();
  }
  return risposta('ok');
}

// Testo semplice, senza caratteri di controllo, tagliato alla lunghezza massima.
function pulisci(valore, massimo) {
  return String(valore || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, massimo);
}

// Google Fogli interpreta come formula ciò che inizia con = + - @ : un apice lo rende testo.
function neutralizza(valore) {
  return /^[=+\-@\t\r]/.test(valore) ? "'" + valore : valore;
}

// Contatore orario condiviso: oltre MAX_INVII_ORA il messaggio viene rifiutato.
function entroIlTetto() {
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('invii') || 0);
  if (n >= MAX_INVII_ORA) return false;
  cache.put('invii', String(n + 1), 3600);
  return true;
}

function risposta(testo) {
  return ContentService.createTextOutput(testo);
}
