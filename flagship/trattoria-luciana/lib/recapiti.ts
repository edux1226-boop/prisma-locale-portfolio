import 'server-only';
import { ristorante, leggi, inAttesa, NOME, type Dato } from './contenuti';
import { telefonoLeggibile } from './formato';

/* Recapiti e collegamenti pronti per la pagina, già filtrati per modalità. */

const ind = ristorante.indirizzo.value;

/** "Lungomare Trieste 60" */
export const VIA = ind?.via ?? '';
/** "64026 Roseto degli Abruzzi (TE)" */
export const CITTA = ind ? `${ind.cap} ${ind.citta} (${ind.provincia})` : '';
export const INDIRIZZO = `${VIA}, ${CITTA}`;

const query = encodeURIComponent(`${NOME}, ${VIA}, ${ind?.cap ?? ''} ${ind?.citta ?? ''}`);
export const LINK_MAPPA = `https://www.google.com/maps/search/?api=1&query=${query}`;
export const LINK_INDICAZIONI = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

export type Recapito = Dato<{ href: string; testo: string }>;

export function telefono(): Recapito | null {
  const d = leggi(ristorante.telefono);
  return d && { daConfermare: d.daConfermare, valore: { href: `tel:${d.valore}`, testo: telefonoLeggibile(d.valore) } };
}

export function email(): Recapito | null {
  const d = leggi(ristorante.email);
  return d && { daConfermare: d.daConfermare, valore: { href: `mailto:${d.valore}`, testo: d.valore } };
}

/** WhatsApp compare soltanto con il numero confermato (in anteprima, segnato). */
export function whatsapp(messaggio: string): Recapito | null {
  const d = leggi(ristorante.whatsapp);
  if (!d) return null;
  const numero = d.valore.replace(/\D/g, '');
  return {
    daConfermare: d.daConfermare,
    valore: { href: `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`, testo: telefonoLeggibile(d.valore) },
  };
}

/** In anteprima: il recapito non c'è ancora e va mostrato il suo posto vuoto. */
export const attesa = {
  telefono: () => inAttesa(ristorante.telefono),
  email: () => inAttesa(ristorante.email),
  whatsapp: () => inAttesa(ristorante.whatsapp),
  instagram: () => inAttesa(ristorante.social.instagram),
  facebook: () => inAttesa(ristorante.social.facebook),
};

export function social() {
  return {
    instagram: leggi(ristorante.social.instagram),
    facebook: leggi(ristorante.social.facebook),
  };
}
