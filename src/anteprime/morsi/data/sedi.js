/* Le due sedi di Morsi. Unica fonte per: selettore sede, schede "Dove siamo", footer e JSON-LD.
   Ogni dato incerto ha daConfermare: true (dossier dell'anteprima, livelli ✅ / 🟡 / ⚠️).
   Non usare mai "Via Thaulero 7": è di un altro locale. */

const ORARI_SERA = {
  testo: 'Ogni sera dalle 19:00 alle 24:00, il sabato fino all’1:00',
  breve: 'Sera, 19:00–24:00 · sab fino all’1:00',
  // per il JSON-LD: giorni schema.org, apertura, chiusura. Il martedì non c'è: è chiuso.
  fasce: [
    { giorni: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'], apre: '19:00', chiude: '00:00' },
    { giorni: ['Saturday'], apre: '19:00', chiude: '01:00' },
  ],
  daConfermare: true,
  nota: 'Orari in conflitto tra le fonti: prevale l’apertura serale.',
};

export const SOCIAL = {
  instagram: 'https://www.instagram.com/morsi_burger/',
  facebook: 'https://www.facebook.com/p/Morsi-Burger-61552469562181/',
};

export const DELIVEROO_ROSETO = 'https://deliveroo.it/it/menu/roseto-degli-abruzzi/roseto-degli-abruzzi/morsi-roseto';

export const SEDI = {
  pineto: {
    id: 'pineto',
    nome: 'Pineto',
    etichetta: 'Sede storica',
    via: 'Via Gabriele D’Annunzio 117',
    cap: '64025',
    citta: 'Pineto',
    provincia: 'TE',
    viaDaConfermare: true,
    viaNota: 'Il civico 117 è quello ufficiale su Instagram; altre fonti riportano il 115.',
    tel: '328 783 7652',
    telDaConfermare: false,
    orari: ORARI_SERA,
    chiusura: 'Martedì chiuso',
    deliveroo: null, // non risulta una scheda di delivery per Pineto
    deliverooDaConfermare: false,
    // Pineto è a sud della foce del Vomano, Roseto a nord.
    mappa: { x: 296, y: 372 },
  },
  roseto: {
    id: 'roseto',
    nome: 'Roseto degli Abruzzi',
    etichetta: 'Nuova sede',
    via: 'Via G. Di Giorgio 5/7',
    cap: '64026',
    citta: 'Roseto degli Abruzzi',
    provincia: 'TE',
    viaDaConfermare: false,
    viaNota: 'In centro.',
    tel: null, // da confermare: non usare quello di Pineto
    telDaConfermare: true,
    orari: ORARI_SERA,
    chiusura: 'Martedì chiuso',
    deliveroo: DELIVEROO_ROSETO,
    deliverooDaConfermare: true, // esistono due schede Deliveroo: da confermare quale è attiva
    mappa: { x: 318, y: 150 },
  },
};

export const SEDE_PREDEFINITA = 'pineto';
export const ORDINE_SEDI = ['pineto', 'roseto'];

export const indirizzoCompleto = (s) => `${s.via}, ${s.cap} ${s.citta} (${s.provincia})`;
export const linkIndicazioni = (s) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`Morsi, ${indirizzoCompleto(s)}`)}`;
export const linkTel = (s) => (s.tel ? `tel:+39${s.tel.replace(/\s/g, '')}` : null);
