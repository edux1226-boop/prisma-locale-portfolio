/* Accesso ai contenuti del CMS, già validati, con il filtro della modalità.

   In anteprima ogni dato ancora da confermare resta visibile ma porta il suo
   segno; in produzione semplicemente non esiste. I componenti non decidono
   nulla: chiedono un dato a `leggi()` e ricevono null se non va mostrato. */

import 'server-only';
import type { z } from 'zod';
import restaurantJson from '@/content/restaurant.json';
import orariJson from '@/content/opening-hours.json';
import menuJson from '@/content/menu.json';
import pranzoJson from '@/content/lunch-menu.json';
import storiaJson from '@/content/story.json';
import recensioniJson from '@/content/reviews.json';
import mediaJson from '@/content/media.json';
import pescatoJson from '@/content/pescato.json';
import {
  Restaurant, OpeningHours, Menu, LunchMenu, Story, Reviews, Media, Pescato,
  daConfermare, type Campo, type Stato, type MediaVoce,
} from '@/content/schema';
import { ANTEPRIMA } from './sito';

function valida<S extends z.ZodType>(nome: string, schema: S, dati: unknown): z.output<S> {
  const r = schema.safeParse(dati);
  if (!r.success) {
    const righe = r.error.issues.map((i) => `  · ${nome}.${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Contenuto non valido in content/${nome}.json:\n${righe}`);
  }
  return r.data;
}

export const ristorante = valida('restaurant', Restaurant, restaurantJson);
export const orari = valida('opening-hours', OpeningHours, orariJson);
export const menu = valida('menu', Menu, menuJson);
export const pranzo = valida('lunch-menu', LunchMenu, pranzoJson);
export const storia = valida('story', Story, storiaJson);
export const recensioni = valida('reviews', Reviews, recensioniJson);
export const media = valida('media', Media, mediaJson);
export const pescato = valida('pescato', Pescato, pescatoJson);

/** Un dato pronto per la pagina: il valore e se va segnato come da confermare. */
export type Dato<T> = { valore: T; daConfermare: boolean };

/** Il valore di un campo se può comparire in questa modalità, altrimenti null. */
export function leggi<T>(c: Campo<T>): Dato<T> | null {
  if (c.value === null || c.value === undefined) return null;
  if (c.status === 'confirmed') return { valore: c.value, daConfermare: false };
  return ANTEPRIMA ? { valore: c.value, daConfermare: true } : null;
}

/** Un elemento con stato proprio (piatto, capitolo, recensione) può comparire? */
export function visibile(x: { status: Stato }): boolean {
  return x.status === 'confirmed' || ANTEPRIMA;
}

/** In anteprima: il campo è vuoto e aspetta il dato (si mostra il segnaposto "da confermare"). */
export function inAttesa(c: Campo<unknown>): boolean {
  return ANTEPRIMA && c.status === 'needs_confirmation' && (c.value === null || c.value === undefined);
}

/** C'è almeno un servizio (pranzo o cena) da mostrare? */
export function orariVisibili(): boolean {
  return Boolean(leggi(orari.pranzo) || leggi(orari.cena));
}

export function voceMedia(id: string | null | undefined): MediaVoce | null {
  if (!id) return null;
  const v = media.voci.find((m) => m.id === id);
  if (!v) throw new Error(`content/media.json: manca la voce "${id}"`);
  return v;
}

/** Il nome del ristorante: sempre confermato, ma letto dal CMS. */
export const NOME = ristorante.nome.value ?? 'Trattoria Luciana';

/** Riepilogo di ciò che manca, per la nota dell'anteprima e per scripts/contenuti.ts. */
export function riepilogoDaConfermare() {
  const tutti = {
    restaurant: ristorante, 'opening-hours': orari, menu, 'lunch-menu': pranzo,
    story: storia, reviews: recensioni, media, pescato,
  };
  return Object.entries(tutti).map(([nome, dati]) => ({ nome, voci: daConfermare(nome, dati) }));
}
