import type { Dizionario } from './it';

export const en: Dizionario = {
  meta: {
    pagine: {
      home: {
        titolo: 'Trattoria Luciana · Seafood restaurant on the seafront of Roseto degli Abruzzi',
        descrizione: "The Ruggieri family's seafood trattoria on Lungomare Trieste in Roseto degli Abruzzi. The day's catch, home recipes, Luciana's lunch. Book your table.",
      },
      storia: {
        titolo: 'Our story · Trattoria Luciana',
        descrizione: 'The Ruggieri family and their trattoria on the seafront of Roseto degli Abruzzi: a story of the sea and home cooking.',
      },
      menu: {
        titolo: 'Menu · Trattoria Luciana, Roseto degli Abruzzi',
        descrizione: "Trattoria Luciana's menu: seafood starters, spaghetti with clams, brodetto, fried small catch and Abruzzo wines. With allergens and dish of the day.",
      },
      mare: {
        titolo: 'The sea · Trattoria Luciana',
        descrizione: "The Adriatic at Roseto degli Abruzzi, its fishing and the calendar of the catch: the sea that sets Trattoria Luciana's menu.",
      },
      prenota: {
        titolo: 'Book your table · Trattoria Luciana',
        descrizione: 'Book at Trattoria Luciana in Roseto degli Abruzzi, by phone or with an online request. We will confirm your table.',
      },
      contatti: {
        titolo: 'Contact and opening hours · Trattoria Luciana',
        descrizione: 'Address, opening hours, phone and directions for Trattoria Luciana, Lungomare Trieste 60, Roseto degli Abruzzi.',
      },
    },
  },

  comune: {
    salta: 'Skip to content',
    tagline: 'From the sea, to the table.',
    prenota: 'Book your table',
    prenotaBreve: 'Book',
    chiama: 'Call',
    whatsapp: 'WhatsApp',
    menu: 'Menu',
    chiudi: 'Close',
    nuovaScheda: '(opens in a new tab)',
    daConfermare: 'to be confirmed',
    daCollegare: 'to be linked',
    lingua: 'Language',
    scorri: 'Scroll',
    scena: 'Scene',
    torna: 'Back to top',
    marchio: 'Trattoria Luciana, home page',
  },

  nav: { home: 'Home', storia: 'Story', menu: 'Menu', mare: 'The sea', contatti: 'Contact', prenota: 'Book' },

  giorni: { lun: 'Monday', mar: 'Tuesday', mer: 'Wednesday', gio: 'Thursday', ven: 'Friday', sab: 'Saturday', dom: 'Sunday' },
  giorniBrevi: { lun: 'Mon', mar: 'Tue', mer: 'Wed', gio: 'Thu', ven: 'Fri', sab: 'Sat', dom: 'Sun' },
  mesi: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  mesiInteri: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  orari: {
    titolo: 'Opening hours',
    pranzo: 'Lunch',
    cena: 'Dinner',
    chiusura: 'Closed on',
    chiuso: 'Closed',
    stagione: 'Season',
    dalleAlle: '{dalle}–{alle}',
  },

  recapiti: {
    indirizzo: 'Address',
    telefono: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    indicazioni: 'Directions',
    mappa: 'Open in Google Maps',
    instagram: 'Instagram',
    facebook: 'Facebook',
  },

  home: {
    hero: {
      scena: 'The sea',
      luogo: 'Roseto degli Abruzzi',
      sotto: 'Seafood and family cooking on the seafront of Roseto degli Abruzzi.',
    },
    intro: {
      scena: 'A family story',
      righe: ['On the seafront of Roseto', 'there is a table laid', 'facing the Adriatic.'],
      testo: "The cooking is home cooking, the fish is the day's catch, the family is the Ruggieri family. People come to Luciana's to eat well, unhurried, with the sea a few steps away.",
    },
    territorio: {
      scena: 'The land',
      titolo: 'The sea in front, the Gran Sasso behind.',
      voci: [
        {
          nome: 'Roseto',
          sotto: 'degli Abruzzi',
          testo: 'A long, pale beach, a palm-lined seafront, a town that lives by the sea all summer.',
        },
        {
          nome: 'Adriatic',
          sotto: 'our sea',
          testo: 'A shallow, generous sea: anchovies, cuttlefish, red mullet, mantis shrimp, clams. It changes with the seasons, and the menu changes with it.',
        },
        {
          nome: 'Abruzzo',
          sotto: 'our land',
          testo: 'Behind us, the hills and the mountains. From the land come the oil, the wine, the vegetables.',
        },
      ],
    },
    storia: {
      scena: 'The family',
      titolo: 'The Ruggieri family',
      testo: 'You can tell a family trattoria by the small things: whoever greets you remembers you, there is always someone from the family in the kitchen, recipes pass from hand to hand.',
      dal: 'Since',
      allora: 'Then',
      oggi: 'Now',
      link: 'Read our story',
    },
    cucina: {
      scena: 'From the catch to the table',
      titolo: 'From the catch to the table',
      intro: 'The journey is short, and it has to stay that way.',
      passi: [
        { titolo: 'The sea', testo: 'The menu is decided in the morning, looking at what the sea has given.' },
        { titolo: 'The choice', testo: 'We take the fish that is in season, the fish that deserves it. The rest waits for its moment.' },
        { titolo: 'The kitchen', testo: 'Home recipes, the right timing, nothing that hides the taste of the sea.' },
        { titolo: 'The table', testo: 'The dish arrives the way it should: straight away, hot, with the sea in front of you.' },
      ],
    },
    menu: {
      scena: 'The menu',
      titolo: 'A short menu that follows the sea.',
      testo: 'A few dishes, done well, that change with the catch and with the seasons.',
      link: 'The full menu',
      nota: "Dishes and prices may change depending on the day's catch.",
    },
    pranzo: {
      scena: "Luciana's lunch",
      titolo: "Luciana's lunch",
      testo: 'At midday, a set menu the way it is made at home: whatever the kitchen has prepared that day, at an honest price. For people at work, people passing through, people on holiday who want to eat the way Roseto eats.',
      giorni: 'Days',
      orario: 'Time',
      prezzo: 'Price',
      comprende: 'Includes',
      oggi: 'On the table today',
      aPersona: 'per person',
      portate: { primo: 'First', secondo: 'Main', contorno: 'Side', dolce: 'Dessert' },
    },
    atmosfera: {
      scena: 'Atmosphere',
      titolo: 'The dining room, the pergola, the sea.',
      luoghi: [
        { nome: 'The dining room', testo: 'Bright and simple, for winter lunches and long dinners.' },
        { nome: 'The pergola', testo: 'In the shade in summer, with the breeze coming off the beach.' },
        { nome: 'The sea', testo: 'Right in front, always. Just look up from your plate.' },
      ],
    },
    voci: {
      scena: "Our guests' words",
      titolo: "Our guests' words",
      sintesi: '{numero} reviews on {fonte}',
      su: 'out of {su}',
      esempio: 'Sample review',
      sostituire: 'to be replaced with a verified review',
      fonti: { google: 'Google', tripadvisor: 'Tripadvisor', thefork: 'TheFork', altro: 'Review' },
      leggi: 'Read the review',
    },
    dove: {
      scena: 'Where we are',
      titolo: 'Lungomare Trieste 60',
      testo: 'On the seafront of Roseto degli Abruzzi, facing the beach.',
      mappa: {
        descrizione: 'Schematic map: Lungomare Trieste runs along the beach of Roseto degli Abruzzi, with the Adriatic Sea to the east. The pin marks Trattoria Luciana at number 60.',
        mare: 'Adriatic Sea',
        lungomare: 'Lungomare Trieste',
        spiaggia: 'Beach',
        citta: 'Roseto degli Abruzzi',
        nord: 'N',
        nonInScala: 'Not to scale.',
      },
    },
    cta: {
      scena: 'The table',
      righe: ['Book', 'your table'],
      testo: 'Call us, message us or send a request online: we will confirm your table.',
    },
  },

  percorsi: {
    telefono: { titolo: 'Phone', testo: 'The quickest way: we will tell you straight away if there is room.' },
    whatsapp: { titolo: 'WhatsApp', testo: 'Send us the date, time and number of people: we will reply as soon as we can.' },
    online: { titolo: 'Online request', testo: 'Leave your details: we will get back to you to confirm your table.', azione: 'Fill in the request' },
    motore: { azione: 'Book online' },
    whatsappTesto: 'Hello, I would like to book a table.',
  },

  prenota: {
    sopra: 'Bookings',
    titolo: 'Book your table',
    intro: 'Three ways, one table. For tonight, the phone is the quickest.',
    modulo: {
      titolo: 'Booking request',
      avviso: 'This is a request, not a confirmation: the table is yours once we call or write to confirm it.',
      campi: {
        nome: 'Full name',
        telefono: 'Phone',
        email: 'Email',
        data: 'Date',
        ora: 'Time',
        persone: 'Guests',
        allergie: 'Allergies or intolerances',
        note: 'Notes',
      },
      aiuti: {
        telefono: 'We will call this number to confirm.',
        persone: 'More than 12 people? Call us and we will arrange the table.',
        allergie: 'For example: coeliac disease, crustaceans, tree nuts.',
        note: 'A high chair, a birthday, a table under the pergola…',
      },
      facoltativo: 'optional',
      scegliOra: 'Choose a time',
      privacy: 'We only use your details to reply to this request.',
      informativa: 'Privacy notice',
      invia: 'Send request',
      invio: 'Sending…',
      errori: {
        riepilogo: 'Please check the highlighted fields.',
        nome: 'Please enter your name.',
        telefono: 'Please enter a valid phone number.',
        email: 'Please check the email address.',
        data: 'Please choose a date from today onwards.',
        dataChiusura: 'We are closed that day: please choose another date.',
        ora: 'Please choose a time.',
        persone: 'Please enter the number of guests, from 1 to 12.',
        invio: 'The request did not go through. Please try again shortly or call us.',
      },
      successo: {
        titolo: 'Request sent',
        testo: 'Thank you, {nome}. This is not a booking yet: we will contact you on {telefono} to confirm your table.',
        riepilogo: 'Your request',
        nuova: 'Send another request',
      },
      anteprima: 'Preview: the form checks your details but sends nothing.',
    },
  },

  storia: {
    sopra: 'Our story',
    titolo: 'The Ruggieri family',
    intro: 'Every trattoria has a story. This one bears a name, Luciana, and has the sea in front of it.',
    capitolo: 'Chapter',
    annoDaConfermare: 'year to be confirmed',
    chiusura: 'The story continues at the table.',
  },

  menu: {
    sopra: 'The menu',
    titolo: 'The menu',
    intro: 'A short menu that follows the catch and the seasons. Ask for the dish of the day.',
    vaiA: 'Sections',
    legenda: 'Key',
    allergeniTitolo: 'Allergens',
    allergeniNota: 'If you have allergies or intolerances, please tell our staff before ordering: allergen information (EU Regulation 1169/2011) is available in the restaurant.',
    piattoDelGiorno: 'Dish of the day',
    coperto: 'Cover charge',
    prezzi: 'Prices in euros.',
    vuoto: "The menu changes with the sea: call us to find out what's on today.",
    contiene: 'Contains',
  },

  disponibilita: { sempre: '', pescato: 'Depending on the catch', stagione: 'In season', esaurito: 'Sold out today' },
  unita: { porzione: '', etto: 'per 100 g', bottiglia: 'bottle', calice: 'by the glass' },

  allergeni: {
    glutine: 'Gluten', crostacei: 'Crustaceans', uova: 'Eggs', pesce: 'Fish', arachidi: 'Peanuts',
    soia: 'Soy', latte: 'Milk', 'frutta-a-guscio': 'Tree nuts', sedano: 'Celery', senape: 'Mustard',
    sesamo: 'Sesame', solfiti: 'Sulphites', lupini: 'Lupin', molluschi: 'Molluscs',
  },

  mare: {
    sopra: 'The sea',
    titolo: 'The Adriatic at Roseto',
    intro: 'Shallow, sandy, generous. The sea you see from your table is the same sea that sets the menu.',
    capitoli: [
      {
        titolo: 'A shallow sea',
        testo: 'Off Roseto the seabed slopes gently: pale sand, water that warms up early, a sea that belongs to everyone in summer. Further out lie the grounds of red mullet, sole and mantis shrimp.',
      },
      {
        titolo: 'Fishing',
        testo: 'The trawl nets of the paranza, the small boats of inshore fishing, the clams gathered along the shore: on this coast the sea is worked like this, every day.',
      },
    ],
    calendario: {
      titolo: 'The sea calendar',
      testo: 'Every fish has its moment. Below, when each one is usually at its best: the kitchen follows it.',
      indicativo: 'A guide only: the sea does not read calendars.',
      fermo: 'Fishing ban',
      stagione: 'Best season',
      specie: 'Species',
    },
    rispetto: {
      titolo: "Tomorrow's sea",
      testo: "Eating in season also means respecting fishing bans and minimum sizes. Tomorrow's sea depends on today's dishes.",
    },
  },

  contatti: {
    sopra: 'Contact',
    titolo: 'Come and see us',
    intro: 'On Lungomare Trieste, in Roseto degli Abruzzi. The quickest way to book is still the phone.',
    comeArrivare: 'Getting here',
    auto: { titolo: 'By car', testo: 'A14 motorway, Roseto degli Abruzzi exit, then head for the seafront.' },
    treno: { titolo: 'By train', testo: 'Roseto degli Abruzzi station, on the Adriatic line.' },
    seguici: 'Follow us',
    legale: 'Company details',
    ragioneSociale: 'Company name',
    partitaIva: 'VAT number',
  },

  piede: {
    pagine: 'Pages',
    orari: 'Opening hours',
    dove: 'Where',
    seguici: 'Follow us',
    privacy: 'Privacy',
    cookie: 'Cookies',
    partitaIva: 'VAT',
    credito: 'Website by Prisma Locale',
  },

  foto: {
    daScattare: 'Photo to be taken',
    archivio: 'Archive photo to be found',
    provvisoria: 'Provisional image',
  },

  barra: { prenota: 'Book your table', chiama: 'Call' },
};
