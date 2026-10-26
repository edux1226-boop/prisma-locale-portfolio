/* Il menu di Morsi, ricostruito dal menu cartaceo (foto menu-cartaceo.webp).
   Unico file da aggiornare per voci, ingredienti e prezzi.

   - prezzo: numero in euro, oppure null → in pagina compare "—". Non inventare i prezzi.
   - I prezzi presenti vengono da Deliveroo (snapshot indicizzati): INDICATIVI, da confermare.
   - pz: quantità tra parentesi del menu cartaceo; dove poco leggibile resta "da confermare".
   - La voce "Onion" è su Deliveroo ma NON nel menu cartaceo: non va messa qui. */

export const NOTA_PREZZI = 'Prezzi indicativi, da confermare con i titolari.';

export const FORMATI = { 1: 'x1', 2: 'x2', 3: 'x3', 4: 'x4' };

export const CATEGORIE = [
  {
    id: 'smash',
    scheda: 'Smash burgers',
    titolo: 'Smash burgers',
    // FOTO: smash burger singolo, 4:5, sfondo carta con faccine (sostituisce segnaposto-smash.svg)
    figura: 'smash',
    gruppi: [
      {
        titolo: 'Basic smash',
        formati: [1, 2],
        voci: [
          { nome: 'Cheesy', ingredienti: 'smash burger, cheddar, ketchup, maionese', prezzo: 7.9 },
          {
            nome: 'Cheese Bacon',
            ingredienti: 'smash burger, cheddar, cetriolo, cipolla, bacon, salsa Morsi',
            prezzo: 9.5,
            bestSeller: true,
          },
        ],
      },
      {
        titolo: 'Special smash',
        formati: [2, 3],
        prezzoNota: 'Doppio smash: circa 12–13 €',
        voci: [
          {
            nome: 'Old school',
            ingredienti: 'doppio smash burger, cheddar, senape al miele artigianale, ketchup, cetrioli',
            prezzo: null,
          },
          {
            nome: 'Oklahoma',
            ingredienti: 'doppio smash burger, cheddar, cipolla stufata, senape al miele artigianale, ketchup',
            prezzo: null,
            bestSeller: true,
          },
          {
            nome: 'Classic',
            ingredienti: 'doppio smash burger, cheddar, pomodoro, cipolla, insalata, ketchup, maionese',
            prezzo: null,
          },
        ],
      },
    ],
  },
  {
    id: 'veggy',
    scheda: 'Veggy',
    titolo: 'Veggy burger',
    // FOTO: veggy burger, 4:5 (sostituisce segnaposto-veggy.svg)
    figura: 'veggy',
    gruppi: [
      {
        titolo: 'Veggy burger',
        formati: [1, 2],
        voci: [
          { nome: 'Veggy', ingredienti: 'veggy burger, cheddar, cipolla, insalata, ketchup', prezzo: null, veggy: true },
        ],
      },
    ],
  },
  {
    id: 'chicken',
    scheda: 'Chicken',
    titolo: 'Chicken sandwiches',
    // FOTO: chicken sandwich con pollo fritto, 4:5 (sostituisce segnaposto-chicken.svg)
    figura: 'chicken',
    gruppi: [
      {
        titolo: 'Chicken sandwiches',
        voci: [
          { nome: 'Chicken simply', ingredienti: 'pollo fritto, cheddar, cetrioli, salsa Morsi', prezzo: null },
          {
            nome: 'Chicken salad',
            ingredienti: 'pollo fritto, coleslaw di insalata, cipolla e cetriolo, maionese, grana',
            prezzo: null,
            bestSeller: true,
          },
        ],
      },
    ],
  },
  {
    id: 'melt',
    scheda: 'Melt',
    titolo: 'Melt sandwiches',
    nuovo: true,
    box: true, // riquadro a bordo tratteggiato, come sul menu cartaceo
    figura: 'foto-melt', // c’è la foto vera del Morsi Melt
    gruppi: [
      {
        titolo: 'Melt sandwiches',
        voci: [
          {
            nome: 'Chicken melt',
            ingredienti: 'pollo fritto, doppio cheddar, cipolla stufata, insalata, maionese giapponese, grana',
            prezzo: null,
          },
          {
            nome: 'Patty melt',
            ingredienti: 'doppio smash, triplo cheddar, bacon, cipolla stufata, maionese giapponese',
            prezzo: null,
            bestSeller: true,
          },
          {
            nome: 'Morsi melt',
            ingredienti: 'doppio smash, cipolla, bacon, uovo fritto, doppio cheddar, cetriolo, salsa Morsi',
            prezzo: 15,
            firma: true,
          },
          {
            nome: 'Shoku supreme',
            ingredienti: '4 smash burger, 4 cheddar, cetriolo, salsa Morsi',
            prezzo: null,
            formati: [4],
          },
        ],
      },
    ],
  },
  {
    id: 'sides',
    scheda: 'Sides',
    titolo: 'Sides',
    // FOTO: tagliere di sides (tequeños, jalapeño pops, chicken pops), 4:5 (sostituisce segnaposto-sides.svg)
    figura: 'sides',
    gruppi: [
      {
        titolo: 'Sides',
        voci: [
          { nome: 'Tequeños', ingredienti: 'formaggio fritto venezuelano', pz: '2 pz', prezzo: null },
          { nome: 'Jalapeño pops', ingredienti: 'crocchette di jalapeño e cheddar', pz: 'pz da confermare', prezzo: null },
          { nome: 'Chicken pops', ingredienti: 'pop corn di pollo fritto', pz: 'pz da confermare', prezzo: 7.9 },
          {
            nome: 'Fried chicken',
            ingredienti: 'fusi di pollo fritto, serviti con patatine e salsa bbq',
            pz: 'pz da confermare',
            prezzo: null,
          },
        ],
      },
    ],
  },
  {
    id: 'fries',
    scheda: 'Fries',
    titolo: 'Fries',
    // FOTO: patatine cheddar e bacon, 4:5 (sostituisce segnaposto-fries.svg)
    figura: 'fries',
    gruppi: [
      {
        titolo: 'Fries',
        voci: [
          { nome: 'Classic fries', ingredienti: 'patatine fritte', prezzo: 5.5, prezzoDa: true },
          { nome: 'Cheesy pepper', ingredienti: 'patatine fritte, grana e pepe', prezzo: null },
          { nome: 'Cheddar e bacon', ingredienti: 'patatine fritte, salsa cheddar, bacon', prezzo: 6.5 },
          {
            nome: 'Jalapeño cheese',
            ingredienti: 'patatine fritte, polvere di peperoncino, salsa cheddar, jalapeño',
            prezzo: null,
          },
          {
            nome: 'Chopped cheese fries',
            ingredienti: 'patatine fritte, smash burger chopped, cipolla, salsa cheddar, salsa Morsi',
            prezzo: null,
          },
        ],
      },
    ],
  },
  {
    id: 'dolci',
    scheda: 'Desserts',
    titolo: 'Desserts',
    // FOTO: nutella sandwich, 4:5 (sostituisce segnaposto-dolci.svg)
    figura: 'dolci',
    gruppi: [
      { titolo: 'Desserts', voci: [{ nome: 'Nutella sandwich', ingredienti: 'pane e Nutella', prezzo: null }] },
    ],
  },
  {
    id: 'drinks',
    scheda: 'Drinks',
    titolo: 'Drinks',
    // FOTO: bevande in vetro e birre, 4:5 (sostituisce segnaposto-drinks.svg)
    figura: 'drinks',
    gruppi: [
      {
        titolo: 'Drinks',
        elenco: [
          'Acqua',
          'Bevande in lattina analcoliche',
          'Coca-Cola, Sprite, Fanta in vetro',
          'Birra',
          'Birre speciali',
        ],
      },
    ],
  },
];

export const FORMULA = {
  titolo: 'Tutti i panini anche in formula menu',
  testo: 'panino + patatine + bevanda',
  prezzoNota: 'Menu indicativamente da circa 13,50 a 19 €',
  extra: ['extra cheddar patatine', 'extra cheddar e bacon patatine', 'extra grana e pepe patatine'],
};

export const AGGIUNTE = {
  titolo: 'Aggiunte extra',
  voci: ['salse', 'vegetali', 'proteine', 'jalapeño', 'formaggi', 'salse speciali (monodose)', 'salse XL', 'bacon'],
  invito: 'Fame extralarge? Aggiungi smash burger extra',
};

export const BEST_SELLER = ['Cheese Bacon', 'Oklahoma', 'Chicken salad', 'Patty melt'];
