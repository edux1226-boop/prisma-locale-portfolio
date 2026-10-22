/* Testi dell'interfaccia e della narrazione, in italiano (lingua di partenza).
   Regola: qui solo testi che restano veri qualunque cosa confermi il
   ristorante. Anni, orari, prezzi, nomi e numeri stanno nel CMS (content/),
   dove hanno uno stato e vengono filtrati. I segnaposto {così} si riempiono
   con fmt() di i18n/index.ts. */

export const it = {
  meta: {
    pagine: {
      home: {
        titolo: 'Trattoria Luciana · Ristorante di pesce sul lungomare di Roseto degli Abruzzi',
        descrizione: 'Trattoria di pesce della famiglia Ruggieri sul Lungomare Trieste di Roseto degli Abruzzi. Il pescato del giorno, le ricette di casa, il pranzo di Luciana. Prenota il tuo tavolo.',
      },
      storia: {
        titolo: 'La storia · Trattoria Luciana',
        descrizione: 'La famiglia Ruggieri e la sua trattoria sul lungomare di Roseto degli Abruzzi: una storia di mare e di cucina di casa.',
      },
      menu: {
        titolo: 'Menu · Trattoria Luciana, Roseto degli Abruzzi',
        descrizione: 'Il menu di Trattoria Luciana: antipasti di mare, spaghetti alle vongole, brodetto, frittura di paranza e vini abruzzesi. Con allergeni e piatto del giorno.',
      },
      mare: {
        titolo: 'Il mare · Trattoria Luciana',
        descrizione: "L'Adriatico di Roseto degli Abruzzi, la pesca e il calendario del pescato: il mare che decide il menu di Trattoria Luciana.",
      },
      prenota: {
        titolo: 'Prenota il tuo tavolo · Trattoria Luciana',
        descrizione: 'Prenota da Trattoria Luciana a Roseto degli Abruzzi: per telefono o con una richiesta online. Ti confermiamo noi il tavolo.',
      },
      contatti: {
        titolo: 'Contatti e orari · Trattoria Luciana',
        descrizione: 'Indirizzo, orari, telefono e indicazioni per Trattoria Luciana, Lungomare Trieste 60, Roseto degli Abruzzi.',
      },
    },
  },

  comune: {
    salta: 'Vai al contenuto',
    tagline: 'Dal mare, alla tavola.',
    prenota: 'Prenota il tuo tavolo',
    prenotaBreve: 'Prenota',
    chiama: 'Chiama',
    whatsapp: 'WhatsApp',
    menu: 'Menu',
    chiudi: 'Chiudi',
    nuovaScheda: '(si apre in una nuova scheda)',
    daConfermare: 'da confermare',
    daCollegare: 'da collegare',
    lingua: 'Lingua',
    scorri: 'Scorri',
    scena: 'Scena',
    torna: "Torna all'inizio",
  },

  nav: { home: 'Home', storia: 'Storia', menu: 'Menu', mare: 'Il mare', contatti: 'Contatti', prenota: 'Prenota' },

  giorni: { lun: 'Lunedì', mar: 'Martedì', mer: 'Mercoledì', gio: 'Giovedì', ven: 'Venerdì', sab: 'Sabato', dom: 'Domenica' },
  giorniBrevi: { lun: 'Lun', mar: 'Mar', mer: 'Mer', gio: 'Gio', ven: 'Ven', sab: 'Sab', dom: 'Dom' },
  mesi: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  mesiInteri: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],

  orari: {
    titolo: 'Orari',
    pranzo: 'Pranzo',
    cena: 'Cena',
    chiusura: 'Chiusura settimanale',
    chiuso: 'Chiuso',
    stagione: 'Periodo di apertura',
    dalleAlle: '{dalle}–{alle}',
  },

  recapiti: {
    indirizzo: 'Indirizzo',
    telefono: 'Telefono',
    email: 'Email',
    whatsapp: 'WhatsApp',
    indicazioni: 'Indicazioni stradali',
    mappa: 'Apri in Google Maps',
    instagram: 'Instagram',
    facebook: 'Facebook',
  },

  home: {
    hero: {
      scena: 'Il mare',
      luogo: 'Roseto degli Abruzzi',
      sotto: 'Cucina di pesce e di famiglia sul lungomare di Roseto degli Abruzzi.',
    },
    intro: {
      scena: 'Una storia di famiglia',
      righe: ['Sul lungomare di Roseto', "c'è una tavola apparecchiata", "davanti all'Adriatico."],
      testo: 'La cucina è quella di casa, il pesce è quello del giorno, la famiglia è la famiglia Ruggieri. Da Luciana si viene per mangiare bene, senza fretta, con il mare a pochi passi.',
    },
    territorio: {
      scena: 'Il territorio',
      titolo: 'Il mare davanti, il Gran Sasso alle spalle.',
      voci: [
        {
          nome: 'Roseto',
          sotto: 'degli Abruzzi',
          testo: "Una spiaggia lunga e chiara, il lungomare con le palme, una città che d'estate vive sul mare.",
        },
        {
          nome: 'Adriatico',
          sotto: 'il nostro mare',
          testo: 'Un mare basso e generoso: alici, seppie, triglie, canocchie, vongole. Cambia con le stagioni, e il menu cambia con lui.',
        },
        {
          nome: 'Abruzzo',
          sotto: 'la nostra terra',
          testo: "Alle spalle le colline e la montagna. Dalla terra arrivano l'olio, il vino, gli ortaggi.",
        },
      ],
    },
    storia: {
      scena: 'La famiglia',
      titolo: 'La famiglia Ruggieri',
      testo: 'Una trattoria di famiglia si riconosce dalle piccole cose: chi ti accoglie si ricorda di te, in cucina c\'è sempre qualcuno di casa, le ricette passano di mano in mano.',
      dal: 'Dal',
      allora: 'Allora',
      oggi: 'Oggi',
      link: 'Leggi la storia',
    },
    cucina: {
      scena: 'Dal pescato alla tavola',
      titolo: 'Dal pescato alla tavola',
      intro: 'Il percorso è breve, e deve restarlo.',
      passi: [
        { titolo: 'Il mare', testo: 'Il menu si decide la mattina, guardando quello che il mare ha dato.' },
        { titolo: 'La scelta', testo: 'Si prende il pesce di stagione, quello che merita. Il resto aspetta il suo momento.' },
        { titolo: 'La cucina', testo: 'Ricette di casa, tempi giusti, niente che copra il sapore del mare.' },
        { titolo: 'La tavola', testo: 'Il piatto arriva come deve arrivare: subito, caldo, con il mare davanti.' },
      ],
    },
    menu: {
      scena: 'Il menu',
      titolo: 'Una carta breve, che segue il mare.',
      testo: 'Pochi piatti, fatti bene, che cambiano con il pescato e con le stagioni.',
      link: 'Il menu completo',
      nota: 'Piatti e prezzi possono cambiare secondo il pescato del giorno.',
    },
    pranzo: {
      scena: 'Il pranzo di Luciana',
      titolo: 'Il pranzo di Luciana',
      testo: 'A mezzogiorno, un menu fisso alla maniera di casa: quello che la cucina ha preparato quel giorno, a un prezzo onesto. Per chi lavora, per chi passa, per chi è in vacanza e vuole mangiare come a Roseto.',
      giorni: 'Giorni',
      orario: 'Orario',
      prezzo: 'Prezzo',
      comprende: 'Comprende',
      oggi: 'Oggi in tavola',
      aPersona: 'a persona',
      portate: { primo: 'Primo', secondo: 'Secondo', contorno: 'Contorno', dolce: 'Dolce' },
    },
    atmosfera: {
      scena: 'Atmosfera',
      titolo: 'La sala, la pergola, il mare.',
      luoghi: [
        { nome: 'La sala', testo: "Luminosa e semplice, per il pranzo d'inverno e le cene lunghe." },
        { nome: 'La pergola', testo: "All'ombra, d'estate, con la brezza che arriva dalla spiaggia." },
        { nome: 'Il mare', testo: 'Davanti, sempre. Basta alzare gli occhi dal piatto.' },
      ],
    },
    voci: {
      scena: 'La voce degli ospiti',
      titolo: 'La voce degli ospiti',
      sintesi: '{numero} recensioni su {fonte}',
      su: 'su {su}',
      esempio: "Recensione d'esempio",
      sostituire: 'da sostituire con una recensione verificata',
      fonti: { google: 'Google', tripadvisor: 'Tripadvisor', thefork: 'TheFork', altro: 'Recensione' },
      leggi: 'Leggi la recensione',
    },
    dove: {
      scena: 'Dove siamo',
      titolo: 'Lungomare Trieste 60',
      testo: 'Sul lungomare di Roseto degli Abruzzi, davanti alla spiaggia.',
      mappa: {
        descrizione: 'Mappa schematica: il Lungomare Trieste corre lungo la spiaggia di Roseto degli Abruzzi, con il mare Adriatico a est. Il segnaposto indica Trattoria Luciana al numero 60.',
        mare: 'Mare Adriatico',
        lungomare: 'Lungomare Trieste',
        spiaggia: 'Spiaggia',
        citta: 'Roseto degli Abruzzi',
        nord: 'N',
        nonInScala: 'Schema non in scala.',
      },
    },
    cta: {
      scena: 'La tavola',
      righe: ['Prenota', 'il tuo tavolo'],
      testo: 'Chiamaci, scrivici o lascia una richiesta online: il tavolo te lo confermiamo noi.',
    },
  },

  percorsi: {
    telefono: { titolo: 'Telefono', testo: 'Il modo più veloce: ti diciamo subito se c\'è posto.' },
    whatsapp: { titolo: 'WhatsApp', testo: 'Scrivici data, ora e persone: ti rispondiamo appena possiamo.' },
    online: { titolo: 'Richiesta online', testo: 'Lascia i tuoi dati: ti ricontattiamo per confermare il tavolo.', azione: 'Compila la richiesta' },
    motore: { azione: 'Prenota online' },
    whatsappTesto: 'Buongiorno, vorrei prenotare un tavolo.',
  },

  prenota: {
    sopra: 'Prenotazioni',
    titolo: 'Prenota il tuo tavolo',
    intro: 'Tre strade, un solo tavolo. Per stasera, il telefono è la più veloce.',
    modulo: {
      titolo: 'Richiesta di prenotazione',
      avviso: 'Questa è una richiesta, non una conferma: il tavolo è tuo quando ti richiamiamo o ti scriviamo per confermarlo.',
      campi: {
        nome: 'Nome e cognome',
        telefono: 'Telefono',
        email: 'Email',
        data: 'Data',
        ora: 'Ora',
        persone: 'Persone',
        allergie: 'Allergie o intolleranze',
        note: 'Note',
      },
      aiuti: {
        telefono: 'Ti chiamiamo a questo numero per confermare.',
        persone: 'Oltre 12 persone? Chiamaci: organizziamo noi la tavolata.',
        allergie: 'Per esempio: celiachia, crostacei, frutta a guscio.',
        note: 'Un seggiolone, un compleanno, un tavolo sotto la pergola…',
      },
      facoltativo: 'facoltativo',
      scegliOra: 'Scegli un orario',
      privacy: 'Usiamo i tuoi dati solo per rispondere a questa richiesta.',
      informativa: 'Informativa privacy',
      invia: 'Invia la richiesta',
      invio: 'Invio in corso…',
      errori: {
        riepilogo: 'Controlla i campi segnati.',
        nome: 'Scrivi il tuo nome.',
        telefono: 'Serve un numero di telefono valido.',
        email: "Controlla l'indirizzo email.",
        data: 'Scegli una data a partire da oggi.',
        dataChiusura: 'Quel giorno siamo chiusi: scegli un altro giorno.',
        ora: 'Scegli un orario.',
        persone: 'Indica quante persone, da 1 a 12.',
        invio: 'La richiesta non è partita. Riprova tra poco o chiamaci.',
      },
      successo: {
        titolo: 'Richiesta inviata',
        testo: 'Grazie, {nome}. Non è ancora una prenotazione: ti ricontattiamo al {telefono} per confermare il tavolo.',
        riepilogo: 'La tua richiesta',
        nuova: 'Invia un\'altra richiesta',
      },
      anteprima: 'Anteprima: il modulo controlla i dati ma non invia nulla.',
    },
  },

  storia: {
    sopra: 'La storia',
    titolo: 'La famiglia Ruggieri',
    intro: 'Ogni trattoria ha una storia. Questa porta un nome, Luciana, e ha il mare davanti.',
    capitolo: 'Capitolo',
    annoDaConfermare: 'anno da confermare',
    chiusura: 'La storia continua a tavola.',
  },

  menu: {
    sopra: 'Il menu',
    titolo: 'Il menu',
    intro: 'Una carta breve che segue il pescato e le stagioni. Chiedi in sala il piatto del giorno.',
    vaiA: 'Categorie',
    legenda: 'Legenda',
    allergeniTitolo: 'Allergeni',
    allergeniNota: 'Per allergie e intolleranze avvisa il personale prima di ordinare: le informazioni sugli allergeni (Reg. UE 1169/2011) sono a disposizione in sala.',
    piattoDelGiorno: 'Piatto del giorno',
    coperto: 'Coperto',
    prezzi: 'Prezzi in euro.',
    vuoto: 'Il menu cambia con il mare: chiamaci per sapere cosa c\'è oggi.',
    contiene: 'Contiene',
  },

  disponibilita: { sempre: '', pescato: 'Secondo il pescato', stagione: 'Di stagione', esaurito: 'Esaurito oggi' },
  unita: { porzione: '', etto: "all'etto", bottiglia: 'bottiglia', calice: 'al calice' },

  allergeni: {
    glutine: 'Glutine', crostacei: 'Crostacei', uova: 'Uova', pesce: 'Pesce', arachidi: 'Arachidi',
    soia: 'Soia', latte: 'Latte', 'frutta-a-guscio': 'Frutta a guscio', sedano: 'Sedano', senape: 'Senape',
    sesamo: 'Sesamo', solfiti: 'Solfiti', lupini: 'Lupini', molluschi: 'Molluschi',
  },

  mare: {
    sopra: 'Il mare',
    titolo: "L'Adriatico di Roseto",
    intro: 'Basso, sabbioso, generoso. Il mare che vedi dalla tavola è lo stesso che decide il menu.',
    capitoli: [
      {
        titolo: 'Un mare basso',
        testo: 'Davanti a Roseto il fondale scende piano: sabbia chiara, acqua che si scalda presto, un mare che d\'estate è di tutti. Più al largo cominciano i fondali delle triglie, delle sogliole, delle canocchie.',
      },
      {
        titolo: 'La pesca',
        testo: 'Le reti a strascico della paranza, le barche piccole della pesca costiera, le vongole raccolte lungo la riva: su questa costa il mare si lavora così, ogni giorno.',
      },
    ],
    calendario: {
      titolo: 'Il calendario del mare',
      testo: 'Ogni pesce ha il suo momento. Qui sotto, quando di solito è al meglio: la cucina lo segue.',
      indicativo: 'Indicativo: il mare non legge i calendari.',
      fermo: 'Fermo pesca',
      stagione: 'Stagione migliore',
      specie: 'Specie',
    },
    rispetto: {
      titolo: 'Il mare di domani',
      testo: 'Mangiare di stagione vuol dire anche rispettare i fermi e le taglie minime. Il mare di domani dipende dai piatti di oggi.',
    },
  },

  contatti: {
    sopra: 'Contatti',
    titolo: 'Vieni a trovarci',
    intro: 'Sul Lungomare Trieste, a Roseto degli Abruzzi. Il modo più rapido per prenotare resta il telefono.',
    comeArrivare: 'Come arrivare',
    auto: { titolo: 'In auto', testo: 'Autostrada A14, uscita Roseto degli Abruzzi, poi verso il lungomare.' },
    treno: { titolo: 'In treno', testo: 'Stazione di Roseto degli Abruzzi, sulla linea adriatica.' },
    seguici: 'Seguici',
    legale: 'Dati societari',
    ragioneSociale: 'Ragione sociale',
    partitaIva: 'Partita IVA',
  },

  piede: {
    pagine: 'Pagine',
    orari: 'Orari',
    dove: 'Dove',
    seguici: 'Seguici',
    privacy: 'Privacy',
    cookie: 'Cookie',
    partitaIva: 'P. IVA',
    credito: 'Sito di Prisma Locale',
  },

  foto: {
    daScattare: 'Foto da scattare',
    archivio: "Foto d'archivio da recuperare",
    provvisoria: 'Immagine provvisoria',
  },

  barra: { prenota: 'Prenota il tuo tavolo', chiama: 'Chiama' },
};

export type Dizionario = typeof it;
