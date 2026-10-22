import { LOCALE, type Lingua } from './rotte';

/** 14 → "14 €" · 2,5 → "2,50 €" (alla maniera di ciascuna lingua). */
export function euro(valore: number, lingua: Lingua): string {
  return new Intl.NumberFormat(LOCALE[lingua], {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(valore) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valore);
}

/** Numero di telefono E.164 → forma leggibile italiana: +39 085 123 4567 */
export function telefonoLeggibile(e164: string): string {
  const m = e164.match(/^\+39(\d{3})(\d{3})(\d+)$/);
  return m ? `+39 ${m[1]} ${m[2]} ${m[3]}` : e164;
}
