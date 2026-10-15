/* LA CARTA DI ANIMA CONCEPT PIZZA — unico file da modificare per il menu.

   Fonte: menu ufficiale in PDF del 16/12/2025 (sito del locale) e menu su
   TheFork aggiornato al 9/1/2026, raccolti nel brief del 14/10/2026.
   Prezzi e voci vanno riconfermati dal locale prima della pubblicazione.

   - prezzo: numero in euro, oppure una lista di { etichetta, prezzo };
   - all: codici allergeni come stampati sul menu del locale. Non sono i
     numeri dell'allegato II del Reg. UE 1169/2011 in ordine: la legenda è
     quella del menu del locale e va ricopiata da lì, non ricostruita.
     Lista vuota = codici non riportati nella fonte (non "senza allergeni");
   - tag: 'veg' solo per le voci che il menu dichiara vegetariane,
     'abruzzo' per gli ingredienti abruzzesi nominati nel menu.

   La pagina viene generata da questo file al build (vedi build/carta.js):
   il menu resta HTML vero, leggibile anche senza JavaScript. */

export const FONTE = {
  data: '16 dicembre 2025',
  pdf: 'https://www.animaconceptpizza.it/wp-content/uploads/2025/12/Anima-Menu-nuovi_161225.pdf',
};

export const SEZIONI = [
  {
    id: 'antipasti',
    titolo: 'Antipasti',
    breve: 'Antipasti',
    intro: 'Fritti e piccoli assaggi, per cominciare.',
    voci: [
      { nome: 'Crocchè ripieno', desc: 'Mozzarella fiordilatte, patate e prosciutto cotto', prezzo: 1.5, all: [] },
      { nome: 'Arancino artigianale', desc: 'Tartufo e salsiccia, oppure zucca, provola e guanciale', prezzo: 3.5, all: [] },
      { nome: 'Montanare', desc: 'Tre frittelline farcite con affettati, stracciatella o verdure', prezzo: 5, all: [] },
      { nome: 'Patatine classiche', desc: 'Patatine a stick', prezzo: 4, all: [] },
      { nome: 'Patatine barchetta', desc: 'Con la buccia, leggermente curve', prezzo: 4.5, all: [] },
    ],
  },
  {
    id: 'antipasti-introvabili',
    titolo: 'Antipasti introvabili',
    breve: 'Introvabili',
    scura: true,
    intro: 'Così li chiama il menu: maritozzi salati al lievito madre e la teglia ripiena.',
    voci: [
      {
        nome: 'Maritozzo mortadella',
        desc: 'Maritozzo salato al lievito madre, impasto al pistacchio e polvere di pomodoro; stracciatella, mortadella, polvere e crema di pistacchio',
        prezzo: 5,
        all: [2, 4, 7],
      },
      {
        nome: 'Maritozzo porchetta',
        desc: 'Maritozzo salato al lievito madre, impasto al pistacchio e polvere di pomodoro; bufala, porchetta di Ariccia IGP e pomodoro secco',
        prezzo: 5,
        all: [],
      },
      {
        nome: 'Super Crunch',
        desc: 'Teglia romana ripiena, super croccante: porchetta di Ariccia IGP, bufala campana DOP, misticanza e pomodorini confit',
        prezzo: [
          { etichetta: '2 tranci', prezzo: 7 },
          { etichetta: '4 tranci', prezzo: 14 },
        ],
        all: [],
      },
    ],
  },
  {
    id: 'speciali',
    titolo: 'Pizze speciali',
    breve: 'Speciali',
    intro: 'Gli abbinamenti della casa.',
    voci: [
      { nome: 'Navelli', desc: 'Mozzarella fiordilatte, zafferano, porcini, noci, pecorino a scaglie', prezzo: 12.5, all: [2, 4, 7] },
      { nome: 'L’Amatriciana', desc: 'Mozzarella fiordilatte, pomodoro, cipolla, pancetta, pecorino a scaglie, olio piccante', prezzo: 12.5, all: [2, 4] },
      { nome: 'Amalfi', desc: 'Pomodoro, funghi freschi, bufala campana fuori cottura, pomodoro confit, basilico', prezzo: 11, all: [2, 4] },
      { nome: 'F.lli Valle', desc: 'Pomodoro, stracciatella, pesto di basilico, pomodorini confit', prezzo: 11, all: [2, 4] },
      { nome: 'Anima', desc: 'Pomodoro, stracciatella, olive taggiasche, pomodorini confit, misticanza, crostino di pane aromatizzato', prezzo: 12, all: [2, 4] },
      { nome: 'Mortadella', desc: 'Focaccia con stracchino, mortadella e pistacchi', prezzo: 11, all: [2, 4, 7] },
      { nome: 'Tartufo', desc: 'Mozzarella fiordilatte, crema di tartufo, caciocavallo, salsiccia', prezzo: 12, all: [2, 4] },
      { nome: 'Verdura di stagione', desc: 'Mozzarella fiordilatte e verdura di stagione', prezzo: 9.5, all: [2, 4], tag: ['veg'] },
      { nome: 'Carbonara', desc: 'Mozzarella fiordilatte, guanciale, salsa d’uovo, pecorino, pepe', prezzo: 12.5, all: [1, 2, 4] },
      { nome: 'Pomo d’Oro', desc: 'Salsa di pomodoro giallo, bufala in cottura, pomodorini pizzutello, grana padano in cottura, basilico', prezzo: 12.5, all: [2, 4] },
      { nome: 'Crudo', desc: 'Focaccia, stracciatella, crudo di Parma, pomodorini confit', prezzo: 12.5, all: [2, 4] },
      { nome: 'Carciofona', desc: 'Mozzarella fiordilatte, carciofi, guanciale, grana padano fuori cottura, pepe', prezzo: 12.5, all: [2, 4] },
      { nome: 'Viaggio al Sud', desc: 'Mozzarella fiordilatte, provola di Agerola, pomodoro secco, crema di pistacchio, tarallo napoletano sbriciolato', prezzo: 11.5, all: [2, 4, 7] },
      { nome: 'Por-no-zola', desc: 'Mozzarella fiordilatte, gorgonzola, porchetta di Ariccia, nocciole, olio al rosmarino', prezzo: 12.5, all: [2, 4, 7] },
      { nome: 'Armonia di Colori', desc: 'Salsa di pomodoro giallo, stracciatella, olive taggiasche, basilico cristallizzato, buccia di pomodoro essiccato', prezzo: 12, all: [2, 4], tag: ['veg'] },
      { nome: 'Pescara 2016', desc: 'Mozzarella fiordilatte, patate al cartoccio, caciocavallo, porchetta di Ariccia, glassa di aceto balsamico', prezzo: 12.5, all: [2, 4, 5] },
      { nome: 'Gustosa', desc: 'Crema di tartufo, mozzarella fiordilatte, prosciutto cotto arrosto alle erbe, taleggio, olio al rosmarino', prezzo: 12.5, all: [2, 4] },
      { nome: 'Estate', desc: 'Salsa di pomodoro giallo, alici del mar Cantabrico, cipolla caramellata, olive taggiasche, basilico, origano', prezzo: 12, all: [2, 11] },
      { nome: 'Ligure', desc: 'Pesto alla genovese, stracciatella, olive taggiasche, straccetti di pomodoro semidry, basilico', prezzo: 12.5, all: [] },
    ],
  },
  {
    id: 'introvabili',
    titolo: 'Pizze introvabili',
    breve: 'Pizze introvabili',
    scura: true,
    intro: 'Gli abbinamenti più insoliti della carta.',
    voci: [
      { nome: 'Caponata', desc: 'Caponata siciliana, ventricina di maialino nero, mozzarella di bufala DOP, basilico', prezzo: 14, all: [] },
      { nome: 'Zucca', desc: 'Crema di zucca, provola affumicata, pancetta, mandorle tostate', prezzo: 13, all: [] },
      { nome: 'Vegetariana 2.0', desc: 'Crema di zucca, radicchio, bufala fuori cottura, friarielli, olive taggiasche', prezzo: 13, all: [], tag: ['veg'] },
      { nome: 'Foglie d’Autunno', desc: 'Mozzarella fiordilatte, caciocavallo, verza, patate al cartoccio, chips di topinambur', prezzo: 12.5, all: [] },
      { nome: 'Puntarelle', desc: 'Mozzarella, puntarelle fresche, scorza di lime, alici del Cantabrico, bufala DOP, crostino di pane aromatizzato', prezzo: 14, all: [] },
      { nome: 'Cervo', desc: 'Mozzarella fiordilatte, crema di zafferano, salame di cervo, gocce di aglio nero d’Abruzzo', prezzo: 13.5, all: [], tag: ['abruzzo'] },
      { nome: 'Fiamma d’Abruzzo', desc: 'Mozzarella, pomodorini semi-dry, ventricina di maialino nero d’Abruzzo, provolone del monaco, basilico', prezzo: 13.5, all: [], tag: ['abruzzo'] },
      { nome: 'Zio Peperone', desc: 'Mozzarella fiordilatte, crema di peperone arrosto, guanciale, caciotta alle vinacce grattugiata', prezzo: 13.5, all: [] },
      { nome: 'Pulled Pork', desc: 'Crema di cavolo viola, mozzarella fiordilatte, pulled pork, julienne di carote e cavolo viola, cipolline croccanti', prezzo: 14, all: [] },
    ],
  },
  {
    id: 'padellino',
    titolo: 'Padellino',
    breve: 'Padellino',
    intro: 'Il Padellino Moderno: più alto e soffice, cotto nel suo tegamino.',
    voci: [
      { nome: 'F.lli Valle', desc: 'Pomodoro, stracciatella, pesto di basilico, pomodorini confit', prezzo: 15, all: [] },
      { nome: 'Amalfi', desc: 'Pomodoro, funghi freschi, bufala campana fuori cottura, pomodorino confit, basilico', prezzo: 15, all: [] },
      { nome: 'Pescara 2016', desc: 'Mozzarella fiordilatte, patate al cartoccio, caciocavallo, porchetta di Ariccia, glassa di aceto balsamico', prezzo: 15, all: [] },
      { nome: 'Mortadella', desc: 'Mortadella, pistacchi e stracchino', prezzo: 15, all: [] },
      { nome: 'Crudo', desc: 'Crudo di Parma, pomodoro confit, stracciatella', prezzo: 15, all: [] },
      { nome: 'Viaggio al Sud', desc: 'Mozzarella, pomodori secchi, pesto di pistacchio, provola affumicata, tarallo napoletano sbriciolato', prezzo: 15, all: [] },
      { nome: 'Pomo d’Oro', desc: 'Salsa di pomodoro giallo, bufala a crudo, pomodorino perla rossa, grana padano sciolto, basilico', prezzo: 15, all: [] },
      { nome: 'Armonia di Colori', desc: 'Salsa di pomodoro giallo, stracciatella, olive taggiasche, basilico cristallizzato, buccia di pomodoro essiccato', prezzo: 15, all: [], tag: ['veg'] },
      { nome: 'Vitel Tonnè', desc: 'Salsa tonnata fatta in casa, girello di vitello, polvere di pomodoro, prezzemolo riccio', prezzo: 16.5, all: [] },
      { nome: 'Alice nel Paese delle Meraviglie', desc: 'Stracciatella, alici del Cantabrico, origano, polvere di olive nere, foglia di cappero', prezzo: 16.5, all: [] },
      { nome: 'Abruzzese Doc', desc: 'Ventricina di maialino nero d’Abruzzo, cicoria saltata in padella, polvere di peperone dolce di Altino (Presidio Slow Food)', prezzo: 16.5, all: [], tag: ['abruzzo'] },
      { nome: 'Salmone Tartufato', desc: 'Crema di tartufo, stracciatella al tartufo, misticanza, salmone affumicato', prezzo: 16.5, all: [] },
      { nome: 'Estate', desc: 'Salsa di pomodoro giallo, alici del Cantabrico, cipolla caramellata, olive taggiasche, basilico, origano', prezzo: 15, all: [] },
      { nome: 'Ligure', desc: 'Pesto alla genovese, stracciatella, olive taggiasche, straccetti di pomodoro semidry, basilico', prezzo: 15.5, all: [] },
    ],
  },
  {
    id: 'pala-teglia',
    titolo: 'Pala e teglia romana',
    breve: 'Pala e teglia',
    intro: 'Da dividere al tavolo.',
    voci: [
      { nome: 'Pizza in pala, per due', desc: 'Due gusti a scelta tra le classiche e le speciali', prezzo: 28, all: [] },
      { nome: 'Super Crunch, 4 tranci', desc: 'Teglia romana super croccante con porchetta di Ariccia, bufala campana, misticanza e pomodorini confit', prezzo: 14, all: [] },
    ],
  },
  {
    id: 'classiche',
    titolo: 'Pizze classiche',
    breve: 'Classiche',
    intro: 'Quelle di sempre.',
    voci: [
      { nome: 'Focaccia', prezzo: 5, all: [] },
      { nome: 'Rossa', prezzo: 5, all: [] },
      { nome: 'Margherita', prezzo: 6.5, all: [] },
      { nome: 'Napoli', prezzo: 9, all: [] },
      { nome: 'Capricciosa', prezzo: 9.5, all: [] },
      { nome: 'Tonno e cipolla', prezzo: 9, all: [] },
      { nome: 'Patate e salsiccia', prezzo: 9, all: [] },
      { nome: 'Diavola', prezzo: 9, all: [] },
      { nome: 'Würstel', prezzo: 8.5, all: [] },
      { nome: 'Würstel e patatine', prezzo: 9.5, all: [] },
      { nome: 'Mais e cotto', prezzo: 8.5, all: [] },
      { nome: 'Friarielli e salsiccia', prezzo: 10, all: [] },
      { nome: 'Bufalina', prezzo: 9.5, all: [] },
      { nome: 'Quattro formaggi', prezzo: 9.5, all: [] },
      { nome: 'Cotto e funghi', prezzo: 9, all: [] },
    ],
  },
  {
    id: 'dolci',
    titolo: 'Dolci',
    breve: 'Dolci',
    intro: 'Classici e illusionistici, con il pasticcere Luca Rubicondo.',
    voci: [
      { nome: 'Hot Dog', desc: 'Brioche con crema pasticcera, “würstel” di cremoso al pistacchio in cioccolato ruby croccante, “ketchup” di gelée ai lamponi, “maionese” di crema pasticcera', prezzo: 8, all: [], tag: ['illusione'] },
      { nome: 'Pizza del Forno', desc: 'Brioche artigianale soffice, “pomodoro” di gelée di fragole, panna cotta al posto della mozzarella, menta fresca al posto del basilico', prezzo: 7, all: [], tag: ['illusione'] },
      { nome: 'Pizza Nutella & Galak', prezzo: 10, all: [] },
      { nome: 'Snickers a modo mio', desc: 'Semifreddo all’arachide con cuore al caramello salato, copertura di cioccolato fondente, arachidi e spugna al cacao', prezzo: 7, all: [1, 4, 7, 9] },
      { nome: 'Creomisù', desc: 'Tiramisù scomposto: namelaka al caffè, mousse al mascarpone, savoiardo croccante con zucchero moscovado e cacao', prezzo: 6, all: [1, 4] },
      { nome: 'Cheesecake', desc: 'Con confettura di albicocche, Nutella, caramello o crema di pistacchio (+0,50 €)', prezzo: 5.5, all: [1, 2, 3, 4, 7, 9] },
      { nome: 'Tiramisù Bueno', desc: 'Tiramisù glassato al cioccolato fondente, con Kinder Bueno e wafer alla nocciola', prezzo: 7, all: [1, 2, 4, 7] },
      { nome: 'O’Babà', desc: 'Babà napoletano con crema pasticciera al profumo di limone', prezzo: 5.5, all: [] },
    ],
  },
];

/* Da bere: categorie con esempi e prezzi indicativi (menu TheFork). */
export const BERE = {
  id: 'bere',
  titolo: 'Da bere',
  breve: 'Da bere',
  intro: 'Birre alla spina e artigianali, bibite biologiche, vini abruzzesi.',
  gruppi: [
    { nome: 'Birre del Birrificio Anima', esempi: 'Anastasia, Cleopatra, Dante, Leonardo, Newton, Mozart', prezzo: '6,50 €' },
    { nome: 'Birre alla spina', esempi: 'Bionda tedesca, bianca artigianale, IPA artigianale', prezzo: 'da 4,00 a 12,50 €' },
    { nome: 'Vino al calice', esempi: 'Rosso, bianco o rosato', prezzo: '4,50 €' },
    { nome: 'Vini in bottiglia', esempi: 'Trebbiano, Cerasuolo, Montepulciano, Passerina e altri; tra le cantine Faraone, Abbazia di Propezzano, Fattoria La Valentina', prezzo: 'da 16,50 a 35,00 €' },
    { nome: 'Bibite biologiche', esempi: 'Chinotto e aranciata bio Levico, Mole-cola, Gassosa Vittorio G', prezzo: '3,00 €' },
  ],
};
