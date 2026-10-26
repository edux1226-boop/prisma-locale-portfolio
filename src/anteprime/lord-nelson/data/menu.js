/* Menu del Lord Nelson: unico punto da cambiare per piatti e prezzi.
   Fonte: le due pagine del menu cartaceo fornite dai titolari (solo i contenuti, non l'impaginazione).
   Le categorie con `daCompletare` sono segnaposto: il menu completo non è stato fornito. */
export const CONTATTI = {
  via: 'via Volturno 107',
  cap: '64025', // da verificare
  citta: 'Scerne di Pineto',
  provincia: 'TE',
  tel: '348 822 6928',
  telHref: 'tel:+393488226928',
  whatsapp: 'https://wa.me/393488226928',
  mappe: 'https://www.google.com/maps/search/?api=1&query=Lord+Nelson+via+Volturno+107+Scerne+di+Pineto',
};

export const prenota = (testo = 'Ciao Lord Nelson, vorrei prenotare un tavolo per') =>
  `${CONTATTI.whatsapp}?text=${encodeURIComponent(testo)}`;

/* Le voci "livello" sono anche l'indice del boccale nella sezione della spillatura. */
export const MENU = [
  {
    id: 'al-piatto',
    titolo: 'Al piatto',
    nota: 'Tutti con patate o insalata, dove indicato.',
    voci: [
      { nome: 'Hamburger', dettaglio: 'con patate o insalata', prezzo: 8.5 },
      { nome: 'Würstel', dettaglio: 'con patate o insalata', prezzo: 8.5 },
      { nome: 'Cotoletta di pollo', dettaglio: 'con patate o insalata', prezzo: 8.5 },
      { nome: 'Cheese-bacon burger', dettaglio: 'con patate o insalata', prezzo: 10 },
      { nome: 'Lord Nelson', dettaglio: 'il piatto della casa', prezzo: 8.5, daConfermare: 'ingredienti da confermare' },
    ],
  },
  { id: 'big', titolo: 'I Big', nota: 'Sei panini regionali, tutti a 13 €.', vedi: '#big' },
  { id: 'panini', titolo: 'Panini', daCompletare: true },
  { id: 'fritti', titolo: 'Fritti', daCompletare: true },
  { id: 'bevande', titolo: 'Bevande', daCompletare: true },
];

/* I Big: nome, prezzo e regione dal menu; gli ingredienti non sono stati forniti. */
export const BIG_PREZZO = 13;
export const BIG = [
  { id: 'americano', nome: 'Americano', regione: 'Stati Uniti' },
  { id: 'campano', nome: 'Campano', regione: 'Campania' },
  { id: 'norcino', nome: 'Norcino', regione: 'Norcia, Umbria' },
  { id: 'ligure', nome: 'Ligure', regione: 'Liguria' },
  { id: 'piemontese', nome: 'Piemontese', regione: 'Piemonte' },
  { id: 'veneto', nome: 'Veneto', regione: 'Veneto' },
];
