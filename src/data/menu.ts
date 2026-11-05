import { z } from 'zod';
import type { ImageMetadata } from 'astro';
import raw from './menu.json';

// Menu ufficiale (https://www.grillburger.it/Ordina-online/), letto il 5 novembre 2026.
// Generato da scripts/import-menu (opzioni, extra, formati e prezzi inclusi). Prezzi Glovo esclusi.
const option = z.object({ label: z.string(), delta: z.number() });
const group = z.object({ id: z.string(), label: z.string(), required: z.boolean(), options: z.array(option).min(2) });
const item = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  desc: z.string(),
  img: z.string().nullable(),
  ingredients: z.array(z.object({ label: z.string(), removable: z.boolean() })),
  groups: z.array(group),
  extras: z.object({ max: z.number(), options: z.array(z.object({ label: z.string(), price: z.number() })) }).nullable(),
});
const schema = z.object({
  updated: z.string(),
  source: z.string(),
  categories: z.array(z.object({ id: z.string(), title: z.string(), items: z.array(item) })),
});

export type Item = z.infer<typeof item>;
export const menu = schema.parse(raw);
export const items: Item[] = menu.categories.flatMap((c) => c.items);

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/menu/*.webp', { eager: true });
export const imageOf = (key: string | null): ImageMetadata | null =>
  key ? (images[`../assets/menu/${key}.webp`]?.default ?? null) : null;

export const byName = (n: string) => items.find((i) => i.name.toLowerCase() === n.toLowerCase());

export const eur = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €';

/** Un piatto e' "semplice" se non ha nulla da personalizzare: l'aggiunta rapida e' diretta. */
export const isSimple = (i: Item) => !i.groups.length && !i.extras && !i.ingredients.some((x) => x.removable);

/** Specialita' in evidenza nella landing, in ordine. */
export const featured = ['Pulled Pork Grill Burger', 'CACIOCAVALLO BURGER', 'CARACAS 2.0', 'Triple Grill Burger', 'Double Bacon', 'Tartufata Grill Burger', 'Ribs (costine di maiale)', 'Classic Grill Burger']
  .map(byName)
  .filter((i): i is Item => !!i);
