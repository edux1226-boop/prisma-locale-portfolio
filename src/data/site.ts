import { z } from 'zod';

/** Segnaposto per ogni dato non confermato dal proprietario (vedi docs/DATI_DA_CONFERMARE.md). */
export const TODO = 'TODO_CONFERMARE';

const schema = z.object({
  name: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  province: z.string(),
  phoneDisplay: z.string(),
  phoneTel: z.string(),
  whatsapp: z.string().url(),
  email: z.string().email(),
  orderUrl: z.string().url(),
  mapsUrl: z.string().url(),
  facebook: z.string().url(),
  instagram: z.string().url(),
  tripadvisor: z.string().url(),
});

export const site = schema.parse({
  name: 'Grill Burger',
  street: 'Via Nazionale 531',
  postalCode: '64026',
  city: 'Roseto degli Abruzzi',
  province: 'TE',
  phoneDisplay: '351 592 8775',
  phoneTel: '+393515928775',
  whatsapp: 'https://wa.me/393515928775',
  email: 'info@grillburger.it', // fonte ufficiale; alternativa Tripadvisor discordante -> TODO_CONFERMARE
  orderUrl: 'https://www.grillburger.it/Ordina-online/',
  // Pin verificato da fornire dal proprietario (TODO_CONFERMARE): per ora ricerca per indirizzo
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Grill+Burger+Via+Nazionale+531+Roseto+degli+Abruzzi',
  facebook: 'https://www.facebook.com/p/Grill-Burger-100069037434790/',
  instagram: 'https://www.instagram.com/grillburger_it/',
  tripadvisor: 'https://www.tripadvisor.it/Restaurant_Review-g194888-d23444129-Reviews-Grill_Burger-Roseto_Degli_Abruzzi_Province_of_Teramo_Abruzzo.html',
});

/** Orari: il sito ufficiale dice solo "tutte le sere 19:00-23:30". Giorni effettivi da confermare. */
export const hours = { opens: '19:00', closes: '23:30' };

/** Dichiarazioni del locale (sito ufficiale): non sono certificazioni. */
export const claims = [
  'Pane bun al sesamo preparato ogni giorno',
  'Carne fresca macinata ogni giorno',
  'Salse fatte in casa',
  'Ribs cotte a bassa temperatura',
  'Tagli nazionali e internazionali, tra cui Picanha e Cube Roll',
  'Ispirazione sudamericana, dalle origini dei titolari',
] as const;

export const nav = [
  { href: '/menu/', label: 'Menu' },
  { href: '/#dove', label: 'Dove siamo' },
] as const;
