import type { Dizionario } from './it';

export const de: Dizionario = {
  meta: {
    pagine: {
      home: {
        titolo: 'Trattoria Luciana · Fischrestaurant an der Strandpromenade von Roseto degli Abruzzi',
        descrizione: 'Die Fischtrattoria der Familie Ruggieri am Lungomare Trieste in Roseto degli Abruzzi. Der Fang des Tages, Hausrezepte, Lucianas Mittagsmenü. Reservieren Sie Ihren Tisch.',
      },
      storia: {
        titolo: 'Geschichte · Trattoria Luciana',
        descrizione: 'Die Familie Ruggieri und ihre Trattoria an der Strandpromenade von Roseto degli Abruzzi: eine Geschichte vom Meer und von der Hausmannskost.',
      },
      menu: {
        titolo: 'Speisekarte · Trattoria Luciana, Roseto degli Abruzzi',
        descrizione: 'Die Speisekarte der Trattoria Luciana: Meeresvorspeisen, Spaghetti mit Venusmuscheln, Brodetto, frittierter Fang und Weine aus den Abruzzen. Mit Allergenen und Tagesgericht.',
      },
      mare: {
        titolo: 'Das Meer · Trattoria Luciana',
        descrizione: 'Die Adria vor Roseto degli Abruzzi, die Fischerei und der Fangkalender: das Meer, das die Speisekarte der Trattoria Luciana bestimmt.',
      },
      prenota: {
        titolo: 'Tisch reservieren · Trattoria Luciana',
        descrizione: 'Reservieren Sie in der Trattoria Luciana in Roseto degli Abruzzi, telefonisch oder mit einer Online-Anfrage. Wir bestätigen Ihren Tisch.',
      },
      contatti: {
        titolo: 'Kontakt und Öffnungszeiten · Trattoria Luciana',
        descrizione: 'Adresse, Öffnungszeiten, Telefon und Anfahrt zur Trattoria Luciana, Lungomare Trieste 60, Roseto degli Abruzzi.',
      },
    },
  },

  comune: {
    salta: 'Zum Inhalt springen',
    tagline: 'Vom Meer, auf den Tisch.',
    prenota: 'Tisch reservieren',
    prenotaBreve: 'Reservieren',
    chiama: 'Anrufen',
    whatsapp: 'WhatsApp',
    menu: 'Menü',
    chiudi: 'Schließen',
    nuovaScheda: '(öffnet in einem neuen Tab)',
    daConfermare: 'zu bestätigen',
    daCollegare: 'zu verknüpfen',
    lingua: 'Sprache',
    scorri: 'Scrollen',
    scena: 'Szene',
    torna: 'Nach oben',
  },

  nav: { home: 'Start', storia: 'Geschichte', menu: 'Speisekarte', mare: 'Das Meer', contatti: 'Kontakt', prenota: 'Reservieren' },

  giorni: { lun: 'Montag', mar: 'Dienstag', mer: 'Mittwoch', gio: 'Donnerstag', ven: 'Freitag', sab: 'Samstag', dom: 'Sonntag' },
  giorniBrevi: { lun: 'Mo', mar: 'Di', mer: 'Mi', gio: 'Do', ven: 'Fr', sab: 'Sa', dom: 'So' },
  mesi: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  mesiInteri: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],

  orari: {
    titolo: 'Öffnungszeiten',
    pranzo: 'Mittag',
    cena: 'Abend',
    chiusura: 'Ruhetag',
    chiuso: 'Geschlossen',
    stagione: 'Saison',
    dalleAlle: '{dalle}–{alle}',
  },

  recapiti: {
    indirizzo: 'Adresse',
    telefono: 'Telefon',
    email: 'E-Mail',
    whatsapp: 'WhatsApp',
    indicazioni: 'Route planen',
    mappa: 'In Google Maps öffnen',
    instagram: 'Instagram',
    facebook: 'Facebook',
  },

  home: {
    hero: {
      scena: 'Das Meer',
      luogo: 'Roseto degli Abruzzi',
      sotto: 'Fischküche und Familienküche an der Strandpromenade von Roseto degli Abruzzi.',
    },
    intro: {
      scena: 'Eine Familiengeschichte',
      righe: ['An der Promenade von Roseto', 'steht ein gedeckter Tisch', 'mit Blick auf die Adria.'],
      testo: 'Die Küche ist Hausmannskost, der Fisch ist der Fang des Tages, die Familie ist die Familie Ruggieri. Zu Luciana kommt man, um gut zu essen, ohne Eile, das Meer nur ein paar Schritte entfernt.',
    },
    territorio: {
      scena: 'Die Gegend',
      titolo: 'Vor uns das Meer, hinter uns der Gran Sasso.',
      voci: [
        {
          nome: 'Roseto',
          sotto: 'degli Abruzzi',
          testo: 'Ein langer, heller Strand, eine Promenade mit Palmen, ein Ort, der im Sommer am Meer lebt.',
        },
        {
          nome: 'Adria',
          sotto: 'unser Meer',
          testo: 'Ein flaches, großzügiges Meer: Sardellen, Tintenfische, Rotbarben, Heuschreckenkrebse, Venusmuscheln. Es wechselt mit den Jahreszeiten, und die Speisekarte mit ihm.',
        },
        {
          nome: 'Abruzzen',
          sotto: 'unser Land',
          testo: 'Hinter uns die Hügel und die Berge. Vom Land kommen das Öl, der Wein, das Gemüse.',
        },
      ],
    },
    storia: {
      scena: 'Die Familie',
      titolo: 'Die Familie Ruggieri',
      testo: 'Eine Familientrattoria erkennt man an den kleinen Dingen: Wer Sie empfängt, erinnert sich an Sie, in der Küche steht immer jemand aus der Familie, die Rezepte gehen von Hand zu Hand.',
      dal: 'Seit',
      allora: 'Damals',
      oggi: 'Heute',
      link: 'Unsere Geschichte',
    },
    cucina: {
      scena: 'Vom Fang auf den Tisch',
      titolo: 'Vom Fang auf den Tisch',
      intro: 'Der Weg ist kurz, und so soll es bleiben.',
      passi: [
        { titolo: 'Das Meer', testo: 'Die Speisekarte entsteht am Morgen, mit Blick auf das, was das Meer gebracht hat.' },
        { titolo: 'Die Auswahl', testo: 'Genommen wird der Fisch der Saison, der es verdient. Der Rest wartet auf seine Zeit.' },
        { titolo: 'Die Küche', testo: 'Hausrezepte, die richtigen Garzeiten, nichts, was den Geschmack des Meeres überdeckt.' },
        { titolo: 'Der Tisch', testo: 'Das Gericht kommt, wie es kommen soll: sofort, heiß, mit dem Meer vor Augen.' },
      ],
    },
    menu: {
      scena: 'Die Speisekarte',
      titolo: 'Eine kurze Karte, die dem Meer folgt.',
      testo: 'Wenige Gerichte, gut gemacht, die sich mit dem Fang und den Jahreszeiten ändern.',
      link: 'Die ganze Speisekarte',
      nota: 'Gerichte und Preise können sich je nach Fang des Tages ändern.',
    },
    pranzo: {
      scena: 'Lucianas Mittagsmenü',
      titolo: 'Lucianas Mittagsmenü',
      testo: 'Mittags ein festes Menü wie zu Hause: das, was die Küche an diesem Tag zubereitet hat, zu einem ehrlichen Preis. Für alle, die arbeiten, die vorbeikommen, die Urlaub machen und essen wollen wie in Roseto.',
      giorni: 'Tage',
      orario: 'Uhrzeit',
      prezzo: 'Preis',
      comprende: 'Enthalten',
      oggi: 'Heute auf dem Tisch',
      aPersona: 'pro Person',
      portate: { primo: 'Erster Gang', secondo: 'Hauptgang', contorno: 'Beilage', dolce: 'Dessert' },
    },
    atmosfera: {
      scena: 'Atmosphäre',
      titolo: 'Der Gastraum, die Pergola, das Meer.',
      luoghi: [
        { nome: 'Der Gastraum', testo: 'Hell und schlicht, für Mittagessen im Winter und lange Abende.' },
        { nome: 'Die Pergola', testo: 'Im Sommer im Schatten, mit der Brise, die vom Strand herüberweht.' },
        { nome: 'Das Meer', testo: 'Immer direkt davor. Man muss nur vom Teller aufschauen.' },
      ],
    },
    voci: {
      scena: 'Was unsere Gäste sagen',
      titolo: 'Was unsere Gäste sagen',
      sintesi: '{numero} Bewertungen auf {fonte}',
      su: 'von {su}',
      esempio: 'Beispielbewertung',
      sostituire: 'durch eine geprüfte Bewertung zu ersetzen',
      fonti: { google: 'Google', tripadvisor: 'Tripadvisor', thefork: 'TheFork', altro: 'Bewertung' },
      leggi: 'Bewertung lesen',
    },
    dove: {
      scena: 'Hier finden Sie uns',
      titolo: 'Lungomare Trieste 60',
      testo: 'An der Strandpromenade von Roseto degli Abruzzi, gegenüber dem Strand.',
      mappa: {
        descrizione: 'Schematische Karte: Der Lungomare Trieste verläuft am Strand von Roseto degli Abruzzi entlang, östlich liegt die Adria. Die Markierung zeigt die Trattoria Luciana an Nummer 60.',
        mare: 'Adriatisches Meer',
        lungomare: 'Lungomare Trieste',
        spiaggia: 'Strand',
        citta: 'Roseto degli Abruzzi',
        nord: 'N',
        nonInScala: 'Nicht maßstabsgetreu.',
      },
    },
    cta: {
      scena: 'Der Tisch',
      righe: ['Reservieren Sie', 'Ihren Tisch'],
      testo: 'Rufen Sie an, schreiben Sie uns oder senden Sie eine Online-Anfrage: Wir bestätigen Ihnen den Tisch.',
    },
  },

  percorsi: {
    telefono: { titolo: 'Telefon', testo: 'Am schnellsten: Wir sagen Ihnen sofort, ob ein Tisch frei ist.' },
    whatsapp: { titolo: 'WhatsApp', testo: 'Schreiben Sie uns Datum, Uhrzeit und Personenzahl: Wir antworten so bald wie möglich.' },
    online: { titolo: 'Online-Anfrage', testo: 'Hinterlassen Sie Ihre Daten: Wir melden uns, um den Tisch zu bestätigen.', azione: 'Anfrage ausfüllen' },
    motore: { azione: 'Online reservieren' },
    whatsappTesto: 'Guten Tag, ich möchte einen Tisch reservieren.',
  },

  prenota: {
    sopra: 'Reservierungen',
    titolo: 'Tisch reservieren',
    intro: 'Drei Wege, ein Tisch. Für heute Abend ist das Telefon am schnellsten.',
    modulo: {
      titolo: 'Reservierungsanfrage',
      avviso: 'Dies ist eine Anfrage, keine Bestätigung: Der Tisch gehört Ihnen, sobald wir Sie anrufen oder Ihnen schreiben, um ihn zu bestätigen.',
      campi: {
        nome: 'Vor- und Nachname',
        telefono: 'Telefon',
        email: 'E-Mail',
        data: 'Datum',
        ora: 'Uhrzeit',
        persone: 'Personen',
        allergie: 'Allergien oder Unverträglichkeiten',
        note: 'Anmerkungen',
      },
      aiuti: {
        telefono: 'Unter dieser Nummer rufen wir Sie zur Bestätigung an.',
        persone: 'Mehr als 12 Personen? Rufen Sie uns an, wir organisieren die Tafel.',
        allergie: 'Zum Beispiel: Zöliakie, Krebstiere, Schalenfrüchte.',
        note: 'Ein Kinderstuhl, ein Geburtstag, ein Tisch unter der Pergola …',
      },
      facoltativo: 'optional',
      scegliOra: 'Uhrzeit wählen',
      privacy: 'Wir verwenden Ihre Daten nur, um diese Anfrage zu beantworten.',
      informativa: 'Datenschutzhinweis',
      invia: 'Anfrage senden',
      invio: 'Wird gesendet …',
      errori: {
        riepilogo: 'Bitte prüfen Sie die markierten Felder.',
        nome: 'Bitte geben Sie Ihren Namen ein.',
        telefono: 'Bitte geben Sie eine gültige Telefonnummer ein.',
        email: 'Bitte prüfen Sie die E-Mail-Adresse.',
        data: 'Bitte wählen Sie ein Datum ab heute.',
        dataChiusura: 'An diesem Tag ist Ruhetag: Bitte wählen Sie einen anderen Tag.',
        ora: 'Bitte wählen Sie eine Uhrzeit.',
        persone: 'Bitte geben Sie die Personenzahl an, von 1 bis 12.',
        invio: 'Die Anfrage wurde nicht gesendet. Bitte versuchen Sie es gleich noch einmal oder rufen Sie uns an.',
      },
      successo: {
        titolo: 'Anfrage gesendet',
        testo: 'Danke, {nome}. Das ist noch keine Reservierung: Wir melden uns unter {telefono}, um den Tisch zu bestätigen.',
        riepilogo: 'Ihre Anfrage',
        nuova: 'Weitere Anfrage senden',
      },
      anteprima: 'Vorschau: Das Formular prüft die Daten, sendet aber nichts.',
    },
  },

  storia: {
    sopra: 'Geschichte',
    titolo: 'Die Familie Ruggieri',
    intro: 'Jede Trattoria hat eine Geschichte. Diese trägt einen Namen, Luciana, und hat das Meer vor sich.',
    capitolo: 'Kapitel',
    annoDaConfermare: 'Jahr zu bestätigen',
    chiusura: 'Die Geschichte geht am Tisch weiter.',
  },

  menu: {
    sopra: 'Speisekarte',
    titolo: 'Die Speisekarte',
    intro: 'Eine kurze Karte, die dem Fang und den Jahreszeiten folgt. Fragen Sie nach dem Tagesgericht.',
    vaiA: 'Rubriken',
    legenda: 'Legende',
    allergeniTitolo: 'Allergene',
    allergeniNota: 'Bei Allergien oder Unverträglichkeiten informieren Sie bitte vor der Bestellung unser Personal: Informationen zu Allergenen (Verordnung (EU) Nr. 1169/2011) liegen im Restaurant bereit.',
    piattoDelGiorno: 'Tagesgericht',
    coperto: 'Gedeck',
    prezzi: 'Preise in Euro.',
    vuoto: 'Die Karte wechselt mit dem Meer: Rufen Sie uns an, um zu erfahren, was es heute gibt.',
    contiene: 'Enthält',
  },

  disponibilita: { sempre: '', pescato: 'Je nach Fang', stagione: 'Saisonal', esaurito: 'Heute ausverkauft' },
  unita: { porzione: '', etto: 'pro 100 g', bottiglia: 'Flasche', calice: 'im Glas' },

  allergeni: {
    glutine: 'Gluten', crostacei: 'Krebstiere', uova: 'Eier', pesce: 'Fisch', arachidi: 'Erdnüsse',
    soia: 'Soja', latte: 'Milch', 'frutta-a-guscio': 'Schalenfrüchte', sedano: 'Sellerie', senape: 'Senf',
    sesamo: 'Sesam', solfiti: 'Sulfite', lupini: 'Lupinen', molluschi: 'Weichtiere',
  },

  mare: {
    sopra: 'Das Meer',
    titolo: 'Die Adria vor Roseto',
    intro: 'Flach, sandig, großzügig. Das Meer, das Sie vom Tisch aus sehen, ist dasselbe, das die Speisekarte bestimmt.',
    capitoli: [
      {
        titolo: 'Ein flaches Meer',
        testo: 'Vor Roseto fällt der Meeresboden sanft ab: heller Sand, Wasser, das früh warm wird, ein Meer, das im Sommer allen gehört. Weiter draußen beginnen die Gründe der Rotbarben, Seezungen und Heuschreckenkrebse.',
      },
      {
        titolo: 'Die Fischerei',
        testo: 'Die Schleppnetze der Paranza, die kleinen Boote der Küstenfischerei, die Muscheln, die am Ufer gesammelt werden: An dieser Küste wird das Meer so bearbeitet, jeden Tag.',
      },
    ],
    calendario: {
      titolo: 'Der Kalender des Meeres',
      testo: 'Jeder Fisch hat seine Zeit. Unten sehen Sie, wann er meist am besten ist: Die Küche richtet sich danach.',
      indicativo: 'Nur zur Orientierung: Das Meer liest keine Kalender.',
      fermo: 'Schonzeit',
      stagione: 'Beste Saison',
      specie: 'Art',
    },
    rispetto: {
      titolo: 'Das Meer von morgen',
      testo: 'Saisonal essen heißt auch, Schonzeiten und Mindestgrößen zu respektieren. Das Meer von morgen hängt von den Gerichten von heute ab.',
    },
  },

  contatti: {
    sopra: 'Kontakt',
    titolo: 'Besuchen Sie uns',
    intro: 'Am Lungomare Trieste in Roseto degli Abruzzi. Am schnellsten reservieren Sie nach wie vor telefonisch.',
    comeArrivare: 'Anfahrt',
    auto: { titolo: 'Mit dem Auto', testo: 'Autobahn A14, Ausfahrt Roseto degli Abruzzi, dann Richtung Strandpromenade.' },
    treno: { titolo: 'Mit dem Zug', testo: 'Bahnhof Roseto degli Abruzzi, an der Adriabahn.' },
    seguici: 'Folgen Sie uns',
    legale: 'Firmendaten',
    ragioneSociale: 'Firmenname',
    partitaIva: 'USt-IdNr.',
  },

  piede: {
    pagine: 'Seiten',
    orari: 'Öffnungszeiten',
    dove: 'Adresse',
    seguici: 'Folgen Sie uns',
    privacy: 'Datenschutz',
    cookie: 'Cookies',
    partitaIva: 'USt-IdNr.',
    credito: 'Website von Prisma Locale',
  },

  foto: {
    daScattare: 'Foto folgt',
    archivio: 'Archivfoto gesucht',
    provvisoria: 'Vorläufiges Bild',
  },

  barra: { prenota: 'Tisch reservieren', chiama: 'Anrufen' },
};
