/* Riceve gli invii del modulo contatti e li scrive su questo foglio Google.
   Istruzioni nel README, sezione "Modulo contatti → Google Fogli".

   L'indirizzo dello script è pubblico (sta nell'HTML del sito), quindi chiunque può
   chiamarlo: qui si controlla tutto ciò che arriva. Dopo ogni modifica va fatta una
   nuova distribuzione (Distribuisci → Gestisci distribuzioni → Modifica → Nuova versione). */

const ID_FOGLIO = ''; // l'ID nell'URL del foglio: docs.google.com/spreadsheets/d/<ID>/edit
const EMAIL_NOTIFICA = 'info@prismalocale.it'; // lascia '' per non ricevere email
const INTESTAZIONI = ['Data', 'Nome', 'Attività', 'Contatto', 'Servizi', 'Messaggio', 'Privacy'];

// Lunghezze massime: le stesse di maxlength nel modulo in index.html.
const LIMITI = { nome: 80, attivita: 100, contatto: 120, messaggio: 2000 };
const SERVIZI_AMMESSI = ['Sito web', 'Landing page', 'Branding', 'Presenza locale', 'Non lo so ancora'];
const MAX_INVII_ORA = 20;        // oltre questa soglia gli invii vengono scartati, non scritti né mandati per email
const MIN_SECONDI_COMPILAZIONE = 3; // una persona non compila il modulo in meno di così
const ATTESA_DUPLICATI = 600;    // secondi in cui lo stesso messaggio non viene accettato due volte

function doPost(e) {
  const p = e.parameter || {};

  // Dal punto di vista di chi chiama la risposta è sempre "ok": un bot non deve capire
  // cosa lo ha fermato. Il motivo dello scarto resta nel registro dell'esecuzione.
  if (p['azienda-web']) return scarta('campo trappola compilato');

  const aperto = Number(p.aperto);
  if (aperto && Date.now() - aperto < MIN_SECONDI_COMPILAZIONE * 1000) return scarta('compilato troppo in fretta');

  if (p.privacy !== 'accettata') return scarta('privacy non accettata');

  const nome = pulisci(p.nome, LIMITI.nome);
  const attivita = pulisci(p.attivita, LIMITI.attivita);
  const contatto = pulisci(p.contatto, LIMITI.contatto);
  const messaggio = pulisci(p.messaggio, LIMITI.messaggio, true);
  if (!nome || !contattoValido(contatto)) return scarta('nome o contatto non validi');

  // Solo i servizi che il modulo offre davvero.
  const servizi = (e.parameters.servizi || []).filter((s) => SERVIZI_AMMESSI.indexOf(s) !== -1).join(', ');

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return scarta('script occupato');
  try {
    if (troppiInvii()) return scarta('limite orario raggiunto');
    if (giaArrivato([nome, contatto, messaggio].join('|'))) return scarta('duplicato');

    const foglio = (ID_FOGLIO ? SpreadsheetApp.openById(ID_FOGLIO) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
    if (foglio.getLastRow() === 0) {
      foglio.appendRow(INTESTAZIONI);
      foglio.setFrozenRows(1);
    }

    const riga = [new Date(), nome, attivita, contatto, servizi, messaggio, p.privacy];
    // Una cella che inizia con = + - @ verrebbe letta da Fogli/Excel come una formula.
    foglio.appendRow(riga.map((v) => (typeof v === 'string' ? neutralizzaFormula(v) : v)));

    if (EMAIL_NOTIFICA) {
      MailApp.sendEmail(
        EMAIL_NOTIFICA,
        'Nuovo messaggio dal sito: ' + (nome.replace(/[\r\n]+/g, ' ').slice(0, 60) || 'senza nome'),
        INTESTAZIONI.map((titolo, i) => titolo + ': ' + riga[i]).join('\n')
      );
    }
  } finally {
    lock.releaseLock();
  }
  return risposta('ok');
}

// Toglie i caratteri di controllo (tranne a capo e tab nel messaggio), spazi ai bordi, taglia alla lunghezza massima.
function pulisci(valore, massimo, multiriga) {
  let t = String(valore == null ? '' : valore);
  t = t.replace(multiriga ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, ' ');
  return t.trim().slice(0, massimo);
}

// Email plausibile oppure un numero di telefono con almeno 6 cifre.
function contattoValido(c) {
  if (!c) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return true;
  return /^[+()\d\s./-]+$/.test(c) && (c.match(/\d/g) || []).length >= 6;
}

function neutralizzaFormula(testo) {
  return /^[=+\-@\t\r]/.test(testo) ? "'" + testo : testo;
}

// Contatore a finestra di un'ora, in memoria di sistema (CacheService scade da solo).
function troppiInvii() {
  const cache = CacheService.getScriptCache();
  const fascia = 'invii-' + Math.floor(Date.now() / 3600000);
  const n = Number(cache.get(fascia) || 0);
  if (n >= MAX_INVII_ORA) return true;
  cache.put(fascia, String(n + 1), 3700);
  return false;
}

function giaArrivato(chiave) {
  const cache = CacheService.getScriptCache();
  const impronta = 'dup-' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, chiave)
  );
  if (cache.get(impronta)) return true;
  cache.put(impronta, '1', ATTESA_DUPLICATI);
  return false;
}

function scarta(motivo) {
  console.warn('Invio scartato: ' + motivo);
  return risposta('ok');
}

function risposta(testo) {
  return ContentService.createTextOutput(testo);
}
