/* Riceve gli invii del modulo contatti e li scrive su questo foglio Google.
   Istruzioni nel README, sezione "Modulo contatti → Google Fogli". */

const ID_FOGLIO = ''; // l'ID nell'URL del foglio: docs.google.com/spreadsheets/d/<ID>/edit
const EMAIL_NOTIFICA = 'info@prismalocale.it'; // lascia '' per non ricevere email
const INTESTAZIONI = ['Data', 'Nome', 'Attività', 'Contatto', 'Servizi', 'Messaggio', 'Privacy'];

function doPost(e) {
  const p = e.parameter;
  if (p['azienda-web']) return risposta('ok'); // campo trappola per i bot

  const foglio = (ID_FOGLIO ? SpreadsheetApp.openById(ID_FOGLIO) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
  if (foglio.getLastRow() === 0) {
    foglio.appendRow(INTESTAZIONI);
    foglio.setFrozenRows(1);
  }

  const servizi = (e.parameters.servizi || []).join(', ');
  const riga = [new Date(), p.nome || '', p.attivita || '', p.contatto || '', servizi, p.messaggio || '', p.privacy || ''];
  foglio.appendRow(riga);

  if (EMAIL_NOTIFICA) {
    MailApp.sendEmail(
      EMAIL_NOTIFICA,
      'Nuovo messaggio dal sito: ' + (p.nome || 'senza nome'),
      INTESTAZIONI.map((titolo, i) => titolo + ': ' + riga[i]).join('\n')
    );
  }
  return risposta('ok');
}

function risposta(testo) {
  return ContentService.createTextOutput(testo);
}
