/* Riceve le richieste di appuntamento dal sito di Chris Beauty e le scrive su un foglio Google.
   Istruzioni nel README, sezione "Chris Beauty → prenotazioni su Google Fogli".
   ID_FOGLIO e EMAIL_NOTIFICA si compilano QUI, nel progetto Apps Script, non nel repository. */

const ID_FOGLIO = ''; // l'ID nell'URL del foglio: docs.google.com/spreadsheets/d/<ID>/edit (vuoto: foglio a cui è legato lo script)
const EMAIL_NOTIFICA = ''; // email che riceve un avviso per ogni richiesta; vuoto per non riceverne
const INTESTAZIONI = ['Ricevuta il', 'Nome', 'Recapito', 'Trattamento', 'Data preferita', 'Fascia oraria', 'Stato'];
const MAX = 200;

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p['sito-web']) return risposta(true); // campo trappola compilato: è un bot, si finge un successo

  const campi = ['nome', 'recapito', 'trattamento', 'data', 'fascia'];
  for (const c of campi) {
    const v = String(p[c] || '').trim();
    if (!v || v.length > MAX) return risposta(false);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data)) return risposta(false);
  if (p.privacy !== 'on') return risposta(false);

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // due richieste insieme non si pestano
    const foglio = (ID_FOGLIO ? SpreadsheetApp.openById(ID_FOGLIO) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
    if (foglio.getLastRow() === 0) {
      foglio.appendRow(INTESTAZIONI);
      foglio.setFrozenRows(1);
    }
    const riga = [new Date(), p.nome, p.recapito, p.trattamento, p.data, p.fascia].map(sicuro);
    riga.push('Da confermare'); // la titolare lo cambia a mano quando conferma
    foglio.appendRow(riga);

    if (EMAIL_NOTIFICA) {
      MailApp.sendEmail(
        EMAIL_NOTIFICA,
        'Nuova richiesta di appuntamento: ' + p.nome,
        INTESTAZIONI.map((titolo, i) => titolo + ': ' + riga[i]).join('\n')
      );
    }
    return risposta(true);
  } catch (errore) {
    return risposta(false);
  } finally {
    lock.releaseLock();
  }
}

/* Un valore che inizia con = + - @ verrebbe letto come formula: si neutralizza. */
function sicuro(v) {
  if (v instanceof Date) return v;
  const t = String(v).trim();
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function risposta(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
}
