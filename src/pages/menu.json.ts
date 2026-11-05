import { items } from '../data/menu';

// Dati per il personalizzatore: caricati solo quando servono (fetch same-origin).
export function GET() {
  const slim = items.map(({ id, name, price, desc, ingredients, groups, extras }) => ({ id, name, price, desc, ingredients, groups, extras }));
  return new Response(JSON.stringify(slim), { headers: { 'Content-Type': 'application/json' } });
}
